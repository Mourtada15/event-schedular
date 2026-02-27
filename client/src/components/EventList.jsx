import { Link } from 'react-router-dom';

const statuses = ['upcoming', 'attending', 'maybe', 'declined'];

export default function EventList({ events, onStatusChange, onDelete, busyId }) {
  if (!events.length) {
    return (
      <section className="event-empty-state">
        <h3>No events found</h3>
        <p>Try adjusting your filters or create a new event from the dashboard action button.</p>
      </section>
    );
  }

  return (
    <section className="event-list-card">
      <div className="table-responsive">
        <table className="table align-middle mb-0 event-list-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>When</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event._id}>
                <td>
                  <div className="event-title">{event.title}</div>
                  <small className="event-muted">{event.description?.slice(0, 80) || 'No description'}</small>
                </td>
                <td>
                  <div className="event-time">{new Date(event.startAt).toLocaleString()}</div>
                  <small className="event-muted">to {new Date(event.endAt).toLocaleString()}</small>
                </td>
                <td className="event-location">{event.location || '-'}</td>
                <td style={{ maxWidth: 180 }}>
                  <select
                    className="form-select form-select-sm event-status-select"
                    value={event.status}
                    onChange={(e) => onStatusChange(event, e.target.value)}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <div className="event-action-group">
                    <Link className="btn btn-sm event-action-btn event-action-view" to={`/events/${event._id}`}>
                      View
                    </Link>
                    <Link className="btn btn-sm event-action-btn event-action-edit" to={`/events/${event._id}/edit`}>
                      Edit
                    </Link>
                    <button
                      className="btn btn-sm event-action-btn event-action-delete"
                      disabled={busyId === event._id}
                      onClick={() => onDelete(event)}
                    >
                      {busyId === event._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
