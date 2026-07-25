/**
 * Footer — Site-wide footer with brand info, working navigation links, and social icons.
 * All links point to valid routes. Supports dark mode.
 */
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'

const footerLinks = [
  {
    heading: 'Product',
    links: [
      { label: 'Explore Homestays', to: '/explore' },
      { label: 'Dashboard', to: '/dashboard' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'How It Works', to: '/#how-it-works' },
      { label: 'Sign In', to: '/login' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'List Your Property', to: '/login' },
      { label: 'About', to: '/about' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-dark-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🏡</span>
              <span className="text-xl font-heading font-bold text-white">StayWise</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              The AI-powered assistant that helps homestay owners manage reviews, assist tourists, and grow their hospitality business.
            </p>
          </div>

          {/* Link columns */}
          {footerLinks.map(({ heading, links }) => (
            <div key={heading}>
              <h4 className="text-white font-heading font-semibold text-sm tracking-wider uppercase mb-4">
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm hover:text-primary-400 transition-colors duration-200"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            © {new Date().getFullYear()} StayWise. Made with{' '}
            <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" />{' '}
            by Ujjwal Pratap Singh.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/ujjwal9034/AI-Powered-Homestay-Management-Assistant"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary-500/20 hover:text-primary-400 transition-all duration-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

