import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function DateRangePicker({ 
  startDate, 
  endDate, 
  onChange, 
  minDate = new Date(),
  placeholderStart = 'Check-in',
  placeholderEnd = 'Check-out'
}) {
  const { darkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Date parsing helpers
  const parseDate = (dateStr) => (dateStr ? new Date(dateStr) : null);
  const formatDate = (date) => {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const start = parseDate(startDate);
  const end = parseDate(endDate);

  const handleDayClick = (day) => {
    const dayStr = formatDate(day);
    
    if (!startDate || (startDate && endDate)) {
      // First click: set start date, clear end date
      onChange({ checkIn: dayStr, checkOut: '' });
    } else {
      // Second click: set end date if it is after start date
      const sDate = new Date(startDate);
      if (day > sDate) {
        onChange({ checkIn: startDate, checkOut: dayStr });
        setIsOpen(false); // Close dropdown on range selection
      } else {
        // If clicked day is before start, make it the new start date
        onChange({ checkIn: dayStr, checkOut: '' });
      }
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Pad initial empty cells
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Fill active days
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const changeMonth = (offset) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const isSameDay = (d1, d2) => 
    d1 && d2 && d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

  const isBefore = (d1, d2) => {
    if (!d1 || !d2) return false;
    const date1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const date2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
    return date1 < date2;
  };

  const isBetween = (d, dStart, dEnd) => {
    if (!d || !dStart || !dEnd) return false;
    return isBefore(dStart, d) && isBefore(d, dEnd);
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="relative w-full">
      {/* Visual Inputs Row */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-medium cursor-pointer shadow-sm select-none transition-all ${
          darkMode 
            ? 'bg-dark-900 border-gray-650 text-gray-200 hover:border-gray-500' 
            : 'bg-gray-50/50 border-gray-200 text-gray-800 hover:border-gray-300'
        }`}
      >
        <div className="flex items-center gap-2 flex-1">
          <CalendarIcon className="w-4 h-4 text-primary-500 shrink-0" />
          <div className="grid grid-cols-2 gap-2 w-full">
            <span className={startDate ? 'text-gray-900 dark:text-gray-100 font-semibold' : 'text-gray-400'}>
              {startDate ? new Date(startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : placeholderStart}
            </span>
            <span className={endDate ? 'text-gray-900 dark:text-gray-100 font-semibold' : 'text-gray-400'}>
              {endDate ? new Date(endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : placeholderEnd}
            </span>
          </div>
        </div>
        {(startDate || endDate) && (
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange({ checkIn: '', checkOut: '' });
            }}
            className="p-1 rounded-full text-gray-450 hover:text-gray-600 dark:hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown Calendar Card */}
      {isOpen && (
        <>
          {/* Click-away backdrop */}
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          
          <div 
            className={`absolute left-0 right-0 mt-2 p-4 rounded-2xl border shadow-2xl z-40 animate-slideDown select-none ${
              darkMode ? 'bg-dark-900 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            {/* Header controls */}
            <div className="flex items-center justify-between mb-4">
              <button 
                type="button" 
                onClick={() => changeMonth(-1)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  darkMode ? 'border-gray-700 hover:bg-white/5 text-gray-300' : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </span>

              <button 
                type="button" 
                onClick={() => changeMonth(1)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  darkMode ? 'border-gray-700 hover:bg-white/5 text-gray-300' : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekday Names */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 mb-2">
              {weekDays.map(d => <div key={d}>{d}</div>)}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {days.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className="aspect-square" />;

                const isPast = isBefore(day, minDate);
                const isSelectedStart = isSameDay(day, start);
                const isSelectedEnd = isSameDay(day, end);
                const isInRange = isBetween(day, start, end);
                const isHoveredRange = startDate && !endDate && day > parseDate(startDate); 

                let dayClasses = `aspect-square flex items-center justify-center text-xs font-medium rounded-lg transition-all cursor-pointer relative `;

                if (isPast) {
                  dayClasses += `${darkMode ? 'text-gray-700 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'}`;
                } else if (isSelectedStart) {
                  dayClasses += 'bg-primary-500 text-white font-bold shadow-md shadow-primary-500/20';
                } else if (isSelectedEnd) {
                  dayClasses += 'bg-primary-500 text-white font-bold shadow-md shadow-primary-500/20';
                } else if (isInRange) {
                  dayClasses += `${darkMode ? 'bg-primary-500/20 text-primary-300' : 'bg-primary-50 text-primary-600 font-semibold'}`;
                } else if (isHoveredRange) {
                  dayClasses += `${darkMode ? 'hover:bg-primary-500/10 text-gray-300' : 'hover:bg-primary-50 text-gray-600'}`;
                } else {
                  dayClasses += `${darkMode ? 'text-gray-300 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-50'}`;
                }

                return (
                  <button
                    key={day.getTime()}
                    type="button"
                    disabled={isPast}
                    onClick={() => handleDayClick(day)}
                    className={dayClasses}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
