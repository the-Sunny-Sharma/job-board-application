// Format salary range for display
export function formatSalary(min, max) {
  if (!min && !max) return 'Salary not disclosed'
  const fmt = n => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
    if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}K`
    return `₹${n}`
  }
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  return `Up to ${fmt(max)}`
}

// Format date relative or absolute
export function formatDate(dateStr) {
  const date = new Date(dateStr)
  const now  = new Date()
  const diff = Math.floor((now - date) / 1000)

  if (diff < 60)     return 'Just now'
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`

  return date.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

// Job type badge color mapping
export const JOB_TYPE_BADGE = {
  FULL_TIME:  'badge-blue',
  PART_TIME:  'badge-orange',
  REMOTE:     'badge-purple',
  CONTRACT:   'badge-gray',
  INTERNSHIP: 'badge-green',
}

export const JOB_TYPE_LABEL = {
  FULL_TIME:  'Full Time',
  PART_TIME:  'Part Time',
  REMOTE:     'Remote',
  CONTRACT:   'Contract',
  INTERNSHIP: 'Internship',
}

// Application status badge
export const STATUS_BADGE = {
  PENDING:   'badge-gray',
  REVIEWING: 'badge-blue',
  ACCEPTED:  'badge-green',
  REJECTED:  'badge-red',
}

// Debounce — delay function execution
// 🔖 Used for search inputs to avoid API call on every keystroke
export function debounce(fn, delay = 400) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}