export function fakeClock() {
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
