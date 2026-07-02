/**
 * AuthContext — Provides authentication state across the application.
 *
 * Features:
 * - Persists user session (with JWT token) in localStorage
 * - Provides login, register, and logout functions
 * - Auto-loads user from localStorage on mount
 */
import { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, registerUser, getMe } from '../services/api'

const AuthContext = createContext()

/**
 * Custom hook for consuming the auth context.
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

/**
 * AuthProvider wraps the app and exposes auth state + functions.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('staywise-user')
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        setUser(parsed)
      } catch {
        localStorage.removeItem('staywise-user')
      }
    }
    setLoading(false)
  }, [])

  /**
   * Register a new account
   */
  const register = async (name, email, password) => {
    const result = await registerUser({ name, email, password })
    if (result.success) {
      const userData = result.data
      setUser(userData)
      localStorage.setItem('staywise-user', JSON.stringify(userData))
    }
    return result
  }

  /**
   * Login with credentials
   */
  const login = async (email, password) => {
    const result = await loginUser({ email, password })
    if (result.success) {
      const userData = result.data
      setUser(userData)
      localStorage.setItem('staywise-user', JSON.stringify(userData))
    }
    return result
  }

  /**
   * Logout — clear user state and localStorage
   */
  const logout = () => {
    setUser(null)
    localStorage.removeItem('staywise-user')
  }

  /**
   * Check if user is currently authenticated
   */
  const isAuthenticated = !!user?.token

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
