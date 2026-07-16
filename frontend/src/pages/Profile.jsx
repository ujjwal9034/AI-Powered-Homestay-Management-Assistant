/**
 * Profile — User profile page displaying account information and offering editing.
 *
 * Supports inline editing of Name, Phone number, and Avatar URL.
 * Also supports changing password for email/password based accounts.
 * Fully styled with glassmorphic cards, validation feedback, and dark/light modes.
 */
import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { updateProfile } from '../services/api'
import {
  User,
  Mail,
  Phone,
  Image as ImageIcon,
  Lock,
  Shield,
  Calendar,
  Edit3,
  Save,
  X,
  KeyRound,
  CircleCheck,
  CircleX,
  Globe,
} from 'lucide-react'

export default function Profile() {
  const { darkMode } = useTheme()
  const { user, updateUser } = useAuth()

  // Edit states
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [avatar, setAvatar] = useState(user?.avatar || '')

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // UI state
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown'

  const accountType = user?.googleId ? 'Google OAuth' : 'Email & Password'

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError })
    setTimeout(() => setToast(null), 3000)
  }

  const handleCancel = () => {
    setName(user?.name || '')
    setPhone(user?.phone || '')
    setAvatar(user?.avatar || '')
    setPassword('')
    setConfirmPassword('')
    setShowPasswordChange(false)
    setIsEditing(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      showToast('Name cannot be empty', true)
      return
    }

    if (showPasswordChange) {
      if (password.length < 6) {
        showToast('Password must be at least 6 characters long', true)
        return
      }
      if (password !== confirmPassword) {
        showToast('Passwords do not match', true)
        return
      }
    }

    try {
      setLoading(true)
      const payload = { name, phone, avatar }
      if (showPasswordChange && password) {
        payload.password = password
      }

      const res = await updateProfile(payload)
      if (res.success) {
        // Update user inside context (which updates localStorage)
        updateUser(res.data)
        setIsEditing(false)
        setPassword('')
        setConfirmPassword('')
        setShowPasswordChange(false)
        showToast('Profile updated successfully!')
      } else {
        showToast(res.message || 'Failed to update profile', true)
      }
    } catch (err) {
      showToast(err.message || 'An error occurred', true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-8 sm:py-12 relative min-h-[calc(100vh-4rem)]">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2 ${
            toast.isError
              ? darkMode
                ? 'bg-red-900/90 text-red-200 border border-red-800'
                : 'bg-red-500 text-white'
              : darkMode
              ? 'bg-green-900/90 text-green-200 border border-green-800'
              : 'bg-green-500 text-white'
          }`}
          style={{ animation: 'slideDown 0.3s ease-out' }}
        >
          {toast.isError ? <CircleX className="w-4.5 h-4.5" /> : <CircleCheck className="w-4.5 h-4.5" />}
          {toast.msg}
        </div>
      )}

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10">
        <div className={`absolute top-0 right-0 w-[40rem] h-[40rem] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 ${darkMode ? 'bg-primary-900/20' : 'bg-primary-100/40'}`} />
        <div className={`absolute bottom-0 left-0 w-[30rem] h-[30rem] rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 ${darkMode ? 'bg-accent-900/15' : 'bg-accent-100/30'}`} />
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-heading font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              My Profile
            </h1>
            <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Manage your personal information and settings
            </p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/25 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Card */}
        <div className={`rounded-2xl border backdrop-blur-xl shadow-xl overflow-hidden ${darkMode ? 'border-gray-700 bg-dark-800/80 shadow-black/20' : 'border-gray-200 bg-white/80 shadow-gray-200/50'}`}>
          {/* Cover bar */}
          <div className="relative">
            <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-700" />
            <div className="absolute -bottom-12 left-8">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${name}`
                  }}
                  className="w-24 h-24 rounded-2xl border-4 shadow-lg object-cover bg-white"
                  style={{ borderColor: darkMode ? '#1a1f2e' : '#ffffff' }}
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-2xl border-4 shadow-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-heading font-bold"
                  style={{ borderColor: darkMode ? '#1a1f2e' : '#ffffff' }}
                >
                  {name.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
          </div>

          {/* Form / Content area */}
          <form onSubmit={handleSave} className="pt-16 pb-8 px-8 space-y-6">
            {!isEditing ? (
              // Display mode
              <div className="space-y-6">
                <div>
                  <h2 className={`text-2xl font-heading font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user?.name || 'User'}
                  </h2>
                  <p className={`text-sm mt-1 flex items-center gap-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Mail className="w-3.5 h-3.5" />
                    {user?.email || 'No email'}
                  </p>
                </div>

                {/* Details grid */}
                <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                  {/* Phone */}
                  <div className={`flex items-center justify-between py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-primary-500" />
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone</p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Contact number</p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {user?.phone || 'Not provided'}
                    </span>
                  </div>

                  {/* Role */}
                  <div className={`flex items-center justify-between py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-primary-500" />
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Role</p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Your access level</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
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
                  <div className={`flex items-center justify-between py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                      <Lock className="w-4 h-4 text-primary-500" />
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Account Type</p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>How you signed in</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      user?.googleId
                        ? darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'
                        : darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'
                    }`}>
                      {user?.googleId && (
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        </svg>
                      )}
                      {accountType}
                    </span>
                  </div>

                  {/* Joined date */}
                  <div className={`flex items-center justify-between py-3`}>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-primary-500" />
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Member Since</p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>When you joined StayWise</p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {joinedDate}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              // Edit mode
              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full rounded-xl border pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                        darkMode ? 'bg-dark-900 border-gray-600 text-white focus:ring-primary-500/30' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-primary-500/20'
                      }`}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full rounded-xl border pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                        darkMode ? 'bg-dark-900 border-gray-600 text-white focus:ring-primary-500/30' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-primary-500/20'
                      }`}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                {/* Avatar URL */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Avatar URL
                  </label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      className={`w-full rounded-xl border pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                        darkMode ? 'bg-dark-900 border-gray-600 text-white focus:ring-primary-500/30' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-primary-500/20'
                      }`}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>

                {/* Password field toggle for password users */}
                {!user?.googleId && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => setShowPasswordChange(!showPasswordChange)}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${darkMode ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-500'}`}
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      {showPasswordChange ? 'Cancel password change' : 'Change account password?'}
                    </button>

                    {showPasswordChange && (
                      <div className="mt-4 grid sm:grid-cols-2 gap-4" style={{ animation: 'slideDown 0.2s ease-out' }}>
                        <div>
                          <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            New Password
                          </label>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                              darkMode ? 'bg-dark-900 border-gray-600 text-white focus:ring-primary-500/30' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-primary-500/20'
                            }`}
                            placeholder="Min 6 chars"
                            required={showPasswordChange}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Confirm Password
                          </label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                              darkMode ? 'bg-dark-900 border-gray-600 text-white focus:ring-primary-500/30' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-primary-500/20'
                            }`}
                            placeholder="Confirm password"
                            required={showPasswordChange}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                      darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-250 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold shadow-lg shadow-primary-500/25 hover:scale-102 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Security info card */}
        <div className={`mt-6 rounded-2xl border p-6 ${darkMode ? 'border-gray-700 bg-dark-800/80' : 'border-gray-200 bg-white/80'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-primary-500" />
            <h3 className={`font-heading font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Security Information</h3>
          </div>
          <div className={`rounded-xl border p-4 text-sm leading-relaxed ${darkMode ? 'bg-green-900/10 border-green-800 text-green-300' : 'bg-green-50/50 border-green-100 text-green-800'}`}>
            Your profile details and session keys are secured with JWT authentication.
            {user?.googleId
              ? ' Authenticated safely via Google OAuth 2.0. To update your password, use your Google Account settings.'
              : ' Your password is encrypted with salt rounds using bcrypt on our backend databases.'}
          </div>
        </div>
      </div>
    </section>
  )
}
