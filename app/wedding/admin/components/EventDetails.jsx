import { useRef, useState } from 'react';
import { FiCalendar } from 'react-icons/fi';

import {
  eventDateTimeValue,
  eventScheduleFields,
  eventUtcOffset,
} from '@/app/utils/wedding/dateTime';

export default function EventDetails({
  eventName,
  title,
  data,
  onChange,
  icon,
}) {
  const dateInput = useRef(null);
  const [offset] = useState(() =>
    eventUtcOffset(data.countdownTarget, -new Date().getTimezoneOffset()),
  );
  const value = eventDateTimeValue(data);
  const openCalendar = () => {
    try {
      dateInput.current?.showPicker?.();
    } catch {
      dateInput.current?.focus();
    }
  };

  return (
    <section className="admin-form-section">
      <header>
        <span>{icon}</span>
        <div>
          <p className="admin-kicker">Ceremony</p>
          <h2>{title}</h2>
        </div>
      </header>
      <div className="admin-form-grid">
        <div className="admin-schedule-field">
          <label htmlFor={`${eventName}-date-time`}>
            Ceremony date and time
          </label>
          <div className="admin-date-picker">
            <input
              ref={dateInput}
              id={`${eventName}-date-time`}
              type="datetime-local"
              value={value}
              onClick={openCalendar}
              onChange={event =>
                onChange(
                  eventName,
                  eventScheduleFields(event.target.value, offset),
                )
              }
              required
            />
            <button
              type="button"
              aria-label={`Open ${title} calendar`}
              onClick={openCalendar}>
              <FiCalendar />
            </button>
          </div>
          <small>Sets the ceremony date, time, and invitation countdown.</small>
        </div>
        <label className="full">
          Venue Name
          <input
            value={data.venueName || ''}
            onChange={event =>
              onChange(eventName, { venueName: event.target.value })
            }
            placeholder="Location Coming Soon"
          />
        </label>
        <label className="full">
          Venue Address
          <input
            value={data.venueAddress || ''}
            onChange={event =>
              onChange(eventName, { venueAddress: event.target.value })
            }
            placeholder="Leave empty until finalized"
          />
        </label>
        <label className="full">
          Google Maps URL
          <input
            type="url"
            value={data.googleMapsUrl || ''}
            onChange={event =>
              onChange(eventName, { googleMapsUrl: event.target.value })
            }
            placeholder="https://maps.google.com/..."
          />
        </label>
      </div>
    </section>
  );
}
