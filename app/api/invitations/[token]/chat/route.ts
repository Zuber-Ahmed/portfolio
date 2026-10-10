import { z } from 'zod';

import { apiResponse } from '@/app/libs/apiResponse';
import { askInvitation } from '@/app/services/wedding/chatService';
import { chatContextSchema } from '@/app/services/wedding/types';
type Context = { params: Promise<{ token: string }> };
export function POST(request: Request, context: Context) {
  return apiResponse(async () => {
    const { message, context: previous } = z
      .object({
        message: z.string().trim().min(1).max(1000),
        context: chatContextSchema.default({}),
      })
      .parse(await request.json());
    return askInvitation((await context.params).token, message, previous);
  });
}
