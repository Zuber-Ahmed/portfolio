'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FiVolume2, FiVolumeX } from 'react-icons/fi';

import { weddingData } from '@/app/config/wedding';
import { useCountdown } from '@/app/hooks/useCountdown';
import { useWeddingAudio } from '@/app/hooks/useWeddingAudio';

function Ornament() {
  return (
    <div className="demo-ornament" aria-hidden="true">
      <span />✧<span />
    </div>
  );
}

function Countdown({ target }) {
  const count = useCountdown(target);
  return (
    <div className="demo-countdown">
      {['days', 'hours', 'minutes', 'seconds'].map(unit => (
        <div key={unit}>
          <strong>{String(count[unit]).padStart(2, '0')}</strong>
          <span>{unit}</span>
        </div>
      ))}
    </div>
  );
}

export default function DemoInvitation({
  wedding,
  preview = false,
  unavailable = false,
}) {
  const router = useRouter();
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const openingTimer = useRef(null);
  useEffect(() => () => window.clearTimeout(openingTimer.current), []);
  const audio = useWeddingAudio(weddingData.audio);
  const couple = wedding?.couple;
  const groom = couple?.groomName || weddingData.couple.groom;
  const bride = couple?.brideName || weddingData.couple.bride;
  const event = wedding?.walima;
  const date = event?.displayDate || 'The date of our celebration';

  const open = () => {
    if (opening || opened) return;
    setOpening(true);
    audio.play();
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    openingTimer.current = window.setTimeout(
      () => {
        setOpened(true);
        window.scrollTo({ top: 0, behavior: 'instant' });
      },
      reduced ? 0 : 4600,
    );
  };

  if (unavailable)
    return (
      <main className="demo-loading">
        <Ornament />
        <h1>A little patience, a little anticipation.</h1>
        <p>Our celebration details are temporarily unavailable.</p>
        <button className="demo-button" onClick={() => router.refresh()}>
          Try again
        </button>
      </main>
    );

  return (
    <main className={`demo-invitation ${opened ? 'is-open' : ''}`}>
      {preview && (
        <aside className="demo-preview">
          Design preview · Event details appear when the existing wedding
          database is connected.
        </aside>
      )}
      <button
        className="demo-audio"
        aria-label={audio.isPlaying ? 'Mute music' : 'Play music'}
        aria-pressed={audio.isPlaying}
        onClick={audio.toggle}>
        {audio.isPlaying ? (
          <FiVolume2 aria-hidden="true" />
        ) : (
          <FiVolumeX aria-hidden="true" />
        )}
      </button>
      {!opened && (
        <section
          className={`demo-envelope-screen ${opening ? 'is-opening' : ''}`}
          aria-label="Invitation envelope">
          <div
            className="demo-paper-layer demo-paper-left"
            aria-hidden="true"
          />
          <div
            className="demo-paper-layer demo-paper-right"
            aria-hidden="true"
          />
          <div
            className="demo-paper-layer demo-paper-bottom"
            aria-hidden="true"
          />
          <div className="demo-paper-layer demo-paper-top" aria-hidden="true" />
          <button
            className="demo-opening-seal"
            onClick={open}
            disabled={opening}
            aria-label="Open invitation envelope">
            <span className="demo-reference-seal" aria-hidden="true" />
            <span className="demo-opening-prompt">
              {opening ? 'Opening your invitation…' : 'Tap to open'}
            </span>
          </button>
          <div className="demo-opening-ornament">
            <Ornament />
          </div>
        </section>
      )}
      {(opened || opening) && (
        <section className="demo-welcome" aria-label="Wedding welcome">
          <div className="demo-art" aria-hidden="true" />
          <div className="demo-welcome-content">
            <p className="demo-eyebrow">Together with our families</p>
            <h1>
              <span>{groom}</span>
              <i>&amp;</i>
              <span>{bride}</span>
            </h1>
            <Ornament />
            <p className="demo-welcome-note">
              Two hearts. One beautiful beginning.
            </p>
            <p className="demo-welcome-date">{date}</p>
            <a className="demo-scroll" href="#demo-blessing">
              Our celebration <span>↓</span>
            </a>
          </div>
          <div className="demo-welcome-bottom">
            A celebration of love &amp; togetherness
          </div>
        </section>
      )}

      {opened && (
        <div className="demo-details">
          <section className="demo-blessing demo-section" id="demo-blessing">
            <span className="demo-eyebrow">In the name of Allah</span>
            <p className="demo-arabic" lang="ar" dir="rtl">
              بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
            <Ornament />
            <h2>
              Some moments are sweeter
              <br />
              <em>when shared.</em>
            </h2>
            <p className="demo-body">
              With hearts full of gratitude and the blessings of Allah, we
              warmly invite you to our Walima reception.
            </p>
            <p className="demo-body">
              Your presence, love, and duas would make our celebration complete.
            </p>
            <div className="demo-family">
              <div>
                <span>With the blessings of</span>
                <h3>{couple?.groomFather || 'The groom’s family'}</h3>
                <p>Family of {groom}</p>
              </div>
              <span className="demo-family-join" aria-hidden="true">
                &amp;
              </span>
              <div>
                <span>With the blessings of</span>
                <h3>{couple?.brideFather || 'The bride’s family'}</h3>
                <p>Family of {bride}</p>
              </div>
            </div>
          </section>

          <section className="demo-quote demo-section">
            <span className="demo-quote-mark" aria-hidden="true">
              “
            </span>
            <h2>
              And He placed between you
              <br />
              <em>affection and mercy.</em>
            </h2>
            <p className="demo-eyebrow">Surah Ar-Rum · 30:21</p>
            <Ornament />
          </section>

          <DemoEventDetails event={event} />

          <footer className="demo-closing demo-section">
            <Ornament />
            <p className="demo-eyebrow">Until we celebrate together</p>
            <h2>
              Come for the celebration.
              <br />
              <em>Stay for the memories.</em>
            </h2>
            <p className="demo-body">With love and duas,</p>
            <p className="demo-signature">
              {groom} <i>&amp;</i> {bride}
            </p>
            <p className="demo-footer-note">Made for a beautiful beginning</p>
          </footer>
        </div>
      )}
    </main>
  );
}

export function DemoEventDetails({ event }) {
  const venue = event?.venue;
  const map = venue?.googleMapsUrl || event?.googleMapsUrl;
  const safeMap = map && /^https?:\/\//.test(map) ? map : null;
  const date = event?.displayDate || 'The date of our celebration';
  const time = event?.displayTime || event?.time;
  const venueName = venue?.name || event?.venueName;
  const address = venue?.address || event?.venueAddress;
  const mapQuery = [venueName, address].filter(Boolean).join(', ');

  return (
    <section className="demo-celebration demo-section">
      <span className="demo-eyebrow">A day to remember</span>
      <h2>
        Let the celebration <em>begin.</em>
      </h2>
      {event?.countdownTarget ? (
        <Countdown target={event.countdownTarget} />
      ) : (
        <>
          <div
            className="demo-countdown"
            aria-label="Countdown awaiting event date">
            {['days', 'hours', 'minutes', 'seconds'].map(unit => (
              <div key={unit}>
                <strong>—</strong>
                <span>{unit}</span>
              </div>
            ))}
          </div>
          <p className="demo-body">
            The countdown begins when the celebration time is confirmed.
          </p>
        </>
      )}
      <div className="demo-event-card">
        <div className="demo-event-icon" aria-hidden="true">
          ✧
        </div>
        <span className="demo-eyebrow">The pleasure of your company</span>
        <h3>Walima Reception</h3>
        <Ornament />
        <p className="demo-event-date">{date}</p>
        <p className="demo-event-time">{time || 'Time to be announced'}</p>
        <div className="demo-event-rule" />
        <p className="demo-venue-name">
          {venue?.name || event?.venueName || 'Our celebration venue'}
        </p>
        <p className="demo-address">
          {venue?.address ||
            event?.venueAddress ||
            'Venue details will be shared here.'}
        </p>
        {safeMap && (
          <a
            className="demo-button"
            href={safeMap}
            target="_blank"
            rel="noopener noreferrer">
            Find your way <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
      <div className="demo-location">
        <Ornament />
        <h3>Meet us here</h3>
        {mapQuery ? (
          <iframe
            title={`Map to ${venueName || 'the reception venue'}`}
            src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <div className="demo-map-placeholder">
            <span aria-hidden="true">⌖</span>
            <p>
              The venue map will appear here
              <br />
              when the saved location is available.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
