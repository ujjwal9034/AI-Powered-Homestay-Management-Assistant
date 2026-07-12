/**
 * CustomerDashboard — What customers see when logged in.
 *
 * - Browse all homestays
 * - View own reviews only
 * - Write new reviews (via HomestayDetail page)
 * - Edit/delete own reviews
 */
import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { fetchHomestays, fetchMyReviews, deleteReview, fetchMyBookings } from '../services/api'

export default function CustomerDashboard() {
  const { darkMode } = useTheme()
  const { user } = useAuth()

  const [homestays, setHomestays] = useState([])
  const [myReviews, setMyReviews] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionMsg, setActionMsg] = useState(null)
  const [activeTab, setActiveTab] = useState('browse')

  useEffect(() => {
    const load = async () => {
      try {
        const [hRes, rRes, bRes] = await Promise.all([
          fetchHomestays(),
          fetchMyReviews(),
          fetchMyBookings(),
        ])
        setHomestays(hRes.data || [])
        setMyReviews(rRes.data || [])
        setBookings(bRes.data || [])
      } catch (err) {
        console.warn('Failed to load data:', err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const showAction = (msg, isError = false) => {
    setActionMsg({ msg, isError })
    setTimeout(() => setActionMsg(null), 3000)
  }

  const handleDeleteReview = async (id) => {
    if (!confirm('Delete this review?')) return
    try {
      await deleteReview(id)
      setMyReviews((prev) => prev.filter((r) => r._id !== id))
      showAction('Review deleted')
    } catch {
      showAction('Failed to delete review', true)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading your dashboard...</span>
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
            <span>{actionMsg.isError ? '❌' : '✅'}</span>
            {actionMsg.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-heading font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Welcome, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Discover amazing homestays and share your experiences
            </p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
            👤 Guest Account
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Homestays to Explore', value: homestays.length, icon: '🏡' },
            { label: 'My Bookings', value: bookings.length, icon: '📅' },
            { label: 'My Reviews', value: myReviews.length, icon: '⭐' },
            { label: 'Avg Rating Given', value: myReviews.length > 0 ? (myReviews.reduce((s, r) => s + r.rating, 0) / myReviews.length).toFixed(1) : '—', icon: '📊' },
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
            { id: 'browse', label: '🏡 Browse Homestays' },
            { id: 'bookings', label: '📅 My Bookings' },
            { id: 'reviews', label: '⭐ My Reviews' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeTab === id ? 'bg-primary-500 text-white shadow-md' : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Browse Homestays Tab */}
        {activeTab === 'browse' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {homestays.map((h) => (
              <Link
                to={`/homestays/${h._id}`}
                key={h._id}
                className={`group rounded-2xl border overflow-hidden hover:shadow-lg transition-all duration-300 ${darkMode ? 'border-gray-700 bg-dark-800 hover:border-primary-700' : 'border-gray-200 bg-white hover:border-primary-300'}`}
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={h.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
                    alt={h.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <h3 className={`font-heading font-semibold text-lg group-hover:text-primary-500 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {h.name}
                  </h3>
                  <p className={`text-sm mt-1 flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    📍 {h.location}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      {renderStars(Math.round(h.rating))}
                      <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        ({h.totalReviews} {h.totalReviews === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                    <span className={`text-sm font-bold ${darkMode ? 'text-primary-400' : 'text-primary-600'}`}>
                      ₹{h.pricePerNight?.toLocaleString()}<span className="text-xs font-normal">/night</span>
                    </span>
                  </div>
                  {h.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {h.amenities.slice(0, 3).map((a) => (
                        <span key={a} className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                          {a}
                        </span>
                      ))}
                      {h.amenities.length > 3 && (
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                          +{h.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
            {homestays.length === 0 && (
              <div className="col-span-full flex flex-col items-center py-16">
                <span className="text-4xl mb-3">🏡</span>
                <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No homestays available yet</span>
              </div>
            )}
          </div>
        )}

        {/* My Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className={`rounded-2xl border overflow-hidden flex flex-col md:flex-row ${
                  darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'
                }`}
              >
                {/* Image */}
                <div className="w-full md:w-48 aspect-[16/10] md:aspect-auto overflow-hidden bg-gray-100">
                  <img
                    src={booking.homestay?.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'}
                    alt={booking.homestay?.name || 'Property'}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Booking details */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className={`text-base font-semibold font-heading ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {booking.homestay?.name || 'Homestay'}
                        </h3>
                        <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          📍 {booking.homestay?.location}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        booking.status === 'confirmed'
                          ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'
                          : booking.status === 'cancelled'
                          ? darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'
                          : darkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 py-3 border-y border-dashed border-gray-200 dark:border-gray-750">
                      <div>
                        <span className={`block text-[10px] uppercase font-bold ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Check-in</span>
                        <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {new Date(booking.checkIn).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div>
                        <span className={`block text-[10px] uppercase font-bold ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Check-out</span>
                        <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {new Date(booking.checkOut).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div>
                        <span className={`block text-[10px] uppercase font-bold ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Nights</span>
                        <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{booking.nights} night{booking.nights > 1 ? 's' : ''}</span>
                      </div>
                      <div>
                        <span className={`block text-[10px] uppercase font-bold ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Guests</span>
                        <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{booking.guestsCount} guest{booking.guestsCount > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Booked on {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                    <span className={`text-sm font-bold ${darkMode ? 'text-primary-400' : 'text-primary-600'}`}>
                      Total Price: ₹{booking.totalPrice?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {bookings.length === 0 && (
              <div className={`rounded-2xl border border-dashed p-16 text-center ${darkMode ? 'border-gray-700 bg-dark-850' : 'border-gray-200 bg-gray-50/20'}`}>
                <span className="text-4xl block mb-3">📅</span>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No bookings scheduled. Time to plan your next vacation!
                </p>
                <button onClick={() => setActiveTab('browse')} className="mt-3 text-sm text-primary-500 hover:text-primary-600 font-semibold cursor-pointer">
                  Browse available homestays →
                </button>
              </div>
            )}
          </div>
        )}

        {/* My Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'}`}>
            <div className={`px-6 py-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <h2 className={`font-heading font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>My Reviews</h2>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Only you can see your reviews here</p>
            </div>
            <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
              {myReviews.map((review) => (
                <div key={review._id} className={`p-6 ${darkMode ? 'hover:bg-dark-900/50' : 'hover:bg-gray-50/50'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-sm font-semibold ${darkMode ? 'text-primary-400' : 'text-primary-600'}`}>
                          🏡 {review.homestay?.name || 'Homestay'}
                        </span>
                        <span className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>·</span>
                        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {review.homestay?.location}
                        </span>
                      </div>
                      {renderStars(review.rating)}
                      <p className={`text-sm leading-relaxed mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{review.text}</p>

                      {/* Owner reply */}
                      {review.ownerReply?.text && (
                        <div className={`mt-3 rounded-xl border p-4 ${darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50/50 border-green-100'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs">💬</span>
                            <span className={`text-xs font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>Owner Reply</span>
                          </div>
                          <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-800'}`}>{review.ownerReply.text}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-3">
                        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${darkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-500 hover:bg-red-50'}`}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                    <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${review.status === 'replied' ? (darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600') : (darkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-600')}`}>
                      {review.status === 'replied' ? 'Replied' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
              {myReviews.length === 0 && (
                <div className="flex flex-col items-center py-16">
                  <span className="text-4xl mb-3">📝</span>
                  <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>You haven't written any reviews yet</span>
                  <button onClick={() => setActiveTab('browse')} className="mt-3 text-sm text-primary-500 hover:text-primary-600 font-medium cursor-pointer">
                    Browse homestays to write your first review →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
