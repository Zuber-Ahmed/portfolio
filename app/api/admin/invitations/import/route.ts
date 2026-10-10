import { apiResponse } from '@/app/libs/apiResponse';
import { requireAdmin } from '@/app/services/wedding/adminAuthService';
import { importInvitations } from '@/app/services/wedding/weddingStoreService';
export function POST(request: Request) {
  return apiResponse(async () => {
    await requireAdmin(request);
    return { invitations: await importInvitations(await request.json()) };
  }, 201);
}
