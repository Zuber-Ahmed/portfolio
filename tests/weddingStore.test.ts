import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';

import {
  GetCommand,
  ScanCommand,
  TransactWriteCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

import { dynamoClient, dynamoDocumentClient } from '../app/libs/dynamoClient';
import { formatInvitationAnswer } from '../app/services/wedding/chatService';
import * as store from '../app/services/wedding/weddingStoreService';

const token = 'a'.repeat(43);
const guest = {
  displayName: 'Amina',
  recipientType: 'individual',
  nikah: true,
  walima: false,
};
const stored = {
  ...guest,
  id: token,
  kind: 'invitation',
  rsvp: { walima: 'attending' },
};
const wedding = {
  couple: {
    groomName: 'Groom',
    brideName: 'Bride',
    groomFather: '',
    brideFather: '',
  },
  nikah: {
    date: '2027-01-01',
    displayTime: '6 PM',
    venue: { name: 'Hall', address: 'Main Street' },
  },
  walima: {
    date: '2027-01-02',
    displayTime: '7 PM',
    venue: { name: 'Private venue', address: 'Private address' },
  },
};
const previousTable = process.env.WEDDING_TABLE_NAME;
const previousOrigin = process.env.APP_ORIGIN;
afterEach(() => {
  mock.restoreAll();
  if (previousTable === undefined) delete process.env.WEDDING_TABLE_NAME;
  else process.env.WEDDING_TABLE_NAME = previousTable;
  if (previousOrigin === undefined) delete process.env.APP_ORIGIN;
  else process.env.APP_ORIGIN = previousOrigin;
});
function readFixtures() {
  mock.method(dynamoClient, 'get', async (id: string) =>
    id === token
      ? structuredClone(stored)
      : id === 'wedding'
        ? { wedding }
        : undefined,
  );
}

test('guest responses and chat exclude unauthorized event details and RSVP', async () => {
  readFixtures();
  const invitation = await store.getInvitation(token);
  assert.equal(invitation.events.walima, undefined);
  assert.equal(invitation.rsvp.walima, undefined);
  assert.doesNotMatch(
    JSON.stringify(invitation),
    /Private venue|Private address/,
  );
  assert.match(
    formatInvitationAnswer(invitation, 'Where is the walima?', {}).answer,
    /not included/,
  );
  assert.match(
    formatInvitationAnswer(invitation, 'Where is it?', { event: 'walima' })
      .answer,
    /Main Street/,
  );
  assert.doesNotMatch(
    formatInvitationAnswer(invitation, 'Where?', {}).answer,
    /Private/,
  );
});

test('RSVP rejects uninvited events and guards invited events against concurrent edits', async () => {
  readFixtures();
  const update = mock.method(
    dynamoClient,
    'update',
    async (_id: string, options: Parameters<typeof dynamoClient.update>[1]) => {
      assert.match(options.ConditionExpression || '', /#nikah = :yes/);
      assert.equal(options.ExpressionAttributeValues?.[':nikah'], 'attending');
      assert.match(options.UpdateExpression || '', /rsvp.#nikah/);
      return { ...stored, rsvp: { nikah: 'attending', walima: 'attending' } };
    },
  );
  await assert.rejects(store.submitRSVP(token, { walima: 'attending' }), {
    status: 403,
  });
  await assert.rejects(store.submitRSVP(token, {}), { status: 400 });
  assert.equal(update.mock.callCount(), 0);
  const result = await store.submitRSVP(token, { nikah: 'attending' });
  assert.deepEqual(result.rsvp, { nikah: 'attending' });
});

test('invalid and missing invitation tokens never return wedding data', async () => {
  readFixtures();
  await assert.rejects(store.getInvitation('wedding'), { status: 404 });
  await assert.rejects(store.getInvitation('b'.repeat(43)), { status: 404 });
});

test('imports validate every row before writing and create unguessable links', async () => {
  process.env.APP_ORIGIN = 'https://example.com';
  let saved: Record<string, unknown>[] = [];
  const create = mock.method(
    dynamoClient,
    'createMany',
    async (items: Record<string, unknown>[]) => {
      saved = items;
    },
  );
  await assert.rejects(
    store.importInvitations({ guests: [guest, { ...guest, displayName: '' }] }),
  );
  await assert.rejects(
    store.importInvitations({ guests: Array(101).fill(guest) }),
  );
  assert.equal(create.mock.callCount(), 0);
  const invitations = await store.importInvitations({ guests: [guest, guest] });
  assert.equal(saved.length, 2);
  assert.notEqual(invitations[0].id, invitations[1].id);
  assert.match(
    invitations[0].invitationUrl,
    /^https:\/\/example.com\/invite\/[A-Za-z0-9_-]{43}$/,
  );
});

test('wedding updates normalize display fields and reject unsafe links', async () => {
  mock.method(
    dynamoClient,
    'put',
    async (item: Record<string, unknown>) => item,
  );
  const input = {
    ...wedding,
    nikah: {
      date: '2027-01-01',
      displayTime: '6 PM',
      venueName: 'New Hall',
      venueAddress: 'New Street',
      googleMapsUrl: 'https://maps.google.com/',
    },
  };
  const result = await store.updateWedding(input);
  assert.equal(result.nikah.venue.name, 'New Hall');
  assert.equal(result.nikah.time, '6 PM');
  assert.match(result.nikah.displayDate, /2027/);
  await assert.rejects(
    store.updateWedding({
      ...input,
      nikah: { ...input.nikah, googleMapsUrl: 'javascript:alert(1)' },
    }),
  );
});

test('DynamoDB scans all pages, reads consistently, and imports atomically', async () => {
  process.env.WEDDING_TABLE_NAME = 'test-wedding';
  let scans = 0;
  mock.method(dynamoDocumentClient, 'send', async (command: unknown) => {
    if (command instanceof ScanCommand) {
      scans++;
      return scans === 1
        ? { Items: [{ id: 'first' }], LastEvaluatedKey: { id: 'cursor' } }
        : { Items: [{ id: 'second' }] };
    }
    if (command instanceof GetCommand) {
      assert.equal(command.input.ConsistentRead, true);
      return {};
    }
    assert.ok(command instanceof TransactWriteCommand);
    assert.equal(command.input.TransactItems?.length, 2);
    return {};
  });
  assert.deepEqual(await dynamoClient.invitations(), [
    { id: 'first' },
    { id: 'second' },
  ]);
  await dynamoClient.get(token);
  await dynamoClient.createMany([{ id: 'one' }, { id: 'two' }]);
});

test('DynamoDB configuration and conditional conflicts produce actionable errors', async () => {
  delete process.env.WEDDING_TABLE_NAME;
  await assert.rejects(dynamoClient.get(token), { status: 503 });
  process.env.WEDDING_TABLE_NAME = 'test-wedding';
  mock.method(dynamoDocumentClient, 'send', async (command: unknown) => {
    assert.ok(command instanceof UpdateCommand);
    throw Object.assign(new Error('conflict'), {
      name: 'ConditionalCheckFailedException',
    });
  });
  await assert.rejects(
    dynamoClient.update(token, { UpdateExpression: 'SET opened = :yes' }),
    { status: 409 },
  );
});
