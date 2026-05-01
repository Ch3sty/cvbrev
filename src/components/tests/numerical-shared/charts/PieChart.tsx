'use client';

import { motion } from 'framer-motion';

export interface PieSlice {
  label: string;
  value: number;
}

interface PieChartProps {
  title?: string;
  data: PieSlice[];
  unit?: string;
  centerLabel?: string;
}

const COLORS = ['#F97316', '#DC2626', '#BE185D', '#EA580C', '#9D174D'];

/**
 * Custom SVG-cirkeldiagram i orange/röd-DNA.
 *
 * Renderar segment med olika orange/röd-nyanser, segment-labels med
 * pricklinjer ut till siffror, valfri center-label.
 */
export default function PieChart({ title, data, unit = '%', centerLabel }: PieChartProps) {
  const width = 600;
  const height = 360;
  const cx = width / 2 - 60; // shift left to make room for legend
  const cy = height / 2;
  const radius = 110;
  const innerRadius = 50;

  const total = data.reduce((sum, s) => sum + s.value, 0);

  // Beräkna segment-paths
  let cumulativeAngle = -Math.PI / 2; // start from top
  const segments = data.map((slice, i) => {
    const sliceAngle = (slice.value / total) * Math.PI * 2;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + sliceAngle;
    cumulativeAngle = endAngle;

    const startX = cx + Math.cos(startAngle) * radius;
    const startY = cy + Math.sin(startAngle) * radius;
    const endX = cx + Math.cos(endAngle) * radius;
    const endY = cy + Math.sin(endAngle) * radius;

    const innerStartX = cx + Math.cos(startAngle) * innerRadius;
    const innerStartY = cy + Math.sin(startAngle) * innerRadius;
    const innerEndX = cx + Math.cos(endAngle) * innerRadius;
    const innerEndY = cy + Math.sin(endAngle) * innerRadius;

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    const path = [
      `M ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`,
      `L ${innerEndX} ${innerEndY}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStartX} ${innerStartY}`,
      'Z',
    ].join(' ');

    const midAngle = (startAngle + endAngle) / 2;
    const labelX = cx + Math.cos(midAngle) * (radius * 0.72);
    const labelY = cy + Math.sin(midAngle) * (radius * 0.72);
    const percentage = Math.round((slice.value / total) * 100);

    return {
      path,
      color: COLORS[i % COLORS.length],
      label: slice.label,
      value: slice.value,
      percentage,
      labelX,
      labelY,
    };
  });

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
          aria-label={`Cirkeldiagram: ${data.map((d) => `${d.label} ${d.value}${unit}`).join(', ')}`}
        >
          {/* Segments */}
          {segments.map((seg, i) => (
            <motion.path
              key={i}
              d={seg.path}
              fill={seg.color}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />
          ))}

          {/* Procent-labels inuti segment */}
          {segments.map((seg, i) => (
            <motion.text
              key={`label-${i}`}
              x={seg.labelX}
              y={seg.labelY + 4}
              fontSize="14"
              fontWeight="800"
              fill="white"
              textAnchor="middle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
              style={{ pointerEvents: 'none' }}
            >
              {seg.percentage}%
            </motion.text>
          ))}

          {/* Center-label */}
          {centerLabel && (
            <text x={cx} y={cy + 4} fontSize="13" fontWeight="700" fill="#1E293B" textAnchor="middle">
              {centerLabel}
            </text>
          )}

          {/* Legend till höger */}
          {segments.map((seg, i) => {
            const legendY = 80 + i * 36;
            const legendX = width - 200;
            return (
              <g key={`legend-${i}`}>
                <rect x={legendX} y={legendY - 10} width="14" height="14" rx="3" fill={seg.color} />
                <text x={legendX + 22} y={legendY} fontSize="12" fontWeight="600" fill="#1E293B">
                  {seg.label}
                </text>
                <text x={legendX + 22} y={legendY + 14} fontSize="11" fill="#64748B">
                  {seg.value}
                  {unit}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </figure>
  );
}
