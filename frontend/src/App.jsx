/**
 * App — Root component with routing and ErrorBoundary.
 *
 * Routes: Home, About, Explore, Login, Dashboard, Profile,
 *         HomestayDetail, OAuthCallback, and 404 catch-all.
 */
import { Routes, Route } from 'react-router-dom'
import { useTheme } from './context/ThemeContext'
import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import About from './pages/About'
import Explore from './pages/Explore'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Profile from './pages/Profile'
import OAuthCallback from './pages/OAuthCallback'
import HomestayDetail from './pages/HomestayDetail'
import NotFound from './pages/NotFound'

function App() {
  const { darkMode } = useTheme()

  return (
    <ErrorBoundary>
      <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-dark-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/homestays/:id" element={<HomestayDetail />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
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
      </div>
    </ErrorBoundary>
  )
}

export default App
