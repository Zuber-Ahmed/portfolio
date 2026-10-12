import { InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { z } from 'zod';

import { apiResponse } from '@/app/libs/apiResponse';
import {
  cognitoClient,
  getCognitoClientId,
  withCognitoErrors,
} from '@/app/libs/cognitoClient';
import { ApiError } from '@/app/libs/httpClient';

const loginSchema = z.object({
  email: z.string().trim().min(1).max(254),
  password: z.string().min(1).max(256),
});

export function POST(request: Request) {
  return apiResponse(async () => {
    const { email, password } = loginSchema.parse(await request.json());
    const result = await withCognitoErrors(() =>
      cognitoClient.send(
        new InitiateAuthCommand({
          AuthFlow: 'USER_PASSWORD_AUTH',
          ClientId: getCognitoClientId(),
          AuthParameters: { USERNAME: email, PASSWORD: password },
        }),
      ),
    );
    if (result.ChallengeName)
      throw new ApiError(
        "Complete the administrator's initial password setup in AWS before signing in.",
        { status: 409 },
      );
    if (!result.AuthenticationResult?.AccessToken)
      throw new ApiError('Authentication did not return an access token.', {
        status: 401,
      });
    return result.AuthenticationResult;
  });
}
