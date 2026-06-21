/**
 * Button — Reusable button component with variant support.
 *
 * Props:
 * - variant: 'primary' | 'secondary' | 'outline' (default: 'primary')
 * - children: Button content
 * - onClick: Click handler
 * - className: Additional classes
 * - ...rest: Forwarded to <button>
 */
export default function Button({
  variant = 'primary',
  children,
  onClick,
  className = '',
  ...rest
}) {
  // Base styles shared across all variants
  const base =
    'inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'

  // Variant-specific styles with dark mode support
  const variants = {
    primary:
      'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-105 focus:ring-primary-500',
    secondary:
      'bg-primary-50 text-primary-700 hover:bg-primary-100 focus:ring-primary-400 dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-900/50',
    outline:
      'border-2 border-gray-200 text-gray-700 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50/50 focus:ring-primary-400 dark:border-gray-600 dark:text-gray-300 dark:hover:border-primary-500 dark:hover:text-primary-400 dark:hover:bg-primary-900/20',
  }

  return (
    <button
      onClick={onClick}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
