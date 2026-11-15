export default function ReceptionUnavailable({ error, onRetry }) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const missingStorage = error?.code === 'WEDDING_STORAGE_NOT_CONFIGURED';

  return (
    <main className="wedding-v2-state">
      <p className="wedding-v2-kicker">Walima Reception</p>
      <h1>Reception details unavailable</h1>
      <p>
        {isDevelopment && missingStorage
          ? 'Local wedding storage is not configured. Set WEDDING_TABLE_NAME and AWS_REGION in .env.local, configure your AWS credentials, then restart the development server.'
          : 'The reception details are temporarily unavailable. Please try again shortly.'}
      </p>
      {isDevelopment && !missingStorage && error?.message && (
        <p>{error.message}</p>
      )}
      <button type="button" className="wedding-v2-primary" onClick={onRetry}>
        Try Again
      </button>
    </main>
  );
}
