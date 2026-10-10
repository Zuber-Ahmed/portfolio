import { apiResponse } from '@/app/libs/apiResponse';
import { getInvitation } from '@/app/services/wedding/weddingStoreService';
type Context = { params: Promise<{ token: string }> };
export function GET(_request: Request, context: Context) {
  return apiResponse(async () => getInvitation((await context.params).token));
}
