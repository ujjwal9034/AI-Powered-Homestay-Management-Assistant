/**
 * Onboarding Page — Role Selector for first-time Google sign-ups.
 *
 * Provides a highly polished card selector to complete user configuration.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { completeOnboarding } from '../services/api'
import { Compass, Home, ArrowRight } from 'lucide-react'

export default function Onboarding() {
  const { user, updateUser } = useAuth()
  const { darkMode } = useTheme()
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCompleteSetup = async () => {
    if (!selectedRole) return
    setLoading(true)
    setError('')

    try {
      const res = await completeOnboarding(selectedRole)
      if (res.success) {
        // Sync context state & localstorage
        updateUser({
          role: res.data.role,
          needsOnboarding: false,
          ownerStatus: res.data.ownerStatus,
        })
        
        // Route appropriately
        if (res.data.role === 'owner') {
          navigate('/dashboard', { replace: true })
        } else {
          navigate('/', { replace: true })
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete onboarding. Please try again.')
    } finally {
      setSelectedRole(null)
      setLoading(false)
    }
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className={`w-full max-w-3xl rounded-3xl border p-8 sm:p-12 backdrop-blur-md shadow-2xl transition-all ${
        darkMode ? 'border-gray-700/60 bg-dark-800/80 shadow-black/40' : 'border-gray-200/80 bg-white/90 shadow-gray-200/50'
      }`}>
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="text-xs font-bold tracking-widest uppercase text-primary-500">Welcome to StayWise, {user?.name || 'Guest'}!</span>
          <h1 className={`text-3xl font-heading font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Let's customize your experience
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Select how you would like to use StayWise to get started. You can always manage your account properties later.
          </p>
        </div>

        {error && (
          <div className="mt-8 p-4 rounded-xl text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/15">
            ⚠️ {error}
          </div>
        )}

        {/* Roles container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          {/* Guest Role Card */}
          <button
            onClick={() => setSelectedRole('customer')}
            className={`text-left p-6 sm:p-8 rounded-2xl border-2 transition-all duration-300 relative group cursor-pointer ${
              selectedRole === 'customer'
                ? 'border-primary-500 bg-primary-500/[0.03] shadow-lg shadow-primary-500/10'
                : darkMode
                ? 'border-gray-700/60 bg-dark-900/40 hover:border-gray-600 hover:bg-dark-900/60'
                : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100/55'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 ${
              selectedRole === 'customer'
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                : darkMode
                ? 'bg-dark-800 text-gray-400 group-hover:text-white'
                : 'bg-white text-gray-500 group-hover:text-primary-500 shadow-sm'
            }`}>
              <Compass className="w-6 h-6" />
            </div>

            <h3 className={`text-lg font-bold transition-colors ${
              selectedRole === 'customer' ? 'text-primary-500' : darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Explore & Book Stays
            </h3>
            
            <p className={`text-xs mt-2 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              I am here to find, book, and enjoy unique homestay experiences.
            </p>

            <ul className="mt-6 space-y-2.5 text-xs text-gray-400 dark:text-gray-500">
              <li className="flex items-center gap-2">
                <span className="text-primary-500">✓</span> Browse verified properties
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary-500">✓</span> Plan trips with AI Concierge
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary-500">✓</span> Secure payments & escrow protection
              </li>
            </ul>
          </button>

          {/* Host Role Card */}
          <button
            onClick={() => setSelectedRole('owner')}
            className={`text-left p-6 sm:p-8 rounded-2xl border-2 transition-all duration-300 relative group cursor-pointer ${
              selectedRole === 'owner'
                ? 'border-primary-500 bg-primary-500/[0.03] shadow-lg shadow-primary-500/10'
                : darkMode
                ? 'border-gray-700/60 bg-dark-900/40 hover:border-gray-600 hover:bg-dark-900/60'
                : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100/55'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 ${
              selectedRole === 'owner'
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                : darkMode
                ? 'bg-dark-800 text-gray-400 group-hover:text-white'
                : 'bg-white text-gray-500 group-hover:text-primary-500 shadow-sm'
            }`}>
              <Home className="w-6 h-6" />
            </div>

            <h3 className={`text-lg font-bold transition-colors ${
              selectedRole === 'owner' ? 'text-primary-500' : darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              List & Manage Properties
            </h3>
            
            <p className={`text-xs mt-2 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              I want to rent out spaces, host guests, and manage dashboard details.
            </p>

            <ul className="mt-6 space-y-2.5 text-xs text-gray-400 dark:text-gray-500">
              <li className="flex items-center gap-2">
                <span className="text-primary-500">✓</span> List property with AI copywriter
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary-500">✓</span> Track monthly revenue metrics
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary-500">✓</span> Dynamic reservation management
              </li>
            </ul>
          </button>
        </div>

        {/* CTA Actions */}
        <div className="mt-10 pt-8 border-t border-gray-100/10 flex justify-end">
          <button
            onClick={handleCompleteSetup}
            disabled={!selectedRole || loading}
            className={`px-8 py-3.5 rounded-2xl text-xs font-bold text-white shadow-lg active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer ${
              !selectedRole 
                ? 'bg-gray-450 dark:bg-gray-700 cursor-not-allowed opacity-50 shadow-none' 
                : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-primary-500/20'
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Complete Setup <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  )
}
