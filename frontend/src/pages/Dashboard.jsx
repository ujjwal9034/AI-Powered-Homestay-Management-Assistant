/**
 * Dashboard — Main management view with stats, reviews, quick actions, and AI insights.
 * Reviews are fetched from MongoDB via the Express backend.
 * Uses _id (MongoDB ObjectId) instead of numeric id.
 */
import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { fetchReviews, deleteReview, patchReview, createReview, updateReview } from '../services/api'

const quickActions = [
  { label: 'View All Reviews', icon: '📋' },
  { label: 'AI Response Queue', icon: '🤖' },
  { label: 'Guest Messages', icon: '✉️' },
  { label: 'Analytics Report', icon: '📈' },
]

export default function Dashboard() {
  const [expandedReview, setExpandedReview] = useState(null)
  const { darkMode } = useTheme()
  const { user } = useAuth()

  /* ── Fetch reviews from backend ──────────────────────────────────────────── */
  const [recentReviews, setRecentReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionMsg, setActionMsg] = useState(null)

  // Add review modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [newReview, setNewReview] = useState({ guest: '', platform: 'Airbnb', rating: 5, text: '' })
  const [addLoading, setAddLoading] = useState(false)

  // Edit review modal state
  const [showEditModal, setShowEditModal] = useState(false)
  const [editReview, setEditReview] = useState(null)
  const [editLoading, setEditLoading] = useState(false)

  const loadReviews = async () => {
    try {
      setLoading(true)
      const result = await fetchReviews()
      setRecentReviews(result.data || [])
      setError(null)
    } catch (err) {
      console.warn('Backend unavailable:', err.message)
      setRecentReviews([])
      setError('Could not connect to backend — make sure the server is running')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [])

  /* ── Action handlers ─────────────────────────────────────────────────────── */
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    try {
      await deleteReview(id)
      setRecentReviews((prev) => prev.filter((r) => r._id !== id))
      showAction('Review deleted successfully')
    } catch (err) {
      showAction('Failed to delete review', true)
    }
  }

  const handleMarkReplied = async (id) => {
    try {
      const result = await patchReview(id, { status: 'replied' })
      setRecentReviews((prev) =>
        prev.map((r) => (r._id === id ? result.data : r))
      )
      showAction('Marked as replied')
    } catch (err) {
      showAction('Failed to update status', true)
    }
  }

  const handleAddReview = async (e) => {
    e.preventDefault()
    setAddLoading(true)
    try {
      const result = await createReview({
        ...newReview,
        rating: Number(newReview.rating),
      })
      setRecentReviews((prev) => [result.data, ...prev])
      setShowAddModal(false)
      setNewReview({ guest: '', platform: 'Airbnb', rating: 5, text: '' })
      showAction('Review added successfully')
    } catch (err) {
      showAction(err.response?.data?.message || 'Failed to add review', true)
    } finally {
      setAddLoading(false)
    }
  }

  const handleEditReview = async (e) => {
    e.preventDefault()
    setEditLoading(true)
    try {
      const result = await updateReview(editReview._id, {
        guest: editReview.guest,
        platform: editReview.platform,
        rating: Number(editReview.rating),
        text: editReview.text,
        status: editReview.status,
        aiSuggestion: editReview.aiSuggestion,
      })
      setRecentReviews((prev) =>
        prev.map((r) => (r._id === editReview._id ? result.data : r))
      )
      setShowEditModal(false)
      setEditReview(null)
      showAction('Review updated successfully')
    } catch (err) {
      showAction(err.response?.data?.message || 'Failed to update review', true)
    } finally {
      setEditLoading(false)
    }
  }

  const showAction = (msg, isError = false) => {
    setActionMsg({ msg, isError })
    setTimeout(() => setActionMsg(null), 3000)
  }

  /* ── Compute dynamic stats from fetched reviews ──────────────────────────── */
  const totalReviews = recentReviews.length
  const avgRating = totalReviews > 0
    ? (recentReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0'
  const repliedCount = recentReviews.filter((r) => r.status === 'replied').length
  const responseRate = totalReviews > 0 ? Math.round((repliedCount / totalReviews) * 100) : 0
  const pendingCount = recentReviews.filter((r) => r.status === 'pending').length

  const stats = [
    { label: 'Total Reviews', value: totalReviews.toLocaleString(), change: '+12%', up: true, icon: '⭐' },
    { label: 'Avg. Rating', value: avgRating, change: '+0.3', up: true, icon: '📊' },
    { label: 'Response Rate', value: `${responseRate}%`, change: '+4%', up: true, icon: '💬' },
    { label: 'Pending Replies', value: String(pendingCount), change: `-${pendingCount}`, up: false, icon: '📝' },
  ]

  const inputClass = `w-full rounded-xl border px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${darkMode ? 'bg-dark-900 border-gray-600 text-gray-100 focus:ring-primary-500/30 focus:border-primary-500' : 'bg-gray-50/50 border-gray-200 text-gray-900 focus:ring-primary-500/20 focus:border-primary-400'}`

  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toast notification */}
        {actionMsg && (
          <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2 ${actionMsg.isError ? (darkMode ? 'bg-red-900/90 text-red-200 border border-red-800' : 'bg-red-500 text-white') : (darkMode ? 'bg-green-900/90 text-green-200 border border-green-800' : 'bg-green-500 text-white')}`}
            style={{ animation: 'slideDown 0.3s ease-out' }}
          >
            <span>{actionMsg.isError ? '❌' : '✅'}</span>
            {actionMsg.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-heading font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Dashboard
            </h1>
            <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Welcome back, {user?.name?.split(' ')[0]}! Here's your homestay overview.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'}`}>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              AI Active
            </span>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/20 hover:shadow-primary-500/40 hover:scale-105 active:scale-95"
            >
              + Add Review
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {stats.map(({ label, value, change, up, icon }) => (
            <div
              key={label}
              className={`rounded-2xl border p-5 sm:p-6 hover:shadow-md transition-shadow duration-200 ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{icon}</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    up
                      ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'
                      : darkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {change}
                </span>
              </div>
              <div className={`text-2xl sm:text-3xl font-heading font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</div>
              <div className={`text-xs mt-1 font-medium ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Reviews list */}
          <div className="lg:col-span-2">
            <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'}`}>
              <div className={`px-6 py-5 border-b flex items-center justify-between ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <h2 className={`font-heading font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Reviews</h2>
                <span className={`text-xs font-medium ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{error ? 'Offline' : `${recentReviews.length} reviews`}</span>
              </div>

              {/* Error banner */}
              {error && (
                <div className={`mx-6 mt-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${darkMode ? 'bg-amber-900/20 border border-amber-800 text-amber-300' : 'bg-amber-50 border border-amber-200 text-amber-700'}`}>
                  <span>⚠️</span> {error}
                </div>
              )}

              {/* Loading state */}
              {loading && (
                <div className="flex items-center justify-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading reviews from MongoDB...</span>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!loading && recentReviews.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center py-16">
                  <span className="text-4xl mb-3">📭</span>
                  <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No reviews yet. Add your first review!</span>
                </div>
              )}

              <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {!loading && recentReviews.map((review) => (
                  <div key={review._id} className={`p-6 transition-colors ${darkMode ? 'hover:bg-dark-900/50' : 'hover:bg-gray-50/50'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                            {review.guest.charAt(0)}
                          </div>
                          <div>
                            <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{review.guest}</h3>
                            <div className={`flex items-center gap-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              <span>{review.platform}</span>
                              <span>·</span>
                              <span>{review.date || new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-0.5 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-amber-400' : darkMode ? 'text-gray-600' : 'text-gray-200'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>

                        <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{review.text}</p>

                        {/* AI Suggestion expandable */}
                        {review.aiSuggestion && (
                          <div className="mt-3">
                            <button
                              onClick={() =>
                                setExpandedReview(expandedReview === review._id ? null : review._id)
                              }
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors cursor-pointer"
                            >
                              <span>🤖</span>
                              {expandedReview === review._id ? 'Hide' : 'View'} AI Suggestion
                              <svg
                                className={`w-3 h-3 transition-transform duration-200 ${
                                  expandedReview === review._id ? 'rotate-180' : ''
                                }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            <div
                              className={`overflow-hidden transition-all duration-300 ${
                                expandedReview === review._id ? 'max-h-48 opacity-100 mt-3' : 'max-h-0 opacity-0'
                              }`}
                            >
                              <div className={`rounded-xl border p-4 text-sm leading-relaxed ${darkMode ? 'bg-primary-900/20 border-primary-800 text-gray-300' : 'bg-primary-50/50 border-primary-100 text-gray-700'}`}>
                                {review.aiSuggestion}
                                <div className="flex items-center gap-2 mt-3">
                                  <button
                                    onClick={() => handleMarkReplied(review._id)}
                                    className="px-3 py-1.5 rounded-lg bg-primary-500 text-white text-xs font-medium hover:bg-primary-600 transition-colors cursor-pointer"
                                  >
                                    Use This Reply
                                  </button>
                                  <button className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${darkMode ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                                    Edit
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 mt-3">
                          {review.status === 'pending' && (
                            <button
                              onClick={() => handleMarkReplied(review._id)}
                              className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${darkMode ? 'text-green-400 hover:bg-green-900/20' : 'text-green-600 hover:bg-green-50'}`}
                            >
                              ✓ Mark Replied
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditReview(review)
                              setShowEditModal(true)
                            }}
                            className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${darkMode ? 'text-primary-400 hover:bg-primary-900/20' : 'text-primary-600 hover:bg-primary-50'}`}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(review._id)}
                            className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${darkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-500 hover:bg-red-50'}`}
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </div>

                      {/* Status badge */}
                      <span
                        className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
                          review.status === 'replied'
                            ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'
                            : darkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        {review.status === 'replied' ? 'Replied' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className={`rounded-2xl border p-6 ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'}`}>
              <h2 className={`font-heading font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map(({ label, icon }) => (
                  <button
                    key={label}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 group cursor-pointer ${darkMode ? 'border-gray-700 bg-dark-900/50 hover:bg-primary-900/20 hover:border-primary-700' : 'border-gray-100 bg-gray-50/50 hover:bg-primary-50 hover:border-primary-200'}`}
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                      {icon}
                    </span>
                    <span className={`text-xs font-medium text-center ${darkMode ? 'text-gray-400 group-hover:text-primary-400' : 'text-gray-600 group-hover:text-primary-700'}`}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className={`rounded-2xl border p-6 ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'}`}>
              <h2 className={`font-heading font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI Insights</h2>
              <div className="space-y-4">
                {[
                  {
                    text: 'Guest sentiment is trending positive this week — cleanliness and breakfast receive the most praise.',
                    type: 'positive',
                  },
                  {
                    text: 'Wi-Fi quality has been mentioned in 3 recent reviews. Consider an infrastructure upgrade.',
                    type: 'warning',
                  },
                  {
                    text: 'Peak booking season approaching — prepare your AI tourist guides for monsoon trekking queries.',
                    type: 'info',
                  },
                ].map(({ text, type }) => (
                  <div
                    key={text}
                    className={`rounded-xl p-4 text-sm leading-relaxed border ${
                      type === 'positive'
                        ? darkMode ? 'bg-green-900/20 border-green-800 text-green-300' : 'bg-green-50/50 border-green-100 text-green-800'
                        : type === 'warning'
                        ? darkMode ? 'bg-amber-900/20 border-amber-800 text-amber-300' : 'bg-amber-50/50 border-amber-100 text-amber-800'
                        : darkMode ? 'bg-blue-900/20 border-blue-800 text-blue-300' : 'bg-blue-50/50 border-blue-100 text-blue-800'
                    }`}
                  >
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Review Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className={`relative w-full max-w-md rounded-2xl border shadow-2xl p-8 ${darkMode ? 'bg-dark-800 border-gray-700' : 'bg-white border-gray-200'}`}
            style={{ animation: 'slideUp 0.3s ease-out' }}
          >
            <h2 className={`text-xl font-heading font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Add New Review</h2>

            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Guest Name</label>
                <input
                  type="text"
                  value={newReview.guest}
                  onChange={(e) => setNewReview({ ...newReview, guest: e.target.value })}
                  placeholder="John Doe"
                  required
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Platform</label>
                  <select
                    value={newReview.platform}
                    onChange={(e) => setNewReview({ ...newReview, platform: e.target.value })}
                    className={inputClass}
                  >
                    <option value="Airbnb">Airbnb</option>
                    <option value="Booking.com">Booking.com</option>
                    <option value="Google">Google</option>
                    <option value="TripAdvisor">TripAdvisor</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Rating</label>
                  <select
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
                    className={inputClass}
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{'⭐'.repeat(r)} ({r})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Review Text</label>
                <textarea
                  value={newReview.text}
                  onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                  placeholder="Write the guest's review here..."
                  rows={3}
                  required
                  className={inputClass}
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg shadow-primary-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
                >
                  {addLoading ? 'Adding...' : 'Add Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`px-6 py-3 rounded-xl border font-medium transition-colors cursor-pointer ${darkMode ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Review Modal */}
      {showEditModal && editReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowEditModal(false); setEditReview(null); }} />
          <div className={`relative w-full max-w-md rounded-2xl border shadow-2xl p-8 ${darkMode ? 'bg-dark-800 border-gray-700' : 'bg-white border-gray-200'}`}
            style={{ animation: 'slideUp 0.3s ease-out' }}
          >
            <h2 className={`text-xl font-heading font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Edit Review</h2>

            <form onSubmit={handleEditReview} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Guest Name</label>
                <input
                  type="text"
                  value={editReview.guest}
                  onChange={(e) => setEditReview({ ...editReview, guest: e.target.value })}
                  placeholder="John Doe"
                  required
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Platform</label>
                  <select
                    value={editReview.platform}
                    onChange={(e) => setEditReview({ ...editReview, platform: e.target.value })}
                    className={inputClass}
                  >
                    <option value="Airbnb">Airbnb</option>
                    <option value="Booking.com">Booking.com</option>
                    <option value="Google">Google</option>
                    <option value="TripAdvisor">TripAdvisor</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Rating</label>
                  <select
                    value={editReview.rating}
                    onChange={(e) => setEditReview({ ...editReview, rating: Number(e.target.value) })}
                    className={inputClass}
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{'⭐'.repeat(r)} ({r})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Review Text</label>
                <textarea
                  value={editReview.text}
                  onChange={(e) => setEditReview({ ...editReview, text: e.target.value })}
                  placeholder="Write the guest's review here..."
                  rows={3}
                  required
                  className={inputClass}
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg shadow-primary-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditReview(null); }}
                  className={`px-6 py-3 rounded-xl border font-medium transition-colors cursor-pointer ${darkMode ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
