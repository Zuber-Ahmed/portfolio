import { useState } from 'react';
import { FiCheck, FiCopy, FiX } from 'react-icons/fi';

const emptyGuest = {
  displayName: '',
  recipientType: 'individual',
  nikah: true,
  walima: false,
};

export default function GuestDialog({
  guest,
  busy,
  error,
  created,
  onClose,
  onSubmit,
  onCopy,
}) {
  const [form, setForm] = useState(() =>
    guest
      ? {
          displayName: guest.displayName,
          recipientType: guest.recipientType,
          nikah: guest.nikah,
          walima: guest.walima,
        }
      : emptyGuest,
  );

  if (created) {
    return (
      <div className="admin-modal-backdrop" role="presentation">
        <section
          className="admin-modal admin-success-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="guest-created-title">
          <div className="admin-success-icon">
            <FiCheck />
          </div>
          <h2 id="guest-created-title">Invitation Created</h2>
          <strong>{created.displayName}</strong>
          <p>
            {created.nikah && created.walima
              ? 'Nikah & Walima'
              : created.nikah
                ? 'Nikah'
                : 'Walima'}
          </p>
          <div className="admin-link-box">{created.invitationUrl}</div>
          <button
            className="admin-primary-button wide"
            type="button"
            onClick={() => onCopy(created.invitationUrl)}>
            <FiCopy /> Copy Invitation Link
          </button>
          <button
            className="admin-secondary-button wide"
            type="button"
            onClick={onClose}>
            Done
          </button>
        </section>
      </div>
    );
  }

  const submit = event => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="admin-modal-backdrop" role="presentation">
      <section
        className="admin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-form-title">
        <button
          className="admin-modal-close"
          type="button"
          aria-label="Close"
          onClick={onClose}>
          <FiX />
        </button>
        <p className="admin-kicker">
          {guest ? 'Edit Guest' : 'New Invitation'}
        </p>
        <h2 id="guest-form-title">{guest ? 'Edit Guest' : 'Add Guest'}</h2>
        <p>
          {guest
            ? 'Update guest details without changing their invitation link.'
            : 'Create a secure personalized invitation.'}
        </p>
        {error && <div className="admin-alert error">{error}</div>}
        <form onSubmit={submit}>
          <label>
            Guest Name
            <input
              value={form.displayName}
              onChange={event =>
                setForm({ ...form, displayName: event.target.value })
              }
              autoFocus
              required
            />
          </label>
          <fieldset>
            <legend>Recipient Type</legend>
            <div className="admin-segmented">
              <button
                type="button"
                className={form.recipientType === 'individual' ? 'active' : ''}
                onClick={() =>
                  setForm({ ...form, recipientType: 'individual' })
                }>
                Individual
              </button>
              <button
                type="button"
                className={form.recipientType === 'family' ? 'active' : ''}
                onClick={() => setForm({ ...form, recipientType: 'family' })}>
                Family
              </button>
            </div>
          </fieldset>
          <fieldset>
            <legend>Invite To</legend>
            <div className="admin-event-checks">
              <label>
                <input
                  type="checkbox"
                  checked={form.nikah}
                  onChange={event =>
                    setForm({ ...form, nikah: event.target.checked })
                  }
                />
                <span>
                  <strong>Nikah</strong>
                </span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.walima}
                  onChange={event =>
                    setForm({ ...form, walima: event.target.checked })
                  }
                />
                <span>
                  <strong>Walima</strong>
                </span>
              </label>
            </div>
          </fieldset>
          {!form.nikah && !form.walima && (
            <p className="admin-field-error">Select at least one event.</p>
          )}
          <div className="admin-modal-actions">
            <button
              className="admin-secondary-button"
              type="button"
              onClick={onClose}>
              Cancel
            </button>
            <button
              className="admin-primary-button"
              type="submit"
              disabled={busy || (!form.nikah && !form.walima)}>
              {busy
                ? 'Saving...'
                : guest
                  ? 'Save Changes'
                  : 'Create Invitation'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
