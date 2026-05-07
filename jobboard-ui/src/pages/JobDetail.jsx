import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useJob } from '../hooks/useJobs'
import { useApplyToJob } from '../hooks/useApplications'
import { useAuth } from '../context/useAuth'
import { JobDetailSkeleton } from '../components/skeletons/PageSkeleton'
import SEO from '../components/SEO'
import { formatSalary, formatDate, JOB_TYPE_BADGE, JOB_TYPE_LABEL }
  from '../utils/helpers'
import toast from 'react-hot-toast'

function JobDetail() {
  const { id }           = useParams()
  const navigate         = useNavigate()
  const { isLoggedIn, isAdmin } = useAuth()
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [coverLetter, setCoverLetter]     = useState('')
  const [resumeFile, setResumeFile]       = useState(null)
  const fileInputRef     = useRef()

  const { data: job, isLoading, isError } = useJob(id)
  const applyMutation = useApplyToJob()

  const handleApply = async e => {
    e.preventDefault()
    if (!resumeFile) { toast.error('Please upload your resume'); return }

    const formData = new FormData()
    formData.append('resume', resumeFile)
    formData.append('coverLetter', coverLetter)

    // 🔖 FormData for multipart/form-data
    // Combines file + text in one HTTP request
    // Content-Type set automatically by browser
    applyMutation.mutate(
      { jobId: id, formData },
      { onSuccess: () => { setShowApplyForm(false); setCoverLetter(''); setResumeFile(null) } }
    )
  }

  if (isLoading) return <JobDetailSkeleton />
  if (isError || !job) return (
    <div className="container page" style={{ textAlign: 'center' }}>
      <h2>Job not found</h2>
      <button className="btn btn-outline" style={{ marginTop: '1rem' }}
        onClick={() => navigate('/')}>
        Browse Jobs
      </button>
    </div>
  )

  return (
    <>
      <SEO
        title={`${job.title} at ${job.company}`}
        description={job.description?.slice(0, 155)}
      />

      <div className="container page">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

          {/* Back button */}
          <button className="btn btn-outline btn-sm"
            style={{ marginBottom: '1.5rem' }}
            onClick={() => navigate(-1)}>
            ← Back to Jobs
          </button>

          {/* Job Header Card */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem'
            }}>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800,
                  letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                  {job.title}
                </h1>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)',
                  fontWeight: 600, marginBottom: '1rem' }}>
                  {job.company}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <span className={`badge ${JOB_TYPE_BADGE[job.jobType]}`}>
                    {JOB_TYPE_LABEL[job.jobType]}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    📍 {job.location}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 600 }}>
                    💰 {formatSalary(job.salaryMin, job.salaryMax)}
                  </span>
                  <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                    Posted {formatDate(job.createdAt)}
                  </span>
                </div>
              </div>

              {/* Apply button */}
              {!isAdmin && (
                <div>
                  {isLoggedIn ? (
                    <button className="btn btn-primary"
                      style={{ padding: '0.75rem 2rem' }}
                      onClick={() => setShowApplyForm(true)}>
                      Apply Now
                    </button>
                  ) : (
                    <button className="btn btn-primary"
                      style={{ padding: '0.75rem 2rem' }}
                      onClick={() => navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } })}>
                      Login to Apply
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Job Description */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Job Description
            </h2>
            <div style={{
              lineHeight: 1.8, color: 'var(--text-secondary)',
              whiteSpace: 'pre-line'
            }}>
              {job.description}
            </div>
          </div>

          {/* Apply Form */}
          {showApplyForm && (
            <div className="card" style={{
              border: '2px solid var(--primary)',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                Apply for {job.title}
              </h2>
              <form onSubmit={handleApply}>

                {/* Resume Upload */}
                <div className="form-group">
                  <label className="form-label">Resume (PDF) *</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)',
                      padding: '2rem', textAlign: 'center', cursor: 'pointer',
                      transition: 'border-color 0.15s',
                      background: resumeFile ? '#f0fdf4' : 'transparent'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    {resumeFile ? (
                      <div>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✅</div>
                        <p style={{ fontWeight: 600, color: 'var(--success)' }}>
                          {resumeFile.name}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Click to change
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
                        <p style={{ fontWeight: 600 }}>Click to upload your resume</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          PDF only, max 5MB
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file" accept=".pdf"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file && file.type !== 'application/pdf') {
                        toast.error('Only PDF files are accepted')
                        return
                      }
                      if (file && file.size > 5 * 1024 * 1024) {
                        toast.error('File too large. Max 5MB')
                        return
                      }
                      setResumeFile(file || null)
                    }}
                  />
                </div>

                {/* Cover Letter */}
                <div className="form-group">
                  <label className="form-label">Cover Letter (Optional)</label>
                  <textarea
                    className="form-input"
                    rows={5} placeholder="Tell us why you're a great fit..."
                    value={coverLetter}
                    onChange={e => setCoverLetter(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-primary" type="submit"
                    disabled={applyMutation.isPending}>
                    {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
                  </button>
                  <button className="btn btn-outline" type="button"
                    onClick={() => setShowApplyForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default JobDetail