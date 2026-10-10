import type { ChatContext, ChatReply, EventName, Invitation } from './types';
import { getInvitation } from './weddingStoreService';

export function formatInvitationAnswer(
  invitation: Invitation,
  message: string,
  context: ChatContext,
): ChatReply {
  const question = message.toLowerCase();
  const requested = (['nikah', 'walima'] as const).filter(name =>
    question.includes(name),
  );
  if (requested.some(name => !invitation.events[name]))
    return {
      answer:
        'That event is not included in your invitation. Please contact the family for help.',
      context: {},
      links: [],
    };
  const available = Object.keys(invitation.events) as EventName[];
  const previous =
    context.event === 'nikah' || context.event === 'walima'
      ? context.event
      : undefined;
  const selected: EventName[] = requested.length
    ? requested
    : previous && invitation.events[previous]
      ? [previous]
      : available;
  const nextContext = selected.length === 1 ? { event: selected[0] } : {};
  if (/rsvp|respond|confirm|attend|declin/.test(question))
    return {
      answer:
        'Use the RSVP section on your invitation to confirm or decline attendance for each event. You can return and change your response.',
      context: nextContext,
      links: [],
    };
  if (
    /where|venue|location|direction|map|when|date|time|detail|ceremony|nikah|walima/.test(
      question,
    )
  ) {
    const links: NonNullable<ChatReply['links']> = [];
    const answer = selected
      .map(name => {
        const event = invitation.events[name]!;
        const url = event.venue?.googleMapsUrl || event.googleMapsUrl;
        if (url && /^https?:\/\//.test(url))
          links.push({
            label: `${name === 'nikah' ? 'Nikah' : 'Walima'} directions`,
            url,
          });
        return `${name === 'nikah' ? 'Nikah' : 'Walima'}: ${event.displayDate || event.date}, ${event.displayTime || event.time || 'time to be confirmed'}. ${event.venue?.name || event.venueName || 'Location Coming Soon'}${event.venue?.address || event.venueAddress ? ` — ${event.venue?.address || event.venueAddress}` : ''}.`;
      })
      .join('\n');
    return { answer, context: nextContext, links };
  }
  return {
    answer:
      'I can help with the dates, times, venues, directions, and RSVP instructions for the events on your invitation. For other questions, please contact the family.',
    context: nextContext,
    links: [],
  };
}

export async function askInvitation(
  token: string,
  message: string,
  context: ChatContext,
) {
  return formatInvitationAnswer(await getInvitation(token), message, context);
}
