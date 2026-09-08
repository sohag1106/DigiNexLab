// Auth context: holds the logged-in user, exposes login/logout/update, and
// guards the portal routes.
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, setToken, getToken } from './api'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // try to restore session
    (async () => {
      if (!getToken()) {
        setLoading(false)
        return
      }
      try {
        const { user } = await api('/auth/me')
        setUser(user)
      } catch {
        setToken(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await api('/auth/login', { method: 'POST', body: { email, password } })
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  const refresh = useCallback(async () => {
    const { user } = await api('/auth/me')
    setUser(user)
    return user
  }, [])

  const isAdmin = user && (user.role === 'owner' || user.role === 'admin')

  return (
    <AuthCtx.Provider value={{ user, setUser, login, logout, refresh, loading, isAdmin }}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  return useContext(AuthCtx)
}
