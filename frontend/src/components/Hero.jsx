import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-15%] right-[-8%] w-[30rem] h-[30rem] bg-accent-500/15 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-primary-400/5 rounded-full blur-3xl" />

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
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-2xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Go to Dashboard
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
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
              { value: '500+', label: 'Homestays' },
              { value: '10K+', label: 'Reviews Managed' },
              { value: '98%', label: 'Satisfaction' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl sm:text-3xl font-heading font-bold text-white">{value}</div>
                <div className="mt-1 text-xs sm:text-sm text-gray-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-gray-50 to-transparent" />
    </section>
  )
}
