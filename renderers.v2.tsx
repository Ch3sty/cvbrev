// src/logic/renderers.v2.tsx
import React from 'react';
import type { Cell, LineName } from './types.v2'; // Importera de nya typerna

// --- Konstanter och Hjälpfunktioner ---
const SIZE = 100, CX = 50, CY = 50;
const STROKE_COLOR = '#000';
const STROKE_WIDTH = 2.5;

const rotate = (rotation: number, content: JSX.Element) => (
  <g transform={`rotate(${rotation}, ${CX}, ${CY})`}>{content}</g>
);

// --- Grundläggande Form-komponenter ---
const Line = (props: { x1: number, y1: number, x2: number, y2: number }) => (
  <line {...props} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
);

const PolygonShape: React.FC<{ sides: number, r: number, fill: boolean, rotation?: number }> = ({ sides, r, fill, rotation = 0 }) => {
  if (sides === 0) { // Cirkel
    return <circle cx={CX} cy={CY} r={r} fill={fill ? STROKE_COLOR : 'none'} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />;
  }
  if (sides === 4) { // Kvadrat
    return rotate(rotation, <rect x={CX - r} y={CY - r} width={2 * r} height={2 * r} fill={fill ? STROKE_COLOR : 'none'} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />);
  }
  
  const getPoints = (s: number) => {
    let points = '';
    for (let i = 0; i < s; i++) {
      const angle = (i * 2 * Math.PI) / s - Math.PI / 2; // Startar på toppen
      points += `${CX + r * Math.cos(angle)},${CY + r * Math.sin(angle)} `;
    }
    return points;
  };

  return rotate(rotation, <polygon points={getPoints(sides)} fill={fill ? STROKE_COLOR : 'none'} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />);
};

// --- Specifika Renderer-komponenter för v2 ---

const renderIntersections = (count: number) => {
  const lines = [
    <Line key="h1" x1={10} y1={30} x2={90} y2={30} />, <Line key="h2" x1={10} y1={50} x2={90} y2={50} />, <Line key="h3" x1={10} y1={70} x2={90} y2={70} />,
    <Line key="v1" x1={30} y1={10} x2={30} y2={90} />, <Line key="v2" x1={50} y1={10} x2={50} y2={90} />, <Line key="v3" x1={70} y1={10} x2={70} y2={90} />,
    <Line key="d1" x1={10} y1={10} x2={90} y2={90} />, <Line key="d2" x1={10} y1={90} x2={90} y2={10} />,
  ];
  switch (count) {
    case 0: return <>{lines}</>;
    case 1: return <>{lines}{lines}</>;
    case 2: return <>{lines}{lines}{lines}</>;
    case 3: return <>{lines}{lines}{lines}</>;
    case 4: return <>{lines}{lines}{lines}{lines}</>;
    case 5: return <>{lines}{lines}{lines}{lines}</>;
    case 6: return <>{lines}{lines}{lines}{lines}{lines}</>;
    case 7: return <>{lines}{lines}{lines}{lines}{lines}</>;
    case 8: return <>{lines}{lines}{lines}{lines}{lines}</>;
    default: return null;
  }
};

const renderLines = (lineNames: LineName[]) => {
    const lineMap: Record<LineName, JSX.Element> = {
        frame: <rect x="25" y="25" width="50" height="50" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH}/>,
        diag_down: <Line x1={25} y1={25} x2={75} y2={75} />,
        diag_up: <Line x1={25} y1={75} x2={75} y2={25} />,
        cross: <><Line x1={25} y1={50} x2={75} y2={50} /><Line x1={50} y1={25} x2={50} y2={75} /></>,
        vert: <Line x1={50} y1={25} x2={50} y2={75} />,
        horiz: <Line x1={25} y1={50} x2={75} y2={50} />,
        top: <Line x1={25} y1={25} x2={75} y2={25} />,
        bottom: <Line x1={25} y1={75} x2={75} y2={75} />,
        left: <Line x1={25} y1={25} x2={25} y2={75} />,
        right: <Line x1={75} y1={25} x2={75} y2={75} />,
    };
    return <>{lineNames.map(name => React.cloneElement(lineMap[name], {key: name}))}</>;
};

const renderGroup = (shape: 'circle' | 'square' | 'triangle', count: number, pos: 'L' | 'C' | 'R' = 'C', layout: 'vert' | 'horiz' = 'vert') => {
    const positions: {x: number, y: number}[] = [];
    const x = pos === 'L' ? 25 : pos === 'C' ? 50 : 75;
    if (count === 1) positions.push({x, y: 50});
    if (count === 2) positions.push({x, y: 35}, {x, y: 65});
    if (count === 3) positions.push({x, y: 25}, {x, y: 50}, {x, y: 75});

    const Shape = ({x, y}: {x: number, y: number}) => {
      if (shape === 'circle') return <circle cx={x} cy={y} r={10} fill={STROKE_COLOR}/>;
      if (shape === 'square') return <rect x={x-10} y={y-10} width={20} height={20} fill={STROKE_COLOR}/>;
      return <path d={`M${x} ${y-10} L${x+10} ${y+10} L${x-10} ${y+10} Z`} fill={STROKE_COLOR}/>;
    }
    return <>{positions.map((p, i) => <Shape key={i} x={p.x} y={p.y} />)}</>;
};

// --- Huvudkomponent: SvgCellV2 ---
export const SvgCellV2: React.FC<{ cell: Cell }> = ({ cell }) => {
  const content = () => {
    switch (cell.kind) {
      // Lägg till cases för dina befintliga typer här...

      case 'polygon':
        return <PolygonShape sides={cell.sides} r={cell.sides === 4 ? 20 : 25} fill={cell.fill} rotation={cell.rotation} />;
      
      case 'half_circle':
        return rotate(cell.rotation, <path d="M 50 25 A 25 25 0 0 1 50 75 Z" fill={STROKE_COLOR} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"/>);
      
      case 'pointer':
        const pointerPath = <path d="M 30 70 L 30 30 L 70 50 Z" fill={cell.fill ? STROKE_COLOR : 'none'} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"/>;
        return rotate(cell.rotation, pointerPath);
        
      case 'corner':
        const scale = `${cell.mirror_h ? -1 : 1}, ${cell.mirror_v ? -1 : 1}`;
        const cornerPath = <path d="M 25 25 L 25 75 L 75 75" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH}/>;
        return <g transform={`rotate(${cell.rotation}, 50, 50) scale(${scale}) translate(${cell.mirror_h ? -100 : 0}, ${cell.mirror_v ? -100 : 0})`}>{cornerPath}</g>;

      case 'intersections':
        return renderIntersections(cell.count);
        
      case 'containment':
        const dotPos = { x: CX + cell.position * (cell.shape === 'circle' ? 38 : 33), y: CY };
        return <>
          {cell.shape === 'circle' && <circle cx={CX} cy={CY} r={25} fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH}/>}
          {cell.shape === 'square' && <rect x={25} y={25} width={50} height={50} fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH}/>}
          {cell.shape === 'triangle' && rotate(-90, <polygon points="50,25 71.65,62.5 28.35,62.5" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"/>)}
          <circle cx={dotPos.x} cy={dotPos.y} r={8} fill={STROKE_COLOR}/>
        </>;

      case 'piece':
          const piecePaths = {
              square: { full: "M25,25 H75 V75 H25Z", top_right: "M25,25 H75 V75Z", bottom_left: "M25,25 V75 H75Z" },
              circle: { full: "M50,25 A25,25 0 1,1 49.99,25Z", top_right: "M50,25 A25,25 0 0,1 75,50 L50,50Z", bottom_left: "M50,25 L50,75 A25,25 0 0,1 25,50 L50,50Z" },
              rhombus: { full: "M20,20 L80,20 L80,80 L20,80Z", top: "M50,50 L20,20 L80,20Z", bottom: "M50,50 L20,80 L80,80Z" }
          };
          // @ts-ignore
          const d = piecePaths[cell.shape]?.[cell.piece] ?? "";
          return <path d={d} fill={STROKE_COLOR} />;

      case 'lines':
        return renderLines(cell.lines);

      case 'grid_dot':
          return <>
            <rect x="20" y="20" width="60" height="60" fill="none" stroke="#ccc" strokeWidth="1"/>
            <circle cx={50 + cell.x * 15} cy={50 + cell.y * 15} r="5" fill={STROKE_COLOR}/>
          </>;

      case 'group':
          return renderGroup(cell.shape, cell.count, cell.pos, cell.layout);

      default:
        return null;
    }
  };
  
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} shapeRendering="geometricPrecision">
      {content()}
    </svg>
  );
};