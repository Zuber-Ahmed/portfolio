import { FiLogOut, FiUsers } from 'react-icons/fi';
import { PiCalendarDots } from 'react-icons/pi';

export default function AdminShell({ page, onNavigate, onLogout, children }) {
  return (
    <div className="admin-app-shell">
      <header className="admin-header">
        <div className="admin-header-inner">
          <button
            type="button"
            className="admin-brand"
            onClick={() => onNavigate('guests')}>
            <span className="admin-brand-mark">
              Z<span>&amp;</span>B
            </span>
            <span>
              <strong>Wedding Admin</strong>
              <small>Zuber &amp; Bisma</small>
            </span>
          </button>
          <nav aria-label="Wedding admin navigation">
            <button
              type="button"
              className={page === 'guests' ? 'active' : ''}
              onClick={() => onNavigate('guests')}>
              <FiUsers /> Guests
            </button>
            <button
              type="button"
              className={page === 'details' ? 'active' : ''}
              onClick={() => onNavigate('details')}>
              <PiCalendarDots /> Wedding Details
            </button>
          </nav>
          <button type="button" className="admin-logout" onClick={onLogout}>
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </header>
      <div
        className="admin-mobile-nav"
        role="navigation"
        aria-label="Wedding admin navigation">
        <button
          type="button"
          className={page === 'guests' ? 'active' : ''}
          onClick={() => onNavigate('guests')}>
          <FiUsers /> Guests
        </button>
        <button
          type="button"
          className={page === 'details' ? 'active' : ''}
          onClick={() => onNavigate('details')}>
          <PiCalendarDots /> Details
        </button>
      </div>
      {children}
      <footer className="admin-footer">
        <span>Wedding Admin</span>
        <span>Zuber &amp; Bisma &copy; {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
