import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

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
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to={user ? '/dashboard' : '/login'}>
          Event Scheduler
        </Link>

        <div className="ms-auto d-flex align-items-center gap-2">
          {user ? (
            <>
              <Link className="btn btn-sm btn-outline-light" to="/dashboard">
                Dashboard
              </Link>
              <Link className="btn btn-sm btn-outline-light" to="/events/new">
                New Event
              </Link>
              <Link className="btn btn-sm btn-outline-light" to="/invites">
                Invitations
              </Link>
              <span className="text-light small">{user.email}</span>
              <button className="btn btn-sm btn-warning" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-sm btn-outline-light" to="/login">
                Login
              </Link>
              <Link className="btn btn-sm btn-primary" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
