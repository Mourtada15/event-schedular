import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import EventFilters from '../components/EventFilters.jsx';
import EventList from '../components/EventList.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../utils/http.js';
import '../styles/dashboard.css';

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

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.query) count += 1;
    if (filters.status) count += 1;
    if (filters.from) count += 1;
    if (filters.to) count += 1;
    if (filters.location) count += 1;
    if (filters.sort && filters.sort !== defaultFilters.sort) count += 1;
    return count;
  }, [filters]);

  const upcomingOnPage = useMemo(
    () => events.filter((event) => event.status === 'upcoming').length,
    [events]
  );

  const nextEvent = useMemo(() => {
    const now = Date.now();
    const sorted = [...events]
      .filter((event) => new Date(event.startAt).getTime() >= now)
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    return sorted[0] || null;
  }, [events]);

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
    <section className="dashboard-shell">
      <div className="dashboard-glow dashboard-glow-1" />
      <div className="dashboard-glow dashboard-glow-2" />

      <header className="dashboard-hero">
        <div>
          <p className="dashboard-eyebrow">EVENT CONTROL CENTER</p>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">
            Track schedules, tune filters, and manage events from one focused workspace.
          </p>
        </div>
        <button className="btn dashboard-create-btn" onClick={() => navigate('/events/new')}>
          + Add Event
        </button>
      </header>

      <section className="dashboard-metrics">
        <article className="dashboard-metric-card">
          <p className="dashboard-metric-label">Total Events</p>
          <p className="dashboard-metric-value">{pagination.total}</p>
          <p className="dashboard-metric-note">Across all pages</p>
        </article>
        <article className="dashboard-metric-card">
          <p className="dashboard-metric-label">Upcoming (Page)</p>
          <p className="dashboard-metric-value">{upcomingOnPage}</p>
          <p className="dashboard-metric-note">Current page snapshot</p>
        </article>
        <article className="dashboard-metric-card">
          <p className="dashboard-metric-label">Active Filters</p>
          <p className="dashboard-metric-value">{activeFiltersCount}</p>
          <p className="dashboard-metric-note">Narrowing current results</p>
        </article>
        <article className="dashboard-metric-card">
          <p className="dashboard-metric-label">Next Event</p>
          <p className="dashboard-metric-value dashboard-metric-value-sm">
            {nextEvent ? new Date(nextEvent.startAt).toLocaleDateString() : 'None'}
          </p>
          <p className="dashboard-metric-note">{nextEvent ? nextEvent.title : 'No future event on this page'}</p>
        </article>
      </section>

      <EventFilters
        filters={filters}
        onChange={handleFilterChange}
        onSubmit={handleFilterSubmit}
        onReset={handleFilterReset}
      />

      {loading ? <div className="dashboard-loading">Loading your event timeline...</div> : null}
      {!loading ? (
        <EventList events={events} onStatusChange={handleStatusChange} onDelete={handleDelete} busyId={busyId} />
      ) : null}

      <footer className="dashboard-footer">
        <small className="dashboard-pagination-copy">
          Total {pagination.total} event(s) | page {pagination.page} / {Math.max(1, pagination.totalPages)}
        </small>
        <div className="dashboard-pagination-controls">
          <button
            className="btn btn-sm dashboard-page-btn"
            disabled={pagination.page <= 1 || loading}
            onClick={() => fetchEvents(pagination.page - 1)}
          >
            Previous
          </button>
          <button
            className="btn btn-sm dashboard-page-btn"
            disabled={pagination.page >= pagination.totalPages || loading}
            onClick={() => fetchEvents(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      </footer>
    </section>
  );
}
