const statuses = ['', 'upcoming', 'attending', 'maybe', 'declined'];

export default function EventFilters({ filters, onChange, onSubmit, onReset }) {
  return (
    <form className="card card-body mb-3" onSubmit={onSubmit}>
      <div className="row g-2">
        <div className="col-md-3">
          <input
            className="form-control"
            placeholder="Search title/location/description"
            value={filters.query}
            onChange={(e) => onChange('query', e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <select className="form-select" value={filters.status} onChange={(e) => onChange('status', e.target.value)}>
            {statuses.map((status) => (
              <option key={status || 'all'} value={status}>
                {status || 'All statuses'}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <input
            type="datetime-local"
            className="form-control"
            value={filters.from}
            onChange={(e) => onChange('from', e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <input
            type="datetime-local"
            className="form-control"
            value={filters.to}
            onChange={(e) => onChange('to', e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <input
            className="form-control"
            placeholder="Location"
            value={filters.location}
            onChange={(e) => onChange('location', e.target.value)}
          />
        </div>
        <div className="col-md-1">
          <select className="form-select" value={filters.sort} onChange={(e) => onChange('sort', e.target.value)}>
            <option value="startAt:asc">Soonest</option>
            <option value="startAt:desc">Latest</option>
          </select>
        </div>
      </div>

      <div className="mt-2 d-flex gap-2">
        <button className="btn btn-primary" type="submit">
          Apply
        </button>
        <button className="btn btn-outline-secondary" type="button" onClick={onReset}>
          Reset
        </button>
      </div>
    </form>
  );
}
