/**
 * ScrollToTop — Floating scroll-to-top button + Route scroll restoration.
 */
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const { darkMode } = useTheme();
  const [visible, setVisible] = useState(false);

  // Scroll to top automatically when navigating between pages
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  // Monitor scroll distance for floating button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`fixed bottom-6 right-6 z-40 p-3.5 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer ${
        darkMode
          ? 'bg-dark-800/90 border-gray-700 text-primary-400 hover:bg-dark-800 hover:border-primary-500'
          : 'bg-white/90 border-gray-200 text-primary-600 hover:bg-white hover:border-primary-300'
      }`}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
