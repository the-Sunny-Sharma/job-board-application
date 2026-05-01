export function JobDetailSkeleton() {
  return (
    <div className="card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <div className="skeleton" style={{ width: '50%', height: '32px', marginBottom: '1rem' }} />
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {[80, 100, 90].map((w, i) => (
          <div key={i} className="skeleton"
            style={{ width: w, height: '24px', borderRadius: '20px' }} />
        ))}
      </div>
      {[100, 90, 100, 70, 85].map((w, i) => (
        <div key={i} className="skeleton"
          style={{ width: `${w}%`, height: '14px', marginBottom: '0.75rem' }} />
      ))}
      <div className="skeleton" style={{ width: '140px', height: '42px',
        borderRadius: '6px', marginTop: '1.5rem' }} />
    </div>
  )
}