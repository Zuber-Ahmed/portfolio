import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { after, test } from 'node:test';

import { CognitoJwtVerifier } from 'aws-jwt-verify';

import { requireAdmin } from '../app/services/wedding/adminAuthService';

const pool = 'ap-south-1_test';
const clientId = 'test-client';
const previousPool = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
const previousClient = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
const previousGroup = process.env.COGNITO_ADMIN_GROUP;
process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID = pool;
process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID = clientId;
process.env.COGNITO_ADMIN_GROUP = 'wedding-admin';
const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
});
const verifier = CognitoJwtVerifier.create({
  userPoolId: pool,
  clientId,
  tokenUse: 'access',
});
verifier.cacheJwks({
  keys: [
    {
      ...publicKey.export({ format: 'jwk' }),
      kty: 'RSA',
      kid: 'test-key',
      use: 'sig',
      alg: 'RS256',
    },
  ],
});
const originalCreate = CognitoJwtVerifier.create;
// Use real JWT verification with a local signing key; no AWS network requests.
Object.defineProperty(CognitoJwtVerifier, 'create', {
  configurable: true,
  writable: true,
  value: () => verifier,
});
after(() => {
  Object.defineProperty(CognitoJwtVerifier, 'create', {
    configurable: true,
    writable: true,
    value: originalCreate,
  });
  for (const [name, value] of [
    ['NEXT_PUBLIC_COGNITO_USER_POOL_ID', previousPool],
    ['NEXT_PUBLIC_COGNITO_CLIENT_ID', previousClient],
    ['COGNITO_ADMIN_GROUP', previousGroup],
  ]) {
    if (value === undefined) delete process.env[name!];
    else process.env[name!] = value;
  }
});
function request(overrides: Record<string, unknown> = {}) {
  const header = Buffer.from(
    JSON.stringify({ alg: 'RS256', kid: 'test-key' }),
  ).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      iss: `https://cognito-idp.ap-south-1.amazonaws.com/${pool}`,
      sub: 'admin-user',
      client_id: clientId,
      token_use: 'access',
      exp: Math.floor(Date.now() / 1000) + 3600,
      'cognito:groups': ['wedding-admin'],
      ...overrides,
    }),
  ).toString('base64url');
  const content = `${header}.${payload}`;
  const signature = sign(
    'RSA-SHA256',
    Buffer.from(content),
    privateKey,
  ).toString('base64url');
  return new Request('http://localhost/api/admin/invitations', {
    headers: { Authorization: `Bearer ${content}.${signature}` },
  });
}

test('admin authorization accepts only valid access tokens from the configured client and group', async () => {
  assert.equal(await requireAdmin(request()), 'admin-user');
  await assert.rejects(requireAdmin(new Request('http://localhost')), {
    status: 401,
  });
  await assert.rejects(requireAdmin(request({ exp: 1 })), { status: 401 });
  await assert.rejects(requireAdmin(request({ client_id: 'other-client' })), {
    status: 401,
  });
  await assert.rejects(requireAdmin(request({ token_use: 'id' })), {
    status: 401,
  });
  await assert.rejects(
    requireAdmin(request({ 'cognito:groups': ['guests'] })),
    { status: 403 },
  );
  await assert.rejects(requireAdmin(request({ 'cognito:groups': [] })), {
    status: 403,
  });
  const tampered = request();
  tampered.headers.set(
    'Authorization',
    `${tampered.headers.get('Authorization')!.slice(0, -20)}invalid`,
  );
  await assert.rejects(requireAdmin(tampered), { status: 401 });
});
