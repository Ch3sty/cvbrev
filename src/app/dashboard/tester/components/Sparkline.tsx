'use client';

/**
 * Lättviktig SVG-sparkline för testutveckling. Visar en serie procentvärden
 * (0 till 100) som en linje med en markör på sista punkten.
 *
 * Tråden: linjen är accenten (orange som linje, aldrig yta), baslinjen är
 * kant och markören ink. Ingen fyllning under linjen, ingen gradient.
 */

interface SparklineProps {
  /** Värden i procent (0 till 100), äldst först. */
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
  // y inverterat: 100 procent överst, 0 procent nederst.
  const yFor = (v: number) => padY + (1 - Math.max(0, Math.min(100, v)) / 100) * innerH;

  const linePath = points
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i).toFixed(1)} ${yFor(v).toFixed(1)}`)
    .join(' ');

  const lastX = xFor(n - 1);
  const lastY = yFor(points[n - 1]);
  const baseY = (height - padY).toFixed(1);

  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* Baslinjen, 0 procent */}
      <path
        d={`M ${padX} ${baseY} L ${(width - padX).toFixed(1)} ${baseY}`}
        fill="none"
        stroke="var(--kant)"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={linePath}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {/* Markör på senaste försöket */}
      <circle cx={lastX} cy={lastY} r={3} fill="var(--ink-1)" />
    </svg>
  );
}
