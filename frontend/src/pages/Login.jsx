/**
 * Login — Authentication page with real sign-in/sign-up.
 * Connects to backend /api/auth endpoints.
 *
 * Week 6 — Google OAuth button wired up. GitHub button as "Coming Soon".
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { getGoogleAuthUrl } from '../services/api'

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const { darkMode } = useTheme()
  const { login, register } = useAuth()
  const navigate = useNavigate()

  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('customer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let result
      if (isSignUp) {
        if (!name.trim()) {
          setError('Please enter your full name')
          setLoading(false)
          return
        }
        result = await register(name, email, password, role)
      } else {
        result = await login(email, password)
      }

      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(result.message || 'Something went wrong')
      }
    } catch (err) {
      // Handle validation errors from express-validator
      const data = err.response?.data
      if (data?.errors && Array.isArray(data.errors)) {
        setError(data.errors.map((e) => e.message).join('. '))
      } else {
        setError(data?.message || err.message || 'Network error — is the backend running?')
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Initiate Google OAuth login
   */
  const handleGoogleLogin = () => {
    window.location.href = getGoogleAuthUrl()
  }

  const inputClass = `w-full rounded-xl border px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${darkMode ? 'bg-dark-900 border-gray-600 text-gray-100 focus:ring-primary-500/30 focus:border-primary-500 dark:placeholder-gray-500' : 'bg-gray-50/50 border-gray-200 text-gray-900 focus:ring-primary-500/20 focus:border-primary-400'}`

  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10">
        <div className={`absolute top-0 right-0 w-[40rem] h-[40rem] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 ${darkMode ? 'bg-primary-900/20' : 'bg-primary-100/40'}`} />
        <div className={`absolute bottom-0 left-0 w-[30rem] h-[30rem] rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 ${darkMode ? 'bg-accent-900/15' : 'bg-accent-100/30'}`} />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">🏡</span>
            <span className="text-2xl font-heading font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              StayWise
            </span>
          </Link>
          <h1 className={`mt-4 text-2xl font-heading font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {isSignUp
              ? 'Start managing your homestay with AI today'
              : 'Sign in to your homestay dashboard'}
          </p>
        </div>

        {/* Card */}
        <div className={`rounded-2xl border backdrop-blur-xl shadow-xl p-8 ${darkMode ? 'border-gray-700 bg-dark-800/80 shadow-black/20' : 'border-gray-200 bg-white/80 shadow-gray-200/50'}`}>
          {/* Error message */}
          {error && (
            <div className={`mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${darkMode ? 'bg-red-900/20 border border-red-800 text-red-300' : 'bg-red-50 border border-red-200 text-red-600'}`}>
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
             {isSignUp && (
              <>
                <div>
                  <label htmlFor="name" className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ujjwal Pratap Singh"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    I want to register as a:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('customer')}
                      className={`py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                        role === 'customer'
                          ? 'bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-500/20'
                          : darkMode
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      👤 Guest
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('owner')}
                      className={`py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                        role === 'owner'
                          ? 'bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-500/20'
                          : darkMode
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      🏠 Owner
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className={inputClass}
              />
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500/20"
                  />
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Remember me</span>
                </label>
                <button type="button" className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors cursor-pointer">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </span>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className={`px-3 font-medium ${darkMode ? 'bg-dark-800 text-gray-500' : 'bg-white text-gray-400'}`}>or continue with</span>
            </div>
          </div>

          {/* Social login */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleGoogleLogin}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors duration-200 cursor-pointer ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button
              disabled
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium cursor-not-allowed opacity-50 ${darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'}`}
              title="Coming Soon"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.09.682-.218.682-.484 0-.236-.009-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .269.18.579.688.481C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              GitHub
            </button>
          </div>
        </div>

        {/* Toggle */}
        <p className={`mt-6 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            className="text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300 transition-colors cursor-pointer"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </section>
  )
}
