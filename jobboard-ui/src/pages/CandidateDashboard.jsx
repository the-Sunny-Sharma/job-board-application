import { useMyApplications } from '../hooks/useApplications'
import { JobDetailSkeleton } from '../components/skeletons/PageSkeleton'
import SEO from '../components/SEO'
import { useAuth } from '../context/useAuth'
import { formatDate, STATUS_BADGE } from '../utils/helpers'
import { Link } from 'react-router-dom'

function CandidateDashboard() {
  const { user }           = useAuth()
  const { data, isLoading } = useMyApplications()
  const applications = data?.content ?? []

  return (
    <>
      <SEO title="My Applications" />
      <div className="container page">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            My Applications
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Welcome back, {user?.name} 👋
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem', marginBottom: '2rem'
        }}>
          {[
            { label: 'Total Applied',  value: applications.length,
              color: '#2563eb' },
            { label: 'Reviewing',
              value: applications.filter(a => a.status === 'REVIEWING').length,
              color: '#7c3aed' },
            { label: 'Accepted',
              value: applications.filter(a => a.status === 'ACCEPTED').length,
              color: '#16a34a' },
            { label: 'Pending',
              value: applications.filter(a => a.status === 'PENDING').length,
              color: '#d97706' },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800,
                color: stat.color, lineHeight: 1 }}>
                {isLoading ? '—' : stat.value}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)',
                marginTop: '0.4rem' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Applications List */}
        {isLoading && <JobDetailSkeleton />}

        {!isLoading && applications.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <h3>No applications yet</h3>
            <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem' }}>
              Start applying to jobs that match your skills
            </p>
            <Link to="/" className="btn btn-primary">Browse Jobs</Link>
          </div>
        )}

        {!isLoading && applications.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {applications.map(app => (
              <div key={app.id} className="card" style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center',
                    gap: '0.75rem', marginBottom: '0.4rem' }}>
                    <Link to={`/jobs/${app.jobId}`} style={{
                      fontWeight: 700, color: 'var(--text-primary)',
                      textDecoration: 'none', fontSize: '1rem'
                    }}>
                      {app.jobTitle}
                    </Link>
                    <span className={`badge ${STATUS_BADGE[app.status]}`}>
                      {app.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {app.company} · Applied {formatDate(app.appliedAt)}
                  </p>

                  {/* AI match score if available */}
                  {app.aiMatchScore != null && (
                    <div style={{
                      marginTop: '0.5rem', display: 'inline-flex',
                      alignItems: 'center', gap: '0.5rem',
                      background: '#f0fdf4', borderRadius: '6px',
                      padding: '0.25rem 0.75rem'
                    }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700,
                        color: 'var(--success)' }}>
                        🤖 AI Match: {app.aiMatchScore}%
                      </span>
                    </div>
                  )}
                </div>

                <a
                  href={app.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  View Resume ↗
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default CandidateDashboard