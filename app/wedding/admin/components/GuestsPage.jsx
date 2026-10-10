import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FiCopy,
  FiEdit2,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiUpload,
  FiUsers,
} from 'react-icons/fi';

import {
  createInvitation,
  deleteInvitation,
  importInvitations,
  listInvitations,
  updateInvitation,
} from '@/app/services/wedding/adminService';

import ConfirmDialog from './ConfirmDialog';
import GuestDialog from './GuestDialog';
import ImportDialog from './ImportDialog';

const PAGE_SIZE = 25;

function invitationLabel(invitation) {
  if (invitation.nikah && invitation.walima) return 'Both';
  return invitation.nikah ? 'Nikah' : 'Walima';
}

function RsvpStatus({ invitation }) {
  const events = [
    invitation.nikah && 'nikah',
    invitation.walima && 'walima',
  ].filter(Boolean);
  return (
    <div className="admin-rsvp-list">
      {events.map(eventName => {
        const status = invitation.rsvp[eventName] || 'pending';
        return (
          <span key={eventName} className={`admin-status ${status}`}>
            <small>{events.length > 1 ? eventName[0].toUpperCase() : ''}</small>
            {status[0].toUpperCase() + status.slice(1)}
          </span>
        );
      })}
    </div>
  );
}

export default function GuestsPage({ onSessionExpired }) {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(null);
  const [showGuestDialog, setShowGuestDialog] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [created, setCreated] = useState(null);
  const [busy, setBusy] = useState(false);
  const [mutationError, setMutationError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    try {
      const result = await listInvitations();
      setInvitations(result.invitations);
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

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query
      ? invitations.filter(invitation =>
          invitation.displayName.toLowerCase().includes(query),
        )
      : invitations;
  }, [invitations, search]);
  const visible = filtered.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE,
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const closeGuestDialog = () => {
    setShowGuestDialog(false);
    setEditing(null);
    setCreated(null);
    setMutationError('');
  };

  const saveGuest = async guest => {
    setBusy(true);
    setMutationError('');
    try {
      if (editing) {
        const result = await updateInvitation(editing.id, guest);
        setInvitations(items =>
          items.map(item =>
            item.id === editing.id ? result.invitation : item,
          ),
        );
        closeGuestDialog();
        setNotice('Guest updated successfully.');
      } else {
        const result = await createInvitation(guest);
        setInvitations(items =>
          [...items, result.invitation].sort((a, b) =>
            a.displayName.localeCompare(b.displayName),
          ),
        );
        setCreated(result.invitation);
      }
    } catch (requestError) {
      setMutationError(
        requestError.details?.flat?.().join(' ') || requestError.message,
      );
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await deleteInvitation(deleting.id);
      setInvitations(items => items.filter(item => item.id !== deleting.id));
      setDeleting(null);
      setNotice('Invitation deleted.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const copyInvitation = async url => {
    if (!url) {
      setNotice('This older invitation has no stored organizer link.');
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setNotice('Invitation link copied.');
    } catch {
      setNotice(
        'Unable to access the clipboard. Select and copy the link manually.',
      );
    }
  };

  const importGuests = async guests => {
    const result = await importInvitations(guests);
    setInvitations(items =>
      [...items, ...result.invitations].sort((a, b) =>
        a.displayName.localeCompare(b.displayName),
      ),
    );
    return result.invitations;
  };

  return (
    <main className="admin-main">
      <section className="admin-summary" aria-label="Invitation totals">
        <article>
          <span>Total Guests</span>
          <strong>{invitations.length}</strong>
          <FiUsers />
        </article>
        <article>
          <span>Nikah</span>
          <strong>{invitations.filter(item => item.nikah).length}</strong>
          <i>N</i>
        </article>
        <article>
          <span>Walima</span>
          <strong>{invitations.filter(item => item.walima).length}</strong>
          <i>W</i>
        </article>
      </section>

      <section className="admin-page-heading">
        <div>
          <p className="admin-kicker">Invitation List</p>
          <h1>Guests</h1>
          <p>Manage guest access, RSVP responses, and invitation links.</p>
        </div>
        <div className="admin-page-actions">
          <label className="admin-search">
            <FiSearch />
            <input
              type="search"
              value={search}
              onChange={event => {
                setSearch(event.target.value);
                setPage(0);
              }}
              placeholder="Search guests..."
            />
          </label>
          <button
            className="admin-secondary-button"
            type="button"
            onClick={() => setShowImport(true)}>
            <FiUpload /> Import Guests
          </button>
          <button
            className="admin-primary-button"
            type="button"
            onClick={() => {
              setEditing(null);
              setShowGuestDialog(true);
            }}>
            <FiPlus /> Add Guest
          </button>
        </div>
      </section>

      {notice && (
        <div className="admin-alert success dismissible">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')}>
            Dismiss
          </button>
        </div>
      )}
      {error && (
        <div className="admin-alert error">
          {error}{' '}
          <button type="button" onClick={load}>
            Try again
          </button>
        </div>
      )}

      <section className="admin-guest-panel">
        {loading ? (
          <div className="admin-empty">Loading guests...</div>
        ) : visible.length === 0 ? (
          <div className="admin-empty">
            {search
              ? 'No guests match your search.'
              : 'No invitations have been created yet.'}
          </div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-guest-table">
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Type</th>
                    <th>Invitation</th>
                    <th>RSVP</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(invitation => (
                    <tr key={invitation.id}>
                      <td>
                        <strong>{invitation.displayName}</strong>
                        <small>
                          {invitation.opened
                            ? `Opened${invitation.openCount > 1 ? ` ${invitation.openCount} times` : ''}`
                            : 'Not opened'}
                        </small>
                      </td>
                      <td>
                        <span className="admin-type-pill">
                          {invitation.recipientType}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin-event-pill ${invitationLabel(invitation).toLowerCase()}`}>
                          {invitationLabel(invitation)}
                        </span>
                      </td>
                      <td>
                        <RsvpStatus invitation={invitation} />
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(invitation);
                              setShowGuestDialog(true);
                            }}>
                            <FiEdit2 /> Edit
                          </button>
                          <button
                            type="button"
                            disabled={!invitation.invitationUrl}
                            onClick={() =>
                              copyInvitation(invitation.invitationUrl)
                            }>
                            <FiCopy /> Copy Link
                          </button>
                          <button
                            className="delete"
                            type="button"
                            onClick={() => setDeleting(invitation)}>
                            <FiTrash2 /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="admin-guest-cards">
              {visible.map(invitation => (
                <article key={invitation.id}>
                  <header>
                    <div>
                      <strong>{invitation.displayName}</strong>
                      <small>
                        {invitation.opened ? 'Opened' : 'Not opened'}
                      </small>
                    </div>
                    <span className="admin-type-pill">
                      {invitation.recipientType}
                    </span>
                  </header>
                  <div className="admin-card-meta">
                    <span
                      className={`admin-event-pill ${invitationLabel(invitation).toLowerCase()}`}>
                      {invitationLabel(invitation)}
                    </span>
                    <RsvpStatus invitation={invitation} />
                  </div>
                  <footer>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(invitation);
                        setShowGuestDialog(true);
                      }}>
                      <FiEdit2 /> Edit
                    </button>
                    <button
                      type="button"
                      disabled={!invitation.invitationUrl}
                      onClick={() => copyInvitation(invitation.invitationUrl)}>
                      <FiCopy /> Copy
                    </button>
                    <button
                      className="delete"
                      type="button"
                      onClick={() => setDeleting(invitation)}>
                      <FiTrash2 /> Delete
                    </button>
                  </footer>
                </article>
              ))}
            </div>
            <div className="admin-pagination">
              <span>
                Showing {page * PAGE_SIZE + 1}-
                {Math.min((page + 1) * PAGE_SIZE, filtered.length)} of{' '}
                {filtered.length}
              </span>
              <div>
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage(value => value - 1)}>
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= pageCount - 1}
                  onClick={() => setPage(value => value + 1)}>
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {showGuestDialog && (
        <GuestDialog
          key={editing?.id || 'new'}
          guest={editing}
          busy={busy}
          error={mutationError}
          created={created}
          onClose={closeGuestDialog}
          onSubmit={saveGuest}
          onCopy={copyInvitation}
        />
      )}
      {showImport && (
        <ImportDialog
          onClose={() => setShowImport(false)}
          onImport={importGuests}
        />
      )}
      {deleting && (
        <ConfirmDialog
          guest={deleting}
          busy={busy}
          onCancel={() => setDeleting(null)}
          onConfirm={confirmDelete}
        />
      )}
    </main>
  );
}
