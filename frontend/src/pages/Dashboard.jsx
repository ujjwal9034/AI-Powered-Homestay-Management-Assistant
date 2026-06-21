/**
 * Dashboard — Main management view with stats, reviews, quick actions, and AI insights.
 * Full dark mode and responsive layout support.
 */
import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

const stats = [
  { label: 'Total Reviews', value: '1,284', change: '+12%', up: true, icon: '⭐' },
  { label: 'Avg. Rating', value: '4.7', change: '+0.3', up: true, icon: '📊' },
  { label: 'Response Rate', value: '96%', change: '+4%', up: true, icon: '💬' },
  { label: 'Pending Replies', value: '8', change: '-3', up: false, icon: '📝' },
]

const recentReviews = [
  {
    id: 1,
    guest: 'Sarah Mitchell',
    platform: 'Airbnb',
    rating: 5,
    text: 'Absolutely loved our stay! The mountain views were breathtaking and the host was incredibly helpful with local recommendations.',
    date: '2 hours ago',
    status: 'replied',
    aiSuggestion: null,
  },
  {
    id: 2,
    guest: 'James Park',
    platform: 'Booking.com',
    rating: 4,
    text: 'Great location and clean rooms. The Wi-Fi could be a bit stronger, but overall a wonderful experience for our family trip.',
    date: '5 hours ago',
    status: 'pending',
    aiSuggestion:
      "Thank you for your kind words, James! We are thrilled your family enjoyed the stay. We've noted the Wi-Fi feedback and are upgrading our network infrastructure this month. We'd love to welcome you back!",
  },
  {
    id: 3,
    guest: 'Maria González',
    platform: 'Google',
    rating: 5,
    text: 'The best homestay experience we have ever had! The traditional breakfast was amazing, and the host arranged a wonderful trek for us.',
    date: '1 day ago',
    status: 'pending',
    aiSuggestion:
      "We're so grateful for your lovely review, Maria! Our traditional breakfast is something we take great pride in. It was our pleasure to arrange the trek — the monsoon trails are truly magical. Hope to see you again!",
  },
]

const quickActions = [
  { label: 'View All Reviews', icon: '📋' },
  { label: 'AI Response Queue', icon: '🤖' },
  { label: 'Guest Messages', icon: '✉️' },
  { label: 'Analytics Report', icon: '📈' },
]

export default function Dashboard() {
  const [expandedReview, setExpandedReview] = useState(null)
  const { darkMode } = useTheme()

  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-heading font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Dashboard
            </h1>
            <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Welcome back! Here's your homestay overview for today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'}`}>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              AI Active
            </span>
            <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${darkMode ? 'bg-primary-900/30 text-primary-400 hover:bg-primary-900/50' : 'bg-primary-50 text-primary-600 hover:bg-primary-100'}`}>
              Generate Report
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
                <span className={`text-xs font-medium ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Last 24 hours</span>
              </div>

              <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {recentReviews.map((review) => (
                  <div key={review.id} className={`p-6 transition-colors ${darkMode ? 'hover:bg-dark-900/50' : 'hover:bg-gray-50/50'}`}>
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
                              <span>{review.date}</span>
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
                                setExpandedReview(expandedReview === review.id ? null : review.id)
                              }
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors cursor-pointer"
                            >
                              <span>🤖</span>
                              {expandedReview === review.id ? 'Hide' : 'View'} AI Suggestion
                              <svg
                                className={`w-3 h-3 transition-transform duration-200 ${
                                  expandedReview === review.id ? 'rotate-180' : ''
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
                                expandedReview === review.id ? 'max-h-48 opacity-100 mt-3' : 'max-h-0 opacity-0'
                              }`}
                            >
                              <div className={`rounded-xl border p-4 text-sm leading-relaxed ${darkMode ? 'bg-primary-900/20 border-primary-800 text-gray-300' : 'bg-primary-50/50 border-primary-100 text-gray-700'}`}>
                                {review.aiSuggestion}
                                <div className="flex items-center gap-2 mt-3">
                                  <button className="px-3 py-1.5 rounded-lg bg-primary-500 text-white text-xs font-medium hover:bg-primary-600 transition-colors cursor-pointer">
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
    </section>
  )
}
