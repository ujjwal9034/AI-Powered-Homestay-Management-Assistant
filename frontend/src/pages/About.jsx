/**
 * About — Company information page with story, values, team, and CTA.
 * All sections support dark mode through conditional styling.
 */
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const values = [
  {
    icon: '🎯',
    title: 'Mission-Driven',
    description:
      'We exist to empower small homestay owners with enterprise-grade AI tools — leveling the playing field against big hotel chains.',
  },
  {
    icon: '🤝',
    title: 'Community First',
    description:
      'We build alongside our community of hosts, incorporating real feedback from homestay owners across India and beyond.',
  },
  {
    icon: '🔒',
    title: 'Privacy & Trust',
    description:
      'Guest data security is non-negotiable. All review data is encrypted end-to-end and never shared with third parties.',
  },
  {
    icon: '🌱',
    title: 'Sustainable Tourism',
    description:
      'We promote eco-conscious travel by helping homestays highlight sustainable practices and local cultural experiences.',
  },
]

const team = [
  { name: 'Ujjwal Pratap Singh', role: 'Founder & Full-Stack Developer', emoji: '👨‍💻' },
  { name: 'AI Assistant', role: 'AI Engineering & NLP', emoji: '🤖' },
  { name: 'Community', role: 'Beta Testers & Feedback', emoji: '🏘️' },
]

export default function About() {
  const { darkMode } = useTheme()

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-900 via-dark-800 to-dark-900 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-primary-300 text-xs font-semibold tracking-wider uppercase mb-6">
            About StayWise
          </span>
          <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-white leading-tight max-w-3xl mx-auto">
            Bringing{' '}
            <span className="bg-gradient-to-r from-primary-300 to-accent-400 bg-clip-text text-transparent">
              Intelligence
            </span>{' '}
            to Homestay Hospitality
          </h1>
          <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            StayWise was born from a simple idea — what if every homestay owner had access to the same AI-powered tools that luxury hotel chains use? We are building that future.
          </p>
        </div>
        <div className={`absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t ${darkMode ? 'from-dark-900' : 'from-gray-50'} to-transparent`} />
      </section>

      {/* Story */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 ${darkMode ? 'bg-accent-900/30 text-accent-400' : 'bg-accent-50 text-accent-600'}`}>
                Our Story
              </span>
              <h2 className={`text-3xl font-heading font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                From Frustration to Innovation
              </h2>
              <div className={`space-y-4 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <p>
                  Managing a homestay in the hills of Himachal Pradesh taught us firsthand how overwhelming guest communication can be. Responding to reviews across multiple platforms, answering repetitive tourist queries, and keeping up with guest expectations was exhausting.
                </p>
                <p>
                  We realized that AI could handle the repetitive work while preserving the personal touch that makes homestays special. StayWise was built to automate the mundane so owners can focus on what they do best — creating unforgettable experiences for their guests.
                </p>
                <p>
                  Today, StayWise serves hundreds of homestay owners, processing thousands of reviews and tourist interactions every month — with the warmth of a human host and the efficiency of AI.
                </p>
              </div>
            </div>

            {/* Visual card */}
            <div className="relative">
              <div className={`rounded-3xl p-10 border ${darkMode ? 'bg-gradient-to-br from-dark-800 to-dark-800 border-gray-700' : 'bg-gradient-to-br from-primary-50 to-accent-50 border-primary-100/50'}`}>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { val: '500+', label: 'Active Homestays' },
                    { val: '10K+', label: 'Reviews Managed' },
                    { val: '50K+', label: 'Tourist Queries Answered' },
                    { val: '98%', label: 'Owner Satisfaction' },
                  ].map(({ val, label }) => (
                    <div key={label} className={`text-center p-4 rounded-2xl shadow-sm ${darkMode ? 'bg-dark-900' : 'bg-white'}`}>
                      <div className="text-2xl font-heading font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                        {val}
                      </div>
                      <div className={`text-xs mt-1 font-medium ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent-400/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-primary-400/20 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className={`py-20 ${darkMode ? 'bg-gradient-to-b from-dark-800/50 to-dark-900' : 'bg-gradient-to-b from-gray-50 to-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 ${darkMode ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-50 text-primary-600'}`}>
              Our Values
            </span>
            <h2 className={`text-3xl sm:text-4xl font-heading font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              What Drives Us
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map(({ icon, title, description }) => (
              <div
                key={title}
                className={`group rounded-2xl border p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'}`}
              >
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className={`font-heading font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
                <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 ${darkMode ? 'bg-accent-900/30 text-accent-400' : 'bg-accent-50 text-accent-600'}`}>
              The Team
            </span>
            <h2 className={`text-3xl sm:text-4xl font-heading font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Meet the Builders
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {team.map(({ name, role, emoji }) => (
              <div
                key={name}
                className={`text-center p-6 rounded-2xl border hover:shadow-md transition-shadow duration-300 ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-100 bg-white'}`}
              >
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-4 ${darkMode ? 'bg-gradient-to-br from-primary-900/50 to-accent-900/50' : 'bg-gradient-to-br from-primary-100 to-accent-100'}`}>
                  {emoji}
                </div>
                <h3 className={`font-heading font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{name}</h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-2xl sm:text-3xl font-heading font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Ready to Join Our Community?
          </h2>
          <p className={`mb-8 max-w-xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Start managing your homestay smarter today. It takes less than 2 minutes to get set up.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </>
  )
}
