import { adminRequest } from '../../libs/adminClient';
import {
  type GuestInput,
  invitationResultSchema,
  invitationsResultSchema,
  type Wedding,
  weddingResultSchema,
} from './types';

const ROOT = '/api/admin/invitations';
export const listInvitations = () =>
  adminRequest(ROOT, invitationsResultSchema.parse);
export const createInvitation = (guest: GuestInput) =>
  adminRequest(ROOT, invitationResultSchema.parse, {
    method: 'POST',
    data: guest,
  });
export const updateInvitation = (id: string, guest: GuestInput) =>
  adminRequest(
    `${ROOT}/${encodeURIComponent(id)}`,
    invitationResultSchema.parse,
    { method: 'PUT', data: guest },
  );
export const deleteInvitation = (id: string): Promise<void> =>
  adminRequest(`${ROOT}/${encodeURIComponent(id)}`, () => undefined, {
    method: 'DELETE',
  });
export const importInvitations = (guests: GuestInput[]) =>
  adminRequest(`${ROOT}/import`, invitationsResultSchema.parse, {
    method: 'POST',
    data: { guests },
  });
export const getWedding = () =>
  adminRequest(`${ROOT}/wedding`, weddingResultSchema.parse);
export const updateWedding = (wedding: Wedding) =>
  adminRequest(`${ROOT}/wedding`, weddingResultSchema.parse, {
    method: 'PUT',
    data: wedding,
  });
