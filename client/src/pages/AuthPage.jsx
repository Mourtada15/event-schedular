import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../utils/http.js';

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

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h1 className="h4 mb-3">{mode === 'register' ? 'Create account' : 'Sign in'}</h1>
            <form onSubmit={handleSubmit} className="d-grid gap-3">
              {mode === 'register' ? (
                <div>
                  <label className="form-label">Name</label>
                  <input
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
              ) : null}

              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  required
                  minLength={8}
                />
              </div>

              <button className="btn btn-primary" disabled={busy}>
                {busy ? 'Please wait...' : mode === 'register' ? 'Register' : 'Login'}
              </button>
            </form>

            <p className="mt-3 mb-0 text-muted">
              {mode === 'register' ? 'Already have an account?' : "Don't have an account?"}{' '}
              <Link to={mode === 'register' ? '/login' : '/register'}>
                {mode === 'register' ? 'Login' : 'Register'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
