/**
 * App — Root component with routing and ErrorBoundary.
 *
 * Routes: Home, About, Explore, Login, Dashboard, Profile,
 *         HomestayDetail, OAuthCallback, and 404 catch-all.
 */
import { Routes, Route } from 'react-router-dom'
import { useTheme } from './context/ThemeContext'
import { useAuth } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingScreen from './components/LoadingScreen'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import About from './pages/About'
import Explore from './pages/Explore'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Inbox from './pages/Inbox'
import Profile from './pages/Profile'
import OAuthCallback from './pages/OAuthCallback'
import HomestayDetail from './pages/HomestayDetail'
import Checkout from './pages/Checkout'
import PaymentSuccess from './pages/PaymentSuccess'
import ScrollToTop from './components/ScrollToTop'
import NotFound from './pages/NotFound'
import GlobalConcierge from './components/GlobalConcierge'

function App() {
  const { darkMode } = useTheme()
  const { loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <ErrorBoundary>
      <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-dark-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
        <ScrollToTop />
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/homestays/:id" element={<HomestayDetail />} />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment-success"
              element={
                <ProtectedRoute>
                  <PaymentSuccess />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inbox"
              element={
                <ProtectedRoute>
                  <Inbox />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            {/* 404 catch-all — must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <GlobalConcierge />
      </div>
    </ErrorBoundary>
  )
}

export default App
