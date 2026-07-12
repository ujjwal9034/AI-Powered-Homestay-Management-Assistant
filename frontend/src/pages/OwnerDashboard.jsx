/**
 * OwnerDashboard — What homestay owners see when logged in.
 *
 * - Manage their homestays (add/edit)
 * - View reviews for their properties only
 * - Reply to reviews
 * - Stats per property
 */
import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { fetchMyHomestays, createHomestay, updateHomestay, deleteHomestay, fetchHomestayReviews, replyToReview, requestReviewSuggestion, enhanceHomestayDescription, fetchOwnerBookings, updateBookingStatus } from '../services/api'

export default function OwnerDashboard() {
  const { darkMode } = useTheme()
  const { user } = useAuth()

  const [homestays, setHomestays] = useState([])
  const [reviews, setReviews] = useState({})
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('properties')
  const [actionMsg, setActionMsg] = useState(null)

  // AI Description states
  const [aiKeywords, setAiKeywords] = useState('')
  const [enhancingDescription, setEnhancingDescription] = useState(false)

  // Add/edit homestay modal
  const [showModal, setShowModal] = useState(false)
  const [editingHomestay, setEditingHomestay] = useState(null)
  const [form, setForm] = useState({ name: '', location: '', description: '', amenities: '', pricePerNight: '', image: '' })
  const [formLoading, setFormLoading] = useState(false)

  // Reply state
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [replyLoading, setReplyLoading] = useState(false)
  const [suggestingReviews, setSuggestingReviews] = useState({})

  // Selected homestay for reviews
  const [selectedHomestay, setSelectedHomestay] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [hRes, bRes] = await Promise.all([
        fetchMyHomestays(),
        fetchOwnerBookings(),
      ])
      const myHomestays = hRes.data || []
      setHomestays(myHomestays)
      setBookings(bRes.data || [])

      // Load reviews for all homestays
      const reviewMap = {}
      for (const h of myHomestays) {
        try {
          const rRes = await fetchHomestayReviews(h._id)
          reviewMap[h._id] = rRes.data || []
        } catch {
          reviewMap[h._id] = []
        }
      }
      setReviews(reviewMap)
      if (myHomestays.length > 0) setSelectedHomestay(myHomestays[0]._id)
    } catch (err) {
      console.warn('Failed to load:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const showAction = (msg, isError = false) => {
    setActionMsg({ msg, isError })
    setTimeout(() => setActionMsg(null), 3000)
  }

  const openAddModal = () => {
    setEditingHomestay(null)
    setForm({ name: '', location: '', description: '', amenities: '', pricePerNight: '', image: '' })
    setAiKeywords('')
    setShowModal(true)
  }

  const openEditModal = (h) => {
    setEditingHomestay(h)
    setForm({
      name: h.name,
      location: h.location,
      description: h.description || '',
      amenities: (h.amenities || []).join(', '),
      pricePerNight: h.pricePerNight || '',
      image: h.image || '',
    })
    setAiKeywords('')
    setShowModal(true)
  }

  const handleSubmitHomestay = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      const data = {
        ...form,
        amenities: form.amenities.split(',').map((a) => a.trim()).filter(Boolean),
        pricePerNight: Number(form.pricePerNight) || 0,
      }
      if (editingHomestay) {
        await updateHomestay(editingHomestay._id, data)
        showAction('Homestay updated')
      } else {
        await createHomestay(data)
        showAction('Homestay created')
      }
      setShowModal(false)
      loadData()
    } catch (err) {
      showAction(err.response?.data?.message || 'Failed to save homestay', true)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteHomestay = async (id) => {
    if (!confirm('Delete this homestay and all its reviews?')) return
    try {
      await deleteHomestay(id)
      showAction('Homestay deleted')
      loadData()
    } catch {
      showAction('Failed to delete', true)
    }
  }

  const handleReply = async (reviewId) => {
    if (!replyText.trim()) return
    setReplyLoading(true)
    try {
      await replyToReview(reviewId, replyText)
      setReplyingTo(null)
      setReplyText('')
      showAction('Reply sent')
      loadData()
    } catch {
      showAction('Failed to send reply', true)
    } finally {
      setReplyLoading(false)
    }
  }

  const handleGenerateSuggestion = async (reviewId) => {
    setSuggestingReviews((prev) => ({ ...prev, [reviewId]: true }))
    try {
      const res = await requestReviewSuggestion(reviewId)
      // Update local state with the new suggestion
      setReviews((prev) => {
        const updated = { ...prev }
        updated[selectedHomestay] = updated[selectedHomestay].map((r) =>
          r._id === reviewId ? { ...r, aiSuggestion: res.data } : r
        )
        return updated
      })
      showAction('AI Suggested Reply generated')
    } catch {
      showAction('Failed to generate suggestion', true)
    } finally {
      setSuggestingReviews((prev) => ({ ...prev, [reviewId]: false }))
    }
  }

  const handleEnhanceDescription = async () => {
    if (!form.name || !form.location) {
      showAction('Please fill in Name and Location first to generate a description', true)
      return
    }
    setEnhancingDescription(true)
    try {
      const data = {
        name: form.name,
        location: form.location,
        amenities: form.amenities ? form.amenities.split(',').map((a) => a.trim()).filter(Boolean) : [],
        keywords: aiKeywords,
      }
      const res = await enhanceHomestayDescription(data)
      setForm((prev) => ({ ...prev, description: res.description }))
      showAction('AI Description generated!')
    } catch (err) {
      showAction(err.response?.data?.message || 'Failed to generate description', true)
    } finally {
      setEnhancingDescription(false)
    }
  }

  const handleStatusChange = async (bookingId, status) => {
    try {
      await updateBookingStatus(bookingId, status)
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status } : b))
      )
      showAction(`Booking successfully ${status}!`)
    } catch (err) {
      showAction(err.response?.data?.message || 'Failed to update booking status', true)
    }
  }

  const renderStars = (rating) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < rating ? 'text-amber-400' : darkMode ? 'text-gray-600' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )

  const inputClass = `w-full rounded-xl border px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${darkMode ? 'bg-dark-900 border-gray-600 text-gray-100 focus:ring-primary-500/30 focus:border-primary-500' : 'bg-gray-50/50 border-gray-200 text-gray-900 focus:ring-primary-500/20 focus:border-primary-400'}`

  // Compute overall stats
  const totalReviews = Object.values(reviews).flat().length
  const allRevs = Object.values(reviews).flat()
  const avgRating = allRevs.length > 0 ? (allRevs.reduce((s, r) => s + r.rating, 0) / allRevs.length).toFixed(1) : '0.0'
  const pendingCount = allRevs.filter((r) => r.status === 'pending').length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading your properties...</span>
        </div>
      </div>
    )
  }

  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toast */}
        {actionMsg && (
          <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2 ${actionMsg.isError ? (darkMode ? 'bg-red-900/90 text-red-200 border border-red-800' : 'bg-red-500 text-white') : (darkMode ? 'bg-green-900/90 text-green-200 border border-green-800' : 'bg-green-500 text-white')}`} style={{ animation: 'slideDown 0.3s ease-out' }}>
            <span>{actionMsg.isError ? '❌' : '✅'}</span>{actionMsg.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-heading font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Owner Dashboard 🏠
            </h1>
            <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Manage your homestays and respond to guest reviews
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'}`}>
              🏠 Property Owner
            </span>
            <button onClick={openAddModal} className="px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/20 hover:shadow-primary-500/40 hover:scale-105 active:scale-95">
              + Add Homestay
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'My Properties', value: homestays.length, icon: '🏡' },
            { label: 'Total Bookings', value: bookings.length, icon: '📅' },
            { label: 'Total Reviews', value: totalReviews, icon: '⭐' },
            { label: 'Avg Rating', value: avgRating, icon: '📊' },
          ].map(({ label, value, icon }) => (
            <div key={label} className={`rounded-2xl border p-5 ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'}`}>
              <span className="text-2xl">{icon}</span>
              <div className={`text-2xl font-heading font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</div>
              <div className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-xl mb-8 w-fit ${darkMode ? 'bg-dark-800' : 'bg-gray-100'}`}>
          {[
            { id: 'properties', label: '🏡 My Properties' },
            { id: 'bookings', label: '📅 Bookings' },
            { id: 'reviews', label: '💬 Guest Reviews' },
          ].map(({ id, label }) => (
            <button key={id} onClick={() => setActiveTab(id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeTab === id ? 'bg-primary-500 text-white shadow-md' : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="grid sm:grid-cols-2 gap-6">
            {homestays.map((h) => (
              <div key={h._id} className={`rounded-2xl border overflow-hidden ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'}`}>
                <div className="aspect-[16/9] overflow-hidden">
                  <img src={h.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'} alt={h.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-5">
                  <h3 className={`font-heading font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{h.name}</h3>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>📍 {h.location}</p>
                  <div className="flex items-center gap-3 mt-3">
                    {renderStars(Math.round(h.rating))}
                    <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{h.rating} ({h.totalReviews} reviews)</span>
                  </div>
                  <p className={`text-sm font-bold mt-2 ${darkMode ? 'text-primary-400' : 'text-primary-600'}`}>₹{h.pricePerNight?.toLocaleString()}/night</p>
                  <div className="flex items-center gap-2 mt-4">
                    <button onClick={() => openEditModal(h)} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${darkMode ? 'text-primary-400 hover:bg-primary-900/20 border border-primary-800' : 'text-primary-600 hover:bg-primary-50 border border-primary-200'}`}>✏️ Edit</button>
                    <button onClick={() => { setSelectedHomestay(h._id); setActiveTab('reviews') }} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${darkMode ? 'text-amber-400 hover:bg-amber-900/20 border border-amber-800' : 'text-amber-600 hover:bg-amber-50 border border-amber-200'}`}>💬 Reviews ({(reviews[h._id] || []).length})</button>
                    <button onClick={() => handleDeleteHomestay(h._id)} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${darkMode ? 'text-red-400 hover:bg-red-900/20 border border-red-800' : 'text-red-500 hover:bg-red-50 border border-red-200'}`}>🗑 Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {homestays.length === 0 && (
              <div className="col-span-full flex flex-col items-center py-16">
                <span className="text-4xl mb-3">🏡</span>
                <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No properties yet</span>
                <button onClick={openAddModal} className="mt-3 text-sm text-primary-500 hover:text-primary-600 font-medium cursor-pointer">Add your first homestay →</button>
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'}`}>
              <div className={`px-6 py-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <h2 className={`font-heading font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Guest Reservations</h2>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage bookings made on your properties</p>
              </div>

              <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {bookings.map((booking) => (
                  <div key={booking._id} className={`p-6 ${darkMode ? 'hover:bg-dark-900/50' : 'hover:bg-gray-50/50'}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${darkMode ? 'text-primary-400' : 'text-primary-600'}`}>
                            🏡 {booking.homestay?.name || 'Property'}
                          </span>
                          <span className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>·</span>
                          <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            👤 {booking.customer?.name} ({booking.customer?.email})
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                          <div>📅 {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</div>
                          <div>🌙 {booking.nights} night{booking.nights > 1 ? 's' : ''}</div>
                          <div>👥 {booking.guestsCount} guest{booking.guestsCount > 1 ? 's' : ''}</div>
                          <div className="font-semibold text-primary-500">💰 ₹{booking.totalPrice?.toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {booking.status === 'confirmed' ? (
                          <button
                            onClick={() => handleStatusChange(booking._id, 'cancelled')}
                            className="px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer border-red-200 text-red-500 hover:bg-red-50 dark:border-red-800/35 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors"
                          >
                            ❌ Cancel Booking
                          </button>
                        ) : booking.status === 'cancelled' ? (
                          <button
                            onClick={() => handleStatusChange(booking._id, 'confirmed')}
                            className="px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800/35 dark:text-green-400 dark:hover:bg-green-950/20 transition-colors"
                          >
                            ✅ Reinstate Booking
                          </button>
                        ) : (
                          <span className="text-xs italic text-gray-400">No actions available</span>
                        )}

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          booking.status === 'confirmed'
                            ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'
                            : darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-650'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {bookings.length === 0 && (
                  <div className="flex flex-col items-center py-16">
                    <span className="text-4xl mb-3">📅</span>
                    <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No guest reservations booked yet</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            {/* Homestay selector */}
            {homestays.length > 1 && (
              <div className={`flex gap-2 mb-6 flex-wrap`}>
                {homestays.map((h) => (
                  <button key={h._id} onClick={() => setSelectedHomestay(h._id)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${selectedHomestay === h._id ? 'bg-primary-500 text-white shadow-md' : darkMode ? 'bg-dark-800 text-gray-400 border border-gray-700 hover:border-primary-700' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'}`}>
                    {h.name}
                  </button>
                ))}
              </div>
            )}

            <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'}`}>
              <div className={`px-6 py-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <h2 className={`font-heading font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Guest Reviews — {homestays.find((h) => h._id === selectedHomestay)?.name || 'Select a property'}
                </h2>
              </div>
              <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {(reviews[selectedHomestay] || []).map((review) => (
                  <div key={review._id} className={`p-6 ${darkMode ? 'hover:bg-dark-900/50' : 'hover:bg-gray-50/50'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                            {review.customer?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{review.customer?.name || 'Guest'}</h3>
                            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{review.customer?.email}</span>
                          </div>
                        </div>
                        {renderStars(review.rating)}
                        <p className={`text-sm leading-relaxed mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{review.text}</p>

                        {/* AI Suggestion Section */}
                        {!review.ownerReply?.text && (
                          <div className="mt-3">
                            {review.aiSuggestion ? (
                              <div className={`rounded-xl border p-4 ${darkMode ? 'bg-primary-900/20 border-primary-800' : 'bg-primary-50/50 border-primary-100'}`}>
                                <div className="flex items-center justify-between">
                                  <span className={`text-xs font-semibold ${darkMode ? 'text-primary-400' : 'text-primary-600'}`}>🤖 AI Suggested Reply:</span>
                                  <button 
                                    onClick={() => handleGenerateSuggestion(review._id)} 
                                    disabled={suggestingReviews[review._id]}
                                    className={`text-[10px] font-medium transition-colors cursor-pointer ${suggestingReviews[review._id] ? 'opacity-50' : 'text-primary-500 hover:text-primary-600'}`}
                                  >
                                    {suggestingReviews[review._id] ? 'Regenerating...' : '🔄 Regenerate'}
                                  </button>
                                </div>
                                <p className={`text-sm mt-1 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{review.aiSuggestion}</p>
                                <button onClick={() => { setReplyingTo(review._id); setReplyText(review.aiSuggestion) }} className="mt-2 text-xs text-primary-500 hover:text-primary-600 font-medium cursor-pointer">Use this reply →</button>
                              </div>
                            ) : (
                              <div>
                                {suggestingReviews[review._id] ? (
                                  <div className="flex items-center gap-2 text-xs text-primary-500">
                                    <div className="w-3.5 h-3.5 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
                                    <span>Generating suggestion with Gemini AI...</span>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleGenerateSuggestion(review._id)}
                                    className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                                      darkMode
                                        ? 'border-primary-800 text-primary-400 hover:bg-primary-950/20'
                                        : 'border-primary-100 text-primary-600 hover:bg-primary-50'
                                    }`}
                                  >
                                    🤖 Generate AI Suggestion
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Owner's existing reply */}
                        {review.ownerReply?.text && (
                          <div className={`mt-3 rounded-xl border p-4 ${darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50/50 border-green-100'}`}>
                            <span className={`text-xs font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>✅ Your Reply:</span>
                            <p className={`text-sm mt-1 ${darkMode ? 'text-green-300' : 'text-green-800'}`}>{review.ownerReply.text}</p>
                          </div>
                        )}

                        {/* Reply input */}
                        {!review.ownerReply?.text && (
                          <div className="mt-3">
                            {replyingTo === review._id ? (
                              <div className="space-y-2">
                                <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write your reply to this guest..." rows={3} className={inputClass} />
                                <div className="flex items-center gap-2">
                                  <button onClick={() => handleReply(review._id)} disabled={replyLoading} className="px-4 py-2 rounded-lg bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-colors cursor-pointer">
                                    {replyLoading ? 'Sending...' : '📩 Send Reply'}
                                  </button>
                                  <button onClick={() => { setReplyingTo(null); setReplyText('') }} className={`px-4 py-2 rounded-lg border text-xs font-medium cursor-pointer ${darkMode ? 'border-gray-600 text-gray-400' : 'border-gray-200 text-gray-600'}`}>Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <button onClick={() => setReplyingTo(review._id)} className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${darkMode ? 'text-primary-400 hover:bg-primary-900/20' : 'text-primary-600 hover:bg-primary-50'}`}>
                                💬 Reply to this review
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${review.status === 'replied' ? (darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600') : (darkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-600')}`}>
                        {review.status === 'replied' ? 'Replied' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
                {(reviews[selectedHomestay] || []).length === 0 && (
                  <div className="flex flex-col items-center py-16">
                    <span className="text-4xl mb-3">📭</span>
                    <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No reviews for this property yet</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Homestay Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className={`relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl border shadow-2xl p-8 ${darkMode ? 'bg-dark-800 border-gray-700' : 'bg-white border-gray-200'}`} style={{ animation: 'slideUp 0.3s ease-out' }}>
            <h2 className={`text-xl font-heading font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {editingHomestay ? 'Edit Homestay' : 'Add New Homestay'}
            </h2>
            <form onSubmit={handleSubmitHomestay} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Mountain View Retreat" required className={inputClass} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Location *</label>
                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Manali, Himachal Pradesh" required className={inputClass} />
              </div>
              <div className={`p-4 rounded-xl border ${darkMode ? 'bg-primary-950/10 border-primary-900/50' : 'bg-primary-50/20 border-primary-100/50'}`}>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${darkMode ? 'text-primary-400' : 'text-primary-600'}`}>
                  🤖 Write Description with Gemini AI
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiKeywords}
                    onChange={(e) => setAiKeywords(e.target.value)}
                    placeholder="e.g., cozy, mountain views, fireplace, rustic"
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 ${
                      darkMode
                        ? 'bg-dark-900 border-gray-750 text-gray-200 focus:ring-primary-500/30'
                        : 'bg-white border-gray-200 text-gray-800 focus:ring-primary-500/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleEnhanceDescription}
                    disabled={enhancingDescription}
                    className="px-3 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  >
                    {enhancingDescription ? 'Generating...' : '✨ Generate'}
                  </button>
                </div>
                <p className={`text-[10px] mt-1.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Fills the description below based on property details & keywords.
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your homestay..." rows={4} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Price/Night (₹)</label>
                  <input type="number" value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })} placeholder="2500" className={inputClass} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Image URL</label>
                  <input type="text" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." className={inputClass} />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Amenities (comma-separated)</label>
                <input type="text" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} placeholder="WiFi, Breakfast, Parking" className={inputClass} />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="submit" disabled={formLoading} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg shadow-primary-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer">
                  {formLoading ? 'Saving...' : editingHomestay ? 'Save Changes' : 'Create Homestay'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className={`px-6 py-3 rounded-xl border font-medium transition-colors cursor-pointer ${darkMode ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-100'}`}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
