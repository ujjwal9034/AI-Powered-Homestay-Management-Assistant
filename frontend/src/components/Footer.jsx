/**
 * Footer — Site-wide footer with brand info, working navigation links, and social icons.
 * All links point to valid routes. Supports dark mode.
 */
import { Link } from 'react-router-dom'
import { Heart, Globe, Mail } from 'lucide-react'

const footerLinks = [
  {
    heading: 'Product',
    links: [
      { label: 'Explore Homestays', to: '/explore' },
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'AI Trip Planner', to: '/explore' },
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
      { label: 'Help Center', to: '/about' },
      { label: 'API Health', href: '/api/health' },
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
                {links.map(({ label, to, href }) => (
                  <li key={label}>
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:text-primary-400 transition-colors duration-200"
                      >
                        {label}
                      </a>
                    ) : (
                      <Link
                        to={to}
                        className="text-sm hover:text-primary-400 transition-colors duration-200"
                      >
                        {label}
                      </Link>
                    )}
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
            {/* Social icons */}
            {[
              { label: 'Website', icon: Globe, href: '#' },
              { label: 'Support', icon: Mail, href: 'mailto:support@staywise.com' },
            ].map(({ label, icon: Icon, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary-500/20 hover:text-primary-400 transition-all duration-200"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
