export default function WeddingAudio({ audio }) {
  const label = !audio.isAvailable
    ? 'Music unavailable'
    : audio.isPlaying
      ? '🎶'
      : '🔇';

  return (
    <button
      type="button"
      className={`wedding-pill wedding-audio ${audio.isPlaying ? 'is-playing' : ''}`}
      onClick={audio.toggle}
      disabled={!audio.isAvailable}
      aria-label={
        audio.isPlaying ? 'Pause background music' : 'Play background music'
      }
      title={
        !audio.isAvailable
          ? 'Music will be available when the final track is added'
          : undefined
      }>
      <span>{label}</span>
    </button>
  );
}
