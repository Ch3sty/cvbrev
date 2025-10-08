'use client';

import { useId, useMemo } from 'react';
import { Shape } from '@/lib/tester/patternTypes';

interface ShapeSVGProps {
  shape: Shape;
  className?: string;
}

// Color mapping (färgkontrasterande och tillgängliga färger, ej WCAG AA text-kontrast)
const colorMap = {
  blue: '#2563eb',
  red: '#dc2626',
  green: '#16a34a',
  black: '#000000',
  yellow: '#ca8a04',
  purple: '#9333ea'
} as const;

// Size mapping (percentage of container, max 80 for 'large')
const sizeMap = {
  small: 40,
  medium: 60,
  large: 80
} as const;

function renderPattern(fill: Shape['fill'], strokeColor: string, id: string, R: number) {
  // Skala pattern-täthet efter storlek för bättre visuell balans
  const tile = Math.max(4, Math.round(R / 5));

  if (fill === 'striped') {
    return (
      <pattern
        id={id}
        patternUnits="userSpaceOnUse"
        width={tile}
        height={tile}
        patternTransform="rotate(45)"
      >
        <line
          x1="0"
          y1="0"
          x2="0"
          y2={tile}
          stroke={strokeColor}
          strokeWidth={Math.max(2, tile / 2)}
        />
      </pattern>
    );
  }

  if (fill === 'dotted') {
    return (
      <pattern
        id={id}
        patternUnits="userSpaceOnUse"
        width={tile}
        height={tile}
      >
        <circle
          cx={tile / 2}
          cy={tile / 2}
          r={Math.max(1, tile / 4)}
          fill={strokeColor}
        />
      </pattern>
    );
  }

  if (fill === 'crosshatch') {
    return (
      <pattern
        id={id}
        patternUnits="userSpaceOnUse"
        width={tile}
        height={tile}
      >
        <path
          d={`M0,0 L${tile},${tile} M${tile},0 L0,${tile}`}
          stroke={strokeColor}
          strokeWidth={Math.max(1, tile / 8)}
        />
      </pattern>
    );
  }

  return null;
}

export function ShapeSVG({ shape, className = '' }: ShapeSVGProps) {
  const { form, fill, color, size, rotation = 0 } = shape;

  const cx = 50; // Center X i viewBox
  const cy = 50; // Center Y i viewBox
  const R = sizeMap[size] * 0.5; // Omslutande radie (20, 30, 40 för small/medium/large)
  const strokeColor = colorMap[color];

  // Skala strokeWidth proportionellt efter storlek
  const strokeW = Math.max(1, Math.round(R / 12));

  // Stabil pattern-ID över SSR/CSR med useId()
  const baseId = useId();
  const patternId = `p-${baseId}-${fill}-${color}`;

  const fillAttr = useMemo(() => {
    if (fill === 'solid') return strokeColor;
    if (fill === 'empty') return 'none';
    return `url(#${patternId})`;
  }, [fill, patternId, strokeColor]);

  const defs = useMemo(() => {
    if (fill === 'solid' || fill === 'empty') return null;
    return renderPattern(fill, strokeColor, patternId, R);
  }, [fill, strokeColor, patternId, R]);

  // Hjälpfunktion för regular polygon på cirkel
  const regularPolygonPoints = (n: number, radius: number, startAngleDeg: number = -90) => {
    return Array.from({ length: n }, (_, i) => {
      const angle = ((startAngleDeg + (360 / n) * i) * Math.PI) / 180;
      return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
    }).join(' ');
  };

  return (
    <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`}>
      {defs && <defs>{defs}</defs>}

      {/* Rotation sker runt exakt center med SVG transform (säkrare än CSS) */}
      <g transform={`rotate(${rotation}, ${cx}, ${cy})`}>
        {/* CIRCLE */}
        {form === 'circle' && (
          <circle
            cx={cx}
            cy={cy}
            r={R}
            fill={fillAttr}
            stroke={strokeColor}
            strokeWidth={strokeW}
          />
        )}

        {/* SQUARE - inskriven i cirkel R => halvsida = R / √2 */}
        {form === 'square' && (() => {
          const halfSide = R / Math.SQRT2;
          return (
            <rect
              x={cx - halfSide}
              y={cy - halfSide}
              width={halfSide * 2}
              height={halfSide * 2}
              fill={fillAttr}
              stroke={strokeColor}
              strokeWidth={strokeW}
            />
          );
        })()}

        {/* TRIANGLE - equilateral på cirkelradie R, spets uppåt */}
        {form === 'triangle' && (
          <polygon
            points={regularPolygonPoints(3, R, -90)}
            fill={fillAttr}
            stroke={strokeColor}
            strokeWidth={strokeW}
          />
        )}

        {/* DIAMOND - fyrkant roterad 45°, men vi använder R direkt för hörnen */}
        {form === 'diamond' && (
          <polygon
            points={`${cx},${cy - R} ${cx + R},${cy} ${cx},${cy + R} ${cx - R},${cy}`}
            fill={fillAttr}
            stroke={strokeColor}
            strokeWidth={strokeW}
          />
        )}

        {/* HEXAGON - 6 hörn på cirkelradie R, spets uppåt */}
        {form === 'hexagon' && (
          <polygon
            points={regularPolygonPoints(6, R, -90)}
            fill={fillAttr}
            stroke={strokeColor}
            strokeWidth={strokeW}
          />
        )}

        {/* STAR - 5-pointed star med klassisk proportion (inner = R * 0.5) */}
        {form === 'star' && (() => {
          const outer = R;
          const inner = R * 0.5; // Klassisk stjärnproportion
          const starPts: string[] = [];

          for (let i = 0; i < 5; i++) {
            const outerAngle = -Math.PI / 2 + (2 * Math.PI * i) / 5;
            const innerAngle = outerAngle + Math.PI / 5;
            starPts.push(`${cx + outer * Math.cos(outerAngle)},${cy + outer * Math.sin(outerAngle)}`);
            starPts.push(`${cx + inner * Math.cos(innerAngle)},${cy + inner * Math.sin(innerAngle)}`);
          }

          return (
            <polygon
              points={starPts.join(' ')}
              fill={fillAttr}
              stroke={strokeColor}
              strokeWidth={strokeW}
            />
          );
        })()}
      </g>
    </svg>
  );
}
