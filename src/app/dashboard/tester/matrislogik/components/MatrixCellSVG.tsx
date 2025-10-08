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

  // Rendera pattern definitions med förbättrad stabilitet
  const renderPattern = (patternDef: typeof patterns[0]) => {
    const strokeColor = colorMap[patternDef.color];
    const R = 40; // Använd genomsnittlig storlek för pattern-beräkning
    const tile = Math.max(4, Math.round(R / 5));
    const stripe = Math.max(1, Math.round(tile / 3)); // Randbredd

    if (patternDef.fill === 'striped') {
      return (
        <pattern
          key={patternDef.id}
          id={patternDef.id}
          patternUnits="userSpaceOnUse"
          patternContentUnits="userSpaceOnUse"
          width={tile}
          height={tile}
          patternTransform="rotate(45, 50, 50)"
        >
          <rect
            x="0"
            y="0"
            width={stripe}
            height={tile}
            fill={strokeColor}
            shapeRendering="crispEdges"
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
          patternContentUnits="userSpaceOnUse"
          width={tile}
          height={tile}
        >
          <circle
            cx={tile / 2}
            cy={tile / 2}
            r={Math.max(1, tile / 6)}
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
          patternContentUnits="userSpaceOnUse"
          width={tile}
          height={tile}
        >
          <rect
            x="0"
            y="0"
            width={Math.max(1, tile / 8)}
            height={tile}
            fill={strokeColor}
            shapeRendering="crispEdges"
          />
          <rect
            x="0"
            y="0"
            width={tile}
            height={Math.max(1, tile / 8)}
            fill={strokeColor}
            shapeRendering="crispEdges"
          />
        </pattern>
      );
    }

    return null;
  };

  // Beräkna position för multipla shapes med tillräckligt mellanrum
  const calculatePosition = (index: number, total: number): { cx: number; cy: number } => {
    if (total === 1) {
      return { cx: 50, cy: 50 }; // Center för single shape
    }

    // Beräkna max radie för att justera spacing
    const maxRadius = Math.max(...cell.shapes.map(s => sizeMap[s.size] * 0.5));

    if (total === 2) {
      // Två shapes: placera horisontellt med spacing baserat på storlek
      const spacing = maxRadius * 2.2; // 2.2x diameter för tydligt mellanrum
      return {
        cx: 50 - spacing / 2 + (index * spacing),
        cy: 50
      };
    }

    if (total === 3) {
      // Tre shapes: triangel-layout ELLER horisontell rad beroende på storlek
      const hasLargeShapes = cell.shapes.some(s => s.size === 'large');

      if (hasLargeShapes) {
        // Triangel för stora shapes med mer spacing
        const positions = [
          { cx: 50, cy: 30 },      // Top
          { cx: 30, cy: 65 },      // Bottom left
          { cx: 70, cy: 65 }       // Bottom right
        ];
        return positions[index];
      } else {
        // Horisontell rad för små/medium shapes med spacing baserat på storlek
        const spacing = maxRadius * 2.4; // 2.4x diameter för extra mellanrum
        return {
          cx: 50 - spacing + (index * spacing),
          cy: 50
        };
      }
    }

    // Fallback för 4+ shapes: grid layout
    const cols = 2;
    const spacing = maxRadius * 2.5;
    const row = Math.floor(index / cols);
    const col = index % cols;
    return {
      cx: 35 + (col * spacing),
      cy: 35 + (row * spacing)
    };
  };

  // Rendera en shape som SVG-element
  const renderShape = (shape: Shape, index: number) => {
    const { cx, cy } = calculatePosition(index, cell.shapes.length);
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
    <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        {patterns.map(renderPattern)}
      </defs>
      {cell.shapes.map((shape, idx) => renderShape(shape, idx))}
    </svg>
  );
}
