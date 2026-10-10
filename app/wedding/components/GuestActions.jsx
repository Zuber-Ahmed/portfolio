import { createInvitationMessage } from '../data/weddingData';

export default function GuestActions({ data }) {
  const invitationUrl =
    typeof window === 'undefined'
      ? ''
      : `${window.location.origin}${window.location.pathname}`;
  const message = createInvitationMessage(invitationUrl, data);
  const whatsappUrl = data.whatsapp.rsvpPhoneNumber
    ? `https://wa.me/${data.whatsapp.rsvpPhoneNumber}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  const shareInvitation = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data.couple.groom} & ${data.couple.bride} | Wedding Invitation`,
          text: message,
          url: invitationUrl,
        });
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="wedding-guest-actions" aria-label="Invitation actions">
      <button
        type="button"
        className="wedding-action secondary"
        disabled
        title="Venue locations will be shared soon">
        <span aria-hidden="true">⌖</span> Location Coming Soon
      </button>
      <a
        className="wedding-action whatsapp"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer">
        <span aria-hidden="true">◉</span> Share on WhatsApp
      </a>
      <button
        type="button"
        className="wedding-action secondary"
        onClick={shareInvitation}>
        <span aria-hidden="true">↗</span> Share Invitation
      </button>
    </section>
  );
}
