export default function FeatureCard({ icon, title, description, accent = 'primary' }) {
  const accentMap = {
    primary: {
      bg: 'bg-primary-50',
      icon: 'bg-gradient-to-br from-primary-500 to-primary-600',
      border: 'group-hover:border-primary-200',
      shadow: 'group-hover:shadow-primary-500/10',
    },
    accent: {
      bg: 'bg-accent-50',
      icon: 'bg-gradient-to-br from-accent-500 to-accent-600',
      border: 'group-hover:border-accent-200',
      shadow: 'group-hover:shadow-accent-500/10',
    },
    teal: {
      bg: 'bg-teal-50',
      icon: 'bg-gradient-to-br from-teal-500 to-teal-600',
      border: 'group-hover:border-teal-200',
      shadow: 'group-hover:shadow-teal-500/10',
    },
  }

  const colors = accentMap[accent] || accentMap.primary

  return (
    <div
      className={`group relative rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${colors.border} ${colors.shadow}`}
    >
      {/* Icon */}
      <div
        className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${colors.icon} text-white text-2xl shadow-lg mb-6`}
      >
        {icon}
      </div>

      <h3 className="text-xl font-heading font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-500 leading-relaxed text-sm">{description}</p>

      {/* Subtle corner glow on hover */}
      <div
        className={`absolute -top-px -right-px w-24 h-24 ${colors.bg} rounded-tr-2xl rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}
      />
    </div>
  )
}
