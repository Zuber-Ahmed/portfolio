export default function PersonalizedEnvelope({
  recipient,
  wedding,
  phase,
  onOpen,
}) {
  const opening = phase === 'opening';
  const handleKeyDown = event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen();
    }
  };

  return (
    <section
      className={`wedding-envelope-overlay wedding-v2-envelope ${opening ? 'is-opening' : ''}`}>
      <div className="wedding-frame wedding-frame-outer" />
      <div className="wedding-frame wedding-frame-inner" />
      <header className="wedding-envelope-heading">
        <span>A Sacred Royal Union</span>
        <h1>
          {wedding.couple.groom} &amp; {wedding.couple.bride}
        </h1>
        <div className="wedding-v2-envelope-recipient">
          <small>A Special Invitation For</small>
          <strong>{recipient.displayName}</strong>
        </div>
      </header>

      <div className="wedding-envelope-stage">
        <div
          className="wedding-envelope-action"
          role="button"
          tabIndex={opening ? -1 : 0}
          aria-label={`Open wedding invitation for ${recipient.displayName}`}
          aria-disabled={opening}
          onClick={onOpen}
          onKeyDown={handleKeyDown}>
          <div className="wedding-envelope">
            <div className="wedding-envelope-stitch" />
            <div className="wedding-envelope-card wedding-v2-envelope-card">
              <small>A Special Invitation For</small>
              <strong>{recipient.displayName}</strong>
              <span>Prepared with love and duas</span>
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
              {/* <span>Meetland</span><strong>Z &amp; B</strong><small>Meethaq</small> */}
            </div>
          </div>
        </div>
        <button
          type="button"
          className="wedding-open-button"
          onClick={onOpen}
          disabled={opening}>
          <span aria-hidden="true">✦</span> Open Invitation
        </button>
        <p className="wedding-envelope-hint">
          Tap the envelope or press Enter to open
        </p>
      </div>
    </section>
  );
}
