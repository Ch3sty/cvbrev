// src/lib/logicTestV6/renderers.v6.tsx
import React from 'react';
import type { Cell, Question, LineName, CompositionItem } from './types.v6';

// --- Konstanter och Hjälpfunktioner ---
const SIZE = 100, CX = 50, CY = 50;
const STROKE_COLOR = '#000';
const FILL_BLACK = '#000';
const FILL_GRAY = '#808080';
const FILL_NONE = 'none';
const FILL_WHITE = '#fff';
const STROKE_WIDTH = 2.5;

const rotate = (rotation: number, content: React.ReactElement) => (
  <g transform={`rotate(${rotation}, ${CX}, ${CY})`}>{content}</g>
);

const Line: React.FC<{ x1: number, y1: number, x2: number, y2: number, stroke?: string, strokeWidth?: number }> = ({ stroke = STROKE_COLOR, strokeWidth = STROKE_WIDTH, ...props }) => (
  <line {...props} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
);

// Referensramen som ritas villkorligt
const Grid = () => (
  <rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" strokeWidth="1"/>
);

// --- Huvudkomponent för att rendera en cell ---
export const SvgCellV6: React.FC<{ cell: Cell }> = ({ cell }) => {
  switch (cell.kind) {
    case 'arrow': {
      const fill = cell.fill ? FILL_BLACK : FILL_NONE;
      const stroke = cell.fill ? FILL_NONE : STROKE_COLOR;
      const path = <path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill={fill} stroke={stroke} strokeWidth={STROKE_WIDTH} />;
      return rotate(cell.rotation, path);
    }
    case 'multi_shape': {
      let path;
      const size = 25;
      const posMap = { TL: { x: 25, y: 25 }, C: { x: 40, y: 40 }, BR: { x: 55, y: 55 } };
      const { x, y } = posMap[cell.pos];
      
      if (cell.shape === 'L') path = <path d={`M ${x} ${y} V ${y + size} H ${y + size}`} />;
      if (cell.shape === 'T') path = <path d={`M ${x} ${y + size/2} H ${x + size} M ${x + size/2} ${y} V ${y + size}`} />;
      if (cell.shape === 'Z') path = <path d={`M ${x} ${y} H ${x + size} L ${x} ${y + size} H ${x + size}`} />;
      
      const elem = React.cloneElement(path as React.ReactElement, { fill: "none", stroke: STROKE_COLOR, strokeWidth: 3 });
      return rotate(cell.rotation ?? 0, elem);
    }
    case 'composition': {
      const items: Record<CompositionItem, React.ReactElement> = {
        dot_tl: <circle cx="35" cy="35" r="12" fill={FILL_BLACK} />,
        dot_br: <circle cx="65" cy="65" r="12" fill={FILL_BLACK} />,
        square_tl: <rect x="25" y="25" width="20" height="20" fill={FILL_BLACK} />,
        square_br: <rect x="55" y="55" width="20" height="20" fill={FILL_BLACK} />,
        square_tr: <rect x="55" y="25" width="20" height="20" fill={FILL_BLACK} />,
        square_bl: <rect x="25" y="55" width="20" height="20" fill={FILL_BLACK} />,
        tri_t: <path d="M50 25 L60 45 L40 45 Z" fill={FILL_BLACK} />,
        tri_b: <path d="M50 75 L60 55 L40 55 Z" fill={FILL_BLACK} />,
      };
      return <>{cell.items.map((item, i) => React.cloneElement(items[item], { key: i }))}</>;
    }
    case 'analogy': {
      let shape;
      const fill = cell.fill === false ? FILL_NONE : FILL_BLACK;
      const stroke = fill === FILL_NONE ? STROKE_COLOR : 'none';

      if (cell.shape === 'triangle') shape = <path d="M 25 25 L 75 25 L 50 75 Z" fill={fill} stroke={stroke} strokeWidth={STROKE_WIDTH} />;
      if (cell.shape === 'l_shape') shape = <path d="M 25 25 V 75 H 75" fill={fill} stroke={stroke} strokeWidth={3} />;
      if (cell.shape === 'pacman') shape = <path d="M 50 25 A 25 25 0 1 1 25 50 L 50 50 Z" fill={fill} stroke={stroke} strokeWidth={STROKE_WIDTH} />;
      
      return <>
        {rotate(cell.rotation ?? 0, shape as React.ReactElement)}
        {cell.dot && <circle cx={50} cy={50} r="5" fill={FILL_BLACK}/>}
      </>;
    }
    case 'lines': {
        const lineMap: Record<LineName, React.ReactElement | React.ReactElement[]> = {
            frame: <rect x="25" y="25" width="50" height="50" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH}/>,
            diag_down: <Line x1={25} y1={25} x2={75} y2={75} />,
            diag_up: <Line x1={25} y1={75} x2={75} y2={25} />,
            cross: [<Line key="h" x1={25} y1={50} x2={75} y2={50} />,<Line key="v" x1={50} y1={25} x2={50} y2={75} />],
            vert: <Line x1={50} y1={25} x2={50} y2={75} />,
            horiz: <Line x1={25} y1={50} x2={75} y2={50} />,
            top: <Line x1={25} y1={25} x2={75} y2={25} />,
            bottom: <Line x1={25} y1={75} x2={75} y2={75} />,
        };
        return <>{cell.lines.map(name => React.cloneElement(lineMap[name] as React.ReactElement, {key: name}))}</>;
    }
    case 'l_shape':
    case 'pointer': {
      let path;
      const fill = cell.fill ? FILL_BLACK : FILL_NONE;
      const stroke = cell.fill ? 'none' : STROKE_COLOR;
      if (cell.kind === 'l_shape') path = <path d="M 25 25 V 75 H 75" fill={fill} stroke={stroke} strokeWidth={3} />;
      if (cell.kind === 'pointer') path = <path d="M 30 70 L 30 30 L 70 50 Z" fill={fill} stroke={stroke} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"/>;

      const transform = `rotate(${cell.rotation} ${CX} ${CY}) translate(${CX} ${CY}) scale(1, ${cell.mirror_v ? -1 : 1}) translate(${-CX} ${-CY})`;
      return <g transform={transform}>{path}</g>;
    }
    case 'count_areas': {
        const shapes: Record<string, React.ReactElement> = {
            X: <path d="M 25 25 L 75 75 M 25 75 L 75 25" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH}/>,
            square: <rect x="25" y="25" width="50" height="50" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH}/>,
            divided_circle: <><circle cx="50" cy="50" r="25" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH}/><Line x1={25} y1={50} x2={75} y2={50}/></>,
            star_of_david: <><path d="M50 20 L80 75 L20 75 Z" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH}/><path d="M50 80 L20 25 L80 25 Z" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH}/></>,
            double_ring: <><circle cx="50" cy="50" r="25" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH}/><circle cx="50" cy="50" r="15" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH}/></>,
            hourglass: <><path d="M 25 25 L 75 25 L 25 75 L 75 75 Z" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH}/></>,
            four_squares: <><rect x="25" y="25" width="50" height="50" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH}/><Line x1={25} y1={50} x2={75} y2={50}/><Line x1={50} y1={25} x2={50} y2={75}/></>,
            overlapping_rings: <><circle cx="40" cy="50" r="20" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH}/><circle cx="60" cy="50" r="20" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH}/></>,
            grid: <path d="M 25 25 H 75 V 75 H 25 Z M 25 50 H 75 M 50 25 V 75" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH}/>
        };
        const dots = [];
        if (cell.dots === 1) dots.push(<circle cx="50" cy="50" r="8" fill={FILL_BLACK}/>);
        if (cell.dots === 2) dots.push(<circle cx="37.5" cy="50" r="8" fill={FILL_BLACK}/>, <circle cx="62.5" cy="50" r="8" fill={FILL_BLACK}/>);
        if (cell.dots === 4) dots.push(<circle cx="37.5" cy="37.5" r="5" fill={FILL_BLACK}/>, <circle cx="62.5" cy="37.5" r="5" fill={FILL_BLACK}/>, <circle cx="37.5" cy="62.5" r="5" fill={FILL_BLACK}/>, <circle cx="62.5" cy="62.5" r="5" fill={FILL_BLACK}/>);

        return <>{shapes[cell.shape]}{dots}</>;
    }
    case 'subtraction_inv': {
        let base, line;
        if (cell.base === 'square') base = <rect x="25" y="25" width="50" height="50" fill={FILL_BLACK}/>;
        if (cell.base === 'circle') base = <circle cx="50" cy="50" r="25" fill={FILL_BLACK}/>;
        if (cell.base === 'triangle') base = <path d="M50 20 L80 80 L20 80 Z" fill={FILL_BLACK}/>;
        
        if (cell.line === 'diag_down') line = <Line x1={25} y1={25} x2={75} y2={75} stroke={base ? FILL_WHITE : STROKE_COLOR} />;
        if (cell.line === 'horiz') line = <Line x1={25} y1={50} x2={75} y2={50} stroke={base ? FILL_WHITE : STROKE_COLOR} />;
        if (cell.line === 'vert') line = <Line x1={50} y1={20} x2={50} y2={80} stroke={base ? FILL_WHITE : STROKE_COLOR} />;
        
        return <>{base}{line}</>;
    }
    case 'shaded_shape': {
        let shape: React.ReactElement;
        const fill = cell.fill === 'none' ? FILL_NONE :
                     cell.fill === 'gray' ? FILL_GRAY : FILL_BLACK;
        const stroke = fill === FILL_NONE ? STROKE_COLOR : 'none';

        if (cell.shape === 'circle') {
          shape = <circle cx="50" cy="50" r="25" fill={fill} stroke={stroke} strokeWidth={STROKE_WIDTH} />;
        } else if (cell.shape === 'square') {
          shape = <rect x="25" y="25" width="50" height="50" fill={fill} stroke={stroke} strokeWidth={STROKE_WIDTH} />;
        } else { // triangle
          shape = <path d="M50 20 L80 80 L20 80 Z" fill={fill} stroke={stroke} strokeWidth={STROKE_WIDTH} />;
        }

        return rotate(cell.rotation ?? 0, shape);
    }
    case 'sudoku': {
        let shapePath;
        if (cell.shape === 'arrow') shapePath = <path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" />;
        if (cell.shape === 'plus') shapePath = <path d="M 40 20 H 60 V 40 H 80 V 60 H 60 V 80 H 40 V 60 H 20 V 40 H 40 Z" />;
        if (cell.shape === 'moon') shapePath = <path d="M 50,25 A 25 25 0 1 0 50,75 A 20 20 0 1 1 50,25 Z" />;

        const fill = cell.fill === 'none' ? FILL_NONE : cell.fill === 'gray' ? FILL_GRAY : FILL_BLACK;
        const stroke = fill === FILL_NONE ? STROKE_COLOR : 'none';
        return rotate(cell.rotation ?? 0, React.cloneElement(shapePath as React.ReactElement, { fill, stroke, strokeWidth: STROKE_WIDTH }));
    }
    case 'dots': {
        const dots = [];
        const y = cell.pos === 'T' ? 30 : cell.pos === 'C' ? 50 : 70;

        if (cell.count === 1) {
          dots.push(<circle key={1} cx={50} cy={y} r={8} fill={FILL_BLACK}/>);
        }
        if (cell.count === 2) {
          dots.push(<circle key={1} cx={35} cy={y} r={8} fill={FILL_BLACK}/>,
                    <circle key={2} cx={65} cy={y} r={8} fill={FILL_BLACK}/>);
        }
        if (cell.count === 3) {
          if (cell.layout === 'vertical') {
            dots.push(<circle key={1} cx={50} cy={30} r={8} fill={FILL_BLACK}/>,
                      <circle key={2} cx={50} cy={50} r={8} fill={FILL_BLACK}/>,
                      <circle key={3} cx={50} cy={70} r={8} fill={FILL_BLACK}/>);
          } else {
            dots.push(<circle key={1} cx={25} cy={y} r={8} fill={FILL_BLACK}/>,
                      <circle key={2} cx={50} cy={y} r={8} fill={FILL_BLACK}/>,
                      <circle key={3} cx={75} cy={y} r={8} fill={FILL_BLACK}/>);
          }
        }
        if (cell.count === 4) {
          dots.push(<circle key={1} cx={35} cy={35} r={8} fill={FILL_BLACK}/>,
                    <circle key={2} cx={65} cy={35} r={8} fill={FILL_BLACK}/>,
                    <circle key={3} cx={35} cy={65} r={8} fill={FILL_BLACK}/>,
                    <circle key={4} cx={65} cy={65} r={8} fill={FILL_BLACK}/>);
        }
        if (cell.count === 5) {
          dots.push(<circle key={1} cx={35} cy={35} r={8} fill={FILL_BLACK}/>,
                    <circle key={2} cx={65} cy={35} r={8} fill={FILL_BLACK}/>,
                    <circle key={3} cx={35} cy={65} r={8} fill={FILL_BLACK}/>,
                    <circle key={4} cx={65} cy={65} r={8} fill={FILL_BLACK}/>,
                    <circle key={5} cx={50} cy={50} r={8} fill={FILL_BLACK}/>);
        }
        return <>{dots}</>;
    }
    case 'three_vars': {
        let shape;
        if (cell.shape === 'arrow') shape = <path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill={FILL_BLACK} />;
        if (cell.shape === 'T') shape = <path d="M 25 50 L 75 50 M 50 25 L 50 75" fill="none" stroke={STROKE_COLOR} strokeWidth={3}/>;
        if (cell.shape === 'L') shape = <path d="M 25 25 V 75 H 75" fill="none" stroke={STROKE_COLOR} strokeWidth={3}/>;

        const posMap = { TL: { x: -15, y: -15 }, C: { x: 0, y: 0 }, BR: { x: 15, y: 15 } };
        const translate = `translate(${posMap[cell.pos].x}, ${posMap[cell.pos].y})`;

        return <g transform={translate}>{rotate(cell.rotation, shape as React.ReactElement)}</g>;
    }
    default: return null;
  }
};

// --- Fullständig Exempelkomponent ---
export const MatrixQuestionComponentV6: React.FC<{ 
  question: Question,
  selected: number | null,
  onSelect: (index: number) => void
}> = ({ question, selected, onSelect }) => {
  
  const renderCellWithGrid = (cell: Cell | null) => (
    <svg viewBox="0 0 100 100" width="100" height="100" shapeRendering="geometricPrecision">
      {question.showGrid && <Grid />}
      {cell && <SvgCellV6 cell={cell} />}
    </svg>
  );

  return (
    <div className="question-container">
      <div className="matrix-grid">
        {question.grid.flat().map((cell, i) => (
          <div className="cell" key={`grid-${i}`}>
            {cell ? renderCellWithGrid(cell) : <div className="missing">?</div>}
          </div>
        ))}
      </div>

      <div className="answers-grid" role="radiogroup">
        {["A", "B", "C", "D", "E", "F"].map((label, i) => (
          <button 
            key={`option-${i}`}
            className={`answer-button ${selected === i ? 'selected' : ''}`}
            onClick={() => onSelect(i)}
            role="radio"
            aria-checked={selected === i}
            aria-label={`Svarsalternativ ${label}`}
          >
            <div className="answer-label">{label}</div>
            {renderCellWithGrid(question.options[i])}
          </button>
        ))}
      </div>

      <style jsx>{`
        .question-container { font-family: sans-serif; }
        .matrix-grid, .answers-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; max-width: 360px; margin: 20px 0; }
        .cell, .answer-button { border: 1px solid #ddd; border-radius: 8px; background: #fff; display: flex; align-items: center; justify-content: center; width: 110px; height: 110px; position: relative; }
        .missing { font-size: 48px; color: #aaa; font-weight: bold; }
        .answer-button { flex-direction: column; padding: 4px; cursor: pointer; background: #f9fafb; }
        .answer-button:hover { border-color: #aaa; }
        .answer-button.selected { border-color: #4f46e5; border-width: 2px; background: #eef2ff; }
        .answer-label { font-size: 12px; font-weight: bold; color: #555; height: 16px; }
      `}</style>
    </div>
  );
};