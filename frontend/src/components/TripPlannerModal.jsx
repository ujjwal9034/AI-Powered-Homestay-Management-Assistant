/**
 * TripPlannerModal — AI-powered trip itinerary generator modal.
 *
 * Props:
 * - isOpen: Boolean to control visibility
 * - onClose: Callback when modal should close
 * - location: Pre-filled location from the homestay
 */
import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { generateTripPlan } from '../services/api'

const INTEREST_OPTIONS = [
  { label: '🏔️ Adventure', value: 'Adventure' },
  { label: '🕉️ Spiritual', value: 'Spiritual' },
  { label: '🌿 Nature', value: 'Nature' },
  { label: '🍜 Food', value: 'Food' },
  { label: '🐾 Wildlife', value: 'Wildlife' },
  { label: '📸 Photography', value: 'Photography' },
  { label: '👨‍👩‍👧‍👦 Family', value: 'Family' },
]

const TRAVEL_STYLES = ['Budget', 'Standard', 'Luxury']

/**
 * Parse the raw itinerary text into structured sections for card rendering.
 */
function parseItinerary(raw) {
  const sections = []
  // Split by section headers (===== TITLE =====)
  const parts = raw.split(/={3,}\s*([^=]+?)\s*={3,}/)

  for (let i = 1; i < parts.length; i += 2) {
    const title = parts[i]?.trim()
    const content = parts[i + 1]?.trim()
    if (title && content) {
      sections.push({ title, content })
    }
  }

  // If parsing didn't produce sections, treat entire text as one section
  if (sections.length === 0 && raw.trim()) {
    sections.push({ title: 'Your Itinerary', content: raw.trim() })
  }

  return sections
}

/**
 * Get emoji and gradient for each section type
 */
function getSectionStyle(title) {
  const lower = title.toLowerCase()
  if (lower.includes('itinerary') || lower.includes('day'))
    return { emoji: '🗺️', gradient: 'from-blue-500 to-indigo-600' }
  if (lower.includes('places'))
    return { emoji: '📍', gradient: 'from-rose-500 to-pink-600' }
  if (lower.includes('food'))
    return { emoji: '🍽️', gradient: 'from-orange-500 to-amber-600' }
  if (lower.includes('budget'))
    return { emoji: '💰', gradient: 'from-emerald-500 to-green-600' }
  if (lower.includes('tips'))
    return { emoji: '💡', gradient: 'from-yellow-500 to-amber-500' }
  if (lower.includes('time') || lower.includes('visit'))
    return { emoji: '🌤️', gradient: 'from-cyan-500 to-blue-500' }
  if (lower.includes('packing'))
    return { emoji: '🎒', gradient: 'from-purple-500 to-violet-600' }
  return { emoji: '✨', gradient: 'from-primary-500 to-primary-600' }
}

export default function TripPlannerModal({ isOpen, onClose, location }) {
  const { darkMode } = useTheme()

  // Form state
  const [days, setDays] = useState(3)
  const [budget, setBudget] = useState(10000)
  const [interests, setInterests] = useState([])
  const [travelStyle, setTravelStyle] = useState('Standard')

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [itinerary, setItinerary] = useState(null)
  const [showForm, setShowForm] = useState(true)

  const toggleInterest = (value) => {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
    )
  }

  const handleGenerate = async () => {
    if (interests.length === 0) {
      setError('Please select at least one interest.')
      return
    }

    setError(null)
    setLoading(true)
    setItinerary(null)

    try {
      const res = await generateTripPlan({
        location,
        days,
        budget,
        interests,
        travelStyle,
      })
      setItinerary(res.itinerary)
      setShowForm(false)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to generate trip itinerary. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleNewPlan = () => {
    setItinerary(null)
    setShowForm(true)
    setError(null)
  }

  const handleClose = () => {
    onClose()
    // Reset state after close animation
    setTimeout(() => {
      setItinerary(null)
      setShowForm(true)
      setError(null)
      setLoading(false)
    }, 300)
  }

  if (!isOpen) return null

  const inputClass = `w-full rounded-xl border px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
    darkMode
      ? 'bg-dark-900 border-gray-600 text-gray-100 focus:ring-primary-500/30 focus:border-primary-500'
      : 'bg-gray-50/50 border-gray-200 text-gray-900 focus:ring-primary-500/20 focus:border-primary-400'
  }`

  const parsedSections = itinerary ? parseItinerary(itinerary) : []

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
        style={{ animation: 'fadeIn 200ms ease-out' }}
      />

      {/* Modal Panel */}
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${
          darkMode
            ? 'bg-dark-800 border-gray-700'
            : 'bg-white border-gray-200'
        }`}
        style={{ animation: 'slideUp 300ms ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-primary-500 to-primary-600 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
              ✨
            </div>
            <div>
              <h2 className="text-base font-heading font-bold">
                AI Trip Planner
              </h2>
              <p className="text-xs text-white/80">
                Powered by Gemini AI · {location}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer text-white"
            aria-label="Close AI Trip Planner"
          >
            ✖
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* ── Form View ── */}
          {showForm && !loading && (
            <>
              {/* Location Badge */}
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold ${
                  darkMode
                    ? 'bg-primary-500/10 border border-primary-500/20 text-primary-400'
                    : 'bg-primary-50 border border-primary-100 text-primary-600'
                }`}
              >
                📍 Destination: {location}
              </div>

              {/* Days + Budget Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    Number of Days
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={14}
                    value={days}
                    onChange={(e) =>
                      setDays(
                        Math.max(1, Math.min(14, parseInt(e.target.value) || 1))
                      )
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    Budget (₹)
                  </label>
                  <input
                    type="number"
                    min={500}
                    value={budget}
                    onChange={(e) =>
                      setBudget(Math.max(500, parseInt(e.target.value) || 500))
                    }
                    placeholder="e.g. 10000"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Interests Multi-Select Chips */}
              <div>
                <label
                  className={`block text-xs font-semibold uppercase tracking-wider mb-3 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((opt) => {
                    const selected = interests.includes(opt.value)
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggleInterest(opt.value)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                          selected
                            ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/20 scale-105'
                            : darkMode
                            ? 'bg-dark-900 border-gray-600 text-gray-300 hover:border-primary-500/40 hover:text-primary-400'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-500'
                        }`}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Travel Style Radio */}
              <div>
                <label
                  className={`block text-xs font-semibold uppercase tracking-wider mb-3 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Travel Style
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {TRAVEL_STYLES.map((style) => {
                    const selected = travelStyle === style
                    const styleEmoji =
                      style === 'Budget'
                        ? '💵'
                        : style === 'Standard'
                        ? '⭐'
                        : '👑'
                    return (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setTravelStyle(style)}
                        className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer ${
                          selected
                            ? 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/25 scale-105'
                            : darkMode
                            ? 'bg-dark-900 border-gray-600 text-gray-300 hover:border-primary-500/40'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-primary-300'
                        }`}
                      >
                        <span className="text-lg">{styleEmoji}</span>
                        {style}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div
                  className={`rounded-xl border p-4 text-sm ${
                    darkMode
                      ? 'bg-red-900/20 border-red-800/30 text-red-300'
                      : 'bg-red-50 border-red-100 text-red-600'
                  }`}
                >
                  <span className="mr-2">⚠️</span>
                  {error}
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-heading font-bold shadow-lg shadow-primary-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer text-sm"
              >
                ✨ Generate My Trip Itinerary
              </button>
            </>
          )}

          {/* ── Loading State ── */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-5">
              {/* Animated gradient spinner */}
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-gray-700" />
                <div
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin"
                  style={{ animationDuration: '0.8s' }}
                />
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/20 flex items-center justify-center text-xl">
                  ✈️
                </div>
              </div>
              <div className="text-center">
                <p
                  className={`text-sm font-heading font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Crafting your perfect itinerary...
                </p>
                <p
                  className={`text-xs mt-1.5 ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}
                >
                  Our AI is planning {days} amazing day
                  {days > 1 ? 's' : ''} in {location}
                </p>
              </div>
              {/* Animated dots */}
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Result View ── */}
          {!loading && itinerary && (
            <div className="space-y-4">
              {/* Success header */}
              <div
                className={`flex items-center gap-3 p-4 rounded-xl border ${
                  darkMode
                    ? 'bg-green-900/10 border-green-800/30'
                    : 'bg-green-50 border-green-100'
                }`}
              >
                <span className="text-2xl">🎉</span>
                <div>
                  <p
                    className={`text-sm font-heading font-bold ${
                      darkMode ? 'text-green-300' : 'text-green-700'
                    }`}
                  >
                    Your itinerary is ready!
                  </p>
                  <p
                    className={`text-xs ${
                      darkMode ? 'text-green-400/70' : 'text-green-600/70'
                    }`}
                  >
                    {days} day{days > 1 ? 's' : ''} · {travelStyle} · ₹
                    {budget?.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Itinerary Cards */}
              {parsedSections.map((section, idx) => {
                const { emoji, gradient } = getSectionStyle(section.title)
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border overflow-hidden shadow-sm ${
                      darkMode
                        ? 'border-gray-700 bg-dark-800'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {/* Section Header */}
                    <div
                      className={`px-5 py-3 bg-gradient-to-r ${gradient} text-white flex items-center gap-2`}
                    >
                      <span className="text-lg">{emoji}</span>
                      <h3 className="text-sm font-heading font-bold">
                        {section.title}
                      </h3>
                    </div>
                    {/* Section Body */}
                    <div
                      className={`px-5 py-4 text-sm leading-relaxed whitespace-pre-line ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      {section.content}
                    </div>
                  </div>
                )
              })}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleNewPlan}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-heading font-bold shadow-lg shadow-primary-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer text-sm"
                >
                  🔄 Generate New Plan
                </button>
                <button
                  onClick={handleClose}
                  className={`px-6 py-3 rounded-xl border font-semibold text-sm transition-all duration-200 cursor-pointer ${
                    darkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* ── Error State (when no itinerary) ── */}
          {!loading && !itinerary && !showForm && error && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <span className="text-5xl">😞</span>
              <p
                className={`text-sm font-medium text-center ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {error}
              </p>
              <button
                onClick={handleNewPlan}
                className="px-6 py-2.5 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
