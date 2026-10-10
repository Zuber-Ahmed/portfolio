import { Suspense } from 'react';

import WeddingAdminApp from '@/app/wedding/admin/WeddingAdminApp';
export default function Page() {
  return (
    <Suspense fallback={<p>Loading admin...</p>}>
      <WeddingAdminApp />
    </Suspense>
  );
}
