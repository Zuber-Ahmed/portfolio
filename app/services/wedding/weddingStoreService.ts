import { randomBytes, randomUUID } from 'node:crypto';

import { z } from 'zod';

import { dynamoClient } from '@/app/libs/dynamoClient';
import { ApiError } from '@/app/libs/httpClient';

import {
  eventDetailsSchema,
  guestSchema,
  type Invitation,
  type Rsvp,
  type RsvpSubmission,
  storedInvitationSchema,
  weddingInputSchema,
  weddingSchema,
} from './types';

const CONFIG_KEY = 'CONFIG#WEDDING';
const TOKEN_PREFIX = 'TOKEN#';

const legacyInvitationSchema = z
  .object({
    pk: z.string().startsWith(TOKEN_PREFIX),
    recipient: z.object({
      displayName: z.string().trim().min(1).max(200),
      recipientType: z.enum(['individual', 'family']),
    }),
    authorizedEvents: z.array(z.enum(['nikah', 'walima'])).default([]),
    rsvp: z
      .object({
        nikah: z.enum(['attending', 'declined']).optional(),
        walima: z.enum(['attending', 'declined']).optional(),
        updatedAt: z.string().optional(),
      })
      .optional(),
    opened: z.boolean().optional(),
    revealed: z.boolean().optional(),
    tracking: z
      .object({
        openCount: z.number().optional(),
        revealedAt: z.string().optional(),
      })
      .optional(),
  })
  .passthrough();

type StoredInvitation = z.infer<typeof storedInvitationSchema>;

function tokenKey(token: string) {
  return `${TOKEN_PREFIX}${token}`;
}

function tokenFromPk(pk: string) {
  if (!pk.startsWith(TOKEN_PREFIX))
    throw new ApiError('Invitation not found.', { status: 404 });
  return pk.slice(TOKEN_PREFIX.length);
}

function invitationRsvp(value: unknown): Rsvp {
  const source =
    value && typeof value === 'object'
      ? (value as Record<string, unknown>)
      : undefined;
  return {
    nikah:
      source?.nikah === 'attending' || source?.nikah === 'declined'
        ? source.nikah
        : undefined,
    walima:
      source?.walima === 'attending' || source?.walima === 'declined'
        ? source.walima
        : undefined,
  };
}

function toStoredInvitation(item: unknown) {
  const modern = storedInvitationSchema.safeParse(item);
  if (modern.success) return modern.data;

  const legacy = legacyInvitationSchema.parse(item);
  const token = tokenFromPk(legacy.pk);
  const authorized = new Set(legacy.authorizedEvents);
  return storedInvitationSchema.parse({
    id: token,
    kind: 'invitation',
    displayName: legacy.recipient.displayName,
    recipientType: legacy.recipient.recipientType,
    nikah: authorized.has('nikah'),
    walima: authorized.has('walima'),
    rsvp: invitationRsvp(legacy.rsvp),
    opened: legacy.opened ?? (legacy.tracking?.openCount || 0) > 0,
    revealed: legacy.revealed ?? Boolean(legacy.tracking?.revealedAt),
  });
}

function toLegacyInvitation(item: StoredInvitation) {
  const now = new Date().toISOString();
  const rsvp: Record<string, unknown> = {};
  if (item.rsvp.nikah) rsvp.nikah = item.rsvp.nikah;
  if (item.rsvp.walima) rsvp.walima = item.rsvp.walima;
  return {
    pk: tokenKey(item.id),
    invitationId: randomUUID(),
    organizerToken: item.id,
    recipient: {
      displayName: item.displayName,
      recipientType: item.recipientType,
    },
    authorizedEvents: (['nikah', 'walima'] as const).filter(name => item[name]),
    rsvp,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
}

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
  const item = await dynamoClient.get(CONFIG_KEY);
  if (item) {
    const source =
      item && typeof item === 'object' && 'config' in item
        ? (item as { config: unknown }).config
        : item && typeof item === 'object' && 'wedding' in item
          ? (item as { wedding: unknown }).wedding
          : undefined;
    const wedding = weddingSchema.parse(source);
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
  await dynamoClient.put({
    pk: CONFIG_KEY,
    config: wedding,
    updatedAt: new Date().toISOString(),
  });
  return wedding;
}
function newInvitation(input: unknown): StoredInvitation {
  return {
    ...guestSchema.parse(input),
    id: randomBytes(32).toString('base64url'),
    kind: 'invitation' as const,
    rsvp: {} as Rsvp,
    opened: false,
    revealed: false,
  };
}
function withUrl(item: unknown) {
  const invitation = toStoredInvitation(item);
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
  await dynamoClient.put(toLegacyInvitation(invitation), true);
  return result;
}
export async function importInvitations(input: unknown) {
  const { guests } = z
    .object({ guests: z.array(guestSchema).min(1).max(100) })
    .parse(input);
  const items = guests.map(newInvitation);
  const result = items.map(withUrl);
  await dynamoClient.createMany(items.map(toLegacyInvitation));
  return result;
}
async function getStoredInvitation(id: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(id))
    throw new ApiError('Invitation not found.', { status: 404 });
  const item = await dynamoClient.get(tokenKey(id));
  if (!item)
    throw new ApiError('Invitation not found.', { status: 404 });
  return toStoredInvitation(item);
}
export async function updateInvitation(id: string, input: unknown) {
  withUrl(await getStoredInvitation(id));
  const guest = guestSchema.parse(input);
  const updatedAt = new Date().toISOString();
  const authorizedEvents = (['nikah', 'walima'] as const).filter(
    name => guest[name],
  );
  // Update only editable fields, preserving concurrent tracking and RSVP writes.
  const item = await dynamoClient.update(tokenKey(id), {
    UpdateExpression:
      'SET recipient.displayName = :name, recipient.recipientType = :type, authorizedEvents = :events, updatedAt = :updatedAt',
    ConditionExpression: 'attribute_exists(pk)',
    ExpressionAttributeValues: {
      ':name': guest.displayName,
      ':type': guest.recipientType,
      ':events': authorizedEvents,
      ':updatedAt': updatedAt,
    },
  });
  return withUrl(item);
}
export async function deleteInvitation(id: string) {
  await getStoredInvitation(id);
  await dynamoClient.delete(tokenKey(id));
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
  await dynamoClient.update(tokenKey(token), {
    UpdateExpression: 'SET #field = :yes',
    ConditionExpression: 'attribute_exists(pk)',
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
  const result = await dynamoClient.update(tokenKey(token), {
    UpdateExpression: `SET ${names.map(name => `rsvp.#${name} = :${name}`).join(', ')}, rsvp.updatedAt = :updatedAt, updatedAt = :updatedAt`,
    ConditionExpression: 'attribute_exists(pk)',
    ExpressionAttributeNames: attributes,
    ExpressionAttributeValues: values,
  });
  const saved = toStoredInvitation(result);
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
