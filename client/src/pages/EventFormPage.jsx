import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios.js';
import AIAssistantPanel from '../components/AIAssistantPanel.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { toIso, toLocalDateTimeInput } from '../utils/date.js';
import { getErrorMessage } from '../utils/http.js';

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
    return <div className="text-center py-5">Loading event...</div>;
  }

  return (
    <div className="row g-4">
      <div className="col-lg-8">
        <div className="card">
          <div className="card-body">
            <h1 className="h4 mb-3">{mode === 'edit' ? 'Edit Event' : 'Create Event'}</h1>
            <form onSubmit={handleSubmit} className="d-grid gap-3">
              <div>
                <label className="form-label">Title</label>
                <input
                  className="form-control"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Start</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={form.startAt}
                    onChange={(e) => setForm((prev) => ({ ...prev, startAt: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">End</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={form.endAt}
                    onChange={(e) => setForm((prev) => ({ ...prev, endAt: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Location</label>
                <input
                  className="form-control"
                  value={form.location}
                  onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div>
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option value="upcoming">upcoming</option>
                  <option value="attending">attending</option>
                  <option value="maybe">maybe</option>
                  <option value="declined">declined</option>
                </select>
              </div>

              <div>
                <label className="form-label">Tags (comma-separated)</label>
                <input
                  className="form-control"
                  value={form.tags}
                  onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                />
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={8}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Create Event'}
                </button>
                <Link to="/dashboard" className="btn btn-outline-secondary">
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="col-lg-4">
        <AIAssistantPanel form={form} setForm={setForm} />
      </div>
    </div>
  );
}
