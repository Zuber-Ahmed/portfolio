import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';

import * as guest from '../app/api/admin/invitations/[id]/route';
import * as imports from '../app/api/admin/invitations/import/route';
import * as guests from '../app/api/admin/invitations/route';
import * as wedding from '../app/api/admin/invitations/wedding/route';
import { GET as invitation } from '../app/api/invitations/[token]/route';
import { PUT as rsvp } from '../app/api/invitations/[token]/rsvp/route';
import { dynamoClient } from '../app/libs/dynamoClient';

afterEach(() => mock.restoreAll());

test('every admin data handler rejects unauthenticated requests before accessing storage', async () => {
  mock.method(dynamoClient, 'get', async () =>
    assert.fail('Storage must not be read'),
  );
  const request = new Request('http://localhost/api/admin/invitations');
  const context = { params: Promise.resolve({ id: 'a'.repeat(43) }) };
  for (const response of await Promise.all([
    guests.GET(request),
    guests.POST(request),
    guest.PUT(request, context),
    guest.DELETE(request, context),
    imports.POST(request),
    wedding.GET(request),
    wedding.PUT(request),
  ])) {
    assert.equal(response.status, 401);
  }
});

test('public invitation requests need a valid invitation, not an admin session', async () => {
  const response = await invitation(new Request('http://localhost'), {
    params: Promise.resolve({ token: 'missing' }),
  });
  assert.equal(response.status, 404);
});

test('RSVP handlers reject malformed JSON and unknown event keys', async () => {
  const context = { params: Promise.resolve({ token: 'a'.repeat(43) }) };
  for (const body of [
    '{',
    JSON.stringify({ responses: { other: 'attending' } }),
  ]) {
    const response = await rsvp(
      new Request('http://localhost', { method: 'PUT', body }),
      context,
    );
    assert.equal(response.status, 400);
  }
});
