import { randomBytes } from 'node:crypto';

import { z } from 'zod';

import { dynamoClient } from '@/app/libs/dynamoClient';
import { ApiError } from '@/app/libs/httpClient';

import {
  eventDetailsSchema,
  guestSchema,
  type Invitation,
  type RsvpSubmission,
  storedInvitationSchema,
  weddingInputSchema,
  weddingSchema,
} from './types';

function publicEvent(event: z.infer<typeof eventDetailsSchema>) {
  return {
    ...event,
    venueName: event.venueName ?? event.venue?.name ?? '',
    venueAddress: event.venueAddress ?? event.venue?.address ?? '',
    googleMapsUrl: event.googleMapsUrl ?? event.venue?.googleMapsUrl ?? '',
    displayDate: new Date(`${event.date}T12:00:00Z`).toLocaleDateString(
      'en-GB',
      { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' },
    ),
    displayTime: event.displayTime || event.time || '',
    time: event.displayTime || event.time || '',
    venue: {
      name: (event.venueName ?? event.venue?.name) || 'Location Coming Soon',
      address: (event.venueAddress ?? event.venue?.address) || '',
      googleMapsUrl:
        (event.googleMapsUrl ?? event.venue?.googleMapsUrl) || null,
    },
  };
}

export async function getWedding() {
  const item = await dynamoClient.get('wedding');
  if (item) {
    const wedding = weddingSchema.parse(item.wedding);
    return {
      ...wedding,
      nikah: publicEvent(wedding.nikah),
      walima: publicEvent(wedding.walima),
    };
  }
  return {
    couple: {
      groomName: 'Zuber',
      brideName: 'Bisma',
      groomFather: '',
      brideFather: '',
    },
    nikah: {
      date: '',
      displayTime: '',
      venueName: '',
      venueAddress: '',
      googleMapsUrl: '',
    },
    walima: {
      date: '',
      displayTime: '',
      venueName: '',
      venueAddress: '',
      googleMapsUrl: '',
    },
  };
}
export async function updateWedding(input: unknown) {
  const data = weddingInputSchema.parse(input);
  const wedding = {
    couple: data.couple,
    nikah: publicEvent(data.nikah),
    walima: publicEvent(data.walima),
  };
  await dynamoClient.put({ id: 'wedding', kind: 'wedding', wedding });
  return wedding;
}
function newInvitation(input: unknown) {
  return {
    ...guestSchema.parse(input),
    id: randomBytes(32).toString('base64url'),
    kind: 'invitation' as const,
    rsvp: {},
    opened: false,
    revealed: false,
  };
}
function withUrl(item: unknown) {
  const invitation = storedInvitationSchema.parse(item);
  const origin = process.env.APP_ORIGIN?.replace(/\/$/, '');
  if (!origin || !/^https?:\/\//.test(origin))
    throw new ApiError(
      'Set APP_ORIGIN to the public website URL before managing invitations.',
      { status: 503 },
    );
  return { ...invitation, invitationUrl: `${origin}/invite/${invitation.id}` };
}
export async function listInvitations() {
  return (await dynamoClient.invitations()).map(withUrl);
}
export async function createInvitation(input: unknown) {
  const invitation = newInvitation(input);
  const result = withUrl(invitation);
  await dynamoClient.put(invitation, true);
  return result;
}
export async function importInvitations(input: unknown) {
  const { guests } = z
    .object({ guests: z.array(guestSchema).min(1).max(100) })
    .parse(input);
  const items = guests.map(newInvitation);
  const result = items.map(withUrl);
  await dynamoClient.createMany(items);
  return result;
}
async function getStoredInvitation(id: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(id))
    throw new ApiError('Invitation not found.', { status: 404 });
  const item = await dynamoClient.get(id);
  if (!item || item.kind !== 'invitation')
    throw new ApiError('Invitation not found.', { status: 404 });
  return storedInvitationSchema.parse(item);
}
export async function updateInvitation(id: string, input: unknown) {
  withUrl(await getStoredInvitation(id));
  const guest = guestSchema.parse(input);
  // Update only editable fields, preserving concurrent tracking and RSVP writes.
  const item = await dynamoClient.update(id, {
    UpdateExpression:
      'SET displayName = :name, recipientType = :type, nikah = :nikah, walima = :walima',
    ConditionExpression: 'attribute_exists(id)',
    ExpressionAttributeValues: {
      ':name': guest.displayName,
      ':type': guest.recipientType,
      ':nikah': guest.nikah,
      ':walima': guest.walima,
    },
  });
  return withUrl(item);
}
export async function deleteInvitation(id: string) {
  await getStoredInvitation(id);
  await dynamoClient.delete(id);
}
export async function getInvitation(token: string): Promise<Invitation> {
  const guest = await getStoredInvitation(token);
  const wedding = await getWedding();
  const events: Invitation['events'] = {};
  const rsvp: Invitation['rsvp'] = {};
  for (const name of ['nikah', 'walima'] as const)
    if (guest[name]) {
      const event = wedding[name];
      if (!event.date)
        throw new ApiError(
          'Wedding details are being prepared. Please try again later.',
          { status: 503 },
        );
      events[name] = event;
      rsvp[name] = guest.rsvp[name] ?? null;
    }
  // Do not expose details of events this guest is not invited to.
  const hidden = { date: '' };
  return {
    recipient: {
      displayName: guest.displayName,
      recipientType: guest.recipientType,
    },
    events,
    rsvp,
    wedding: {
      couple: wedding.couple,
      nikah: events.nikah || hidden,
      walima: events.walima || hidden,
    },
  };
}
export async function trackInvitation(
  token: string,
  field: 'opened' | 'revealed',
) {
  await getStoredInvitation(token);
  await dynamoClient.update(token, {
    UpdateExpression: 'SET #field = :yes',
    ConditionExpression: 'attribute_exists(id)',
    ExpressionAttributeNames: { '#field': field },
    ExpressionAttributeValues: { ':yes': true },
  });
  return { recorded: true };
}
export async function submitRSVP(token: string, responses: RsvpSubmission) {
  const guest = await getStoredInvitation(token);
  const names = Object.keys(responses) as ('nikah' | 'walima')[];
  if (!names.length)
    throw new ApiError('Choose at least one response.', { status: 400 });
  if (names.some(name => !guest[name]))
    throw new ApiError('This event is not included in your invitation.', {
      status: 403,
    });
  const updatedAt = new Date().toISOString();
  const attributes: Record<string, string> = {};
  const values: Record<string, unknown> = {
    ':yes': true,
    ':updatedAt': updatedAt,
  };
  names.forEach(name => {
    attributes[`#${name}`] = name;
    values[`:${name}`] = responses[name];
  });
  const result = await dynamoClient.update(token, {
    UpdateExpression: `SET ${names.map(name => `rsvp.#${name} = :${name}`).join(', ')}, updatedAt = :updatedAt`,
    ConditionExpression: `attribute_exists(id) AND ${names.map(name => `#${name} = :yes`).join(' AND ')}`,
    ExpressionAttributeNames: attributes,
    ExpressionAttributeValues: values,
  });
  const saved = storedInvitationSchema.parse(result);
  return {
    rsvp: Object.fromEntries(
      (['nikah', 'walima'] as const)
        .filter(name => saved[name])
        .map(name => [name, saved.rsvp[name] ?? null]),
    ),
    updatedAt,
  };
}

export async function getPublicWedding() {
  const wedding = await getWedding();
  if (!wedding.nikah.date || !wedding.walima.date)
    throw new ApiError(
      'Wedding details are being prepared. Please try again later.',
      { status: 503 },
    );
  return { wedding };
}
