/**
 * HomestayDetail — Detailed view of a homestay property.
 *
 * - Shows homestay details (description, price, location, amenities, owner)
 * - Lists all reviews for this homestay with inline owner replies
 * - Allows customers to leave reviews (with star rating picker)
 */
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { fetchHomestayById, createReview, deleteReview, chatWithLocalGuide, createBooking, resolveImageUrl } from '../services/api'

export default function HomestayDetail() {
  const { id } = useParams()
  const { darkMode } = useTheme()
  const { user, isAuthenticated } = useAuth()

  const [homestay, setHomestay] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Chat Drawer Control
  const [isChatOpen, setIsChatOpen] = useState(false)

  // Booking states
  const [bookingCheckIn, setBookingCheckIn] = useState('')
  const [bookingCheckOut, setBookingCheckOut] = useState('')
  const [bookingGuests, setBookingGuests] = useState(1)
  const [bookingLoading, setBookingLoading] = useState(false)

  // Chat states
  const [chatMessages, setChatMessages] = useState([
    { role: 'model', text: 'Hello! I am your StayWise AI Concierge. 🤖 Ask me anything about this property (amenities, location, pricing) or request local sights, trekking spots, and dining recommendations in the area!' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  // Review form state
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [actionMsg, setActionMsg] = useState(null)

  const loadHomestay = async () => {
    try {
      setLoading(true)
      const result = await fetchHomestayById(id)
      setHomestay(result.data)
      setReviews(result.data.reviews || [])
      setError(null)
    } catch (err) {
      setError('Failed to load homestay details. It might have been deleted.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHomestay()
  }, [id])

  const showAction = (msg, isError = false) => {
    setActionMsg({ msg, isError })
    setTimeout(() => setActionMsg(null), 3000)
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setFormLoading(true)
    try {
      const res = await createReview({
        homestayId: id,
        rating,
        text: text.trim(),
      })
      showAction('Review submitted successfully')
      setText('')
      setRating(5)
      // Reload homestay to get updated stats and reviews
      loadHomestay()
    } catch (err) {
      showAction(err.response?.data?.message || 'Failed to submit review', true)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    try {
      await deleteReview(reviewId)
      showAction('Review deleted successfully')
      loadHomestay()
    } catch {
      showAction('Failed to delete review', true)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!chatInput.trim() || chatLoading) return

    const userMsg = { role: 'user', text: chatInput.trim() }
    setChatMessages((prev) => [...prev, userMsg])
    setChatInput('')
    setChatLoading(true)

    try {
      const history = chatMessages.slice(1) // Exclude welcome message to keep prompt cleaner
      const res = await chatWithLocalGuide(id, userMsg.text, history)
      setChatMessages((prev) => [...prev, { role: 'model', text: res.response }])
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: 'model', text: 'Sorry, I am having trouble connecting to my local guide services right now.' }
      ])
    } finally {
      setChatLoading(false)
    }
  }

  const handleCreateBooking = async (e) => {
    e.preventDefault()
    if (!bookingCheckIn || !bookingCheckOut) return

    setBookingLoading(true)
    try {
      await createBooking({
        homestayId: id,
        checkIn: bookingCheckIn,
        checkOut: bookingCheckOut,
        guestsCount: bookingGuests,
      })
      showAction('Booking confirmed! Redirecting...')
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1500)
    } catch (err) {
      showAction(err.response?.data?.message || 'Failed to create booking', true)
    } finally {
      setBookingLoading(false)
    }
  }

  const renderStars = (count, size = 'w-4 h-4', clickable = false, currentRating = 0, onSetRating = () => {}) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const active = i < (clickable ? currentRating : count)
          return (
            <svg
              key={i}
              onClick={() => clickable && onSetRating(i + 1)}
              className={`${size} ${active ? 'text-amber-400' : darkMode ? 'text-gray-600' : 'text-gray-200'} ${clickable ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          )
        })}
      </div>
    )
  }

  const inputClass = `w-full rounded-xl border px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${darkMode ? 'bg-dark-900 border-gray-600 text-gray-100 focus:ring-primary-500/30 focus:border-primary-500' : 'bg-gray-50/50 border-gray-200 text-gray-900 focus:ring-primary-500/20 focus:border-primary-400'}`

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading details...</span>
        </div>
      </div>
    )
  }

  if (error || !homestay) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <span className="text-5xl mb-4 block">⚠️</span>
        <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{error || 'Homestay not found'}</h2>
        <Link to="/dashboard" className="text-primary-500 hover:underline">Back to Dashboard</Link>
      </div>
    )
  }

  const isCustomer = isAuthenticated && user?.role === 'customer'

  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toast */}
        {actionMsg && (
          <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2 ${actionMsg.isError ? (darkMode ? 'bg-red-900/90 text-red-200 border border-red-800' : 'bg-red-500 text-white') : (darkMode ? 'bg-green-900/90 text-green-200 border border-green-800' : 'bg-green-500 text-white')}`} style={{ animation: 'slideDown 0.3s ease-out' }}>
            <span>{actionMsg.isError ? '❌' : '✅'}</span>{actionMsg.msg}
          </div>
        )}

        {/* Back Button */}
        <Link to="/dashboard" className={`inline-flex items-center gap-2 mb-6 text-sm font-medium transition-colors ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
          ← Back to Dashboard
        </Link>

        {/* Homestay Main Info Card */}
        <div className={`rounded-3xl border overflow-hidden shadow-xl mb-10 ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'}`}>
          <div className="aspect-[21/9] overflow-hidden">
            <img
              src={resolveImageUrl(homestay.image)}
              alt={homestay.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className={`text-2xl sm:text-3xl font-heading font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {homestay.name}
                </h1>
                <p className={`mt-1 text-sm flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  📍 {homestay.location}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-xs font-semibold ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Price/Night</div>
                <div className={`text-2xl font-bold ${darkMode ? 'text-primary-400' : 'text-primary-600'}`}>
                  ₹{homestay.pricePerNight?.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Rating summary */}
            <div className="flex items-center gap-3 mt-4 py-3 border-y border-dashed border-gray-200 dark:border-gray-700">
              <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>⭐ {homestay.rating}</span>
              <span className={darkMode ? 'text-gray-600' : 'text-gray-300'}>|</span>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {homestay.totalReviews} reviews on this property
              </span>
              <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-gradient-to-r from-primary-500/10 to-primary-600/10 border border-primary-500/20 text-primary-500 font-medium">
                Hosted by {homestay.owner?.name}
              </span>
            </div>

            <h3 className={`font-heading font-semibold text-lg mt-6 mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Description
            </h3>
            <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {homestay.description || 'No description provided.'}
            </p>

            {homestay.amenities?.length > 0 && (
              <>
                <h3 className={`font-heading font-semibold text-lg mt-6 mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Amenities Offered
                </h3>
                <div className="flex flex-wrap gap-2">
                  {homestay.amenities.map((a) => (
                    <span key={a} className={`text-xs font-medium px-3 py-1.5 rounded-xl border ${darkMode ? 'bg-dark-900 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                      ✨ {a}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Reviews and Booking Columns */}
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* Main Column: Amenities, Review Writing, and Reviews List */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Write a Review Block (Placed inline above reviews for guest convenience) */}
            <div className={`rounded-2xl border p-6 shadow-sm ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'}`}>
              {isCustomer ? (
                <>
                  <h3 className={`font-heading font-bold text-base mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Share Your Experience 📝
                  </h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Your Rating
                      </label>
                      {renderStars(0, 'w-6 h-6', true, rating, setRating)}
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Your Review
                      </label>
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="What did you like or dislike about your stay?"
                        rows={3}
                        required
                        className={inputClass}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-md shadow-primary-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
                    >
                      {formLoading ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </>
              ) : (
                <div className="py-2">
                  <h4 className={`font-heading font-semibold text-sm mb-1.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {isAuthenticated ? 'Owner Accounts Cannot Review' : 'Want to leave a review?'}
                  </h4>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {isAuthenticated
                      ? 'Only customer accounts can submit reviews for properties.'
                      : 'Please sign in with a Guest account to share your feedback.'}
                  </p>
                  {!isAuthenticated && (
                    <Link
                      to="/login"
                      className="inline-block mt-3 px-4 py-2 rounded-xl bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-colors"
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Guest Reviews List */}
            <div className="space-y-4">
              <h2 className={`text-xl font-heading font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Guest Reviews ({reviews.length})
              </h2>

              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r._id} className={`rounded-2xl border p-6 shadow-sm ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                          {r.customer?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <h4 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {r.customer?.name}
                          </h4>
                          <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      {isAuthenticated && (user?.role === 'admin' || user?._id === r.customer?._id) && (
                        <button onClick={() => handleDeleteReview(r._id)} className={`text-xs font-medium px-2 py-1 rounded-lg border transition-colors cursor-pointer border-red-500/20 text-red-500 hover:bg-red-500/10`}>
                          Delete
                        </button>
                      )}
                    </div>
                    {renderStars(r.rating, 'w-3.5 h-3.5')}
                    <p className={`text-sm leading-relaxed mt-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {r.text}
                    </p>

                    {/* Inline owner reply */}
                    {r.ownerReply?.text && (
                      <div className={`mt-4 rounded-xl border p-4 pl-5 border-l-4 ${darkMode ? 'bg-green-900/10 border-green-800 text-green-300' : 'bg-green-50/50 border-green-200 text-green-800'}`}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm">💬</span>
                          <span className="text-xs font-bold uppercase tracking-wider">Host Response</span>
                          <span className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            · {new Date(r.ownerReply.repliedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{r.ownerReply.text}</p>
                      </div>
                    )}
                  </div>
                ))}

                {reviews.length === 0 && (
                  <div className={`rounded-2xl border border-dashed p-8 text-center ${darkMode ? 'border-gray-700 bg-dark-850' : 'border-gray-200 bg-gray-50/30'}`}>
                    <span className="text-3xl block mb-2">✍️</span>
                    <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      No reviews yet. Be the first to review!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Booking Sidebar */}
          <div>
            <div className={`rounded-2xl border p-6 sticky top-24 shadow-lg ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'}`}>
              <h3 className={`font-heading font-bold text-base mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Plan Your Stay 📅
              </h3>
              <form onSubmit={handleCreateBooking} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Check-In
                    </label>
                    <input
                      type="date"
                      value={bookingCheckIn}
                      onChange={(e) => setBookingCheckIn(e.target.value)}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full rounded-xl border px-3 py-2 text-xs focus:outline-none focus:ring-2 ${
                        darkMode
                          ? 'bg-dark-900 border-gray-650 text-gray-200 focus:ring-primary-500/30'
                          : 'bg-gray-50 border-gray-200 text-gray-800 focus:ring-primary-500/20'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Check-Out
                    </label>
                    <input
                      type="date"
                      value={bookingCheckOut}
                      onChange={(e) => setBookingCheckOut(e.target.value)}
                      required
                      min={bookingCheckIn || new Date().toISOString().split('T')[0]}
                      className={`w-full rounded-xl border px-3 py-2 text-xs focus:outline-none focus:ring-2 ${
                        darkMode
                          ? 'bg-dark-900 border-gray-650 text-gray-200 focus:ring-primary-500/30'
                          : 'bg-gray-50 border-gray-200 text-gray-800 focus:ring-primary-500/20'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Number of Guests
                  </label>
                  <select
                    value={bookingGuests}
                    onChange={(e) => setBookingGuests(Number(e.target.value))}
                    className={`w-full rounded-xl border px-3 py-2 text-xs focus:outline-none focus:ring-2 ${
                      darkMode
                        ? 'bg-dark-900 border-gray-650 text-gray-200 focus:ring-primary-500/30'
                        : 'bg-gray-50 border-gray-200 text-gray-850'
                    }`}
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                {/* Price Breakdown Calculation */}
                {bookingCheckIn && bookingCheckOut && (
                  (() => {
                    const days = Math.ceil((new Date(bookingCheckOut) - new Date(bookingCheckIn)) / (1000 * 60 * 60 * 24))
                    if (days <= 0) {
                      return (
                        <p className="text-xs text-red-500 font-medium">Check-out must be after check-in.</p>
                      )
                    }
                    const base = days * homestay.pricePerNight
                    const fee = Math.round(base * 0.05)
                    const tax = Math.round(base * 0.12)
                    const total = base + fee + tax

                    return (
                      <div className={`rounded-xl border p-4 space-y-2 text-xs ${darkMode ? 'bg-dark-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex justify-between">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                            ₹{homestay.pricePerNight?.toLocaleString()} x {days} night{days > 1 ? 's' : ''}
                          </span>
                          <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            ₹{base?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>StayWise Service Fee (5%)</span>
                          <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            ₹{fee?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Occupancy Taxes (12%)</span>
                          <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            ₹{tax?.toLocaleString()}
                          </span>
                        </div>
                        <div className={`flex justify-between pt-2 border-t font-semibold text-sm ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'}`}>
                          <span>Total Bill</span>
                          <span className={darkMode ? 'text-primary-400' : 'text-primary-600'}>
                            ₹{total?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )
                  })()
                )}

                {/* Action button */}
                {isAuthenticated ? (
                  user?.role === 'customer' ? (
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg shadow-primary-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer text-center text-xs"
                    >
                      {bookingLoading ? 'Processing Booking...' : '⚡ Instant Book'}
                    </button>
                  ) : (
                    <div className={`p-3 rounded-xl text-center text-xs border ${darkMode ? 'border-amber-800/30 bg-amber-900/10 text-amber-400' : 'border-amber-100 bg-amber-50 text-amber-700'}`}>
                      ⚠️ Only guest accounts can make homestay bookings.
                    </div>
                  )
                ) : (
                  <Link
                    to="/login"
                    className="block w-full py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-center font-semibold text-xs shadow-md transition-colors"
                  >
                    Sign In to Book Stay
                  </Link>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Floating AI Local Guide Concierge Bot (Bottom-Right overlay widget) */}
        <div className="fixed bottom-6 right-6 z-50">
          {/* Pulsing Toggle Button */}
          {!isChatOpen && (
            <button
              onClick={() => setIsChatOpen(true)}
              className="relative w-14 h-14 rounded-full bg-primary-500 text-white flex items-center justify-center text-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer animate-pulse"
              style={{ animationDuration: '3s' }}
            >
              🤖
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-dark-800 rounded-full" />
            </button>
          )}

          {/* Sliding Chat Drawer Overlay */}
          {isChatOpen && (
            <div
              className={`w-90 sm:w-96 h-[480px] rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${
                darkMode ? 'bg-dark-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
              style={{ animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
            >
              {/* Header */}
              <div className="px-5 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                    🤖
                  </div>
                  <div>
                    <h3 className="text-xs font-bold leading-none font-heading">AI Local Concierge</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
                      <span className="text-[10px] text-white/80 font-medium">Online · Ask Guide</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer text-white"
                >
                  ✖
                </button>
              </div>

              {/* Chat messages feed */}
              <div className={`flex-1 overflow-y-auto p-4 space-y-3.5 text-xs scrollbar-none ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                {chatMessages.map((msg, i) => {
                  const isAI = msg.role === 'model'
                  return (
                    <div key={i} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-sm ${
                        isAI 
                          ? darkMode ? 'bg-dark-900 text-gray-200 rounded-tl-none border border-gray-750' : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'
                          : 'bg-primary-500 text-white rounded-tr-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  )
                })}
                {chatLoading && (
                  <div className="flex justify-start items-center gap-1.5 text-primary-500 animate-pulse pl-1">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium pl-1">Guide is thinking...</span>
                  </div>
                )}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className={`p-3.5 border-t flex gap-2 ${darkMode ? 'border-gray-700 bg-dark-850' : 'border-gray-100 bg-gray-50/50'}`}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about spots, transport, rules..."
                  disabled={chatLoading}
                  className={`flex-1 rounded-xl border px-3 py-2 text-xs placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    darkMode 
                      ? 'bg-dark-900 border-gray-650 text-gray-100 focus:ring-primary-500/30' 
                      : 'bg-white border-gray-200 text-gray-900 focus:ring-primary-500/20'
                  }`}
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="px-3 rounded-xl bg-primary-500 text-white hover:bg-primary-600 font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
                >
                  ✈️
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
