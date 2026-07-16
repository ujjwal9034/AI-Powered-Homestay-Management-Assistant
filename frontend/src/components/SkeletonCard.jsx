/**
 * SkeletonCard — Shimmer loading placeholders for homestay cards and reviews.
 * Reduces perceived load time by showing a layout-matching placeholder.
 */
import { useTheme } from '../context/ThemeContext'

const shimmer = 'animate-pulse'

export function HomestayCardSkeleton() {
  const { darkMode } = useTheme()

  return (
    <div className={`rounded-3xl border overflow-hidden ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'}`}>
      <div className={`aspect-[16/10] ${shimmer} ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
      <div className="p-6 space-y-3">
        <div className={`h-5 rounded-lg w-3/4 ${shimmer} ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
        <div className={`h-3.5 rounded-lg w-1/2 ${shimmer} ${darkMode ? 'bg-gray-700/60' : 'bg-gray-100'}`} />
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`w-3.5 h-3.5 rounded-sm ${shimmer} ${darkMode ? 'bg-gray-700/60' : 'bg-gray-100'}`} />
            ))}
          </div>
          <div className={`h-4 rounded-lg w-20 ${shimmer} ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
        </div>
      </div>
    </div>
  )
}

export function ReviewSkeleton() {
  const { darkMode } = useTheme()

  return (
    <div className={`rounded-2xl border p-6 ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full ${shimmer} ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
        <div className="space-y-2 flex-1">
          <div className={`h-4 rounded-lg w-28 ${shimmer} ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className={`h-3 rounded-lg w-20 ${shimmer} ${darkMode ? 'bg-gray-700/60' : 'bg-gray-100'}`} />
        </div>
      </div>
      <div className="space-y-2">
        <div className={`h-3 rounded-lg w-full ${shimmer} ${darkMode ? 'bg-gray-700/60' : 'bg-gray-100'}`} />
        <div className={`h-3 rounded-lg w-5/6 ${shimmer} ${darkMode ? 'bg-gray-700/60' : 'bg-gray-100'}`} />
        <div className={`h-3 rounded-lg w-2/3 ${shimmer} ${darkMode ? 'bg-gray-700/60' : 'bg-gray-100'}`} />
      </div>
    </div>
  )
}

export function StatSkeleton() {
  const { darkMode } = useTheme()

  return (
    <div className={`rounded-2xl border p-6 ${darkMode ? 'border-gray-700 bg-dark-800' : 'border-gray-200 bg-white'}`}>
      <div className={`h-4 rounded-lg w-20 mb-3 ${shimmer} ${darkMode ? 'bg-gray-700/60' : 'bg-gray-100'}`} />
      <div className={`h-8 rounded-lg w-16 ${shimmer} ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
    </div>
  )
}
