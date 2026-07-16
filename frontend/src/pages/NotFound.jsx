/**
 * NotFound — 404 page shown for invalid URLs.
 * Features a prominent illustration, helpful links, and dark mode support.
 */
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Home, ArrowLeft, Search, Compass } from 'lucide-react'

export default function NotFound() {
  const { darkMode } = useTheme()

  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 px-4">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10">
        <div className={`absolute top-0 right-0 w-[40rem] h-[40rem] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 ${darkMode ? 'bg-primary-900/20' : 'bg-primary-100/40'}`} />
        <div className={`absolute bottom-0 left-0 w-[30rem] h-[30rem] rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 ${darkMode ? 'bg-accent-900/15' : 'bg-accent-100/30'}`} />
      </div>

      <div className="text-center max-w-lg">
        {/* Large 404 */}
        <div className="relative mb-8">
          <h1 className="text-[10rem] sm:text-[12rem] font-heading font-black leading-none bg-gradient-to-br from-primary-500 via-primary-400 to-accent-500 bg-clip-text text-transparent select-none opacity-20">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-2xl shadow-primary-500/30`}>
              <Compass className="w-12 h-12 text-white" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <h2 className={`text-2xl sm:text-3xl font-heading font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Page Not Found
        </h2>
        <p className={`text-sm leading-relaxed max-w-sm mx-auto mb-10 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-105 active:scale-95 transition-all duration-200 text-sm"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            to="/explore"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl border font-semibold transition-all duration-200 text-sm ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            <Search className="w-4 h-4" />
            Explore Homestays
          </Link>
        </div>
      </div>
    </section>
  )
}
