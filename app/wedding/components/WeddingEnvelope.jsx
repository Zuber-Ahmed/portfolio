export default function WeddingEnvelope({ data, phase, onOpen }) {
  const isOpening = phase === 'opening';

  const handleKeyDown = event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen();
    }
  };

  return (
    <section
      className={`wedding-envelope-overlay ${isOpening ? 'is-opening' : ''}`}
      aria-label="Wedding invitation envelope">
      <div className="wedding-frame wedding-frame-outer" />
      <div className="wedding-frame wedding-frame-inner" />

      <header className="wedding-envelope-heading">
        <span>A Sacred Royal Union</span>
        <h1>
          {data.couple.groom} &amp; {data.couple.bride}
        </h1>
        <p>Cordially Request Your Presence</p>
      </header>

      <div className="wedding-envelope-stage">
        <div
          className="wedding-envelope-action"
          role="button"
          tabIndex={phase === 'closed' ? 0 : -1}
          aria-label="Open royal wedding invitation"
          aria-disabled={isOpening}
          onClick={onOpen}
          onKeyDown={handleKeyDown}>
          <div className="wedding-envelope">
            <div className="wedding-envelope-stitch" />
            <div className="wedding-envelope-card">
              <p className="wedding-arabic" dir="rtl">
                بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </p>
              <em>Qabool Hai</em>
              <strong>
                {data.couple.groom} &amp; {data.couple.bride}
              </strong>
              <small>{data.nikah.displayDate}</small>
            </div>
            <div className="wedding-envelope-pocket" aria-hidden="true">
              <svg viewBox="0 0 400 275" preserveAspectRatio="none">
                <polygon fill="#f5ede3" points="0,0 200,140 0,275" />
                <polygon fill="#efe6dc" points="400,0 200,140 400,275" />
                <polygon
                  fill="#f8f2eb"
                  points="0,275 200,130 400,275"
                  stroke="#e8dcce"
                />
              </svg>
            </div>
            <div className="wedding-envelope-flap" aria-hidden="true">
              <svg viewBox="0 0 400 145" preserveAspectRatio="none">
                <polygon
                  fill="#fdfbf7"
                  points="0,0 200,140 400,0"
                  stroke="#e0d1be"
                />
              </svg>
            </div>
            <div className="wedding-wax-seal" aria-hidden="true">
              {/* <span>Meetland</span> */}
              <strong>
                {data.couple.groom[0]} &amp; {data.couple.bride[0]}
              </strong>
              {/* <small>MEETHAQ</small> */}
            </div>
          </div>
        </div>

        <button
          className="wedding-open-button"
          type="button"
          onClick={onOpen}
          disabled={isOpening}>
          <span aria-hidden="true">↓</span>
          Open Royal Invitation
          <span aria-hidden="true">✦</span>
        </button>
        <p className="wedding-envelope-hint">
          Tap the envelope or wax seal to unveil
        </p>
      </div>
    </section>
  );
}
