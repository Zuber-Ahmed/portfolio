import { useCountdown } from '../../hooks/useCountdown';

export default function WeddingCountdown({ targetDate }) {
  const countdown = useCountdown(targetDate);
  const units = [
    ['Days', countdown.days],
    ['Hours', countdown.hours],
    ['Minutes', countdown.minutes],
    ['Seconds', countdown.seconds],
  ];

  return (
    <section className="wedding-countdown" aria-live="off">
      <h2>
        {countdown.complete
          ? 'The Blessed Day Has Arrived'
          : 'Counting Down to the Blessed Moment'}
      </h2>
      <div className="wedding-countdown-grid">
        {units.map(([label, value]) => (
          <div key={label}>
            <strong>{String(value).padStart(2, '0')}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
