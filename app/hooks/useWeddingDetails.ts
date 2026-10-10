import { useCallback, useEffect, useState } from 'react';

import type { Wedding } from '@/app/services/wedding/types';
import { getWeddingDetails } from '@/app/services/wedding/weddingService';

export function useWeddingDetails() {
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt(value => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getWeddingDetails(controller.signal)
      .then(result => {
        if (!controller.signal.aborted) setWedding(result.wedding);
      })
      .catch(error => {
        if (!controller.signal.aborted) setError(error);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [attempt]);
  return { wedding, loading, error, retry };
}
