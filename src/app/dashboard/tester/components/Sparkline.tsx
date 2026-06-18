'use client';

/**
 * Lättviktig SVG-sparkline för testutveckling. Visar en serie procent-värden
 * (0–100) som en mjuk linje med gradient-fyllnad under, plus en markör på
 * sista punkten. Hand-rollad för att matcha hubbens premium-stil utan recharts.
 */

interface SparklineProps {
  /** Värden i procent (0–100), äldst→nyast. */
  values: number[];
  className?: string;
  width?: number;
  height?: number;
}

export default function Sparkline({
  values,
  className,
  width = 220,
  height = 56,
}: SparklineProps) {
  const padX = 4;
  const padY = 6;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  // Med bara en punkt: rita en liten plattlinje mitt i, plus markören.
  const points = values.length === 1 ? [values[0], values[0]] : values;
  const n = points.length;

  const xFor = (i: number) => padX + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  // y inverterat: 100% överst, 0% nederst.
  const yFor = (v: number) => padY + (1 - Math.max(0, Math.min(100, v)) / 100) * innerH;

  const linePath = points
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i).toFixed(1)} ${yFor(v).toFixed(1)}`)
    .join(' ');

  const areaPath =
    `${linePath} L ${xFor(n - 1).toFixed(1)} ${(height - padY).toFixed(1)}` +
    ` L ${xFor(0).toFixed(1)} ${(height - padY).toFixed(1)} Z`;

  const lastX = xFor(n - 1);
  const lastY = yFor(points[n - 1]);
  const gradId = `spark-fill-${width}-${height}`;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F97316" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={linePath}
        fill="none"
        stroke="#EA580C"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {/* Markör på senaste försöket */}
      <circle cx={lastX} cy={lastY} r={3.5} fill="#DC2626" stroke="white" strokeWidth={1.5} />
    </svg>
  );
}
