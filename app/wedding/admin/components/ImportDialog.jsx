import { useRef, useState } from 'react';
import { FiDownload, FiFileText, FiUpload, FiX } from 'react-icons/fi';

import {
  downloadInvitationLinks,
  parseGuestFile,
} from '../services/guestImport';

export default function ImportDialog({ onClose, onImport }) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState([]);
  const [created, setCreated] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const chooseFile = async file => {
    if (!file) return;
    setFileName(file.name);
    setError('');
    setCreated([]);
    try {
      setRows(await parseGuestFile(file));
    } catch (parseError) {
      setRows([]);
      setError(parseError.message);
    }
  };

  const importRows = async () => {
    setBusy(true);
    setError('');
    try {
      const invitations = await onImport(rows.map(row => row.guest));
      setCreated(invitations);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const invalidCount = rows.filter(row => row.errors.length).length;

  return (
    <div className="admin-modal-backdrop" role="presentation">
      <section
        className="admin-modal admin-import-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-title">
        <button
          className="admin-modal-close"
          type="button"
          aria-label="Close"
          onClick={onClose}>
          <FiX />
        </button>
        <p className="admin-kicker">Bulk Guests</p>
        <h2 id="import-title">Import Guests</h2>
        <p>
          Choose a CSV or Excel file with displayName, recipientType, nikah, and
          walima columns. Import up to 100 guests at a time.
        </p>
        {error && <div className="admin-alert error">{error}</div>}

        {!created.length && (
          <>
            <input
              ref={inputRef}
              className="admin-file-input"
              type="file"
              accept=".csv,.xlsx"
              onChange={event => chooseFile(event.target.files?.[0])}
            />
            <button
              className="admin-file-picker"
              type="button"
              onClick={() => inputRef.current?.click()}>
              {fileName ? <FiFileText /> : <FiUpload />}
              <span>
                <strong>{fileName || 'Choose Excel / CSV'}</strong>
                <small>
                  {fileName
                    ? 'Choose another file'
                    : '.xlsx and .csv files are supported'}
                </small>
              </span>
            </button>
            {rows.length > 0 && (
              <div className="admin-import-preview">
                <div className="admin-preview-heading">
                  <strong>Preview</strong>
                  <span className={invalidCount ? 'invalid' : 'valid'}>
                    {invalidCount
                      ? `${invalidCount} invalid row${invalidCount === 1 ? '' : 's'}`
                      : `${rows.length} ready`}
                  </span>
                </div>
                <div className="admin-preview-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Row</th>
                        <th>Guest</th>
                        <th>Type</th>
                        <th>Nikah</th>
                        <th>Walima</th>
                        <th>Validation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(row => (
                        <tr
                          key={row.rowNumber}
                          className={row.errors.length ? 'invalid' : ''}>
                          <td>{row.rowNumber}</td>
                          <td>{row.guest.displayName || 'Missing'}</td>
                          <td>{row.guest.recipientType || 'Missing'}</td>
                          <td>
                            {row.guest.nikah === null
                              ? 'Invalid'
                              : row.guest.nikah
                                ? 'Yes'
                                : 'No'}
                          </td>
                          <td>
                            {row.guest.walima === null
                              ? 'Invalid'
                              : row.guest.walima
                                ? 'Yes'
                                : 'No'}
                          </td>
                          <td>{row.errors.join('; ') || 'Ready'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
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
                type="button"
                disabled={!rows.length || invalidCount > 0 || busy}
                onClick={importRows}>
                {busy ? 'Importing...' : `Import ${rows.length || ''} Guests`}
              </button>
            </div>
          </>
        )}

        {created.length > 0 && (
          <div className="admin-import-success">
            <div className="admin-success-icon">
              <FiFileText />
            </div>
            <h3>{created.length} invitations created</h3>
            <p>
              Download the organizer links now or copy individual links from the
              guest list.
            </p>
            <button
              className="admin-primary-button wide"
              type="button"
              onClick={() => downloadInvitationLinks(created)}>
              <FiDownload /> Download Invitation Links
            </button>
            <button
              className="admin-secondary-button wide"
              type="button"
              onClick={onClose}>
              Return to Guests
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
