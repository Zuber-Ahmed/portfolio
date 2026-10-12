import { WEDDING_USE_MOCKS } from '@/app/config/env';

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

export async function getInvitation(token: string) {
  if (WEDDING_USE_MOCKS) {
    const { buildMockInvitation } =
      await import('@/app/mocks/wedding/invitationMocks');
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
  if (WEDDING_USE_MOCKS) {
    const { askMockInvitation } =
      await import('@/app/mocks/wedding/invitationMocks');
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
  if (WEDDING_USE_MOCKS) return { recorded: true };
  return invitationRequest(
    `${API_ROOT}/${encodeURIComponent(token)}/opened`,
    trackingResultSchema.parse,
    {
      method: 'POST',
    },
  );
}

export async function recordInvitationReveal(token: string) {
  if (WEDDING_USE_MOCKS) return { recorded: true };
  return invitationRequest(
    `${API_ROOT}/${encodeURIComponent(token)}/revealed`,
    trackingResultSchema.parse,
    {
      method: 'POST',
    },
  );
}

export async function submitRSVP(token: string, responses: RsvpSubmission) {
  if (WEDDING_USE_MOCKS) {
    const { mockResponses } =
      await import('@/app/mocks/wedding/invitationMocks');
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
