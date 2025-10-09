// src/lib/logic/renderers.tsx
import React from 'react';
import type { Cell } from './types';

// --- Constants and Helper Components ---
const SIZE = 100, CX = 50, CY = 50;
const STROKE_COLOR = '#000';
const STROKE_WIDTH = 2.5;

const rotate = (rotation: number, content: React.JSX.Element) => (
  <g transform={`rotate(${rotation}, ${CX}, ${CY})`}>{content}</g>
);

const Line: React.FC<{ x1: number, y1: number, x2: number, y2: number }> = (props) => (
  <line {...props} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
);

// Grid component for visual reference frame
const Grid = () => (
  <rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" strokeWidth="1"/>
);

// --- Main Component for Rendering a Cell ---
export const SvgCell: React.FC<{ cell: Cell; showGrid?: boolean }> = ({ cell, showGrid = false }) => {
  const renderContent = () => {
    switch (cell.kind) {
      case 'dots': {
        const dots = [];
        const y = cell.pos === 'T' ? 30 : cell.pos === 'C' ? 50 : 70;
        if (cell.count === 1) dots.push(<circle key={1} cx={50} cy={y} r={8} fill={STROKE_COLOR}/>);
        if (cell.count === 2) {
          dots.push(<circle key={1} cx={35} cy={y} r={8} fill={STROKE_COLOR}/>);
          dots.push(<circle key={2} cx={65} cy={y} r={8} fill={STROKE_COLOR}/>);
        }
        if (cell.count === 3) {
          if(cell.layout === 'vertical') {
            dots.push(<circle key={1} cx={50} cy={30} r={8} fill={STROKE_COLOR}/>);
            dots.push(<circle key={2} cx={50} cy={50} r={8} fill={STROKE_COLOR}/>);
            dots.push(<circle key={3} cx={50} cy={70} r={8} fill={STROKE_COLOR}/>);
          } else {
            dots.push(<circle key={1} cx={25} cy={y} r={8} fill={STROKE_COLOR}/>);
            dots.push(<circle key={2} cx={50} cy={y} r={8} fill={STROKE_COLOR}/>);
            dots.push(<circle key={3} cx={75} cy={y} r={8} fill={STROKE_COLOR}/>);
          }
        }
        return <>{dots}</>;
      }

      case 'arrow': {
        const arrowPath = <path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill={cell.fill ? STROKE_COLOR : 'none'} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />;
        return rotate(cell.rotation, arrowPath);
      }

      case 'icon': {
        let iconPath;
        if (cell.shape === 'pacman') iconPath = <path d="M 50 25 A 25 25 0 1 1 25 50 L 50 50 Z" fill={STROKE_COLOR}/>;
        if (cell.shape === 'star') iconPath = <path d="M50,20 L61.8,40.9 L85.1,42.4 L67.5,59.1 L72.2,82.3 L50,70 L27.8,82.3 L32.5,59.1 L14.9,42.4 L38.2,40.9Z" fill={STROKE_COLOR}/>;
        if (cell.shape === 'heart') iconPath = <path d="M50,30 C40,-10 0,15 50,60 C100,15 60,-10 50,30 Z" fill={STROKE_COLOR}/>;
        return rotate(cell.rotation ?? 0, <>{iconPath}</>);
      }

      case 'fill': {
        let fillShape;
        if (cell.shape === 'circle') fillShape = <circle cx={50} cy={50} r={25} />;
        else if (cell.shape === 'square') fillShape = <rect x="25" y="25" width="50" height="50" />;
        else fillShape = <polygon points="50,25 71.65,62.5 28.35,62.5" />; // triangle
        return React.cloneElement(fillShape, {
          fill: cell.fill ? STROKE_COLOR : 'none',
          stroke: STROKE_COLOR,
          strokeWidth: STROKE_WIDTH
        });
      }

      case 'corner_dot': {
        if (!cell.pos) return null;
        const posMap = { TL: {cx:25, cy:25}, TR: {cx:75, cy:25}, BR: {cx:75, cy:75}, BL: {cx:25, cy:75} };
        return <circle {...posMap[cell.pos]} r={8} fill={STROKE_COLOR} />;
      }

      case 'lines': {
        const lineMap: Record<string, React.JSX.Element> = {
          horiz: <Line key="horiz" x1={25} y1={50} x2={75} y2={50} />,
          vert: <Line key="vert" x1={50} y1={25} x2={50} y2={75} />,
          cross: <g key="cross"><Line x1={25} y1={50} x2={75} y2={50} /><Line x1={50} y1={25} x2={50} y2={75} /></g>,
          diag_down: <Line key="diag_down" x1={25} y1={25} x2={75} y2={75} />,
          diag_up: <Line key="diag_up" x1={25} y1={75} x2={75} y2={25} />,
          frame_h: <g key="frame_h"><Line x1={25} y1={25} x2={75} y2={25} /><Line x1={25} y1={75} x2={75} y2={75} /></g>,
          frame_v: <g key="frame_v"><Line x1={25} y1={25} x2={25} y2={75} /><Line x1={75} y1={25} x2={75} y2={75} /></g>,
          frame: <rect key="frame" x="25" y="25" width="50" height="50" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />,
          top: <Line key="top" x1={25} y1={25} x2={75} y2={25} />,
          bottom: <Line key="bottom" x1={25} y1={75} x2={75} y2={75} />,
          left: <Line key="left" x1={25} y1={25} x2={25} y2={75} />,
          right: <Line key="right" x1={75} y1={25} x2={75} y2={75} />,
        };
        return <>{cell.lines.map(name => lineMap[name])}</>;
      }

      case 'shaded_shape': {
        const fillColor = cell.fill === 'black' ? STROKE_COLOR : cell.fill === 'gray' ? '#888' : 'none';
        let shape;
        if (cell.shape === 'circle') shape = <circle cx={50} cy={50} r={25} />;
        else if (cell.shape === 'square') shape = <rect x="25" y="25" width="50" height="50" />;
        else shape = <polygon points="50,25 71.65,62.5 28.35,62.5" />; // triangle

        const rendered = React.cloneElement(shape, {
          fill: fillColor,
          stroke: STROKE_COLOR,
          strokeWidth: STROKE_WIDTH
        });
        return cell.rotation ? rotate(cell.rotation, rendered) : rendered;
      }

      case 'endpoints': {
        // Render shapes with specific endpoint counts
        if (cell.shape === 'rhombus_open') {
          // Rhombus with 4 endpoints (open diamond)
          return <path d="M50,25 L75,50 L50,75 L25,50 Z" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />;
        }
        if (cell.shape === 'cross_diags') {
          // Cross with diagonals (4 endpoints)
          return <g><Line x1={25} y1={25} x2={75} y2={75} /><Line x1={25} y1={75} x2={75} y2={25} /></g>;
        }
        if (cell.shape === 'triangle_open') {
          // Open triangle (3 endpoints)
          return <path d="M50,25 L71.65,62.5 L28.35,62.5 Z" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />;
        }
        // Default: render based on count
        if (cell.count === 2) return <Line x1={30} y1={50} x2={70} y2={50} />;
        if (cell.count === 3) return <path d="M50,30 L70,70 L30,70" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />;
        if (cell.count === 4) return <g><Line x1={25} y1={50} x2={50} y2={25} /><Line x1={50} y1={25} x2={75} y2={50} /></g>;
        return null;
      }

      case 'reflected_shape': {
        let shapePath;
        if (cell.shape === 'U') shapePath = <path d="M25,25 L25,65 A 15 15 0 0 0 75,65 L75,25" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />;
        else if (cell.shape === 'arc') shapePath = <path d="M25,50 Q50,25 75,50" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />;
        else shapePath = <path d="M25,60 L50,25 L75,60" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />; // wedge

        const scaleX = cell.mirror_h ? -1 : 1;
        const scaleY = cell.mirror_v ? -1 : 1;
        const content = <g transform={`scale(${scaleX}, ${scaleY}) translate(${cell.mirror_h ? -100 : 0}, ${cell.mirror_v ? -100 : 0})`}>{shapePath}</g>;
        return cell.rotation ? rotate(cell.rotation, content) : content;
      }

      case 'intersection': {
        // Simple representation - show filled intersection area
        const fillColor = cell.fill === 'none' ? 'none' : STROKE_COLOR;
        // For simplicity, render appropriate intersection shape
        if (cell.shape1 === 'circle' && cell.shape2 === 'circle') {
          return <circle cx={50} cy={50} r={25} fill={fillColor} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />;
        }
        if (cell.shape1.includes('tri_bottom') && cell.shape2.includes('tri_bottom')) {
          return <polygon points="50,50 71.65,75 28.35,75" fill={fillColor} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />;
        }
        // Default: small central square
        return <rect x="37.5" y="37.5" width="25" height="25" fill={fillColor} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />;
      }

      case 'orbital_dot': {
        // Dot orbiting around center at 45° steps (0-7)
        const angle = cell.step * 45 - 90; // Start at top
        const rad = angle * Math.PI / 180;
        const cx = CX + 30 * Math.cos(rad);
        const cy = CY + 30 * Math.sin(rad);
        return <>
          <circle cx={CX} cy={CY} r={15} fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
          <circle cx={cx} cy={cy} r={6} fill={STROKE_COLOR} />
        </>;
      }

      case 'swap': {
        // Two circles (black and white) in specific arrangement
        const positions = cell.arrangement === 'horiz'
          ? [{x: 35, y: 50}, {x: 65, y: 50}]
          : cell.arrangement === 'vert'
          ? [{x: 50, y: 35}, {x: 50, y: 65}]
          : [{x: 35, y: 35}, {x: 65, y: 65}]; // diag

        const blackIdx = cell.black_pos - 1;
        return <>
          <circle cx={positions[blackIdx].x} cy={positions[blackIdx].y} r={10} fill={STROKE_COLOR} />
          <circle cx={positions[1 - blackIdx].x} cy={positions[1 - blackIdx].y} r={10} fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
        </>;
      }

      case 'sized_shape': {
        const sizes = { S: 15, M: 20, L: 25 };
        const r = sizes[cell.size];
        let shape;
        if (cell.shape === 'rhombus') shape = <rect x={CX - r} y={CY - r} width={2*r} height={2*r} transform={`rotate(45, ${CX}, ${CY})`} />;
        else if (cell.shape === 'square') shape = <rect x={CX - r} y={CY - r} width={2*r} height={2*r} />;
        else shape = <polygon points={`${CX},${CY - r} ${CX + r * 0.866},${CY + r / 2} ${CX - r * 0.866},${CY + r / 2}`} />;

        const rendered = React.cloneElement(shape, {
          fill: cell.fill === false ? 'none' : STROKE_COLOR,
          stroke: STROKE_COLOR,
          strokeWidth: STROKE_WIDTH
        });
        return cell.rotation ? rotate(cell.rotation, rendered) : rendered;
      }

      case 'subtraction': {
        // Outer shape minus inner shape
        if (cell.inner === 'none') {
          // Just render outer shape
          let shape;
          if (cell.outer === 'circle') shape = <circle cx={50} cy={50} r={25} />;
          else if (cell.outer === 'square') shape = <rect x="25" y="25" width="50" height="50" />;
          else shape = <polygon points="50,25 71.65,62.5 28.35,62.5" />;
          return React.cloneElement(shape, {
            fill: cell.fill === false ? 'none' : STROKE_COLOR,
            stroke: STROKE_COLOR,
            strokeWidth: STROKE_WIDTH
          });
        }
        // For subtraction with inner shape, show as path (simplified)
        return <circle cx={50} cy={50} r={25} fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />;
      }

      case 'sweep': {
        // Lines radiating from center
        const lines = [];
        for (let i = 0; i < cell.steps; i++) {
          const angle = (cell.rotation ?? 0) + i * 90 - 90; // Start at top
          const rad = angle * Math.PI / 180;
          const x2 = CX + 30 * Math.cos(rad);
          const y2 = CY + 30 * Math.sin(rad);
          lines.push(<Line key={i} x1={CX} y1={CY} x2={x2} y2={y2} />);
        }
        return <>{lines}</>;
      }

      case 'grid_dot': {
        // Dot in implicit grid
        const dotX = CX + cell.x * 15;
        const dotY = CY + cell.y * 15;
        return <>
          <rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" strokeWidth="1" />
          <circle cx={dotX} cy={dotY} r={6} fill={STROKE_COLOR} />
        </>;
      }

      default:
        return null;
    }
  };

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} shapeRendering="geometricPrecision">
      {showGrid && <Grid />}
      {renderContent()}
    </svg>
  );
};
