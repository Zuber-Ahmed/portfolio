'use client';

import { useRouter } from 'next/navigation';

import InvitationPresentation from '@/app/wedding/v2/InvitationPresentation';

export default function ReceptionInvitation({ wedding, error }) {
  const router = useRouter();
  const invitation = wedding
    ? {
        recipient: {
          displayName: 'You and Your Family',
          recipientType: 'family',
        },
        events: { walima: wedding.walima },
        wedding,
      }
    : null;

  return (
    <InvitationPresentation
      generic
      invitation={invitation}
      loading={false}
      error={error}
      retry={() => router.refresh()}
    />
  );
}
