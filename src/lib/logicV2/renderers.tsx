// src/lib/logicV2/renderers.tsx
import React from 'react';
import type { Cell, LineName } from './types';

// --- Constants and Helper Functions ---
const SIZE = 100, CX = 50, CY = 50;
const STROKE_COLOR = '#000';
const STROKE_WIDTH = 2.5;

const rotate = (rotation: number, content: React.JSX.Element) => (
  <g transform={`rotate(${rotation}, ${CX}, ${CY})`}>{content}</g>
);

// --- Basic Shape Components ---
const Line = (props: { x1: number; y1: number; x2: number; y2: number }) => (
  <line {...props} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
);

// Grid component for visual reference frame
const Grid = () => (
  <rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" strokeWidth="1"/>
);

const PolygonShape: React.FC<{ sides: number; r: number; fill: boolean; rotation?: number }> = ({ sides, r, fill, rotation = 0 }) => {
  if (sides === 0) {
    // Circle
    return <circle cx={CX} cy={CY} r={r} fill={fill ? STROKE_COLOR : 'none'} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />;
  }
  if (sides === 4) {
    // Square
    return rotate(rotation, <rect x={CX - r} y={CY - r} width={2 * r} height={2 * r} fill={fill ? STROKE_COLOR : 'none'} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />);
  }

  const getPoints = (s: number) => {
    let points = '';
    for (let i = 0; i < s; i++) {
      const angle = (i * 2 * Math.PI) / s - Math.PI / 2; // Starts at top
      points += `${CX + r * Math.cos(angle)},${CY + r * Math.sin(angle)} `;
    }
    return points;
  };

  return rotate(rotation, <polygon points={getPoints(sides)} fill={fill ? STROKE_COLOR : 'none'} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />);
};

// --- Specific Renderer Components for v2 ---

const renderIntersections = (count: number) => {
  const lines = [
    <Line key="h1" x1={10} y1={30} x2={90} y2={30} />,
    <Line key="h2" x1={10} y1={50} x2={90} y2={50} />,
    <Line key="h3" x1={10} y1={70} x2={90} y2={70} />,
    <Line key="v1" x1={30} y1={10} x2={30} y2={90} />,
    <Line key="v2" x1={50} y1={10} x2={50} y2={90} />,
    <Line key="v3" x1={70} y1={10} x2={70} y2={90} />,
    <Line key="d1" x1={10} y1={10} x2={90} y2={90} />,
    <Line key="d2" x1={10} y1={90} x2={90} y2={10} />,
  ];

  // Show different line combinations based on count
  switch (count) {
    case 0:
      return <Line x1={10} y1={50} x2={90} y2={50} />;
    case 1:
      return <><Line x1={10} y1={50} x2={90} y2={50} /><Line x1={50} y1={10} x2={50} y2={90} /></>;
    case 2:
      return <><Line x1={10} y1={30} x2={90} y2={30} /><Line x1={10} y1={70} x2={90} y2={70} /><Line x1={50} y1={10} x2={50} y2={90} /></>;
    case 3:
      return <><Line x1={10} y1={10} x2={90} y2={90} /><Line x1={10} y1={90} x2={90} y2={10} /><Line x1={50} y1={10} x2={50} y2={90} /></>;
    case 4:
      return <><Line x1={10} y1={10} x2={90} y2={90} /><Line x1={10} y1={90} x2={90} y2={10} /><Line x1={10} y1={50} x2={90} y2={50} /><Line x1={50} y1={10} x2={50} y2={90} /></>;
    case 5:
      return <><Line x1={10} y1={10} x2={90} y2={90} /><Line x1={10} y1={90} x2={90} y2={10} /><Line x1={10} y1={30} x2={90} y2={30} /><Line x1={10} y1={70} x2={90} y2={70} /></>;
    case 6:
      return <><Line x1={10} y1={10} x2={90} y2={90} /><Line x1={10} y1={90} x2={90} y2={10} /><Line x1={10} y1={50} x2={90} y2={50} /><Line x1={30} y1={10} x2={30} y2={90} /><Line x1={70} y1={10} x2={70} y2={90} /></>;
    case 7:
      return <><Line x1={10} y1={10} x2={90} y2={90} /><Line x1={10} y1={90} x2={90} y2={10} /><Line x1={10} y1={30} x2={90} y2={30} /><Line x1={10} y1={70} x2={90} y2={70} /><Line x1={50} y1={10} x2={50} y2={90} /></>;
    case 8:
      return <><Line x1={10} y1={30} x2={90} y2={30} /><Line x1={10} y1={50} x2={90} y2={50} /><Line x1={10} y1={70} x2={90} y2={70} /><Line x1={30} y1={10} x2={30} y2={90} /><Line x1={70} y1={10} x2={70} y2={90} /></>;
    default:
      return null;
  }
};

const renderLines = (lineNames: LineName[]) => {
  const lineMap: Record<LineName, React.JSX.Element> = {
    frame: <rect key="frame" x="25" y="25" width="50" height="50" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />,
    diag_down: <Line key="diag_down" x1={25} y1={25} x2={75} y2={75} />,
    diag_up: <Line key="diag_up" x1={25} y1={75} x2={75} y2={25} />,
    cross: <g key="cross"><Line x1={25} y1={50} x2={75} y2={50} /><Line x1={50} y1={25} x2={50} y2={75} /></g>,
    vert: <Line key="vert" x1={50} y1={25} x2={50} y2={75} />,
    horiz: <Line key="horiz" x1={25} y1={50} x2={75} y2={50} />,
    top: <Line key="top" x1={25} y1={25} x2={75} y2={25} />,
    bottom: <Line key="bottom" x1={25} y1={75} x2={75} y2={75} />,
    left: <Line key="left" x1={25} y1={25} x2={25} y2={75} />,
    right: <Line key="right" x1={75} y1={25} x2={75} y2={75} />,
  };
  return <>{lineNames.map(name => lineMap[name])}</>;
};

const renderGroup = (shape: 'circle' | 'square' | 'triangle', count: number, pos: 'L' | 'C' | 'R' = 'C', layout: 'vert' | 'horiz' = 'vert') => {
  const positions: { x: number; y: number }[] = [];
  const x = pos === 'L' ? 25 : pos === 'C' ? 50 : 75;
  if (count === 1) positions.push({ x, y: 50 });
  if (count === 2) positions.push({ x, y: 35 }, { x, y: 65 });
  if (count === 3) positions.push({ x, y: 25 }, { x, y: 50 }, { x, y: 75 });

  const Shape = ({ x, y }: { x: number; y: number }) => {
    if (shape === 'circle') return <circle key={`${x}-${y}`} cx={x} cy={y} r={10} fill={STROKE_COLOR} />;
    if (shape === 'square') return <rect key={`${x}-${y}`} x={x - 10} y={y - 10} width={20} height={20} fill={STROKE_COLOR} />;
    return <path key={`${x}-${y}`} d={`M${x} ${y - 10} L${x + 10} ${y + 10} L${x - 10} ${y + 10} Z`} fill={STROKE_COLOR} />;
  };
  return <>{positions.map((p, i) => <Shape key={i} x={p.x} y={p.y} />)}</>;
};

// --- Main Component: SvgCell ---
export const SvgCell: React.FC<{ cell: Cell; showGrid?: boolean }> = ({ cell, showGrid = false }) => {
  const content = () => {
    switch (cell.kind) {
      case 'polygon':
        return <PolygonShape sides={cell.sides} r={cell.sides === 4 ? 20 : 25} fill={cell.fill} rotation={cell.rotation} />;

      case 'half_circle':
        return rotate(cell.rotation, <path d="M 50 25 A 25 25 0 0 1 50 75 Z" fill={STROKE_COLOR} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />);

      case 'pointer':
        const pointerPath = <path d="M 30 70 L 30 30 L 70 50 Z" fill={cell.fill ? STROKE_COLOR : 'none'} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />;
        return rotate(cell.rotation, pointerPath);

      case 'corner':
        const scale = `${cell.mirror_h ? -1 : 1}, ${cell.mirror_v ? -1 : 1}`;
        const cornerPath = <path d="M 25 25 L 25 75 L 75 75" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />;
        return <g transform={`rotate(${cell.rotation}, 50, 50) scale(${scale}) translate(${cell.mirror_h ? -100 : 0}, ${cell.mirror_v ? -100 : 0})`}>{cornerPath}</g>;

      case 'intersections':
        return renderIntersections(cell.count);

      case 'containment':
        const dotPos = { x: CX + cell.position * (cell.shape === 'circle' ? 38 : 33), y: CY };
        return <>
          {cell.shape === 'circle' && <circle cx={CX} cy={CY} r={25} fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />}
          {cell.shape === 'square' && <rect x={25} y={25} width={50} height={50} fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />}
          {cell.shape === 'triangle' && rotate(-90, <polygon points="50,25 71.65,62.5 28.35,62.5" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />)}
          <circle cx={dotPos.x} cy={dotPos.y} r={8} fill={STROKE_COLOR} />
        </>;

      case 'piece':
        const piecePaths: Record<string, Record<string, string>> = {
          square: { full: "M25,25 H75 V75 H25Z", top_right: "M25,25 H75 V75Z", bottom_left: "M25,25 V75 H75Z" },
          circle: { full: "M50,25 A25,25 0 1,1 49.99,25Z", top_right: "M50,25 A25,25 0 0,1 75,50 L50,50Z", bottom_left: "M50,25 L50,75 A25,25 0 0,1 25,50 L50,50Z" },
          rhombus: { full: "M20,20 L80,20 L80,80 L20,80Z", top: "M50,50 L20,20 L80,20Z", bottom: "M50,50 L20,80 L80,80Z" }
        };
        const d = piecePaths[cell.shape]?.[cell.piece] ?? "";
        return <path d={d} fill={STROKE_COLOR} />;

      case 'lines':
        return renderLines(cell.lines);

      case 'grid_dot':
        return <>
          <rect x="20" y="20" width="60" height="60" fill="none" stroke="#ccc" strokeWidth="1" />
          <circle cx={50 + cell.x * 15} cy={50 + cell.y * 15} r="5" fill={STROKE_COLOR} />
        </>;

      case 'group':
        return renderGroup(cell.shape, cell.count, cell.pos, cell.layout);

      case 'dots':
        // Render dots based on count with automatic standard positioning
        const dotPositions: Record<number, { x: number; y: number }[]> = {
          1: [{ x: 50, y: 50 }],
          2: [{ x: 35, y: 50 }, { x: 65, y: 50 }],
          3: [{ x: 50, y: 35 }, { x: 30, y: 65 }, { x: 70, y: 65 }],
          4: [{ x: 50, y: 28 }, { x: 28, y: 50 }, { x: 72, y: 50 }, { x: 50, y: 72 }],
          5: [{ x: 35, y: 35 }, { x: 65, y: 35 }, { x: 35, y: 65 }, { x: 65, y: 65 }, { x: 50, y: 50 }],
        };
        const dots = dotPositions[cell.count] || [];
        return <>{dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={8} fill={STROKE_COLOR} />)}</>;

      case 'icon':
        // Render specific icon shapes with rotation
        const iconContent = () => {
          switch (cell.shape) {
            case 'arrow':
              // Diamond arrow shape (as in Q12 spec)
              return <path d="M50 20 L70 40 L50 60 L30 40 Z" fill={STROKE_COLOR} />;
            case 'cross':
              // T-kors / Plus shape
              return <g><Line x1={50} y1={25} x2={50} y2={75} /><Line x1={25} y1={50} x2={75} y2={50} /></g>;
            case 'L':
              // L-form
              return <path d="M25 25 L25 75 L75 75" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />;
          }
        };
        return rotate(cell.rotation, <>{iconContent()}</>);

      default:
        return null;
    }
  };

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} shapeRendering="geometricPrecision">
      {showGrid && <Grid />}
      {content()}
    </svg>
  );
};
