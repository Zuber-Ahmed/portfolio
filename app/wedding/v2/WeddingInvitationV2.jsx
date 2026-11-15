'use client';

import { useInvitation } from './hooks/useInvitation';
import InvitationPresentation from './InvitationPresentation';

export default function WeddingInvitationV2({ token, onVisitPortfolio }) {
  const { invitation, loading, error, retry } = useInvitation(token);

  return (
    <InvitationPresentation
      token={token}
      invitation={invitation}
      loading={loading}
      error={error}
      retry={retry}
      onVisitPortfolio={onVisitPortfolio}
    />
  );
}
