import React, { useEffect, useRef, useState } from 'react';

import { createEnvelopeRevealSequence } from './envelopeRevealSequence';

function eventLabel(events) {
  if (events.nikah && events.walima) return 'Nikah and Walima';
  if (events.nikah) return 'Nikah';
  return 'Walima';
}

export default function EnvelopeReveal({ recipient, events, onComplete }) {
  const [stage, setStage] = useState('sealed');
  const sequence = useRef(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => () => sequence.current?.dispose(), []);

  const openInvitation = () => {
    if (!sequence.current) {
      const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      sequence.current = createEnvelopeRevealSequence({
        reducedMotion,
        onStage: setStage,
        onComplete: () => onCompleteRef.current(),
      });
    }
    sequence.current.start();
  };

  return (
    <main
      className={`wedding-v2-reveal wedding-v2-envelope-reveal is-${stage}`}>
      <header>
        <span>Zuber &amp; Bisma</span>
        <h1>A Special Invitation For</h1>
        <strong>{recipient.displayName}</strong>
        <p>
          A beautiful {eventLabel(events)} invitation has been prepared for you
        </p>
      </header>

      <section
        className="wedding-v2-envelope-stage"
        aria-label={`${eventLabel(events)} invitation envelope`}>
        <div className="wedding-v2-ribbon-envelope">
          <div className="wedding-v2-envelope-shadow" aria-hidden="true" />
          <div className="wedding-v2-envelope-base" aria-hidden="true" />

          <div className="wedding-v2-envelope-paper" aria-hidden="true">
            <span>With the blessings of Allah</span>
            <strong>
              Zuber <i>&amp;</i> Bisma
            </strong>
            <small>Our Wedding Invitation</small>
          </div>

          <div className="wedding-v2-envelope-flap" aria-hidden="true">
            <span />
          </div>
          <div className="wedding-v2-envelope-pocket" aria-hidden="true">
            <span>Zuber &amp; Bisma</span>
          </div>

          <div
            className="wedding-v2-ribbon wedding-v2-ribbon-left"
            aria-hidden="true"
          />
          <div
            className="wedding-v2-ribbon wedding-v2-ribbon-right"
            aria-hidden="true"
          />
          <div
            className="wedding-v2-ribbon wedding-v2-ribbon-top"
            aria-hidden="true"
          />
          <div
            className="wedding-v2-ribbon wedding-v2-ribbon-bottom"
            aria-hidden="true"
          />

          <button
            type="button"
            className="wedding-v2-ribbon-knot"
            aria-label="Open wedding invitation"
            onClick={openInvitation}
            disabled={stage !== 'sealed'}>
            <span
              className="wedding-v2-knot-loop wedding-v2-knot-loop-left"
              aria-hidden="true"
            />
            <span
              className="wedding-v2-knot-loop wedding-v2-knot-loop-right"
              aria-hidden="true"
            />
            <span className="wedding-v2-knot-center" aria-hidden="true" />
            <span
              className="wedding-v2-knot-tail wedding-v2-knot-tail-left"
              aria-hidden="true"
            />
            <span
              className="wedding-v2-knot-tail wedding-v2-knot-tail-right"
              aria-hidden="true"
            />
          </button>
        </div>
      </section>

      <p className="wedding-v2-envelope-instruction">Tap the ribbon to open</p>
    </main>
  );
}
