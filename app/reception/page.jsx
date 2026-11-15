import { connection } from 'next/server';
import { Suspense } from 'react';

import { getWedding } from '@/app/services/wedding/weddingStoreService';
import InvitationLoading from '@/app/wedding/v2/invitation/InvitationLoading';

import ReceptionInvitation from './ReceptionInvitation';

export const metadata = {
  title: 'Walima Reception Invitation',
  description:
    'You and your family are cordially invited to our Walima reception.',
};

async function ReceptionDetails() {
  await connection();
  let wedding;
  try {
    const saved = await getWedding();
    if (!saved.walima.date)
      throw new Error(
        'Reception details are being prepared. Please try again later.',
      );
    wedding = {
      couple: saved.couple,
      nikah: { date: '' },
      walima: saved.walima,
    };
  } catch (error) {
    return (
      <ReceptionInvitation
        error={{
          message:
            process.env.NODE_ENV === 'development'
              ? error.message
              : 'Reception details are temporarily unavailable.',
          code: error.code,
        }}
      />
    );
  }
  return <ReceptionInvitation wedding={wedding} />;
}

export default function Page() {
  return (
    <Suspense fallback={<InvitationLoading />}>
      <ReceptionDetails />
    </Suspense>
  );
}
