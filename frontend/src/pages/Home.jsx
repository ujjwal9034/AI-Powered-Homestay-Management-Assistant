import Hero from '../components/Hero'
import FeatureCard from '../components/FeatureCard'
import { Link } from 'react-router-dom'

const features = [
  {
    icon: '⭐',
    title: 'Review Management',
    description:
      'Centralize and monitor guest reviews from multiple booking platforms. Track sentiment trends, flag urgent feedback, and never miss an opportunity to improve your hospitality.',
    accent: 'primary',
  },
  {
    icon: '🤖',
    title: 'AI Response Suggestions',
    description:
      'Generate thoughtful, personalized reply drafts for every guest review in seconds. Our AI understands context, tone, and your brand voice to craft responses that build trust.',
    accent: 'accent',
  },
  {
    icon: '🗺️',
    title: 'Tourist Assistance',
    description:
      'Equip your guests with AI-powered local guides — from hidden trails and top restaurants to transport tips. Delight visitors before they even ask, boosting 5-star reviews.',
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
  return (
    <>
      <Hero />

      {/* Features section */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-semibold tracking-wider uppercase mb-4">
              Core Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                Run Your Homestay
              </span>
            </h2>
            <p className="mt-4 text-gray-500 text-lg leading-relaxed">
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
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-accent-50 text-accent-600 text-xs font-semibold tracking-wider uppercase mb-4">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900">
              Three Simple Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Connect Your Listings',
                desc: 'Link your Airbnb, Booking.com, and other platform accounts in minutes. We securely sync all your property data and guest reviews.',
              },
              {
                step: '02',
                title: 'Let AI Analyze & Respond',
                desc: 'Our AI engine processes incoming reviews, identifies sentiment patterns, and generates contextual reply suggestions ready for your approval.',
              },
              {
                step: '03',
                title: 'Delight Your Guests',
                desc: 'Publish polished responses instantly and provide guests with AI-curated local guides, boosting satisfaction and earning more 5-star reviews.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative pl-16">
                <span className="absolute left-0 top-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white font-heading font-bold text-lg shadow-lg shadow-primary-500/20">
                  {step}
                </span>
                <h3 className="text-lg font-heading font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-semibold tracking-wider uppercase mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900">
              Loved by Homestay Owners
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map(({ quote, name, role }) => (
              <div
                key={name}
                className="rounded-2xl border border-gray-100 bg-gray-50/50 p-8 hover:shadow-lg transition-shadow duration-300"
              >
                <svg className="w-8 h-8 text-primary-300 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C9.591 11.689 11 13.166 11 15a3 3 0 1 1-6 0c0-.223.018-.44.053-.651l.001-.006Zm11 0C14.553 16.227 14 15 14 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C20.591 11.689 22 13.166 22 15a3 3 0 1 1-6 0c0-.223.018-.44.053-.651l.001-.006Z" />
                </svg>
                <p className="text-gray-600 leading-relaxed text-sm mb-6">"{quote}"</p>
                <div>
                  <p className="font-heading font-semibold text-gray-900 text-sm">{name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{role}</p>
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
                Ready to Transform Your Homestay?
              </h2>
              <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">
                Join hundreds of homestay owners who are already saving time and delighting guests with AI-powered management.
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
