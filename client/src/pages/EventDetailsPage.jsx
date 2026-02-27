import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios.js';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../utils/http.js';

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await api.get(`/events/${id}`);
        setEvent(response.data.data.event);
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to load event'));
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [id, navigate, toast]);

  async function handleDelete() {
    if (!window.confirm('Delete this event?')) return;

    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete event'));
    }
  }

  if (loading) return <div className="text-center py-5">Loading event...</div>;
  if (!event) return null;

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <h1 className="h4">{event.title}</h1>
            <span className="badge text-bg-secondary">{event.status}</span>
          </div>
          <div className="d-flex gap-2">
            <Link className="btn btn-outline-secondary btn-sm" to={`/events/${event._id}/edit`}>
              Edit
            </Link>
            <button className="btn btn-outline-danger btn-sm" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>

        <hr />
        <p>
          <strong>Start:</strong> {new Date(event.startAt).toLocaleString()}
        </p>
        <p>
          <strong>End:</strong> {new Date(event.endAt).toLocaleString()}
        </p>
        <p>
          <strong>Location:</strong> {event.location || '-'}
        </p>
        <p>
          <strong>Tags:</strong> {event.tags?.length ? event.tags.join(', ') : '-'}
        </p>
        <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
          {event.description || 'No description'}
        </p>
      </div>
    </div>
  );
}
