export const ENVELOPE_REVEAL_TIMINGS = Object.freeze({
  standard: Object.freeze({
    releasing: 450,
    opening: 950,
    peeking: 1450,
    complete: 2300,
  }),
  reduced: Object.freeze({
    releasing: 20,
    opening: 40,
    peeking: 60,
    complete: 100,
  }),
});

export function createEnvelopeRevealSequence({
  reducedMotion = true,
  onStage,
  onComplete,
  schedule = globalThis.setTimeout,
  cancel = globalThis.clearTimeout,
}) {
  const timings = reducedMotion
    ? ENVELOPE_REVEAL_TIMINGS.reduced
    : ENVELOPE_REVEAL_TIMINGS.standard;
  const timers = [];
  let started = false;
  let completed = false;
  let disposed = false;

  const queue = (stage, delay, finish = false) => {
    timers.push(
      schedule(() => {
        if (disposed) return;
        onStage(stage);
        if (finish && !completed) {
          completed = true;
          onComplete();
        }
      }, delay),
    );
  };

  return {
    start() {
      if (started || disposed) return false;
      started = true;
      onStage('untying');
      queue('releasing', timings.releasing);
      queue('opening', timings.opening);
      queue('peeking', timings.peeking);
      queue('complete', timings.complete, true);
      return true;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      timers.forEach(cancel);
      timers.length = 0;
    },
  };
}
