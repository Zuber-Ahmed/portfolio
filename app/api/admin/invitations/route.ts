import { apiResponse } from '@/app/libs/apiResponse';
import { requireAdmin } from '@/app/services/wedding/adminAuthService';
import {
  createInvitation,
  listInvitations,
} from '@/app/services/wedding/weddingStoreService';

export function GET(request: Request) {
  return apiResponse(async () => {
    await requireAdmin(request);
    return { invitations: await listInvitations() };
  });
}
export function POST(request: Request) {
  return apiResponse(async () => {
    await requireAdmin(request);
    return { invitation: await createInvitation(await request.json()) };
  }, 201);
}
