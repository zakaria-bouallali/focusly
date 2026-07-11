import { createContext, useContext, useState, useCallback } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

async function ensureCsrfCookie() {
  await api.get('/sanctum/csrf-cookie', { baseURL: '/' })
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('focusly_user') || localStorage.getItem('taskpilot_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })

  const login = useCallback(async (email, password) => {
    await ensureCsrfCookie()
    const { data } = await api.post('/login', { email, password })
    localStorage.setItem('focusly_token', data.token)
    localStorage.setItem('focusly_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }, [])

  const register = useCallback(async (name, email, password) => {
    await ensureCsrfCookie()
    const { data } = await api.post('/register', {
      name, email, password, password_confirmation: password,
    })
    localStorage.setItem('focusly_token', data.token)
    localStorage.setItem('focusly_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }, [])

  const logout = useCallback(async () => {
    try { await api.post('/logout') } catch {}
    localStorage.removeItem('focusly_token')
    localStorage.removeItem('focusly_user')
    localStorage.removeItem('taskpilot_token')
    localStorage.removeItem('taskpilot_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
