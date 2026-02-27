import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios.js';
import AIAssistantPanel from '../components/AIAssistantPanel.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { toIso, toLocalDateTimeInput } from '../utils/date.js';
import { getErrorMessage } from '../utils/http.js';
import '../styles/event-form.css';

const initialForm = {
  title: '',
  startAt: '',
  endAt: '',
  location: '',
  description: '',
  status: 'upcoming',
  tags: ''
};

export default function EventFormPage({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode !== 'edit' || !id) return;

    async function fetchEvent() {
      try {
        const response = await api.get(`/events/${id}`);
        const event = response.data.data.event;
        setForm({
          title: event.title || '',
          startAt: toLocalDateTimeInput(event.startAt),
          endAt: toLocalDateTimeInput(event.endAt),
          location: event.location || '',
          description: event.description || '',
          status: event.status || 'upcoming',
          tags: (event.tags || []).join(', ')
        });
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to load event'));
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [id, mode, navigate, toast]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title: form.title,
      startAt: toIso(form.startAt),
      endAt: toIso(form.endAt),
      location: form.location,
      description: form.description,
      status: form.status,
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    };

    try {
      if (mode === 'edit') {
        await api.put(`/events/${id}`, payload);
        toast.success('Event updated');
        navigate(`/events/${id}`);
      } else {
        const response = await api.post('/events', payload);
        toast.success('Event created');
        navigate(`/events/${response.data.data.event._id}`);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to save event'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="event-editor-loading">Loading event workspace...</div>;
  }

  return (
    <section className="event-editor-shell">
      <div className="event-editor-blob event-editor-blob-1" />
      <div className="event-editor-blob event-editor-blob-2" />

      <header className="event-editor-hero">
        <div>
          <p className="event-editor-eyebrow">{mode === 'edit' ? 'EVENT STUDIO / EDIT' : 'EVENT STUDIO / NEW'}</p>
          <h1 className="event-editor-title">{mode === 'edit' ? 'Refine Event Plan' : 'Create New Event'}</h1>
          <p className="event-editor-subtitle">
            Build a clear schedule with timing, context, and AI-assisted planning in one workspace.
          </p>
        </div>
        <Link to="/dashboard" className="btn event-editor-back-btn">
          Back to Dashboard
        </Link>
      </header>

      <div className="row g-4 align-items-start">
        <div className="col-xl-8">
          <form onSubmit={handleSubmit} className="event-editor-form-card">
            <section className="event-editor-section">
              <div className="event-editor-section-head">
                <p>Event Basics</p>
              </div>
              <div>
                <label className="event-editor-label">Title</label>
                <input
                  className="form-control event-editor-input"
                  placeholder="Ex: Product Strategy Workshop"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
            </section>

            <section className="event-editor-section">
              <div className="event-editor-section-head">
                <p>Schedule</p>
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="event-editor-label">Start</label>
                  <input
                    type="datetime-local"
                    className="form-control event-editor-input"
                    value={form.startAt}
                    onChange={(e) => setForm((prev) => ({ ...prev, startAt: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="event-editor-label">End</label>
                  <input
                    type="datetime-local"
                    className="form-control event-editor-input"
                    value={form.endAt}
                    onChange={(e) => setForm((prev) => ({ ...prev, endAt: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </section>

            <section className="event-editor-section">
              <div className="event-editor-section-head">
                <p>Details</p>
              </div>

              <div className="row g-3">
                <div className="col-md-7">
                  <label className="event-editor-label">Location</label>
                  <input
                    className="form-control event-editor-input"
                    placeholder="Ex: Conference Room A or Zoom"
                    value={form.location}
                    onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                <div className="col-md-5">
                  <label className="event-editor-label">Status</label>
                  <select
                    className="form-select event-editor-input"
                    value={form.status}
                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="upcoming">upcoming</option>
                    <option value="attending">attending</option>
                    <option value="maybe">maybe</option>
                    <option value="declined">declined</option>
                  </select>
                </div>
              </div>

              <div className="mt-3">
                <label className="event-editor-label">Tags (comma-separated)</label>
                <input
                  className="form-control event-editor-input"
                  placeholder="team, roadmap, customer"
                  value={form.tags}
                  onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                />
              </div>
            </section>

            <section className="event-editor-section">
              <div className="event-editor-section-head">
                <p>Description</p>
              </div>
              <div>
                <label className="event-editor-label">Context and goals</label>
                <textarea
                  className="form-control event-editor-input event-editor-textarea"
                  rows={8}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </section>

            <div className="event-editor-actions">
              <button className="btn event-editor-save-btn" disabled={saving}>
                {saving ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Create Event'}
              </button>
              <Link to="/dashboard" className="btn event-editor-cancel-btn">
                Cancel
              </Link>
            </div>
          </form>
        </div>

        <div className="col-xl-4">
          <AIAssistantPanel form={form} setForm={setForm} />
        </div>
      </div>
    </section>
  );
}
