export default function RSVPConfirmation({ rsvp, onEdit }) {
  const responses = Object.values(rsvp).filter(Boolean);
  const attending = responses.some(response => response === 'attending');

  return (
    <section className="wedding-v2-rsvp-confirmation" aria-live="polite">
      <span aria-hidden="true">✓</span>
      <h2>JazakAllahu Khairan</h2>
      <p>Your response has been received.</p>
      <p>
        {attending
          ? 'We look forward to celebrating this blessed occasion with you.'
          : 'Thank you for your duas and for being part of our journey.'}
      </p>
      <button type="button" onClick={onEdit}>
        Update Response
      </button>
    </section>
  );
}
