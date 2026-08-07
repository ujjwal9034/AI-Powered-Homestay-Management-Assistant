import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function AnalyticsChart({ type = 'revenue', data = [], height = 220 }) {
  const { darkMode } = useTheme();
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Handle empty or missing data gracefully
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-gray-400">
        No analytics data available.
      </div>
    );
  }

  const svgWidth = 500;
  const svgHeight = height;
  const paddingX = 45;
  const paddingY = 30;

  // 1. AREA/LINE CHART FOR REVENUE
  if (type === 'revenue') {
    const maxVal = Math.max(...data.map((d) => d.value || 0), 1000);
    const minVal = 0;
    const valueRange = maxVal - minVal;

    // Calculate coordinates
    const points = data.map((d, i) => {
      const x = data.length > 1 
        ? paddingX + (i * (svgWidth - 2 * paddingX)) / (data.length - 1)
        : svgWidth / 2;
      const val = d.value || 0;
      const y = svgHeight - paddingY - ((val - minVal) * (svgHeight - 2 * paddingY)) / valueRange;
      return { x, y, label: d.label, val };
    });

    // Construct path string for the smooth bezier line
    let linePath = '';
    if (points.length > 1) {
      linePath = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const cp1x = p1.x + (p2.x - p1.x) / 3;
        const cp1y = p1.y;
        const cp2x = p2.x - (p2.x - p1.x) / 3;
        const cp2y = p2.y;
        linePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
      }
    } else if (points.length === 1) {
      linePath = `M ${points[0].x - 20} ${points[0].y} L ${points[0].x + 20} ${points[0].y}`;
    }

    // Construct path string for the filled gradient area
    const areaPath = points.length > 1 
      ? `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`
      : '';

    return (
      <div className="relative w-full h-full font-sans">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#6366f1" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingY + ratio * (svgHeight - 2 * paddingY);
            const val = maxVal - ratio * valueRange;
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke={darkMode ? '#374151' : '#e5e7eb'}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 10}
                  y={y + 4}
                  textAnchor="end"
                  className={`text-[9px] font-bold ${darkMode ? 'fill-gray-500' : 'fill-gray-400'}`}
                >
                  ₹{Math.round(val).toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Guide Line on Hover */}
          {hoveredIdx !== null && points[hoveredIdx] && (
            <line
              x1={points[hoveredIdx].x}
              y1={paddingY}
              x2={points[hoveredIdx].x}
              y2={svgHeight - paddingY}
              stroke={darkMode ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 0.2)'}
              strokeWidth="1.5"
              strokeDasharray="4 2"
              className="pointer-events-none"
            />
          )}

          {/* Area Path */}
          {areaPath && (
            <path d={areaPath} fill="url(#revenueGrad)" />
          )}

          {/* Line Path */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#6366f1"
              strokeWidth="3"
              filter="url(#glow)"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Nodes */}
          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r={hoveredIdx === idx ? 6.5 : 4}
              fill={darkMode ? '#1f2937' : '#ffffff'}
              stroke="#6366f1"
              strokeWidth={hoveredIdx === idx ? 3.5 : 2}
              className="transition-all duration-200 pointer-events-none"
            />
          ))}

          {/* Invisible interactive hover rects */}
          {points.map((p, idx) => {
            const step = points.length > 1 ? (svgWidth - 2 * paddingX) / (points.length - 1) : svgWidth - 2 * paddingX;
            const startX = points.length > 1 ? p.x - step / 2 : paddingX;
            const width = points.length > 1 ? step : svgWidth - 2 * paddingX;
            return (
              <rect
                key={`hover-detect-${idx}`}
                x={startX}
                y={paddingY}
                width={width}
                height={svgHeight - 2 * paddingY}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}

          {/* X axis labels */}
          {points.map((p, idx) => (
            <text
              key={idx}
              x={p.x}
              y={svgHeight - 10}
              textAnchor="middle"
              className={`text-[9px] font-semibold ${darkMode ? 'fill-gray-400' : 'fill-gray-500'}`}
            >
              {p.label}
            </text>
          ))}
        </svg>

        {/* Floating Tooltip Card */}
        {hoveredIdx !== null && points[hoveredIdx] && (
          <div
            className={`absolute z-30 pointer-events-none rounded-xl border p-2.5 shadow-xl backdrop-blur-md transition-all duration-150 ease-out text-left flex flex-col gap-0.5 ${
              darkMode
                ? 'bg-dark-900/90 border-gray-700 text-white shadow-black/40'
                : 'bg-white/90 border-gray-200 text-gray-900 shadow-gray-200/50'
            }`}
            style={{
              left: `${(points[hoveredIdx].x / svgWidth) * 100}%`,
              top: `${(points[hoveredIdx].y / svgHeight) * 100 - 12}%`,
              transform: 'translate(-50%, -100%)',
              minWidth: '100px',
            }}
          >
            <span className={`text-[9px] uppercase font-bold tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {points[hoveredIdx].label}
            </span>
            <span className="text-xs font-black text-indigo-500 dark:text-indigo-400">
              ₹{points[hoveredIdx].val?.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    );
  }

  // 2. BAR CHART FOR OCCUPANCY
  if (type === 'occupancy') {
    const maxVal = 100; // occupancy percent is 0-100
    const chartHeight = svgHeight - 2 * paddingY;
    const barWidth = 24;
    const groupWidth = (svgWidth - 2 * paddingX) / data.length;

    const points = data.map((d, i) => {
      const x = paddingX + i * groupWidth + (groupWidth - barWidth) / 2;
      const val = Math.min(Math.max(d.value || 0, 0), 100);
      const h = (val * chartHeight) / maxVal;
      const y = svgHeight - paddingY - h;
      return { x, y, h, label: d.label, val };
    });

    return (
      <div className="w-full h-full font-sans">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((val, idx) => {
            const y = svgHeight - paddingY - (val * chartHeight) / 100;
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke={darkMode ? '#374151' : '#e5e7eb'}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 10}
                  y={y + 3}
                  textAnchor="end"
                  className={`text-[9px] font-bold ${darkMode ? 'fill-gray-500' : 'fill-gray-400'}`}
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {points.map((p, idx) => (
            <g key={idx} className="group cursor-pointer">
              {/* Rounded background track */}
              <rect
                x={p.x}
                y={paddingY}
                width={barWidth}
                height={chartHeight}
                rx="4"
                fill={darkMode ? '#374151/20' : '#f3f4f6'}
                className="opacity-20"
              />
              {/* Active bar */}
              <rect
                x={p.x}
                y={p.y}
                width={barWidth}
                height={p.h}
                rx="4"
                fill="url(#barGrad)"
                className="transition-all duration-300 hover:fill-amber-500"
              />
              
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>

              {/* Tooltip value */}
              <rect
                x={p.x + barWidth/2 - 25}
                y={p.y - 24}
                width="50"
                height="16"
                rx="4"
                fill="#1f2937"
                className="opacity-0 group-hover:opacity-90 transition-opacity duration-150 pointer-events-none"
              />
              <text
                x={p.x + barWidth/2}
                y={p.y - 13}
                textAnchor="middle"
                fill="#ffffff"
                className="text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
              >
                {p.val}%
              </text>
            </g>
          ))}

          {/* X axis labels */}
          {points.map((p, idx) => (
            <text
              key={idx}
              x={p.x + barWidth / 2}
              y={svgHeight - 10}
              textAnchor="middle"
              className={`text-[9px] font-semibold ${darkMode ? 'fill-gray-400' : 'fill-gray-500'}`}
            >
              {p.label}
            </text>
          ))}
        </svg>
      </div>
    );
  }

  // 3. SENTIMENT / RATINGS RATIO BREAKDOWN (HORIZONTAL BARS)
  if (type === 'sentiment') {
    const totalCount = data.reduce((sum, d) => sum + (d.value || 0), 0) || 1;

    return (
      <div className="space-y-4 w-full px-2 py-1 font-sans">
        {data.map((d, idx) => {
          const pct = Math.round(((d.value || 0) / totalCount) * 100);
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{d.label}</span>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                  {d.value} ({pct}%)
                </span>
              </div>
              <div className={`h-3 rounded-full overflow-hidden w-full ${darkMode ? 'bg-dark-900' : 'bg-gray-100'}`}>
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    d.label.toLowerCase().includes('positive') || d.label.includes('5') || d.label.includes('4')
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      : d.label.toLowerCase().includes('neutral') || d.label.includes('3')
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                      : 'bg-gradient-to-r from-red-500 to-rose-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}
