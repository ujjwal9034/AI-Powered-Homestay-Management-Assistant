/**
 * Home — Landing page with Hero, Featured Homestays, Features, How It Works, Testimonials, and CTA.
 * Enhanced with scroll-reveal animations, Lucide icons, and improved testimonials.
 */
import { useState, useEffect, useRef } from 'react'
import Hero from '../components/Hero'
import FeatureCard from '../components/FeatureCard'
import { HomestayCardSkeleton } from '../components/SkeletonCard'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { fetchHomestays, resolveImageUrl } from '../services/api'
import {
  Star,
  MessageSquare,
  Bot,
  Users,
  UserPlus,
  PenLine,
  Handshake,
  ArrowRight,
  MapPin,
  Quote,
} from 'lucide-react'

const features = [
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'Review Management',
    description:
      'Centralize and monitor guest reviews. Write reviews as a customer, view aggregated ratings, and build authentic connections.',
    accent: 'primary',
  },
  {
    icon: <Bot className="w-6 h-6" />,
    title: 'AI Response Suggestions',
    description:
      'Generate thoughtful, personalized reply drafts for guest reviews. Our AI understands context and sentiment to craft high-quality responses.',
    accent: 'accent',
  },
  {
    icon: <Users className="w-6 h-6" />,
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
    rating: 5,
    initial: 'P',
    gradient: 'from-rose-400 to-pink-600',
  },
  {
    quote: 'The AI tourist assistance feature is a game-changer. Guests love the personalized local recommendations we now provide.',
    name: 'Rahul Menon',
    role: 'Property Manager, Kerala',
    rating: 5,
    initial: 'R',
    gradient: 'from-blue-400 to-indigo-600',
  },
  {
    quote: 'Managing reviews across Airbnb, Booking.com, and Google used to be chaos. StayWise unified everything into one clean dashboard.',
    name: 'Ananya Iyer',
    role: 'Boutique Villa Host, Goa',
    rating: 4,
    initial: 'A',
    gradient: 'from-emerald-400 to-teal-600',
  },
]

const howItWorks = [
  {
    step: '01',
    title: 'Register Your Account',
    desc: 'Sign up as a Guest to book/review properties, or as an Owner to create a homestay and list amenities.',
    icon: UserPlus,
  },
  {
    step: '02',
    title: 'Submit Reviews & Share',
    desc: 'Guests leave reviews and ratings. AI assists hosts with instant reply suggestions.',
    icon: PenLine,
  },
  {
    step: '03',
    title: 'Interact & Build Trust',
    desc: 'Hosts reply to reviews, addressing guest suggestions to improve hospitality and listing quality.',
    icon: Handshake,
  },
]

/**
 * Custom hook for scroll-reveal animation using Intersection Observer.
 */
function useScrollReveal() {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el) // Only trigger once
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, isVisible }
}

function AnimatedSection({ children, className = '', delay = 0 }) {
  const { ref, isVisible } = useScrollReveal()

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

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
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? 'text-amber-400 fill-amber-400' : darkMode ? 'text-gray-600' : 'text-gray-200'}`}
        />
      ))}
    </div>
  )

  return (
    <>
      <Hero />

      {/* Featured Homestays Section */}
      <section className={`py-20 ${darkMode ? 'bg-dark-850' : 'bg-gray-50/50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-2xl mx-auto mb-16">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 ${darkMode ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-50 text-primary-600'}`}>
              Featured Homestays
            </span>
            <h2 className={`text-3xl sm:text-4xl font-heading font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Top-Rated Getaways
            </h2>
            <p className={`mt-4 text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Handpicked premium properties with exceptional guest reviews and dedicated host support.
            </p>
          </AnimatedSection>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <HomestayCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredHomestays.map((h, idx) => (
                <AnimatedSection key={h._id} delay={idx * 100}>
                  <Link
                    to={`/homestays/${h._id}`}
                    className={`group rounded-3xl border overflow-hidden hover:shadow-xl transition-all duration-300 block ${darkMode ? 'border-gray-700 bg-dark-800 hover:border-primary-700' : 'border-gray-200 bg-white hover:border-primary-300'}`}
                  >
                    <div className="aspect-[16/10] overflow-hidden relative">
                      <img
                        src={resolveImageUrl(h.image)}
                        alt={h.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-sm text-white text-xs font-bold">
                        ₹{h.pricePerNight?.toLocaleString()}/night
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className={`font-heading font-semibold text-lg group-hover:text-primary-500 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {h.name}
                      </h3>
                      <p className={`text-sm mt-1 flex items-center gap-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <MapPin className="w-3.5 h-3.5" />
                        {h.location}
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-1.5">
                          {renderStars(Math.round(h.rating))}
                          <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            ({h.totalReviews})
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
              {featuredHomestays.length === 0 && (
                <div className="col-span-full text-center py-10">
                  <p className={darkMode ? 'text-gray-500' : 'text-gray-400'}>No homestays created yet.</p>
                </div>
              )}
            </div>
          )}

          {/* View All button */}
          {featuredHomestays.length > 0 && (
            <AnimatedSection className="text-center mt-10">
              <Link
                to="/explore"
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl border font-semibold text-sm transition-all hover:scale-105 ${darkMode ? 'border-gray-600 text-gray-300 hover:border-primary-600 hover:text-primary-400' : 'border-gray-300 text-gray-700 hover:border-primary-400 hover:text-primary-600'}`}
              >
                View All Properties
                <ArrowRight className="w-4 h-4" />
              </Link>
            </AnimatedSection>
          )}
        </div>
      </section>

      {/* Features section */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-2xl mx-auto mb-16">
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
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <AnimatedSection key={feature.title} delay={idx * 100}>
                <FeatureCard {...feature} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className={`py-20 ${darkMode ? 'bg-gradient-to-b from-dark-800/50 to-dark-900' : 'bg-gradient-to-b from-gray-50 to-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-2xl mx-auto mb-16">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 ${darkMode ? 'bg-accent-900/30 text-accent-400' : 'bg-accent-50 text-accent-600'}`}>
              How It Works
            </span>
            <h2 className={`text-3xl sm:text-4xl font-heading font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Three Simple Steps
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map(({ step, title, desc, icon: Icon }, idx) => (
              <AnimatedSection key={step} delay={idx * 150} className="relative pl-16">
                <span className="absolute left-0 top-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/20">
                  <Icon className="w-5 h-5" />
                </span>
                <h3 className={`text-lg font-heading font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
                <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{desc}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-2xl mx-auto mb-16">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 ${darkMode ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-50 text-primary-600'}`}>
              Testimonials
            </span>
            <h2 className={`text-3xl sm:text-4xl font-heading font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Loved by Homestay Owners
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map(({ quote, name, role, rating, initial, gradient }, idx) => (
              <AnimatedSection key={name} delay={idx * 100}>
                <div
                  className={`rounded-2xl border p-8 hover:shadow-lg transition-shadow duration-300 ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-100 bg-gray-50/50'}`}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-lg font-bold shadow-lg`}>
                      {initial}
                    </div>
                    <div>
                      <p className={`font-heading font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{name}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rating ? 'text-amber-400 fill-amber-400' : darkMode ? 'text-gray-600' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>
                  <Quote className={`w-6 h-6 mb-3 ${darkMode ? 'text-primary-600' : 'text-primary-300'}`} />
                  <p className={`leading-relaxed text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>"{quote}"</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
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
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
