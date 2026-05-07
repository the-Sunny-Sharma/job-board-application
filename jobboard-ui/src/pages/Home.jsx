import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useJobs } from '../hooks/useJobs'
import { jobKeys } from '../hooks/useJobs'
import { jobApi } from '../api/jobApi'
import { JobGridSkeleton } from '../components/skeletons/JobCardSkeleton'
import SEO from '../components/SEO'
import JobCard from '../components/JobCard'
import JobFilters from '../components/JobFilters'
import { debounce } from '../utils/helpers'

const EMPTY_FILTERS = {
  page: 0, size: 9,
  title: '', location: '', jobType: '',
  salaryMin: '', salaryMax: ''
}

function Home() {
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const queryClient           = useQueryClient()
  const navigate              = useNavigate()

  const { data, isLoading, isError, isFetching } = useJobs(filters)

  const jobs       = data?.content       ?? []
  const totalPages = data?.totalPages    ?? 0
  const totalJobs  = data?.totalElements ?? 0

  // 🔖 Debounced search — waits 400ms after user stops typing
  const debouncedSearch = useCallback(
    debounce(value => {
      setFilters(prev => ({ ...prev, title: value, page: 0 }))
    }, 400),
    []
  )

  // 🔖 Prefetch next page while user reads current page
  // When totalPages > 1, silently load page 2 in background
  const prefetchNextPage = useCallback(() => {
    if (filters.page < totalPages - 1) {
      const nextFilters = { ...filters, page: filters.page + 1 }
      queryClient.prefetchQuery({
        queryKey: jobKeys.list(nextFilters),
        queryFn:  () => jobApi.getJobs(nextFilters).then(r => r.data.data),
        staleTime: 1000 * 60,
      })
    }
  }, [filters, totalPages, queryClient])

  // 🔖 Prefetch job detail on card hover
  // User hovers job card → detail data loads in background
  // When they click → instant load, no spinner
  const prefetchJobDetail = useCallback((jobId) => {
    queryClient.prefetchQuery({
      queryKey: jobKeys.detail(jobId),
      queryFn:  () => jobApi.getJobById(jobId).then(r => r.data.data),
      staleTime: 1000 * 60 * 5,
    })
  }, [queryClient])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 0 }))
  }

  const handleReset = () => setFilters(EMPTY_FILTERS)

  return (
    <>
      {/* 🔖 SEO — dynamic meta tags for this page */}
      <SEO
        title="Browse Jobs"
        description={`Explore ${totalJobs}+ tech jobs. Find Full Time, Remote, Contract and Internship roles.`}
      />

      {/* ── Hero ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        padding: '3.5rem 0 4rem',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(37,99,235,0.15) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '20px', padding: '0.35rem 1rem',
            marginBottom: '1.25rem', fontSize: '0.82rem', color: '#a5b4fc'
          }}>
            ✨ Find your next opportunity
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800,
            color: 'white', marginBottom: '1rem', lineHeight: 1.2,
            letterSpacing: '-0.03em'
          }}>
            Find Jobs That <span style={{
              background: 'linear-gradient(135deg, #6366f1, #2563eb)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>Match Your Skills</span>
          </h1>

          <p style={{
            fontSize: '1.05rem', color: 'rgba(255,255,255,0.6)',
            maxWidth: '520px', margin: '0 auto 2rem'
          }}>
            {totalJobs > 0
              ? `${totalJobs.toLocaleString()} opportunities waiting for you`
              : 'Thousands of opportunities waiting for you'}
          </p>

          {/* Search bar */}
          <div style={{
            display: 'flex', maxWidth: '580px', margin: '0 auto',
            background: 'white', borderRadius: '12px',
            padding: '0.4rem', boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <input
              type="text"
              placeholder="Search by title, skill, company..."
              defaultValue={filters.title}
              onChange={e => debouncedSearch(e.target.value)}
              style={{
                flex: 1, border: 'none', outline: 'none', padding: '0.6rem 1rem',
                fontSize: '0.95rem', background: 'transparent', borderRadius: '8px'
              }}
            />
            <button className="btn btn-primary" style={{ borderRadius: '8px' }}>
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="container page">
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }}>

          {/* Filters sidebar */}
          <div style={{ position: 'sticky', top: '80px' }}>
            <JobFilters
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleReset}
            />
          </div>

          {/* Jobs section */}
          <div>
            {/* Results header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '1.25rem'
            }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  {isLoading ? 'Loading...' : `${totalJobs.toLocaleString()} Jobs Found`}
                </h2>
                {isFetching && !isLoading && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Updating...
                  </span>
                )}
              </div>
              <select
                className="form-input"
                style={{ width: 'auto', padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
                onChange={e => handleFilterChange('jobType', e.target.value)}
                value={filters.jobType}
              >
                <option value="">All Types</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="REMOTE">Remote</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>

            {/* 🔖 Skeleton while loading */}
            {isLoading && <JobGridSkeleton count={6} />}

            {isError && (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--danger)' }}>
                Failed to load jobs. Please try again.
              </div>
            )}

            {!isLoading && jobs.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
                <h3>No jobs found</h3>
                <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem' }}>
                  Try adjusting your filters
                </p>
                <button className="btn btn-outline" onClick={handleReset}>
                  Clear Filters
                </button>
              </div>
            )}

            {/* Job grid with prefetch on hover */}
            {!isLoading && jobs.length > 0 && (
              <div className="jobs-grid">
                {jobs.map(job => (
                  <div
                    key={job.id}
                    // 🔖 Prefetch job detail on hover
                    onMouseEnter={() => prefetchJobDetail(job.id)}
                  >
                    <JobCard job={job} />
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex', justifyContent: 'center',
                alignItems: 'center', gap: '0.75rem', marginTop: '2rem'
              }}>
                <button
                  className="btn btn-outline btn-sm"
                  disabled={filters.page === 0}
                  onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
                >
                  ← Prev
                </button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(0,
                    Math.min(filters.page - 2, totalPages - 5)) + i
                  return (
                    <button
                      key={pageNum}
                      className="btn btn-sm"
                      style={{
                        background: pageNum === filters.page
                          ? 'var(--primary)' : 'transparent',
                        color: pageNum === filters.page
                          ? 'white' : 'var(--text-secondary)',
                        border: '1.5px solid',
                        borderColor: pageNum === filters.page
                          ? 'var(--primary)' : 'var(--border)'
                      }}
                      onClick={() => setFilters(p => ({ ...p, page: pageNum }))}
                    >
                      {pageNum + 1}
                    </button>
                  )
                })}

                <button
                  className="btn btn-outline btn-sm"
                  disabled={filters.page >= totalPages - 1}
                  // 🔖 Prefetch next page when hovering Next button
                  onMouseEnter={prefetchNextPage}
                  onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CSS ── */}
      <style>{`
        .jobs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
        }
        @media (max-width: 768px) {
          .jobs-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  )
}

export default Home