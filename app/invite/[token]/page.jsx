import { Suspense } from 'react';

import InvitationLoading from '@/app/wedding/v2/invitation/InvitationLoading';
import WeddingInvitationV2 from '@/app/wedding/v2/WeddingInvitationV2';
async function Invitation({ params }) {
  const { token } = await params;
  return <WeddingInvitationV2 key={token} token={token} />;
}
export default function Page({ params }) {
  return (
    <Suspense fallback={<InvitationLoading />}>
      <Invitation params={params} />
    </Suspense>
  );
}
