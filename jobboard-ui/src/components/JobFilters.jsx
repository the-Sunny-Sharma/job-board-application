function JobFilters({ filters, onChange, onReset }) {
  const hasActiveFilters = filters.location || filters.jobType ||
    filters.salaryMin || filters.salaryMax

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '1.25rem'
      }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600
            }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Location */}
      <div className="form-group">
        <label className="form-label">Location</label>
        <input
          className="form-input"
          placeholder="e.g. Mumbai, Remote"
          value={filters.location}
          onChange={e => onChange('location', e.target.value)}
        />
      </div>

      {/* Job Type */}
      <div className="form-group">
        <label className="form-label">Job Type</label>
        {['FULL_TIME', 'PART_TIME', 'REMOTE', 'CONTRACT', 'INTERNSHIP'].map(type => (
          <label key={type} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            marginBottom: '0.5rem', cursor: 'pointer', fontSize: '0.875rem'
          }}>
            <input
              type="radio"
              name="jobType"
              value={type}
              checked={filters.jobType === type}
              onChange={() => onChange('jobType', type)}
            />
            {type.replace('_', ' ').toLowerCase()
              .replace(/\b\w/g, c => c.toUpperCase())}
          </label>
        ))}
        {filters.jobType && (
          <button
            onClick={() => onChange('jobType', '')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.8rem', color: 'var(--text-muted)', padding: 0
            }}
          >
            Clear type
          </button>
        )}
      </div>

      {/* Salary Range */}
      <div className="form-group">
        <label className="form-label">Min Salary (₹)</label>
        <input
          className="form-input"
          type="number"
          placeholder="e.g. 500000"
          value={filters.salaryMin}
          onChange={e => onChange('salaryMin', e.target.value)}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Max Salary (₹)</label>
        <input
          className="form-input"
          type="number"
          placeholder="e.g. 1500000"
          value={filters.salaryMax}
          onChange={e => onChange('salaryMax', e.target.value)}
        />
      </div>
    </div>
  )
}

export default JobFilters