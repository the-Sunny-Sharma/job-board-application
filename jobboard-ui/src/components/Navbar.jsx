import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import toast from 'react-hot-toast'

function Navbar() {
  const { isLoggedIn, isAdmin, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <nav style={{
      background: '#0f172a', height: '64px',
      display: 'flex', alignItems: 'center',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 1px 0 rgba(255,255,255,0.08)'
    }}>
      <div className="container" style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', width: '100%'
      }}>
        {/* Brand */}
        <Link to="/" style={{
          color: 'white', textDecoration: 'none',
          fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.02em'
        }}>
          💼 JobBoard
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" style={{
            color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
            fontSize: '0.9rem', transition: 'color 0.15s'
          }}>
            Browse Jobs
          </Link>

          {isLoggedIn ? (
            <>
              <Link to="/dashboard" style={{
                color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem'
              }}>
                {isAdmin ? 'Admin Panel' : 'My Applications'}
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  fontSize: '0.72rem', fontWeight: 700,
                  padding: '0.2rem 0.6rem', borderRadius: '20px',
                  background: isAdmin ? '#7c3aed' : '#2563eb', color: 'white'
                }}>
                  {isAdmin ? 'ADMIN' : 'USER'}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                  {user?.name}
                </span>
                <button className="btn btn-outline btn-sm"
                  style={{ color: 'rgba(255,255,255,0.7)',
                    borderColor: 'rgba(255,255,255,0.2)' }}
                  onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={{
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none', fontSize: '0.9rem'
              }}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar