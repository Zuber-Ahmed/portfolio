import assert from 'node:assert/strict';
import test from 'node:test';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import EnvelopeReveal from './EnvelopeReveal.jsx';
import {
  createEnvelopeRevealSequence,
  ENVELOPE_REVEAL_TIMINGS,
} from './envelopeRevealSequence.js';

function fakeClock() {
  const jobs = [];
  const canceled = new Set();
  return {
    jobs,
    canceled,
    schedule(callback, delay) {
      const id = jobs.length;
      jobs.push({ callback, delay, id });
      return id;
    },
    cancel(id) {
      canceled.add(id);
    },
    run() {
      jobs
        .filter(({ id }) => !canceled.has(id))
        .sort((a, b) => a.delay - b.delay)
        .forEach(({ callback }) => callback());
    },
  };
}

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

test('the reveal renders an accessible envelope for every guest and event shape', async () => {
  const render = (displayName, events) =>
    renderToStaticMarkup(
      React.createElement(EnvelopeReveal, {
        recipient: { displayName },
        events,
        onComplete() {},
      }),
    );
  const nikah = render('Amina Noor', { nikah: {}, walima: null });
  const walima = render('The Rahman Family', { nikah: null, walima: {} });
  const both = render('Farhan Khan & Family', { nikah: {}, walima: {} });

  assert.match(nikah, /wedding-v2-ribbon-envelope/);
  assert.match(nikah, /<button[^>]*aria-label="Open wedding invitation"/);
  assert.match(nikah, /A beautiful Nikah invitation/);
  assert.match(walima, /The Rahman Family/);
  assert.match(walima, /A beautiful Walima invitation/);
  assert.match(both, /A beautiful Nikah and Walima invitation/);
  assert.doesNotMatch(both, /<canvas|Swipe gently|Tap to Reveal/i);
});
