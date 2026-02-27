import { useState } from 'react';
import api from '../api/axios.js';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../utils/http.js';

export default function InvitationsPage() {
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [creating, setCreating] = useState(false);

  async function handleCreateInvite(e) {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await api.post('/invites/create', { email: email || undefined });
      setInviteLink(response.data.data.inviteLink);
      toast.success('Invitation link generated');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to create invite'));
    } finally {
      setCreating(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success('Invite link copied');
    } catch {
      toast.error('Copy failed, please copy manually');
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="card">
          <div className="card-body">
            <h1 className="h4 mb-3">Invitations</h1>
            <form onSubmit={handleCreateInvite} className="d-flex gap-2 mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Invite by email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="btn btn-primary" disabled={creating}>
                {creating ? 'Creating...' : 'Create Invite'}
              </button>
            </form>

            {inviteLink ? (
              <div className="border rounded p-3 bg-light">
                <p className="mb-2 fw-semibold">Invite link</p>
                <code className="d-block mb-2" style={{ wordBreak: 'break-all' }}>
                  {inviteLink}
                </code>
                <button className="btn btn-sm btn-outline-secondary" onClick={copyLink}>
                  Copy Link
                </button>
              </div>
            ) : (
              <p className="text-muted mb-0">Create an invitation to get a shareable link.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
