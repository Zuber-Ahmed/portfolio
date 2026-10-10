export default function IslamicOpening({ showVerse = true }) {
  return (
    <>
      <section className="wedding-bismillah">
        <div className="wedding-ornament" aria-hidden="true">
          <span />✦<span />
        </div>
        <p className="wedding-arabic wedding-bismillah-text" dir="rtl">
          بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
        <p className="wedding-translation">
          “In the name of Allah, the Most Gracious, the Most Merciful”
        </p>
      </section>

      {showVerse && (
        <section className="wedding-verse">
          <span className="wedding-quote-mark" aria-hidden="true">
            “
          </span>
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
        </section>
      )}
    </>
  );
}
