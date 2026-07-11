/**
 * AuthContext — Provides authentication state across the application.
 *
 * Week 6 — Enhanced with:
 * - Token verification on mount (calls getMe to validate stored JWT)
 * - loginWithToken() for OAuth callback flow
 * - Backend logout call
 * - Graceful handling of expired/invalid tokens
 */
import { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, registerUser, logoutUser, getMe } from '../services/api'

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

  /**
   * Verify token on mount.
   * If a token exists in localStorage, call getMe to verify it's still valid.
   * If invalid, clear the stored data.
   */
  useEffect(() => {
    const verifyToken = async () => {
      const savedUser = localStorage.getItem('staywise-user')

      if (!savedUser) {
        setLoading(false)
        return
      }

      try {
        const parsed = JSON.parse(savedUser)

        if (!parsed?.token) {
          localStorage.removeItem('staywise-user')
          setLoading(false)
          return
        }

        // Verify token by calling getMe
        const result = await getMe()

        if (result.success) {
          // Update user data with fresh info from server, but keep the token
          setUser({
            ...result.data,
            token: parsed.token,
          })
        } else {
          // Token is invalid — clear stored data
          localStorage.removeItem('staywise-user')
          setUser(null)
        }
      } catch {
        // Token is expired or invalid — clean up
        localStorage.removeItem('staywise-user')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
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
   * Login with a token (used for OAuth callback)
   * Fetches user data using the token and stores it.
   */
  const loginWithToken = async (token) => {
    // Temporarily store the token so the Axios interceptor can use it
    const tempUser = { token }
    localStorage.setItem('staywise-user', JSON.stringify(tempUser))

    try {
      const result = await getMe()

      if (result.success) {
        const userData = { ...result.data, token }
        setUser(userData)
        localStorage.setItem('staywise-user', JSON.stringify(userData))
        return { success: true }
      } else {
        localStorage.removeItem('staywise-user')
        return { success: false, message: 'Failed to fetch user data' }
      }
    } catch (err) {
      localStorage.removeItem('staywise-user')
      return { success: false, message: err.message || 'OAuth login failed' }
    }
  }

  /**
   * Logout — call backend, clear user state and localStorage
   */
  const logout = async () => {
    try {
      await logoutUser()
    } catch {
      // Ignore errors — we still want to clear the local state
    }
    setUser(null)
    localStorage.removeItem('staywise-user')
  }

  /**
   * Check if user is currently authenticated
   */
  const isAuthenticated = !!user?.token

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout, loginWithToken }}>
      {children}
    </AuthContext.Provider>
  )
}
