import './wedding-maintenance.css';

import { useEffect } from 'react';

export default function WeddingMaintenance() {
  useEffect(() => {
    document.title = "We'll Be Back Soon | Zuber Ahmed";
  }, []);

  return (
    <main className="wedding-maintenance">
      <svg
        className="wedding-maintenance-watermark"
        viewBox="0 0 400 400"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
        aria-hidden="true"
        focusable="false">
        <circle cx="200" cy="200" r="190" strokeDasharray="2 4" />
        <circle cx="200" cy="200" r="150" />
        <circle cx="200" cy="200" r="110" />
        <path d="M200 10 242 158 390 200 242 242 200 390 158 242 10 200 158 158Z" />
        <rect x="70" y="70" width="260" height="260" />
        <rect
          x="70"
          y="70"
          width="260"
          height="260"
          transform="rotate(45 200 200)"
        />
        <circle cx="200" cy="200" r="70" strokeDasharray="1 3" />
      </svg>
      <section
        className="wedding-maintenance-card"
        aria-labelledby="maintenance-title">
        <div className="wedding-maintenance-content">
          <svg
            className="wedding-maintenance-medallion"
            viewBox="0 0 120 120"
            fill="none"
            aria-hidden="true"
            focusable="false">
            <path
              d="m60 5 16 16 23 0 0 23 16 16-16 16 0 23-23 0-16 16-16-16-23 0 0-23L5 60l16-16 0-23 23 0Z"
              fill="#143628"
            />
            <path
              d="m60 13 14 15h18v18l15 14-15 14v18H74l-14 15-14-15H28V74L13 60l15-14V28h18Z"
              stroke="#b49355"
            />
            <rect x="37" y="37" width="46" height="46" stroke="#b49355" />
            <rect
              x="37"
              y="37"
              width="46"
              height="46"
              transform="rotate(45 60 60)"
              stroke="#b49355"
            />
            <path
              d="m60 40 6 14 14 6-14 6-6 14-6-14-14-6 14-6Z"
              stroke="#e0c298"
            />
            <circle cx="60" cy="60" r="3" fill="#e0c298" />
          </svg>
          <div className="wedding-maintenance-kicker">
            <span aria-hidden="true" />
            <p>Temporary Notice</p>
            <span aria-hidden="true" />
          </div>
          <h1 id="maintenance-title">We&rsquo;ll Be Back Soon</h1>
          <div className="wedding-maintenance-rule" aria-hidden="true" />
          <p className="wedding-maintenance-message">
            This website is temporarily unavailable as we&rsquo;re celebrating a
            special family wedding event.
          </p>
          <p className="wedding-maintenance-thanks">
            Thank you for your patience, kind wishes, and duas.
          </p>
          <p className="wedding-maintenance-closing">
            The portfolio will be back soon, Insha&rsquo;Allah.
          </p>
          <div className="wedding-maintenance-finial" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>
    </main>
  );
}
