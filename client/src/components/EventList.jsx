import { Link } from 'react-router-dom';

const statuses = ['upcoming', 'attending', 'maybe', 'declined'];

export default function EventList({ events, onStatusChange, onDelete, busyId }) {
  if (!events.length) {
    return <div className="alert alert-secondary">No events found. Try adjusting filters.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped align-middle">
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
                <div className="fw-semibold">{event.title}</div>
                <small className="text-muted">{event.description?.slice(0, 80) || 'No description'}</small>
              </td>
              <td>
                <div>{new Date(event.startAt).toLocaleString()}</div>
                <small className="text-muted">to {new Date(event.endAt).toLocaleString()}</small>
              </td>
              <td>{event.location || '-'}</td>
              <td style={{ maxWidth: 180 }}>
                <select
                  className="form-select form-select-sm"
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
                <div className="d-flex gap-2 flex-wrap">
                  <Link className="btn btn-sm btn-outline-primary" to={`/events/${event._id}`}>
                    View
                  </Link>
                  <Link className="btn btn-sm btn-outline-secondary" to={`/events/${event._id}/edit`}>
                    Edit
                  </Link>
                  <button
                    className="btn btn-sm btn-outline-danger"
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
  );
}
