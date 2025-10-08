'use client';

import { useId, useMemo } from 'react';
import { MatrixCell, Shape } from '@/lib/tester/patternTypes';

interface MatrixCellSVGProps {
  cell: MatrixCell;
  className?: string;
}

// Color mapping (färgkontrasterande och tillgängliga färger)
const colorMap = {
  blue: '#2563eb',
  red: '#dc2626',
  green: '#16a34a',
  black: '#000000',
  yellow: '#ca8a04',
  purple: '#9333ea'
} as const;

// Size mapping
const sizeMap = {
  small: 40,
  medium: 60,
  large: 80
} as const;

/**
 * P1: Optimerad rendering av MatrixCell med överlappande shapes
 * En <svg> per cell istället för flera absolut-positionerade SVG:er
 * Alla shapes renderas i samma koordinatsystem med <g> transform
 */
export function MatrixCellSVG({ cell, className = '' }: MatrixCellSVGProps) {
  const baseId = useId();

  // Samla alla unika patterns från cellens shapes
  const patterns = useMemo(() => {
    const uniquePatterns = new Map<string, { id: string; fill: Shape['fill']; color: Shape['color'] }>();

    cell.shapes.forEach((shape) => {
      if (shape.fill !== 'solid' && shape.fill !== 'empty') {
        const key = `${shape.fill}-${shape.color}`;
        if (!uniquePatterns.has(key)) {
          uniquePatterns.set(key, {
            id: `${baseId}-${key}`,
            fill: shape.fill,
            color: shape.color
          });
        }
      }
    });

    return Array.from(uniquePatterns.values());
  }, [cell.shapes, baseId]);

  // Rendera pattern definitions
  const renderPattern = (patternDef: typeof patterns[0]) => {
    const strokeColor = colorMap[patternDef.color];
    const R = 40; // Använd genomsnittlig storlek för pattern-beräkning
    const tile = Math.max(4, Math.round(R / 5));

    if (patternDef.fill === 'striped') {
      return (
        <pattern
          key={patternDef.id}
          id={patternDef.id}
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

    if (patternDef.fill === 'dotted') {
      return (
        <pattern
          key={patternDef.id}
          id={patternDef.id}
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

    if (patternDef.fill === 'crosshatch') {
      return (
        <pattern
          key={patternDef.id}
          id={patternDef.id}
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
  };

  // Rendera en shape som SVG-element
  const renderShape = (shape: Shape, index: number) => {
    const cx = 50;
    const cy = 50;
    const R = sizeMap[shape.size] * 0.5;
    const strokeColor = colorMap[shape.color];
    const strokeW = Math.max(1, Math.round(R / 12));

    const fillAttr =
      shape.fill === 'solid' ? strokeColor :
      shape.fill === 'empty' ? 'none' :
      `url(#${baseId}-${shape.fill}-${shape.color})`;

    // Hjälpfunktion för regular polygon
    const regularPolygonPoints = (n: number, radius: number, startAngleDeg: number = -90) => {
      return Array.from({ length: n }, (_, i) => {
        const angle = ((startAngleDeg + (360 / n) * i) * Math.PI) / 180;
        return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
      }).join(' ');
    };

    return (
      <g key={index} transform={`rotate(${shape.rotation || 0}, ${cx}, ${cy})`}>
        {/* CIRCLE */}
        {shape.form === 'circle' && (
          <circle
            cx={cx}
            cy={cy}
            r={R}
            fill={fillAttr}
            stroke={strokeColor}
            strokeWidth={strokeW}
          />
        )}

        {/* SQUARE */}
        {shape.form === 'square' && (() => {
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

        {/* TRIANGLE */}
        {shape.form === 'triangle' && (
          <polygon
            points={regularPolygonPoints(3, R, -90)}
            fill={fillAttr}
            stroke={strokeColor}
            strokeWidth={strokeW}
          />
        )}

        {/* DIAMOND */}
        {shape.form === 'diamond' && (
          <polygon
            points={`${cx},${cy - R} ${cx + R},${cy} ${cx},${cy + R} ${cx - R},${cy}`}
            fill={fillAttr}
            stroke={strokeColor}
            strokeWidth={strokeW}
          />
        )}

        {/* HEXAGON */}
        {shape.form === 'hexagon' && (
          <polygon
            points={regularPolygonPoints(6, R, -90)}
            fill={fillAttr}
            stroke={strokeColor}
            strokeWidth={strokeW}
          />
        )}

        {/* STAR */}
        {shape.form === 'star' && (() => {
          const outer = R;
          const inner = R * 0.5;
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
    );
  };

  return (
    <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`}>
      <defs>
        {patterns.map(renderPattern)}
      </defs>
      {cell.shapes.map((shape, idx) => renderShape(shape, idx))}
    </svg>
  );
}
