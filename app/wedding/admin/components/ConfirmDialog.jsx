import { FiAlertTriangle, FiX } from 'react-icons/fi';

export default function ConfirmDialog({ guest, busy, onCancel, onConfirm }) {
  return (
    <div className="admin-modal-backdrop" role="presentation">
      <section
        className="admin-modal admin-confirm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-title">
        <button
          className="admin-modal-close"
          type="button"
          aria-label="Close"
          onClick={onCancel}>
          <FiX />
        </button>
        <div className="admin-warning-icon">
          <FiAlertTriangle />
        </div>
        <h2 id="delete-title">Delete Invitation?</h2>
        <p>
          Are you sure you want to delete the invitation for{' '}
          <strong>{guest.displayName}</strong>?
        </p>
        <div className="admin-modal-actions">
          <button
            className="admin-secondary-button"
            type="button"
            onClick={onCancel}>
            Cancel
          </button>
          <button
            className="admin-danger-button"
            type="button"
            disabled={busy}
            onClick={onConfirm}>
            {busy ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </section>
    </div>
  );
}
