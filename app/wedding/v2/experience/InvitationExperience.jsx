import Image from 'next/image';

import CeremonyCard from '../../components/CeremonyCard';
import FamilyDetails from '../../components/FamilyDetails';
import IslamicOpening from '../../components/IslamicOpening';
import WeddingCountdown from '../../components/WeddingCountdown';
import ChatWidget from '../chat/ChatWidget';
import RSVPSection from '../rsvp/RSVPSection';

function eventTitle(events) {
  if (events.nikah && events.walima) return 'Nikah & Walima';
  return events.nikah ? 'Nikah' : 'Walima';
}

export default function InvitationExperience({
  token,
  invitation,
  wedding,
  onReplay,
  onVisitPortfolio,
}) {
  const { recipient, events } = invitation;
  const primaryEvent = events.nikah || events.walima;

  return (
    <main className="wedding-v2-invitation">
      <section className="wedding-v2-opening-card">
        <IslamicOpening showVerse={false} />
        <div className="wedding-v2-greeting">
          <span>Formal Invitation</span>
          <h1>Dear {recipient.displayName},</h1>
          <p>
            With the blessings of Allah, we request the honour of your presence
            and heartfelt duas as our beloved children unite under the sacred
            covenant of marriage.
          </p>
        </div>
      </section>

      <article className="wedding-v2-couple-hero">
        <div className="relative min-h-80">
          <Image
            src={wedding.artwork.hero}
            alt={`${wedding.couple.groom} and ${wedding.couple.bride} wedding invitation artwork`}
            unoptimized
            fill
          />
        </div>
        <div>
          <span>{eventTitle(events)}</span>
          <h2>
            {wedding.couple.groom} &amp; {wedding.couple.bride}
          </h2>
          <p>Are Saying Qabool Hai</p>
        </div>
      </article>

      <section className="wedding-v2-content-card">
        <div className="wedding-verse">
          <p className="wedding-arabic" dir="rtl">
            وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا
            لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً
          </p>
          <p className="wedding-translation">
            “And among His signs is that He created for you spouses from among
            yourselves that you may find tranquility in them; and He placed
            between you affection and mercy.”
          </p>
          <strong>Surah Ar-Rum [30:21]</strong>
        </div>
        <FamilyDetails data={wedding} />
        {primaryEvent.countdownTarget && (
          <WeddingCountdown targetDate={primaryEvent.countdownTarget} />
        )}
        <section
          className={`wedding-ceremony-grid ${Object.keys(events).length === 1 ? 'single' : ''}`}>
          {events.nikah && (
            <CeremonyCard
              eyebrow="Sacred Solemnization"
              title="Nikah Ceremony"
              event={events.nikah}
              tone="nikah"
            />
          )}
          {events.walima && (
            <CeremonyCard
              eyebrow="Joyous Feast"
              title="Walima Reception"
              event={events.walima}
              tone="walima"
            />
          )}
        </section>
        <div id="invitation-rsvp" tabIndex={-1}>
          <RSVPSection token={token} invitation={invitation} />
        </div>
        <footer className="wedding-v2-closing">
          <p className="wedding-arabic" dir="rtl">
            بَارَكَ اللَّهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا
            فِي خَيْرٍ
          </p>
          <p>
            “May Allah bless for you, and shower His blessings upon you, and
            join you both together in goodness.”
          </p>
          <span>With Love &amp; Duas</span>
          <h2>
            {wedding.couple.groom} &amp; {wedding.couple.bride}
          </h2>
          <div>
            <button type="button" onClick={onReplay}>
              Replay Invitation Ceremony
            </button>
            <button type="button" onClick={onVisitPortfolio}>
              Visit Portfolio
            </button>
          </div>
        </footer>
      </section>
      <ChatWidget key={token} token={token} invitation={invitation} />
    </main>
  );
}
