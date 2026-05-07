import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { jobApi } from '../api/jobApi'
import SEO from '../components/SEO'
import toast from 'react-hot-toast'

function Login() {
  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login }             = useAuth()
  const navigate              = useNavigate()
  const location              = useLocation()

  // 🔖 Redirect to page user was trying to visit
  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await jobApi.login(form)
      login(res.data.data)
      toast.success(`Welcome back, ${res.data.data.name}!`)
      // Admin goes to admin panel, user goes to previous page
      navigate(res.data.data.role === 'ROLE_ADMIN' ? '/admin' : from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEO title="Login" description="Login to your JobBoard account" />
      <div style={{
        minHeight: 'calc(100vh - 64px)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: '2rem'
      }}>
        <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👋</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Welcome Back</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Login to your account
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" required
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" required
                placeholder="Your password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.75rem' }}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem',
            fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}

export default Login