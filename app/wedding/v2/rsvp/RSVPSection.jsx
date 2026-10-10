import { useState } from 'react';

import { useRSVP } from '../hooks/useRSVP';
import EventRSVP from './EventRSVP';
import RSVPConfirmation from './RSVPConfirmation';

export default function RSVPSection({ token, invitation }) {
  const eventNames = Object.keys(invitation.events);
  const { rsvp, status, error, submit, edit } = useRSVP(token, invitation.rsvp);
  const [responses, setResponses] = useState(() => ({ ...invitation.rsvp }));
  const family = invitation.recipient.recipientType === 'family';
  const complete = eventNames.every(eventName => responses[eventName]);

  if (status === 'success')
    return <RSVPConfirmation rsvp={rsvp} onEdit={edit} />;

  return (
    <section className="wedding-v2-rsvp">
      <span className="wedding-v2-kicker">Your Response</span>
      <h2>
        {family
          ? 'Will you and your family be joining us?'
          : 'Will you be joining us?'}
      </h2>
      <p>Your gracious response would mean a lot to us.</p>
      <form
        onSubmit={event => {
          event.preventDefault();
          submit(responses);
        }}>
        {eventNames.map(eventName => (
          <EventRSVP
            key={eventName}
            eventName={eventName}
            recipientType={invitation.recipient.recipientType}
            value={responses[eventName]}
            onChange={value =>
              setResponses(current => ({ ...current, [eventName]: value }))
            }
            showHeading={eventNames.length > 1}
          />
        ))}
        {error && (
          <p className="wedding-v2-form-error" role="alert">
            {"We couldn't save your response. Please try again."}
          </p>
        )}
        <button
          type="submit"
          className="wedding-v2-primary"
          disabled={!complete || status === 'submitting'}>
          {status === 'submitting' ? 'Confirming...' : 'Confirm Response'}
        </button>
      </form>
    </section>
  );
}
