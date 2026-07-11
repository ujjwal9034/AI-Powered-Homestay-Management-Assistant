/**
 * OAuthCallback — Handles the redirect from Google OAuth.
 *
 * Week 6 — Extracts the JWT token from URL query params,
 *          calls loginWithToken(), and redirects to /dashboard.
 */
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const { loginWithToken } = useAuth()
  const { darkMode } = useTheme()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token')
      const errorParam = searchParams.get('error')

      if (errorParam) {
        setError('Google authentication failed. Please try again.')
        setTimeout(() => navigate('/login'), 3000)
        return
      }

      if (!token) {
        setError('No authentication token received.')
        setTimeout(() => navigate('/login'), 3000)
        return
      }

      const result = await loginWithToken(token)

      if (result.success) {
        navigate('/dashboard', { replace: true })
      } else {
        setError(result.message || 'Authentication failed')
        setTimeout(() => navigate('/login'), 3000)
      }
    }

    handleCallback()
  }, [searchParams, loginWithToken, navigate])

  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <div className="flex flex-col items-center gap-4">
            <span className="text-5xl">❌</span>
            <h2 className={`text-xl font-heading font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Authentication Failed
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {error}
            </p>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Redirecting to login...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
            <h2 className={`text-xl font-heading font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Completing Sign In...
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Please wait while we set up your account
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
