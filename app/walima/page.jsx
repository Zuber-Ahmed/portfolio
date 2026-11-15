import './demo.css';

import { Amiri, Cormorant_Garamond, Manrope } from 'next/font/google';
import { connection } from 'next/server';
import { Suspense } from 'react';

import { getWedding } from '@/app/services/wedding/weddingStoreService';

import DemoInvitation from './DemoInvitation';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--demo-display',
});
const sans = Manrope({ subsets: ['latin'], variable: '--demo-sans' });
const arabic = Amiri({
  subsets: ['arabic'],
  weight: '400',
  variable: '--demo-arabic',
});

export const metadata = {
  title: 'A Celebration of Togetherness | Wedding Invitation',
  description: 'You and your family are warmly invited to celebrate with us.',
  robots: { index: false, follow: false },
};

async function Details() {
  await connection();
  let wedding;
  try {
    const saved = await getWedding();
    if (!saved.walima.date)
      throw new Error('Reception details are being prepared.');
    wedding = { couple: saved.couple, walima: saved.walima };
  } catch {
    // A clearly labelled local design preview, never a production data fallback.
    return (
      <DemoInvitation
        preview={process.env.NODE_ENV === 'development'}
        unavailable={process.env.NODE_ENV !== 'development'}
      />
    );
  }
  return <DemoInvitation wedding={wedding} />;
}

export default function Page() {
  return (
    <div
      className={`${display.variable} ${sans.variable} ${arabic.variable} demo-root`}>
      <Suspense
        fallback={
          <div className="demo-loading">
            <span>✧</span>
            <p>Preparing something beautiful</p>
          </div>
        }>
        <Details />
      </Suspense>
    </div>
  );
}
