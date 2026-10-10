import Image from 'next/image';

import CeremonyCard from './CeremonyCard';
import FamilyDetails from './FamilyDetails';
import GuestActions from './GuestActions';
import IslamicOpening from './IslamicOpening';
import WeddingCountdown from './WeddingCountdown';
import WeddingFooter from './WeddingFooter';

export default function WeddingInvitation({
  data,
  artworkFailed,
  onArtworkError,
  onPetalShower,
  onReplay,
  onVisitPortfolio,
}) {
  return (
    <main className="wedding-invitation">
      <article className="wedding-hero-card">
        <div
          className={`wedding-hero-art ${artworkFailed ? 'image-failed' : ''}`}>
          {!artworkFailed && (
            <div className="relative h-full min-h-80">
              <Image
                src={data.artwork.hero}
                alt={`${data.couple.groom} and ${data.couple.bride} royal Islamic wedding invitation artwork`}
                onError={onArtworkError}
                unoptimized
                fill
              />
            </div>
          )}
          <div className="wedding-hero-names">
            <h2>{data.couple.groom}</h2>
            <span>&amp;</span>
            <h2>{data.couple.bride}</h2>
            <i />
            <p>“Are Saying Qabool Hai”</p>
          </div>
        </div>
        <div className="wedding-hero-welcome">
          <span>Together with their families</span>
          <h1>
            {data.couple.groom} &amp; {data.couple.bride}
          </h1>
          <p>“Are Saying Qabool Hai”</p>
          <i />
          <time dateTime={data.nikah.date}>{data.nikah.displayDate}</time>
          <div className="wedding-hero-actions">
            <a href="#invitation-details">
              View Celebration Details <b aria-hidden="true">↓</b>
            </a>
            <button type="button" onClick={onPetalShower}>
              Shower Petals
            </button>
          </div>
        </div>
      </article>

      <article className="wedding-details" id="invitation-details">
        <IslamicOpening />
        <FamilyDetails data={data} />

        <section className="wedding-presence">
          <h2>The Honour of Your Presence</h2>
          <p>
            Cordially request the pleasure of your company to celebrate the
            auspicious union and solemnization of the Nikah ceremony of their
            beloved children
          </p>
          <strong>{data.couple.groom}</strong>
          <span>&amp;</span>
          <strong>{data.couple.bride}</strong>
        </section>

        {data.nikah.countdownTarget && (
          <WeddingCountdown targetDate={data.nikah.countdownTarget} />
        )}

        <section className="wedding-ceremony-grid">
          <CeremonyCard
            eyebrow="Sacred Solemnization"
            title="Nikah Ceremony"
            event={data.nikah}
            tone="nikah"
          />
          <CeremonyCard
            eyebrow="Joyous Feast"
            title="Walima Reception"
            event={data.walima}
            tone="walima"
          />
        </section>

        <GuestActions data={data} />
        <WeddingFooter
          onReplay={onReplay}
          onVisitPortfolio={onVisitPortfolio}
        />
      </article>
    </main>
  );
}
