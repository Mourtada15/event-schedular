import { useState } from 'react';
import api from '../api/axios.js';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../utils/http.js';
import '../styles/invitations.css';

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
    <section className="invite-shell">
      <div className="invite-orb invite-orb-1" />
      <div className="invite-orb invite-orb-2" />

      <header className="invite-hero">
        <p className="invite-eyebrow">TEAM ACCESS</p>
        <h1 className="invite-title">Invitations</h1>
        <p className="invite-subtitle">Generate secure invite links and onboard new collaborators quickly.</p>
      </header>

      <div className="row g-4 align-items-start">
        <div className="col-lg-7">
          <div className="invite-card">
            <h2 className="invite-card-title">Create Invite Link</h2>
            <p className="invite-card-subtitle">Optionally target a specific email or create a general shareable link.</p>

            <form onSubmit={handleCreateInvite} className="invite-form">
              <label className="invite-label">Invite email (optional)</label>
              <div className="invite-form-row">
                <input
                  type="email"
                  className="form-control invite-input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button className="btn invite-create-btn" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Invite'}
                </button>
              </div>
            </form>

            {inviteLink ? (
              <div className="invite-result">
                <p className="invite-result-title">Invite link ready</p>
                <code className="invite-link-code">{inviteLink}</code>
                <div className="invite-result-actions">
                  <button className="btn invite-copy-btn" onClick={copyLink}>
                    Copy Link
                  </button>
                </div>
                <p className="invite-note">You can share this directly or send it by email.</p>
              </div>
            ) : (
              <div className="invite-empty">
                No link yet. Create your first invitation to generate a shareable onboarding URL.
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-5">
          <aside className="invite-info-card">
            <h3>How It Works</h3>
            <ul>
              <li>Create an invite with or without an email address.</li>
              <li>Share the generated URL with the participant.</li>
              <li>They accept invite and get immediate access.</li>
            </ul>

            <div className="invite-tip">
              Tip: Leave email blank when you need a reusable link for private channels.
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
