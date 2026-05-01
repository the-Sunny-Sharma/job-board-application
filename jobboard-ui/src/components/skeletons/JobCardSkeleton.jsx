// 🔖 Skeleton Loading
// Matches the exact shape of JobCard
// User sees layout immediately — no blank screen
function JobCardSkeleton() {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="skeleton" style={{ width: '60%', height: '20px' }} />
        <div className="skeleton" style={{ width: '70px', height: '22px', borderRadius: '20px' }} />
      </div>
      <div className="skeleton" style={{ width: '40%', height: '16px' }} />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div className="skeleton" style={{ width: '80px', height: '24px', borderRadius: '20px' }} />
        <div className="skeleton" style={{ width: '90px', height: '24px', borderRadius: '20px' }} />
      </div>
      <div className="skeleton" style={{ width: '100%', height: '14px' }} />
      <div className="skeleton" style={{ width: '80%',  height: '14px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
        <div className="skeleton" style={{ width: '100px', height: '16px' }} />
        <div className="skeleton" style={{ width: '80px',  height: '34px', borderRadius: '6px' }} />
      </div>
    </div>
  )
}

export function JobGridSkeleton({ count = 6 }) {
  return (
    <div className="jobs-grid">
      {Array.from({ length: count }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  )
}

export default JobCardSkeleton