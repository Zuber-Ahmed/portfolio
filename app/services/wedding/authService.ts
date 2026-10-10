import {
  type AuthenticationResultType,
  ConfirmForgotPasswordCommand,
  ForgotPasswordCommand,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { z } from 'zod';

import {
  cognitoClient,
  getCognitoClientId,
  withCognitoErrors,
} from '@/app/libs/cognitoClient';
import { requestJson } from '@/app/libs/httpClient';

export { authConfigured } from '@/app/libs/cognitoClient';

const SESSION_KEY = 'wedding-admin-session';

const sessionSchema = z.object({
  accessToken: z.string().min(1),
  idToken: z.string().optional(),
  refreshToken: z.string().optional(),
  expiresAt: z.number().finite(),
  remember: z.boolean(),
});
type Session = z.infer<typeof sessionSchema>;

function findStoredSession(): Session | null {
  if (
    typeof localStorage === 'undefined' ||
    typeof sessionStorage === 'undefined'
  )
    return null;
  for (const storage of [localStorage, sessionStorage]) {
    const raw = storage.getItem(SESSION_KEY);
    if (!raw) continue;
    try {
      const value: unknown = JSON.parse(raw);
      return sessionSchema.parse(value);
    } catch {
      storage.removeItem(SESSION_KEY);
    }
  }
  return null;
}

function saveSession(
  authentication: AuthenticationResultType | undefined,
  remember: boolean,
  previous?: Session,
): Session {
  if (!authentication?.AccessToken)
    throw new Error('Authentication did not return an access token.');
  const storage = remember ? localStorage : sessionStorage;
  const otherStorage = remember ? sessionStorage : localStorage;
  const session = sessionSchema.parse({
    accessToken: authentication.AccessToken,
    idToken: authentication.IdToken,
    refreshToken: authentication.RefreshToken || previous?.refreshToken,
    expiresAt: Date.now() + (authentication.ExpiresIn || 3600) * 1000,
    remember,
  });
  otherStorage.removeItem(SESSION_KEY);
  storage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function signIn(
  email: string,
  password: string,
  remember: boolean,
): Promise<void> {
  const authentication = await requestJson(
    '/api/admin/auth/login',
    z.object({
      AccessToken: z.string().min(1),
      IdToken: z.string().optional(),
      RefreshToken: z.string().optional(),
      ExpiresIn: z.number().optional(),
    }).parse,
    { method: 'POST', data: { email: email.trim(), password } },
  );
  saveSession(authentication, remember);
}

export async function getAccessToken(): Promise<string | null> {
  const session = findStoredSession();
  if (!session) return null;
  if (session.expiresAt > Date.now() + 60_000) return session.accessToken;
  const refreshToken = session.refreshToken;
  if (!refreshToken) {
    logout();
    return null;
  }
  try {
    const payload = await withCognitoErrors(() =>
      cognitoClient.send(
        new InitiateAuthCommand({
          AuthFlow: 'REFRESH_TOKEN_AUTH',
          ClientId: getCognitoClientId(),
          AuthParameters: { REFRESH_TOKEN: refreshToken },
        }),
      ),
    );
    return saveSession(payload.AuthenticationResult, session.remember, session)
      .accessToken;
  } catch {
    logout();
    return null;
  }
}

export function logout(): void {
  if (typeof localStorage !== 'undefined') localStorage.removeItem(SESSION_KEY);
  if (typeof sessionStorage !== 'undefined')
    sessionStorage.removeItem(SESSION_KEY);
}

export async function requestPasswordReset(email: string): Promise<void> {
  await withCognitoErrors(() =>
    cognitoClient.send(
      new ForgotPasswordCommand({
        ClientId: getCognitoClientId(),
        Username: email.trim(),
      }),
    ),
  );
}

export async function confirmPasswordReset(
  email: string,
  code: string,
  password: string,
): Promise<void> {
  await withCognitoErrors(() =>
    cognitoClient.send(
      new ConfirmForgotPasswordCommand({
        ClientId: getCognitoClientId(),
        Username: email.trim(),
        ConfirmationCode: code.trim(),
        Password: password,
      }),
    ),
  );
}
