import { ApiError } from '../../libs/httpClient';
import { invitationRequest } from '../../libs/invitationClient';
import {
  type ChatContext,
  chatReplySchema,
  invitationSchema,
  rsvpResultSchema,
  type RsvpSubmission,
  trackingResultSchema,
} from './types';
const API_ROOT = '/api/invitations';
const mockEnabled =
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_WEDDING_USE_MOCKS === 'true';

export async function getInvitation(token: string) {
  if (mockEnabled) {
    const { buildMockInvitation } = await import('./invitationMocks');
    const invitation = buildMockInvitation(token);
    if (!invitation) {
      throw new ApiError('Invitation not found', { status: 404 });
    }
    return invitation;
  }
  return invitationRequest(
    `${API_ROOT}/${encodeURIComponent(token)}`,
    invitationSchema.parse,
  );
}

export async function askInvitation(
  token: string,
  message: string,
  context: ChatContext,
  signal?: AbortSignal,
) {
  if (mockEnabled) {
    const { askMockInvitation } = await import('./invitationMocks');
    return askMockInvitation(token, message, context);
  }
  return invitationRequest(
    `${API_ROOT}/${encodeURIComponent(token)}/chat`,
    chatReplySchema.parse,
    {
      method: 'POST',
      data: { message, context },
      signal,
    },
  );
}

export async function recordInvitationOpen(token: string) {
  if (mockEnabled) return { recorded: true };
  return invitationRequest(
    `${API_ROOT}/${encodeURIComponent(token)}/opened`,
    trackingResultSchema.parse,
    {
      method: 'POST',
    },
  );
}

export async function recordInvitationReveal(token: string) {
  if (mockEnabled) return { recorded: true };
  return invitationRequest(
    `${API_ROOT}/${encodeURIComponent(token)}/revealed`,
    trackingResultSchema.parse,
    {
      method: 'POST',
    },
  );
}

export async function submitRSVP(token: string, responses: RsvpSubmission) {
  if (mockEnabled) {
    const { mockResponses } = await import('./invitationMocks');
    mockResponses.set(token, { ...mockResponses.get(token), ...responses });
    return { rsvp: responses, updatedAt: new Date().toISOString() };
  }
  return invitationRequest(
    `${API_ROOT}/${encodeURIComponent(token)}/rsvp`,
    rsvpResultSchema.parse,
    {
      method: 'PUT',
      data: { responses },
    },
  );
}
