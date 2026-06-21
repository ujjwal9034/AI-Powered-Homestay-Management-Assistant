/**
 * ThemeContext — Provides dark/light mode state across the application.
 *
 * Features:
 * - Persists user preference in localStorage
 * - Toggles 'dark' class on the <html> element for Tailwind dark mode
 * - Smooth CSS transitions handled via index.css
 */
import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

/**
 * Custom hook for consuming the theme context.
 * @returns {{ darkMode: boolean, toggleDarkMode: () => void }}
 */
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}

/**
 * ThemeProvider wraps the app and exposes darkMode state + toggle function.
 * On mount, reads from localStorage; on change, syncs to localStorage + <html> class.
 */
export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('staywise-theme')
    return saved === 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
      localStorage.setItem('staywise-theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('staywise-theme', 'light')
    }
  }, [darkMode])

  const toggleDarkMode = () => setDarkMode((prev) => !prev)

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}
