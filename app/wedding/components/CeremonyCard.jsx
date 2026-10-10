export default function CeremonyCard({ eyebrow, title, event, tone }) {
  return (
    <article className={`wedding-ceremony-card ${tone}`}>
      <span className="wedding-ceremony-eyebrow">
        <i />
        {eyebrow}
      </span>
      <h3>{title}</h3>
      <time dateTime={event.date}>{event.displayDate}</time>
      <div className="wedding-ceremony-details">
        <p>
          <strong>Time</strong>
          {event.time}
        </p>
        <p>
          <strong>Venue</strong>
          {event.venue.name}
        </p>
        <small>{event.venue.address}</small>
      </div>
      {event.venue.googleMapsUrl ? (
        <a
          href={event.venue.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer">
          Get Directions
        </a>
      ) : (
        <span className="wedding-location-pending" aria-disabled="true">
          Location Coming Soon
        </span>
      )}
    </article>
  );
}
