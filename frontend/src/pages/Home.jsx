/**
 * Home — Landing page with Hero, Featured Homestays, Features, How It Works, Testimonials, and CTA.
 * All sections support dark mode through conditional styling.
 */
import { useState, useEffect } from 'react'
import Hero from '../components/Hero'
import FeatureCard from '../components/FeatureCard'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { fetchHomestays } from '../services/api'

const features = [
  {
    icon: '⭐',
    title: 'Review Management',
    description:
      'Centralize and monitor guest reviews. Write reviews as a customer, view aggregated ratings, and build authentic connections.',
    accent: 'primary',
  },
  {
    icon: '🤖',
    title: 'AI Response Suggestions',
    description:
      'Generate thoughtful, personalized reply drafts for guest reviews. Our AI understands context and sentiment to craft high-quality responses.',
    accent: 'accent',
  },
  {
    icon: '🗺️',
    title: 'Multi-Role Portals',
    description:
      'Distinct custom dashboards for Guests to review and browse, Hosts to reply and list properties, and Admins to manage the platform.',
    accent: 'teal',
  },
]

const testimonials = [
  {
    quote: 'StayWise cut our review response time from hours to minutes. Our guest satisfaction scores jumped 22% in the first month.',
    name: 'Priya Sharma',
    role: 'Homestay Owner, Manali',
  },
  {
    quote: 'The AI tourist assistance feature is a game-changer. Guests love the personalized local recommendations we now provide.',
    name: 'Rahul Menon',
    role: 'Property Manager, Kerala',
  },
  {
    quote: 'Managing reviews across Airbnb, Booking.com, and Google used to be chaos. StayWise unified everything into one clean dashboard.',
    name: 'Ananya Iyer',
    role: 'Boutique Villa Host, Goa',
  },
]

export default function Home() {
  const { darkMode } = useTheme()
  const [featuredHomestays, setFeaturedHomestays] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchHomestays()
        // Sort by highest rating first and take top 3
        const sorted = (result.data || [])
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 3)
        setFeaturedHomestays(sorted)
      } catch (err) {
        console.warn('Failed to load featured homestays:', err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const renderStars = (rating) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < rating ? 'text-amber-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )

  return (
    <>
      <Hero />

      {/* Featured Homestays Section */}
      <section className={`py-20 ${darkMode ? 'bg-dark-850' : 'bg-gray-50/50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 ${darkMode ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-50 text-primary-600'}`}>
              Featured Homestays
            </span>
            <h2 className={`text-3xl sm:text-4xl font-heading font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Top-Rated Getaways
            </h2>
            <p className={`mt-4 text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Handpicked premium properties with exceptional guest reviews and dedicated host support.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredHomestays.map((h) => (
                <Link
                  to={`/homestays/${h._id}`}
                  key={h._id}
                  className={`group rounded-3xl border overflow-hidden hover:shadow-xl transition-all duration-300 ${darkMode ? 'border-gray-700 bg-dark-800 hover:border-primary-700' : 'border-gray-200 bg-white hover:border-primary-300'}`}
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={h.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
                      alt={h.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className={`font-heading font-semibold text-lg group-hover:text-primary-500 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {h.name}
                    </h3>
                    <p className={`text-sm mt-1 flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      📍 {h.location}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1.5">
                        {renderStars(Math.round(h.rating))}
                        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          ({h.totalReviews})
                        </span>
                      </div>
                      <span className={`text-sm font-bold ${darkMode ? 'text-primary-400' : 'text-primary-600'}`}>
                        ₹{h.pricePerNight?.toLocaleString()}/night
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              {featuredHomestays.length === 0 && (
                <div className="col-span-full text-center py-10">
                  <p className={darkMode ? 'text-gray-500' : 'text-gray-400'}>No homestays created yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Features section */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 ${darkMode ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-50 text-primary-600'}`}>
              Core Features
            </span>
            <h2 className={`text-3xl sm:text-4xl font-heading font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                Run Your Homestay
              </span>
            </h2>
            <p className={`mt-4 text-lg leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              From managing guest reviews to offering intelligent tourist support — StayWise provides a complete AI-powered toolkit for modern homestay owners.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={`py-20 ${darkMode ? 'bg-gradient-to-b from-dark-800/50 to-dark-900' : 'bg-gradient-to-b from-gray-50 to-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 ${darkMode ? 'bg-accent-900/30 text-accent-400' : 'bg-accent-50 text-accent-600'}`}>
              How It Works
            </span>
            <h2 className={`text-3xl sm:text-4xl font-heading font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Three Simple Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Register Your Account',
                desc: 'Sign up as a Guest to book/review properties, or as an Owner to create a homestay and list amenities.',
              },
              {
                step: '02',
                title: 'Submit Reviews & Share',
                desc: 'Guests leave reviews and ratings. AI assists hosts with instant reply suggestions.',
              },
              {
                step: '03',
                title: 'Interact & Build Trust',
                desc: 'Hosts reply to reviews, addressing guest suggestions to improve hospitality and listing quality.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative pl-16">
                <span className="absolute left-0 top-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white font-heading font-bold text-lg shadow-lg shadow-primary-500/20">
                  {step}
                </span>
                <h3 className={`text-lg font-heading font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
                <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 ${darkMode ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-50 text-primary-600'}`}>
              Testimonials
            </span>
            <h2 className={`text-3xl sm:text-4xl font-heading font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Loved by Homestay Owners
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map(({ quote, name, role }) => (
              <div
                key={name}
                className={`rounded-2xl border p-8 hover:shadow-lg transition-shadow duration-300 ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-100 bg-gray-50/50'}`}
              >
                <svg className="w-8 h-8 text-primary-300 dark:text-primary-600 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C9.591 11.689 11 13.166 11 15a3 3 0 1 1-6 0c0-.223.018-.44.053-.651l.001-.006Zm11 0C14.553 16.227 14 15 14 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C20.591 11.689 22 13.166 22 15a3 3 0 1 1-6 0c0-.223.018-.44.053-.651l.001-.006Z" />
                </svg>
                <p className={`leading-relaxed text-sm mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>"{quote}"</p>
                <div>
                  <p className={`font-heading font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{name}</p>
                  <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 p-12 sm:p-16 text-center">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] opacity-50" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
                Ready to Experience StayWise?
              </h2>
              <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">
                Join our premium community today to browse exquisite properties or manage your homestays with state-of-the-art tools.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-primary-700 font-semibold shadow-2xl hover:shadow-white/20 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Get Started Free
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
