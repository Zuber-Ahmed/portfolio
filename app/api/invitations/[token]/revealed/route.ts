import { apiResponse } from '@/app/libs/apiResponse';
import { trackInvitation } from '@/app/services/wedding/weddingStoreService';
type Context = { params: Promise<{ token: string }> };
export function POST(_request: Request, context: Context) {
  return apiResponse(async () =>
    trackInvitation((await context.params).token, 'revealed'),
  );
}
