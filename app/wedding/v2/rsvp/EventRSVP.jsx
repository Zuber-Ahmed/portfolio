const choices = [
  {
    value: 'attending',
    individual: "In Sha Allah, I'll be there",
    family: "In Sha Allah, we'll be there",
  },
  {
    value: 'declined',
    individual: "Regretfully, I won't be able to attend",
    family: "Regretfully, we won't be able to attend",
  },
];

export default function EventRSVP({
  eventName,
  recipientType,
  value,
  onChange,
  showHeading,
}) {
  return (
    <fieldset className="wedding-v2-event-rsvp">
      {showHeading && <legend>{eventName}</legend>}
      {choices.map(choice => (
        <label key={choice.value}>
          <input
            type="radio"
            name={`rsvp-${eventName}`}
            value={choice.value}
            checked={value === choice.value}
            onChange={() => onChange(choice.value)}
          />
          <span>{choice[recipientType]}</span>
        </label>
      ))}
    </fieldset>
  );
}
