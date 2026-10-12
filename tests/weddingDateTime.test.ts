import assert from 'node:assert/strict';
import { test } from 'node:test';

import { weddingInputSchema } from '../app/services/wedding/types';
import {
  eventDateTimeValue,
  eventScheduleFields,
  eventUtcOffset,
  formatWeddingTime,
  timeInputValue,
} from '../app/utils/weddingDateTime';

test('ceremony times consistently use AM/PM, including noon and midnight', () => {
  for (const [input, expected] of [
    ['00:00', '12:00 AM'],
    ['12:00', '12:00 PM'],
    ['18:45', '6:45 PM'],
    ['6 PM', '6:00 PM'],
    ['09:05 am', '9:05 AM'],
  ]) {
    assert.equal(formatWeddingTime(input), expected);
  }
  assert.equal(timeInputValue('12:00 AM'), '00:00');
  assert.equal(timeInputValue('12:00 PM'), '12:00');
  assert.equal(timeInputValue('25:00'), '');
  assert.equal(timeInputValue('8:60'), '');
  assert.equal(formatWeddingTime('After prayers'), 'After prayers');
});

test('calendar selection round-trips without moving the ceremony into the browser timezone', () => {
  const schedule = eventScheduleFields('2027-01-01T00:15', '+05:30');
  assert.deepEqual(schedule, {
    date: '2027-01-01',
    displayTime: '12:15 AM',
    countdownTarget: '2027-01-01T00:15:00+05:30',
  });
  assert.equal(eventDateTimeValue(schedule), '2027-01-01T00:15');
  assert.equal(eventUtcOffset(schedule.countdownTarget, -300), '+05:30');
  assert.equal(
    new Date(schedule.countdownTarget).toISOString(),
    '2026-12-31T18:45:00.000Z',
  );
  const config = weddingInputSchema.parse({
    couple: {
      groomName: 'Groom',
      brideName: 'Bride',
      groomFather: '',
      brideFather: '',
    },
    nikah: schedule,
    walima: schedule,
  });
  assert.equal(config.nikah.countdownTarget, schedule.countdownTarget);
});

test('existing database dates and times load into native picker values', () => {
  assert.equal(
    eventDateTimeValue({ date: '2027-01-01', displayTime: '6 PM' }),
    '2027-01-01T18:00',
  );
  assert.equal(
    eventDateTimeValue({ date: '2027-01-01', time: '18:30' }),
    '2027-01-01T18:30',
  );
  assert.equal(eventDateTimeValue({ date: '' }), '');
  assert.equal(eventUtcOffset('2027-01-01T18:00:00Z', 240), '+00:00');
  assert.equal(eventUtcOffset(undefined, 345), '+05:45');
  assert.equal(eventUtcOffset(undefined, -210), '-03:30');
  assert.deepEqual(eventScheduleFields('', '+04:00'), {
    date: '',
    displayTime: '',
    countdownTarget: '',
  });
});
