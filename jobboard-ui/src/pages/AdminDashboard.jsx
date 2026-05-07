import { useState } from 'react'
import { useMyJobs, useCreateJob, useDeleteJob, useUpdateJob }
  from '../hooks/useJobs'
import { useJobApplications, useUpdateStatus, useAnalyseResume }
  from '../hooks/useApplications'
import SEO from '../components/SEO'
import { useAuth } from '../context/useAuth'
import { formatDate, formatSalary, STATUS_BADGE } from '../utils/helpers'

const EMPTY_JOB = {
  title: '', description: '', company: '',
  location: '', jobType: 'FULL_TIME',
  salaryMin: '', salaryMax: ''
}

function AdminDashboard() {
  const { user }                    = useAuth()
  const [tab, setTab]               = useState('jobs')
  const [showForm, setShowForm]     = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [form, setForm]             = useState(EMPTY_JOB)
  const [selectedJobId, setSelectedJobId] = useState(null)

  const { data: jobsPage, isLoading: jobsLoading } = useMyJobs()
  const jobs = jobsPage?.content ?? []

  const { data: appsPage, isLoading: appsLoading } =
    useJobApplications(selectedJobId)
  const applications = appsPage?.content ?? []

  const createJob   = useCreateJob()
  const updateJob   = useUpdateJob()
  const deleteJob   = useDeleteJob()
  const updateStatus = useUpdateStatus()
  const analyseResume = useAnalyseResume()

  const handleSubmit = e => {
    e.preventDefault()
    const payload = {
      ...form,
      salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
    }
    if (editingJob) {
      updateJob.mutate({ id: editingJob.id, data: payload },
        { onSuccess: () => { setShowForm(false); setEditingJob(null); setForm(EMPTY_JOB) }})
    } else {
      createJob.mutate(payload,
        { onSuccess: () => { setShowForm(false); setForm(EMPTY_JOB) }})
    }
  }

  const handleEdit = job => {
    setEditingJob(job)
    setForm({
      title: job.title, description: job.description,
      company: job.company, location: job.location,
      jobType: job.jobType,
      salaryMin: job.salaryMin || '',
      salaryMax: job.salaryMax || ''
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <SEO title="Admin Dashboard" />
      <div className="container page">

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem'
        }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Welcome, {user?.name} 👋</p>
          </div>
          <button className="btn btn-primary" onClick={() => {
            setEditingJob(null); setForm(EMPTY_JOB); setShowForm(true)
          }}>
            + Post New Job
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '0', marginBottom: '1.5rem',
          borderBottom: '2px solid var(--border)'
        }}>
          {['jobs', 'applications'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                padding: '0.75rem 1.5rem', background: 'none', border: 'none',
                cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent',
                color: tab === t ? 'var(--primary)' : 'var(--text-secondary)',
                marginBottom: '-2px', transition: 'color 0.15s'
              }}>
              {t === 'jobs' ? `My Jobs (${jobs.length})` : 'Applications'}
            </button>
          ))}
        </div>

        {/* Job Form */}
        {showForm && (
          <div className="card" style={{
            marginBottom: '1.5rem',
            border: '2px solid var(--primary)'
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              {editingJob ? 'Edit Job' : 'Post New Job'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Job Title *</label>
                  <input className="form-input" required
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Java Full Stack Developer"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Company *</label>
                  <input className="form-input" required
                    value={form.company}
                    onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                    placeholder="e.g. TechCorp India"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input className="form-input" required
                    value={form.location}
                    onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                    placeholder="e.g. Mumbai / Remote"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Job Type *</label>
                  <select className="form-input" value={form.jobType}
                    onChange={e => setForm(p => ({ ...p, jobType: e.target.value }))}>
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="REMOTE">Remote</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Min Salary (₹)</label>
                  <input className="form-input" type="number"
                    value={form.salaryMin}
                    onChange={e => setForm(p => ({ ...p, salaryMin: e.target.value }))}
                    placeholder="e.g. 600000"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Salary (₹)</label>
                  <input className="form-input" type="number"
                    value={form.salaryMax}
                    onChange={e => setForm(p => ({ ...p, salaryMax: e.target.value }))}
                    placeholder="e.g. 1200000"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-input" required rows={6}
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe the role, requirements, responsibilities..."
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-primary" type="submit"
                  disabled={createJob.isPending || updateJob.isPending}>
                  {createJob.isPending || updateJob.isPending
                    ? 'Saving...'
                    : editingJob ? 'Update Job' : 'Post Job'}
                </button>
                <button className="btn btn-outline" type="button"
                  onClick={() => { setShowForm(false); setEditingJob(null); setForm(EMPTY_JOB) }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Jobs Tab */}
        {tab === 'jobs' && (
          <div>
            {jobsLoading && (
              <div style={{ textAlign: 'center', padding: '3rem',
                color: 'var(--text-muted)' }}>
                Loading jobs...
              </div>
            )}
            {!jobsLoading && jobs.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                <h3>No jobs posted yet</h3>
                <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem' }}>
                  Post your first job to start receiving applications
                </p>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {jobs.map(job => (
                <div key={job.id} className="card" style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center',
                      gap: '0.75rem', marginBottom: '0.3rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
                        {job.title}
                      </h3>
                      <span className={`badge ${job.isActive
                        ? 'badge-green' : 'badge-gray'}`}>
                        {job.isActive ? 'Active' : 'Closed'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {job.company} · {job.location} ·{' '}
                      {formatSalary(job.salaryMin, job.salaryMax)} ·{' '}
                      Posted {formatDate(job.createdAt)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline btn-sm"
                      onClick={() => { setSelectedJobId(job.id); setTab('applications') }}>
                      View Applicants
                    </button>
                    <button className="btn btn-outline btn-sm"
                      onClick={() => handleEdit(job)}>
                      Edit
                    </button>
                    <button className="btn btn-sm"
                      style={{ background: '#fee2e2', color: 'var(--danger)', border: 'none' }}
                      onClick={() => {
                        if (window.confirm('Delete this job?'))
                          deleteJob.mutate(job.id)
                      }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {tab === 'applications' && (
          <div>
            {/* Job selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Select Job to View Applicants</label>
              <select className="form-input" style={{ maxWidth: '400px' }}
                value={selectedJobId || ''}
                onChange={e => setSelectedJobId(e.target.value || null)}>
                <option value="">-- Select a job --</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
            </div>

            {!selectedJobId && (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Select a job above to view its applicants
                </p>
              </div>
            )}

            {selectedJobId && appsLoading && (
              <div style={{ textAlign: 'center', padding: '3rem',
                color: 'var(--text-muted)' }}>
                Loading applicants...
              </div>
            )}

            {selectedJobId && !appsLoading && applications.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                <p>No applications received yet for this job</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {applications.map(app => (
                <div key={app.id} className="card">
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center',
                        gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
                          {app.candidateName}
                        </h3>
                        <span className={`badge ${STATUS_BADGE[app.status]}`}>
                          {app.status}
                        </span>
                        {app.aiMatchScore != null && (
                          <span className="badge badge-purple">
                            🤖 {app.aiMatchScore}% match
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.875rem',
                        color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        {app.candidateEmail} · Applied {formatDate(app.appliedAt)}
                      </p>
                      {app.coverLetter && (
                        <p style={{
                          fontSize: '0.825rem', color: 'var(--text-secondary)',
                          background: 'var(--bg)', padding: '0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden'
                        }}>
                          "{app.coverLetter}"
                        </p>
                      )}
                      {app.aiMatchSummary && (
                        <p style={{
                          fontSize: '0.825rem', color: 'var(--text-secondary)',
                          marginTop: '0.5rem', fontStyle: 'italic'
                        }}>
                          AI: {app.aiMatchSummary}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{
                      display: 'flex', flexDirection: 'column', gap: '0.5rem',
                      minWidth: '160px'
                    }}>
                      {/* Status update */}
                      <select className="form-input"
                        style={{ padding: '0.45rem 0.7rem', fontSize: '0.85rem' }}
                        value={app.status}
                        onChange={e => updateStatus.mutate({
                          id: app.id,
                          jobId: selectedJobId,
                          status: e.target.value
                        })}>
                        <option value="PENDING">Pending</option>
                        <option value="REVIEWING">Reviewing</option>
                        <option value="ACCEPTED">Accept</option>
                        <option value="REJECTED">Reject</option>
                      </select>

                      <a href={app.resumeUrl} target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm"
                        style={{ textAlign: 'center' }}>
                        View Resume ↗
                      </a>

                      <button className="btn btn-sm"
                        style={{
                          background: '#ede9fe', color: '#6d28d9',
                          border: 'none', justifyContent: 'center'
                        }}
                        disabled={analyseResume.isPending}
                        onClick={() => analyseResume.mutate(app.id)}>
                        {analyseResume.isPending ? 'Analysing...' : '🤖 AI Analyse'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default AdminDashboard