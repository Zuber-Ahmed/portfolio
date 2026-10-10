export default function InvalidInvitation({ temporary = false, onRetry }) {
  return (
    <main className="wedding-v2-state">
      <div className="wedding-v2-monogram" aria-hidden="true">
        Z &amp; B
      </div>
      <p className="wedding-v2-kicker">Zuber &amp; Bisma</p>
      <h1>{temporary ? 'A Moment, Please' : 'Invitation Not Found'}</h1>
      <p>
        {temporary
          ? "We're having a little trouble opening your invitation. Please try again in a moment."
          : 'This invitation link may be incomplete or no longer available. Please contact the family for the correct invitation.'}
      </p>
      {temporary && (
        <button type="button" className="wedding-v2-primary" onClick={onRetry}>
          Try Again
        </button>
      )}
    </main>
  );
}
