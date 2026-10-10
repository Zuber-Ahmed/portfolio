'use client';

import '../wedding.css';
import './wedding-v2.css';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { recordInvitationReveal } from '@/app/services/wedding/invitationService';

import { useWeddingAudio } from '../../hooks/useWeddingAudio';
import PetalCanvas from '../components/PetalCanvas';
import WeddingAudio from '../components/WeddingAudio';
import { mergeWeddingData, weddingData } from '../data/weddingData';
import InvitationExperience from './experience/InvitationExperience';
import { useInvitation } from './hooks/useInvitation';
import EnvelopeReveal from './invitation/EnvelopeReveal';
import InvalidInvitation from './invitation/InvalidInvitation';
import InvitationLoading from './invitation/InvitationLoading';
import PersonalizedEnvelope from './invitation/PersonalizedEnvelope';

export default function WeddingInvitationV2({ token, onVisitPortfolio }) {
  const router = useRouter();
  const visitPortfolio = onVisitPortfolio || (() => router.push('/'));
  const { invitation, loading, error, retry } = useInvitation(token);
  const [phase, setPhase] = useState('envelope');
  const timers = useRef([]);
  const petals = useRef(null);
  const revealRecorded = useRef(false);
  const audio = useWeddingAudio(weddingData.audio);
  const currentWedding = mergeWeddingData(invitation?.wedding);

  useEffect(() => {
    document.title = `${currentWedding.couple.groom} & ${currentWedding.couple.bride} | Wedding Invitation`;
    document.documentElement.classList.add('wedding-active');
    return () => {
      timers.current.forEach(window.clearTimeout);
      document.documentElement.classList.remove('wedding-active');
    };
  }, [currentWedding.couple.bride, currentWedding.couple.groom]);

  const openEnvelope = () => {
    if (phase !== 'envelope') return;
    audio.play();
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    setPhase('opening');
    timers.current.push(
      window.setTimeout(() => setPhase('reveal'), reducedMotion ? 100 : 1500),
    );
  };

  const completeReveal = useCallback(() => {
    if (!revealRecorded.current) {
      revealRecorded.current = true;
      recordInvitationReveal(token).catch(() => {});
    }
    petals.current?.burst(80);
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    timers.current.push(
      window.setTimeout(
        () => setPhase('invitation'),
        reducedMotion ? 100 : 850,
      ),
    );
  }, [token]);

  const replay = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setPhase('envelope');
  };

  if (loading) return <InvitationLoading />;
  if (error)
    return (
      <InvalidInvitation temporary={error.status !== 404} onRetry={retry} />
    );

  return (
    <div className="wedding-experience wedding-v2">
      <PetalCanvas ref={petals} />
      {phase !== 'envelope' && phase !== 'opening' && (
        <div className="wedding-top-actions">
          <WeddingAudio audio={audio} />
        </div>
      )}
      {(phase === 'envelope' || phase === 'opening') && (
        <PersonalizedEnvelope
          recipient={invitation.recipient}
          wedding={currentWedding}
          phase={phase}
          onOpen={openEnvelope}
        />
      )}
      {phase === 'reveal' && (
        <EnvelopeReveal
          recipient={invitation.recipient}
          events={invitation.events}
          onComplete={completeReveal}
        />
      )}
      {phase === 'invitation' && (
        <InvitationExperience
          token={token}
          invitation={invitation}
          wedding={currentWedding}
          onReplay={replay}
          onVisitPortfolio={visitPortfolio}
        />
      )}
    </div>
  );
}
