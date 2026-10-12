import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createEnvelopeRevealSequence,
  ENVELOPE_REVEAL_TIMINGS,
} from '@/app/utils/wedding/envelopeRevealSequence.js';

import { fakeClock } from '../helpers/fakeClock';

test('the envelope sequence starts once and completes once in order', () => {
  const clock = fakeClock();
  const stages = [];
  let completions = 0;
  const sequence = createEnvelopeRevealSequence({
    onStage: stage => stages.push(stage),
    onComplete: () => {
      completions += 1;
    },
    schedule: clock.schedule,
    cancel: clock.cancel,
  });

  assert.equal(sequence.start(), true);
  assert.equal(sequence.start(), false);
  clock.run();

  assert.deepEqual(stages, [
    'untying',
    'releasing',
    'opening',
    'peeking',
    'complete',
  ]);
  assert.equal(completions, 1);
});

test('reduced motion keeps the same states on a short deterministic timeline', () => {
  const clock = fakeClock();
  const sequence = createEnvelopeRevealSequence({
    reducedMotion: true,
    onStage() {},
    onComplete() {},
    schedule: clock.schedule,
    cancel: clock.cancel,
  });

  sequence.start();

  assert.deepEqual(
    clock.jobs.map(({ delay }) => delay),
    Object.values(ENVELOPE_REVEAL_TIMINGS.reduced),
  );
  assert.ok(Math.max(...clock.jobs.map(({ delay }) => delay)) <= 100);
});

test('disposing the sequence cancels every pending transition', () => {
  const clock = fakeClock();
  let completions = 0;
  const sequence = createEnvelopeRevealSequence({
    onStage() {},
    onComplete: () => {
      completions += 1;
    },
    schedule: clock.schedule,
    cancel: clock.cancel,
  });

  sequence.start();
  sequence.dispose();
  clock.run();

  assert.equal(clock.canceled.size, 4);
  assert.equal(completions, 0);
});
