import { Link } from 'react-router-dom'
import { formatSalary, formatDate, JOB_TYPE_BADGE, JOB_TYPE_LABEL }
  from '../utils/helpers'

function JobCard({ job }) {
  return (
    <div className="card" style={{
      display: 'flex', flexDirection: 'column', gap: '0.75rem',
      transition: 'transform 0.15s, box-shadow 0.15s',
      cursor: 'pointer', height: '100%'
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Link to={`/jobs/${job.id}`} style={{
            fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)',
            textDecoration: 'none', lineHeight: 1.3,
            display: 'block', marginBottom: '0.25rem'
          }}>
            {job.title}
          </Link>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {job.company}
          </span>
        </div>
        <span className={`badge ${JOB_TYPE_BADGE[job.jobType] || 'badge-gray'}`}>
          {JOB_TYPE_LABEL[job.jobType] || job.jobType}
        </span>
      </div>

      {/* Location + Salary */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          📍 {job.location}
        </span>
        <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600 }}>
          💰 {formatSalary(job.salaryMin, job.salaryMax)}
        </span>
      </div>

      {/* Description preview */}
      {job.description && (
        <p style={{
          fontSize: '0.825rem', color: 'var(--text-secondary)',
          lineHeight: 1.6, margin: 0,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>
          {job.description}
        </p>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginTop: 'auto', paddingTop: '0.75rem',
        borderTop: '1px solid var(--border)'
      }}>
        <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
          {formatDate(job.createdAt)}
        </span>
        <Link to={`/jobs/${job.id}`} className="btn btn-primary btn-sm">
          View Job
        </Link>
      </div>
    </div>
  )
}

export default JobCard