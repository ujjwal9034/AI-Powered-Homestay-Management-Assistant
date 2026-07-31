/**
 * EmptyState — Reusable component for displaying clean, friendly empty states with SVG iconography.
 */
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { MessageSquare, Calendar, Building2, Search, Sparkles } from 'lucide-react';

const icons = {
  reviews: MessageSquare,
  bookings: Calendar,
  homestays: Building2,
  search: Search,
  default: Sparkles,
};

export default function EmptyState({
  type = 'default',
  title = 'No Data Found',
  description = 'There are no items to display at the moment.',
  actionLabel,
  actionTo,
  onAction,
}) {
  const { darkMode } = useTheme();
  const IconComponent = icons[type] || icons.default;

  return (
    <div
      className={`rounded-3xl border border-dashed p-12 sm:p-16 text-center max-w-lg mx-auto ${
        darkMode ? 'border-gray-700 bg-dark-850/50' : 'border-gray-200 bg-white/50'
      }`}
    >
      <div
        className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5 shadow-lg ${
          darkMode
            ? 'bg-gradient-to-br from-primary-900/50 to-accent-900/50 text-primary-400 border border-gray-700'
            : 'bg-gradient-to-br from-primary-50 to-accent-50 text-primary-600 border border-primary-100'
        }`}
      >
        <IconComponent className="w-8 h-8" />
      </div>

      <h3 className={`font-heading font-bold text-xl mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>

      <p className={`text-sm leading-relaxed mb-6 max-w-md mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {description}
      </p>

      {actionLabel && (
        actionTo ? (
          <Link
            to={actionTo}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-sm shadow-md hover:shadow-primary-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-sm shadow-md hover:shadow-primary-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
}
