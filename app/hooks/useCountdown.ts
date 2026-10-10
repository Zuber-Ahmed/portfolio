import { useEffect, useState } from 'react';

const EMPTY_COUNTDOWN = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  complete: true,
};

function calculateCountdown(targetDate: Date | string) {
  const difference = new Date(targetDate).getTime() - Date.now();
  if (!Number.isFinite(difference) || difference <= 0) return EMPTY_COUNTDOWN;

  return {
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference % 86_400_000) / 3_600_000),
    minutes: Math.floor((difference % 3_600_000) / 60_000),
    seconds: Math.floor((difference % 60_000) / 1_000),
    complete: false,
  };
}

export function useCountdown(targetDate: Date | string) {
  const [countdown, setCountdown] = useState(() =>
    calculateCountdown(targetDate),
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const next = calculateCountdown(targetDate);
      setCountdown(next);
      if (next.complete) window.clearInterval(intervalId);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [targetDate]);

  return countdown;
}
