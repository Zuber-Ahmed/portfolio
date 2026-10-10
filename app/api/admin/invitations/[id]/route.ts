import { apiResponse } from '@/app/libs/apiResponse';
import { requireAdmin } from '@/app/services/wedding/adminAuthService';
import {
  deleteInvitation,
  updateInvitation,
} from '@/app/services/wedding/weddingStoreService';
type Context = { params: Promise<{ id: string }> };
export function PUT(request: Request, context: Context) {
  return apiResponse(async () => {
    await requireAdmin(request);
    return {
      invitation: await updateInvitation(
        (await context.params).id,
        await request.json(),
      ),
    };
  });
}
export function DELETE(request: Request, context: Context) {
  return apiResponse(async () => {
    await requireAdmin(request);
    await deleteInvitation((await context.params).id);
  }, 204);
}
