/**
 * Profile — User profile page displaying account information.
 *
 * Week 6 — Protected route showing user details, account type,
 *          and role information with the StayWise design system.
 */
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { darkMode } = useTheme()
  const { user } = useAuth()

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown'

  const accountType = user?.googleId ? 'Google OAuth' : 'Email & Password'

  return (
    <section className="py-8 sm:py-12">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10">
        <div className={`absolute top-0 right-0 w-[40rem] h-[40rem] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 ${darkMode ? 'bg-primary-900/20' : 'bg-primary-100/40'}`} />
        <div className={`absolute bottom-0 left-0 w-[30rem] h-[30rem] rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 ${darkMode ? 'bg-accent-900/15' : 'bg-accent-100/30'}`} />
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-2xl sm:text-3xl font-heading font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            My Profile
          </h1>
          <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Your account information and settings
          </p>
        </div>

        {/* Profile Card */}
        <div className={`rounded-2xl border backdrop-blur-xl shadow-xl overflow-hidden ${darkMode ? 'border-gray-700 bg-dark-800/80 shadow-black/20' : 'border-gray-200 bg-white/80 shadow-gray-200/50'}`}>
          {/* Profile header with avatar */}
          <div className="relative">
            <div className={`h-32 bg-gradient-to-r from-primary-500 to-primary-700`} />
            <div className="absolute -bottom-12 left-8">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-2xl border-4 shadow-lg object-cover"
                  style={{ borderColor: darkMode ? '#1a1f2e' : '#ffffff' }}
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-2xl border-4 shadow-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-heading font-bold"
                  style={{ borderColor: darkMode ? '#1a1f2e' : '#ffffff' }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
          </div>

          {/* Profile info */}
          <div className="pt-16 pb-8 px-8">
            <h2 className={`text-2xl font-heading font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {user?.name || 'User'}
            </h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {user?.email || 'No email'}
            </p>

            {/* Details grid */}
            <div className="mt-8 space-y-4">
              {/* Role */}
              <div className={`flex items-center justify-between py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">👤</span>
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Role</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Your access level</p>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${
                  user?.role === 'admin'
                    ? darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600'
                    : user?.role === 'owner'
                    ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'
                    : darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'
                }`}>
                  {user?.role === 'owner' ? 'Host' : user?.role === 'customer' ? 'Guest' : user?.role || 'Guest'}
                </span>
              </div>

              {/* Account type */}
              <div className={`flex items-center justify-between py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔐</span>
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Account Type</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>How you signed in</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  user?.googleId
                    ? darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'
                    : darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'
                }`}>
                  {user?.googleId && (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    </svg>
                  )}
                  {accountType}
                </span>
              </div>

              {/* Joined date */}
              <div className={`flex items-center justify-between py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">📅</span>
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Member Since</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>When you joined StayWise</p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {joinedDate}
                </span>
              </div>

              {/* User ID */}
              <div className={`flex items-center justify-between py-4`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🆔</span>
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>User ID</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Your unique identifier</p>
                  </div>
                </div>
                <code className={`text-xs font-mono px-2 py-1 rounded-lg ${darkMode ? 'bg-dark-900 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                  {user?._id || 'N/A'}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Security info card */}
        <div className={`mt-6 rounded-2xl border p-6 ${darkMode ? 'border-gray-700 bg-dark-800/80' : 'border-gray-200 bg-white/80'}`}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl">🛡️</span>
            <h3 className={`font-heading font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Security</h3>
          </div>
          <div className={`rounded-xl border p-4 text-sm leading-relaxed ${darkMode ? 'bg-green-900/20 border-green-800 text-green-300' : 'bg-green-50/50 border-green-100 text-green-800'}`}>
            Your session is secured with JWT (JSON Web Token) authentication.
            {user?.googleId
              ? ' Your account is linked with Google OAuth 2.0 for seamless sign-in.'
              : ' Your password is encrypted with bcrypt and never stored in plain text.'
            }
          </div>
        </div>
      </div>
    </section>
  )
}
