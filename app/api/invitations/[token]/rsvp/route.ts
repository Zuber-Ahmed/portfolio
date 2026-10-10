import { z } from 'zod';

import { apiResponse } from '@/app/libs/apiResponse';
import { rsvpSubmissionSchema } from '@/app/services/wedding/types';
import { submitRSVP } from '@/app/services/wedding/weddingStoreService';
type Context = { params: Promise<{ token: string }> };
export function PUT(request: Request, context: Context) {
  return apiResponse(async () => {
    const { responses } = z
      .object({ responses: rsvpSubmissionSchema.strict() })
      .parse(await request.json());
    return submitRSVP((await context.params).token, responses);
  });
}
