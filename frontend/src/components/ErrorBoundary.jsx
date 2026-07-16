/**
 * ErrorBoundary — Catches React rendering errors and displays a friendly fallback.
 * Prevents the entire app from white-screening when a component crashes.
 */
import { Component } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900 px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/20">
              <AlertTriangle className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 font-heading">
              Something Went Wrong
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
              We encountered an unexpected error. Please try refreshing the page or go back to the homepage.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg shadow-primary-500/25 hover:scale-105 active:scale-95 transition-all duration-200 text-sm cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Page
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 text-sm"
              >
                <Home className="w-4 h-4" />
                Go Home
              </a>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                  Error Details (Dev Only)
                </summary>
                <pre className="mt-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl overflow-auto max-h-40">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
