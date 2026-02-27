import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import EventFilters from '../components/EventFilters.jsx';
import EventList from '../components/EventList.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../utils/http.js';

const defaultFilters = {
  query: '',
  status: '',
  from: '',
  to: '',
  location: '',
  sort: 'startAt:asc'
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [filters, setFilters] = useState(defaultFilters);
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');

  async function fetchEvents(page = 1, nextFilters = filters) {
    setLoading(true);
    try {
      const params = {
        ...nextFilters,
        page,
        limit: pagination.limit
      };

      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const response = await api.get('/events', { params });
      setEvents(response.data.data.items);
      setPagination(response.data.data.pagination);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load events'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents(1, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFilterSubmit(e) {
    e.preventDefault();
    await fetchEvents(1, filters);
  }

  async function handleFilterReset() {
    setFilters(defaultFilters);
    await fetchEvents(1, defaultFilters);
  }

  async function handleStatusChange(event, status) {
    try {
      await api.put(`/events/${event._id}`, { status });
      setEvents((prev) => prev.map((item) => (item._id === event._id ? { ...item, status } : item)));
      toast.success('Status updated');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update status'));
    }
  }

  async function handleDelete(event) {
    setBusyId(event._id);
    try {
      await api.delete(`/events/${event._id}`);
      toast.success('Event deleted');
      await fetchEvents(pagination.page);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete event'));
    } finally {
      setBusyId('');
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0">Dashboard</h1>
        <button className="btn btn-primary" onClick={() => navigate('/events/new')}>
          Add Event
        </button>
      </div>

      <EventFilters
        filters={filters}
        onChange={handleFilterChange}
        onSubmit={handleFilterSubmit}
        onReset={handleFilterReset}
      />

      {loading ? <div className="text-center py-5">Loading events...</div> : null}
      {!loading ? (
        <EventList events={events} onStatusChange={handleStatusChange} onDelete={handleDelete} busyId={busyId} />
      ) : null}

      <div className="d-flex justify-content-between align-items-center mt-3">
        <small className="text-muted">
          Total {pagination.total} event(s) | page {pagination.page} / {Math.max(1, pagination.totalPages)}
        </small>
        <div className="btn-group">
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={pagination.page <= 1 || loading}
            onClick={() => fetchEvents(pagination.page - 1)}
          >
            Previous
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={pagination.page >= pagination.totalPages || loading}
            onClick={() => fetchEvents(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
