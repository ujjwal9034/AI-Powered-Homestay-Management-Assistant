/**
 * Toast — Notification component with success/error variants and auto-dismiss.
 *
 * Props:
 * - message: Text to display
 * - variant: 'success' | 'error' (default: 'success')
 * - isVisible: Boolean to control visibility
 * - onClose: Callback when toast should hide
 * - duration: Auto-hide delay in ms (default: 3000)
 */
import { useEffect } from 'react'

export default function Toast({
  message,
  variant = 'success',
  isVisible,
  onClose,
  duration = 3000,
}) {
  // Auto-hide after specified duration
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const styles = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/30',
      border: 'border-green-200 dark:border-green-700',
      text: 'text-green-800 dark:text-green-300',
      icon: (
        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/30',
      border: 'border-red-200 dark:border-red-700',
      text: 'text-red-800 dark:text-red-300',
      icon: (
        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  }

  const s = styles[variant] || styles.success

  return (
    <div className="fixed top-6 right-6 z-[110] animate-[slideDown_300ms_ease-out]">
      <div
        className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-lg ${s.bg} ${s.border}`}
      >
        {s.icon}
        <span className={`text-sm font-medium ${s.text}`}>{message}</span>
        <button
          onClick={onClose}
          className={`ml-2 p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer ${s.text}`}
          aria-label="Dismiss notification"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
