/**
 * Loader — Animated loading spinner component.
 *
 * Props:
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 * - className: Additional classes
 */
export default function Loader({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  }

  return (
    <div className={`flex items-center justify-center ${className}`} role="status" aria-label="Loading">
      <div
        className={`${sizes[size] || sizes.md} rounded-full border-gray-200 border-t-primary-500 animate-spin dark:border-gray-700 dark:border-t-primary-400`}
      />
      <span className="sr-only">Loading...</span>
    </div>
  )
}
