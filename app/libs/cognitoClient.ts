import {
  CognitoIdentityProviderClient,
  CognitoIdentityProviderServiceException,
} from '@aws-sdk/client-cognito-identity-provider';

import { AWS } from '@/app/config/env';

import { ApiError } from './httpClient';

const clientId = AWS.COGNITO.CLIENT_ID;

export const authConfigured = Boolean(clientId);

export const cognitoClient = new CognitoIdentityProviderClient({
  region: AWS.COGNITO.REGION,
});

export function getCognitoClientId(): string {
  if (!clientId)
    throw new Error('Admin authentication is not configured for this build.');
  return clientId;
}

const errorMessages: Record<string, string> = {
  NotAuthorizedException: 'Incorrect email or password.',
  UserNotFoundException: 'Incorrect email or password.',
  UserNotConfirmedException: 'This account has not been confirmed.',
  CodeMismatchException: 'The verification code is incorrect.',
  ExpiredCodeException: 'The verification code has expired. Request a new one.',
  LimitExceededException: 'Too many attempts. Please wait and try again.',
  InvalidPasswordException:
    'The password does not meet the required security rules.',
};

export async function withCognitoErrors<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error: unknown) {
    if (error instanceof CognitoIdentityProviderServiceException) {
      throw new ApiError(
        errorMessages[error.name] || error.message || 'Authentication failed.',
        {
          status: error.$metadata.httpStatusCode,
          code: error.name,
        },
      );
    }
    throw error;
  }
}
