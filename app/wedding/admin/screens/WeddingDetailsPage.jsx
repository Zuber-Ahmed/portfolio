import { useCallback, useEffect, useState } from 'react';
import {
  FiCalendar,
  FiCheckCircle,
  FiMapPin,
  FiSave,
  FiUsers,
} from 'react-icons/fi';

import { getWedding, updateWedding } from '@/app/services/wedding/adminService';

import EventDetails from '../components/EventDetails';

export default function WeddingDetailsPage({ onSessionExpired }) {
  const [wedding, setWedding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await getWedding();
      setWedding(result.wedding);
      setError('');
    } catch (requestError) {
      if (requestError.status === 401 || requestError.status === 403)
        onSessionExpired();
      else setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [onSessionExpired]);

  useEffect(() => {
    load();
  }, [load]);

  const changeCouple = (field, value) =>
    setWedding(current => ({
      ...current,
      couple: { ...current.couple, [field]: value },
    }));
  const changeEvent = (eventName, updates) =>
    setWedding(current => ({
      ...current,
      [eventName]: { ...current[eventName], ...updates },
    }));

  const submit = async event => {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const result = await updateWedding(wedding);
      setWedding(result.wedding);
      setSaved(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (requestError) {
      if (requestError.status === 401 || requestError.status === 403)
        onSessionExpired();
      else setError(requestError.details?.join?.(' ') || requestError.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <main className="admin-main">
        <div className="admin-empty">Loading wedding details...</div>
      </main>
    );

  return (
    <main className="admin-main admin-details-page">
      {saved && (
        <div className="admin-save-banner">
          <FiCheckCircle /> Wedding details updated successfully. Public
          invitations now reflect these changes.
          <button type="button" onClick={() => setSaved(false)}>
            Dismiss
          </button>
        </div>
      )}
      <section className="admin-page-heading">
        <div>
          <p className="admin-kicker">Public Invitation</p>
          <h1>Wedding Details</h1>
          <p>
            Update the names, ceremony dates, display times, and venue
            information shown to guests.
          </p>
        </div>
      </section>
      {error && <div className="admin-alert error">{error}</div>}
      {wedding && (
        <form className="admin-details-form" onSubmit={submit}>
          <section className="admin-form-section">
            <header>
              <span>
                <FiUsers />
              </span>
              <div>
                <p className="admin-kicker">Couple</p>
                <h2>Names &amp; Family</h2>
              </div>
            </header>
            <div className="admin-form-grid">
              <label>
                Groom Name
                <input
                  value={wedding.couple.groomName}
                  onChange={event =>
                    changeCouple('groomName', event.target.value)
                  }
                  required
                />
              </label>
              <label>
                Bride Name
                <input
                  value={wedding.couple.brideName}
                  onChange={event =>
                    changeCouple('brideName', event.target.value)
                  }
                  required
                />
              </label>
              <label>
                Groom&apos;s Father
                <input
                  value={wedding.couple.groomFather}
                  onChange={event =>
                    changeCouple('groomFather', event.target.value)
                  }
                  required
                />
              </label>
              <label>
                Bride&apos;s Father
                <input
                  value={wedding.couple.brideFather}
                  onChange={event =>
                    changeCouple('brideFather', event.target.value)
                  }
                  required
                />
              </label>
            </div>
          </section>
          <EventDetails
            eventName="nikah"
            title="Nikah"
            data={wedding.nikah}
            onChange={changeEvent}
            icon={<FiCalendar />}
          />
          <EventDetails
            eventName="walima"
            title="Walima"
            data={wedding.walima}
            onChange={changeEvent}
            icon={<FiMapPin />}
          />
          <div className="admin-save-actions">
            <p>
              Empty venue fields display “Location Coming Soon” on the public
              invitation.
            </p>
            <button
              className="admin-primary-button"
              type="submit"
              disabled={saving}>
              <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
