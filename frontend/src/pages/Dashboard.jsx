import { useState } from 'react'

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

  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Welcome back! Here's your homestay overview for today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-600 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              AI Active
            </span>
            <button className="px-4 py-2 rounded-lg bg-primary-50 text-primary-600 text-sm font-medium hover:bg-primary-100 transition-colors">
              Generate Report
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {stats.map(({ label, value, change, up, icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{icon}</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    up ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {change}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-heading font-bold text-gray-900">{value}</div>
              <div className="text-xs text-gray-500 mt-1 font-medium">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Reviews list */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-heading font-semibold text-gray-900">Recent Reviews</h2>
                <span className="text-xs text-gray-400 font-medium">Last 24 hours</span>
              </div>

              <div className="divide-y divide-gray-100">
                {recentReviews.map((review) => (
                  <div key={review.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                            {review.guest.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">{review.guest}</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
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
                                i < review.rating ? 'text-amber-400' : 'text-gray-200'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>

                        <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>

                        {/* AI Suggestion expandable */}
                        {review.aiSuggestion && (
                          <div className="mt-3">
                            <button
                              onClick={() =>
                                setExpandedReview(expandedReview === review.id ? null : review.id)
                              }
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
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
                              <div className="rounded-xl bg-primary-50/50 border border-primary-100 p-4 text-sm text-gray-700 leading-relaxed">
                                {review.aiSuggestion}
                                <div className="flex items-center gap-2 mt-3">
                                  <button className="px-3 py-1.5 rounded-lg bg-primary-500 text-white text-xs font-medium hover:bg-primary-600 transition-colors">
                                    Use This Reply
                                  </button>
                                  <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-100 transition-colors">
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
                            ? 'bg-green-50 text-green-600'
                            : 'bg-amber-50 text-amber-600'
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
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="font-heading font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map(({ label, icon }) => (
                  <button
                    key={label}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-primary-50 hover:border-primary-200 transition-all duration-200 group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                      {icon}
                    </span>
                    <span className="text-xs font-medium text-gray-600 group-hover:text-primary-700 text-center">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="font-heading font-semibold text-gray-900 mb-4">AI Insights</h2>
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
                        ? 'bg-green-50/50 border-green-100 text-green-800'
                        : type === 'warning'
                        ? 'bg-amber-50/50 border-amber-100 text-amber-800'
                        : 'bg-blue-50/50 border-blue-100 text-blue-800'
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
