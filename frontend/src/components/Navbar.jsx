/**
 * Navbar — Main navigation with auth-aware UI.
 * Shows Sign In when logged out, and user avatar + Logout when logged in.
 */
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/dashboard', label: 'Dashboard' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { darkMode, toggleDarkMode } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    setMobileOpen(false)
    navigate('/')
  }

  return (
    <header className={`sticky top-0 z-50 border-b shadow-sm backdrop-blur-lg ${darkMode ? 'bg-dark-900/80 border-gray-700/60' : 'bg-white/80 border-gray-200/60'}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl">🏡</span>
          <span className="text-xl font-heading font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent group-hover:from-primary-500 group-hover:to-accent-500 transition-all duration-300">
            StayWise
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? darkMode
                        ? 'bg-primary-900/40 text-primary-400'
                        : 'bg-primary-50 text-primary-700'
                      : darkMode
                      ? 'text-gray-400 hover:text-primary-400 hover:bg-gray-800'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Theme toggle + Auth button + mobile toggle */}
        <div className="flex items-center gap-3">
          {/* Dark mode toggle button */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${darkMode ? 'text-yellow-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Auth: Show user dropdown or Sign In button */}
          {isAuthenticated ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer ${darkMode ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className={`text-sm font-medium max-w-[100px] truncate ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
                <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''} ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile dropdown */}
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className={`absolute right-0 top-full mt-2 w-56 rounded-xl border shadow-xl z-50 overflow-hidden ${darkMode ? 'bg-dark-800 border-gray-700 shadow-black/30' : 'bg-white border-gray-200 shadow-gray-200/50'}`}
                    style={{ animation: 'slideDown 0.2s ease-out' }}
                  >
                    <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <div className="flex items-center gap-1.5 justify-between">
                        <p className={`text-sm font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.name}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          user?.role === 'admin'
                            ? darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600'
                            : user?.role === 'owner'
                            ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'
                            : darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {user?.role === 'owner' ? 'Host' : user?.role === 'customer' ? 'Guest' : user?.role}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 truncate ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <span>📊</span> Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <span>👤</span> Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${darkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'}`}
                      >
                        <span>🚪</span> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden md:inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Sign In
            </Link>
          )}

          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors cursor-pointer ${darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className={`px-4 pb-4 space-y-1 border-t ${darkMode ? 'border-gray-700 bg-dark-900' : 'border-gray-100 bg-white'}`}>
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? darkMode
                      ? 'bg-primary-900/40 text-primary-400'
                      : 'bg-primary-50 text-primary-700'
                    : darkMode
                    ? 'text-gray-400 hover:bg-gray-800 hover:text-primary-400'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-primary-600'
                }`
              }
            >
              {label}
            </NavLink>
          ))}

          {/* Mobile auth section */}
          {isAuthenticated ? (
            <>
              <div className={`mx-4 my-2 pt-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.name}</p>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        user?.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-400'
                          : user?.role === 'owner'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {user?.role === 'owner' ? 'Host' : user?.role === 'customer' ? 'Guest' : user?.role}
                      </span>
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{user?.email}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className={`block w-full text-center mt-2 px-4 py-2.5 rounded-full border text-sm font-semibold transition-colors cursor-pointer ${darkMode ? 'border-red-800 text-red-400 hover:bg-red-900/20' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="block text-center mt-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold shadow-lg shadow-primary-500/25"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
