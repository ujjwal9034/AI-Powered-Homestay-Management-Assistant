import { useTheme } from '../../context/ThemeContext';

export default function AnalyticsChart({ type = 'revenue', data = [], height = 220 }) {
  const { darkMode } = useTheme();

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
      const x = paddingX + (i * (svgWidth - 2 * paddingX)) / (data.length - 1);
      const val = d.value || 0;
      const y = svgHeight - paddingY - ((val - minVal) * (svgHeight - 2 * paddingY)) / valueRange;
      return { x, y, label: d.label, val };
    });

    // Construct path string for the line
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    // Construct path string for the filled gradient area
    const areaPath = points.length > 0 
      ? `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`
      : '';

    return (
      <div className="w-full h-full font-sans">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
            </linearGradient>
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

          {/* Area Path */}
          {areaPath && (
            <path d={areaPath} fill="url(#revenueGrad)" />
          )}

          {/* Line Path */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#4f46e5"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Nodes */}
          {points.map((p, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill={darkMode ? '#1f2937' : '#ffffff'}
                stroke="#4f46e5"
                strokeWidth="2"
                className="transition-all duration-150 hover:r-6"
              />
              {/* Tooltip on hover */}
              <rect
                x={p.x - 40}
                y={p.y - 30}
                width="80"
                height="18"
                rx="4"
                fill="#1f2937"
                className="opacity-0 group-hover:opacity-90 transition-opacity duration-150 pointer-events-none"
              />
              <text
                x={p.x}
                y={p.y - 18}
                textAnchor="middle"
                fill="#ffffff"
                className="text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
              >
                ₹{p.val?.toLocaleString()}
              </text>
            </g>
          ))}

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
