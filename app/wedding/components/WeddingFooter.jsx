export default function WeddingFooter({ onReplay, onVisitPortfolio }) {
  return (
    <footer className="wedding-footer">
      <p className="wedding-arabic" dir="rtl">
        بَارَكَ اللَّهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي
        خَيْرٍ
      </p>
      <p className="wedding-translation">
        “May Allah bless for you, and shower His blessings upon you, and join
        you both together in goodness.”
      </p>
      <small>With warm prayers · The Groom &amp; Bride Families</small>
      <div className="wedding-footer-actions">
        <button type="button" onClick={onReplay}>
          Replay Royal Envelope &amp; Flower Shower
        </button>
        <button
          type="button"
          className="wedding-portfolio-link"
          onClick={onVisitPortfolio}>
          Visit Portfolio
        </button>
      </div>
    </footer>
  );
}
