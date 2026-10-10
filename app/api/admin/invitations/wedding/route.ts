import { apiResponse } from '@/app/libs/apiResponse';
import { requireAdmin } from '@/app/services/wedding/adminAuthService';
import {
  getWedding,
  updateWedding,
} from '@/app/services/wedding/weddingStoreService';
export function GET(request: Request) {
  return apiResponse(async () => {
    await requireAdmin(request);
    return { wedding: await getWedding() };
  });
}
export function PUT(request: Request) {
  return apiResponse(async () => {
    await requireAdmin(request);
    return { wedding: await updateWedding(await request.json()) };
  });
}
