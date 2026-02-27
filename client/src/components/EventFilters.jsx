const statuses = ['', 'upcoming', 'attending', 'maybe', 'declined'];

export default function EventFilters({ filters, onChange, onSubmit, onReset }) {
  return (
    <form className="event-filters-card" onSubmit={onSubmit}>
      <div className="event-filters-header">
        <h2>Refine Timeline</h2>
        <p>Search and narrow events by status, date, and location.</p>
      </div>

      <div className="row g-3">
        <div className="col-lg-3 col-md-6">
          <label className="event-filter-label">Search</label>
          <input
            className="form-control event-filter-input"
            placeholder="Search title/location/description"
            value={filters.query}
            onChange={(e) => onChange('query', e.target.value)}
          />
        </div>
        <div className="col-lg-2 col-md-6">
          <label className="event-filter-label">Status</label>
          <select
            className="form-select event-filter-input"
            value={filters.status}
            onChange={(e) => onChange('status', e.target.value)}
          >
            {statuses.map((status) => (
              <option key={status || 'all'} value={status}>
                {status || 'All statuses'}
              </option>
            ))}
          </select>
        </div>
        <div className="col-lg-2 col-md-6">
          <label className="event-filter-label">From</label>
          <input
            type="datetime-local"
            className="form-control event-filter-input"
            value={filters.from}
            onChange={(e) => onChange('from', e.target.value)}
          />
        </div>
        <div className="col-lg-2 col-md-6">
          <label className="event-filter-label">To</label>
          <input
            type="datetime-local"
            className="form-control event-filter-input"
            value={filters.to}
            onChange={(e) => onChange('to', e.target.value)}
          />
        </div>
        <div className="col-lg-2 col-md-6">
          <label className="event-filter-label">Location</label>
          <input
            className="form-control event-filter-input"
            placeholder="Location"
            value={filters.location}
            onChange={(e) => onChange('location', e.target.value)}
          />
        </div>
        <div className="col-lg-1 col-md-6">
          <label className="event-filter-label">Sort</label>
          <select
            className="form-select event-filter-input"
            value={filters.sort}
            onChange={(e) => onChange('sort', e.target.value)}
          >
            <option value="startAt:asc">Soonest</option>
            <option value="startAt:desc">Latest</option>
          </select>
        </div>
      </div>

      <div className="event-filter-actions">
        <button className="btn event-filter-apply" type="submit">
          Apply
        </button>
        <button className="btn event-filter-reset" type="button" onClick={onReset}>
          Reset
        </button>
      </div>
    </form>
  );
}
