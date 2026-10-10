import { z } from 'zod';

import { weddingData } from '@/app/wedding/data/weddingData.js';

import { ApiError } from '../../libs/httpClient';
import {
  type ChatContext,
  type ChatReply,
  eventDetailsSchema,
  type EventName,
  type Invitation,
  type RecipientType,
  type Rsvp,
  weddingSchema,
} from './types';

const sourceSchema = z.object({
  couple: z.object({ groom: z.string(), bride: z.string() }),
  families: z.object({
    groom: z.object({ father: z.string() }),
    bride: z.object({ father: z.string() }),
  }),
  nikah: eventDetailsSchema,
  walima: eventDetailsSchema,
});

const mockInvitations: Record<string, [string, RecipientType, EventName[]]> = {
  'demo-individual-nikah': ['Ahmed Demo', 'individual', ['nikah']],
  'demo-individual-walima': ['Sara Demo', 'individual', ['walima']],
  'demo-individual-both': ['Ahmed & Sara', 'individual', ['nikah', 'walima']],
  'demo-family-nikah': ['The Khan Family', 'family', ['nikah']],
  'demo-family-walima': [
    'Mohammed Abdul Rahman & Family',
    'family',
    ['walima'],
  ],
  'demo-family-both': ['Farhan Khan & Family', 'family', ['nikah', 'walima']],
};
export const mockResponses = new Map<string, Rsvp>();

export function buildMockInvitation(token: string): Invitation | null {
  const definition = Object.hasOwn(mockInvitations, token)
    ? mockInvitations[token]
    : undefined;
  if (!definition) return null;
  const source = sourceSchema.parse(weddingData);
  const wedding = weddingSchema.parse({
    couple: {
      groomName: source.couple.groom,
      brideName: source.couple.bride,
      groomFather: source.families.groom.father,
      brideFather: source.families.bride.father,
    },
    nikah: source.nikah,
    walima: source.walima,
  });
  const [displayName, recipientType, authorizedEvents] = definition;
  const events: Invitation['events'] = {};
  const rsvp: Rsvp = {};
  for (const eventName of authorizedEvents) {
    events[eventName] = wedding[eventName];
    rsvp[eventName] = mockResponses.get(token)?.[eventName] ?? null;
  }
  return { recipient: { displayName, recipientType }, events, rsvp, wedding };
}

export function askMockInvitation(
  token: string,
  message: string,
  context: ChatContext,
): ChatReply {
  const invitation = buildMockInvitation(token);
  if (!invitation) throw new ApiError('Invitation not found', { status: 404 });
  // UI previews do not access the database-backed chat service.
  return {
    answer: `Local preview for ${invitation.recipient.displayName}. Chat answers require the wedding backend. Your question: ${message}`,
    context,
    links: [],
  };
}
