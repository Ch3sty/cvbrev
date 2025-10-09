/**
 * SVG renderers for all cell types
 * Follows best practices for crisp, scalable vector graphics
 */

import React from 'react';
import type { Cell } from './types';

const SIZE = 100;
const CX = 50;
const CY = 50;
const R = 22; // ring radius
const LEN = 14; // tick length
const black = '#000';

const norm = (a: number) => ((a % 360) + 360) % 360;

// Primitive components
const Line = ({
  x1,
  y1,
  x2,
  y2,
  sw = 2,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  sw?: number;
}) => (
  <line
    x1={x1}
    y1={y1}
    x2={x2}
    y2={y2}
    stroke={black}
    strokeWidth={sw}
    strokeLinecap="round"
  />
);

const Ring = () => (
  <circle cx={CX} cy={CY} r={R} fill="none" stroke={black} strokeWidth={2} />
);

// Convert polar coordinates to cartesian
const polar = (deg: number, r = R): [number, number] => {
  const t = (deg * Math.PI) / 180;
  return [CX + r * Math.cos(t), CY + r * Math.sin(t)];
};

// Tick at specified index (0..7 => 0°, 45°, ...)
const Tick = ({ i }: { i: number }) => {
  const ang = i * 45; // index 0..7 => 0°, 45°, ..., 315°
  const [x1, y1] = polar(ang, R);
  const [x2, y2] = polar(ang, R + LEN);
  return <Line x1={x1} y1={y1} x2={x2} y2={y2} />;
};

// T-shape (rotatable)
const TShape = ({ rotation }: { rotation: 0 | 90 | 180 | 270 }) => (
  <g transform={`rotate(${rotation},${CX},${CY})`}>
    <Line x1={20} y1={50} x2={80} y2={50} />
    <Line x1={50} y1={20} x2={50} y2={50} />
  </g>
);

// Plus-shape (rotatable)
const PlusShape = ({ rotation }: { rotation: 0 | 90 | 180 | 270 }) => (
  <g transform={`rotate(${rotation},${CX},${CY})`}>
    <Line x1={30} y1={50} x2={70} y2={50} sw={2.5} />
    <Line x1={50} y1={30} x2={50} y2={70} sw={2.5} />
  </g>
);

// Dot (small circle)
const Dot = ({ cx, cy }: { cx: number; cy: number }) => (
  <circle cx={cx} cy={cy} r={3} fill={black} />
);

// X symbol
const XSymbol = () => (
  <>
    <Line x1={32} y1={32} x2={68} y2={68} sw={2.5} />
    <Line x1={68} y1={32} x2={32} y2={68} sw={2.5} />
  </>
);

// O symbol
const OSymbol = () => (
  <circle cx={CX} cy={CY} r={18} fill="none" stroke={black} strokeWidth={2.5} />
);

// Triangle (isosceles/asymmetric for clear rotation visibility)
const Triangle = ({ rot = 0, solid = true }: { rot?: number; solid?: boolean }) => {
  // Isosceles triangle: narrower base (15px each side), taller height (32px)
  // Creates arrow-like shape where rotation direction is clearly visible
  const baseHalfWidth = 15;
  const height = 32;

  // Calculate centroid offset: for isosceles triangle, centroid is at 1/3 from base
  // We need to shift the triangle up so centroid lands at (CX, CY)
  const centroidOffset = height / 3;

  const pts = [
    [CX, CY - height + centroidOffset],              // Top point (tip of arrow)
    [CX + baseHalfWidth, CY + centroidOffset],       // Bottom right
    [CX - baseHalfWidth, CY + centroidOffset],       // Bottom left
  ]
    .map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`)
    .join(' ');
  return (
    <g transform={`rotate(${norm(rot)},${CX},${CY})`}>
      <polygon
        points={pts}
        fill={solid ? black : 'none'}
        stroke={black}
        strokeWidth={2.5}
      />
    </g>
  );
};

/**
 * Main SVG cell renderer
 * Renders any cell type based on its kind
 */
export const SvgCell: React.FC<{ cell: Cell; className?: string }> = ({
  cell,
  className = '',
}) => (
  <svg
    viewBox={`0 0 ${SIZE} ${SIZE}`}
    width={SIZE}
    height={SIZE}
    shapeRendering="geometricPrecision"
    vectorEffect="non-scaling-stroke"
    className={className}
  >
    {cell.kind === 'ring_ticks' && (
      <>
        <Ring />
        {cell.indices.map((i, idx) => (
          <Tick key={idx} i={((i % 8) + 8) % 8} />
        ))}
      </>
    )}
    {cell.kind === 'T_dot' && (
      <>
        <TShape rotation={cell.rotation} />
        <g transform={`rotate(${cell.rotation},${CX},${CY})`}>
          <Dot
            cx={cell.dot === -1 ? 26 : cell.dot === 0 ? 50 : 74}
            cy={50}
          />
        </g>
      </>
    )}
    {cell.kind === 'plus_dot' && (
      <>
        <PlusShape rotation={cell.rotation} />
        <g transform={`rotate(${cell.rotation},${CX},${CY})`}>
          <Dot
            cx={cell.dot === -1 ? 30 : cell.dot === 0 ? 50 : 70}
            cy={50}
          />
        </g>
      </>
    )}
    {cell.kind === 'symbol' &&
      (cell.name === 'X' ? (
        <XSymbol />
      ) : cell.name === 'O' ? (
        <OSymbol />
      ) : (
        <Triangle rot={cell.rotation ?? 0} solid={cell.solid ?? true} />
      ))}
  </svg>
);
