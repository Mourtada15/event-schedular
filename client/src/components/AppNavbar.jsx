import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import '../styles/navbar.css';

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      toast.success('Logged out');
      navigate('/login');
    } catch {
      toast.error('Failed to logout');
    }
  }

  return (
    <header className="app-nav-shell">
      <nav className="app-nav container">
        <Link className="app-nav-brand" to={user ? '/dashboard' : '/login'}>
          <span className="app-nav-brand-mark">ES</span>
          <span className="app-nav-brand-text">Event Scheduler</span>
        </Link>

        <div className="app-nav-right">
          {user ? (
            <>
              <div className="app-nav-links">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`}
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/events/new"
                  className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`}
                >
                  New Event
                </NavLink>
                <NavLink to="/invites" className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`}>
                  Invitations
                </NavLink>
              </div>

              <span className="app-nav-user" title={user.email}>
                {user.email}
              </span>
              <button className="btn app-nav-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <div className="app-nav-auth-actions">
              <Link className="btn app-nav-login" to="/login">
                Login
              </Link>
              <Link className="btn app-nav-register" to="/register">
                Register
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
