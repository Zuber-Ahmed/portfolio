import { useCallback, useEffect, useRef, useState } from 'react';

import {
  getInvitation,
  recordInvitationOpen,
} from '@/app/services/wedding/invitationService';

export function useInvitation(token) {
  const [state, setState] = useState({
    invitation: null,
    loading: true,
    error: null,
  });
  const openRecorded = useRef(false);

  const load = useCallback(async () => {
    setState({ invitation: null, loading: true, error: null });
    try {
      const invitation = await getInvitation(token);
      setState({ invitation, loading: false, error: null });

      const sessionKey = `wedding-opened:${token}`;
      if (!openRecorded.current && !sessionStorage.getItem(sessionKey)) {
        openRecorded.current = true;
        sessionStorage.setItem(sessionKey, 'true');
        recordInvitationOpen(token).catch(() => {
          sessionStorage.removeItem(sessionKey);
          openRecorded.current = false;
        });
      }
    } catch (error) {
      setState({ invitation: null, loading: false, error });
    }
  }, [token]);

  useEffect(() => {
    const loadTimer = window.setTimeout(load, 0);
    return () => window.clearTimeout(loadTimer);
  }, [load]);

  return { ...state, retry: load };
}
