/**
 * Hero — Landing page hero section with gradient background, stats, and CTAs.
 * Enhanced with Lucide icons and scroll-to-explore indicator.
 */
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { ArrowRight, ChevronDown, Building2, Star, ThumbsUp } from 'lucide-react'

export default function Hero() {
  const { darkMode } = useTheme()

  return (
    <section className="relative overflow-hidden bg-dark-950 min-h-[80vh] flex items-center justify-center">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0 select-none">
        <img
          src="https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=1600&q=80"
          alt="Cozy homestay cabin in mountains"
          className="w-full h-full object-cover opacity-35 scale-100 transition-transform duration-10000 ease-out hover:scale-105"
          style={{ animation: 'pulse 20s infinite alternate' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark-950/60 via-dark-900/80 to-dark-900" />
      </div>

      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-15%] right-[-8%] w-[30rem] h-[30rem] bg-accent-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-primary-300 text-xs font-medium tracking-wide uppercase mb-8">
            <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
            AI-Powered Hospitality
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white leading-tight tracking-tight">
            Manage Your Homestay{' '}
            <span className="bg-gradient-to-r from-primary-300 via-primary-400 to-accent-400 bg-clip-text text-transparent">
              Smarter
            </span>{' '}
            with AI
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Automate guest review responses, get intelligent tourist assistance, and
            elevate your homestay experience — all from one beautiful dashboard.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/explore"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-2xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Explore Homestays
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/about"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-white/20 text-white font-semibold hover:bg-white/10 backdrop-blur-sm transition-all duration-200"
            >
              Learn More
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: '500+', label: 'Homestays', icon: Building2 },
              { value: '10K+', label: 'Reviews Managed', icon: Star },
              { value: '98%', label: 'Satisfaction', icon: ThumbsUp },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <Icon className="w-5 h-5 mx-auto mb-2 text-primary-400" strokeWidth={1.5} />
                <div className="text-2xl sm:text-3xl font-heading font-bold text-white">{value}</div>
                <div className="mt-1 text-xs sm:text-sm text-gray-400">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-500 animate-bounce">
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>

      {/* Bottom gradient fade — adapts to theme */}
      <div className={`absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t ${darkMode ? 'from-dark-900' : 'from-gray-50'} to-transparent`} />
    </section>
  )
}
