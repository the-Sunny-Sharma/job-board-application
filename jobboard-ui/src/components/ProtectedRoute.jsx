import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function ProtectedRoute({ children, adminOnly = false }) {
  const { isLoggedIn, isAdmin } = useAuth()
  if (!isLoggedIn)            return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin)  return <Navigate to="/" replace />
  return children
}

export default ProtectedRoute