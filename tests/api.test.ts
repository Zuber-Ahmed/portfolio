import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { z } from 'zod';

import { ApiError, httpClient, requestJson } from '../app/libs/httpClient';
import * as admin from '../app/services/wedding/adminService';
import * as invitations from '../app/services/wedding/invitationService';
import type { GuestInput, Wedding } from '../app/services/wedding/types';

const originalAdapter = httpClient.defaults.adapter;
const originalLocalStorage = Object.getOwnPropertyDescriptor(
  globalThis,
  'localStorage',
);
const originalSessionStorage = Object.getOwnPropertyDescriptor(
  globalThis,
  'sessionStorage',
);
afterEach(() => {
  httpClient.defaults.adapter = originalAdapter;
  for (const [name, descriptor] of [
    ['localStorage', originalLocalStorage],
    ['sessionStorage', originalSessionStorage],
  ] as const) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else Reflect.deleteProperty(globalThis, name);
  }
});
function storage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
  };
}
function session(authenticated = true) {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: storage(),
  });
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: storage(),
  });
  if (authenticated)
    localStorage.setItem(
      'wedding-admin-session',
      JSON.stringify({
        accessToken: 'test-token',
        expiresAt: Date.now() + 3600000,
        remember: true,
      }),
    );
}
function response(
  config: InternalAxiosRequestConfig,
  data: unknown,
  status = 200,
): AxiosResponse<unknown> {
  const result = {
    config,
    data,
    status,
    statusText: '',
    headers: new AxiosHeaders(),
  };
  if (status >= 400)
    throw new AxiosError(
      'Request failed',
      undefined,
      config,
      undefined,
      result,
    );
  return result;
}
const guest: GuestInput = {
  displayName: 'Test',
  recipientType: 'individual',
  nikah: true,
  walima: false,
};
const invitation = { ...guest, id: 'guest-id', rsvp: {} };
const wedding: Wedding = {
  couple: {
    groomName: 'Groom',
    brideName: 'Bride',
    groomFather: 'Father',
    brideFather: 'Father',
  },
  nikah: { date: '2026-12-01' },
  walima: { date: '2026-12-02' },
};

test('Axios client preserves custom headers and structured validation errors', async () => {
  httpClient.defaults.adapter = async config => {
    assert.equal(config.headers.get('Content-Type'), 'application/custom+json');
    return response(
      config,
      { message: 'Invalid guest', errors: ['name required'] },
      422,
    );
  };
  await assert.rejects(
    requestJson('/test', z.unknown().parse, {
      headers: { 'Content-Type': 'application/custom+json' },
    }),
    error => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.status, 422);
      assert.deepEqual(error.details, ['name required']);
      return true;
    },
  );
});

test('malformed success data is rejected instead of asserted to the response type', async () => {
  httpClient.defaults.adapter = async config => response(config, {});
  await assert.rejects(invitations.getInvitation('test'), {
    code: 'INVALID_RESPONSE',
  });
  session();
  await assert.rejects(admin.listInvitations(), { code: 'INVALID_RESPONSE' });
  httpClient.defaults.adapter = async config =>
    response(config, 'Bad gateway', 502);
  await assert.rejects(invitations.getInvitation('test'), {
    message: 'Invitation request failed.',
    status: 502,
  });
});

test('admin calls reject missing or malformed sessions and clear forbidden sessions', async () => {
  session(false);
  httpClient.defaults.adapter = async () =>
    assert.fail('Must not send an unauthenticated request');
  await assert.rejects(admin.listInvitations(), { status: 401 });
  localStorage.setItem(
    'wedding-admin-session',
    JSON.stringify({ accessToken: 123, expiresAt: Date.now() + 3600000 }),
  );
  await assert.rejects(admin.listInvitations(), { status: 401 });
  assert.equal(localStorage.getItem('wedding-admin-session'), null);
  session();
  httpClient.defaults.adapter = async config => {
    assert.equal(config.headers.get('Authorization'), 'Bearer test-token');
    return response(config, { message: 'Forbidden' }, 403);
  };
  await assert.rejects(admin.listInvitations(), { status: 403 });
  assert.equal(localStorage.getItem('wedding-admin-session'), null);
});

test('admin service sends endpoint-specific request bodies and supports empty delete responses', async () => {
  session();
  const calls: unknown[] = [];
  httpClient.defaults.adapter = async config => {
    const data: unknown = config.data;
    calls.push([
      config.url,
      config.method,
      typeof data === 'string' ? JSON.parse(data) : data,
    ]);
    if (config.method === 'delete') return response(config, '', 204);
    return response(
      config,
      config.url?.endsWith('/wedding')
        ? { wedding }
        : config.method === 'get' || config.url?.endsWith('/import')
          ? { invitations: [invitation] }
          : { invitation },
    );
  };
  await admin.listInvitations();
  await admin.createInvitation(guest);
  await admin.updateInvitation('a/b', guest);
  await admin.deleteInvitation('a/b');
  await admin.importInvitations([guest]);
  await admin.getWedding();
  await admin.updateWedding(wedding);
  assert.deepEqual(calls, [
    ['/api/admin/invitations', 'get', undefined],
    ['/api/admin/invitations', 'post', guest],
    ['/api/admin/invitations/a%2Fb', 'put', guest],
    ['/api/admin/invitations/a%2Fb', 'delete', undefined],
    ['/api/admin/invitations/import', 'post', { guests: [guest] }],
    ['/api/admin/invitations/wedding', 'get', undefined],
    ['/api/admin/invitations/wedding', 'put', wedding],
  ]);
});

test('invitation service preserves token encoding, RSVP data and chat cancellation', async () => {
  const calls: unknown[] = [];
  const controller = new AbortController();
  httpClient.defaults.adapter = async config => {
    const data: unknown = config.data;
    calls.push([
      config.url,
      config.method,
      typeof data === 'string' ? JSON.parse(data) : data,
    ]);
    if (config.url?.endsWith('/chat')) {
      assert.equal(config.signal, controller.signal);
      return response(config, { answer: 'Hello', context: {} });
    }
    if (config.url?.endsWith('/rsvp'))
      return response(config, {
        rsvp: { nikah: 'attending' },
        updatedAt: '2026-10-08',
      });
    if (config.url?.endsWith('/opened') || config.url?.endsWith('/revealed'))
      return response(config, { recorded: true });
    return response(config, {
      recipient: { displayName: 'Guest', recipientType: 'individual' },
      events: { nikah: wedding.nikah },
      rsvp: {},
      wedding,
    });
  };
  await invitations.getInvitation('a/b');
  await invitations.recordInvitationOpen('a/b');
  await invitations.recordInvitationReveal('a/b');
  await invitations.submitRSVP('a/b', { nikah: 'attending' });
  await invitations.askInvitation(
    'a/b',
    'Where?',
    { event: 'nikah' },
    controller.signal,
  );
  assert.deepEqual(calls, [
    ['/api/invitations/a%2Fb', 'get', undefined],
    ['/api/invitations/a%2Fb/opened', 'post', undefined],
    ['/api/invitations/a%2Fb/revealed', 'post', undefined],
    [
      '/api/invitations/a%2Fb/rsvp',
      'put',
      { responses: { nikah: 'attending' } },
    ],
    [
      '/api/invitations/a%2Fb/chat',
      'post',
      { message: 'Where?', context: { event: 'nikah' } },
    ],
  ]);
  controller.abort();
  await assert.rejects(
    invitations.askInvitation('token', 'Hello', {}, controller.signal),
    { name: 'AbortError' },
  );
});
