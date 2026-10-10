'use client';

import './wedding.css';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useWeddingAudio } from '../hooks/useWeddingAudio';
import { useWeddingDetails } from '../hooks/useWeddingDetails';
import PetalCanvas from './components/PetalCanvas';
import WeddingAudio from './components/WeddingAudio';
import WeddingEnvelope from './components/WeddingEnvelope';
import WeddingInvitation from './components/WeddingInvitation';
import { mergeWeddingData, weddingData } from './data/weddingData';

export default function WeddingPage({ onVisitPortfolio }) {
  const router = useRouter();
  const visitPortfolio = onVisitPortfolio || (() => router.push('/'));
  const { wedding, loading, error, retry } = useWeddingDetails();
  const data = mergeWeddingData(wedding);
  const [phase, setPhase] = useState('closed');
  const [artworkFailed, setArtworkFailed] = useState(false);
  const petalCanvasRef = useRef(null);
  const timersRef = useRef([]);
  const audio = useWeddingAudio(weddingData.audio);

  useEffect(() => {
    document.title = `${data.couple.groom} & ${data.couple.bride} | Wedding Invitation`;
    document.documentElement.classList.add('wedding-active');
    return () => {
      timersRef.current.forEach(window.clearTimeout);
      document.documentElement.classList.remove('wedding-active');
    };
  }, [data.couple.groom, data.couple.bride]);

  const clearTimers = () => {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];
  };

  const openEnvelope = () => {
    if (phase !== 'closed') return;
    audio.play();

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reducedMotion) {
      setPhase('open');
      return;
    }

    setPhase('opening');
    timersRef.current.push(
      window.setTimeout(() => petalCanvasRef.current?.burst(150), 800),
    );
    timersRef.current.push(window.setTimeout(() => setPhase('open'), 1750));
  };

  const replayEnvelope = () => {
    clearTimers();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setPhase('closed');
  };

  if (loading)
    return <main className="wedding-status">Loading wedding details...</main>;
  if (error)
    return (
      <main className="wedding-status">
        <h1>Wedding details are being prepared</h1>
        <p>Please try again in a moment.</p>
        <button onClick={retry}>Try Again</button>
      </main>
    );

  return (
    <div className="wedding-experience">
      <PetalCanvas ref={petalCanvasRef} />
      {phase === 'open' && (
        <div className="wedding-top-actions">
          <button
            type="button"
            className="wedding-pill"
            onClick={replayEnvelope}
            aria-label="Replay envelope experience">
            ↻ <span>Envelope</span>
          </button>
          <WeddingAudio audio={audio} />
        </div>
      )}
      {phase !== 'open' ? (
        <WeddingEnvelope data={data} phase={phase} onOpen={openEnvelope} />
      ) : (
        <WeddingInvitation
          data={data}
          artworkFailed={artworkFailed}
          onArtworkError={() => setArtworkFailed(true)}
          onPetalShower={() => petalCanvasRef.current?.burst(120)}
          onReplay={replayEnvelope}
          onVisitPortfolio={visitPortfolio}
        />
      )}
    </div>
  );
}
