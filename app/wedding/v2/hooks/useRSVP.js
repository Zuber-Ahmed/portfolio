import { useState } from 'react';

import { submitRSVP } from '@/app/services/wedding/invitationService';

export function useRSVP(token, initialRSVP) {
  const [rsvp, setRsvp] = useState(initialRSVP);
  const [status, setStatus] = useState(() =>
    Object.values(initialRSVP).some(Boolean) ? 'success' : 'idle',
  );
  const [error, setError] = useState(null);

  const submit = async responses => {
    setStatus('submitting');
    setError(null);
    try {
      const result = await submitRSVP(token, responses);
      setRsvp(current => ({ ...current, ...result.rsvp }));
      setStatus('success');
      return true;
    } catch (submitError) {
      setError(submitError);
      setStatus('error');
      return false;
    }
  };

  const edit = () => setStatus('idle');
  return { rsvp, status, error, submit, edit };
}
