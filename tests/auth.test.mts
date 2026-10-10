import assert from 'node:assert/strict';
import { afterEach, beforeEach, mock, test } from 'node:test';

import {
  ConfirmForgotPasswordCommand,
  ForgotPasswordCommand,
  InitiateAuthCommand,
  NotAuthorizedException,
} from '@aws-sdk/client-cognito-identity-provider';
import { AxiosError, AxiosHeaders } from 'axios';

const previousId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID = 'test-client';
const { cognitoClient } = await import('../app/libs/cognitoClient');
const auth = await import('../app/services/wedding/authService');
const { POST } = await import('../app/api/admin/auth/login/route');
const { httpClient } = await import('../app/libs/httpClient');
const originalAdapter = httpClient.defaults.adapter;
beforeEach(() => {
  httpClient.defaults.adapter = async config => {
    assert.equal(config.url, '/api/admin/auth/login');
    const response = await POST(
      new Request('http://localhost/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: config.data,
      }),
    );
    const result = {
      data: await response.json(),
      status: response.status,
      statusText: '',
      headers: new AxiosHeaders(),
      config,
    };
    if (!response.ok)
      throw new AxiosError(
        'Request failed',
        undefined,
        config,
        undefined,
        result,
      );
    return result;
  };
});
if (previousId === undefined) delete process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
else process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID = previousId;
const originalLocalStorage = Object.getOwnPropertyDescriptor(
  globalThis,
  'localStorage',
);
const originalSessionStorage = Object.getOwnPropertyDescriptor(
  globalThis,
  'sessionStorage',
);
afterEach(() => {
  mock.restoreAll();
  httpClient.defaults.adapter = originalAdapter;
  for (const [name, descriptor] of [
    ['localStorage', originalLocalStorage],
    ['sessionStorage', originalSessionStorage],
  ] as const) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else Reflect.deleteProperty(globalThis, name);
  }
});
function setStorage() {
  for (const name of ['localStorage', 'sessionStorage']) {
    const data = new Map<string, string>();
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value: {
        getItem: (key: string) => data.get(key) ?? null,
        setItem: (key: string, value: string) => data.set(key, value),
        removeItem: (key: string) => data.delete(key),
      },
    });
  }
}

test('sign-in uses the SDK command and refresh preserves the refresh token', async () => {
  setStorage();
  const flows: string[] = [];
  mock.method(cognitoClient, 'send', async (command: unknown) => {
    assert.ok(command instanceof InitiateAuthCommand);
    assert.equal(command.input.ClientId, 'test-client');
    flows.push(command.input.AuthFlow ?? '');
    if (flows.length === 1) {
      assert.deepEqual(command.input.AuthParameters, {
        USERNAME: 'user@example.com',
        PASSWORD: 'password',
      });
      return {
        AuthenticationResult: {
          AccessToken: 'old',
          RefreshToken: 'refresh',
          ExpiresIn: 1,
        },
      };
    }
    assert.deepEqual(command.input.AuthParameters, {
      REFRESH_TOKEN: 'refresh',
    });
    return { AuthenticationResult: { AccessToken: 'new', ExpiresIn: 3600 } };
  });
  await auth.signIn(' user@example.com ', 'password', true);
  assert.equal(await auth.getAccessToken(), 'new');
  assert.deepEqual(flows, ['USER_PASSWORD_AUTH', 'REFRESH_TOKEN_AUTH']);
  assert.match(
    localStorage.getItem('wedding-admin-session') ?? '',
    /"refreshToken":"refresh"/,
  );
  assert.equal(sessionStorage.getItem('wedding-admin-session'), null);
});

test('SDK errors retain friendly messages and error codes', async () => {
  mock.method(cognitoClient, 'send', async () => {
    throw new NotAuthorizedException({
      message: 'AWS rejected credentials',
      $metadata: { httpStatusCode: 400 },
    });
  });
  await assert.rejects(auth.signIn('user', 'bad', false), {
    message: 'Incorrect email or password.',
    status: 400,
    code: 'NotAuthorizedException',
  });
});

test('password reset uses typed SDK commands with trimmed identifiers', async () => {
  const commands: unknown[] = [];
  mock.method(cognitoClient, 'send', async (command: unknown) => {
    commands.push(command);
    return {};
  });
  await auth.requestPasswordReset(' user@example.com ');
  await auth.confirmPasswordReset(
    ' user@example.com ',
    ' 123456 ',
    'new-password',
  );
  assert.ok(commands[0] instanceof ForgotPasswordCommand);
  assert.equal(commands[0].input.Username, 'user@example.com');
  assert.ok(commands[1] instanceof ConfirmForgotPasswordCommand);
  assert.equal(commands[1].input.ConfirmationCode, '123456');
  assert.equal(commands[1].input.Password, 'new-password');
});

test('missing SDK authentication results never create a session', async () => {
  setStorage();
  mock.method(cognitoClient, 'send', async () => ({}));
  await assert.rejects(auth.signIn('user', 'password', false), /access token/);
  assert.equal(sessionStorage.getItem('wedding-admin-session'), null);
});
