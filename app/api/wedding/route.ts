import { apiResponse } from '@/app/libs/apiResponse';
import { getPublicWedding } from '@/app/services/wedding/weddingStoreService';
export function GET() {
  return apiResponse(getPublicWedding);
}
