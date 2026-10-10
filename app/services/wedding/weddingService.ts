import { invitationRequest } from '@/app/libs/invitationClient';

import { weddingResultSchema } from './types';

export function getWeddingDetails(signal?: AbortSignal) {
  return invitationRequest('/api/wedding', weddingResultSchema.parse, {
    signal,
  });
}
