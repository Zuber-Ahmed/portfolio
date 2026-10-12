export default function RsvpStatus({ invitation }) {
  const events = [
    invitation.nikah && 'nikah',
    invitation.walima && 'walima',
  ].filter(Boolean);
  return (
    <div className="admin-rsvp-list">
      {events.map(eventName => {
        const status = invitation.rsvp[eventName] || 'pending';
        return (
          <span key={eventName} className={`admin-status ${status}`}>
            <small>{events.length > 1 ? eventName[0].toUpperCase() : ''}</small>
            {status[0].toUpperCase() + status.slice(1)}
          </span>
        );
      })}
    </div>
  );
}
