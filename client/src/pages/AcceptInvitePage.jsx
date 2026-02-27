import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../utils/http.js';

export default function AcceptInvitePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshCurrentUser } = useAuth();
  const toast = useToast();

  const token = useMemo(() => params.get('token') || '', [params]);

  const [form, setForm] = useState({ name: '', password: '', email: '' });
  const [busy, setBusy] = useState(false);

  async function submit(payload) {
    setBusy(true);
    try {
      await api.post('/invites/accept', payload);
      await refreshCurrentUser().catch(() => null);
      toast.success('Invitation accepted');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to accept invitation'));
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return <div className="alert alert-danger">Invitation token missing.</div>;
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-7 col-lg-6">
        <div className="card">
          <div className="card-body">
            <h1 className="h4 mb-3">Accept Invitation</h1>

            {user ? (
              <div>
                <p className="text-muted">You are signed in as {user.email}. Accept invitation for this account.</p>
                <button className="btn btn-primary" disabled={busy} onClick={() => submit({ token })}>
                  {busy ? 'Please wait...' : 'Accept as Current User'}
                </button>
              </div>
            ) : (
              <form
                className="d-grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit({
                    token,
                    name: form.name,
                    password: form.password,
                    email: form.email || undefined
                  });
                }}
              >
                <div>
                  <label className="form-label">Name</label>
                  <input
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Email (if invite had no email)</label>
                  <input
                    className="form-control"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="form-label">Password</label>
                  <input
                    className="form-control"
                    type="password"
                    minLength={8}
                    value={form.password}
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>

                <button className="btn btn-primary" disabled={busy}>
                  {busy ? 'Please wait...' : 'Create Account & Accept'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
