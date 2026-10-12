'use client';

import { RingLoader } from 'react-spinners';

export default function LoadingOverlay({ visible }: { visible: boolean }) {
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black text-white overflow-hidden">
      <RingLoader
        loading={visible}
        size={50}
        color="white"
        speedMultiplier={2}
      />
    </div>
  );
}
