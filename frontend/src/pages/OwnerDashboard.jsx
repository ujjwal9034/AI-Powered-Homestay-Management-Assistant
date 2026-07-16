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
import { fetchMyHomestays, createHomestay, updateHomestay, deleteHomestay, fetchHomestayReviews, replyToReview, requestReviewSuggestion, enhanceHomestayDescription, fetchOwnerBookings, updateBookingStatus, fetchHostAnalytics, suggestHomestayPrice, draftBookingMessage, uploadImage, resolveImageUrl } from '../services/api'

export default function OwnerDashboard() {
  const { darkMode } = useTheme()
  const { user } = useAuth()

  const [homestays, setHomestays] = useState([])
  const [reviews, setReviews] = useState({})
  const [bookings, setBookings] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
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
  const [imageUploading, setImageUploading] = useState(false)

  // Reply state
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [replyLoading, setReplyLoading] = useState(false)
  const [suggestingReviews, setSuggestingReviews] = useState({})

  // Dynamic Pricing Advisor states
  const [priceAdvisorHomestay, setPriceAdvisorHomestay] = useState(null)
  const [seasonality, setSeasonality] = useState('')
  const [occupancy, setOccupancy] = useState(50)
  const [pricingRecommendation, setPricingRecommendation] = useState(null)
  const [gettingRecommendation, setGettingRecommendation] = useState(false)
  const [applyingPrice, setApplyingPrice] = useState(false)

  // AI Host Message Automator states
  const [messageAutomatorBooking, setMessageAutomatorBooking] = useState(null)
  const [draftedMessage, setDraftedMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [draftingMessage, setDraftingMessage] = useState(false)

  // Selected homestay for reviews
  const [selectedHomestay, setSelectedHomestay] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      // Parallelize properties and bookings (fast queries)
      const [hRes, bRes] = await Promise.all([
        fetchMyHomestays(),
        fetchOwnerBookings(),
      ])
      const myHomestays = hRes.data || []
      setHomestays(myHomestays)
      setBookings(bRes.data || [])

      // Parallelize reviews fetching for all homestays (very fast)
      if (myHomestays.length > 0) {
        const reviewPromises = myHomestays.map(async (h) => {
          try {
            const rRes = await fetchHomestayReviews(h._id)
            return { id: h._id, data: rRes.data || [] }
          } catch {
            return { id: h._id, data: [] }
          }
        })
        const results = await Promise.all(reviewPromises)
        const reviewMap = {}
        results.forEach((r) => {
          reviewMap[r.id] = r.data
        })
        setReviews(reviewMap)
        setSelectedHomestay(myHomestays[0]._id)
      } else {
        setReviews({})
      }
    } catch (err) {
      console.warn('Failed to load:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadAnalytics = async () => {
    if (analyticsLoading) return
    try {
      setAnalyticsLoading(true)
      const res = await fetchHostAnalytics()
      setAnalytics(res.data || null)
    } catch (err) {
      console.warn('Failed to load analytics:', err.message)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    if (tabId === 'analytics' && !analytics) {
      loadAnalytics()
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)

    setImageUploading(true)
    try {
      const res = await uploadImage(formData)
      setForm((prev) => ({ ...prev, image: res.url }))
      showAction('Image uploaded successfully!')
    } catch (err) {
      showAction(err.response?.data?.message || 'Failed to upload image', true)
    } finally {
      setImageUploading(false)
    }
  }

  const handleGetPriceRecommendation = async () => {
    if (!priceAdvisorHomestay) return
    setGettingRecommendation(true)
    setPricingRecommendation(null)
    try {
      const res = await suggestHomestayPrice(priceAdvisorHomestay._id, {
        seasonality,
        occupancy: Number(occupancy)
      })
      setPricingRecommendation(res.recommendation)
      showAction('Pricing recommendations generated!')
    } catch (err) {
      showAction(err.response?.data?.message || 'Failed to get price suggestion', true)
    } finally {
      setGettingRecommendation(false)
    }
  }

  const handleApplyPrice = async () => {
    if (!priceAdvisorHomestay || !pricingRecommendation?.recommendedPrice) return
    setApplyingPrice(true)
    try {
      const targetPrice = pricingRecommendation.recommendedPrice
      await updateHomestay(priceAdvisorHomestay._id, {
        name: priceAdvisorHomestay.name,
        location: priceAdvisorHomestay.location,
        description: priceAdvisorHomestay.description,
        amenities: priceAdvisorHomestay.amenities,
        pricePerNight: targetPrice,
        image: priceAdvisorHomestay.image
      })
      
      setHomestays((prev) =>
        prev.map((h) => (h._id === priceAdvisorHomestay._id ? { ...h, pricePerNight: targetPrice } : h))
      )
      
      showAction(`Price updated to ₹${targetPrice.toLocaleString()}!`)
      setPriceAdvisorHomestay(null)
    } catch (err) {
      showAction(err.response?.data?.message || 'Failed to apply new price', true)
    } finally {
      setApplyingPrice(false)
    }
  }

  const handleDraftBookingMessage = async (booking, type) => {
    setMessageAutomatorBooking(booking)
    setMessageType(type)
    setDraftingMessage(true)
    setDraftedMessage('')
    try {
      const res = await draftBookingMessage(booking._id, type)
      setDraftedMessage(res.messageText)
      showAction('Message draft generated!')
    } catch (err) {
      showAction(err.response?.data?.message || 'Failed to draft message', true)
    } finally {
      setDraftingMessage(false)
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
            { id: 'analytics', label: '📊 Analytics' },
          ].map(({ id, label }) => (
            <button key={id} onClick={() => handleTabChange(id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeTab === id ? 'bg-primary-500 text-white shadow-md' : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
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
                  <img src={resolveImageUrl(h.image)} alt={h.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-5">
                  <h3 className={`font-heading font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{h.name}</h3>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>📍 {h.location}</p>
                  <div className="flex items-center gap-3 mt-3">
                    {renderStars(Math.round(h.rating))}
                    <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{h.rating} ({h.totalReviews} reviews)</span>
                  </div>
                  <p className={`text-sm font-bold mt-2 ${darkMode ? 'text-primary-400' : 'text-primary-600'}`}>₹{h.pricePerNight?.toLocaleString()}/night</p>
                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    <button onClick={() => openEditModal(h)} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${darkMode ? 'text-primary-400 hover:bg-primary-900/20 border border-primary-800' : 'text-primary-600 hover:bg-primary-50 border border-primary-200'}`}>✏️ Edit</button>
                    <button onClick={() => { setSelectedHomestay(h._id); setActiveTab('reviews') }} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${darkMode ? 'text-amber-400 hover:bg-amber-900/20 border border-amber-800' : 'text-amber-600 hover:bg-amber-50 border border-amber-200'}`}>💬 Reviews ({(reviews[h._id] || []).length})</button>
                    <button onClick={() => { setPriceAdvisorHomestay(h); setSeasonality(''); setOccupancy(50); setPricingRecommendation(null); }} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${darkMode ? 'text-green-400 hover:bg-green-900/20 border border-green-800' : 'text-green-600 hover:bg-green-50 border border-green-200'}`}>💰 Pricing</button>
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

                      <div className="flex flex-wrap items-center gap-2">
                        {booking.status === 'confirmed' && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => handleDraftBookingMessage(booking, 'checkin')}
                              className="px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer border-primary-200 text-primary-500 hover:bg-primary-50 dark:border-primary-800/35 dark:text-primary-400 dark:hover:bg-primary-950/20 transition-colors"
                            >
                              ✉️ AI Check-in
                            </button>
                            <button
                              onClick={() => handleDraftBookingMessage(booking, 'checkout')}
                              className="px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer border-primary-200 text-amber-500 hover:bg-amber-50 dark:border-amber-800/35 dark:text-amber-400 dark:hover:bg-amber-950/20 transition-colors"
                            >
                              ✉️ AI Check-out
                            </button>
                          </div>
                        )}

                        {booking.status === 'confirmed' ? (
                          <button
                            onClick={() => handleStatusChange(booking._id, 'cancelled')}
                            className="px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer border-red-200 text-red-500 hover:bg-red-50 dark:border-red-800/35 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors"
                          >
                            ❌ Cancel
                          </button>
                        ) : booking.status === 'cancelled' ? (
                          <button
                            onClick={() => handleStatusChange(booking._id, 'confirmed')}
                            className="px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800/35 dark:text-green-400 dark:hover:bg-green-950/20 transition-colors"
                          >
                            ✅ Reinstate
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
        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          analyticsLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" style={{ borderWidth: '3px' }} />
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Generating AI Market Insights & Analytics...</span>
            </div>
          ) : analytics ? (
          <div className="space-y-6">
            {/* AI Insights Card */}
            <div className={`rounded-2xl border p-6 bg-gradient-to-br from-primary-500/10 via-transparent to-transparent ${
              darkMode ? 'border-primary-900/50 bg-dark-800' : 'border-primary-100 bg-white'
            }`}>
              <div className="flex items-start gap-4">
                <span className="text-3xl">🤖</span>
                <div>
                  <h3 className={`font-heading font-bold text-base mb-1.5 ${darkMode ? 'text-primary-400' : 'text-primary-600'}`}>
                    AI-Powered Property Insights
                  </h3>
                  <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {analytics.aiSummary}
                  </p>
                </div>
              </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`rounded-2xl border p-6 ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'}`}>
                <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Total Earnings
                </span>
                <div className={`text-3xl font-heading font-black mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  ₹{analytics.totalRevenue?.toLocaleString()}
                </div>
                <p className={`text-xs mt-1.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Generated from confirmed guest stays
                </p>
              </div>

              <div className={`rounded-2xl border p-6 ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'}`}>
                <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Average Order Value
                </span>
                <div className={`text-3xl font-heading font-black mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  ₹{analytics.totalBookings > 0 ? Math.round(analytics.totalRevenue / analytics.totalBookings).toLocaleString() : '0'}
                </div>
                <p className={`text-xs mt-1.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Average revenue generated per check-in
                </p>
              </div>

              <div className={`rounded-2xl border p-6 ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'}`}>
                <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Host Reputation
                </span>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`text-3xl font-heading font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {analytics.averageRating}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    {renderStars(Math.round(analytics.averageRating))}
                    <span className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Based on {analytics.sentiment?.total || 0} review{analytics.sentiment?.total !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Earnings Bar Chart */}
              <div className={`rounded-2xl border p-6 ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'}`}>
                <h3 className={`font-heading font-bold text-sm mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Revenue Over Time 📈
                </h3>
                
                {analytics.monthlyRevenue?.length > 0 ? (
                  <div className="space-y-4">
                    {/* SVG Chart */}
                    <div className="h-48 flex items-end justify-around pt-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                      {analytics.monthlyRevenue.map((item, index) => {
                        const maxVal = Math.max(...analytics.monthlyRevenue.map(m => m.revenue), 1)
                        const pct = Math.round((item.revenue / maxVal) * 85) // Cap at 85% height for labels
                        return (
                          <div key={index} className="flex flex-col items-center flex-1 group relative">
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 px-2 py-1 bg-gray-900 text-white text-[10px] rounded shadow-lg whitespace-nowrap">
                              ₹{item.revenue?.toLocaleString()}
                            </div>
                            {/* Bar */}
                            <div 
                              style={{ height: `${Math.max(pct, 6)}%` }}
                              className="w-8 sm:w-12 bg-primary-500 hover:bg-primary-600 rounded-t-lg transition-all duration-300 shadow-lg shadow-primary-500/10 hover:shadow-primary-500/30 cursor-pointer"
                            />
                            {/* Label */}
                            <span className={`text-[10px] mt-2 font-medium ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              {item.month}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl mb-2">📉</span>
                    <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      No revenue data to display
                    </span>
                  </div>
                )}
              </div>

              {/* Review Sentiment Chart */}
              <div className={`rounded-2xl border p-6 ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'}`}>
                <h3 className={`font-heading font-bold text-sm mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Guest Sentiment Breakdown 💬
                </h3>

                {analytics.sentiment?.total > 0 ? (
                  <div className="space-y-5">
                    {/* Positive */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>😊 Positive Sentiment (4-5 ★)</span>
                        <span className="text-green-500">
                          {analytics.sentiment.positive} ({Math.round((analytics.sentiment.positive / analytics.sentiment.total) * 100)}%)
                        </span>
                      </div>
                      <div className={`h-2 rounded-full ${darkMode ? 'bg-dark-900' : 'bg-gray-100'}`}>
                        <div 
                          style={{ width: `${(analytics.sentiment.positive / analytics.sentiment.total) * 100}%` }}
                          className="h-full bg-green-500 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Neutral */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>😐 Neutral Sentiment (3 ★)</span>
                        <span className="text-amber-500">
                          {analytics.sentiment.neutral} ({Math.round((analytics.sentiment.neutral / analytics.sentiment.total) * 100)}%)
                        </span>
                      </div>
                      <div className={`h-2 rounded-full ${darkMode ? 'bg-dark-900' : 'bg-gray-100'}`}>
                        <div 
                          style={{ width: `${(analytics.sentiment.neutral / analytics.sentiment.total) * 100}%` }}
                          className="h-full bg-amber-500 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Negative */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>😟 Critical Sentiment (1-2 ★)</span>
                        <span className="text-red-500">
                          {analytics.sentiment.negative} ({Math.round((analytics.sentiment.negative / analytics.sentiment.total) * 100)}%)
                        </span>
                      </div>
                      <div className={`h-2 rounded-full ${darkMode ? 'bg-dark-900' : 'bg-gray-100'}`}>
                        <div 
                          style={{ width: `${(analytics.sentiment.negative / analytics.sentiment.total) * 100}%` }}
                          className="h-full bg-red-500 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl mb-2">📊</span>
                    <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      No review sentiment data to display
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <span className="text-4xl">📈</span>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Click below to generate AI-powered analytics</span>
              <button onClick={loadAnalytics} className="px-5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold cursor-pointer hover:bg-primary-600 transition-colors shadow-md">
                Generate Analytics
              </button>
            </div>
          )
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
                  <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Image URL / Path</label>
                  <input type="text" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." className={inputClass} />
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${darkMode ? 'bg-dark-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-550'}`}>
                  📸 Upload Property Image
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-3 cursor-pointer transition-colors border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500">
                    {imageUploading ? (
                      <div className="flex items-center gap-2 text-xs text-primary-500">
                        <div className="w-4 h-4 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
                        <span>Uploading image...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center">
                        <span className="text-lg">📁</span>
                        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Click to choose image file</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={imageUploading} className="hidden" />
                  </label>

                  {form.image && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative group shrink-0">
                      <img src={resolveImageUrl(form.image)} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setForm({ ...form, image: '' })} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                        🗑 Remove
                      </button>
                    </div>
                  )}
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
      {/* Dynamic Pricing Advisor Modal */}
      {priceAdvisorHomestay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPriceAdvisorHomestay(null)} />
          <div className={`relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl border shadow-2xl p-8 ${darkMode ? 'bg-dark-800 border-gray-700' : 'bg-white border-gray-200'}`} style={{ animation: 'slideUp 0.3s ease-out' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-heading font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                💰 AI Pricing Advisor
              </h2>
              <button onClick={() => setPriceAdvisorHomestay(null)} className={`text-sm font-semibold p-1 hover:opacity-80`}>✕</button>
            </div>
            
            <p className={`text-xs mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Get AI-driven pricing recommendation for <strong>{priceAdvisorHomestay.name}</strong> based on seasonality and expected occupancy.
            </p>

            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Current Price per Night
                </label>
                <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  ₹{priceAdvisorHomestay.pricePerNight?.toLocaleString()}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Seasonality Keywords / Events
                </label>
                <input
                  type="text"
                  value={seasonality}
                  onChange={(e) => setSeasonality(e.target.value)}
                  placeholder="e.g. summer vacation spike, diwali peak, monsoon low"
                  className={inputClass}
                />
              </div>

              <div>
                <div className="flex justify-between text-sm font-medium mb-1.5">
                  <label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Expected Occupancy</label>
                  <span className="font-bold text-primary-500">{occupancy}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={occupancy}
                  onChange={(e) => setOccupancy(e.target.value)}
                  className="w-full accent-primary-500"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>0% (Empty)</span>
                  <span>50%</span>
                  <span>100% (Fully Booked)</span>
                </div>
              </div>

              <button
                onClick={handleGetPriceRecommendation}
                disabled={gettingRecommendation}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold shadow-lg shadow-green-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {gettingRecommendation ? 'Analyzing Market...' : '🤖 Generate AI Price Recommendation'}
              </button>

              {pricingRecommendation && (
                <div className={`mt-6 p-5 rounded-xl border ${darkMode ? 'bg-primary-950/20 border-primary-900' : 'bg-primary-50/50 border-primary-100'}`}>
                  <h4 className={`text-sm font-bold flex items-center gap-1.5 mb-2 ${darkMode ? 'text-primary-400' : 'text-primary-750'}`}>
                    📊 AI Pricing Strategy Result
                  </h4>
                  
                  <div className="flex justify-between border-b pb-2 mb-3 border-primary-250 dark:border-primary-900">
                    <span className="text-xs text-gray-500 dark:text-gray-450">Recommended Rate:</span>
                    <span className={`text-base font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      ₹{pricingRecommendation.recommendedPrice?.toLocaleString()} / night
                    </span>
                  </div>

                  <p className={`text-xs leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-705'}`}>
                    <strong>Justification:</strong> {pricingRecommendation.justification}
                  </p>

                  <button
                    onClick={handleApplyPrice}
                    disabled={applyingPrice}
                    className="mt-4 w-full py-2.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold shadow transition-all cursor-pointer disabled:opacity-50"
                  >
                    {applyingPrice ? 'Applying Rate...' : '💰 Apply Recommended Rate Directly'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Host Message Automator Modal */}
      {messageAutomatorBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMessageAutomatorBooking(null)} />
          <div className={`relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border shadow-2xl p-8 ${darkMode ? 'bg-dark-800 border-gray-700' : 'bg-white border-gray-200'}`} style={{ animation: 'slideUp 0.3s ease-out' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-heading font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                ✉️ AI Host Message Automator
              </h2>
              <button onClick={() => setMessageAutomatorBooking(null)} className={`text-sm font-semibold p-1 hover:opacity-80`}>✕</button>
            </div>

            <p className={`text-xs mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Draft a warm, personalized check-in or check-out instruction for guest <strong>{messageAutomatorBooking.customer?.name}</strong>.
            </p>

            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => handleDraftBookingMessage(messageAutomatorBooking, 'checkin')}
                  disabled={draftingMessage}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    messageType === 'checkin'
                      ? 'bg-primary-500 text-white shadow-md'
                      : darkMode ? 'bg-dark-900 border border-gray-700 text-gray-300' : 'bg-gray-50 border border-gray-200 text-gray-650'
                  }`}
                >
                  🛎 Draft Check-In Instructions
                </button>
                <button
                  onClick={() => handleDraftBookingMessage(messageAutomatorBooking, 'checkout')}
                  disabled={draftingMessage}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    messageType === 'checkout'
                      ? 'bg-primary-500 text-white shadow-md'
                      : darkMode ? 'bg-dark-900 border border-gray-700 text-gray-300' : 'bg-gray-50 border border-gray-200 text-gray-650'
                  }`}
                >
                  🔑 Draft Check-Out Instructions
                </button>
              </div>

              {draftingMessage && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Drafting personalized message with Gemini AI...
                  </span>
                </div>
              )}

              {draftedMessage && !draftingMessage && (
                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Generated Message Draft
                    </label>
                    <textarea
                      value={draftedMessage}
                      onChange={(e) => setDraftedMessage(e.target.value)}
                      rows={12}
                      className={`${inputClass} leading-relaxed font-sans`}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(draftedMessage)
                        showAction('Message copied to clipboard!')
                      }}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                    >
                      📋 Copy to Clipboard
                    </button>
                    <button
                      onClick={() => setMessageAutomatorBooking(null)}
                      className={`px-5 py-3 rounded-xl border text-xs font-semibold cursor-pointer ${
                        darkMode ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
