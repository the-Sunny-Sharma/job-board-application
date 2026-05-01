import { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser  = localStorage.getItem('user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = authData => {
    setToken(authData.token)
    setUser({ name: authData.name, email: authData.email, role: authData.role })
    localStorage.setItem('token', authData.token)
    localStorage.setItem('user', JSON.stringify({
      name: authData.name, email: authData.email, role: authData.role
    }))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      isLoggedIn: !!token,
      isAdmin: user?.role === 'ROLE_ADMIN',
      login, logout
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}