import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../utils/http.js';
import '../styles/auth.css';

export default function AuthPage({ mode }) {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);

    try {
      if (mode === 'register') {
        await register(form);
        toast.success('Account created');
      } else {
        await login(form.email, form.password);
        toast.success('Welcome back');
      }
      navigate('/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Authentication failed'));
    } finally {
      setBusy(false);
    }
  }

  const isRegister = mode === 'register';

  return (
    <section className="auth-shell">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-layout">
        <aside className="auth-brand-panel">
          <p className="auth-eyebrow">EVENT SCHEDULER</p>
          <h1 className="auth-title">Plan smarter events</h1>
          <p className="auth-intro">
            One workspace for scheduling, invitations, and AI-assisted planning that keeps everyone aligned.
          </p>

          <ul className="auth-value-list">
            <li>Track events with search, filters, and live status updates.</li>
            <li>Share secure invitation links and onboard attendees in minutes.</li>
            <li>Use built-in AI tools for agendas, suggestions, and conflict checks.</li>
          </ul>

          <p className="auth-trust-note">Secure auth • Token-based sessions • Private event data</p>
        </aside>

        <section className="auth-form-panel">
          <div className="auth-card">
            <div className="auth-switch">
              <Link className={!isRegister ? 'active' : ''} to="/login">
                Sign in
              </Link>
              <Link className={isRegister ? 'active' : ''} to="/register">
                Create account
              </Link>
            </div>

            <h2 className="auth-form-title">{isRegister ? 'Create your account' : 'Welcome back'}</h2>
            <p className="auth-form-subtitle">
              {isRegister
                ? 'Start managing events, invites, and schedules in one place.'
                : 'Sign in to continue planning and managing your events.'}
            </p>

            <form onSubmit={handleSubmit} className="d-grid gap-3">
              {isRegister ? (
                <div className="auth-field">
                  <label className="form-label">Name</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon" aria-hidden="true">
                      N
                    </span>
                    <input
                      className="form-control auth-input"
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              ) : null}

              <div className="auth-field">
                <label className="form-label">Email</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon" aria-hidden="true">
                    @
                  </span>
                  <input
                    type="email"
                    className="form-control auth-input"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="form-label">Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon" aria-hidden="true">
                    *
                  </span>
                  <input
                    type="password"
                    className="form-control auth-input"
                    value={form.password}
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <button className="btn auth-submit-btn" disabled={busy}>
                {busy ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <p className="auth-footer-link">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create one'}</Link>
            </p>
          </div>
        </section>
      </div>
    </section>
  );
}
