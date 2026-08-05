import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { resetPassword } from '../services/api'
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ResetPassword() {
  const { darkMode } = useTheme()
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const res = await resetPassword(token, password)
      if (res.success) {
        setMessage(res.message)
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Token may be invalid or expired.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = `w-full rounded-xl border pl-11 pr-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
    darkMode
      ? 'bg-dark-900 border-gray-700 text-gray-100 focus:ring-primary-500/30 focus:border-primary-500'
      : 'bg-gray-50/50 border-gray-200 text-gray-900 focus:ring-primary-500/20 focus:border-primary-400'
  }`

  return (
    <section className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className={`w-full max-w-md rounded-3xl border p-8 shadow-xl ${
        darkMode ? 'border-gray-800 bg-dark-800/80 backdrop-blur-md' : 'border-gray-200 bg-white/80 backdrop-blur-md'
      }`}>
        <div className="text-center mb-8">
          <h2 className={`text-2xl font-heading font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Reset Password
          </h2>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Define a strong new password for your account
          </p>
        </div>

        {message ? (
          <div className="space-y-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {message}
            </p>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Redirecting you to the login screen...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 rounded-xl text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/15">
                ⚠️ {error}
              </div>
            )}

            <div className="space-y-1">
              <label className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Reset Password'
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors hover:text-primary-500 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Cancel and Back
              </Link>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
