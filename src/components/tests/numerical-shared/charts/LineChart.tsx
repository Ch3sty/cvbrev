'use client';

import { motion } from 'framer-motion';

export interface LinePoint {
  x: string | number;
  y: number;
}

interface LineChartProps {
  title?: string;
  data: LinePoint[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  unit?: string;
}

/**
 * Custom SVG-linjediagram i orange/röd-DNA.
 *
 * Renderar en linje med punkter, område under linjen med gradient
 * orange→transparent, X/Y axis labels.
 */
export default function LineChart({
  title,
  data,
  xAxisLabel,
  yAxisLabel,
  unit = '',
}: LineChartProps) {
  const padding = { top: 32, right: 32, bottom: 56, left: 56 };
  const width = 600;
  const height = 360;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...data.map((d) => d.y));
  const minValue = Math.min(...data.map((d) => d.y));
  const niceMax = niceCeiling(maxValue);
  const niceMin = Math.max(0, Math.floor(minValue * 0.9));

  const gridSteps = 5;
  const stepValue = (niceMax - niceMin) / gridSteps;

  const xStep = chartWidth / (data.length - 1);

  // Beräkna linje-points
  const points = data.map((d, i) => {
    const x = padding.left + i * xStep;
    const y =
      padding.top + chartHeight - ((d.y - niceMin) / (niceMax - niceMin)) * chartHeight;
    return { x, y, value: d.y, label: String(d.x) };
  });

  // Path för linjen
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Path för fyllnadsområdet under linjen
  const areaPath = [
    `M ${points[0].x} ${padding.top + chartHeight}`,
    ...points.map((p) => `L ${p.x} ${p.y}`),
    `L ${points[points.length - 1].x} ${padding.top + chartHeight}`,
    'Z',
  ].join(' ');

  return (
    <figure className="w-full">
      {title && (
        <figcaption className="text-sm font-bold text-slate-900 mb-2 text-center">
          {title}
        </figcaption>
      )}
      <div className="relative w-full overflow-hidden rounded-2xl border border-orange-100 bg-orange-50/30 p-3 sm:p-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          aria-label={`Linjediagram: ${data.map((d) => `${d.x}: ${d.y}${unit}`).join(', ')}`}
        >
          <defs>
            <linearGradient id="line-area-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#F97316" stopOpacity="0.35" />
              <stop offset="1" stopColor="#F97316" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="line-stroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#F97316" />
              <stop offset="1" stopColor="#DC2626" />
            </linearGradient>
          </defs>

          {/* Y-axis label */}
          {yAxisLabel && (
            <text
              x={padding.left - 40}
              y={padding.top + chartHeight / 2}
              fontSize="11"
              fontWeight="600"
              fill="#475569"
              transform={`rotate(-90 ${padding.left - 40} ${padding.top + chartHeight / 2})`}
              textAnchor="middle"
            >
              {yAxisLabel}
            </text>
          )}

          {/* Grid lines + Y-labels */}
          {Array.from({ length: gridSteps + 1 }).map((_, i) => {
            const y = padding.top + chartHeight - (i / gridSteps) * chartHeight;
            const value = (niceMin + i * stepValue).toFixed(stepValue >= 10 ? 0 : 1);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartWidth}
                  y2={y}
                  stroke={i === 0 ? '#94A3B8' : '#FED7AA'}
                  strokeWidth={i === 0 ? 1.5 : 1}
                  strokeDasharray={i === 0 ? '0' : '3 4'}
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  fontSize="11"
                  fill="#475569"
                  textAnchor="end"
                  fontWeight="500"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {points.map((p, i) => (
            <text
              key={`x-${i}`}
              x={p.x}
              y={padding.top + chartHeight + 22}
              fontSize="11"
              fontWeight="600"
              fill="#475569"
              textAnchor="middle"
            >
              {p.label}
            </text>
          ))}

          {/* X-axis label */}
          {xAxisLabel && (
            <text
              x={padding.left + chartWidth / 2}
              y={height - 10}
              fontSize="11"
              fontWeight="600"
              fill="#475569"
              textAnchor="middle"
            >
              {xAxisLabel}
            </text>
          )}

          {/* Område under linjen */}
          <motion.path
            d={areaPath}
            fill="url(#line-area-fill)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          />

          {/* Linje */}
          <motion.path
            d={linePath}
            fill="none"
            stroke="url(#line-stroke)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />

          {/* Punkter på linjen */}
          {points.map((p, i) => (
            <motion.g
              key={`pt-${i}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + i * 0.04 }}
            >
              <circle cx={p.x} cy={p.y} r="5" fill="white" stroke="#DC2626" strokeWidth="2.5" />
              <circle cx={p.x} cy={p.y} r="2" fill="#DC2626" />
            </motion.g>
          ))}
        </svg>
      </div>
    </figure>
  );
}

function niceCeiling(value: number): number {
  if (value <= 0) return 10;
  const exponent = Math.floor(Math.log10(value));
  const fraction = value / Math.pow(10, exponent);
  let niceFraction: number;
  if (fraction <= 1) niceFraction = 1;
  else if (fraction <= 2) niceFraction = 2;
  else if (fraction <= 2.5) niceFraction = 2.5;
  else if (fraction <= 5) niceFraction = 5;
  else niceFraction = 10;
  return niceFraction * Math.pow(10, exponent);
}
