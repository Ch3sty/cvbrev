'use client';

import { motion } from 'framer-motion';

export interface BarSeries {
  label: string;
  value: number;
}

interface BarChartProps {
  title?: string;
  data: BarSeries[];
  unit?: string;
  yAxisLabel?: string;
  showValues?: boolean;
}

/**
 * Custom SVG-stapeldiagram i orange/röd-DNA.
 *
 * Renderar vertikala staplar med gradient orange→röd, grid-lines,
 * labels under varje stapel och värden ovanför.
 *
 * Responsiv via viewBox - skala via wrappande div.
 */
export default function BarChart({
  title,
  data,
  unit = '',
  yAxisLabel,
  showValues = true,
}: BarChartProps) {
  const padding = { top: 32, right: 24, bottom: 56, left: 48 };
  const width = 600;
  const height = 360;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...data.map((d) => d.value));
  // Runda upp till "snyggt" max-värde
  const niceMax = niceCeiling(maxValue);

  // 4-5 grid-lines
  const gridSteps = 5;
  const stepValue = niceMax / gridSteps;

  const barCount = data.length;
  const barGap = chartWidth * 0.08;
  const totalGapWidth = barGap * (barCount - 1);
  const barWidth = (chartWidth - totalGapWidth) / barCount;

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
          aria-label={`Stapeldiagram: ${data.map((d) => `${d.label} ${d.value}${unit}`).join(', ')}`}
        >
          <defs>
            <linearGradient id="bar-fill-orange" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#F97316" />
              <stop offset="1" stopColor="#FB923C" />
            </linearGradient>
            <linearGradient id="bar-fill-red" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#DC2626" />
              <stop offset="1" stopColor="#F87171" />
            </linearGradient>
            <linearGradient id="bar-fill-pink" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#BE185D" />
              <stop offset="1" stopColor="#EC4899" />
            </linearGradient>
          </defs>

          {/* Y-axis label */}
          {yAxisLabel && (
            <text
              x={padding.left - 36}
              y={padding.top + chartHeight / 2}
              fontSize="11"
              fontWeight="600"
              fill="#475569"
              transform={`rotate(-90 ${padding.left - 36} ${padding.top + chartHeight / 2})`}
              textAnchor="middle"
            >
              {yAxisLabel}
            </text>
          )}

          {/* Grid lines + Y-axis labels */}
          {Array.from({ length: gridSteps + 1 }).map((_, i) => {
            const y = padding.top + chartHeight - (i / gridSteps) * chartHeight;
            const value = (i * stepValue).toFixed(stepValue >= 10 ? 0 : 1);
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

          {/* Bars */}
          {data.map((d, i) => {
            const barHeight = (d.value / niceMax) * chartHeight;
            const x = padding.left + i * (barWidth + barGap);
            const y = padding.top + chartHeight - barHeight;
            const fill =
              i % 3 === 0 ? 'url(#bar-fill-orange)' : i % 3 === 1 ? 'url(#bar-fill-red)' : 'url(#bar-fill-pink)';

            return (
              <g key={i}>
                <motion.rect
                  initial={{ height: 0, y: padding.top + chartHeight }}
                  animate={{ height: barHeight, y }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
                  x={x}
                  width={barWidth}
                  rx="4"
                  fill={fill}
                />
                {/* Värde ovanför stapeln */}
                {showValues && (
                  <motion.text
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.6 + i * 0.08 }}
                    x={x + barWidth / 2}
                    y={y - 8}
                    fontSize="13"
                    fontWeight="700"
                    fill="#1E293B"
                    textAnchor="middle"
                  >
                    {d.value}
                    {unit}
                  </motion.text>
                )}
                {/* Label under */}
                <text
                  x={x + barWidth / 2}
                  y={padding.top + chartHeight + 22}
                  fontSize="12"
                  fontWeight="600"
                  fill="#475569"
                  textAnchor="middle"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </figure>
  );
}

/**
 * Rundar upp ett värde till "snyggt" tal för max-värde på Y-axeln.
 * t.ex. 23 → 25, 47 → 50, 123 → 150
 */
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
