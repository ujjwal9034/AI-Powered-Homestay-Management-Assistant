/**
 * App — Root component with routing.
 *
 * Week 6 — Added ProtectedRoute wrapper for /dashboard and /profile,
 *          /profile route, and /auth/callback for Google OAuth.
 */
import { Routes, Route } from 'react-router-dom'
import { useTheme } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import About from './pages/About'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Profile from './pages/Profile'
import OAuthCallback from './pages/OAuthCallback'

function App() {
  const { darkMode } = useTheme()

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-dark-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
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
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
