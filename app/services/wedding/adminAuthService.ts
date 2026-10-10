import { CognitoJwtVerifier } from 'aws-jwt-verify';

import { ApiError } from '@/app/libs/httpClient';

let verifier: ReturnType<typeof CognitoJwtVerifier.create> | undefined;

export async function requireAdmin(request: Request) {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer '))
    throw new ApiError('Please sign in to continue.', { status: 401 });
  const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
  if (!userPoolId || !clientId)
    throw new ApiError('Admin authentication is not configured.', {
      status: 503,
    });
  verifier ??= CognitoJwtVerifier.create({
    userPoolId,
    clientId,
    tokenUse: 'access',
  });
  let payload;
  try {
    payload = await verifier.verify(authorization.slice(7));
  } catch {
    throw new ApiError(
      'Your session is invalid or expired. Please sign in again.',
      { status: 401 },
    );
  }
  const group = process.env.COGNITO_ADMIN_GROUP || 'wedding-admin-production';
  if (!payload['cognito:groups']?.includes(group))
    throw new ApiError('Administrator access is required.', { status: 403 });
  return payload.sub;
}
