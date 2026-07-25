/**
 * LoadingScreen — Full-screen branded loading state.
 * Shown while AuthContext verifies the JWT token on initial load.
 */
export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-dark-800 to-dark-900">
      <div className="text-center">
        <div className="inline-flex items-center gap-3 mb-6" style={{ animation: 'pulse 2s ease-in-out infinite' }}>
          <span className="text-5xl">🏡</span>
          <span className="text-3xl font-heading font-bold bg-gradient-to-r from-primary-300 to-accent-400 bg-clip-text text-transparent">
            StayWise
          </span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}
