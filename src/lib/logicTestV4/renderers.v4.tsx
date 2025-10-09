import React from 'react';
import type { Cell, Question, LineName } from './types.v4';

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

const Line: React.FC<{ x1: number, y1: number, x2: number, y2: number, strokeWidth?: number }> = ({ strokeWidth = STROKE_WIDTH, ...props }) => (
  <line {...props} stroke={STROKE_COLOR} strokeWidth={strokeWidth} strokeLinecap="round" />
);

// Referensramen som ritas villkorligt
const Grid = () => (
  <rect x="20" y="20" width="60" height="60" fill="none" stroke="#ddd" strokeWidth="1"/>
);

// --- Huvudkomponent för att rendera en cell ---
export const SvgCellV4: React.FC<{ cell: Cell }> = ({ cell }) => {
  switch (cell.kind) {
    case 'dots': {
      const dots = [];
      const y = cell.pos === 'T' ? 30 : cell.pos === 'C' ? 50 : 70;
      if (cell.count === 1) dots.push(<circle key={1} cx={50} cy={y} r={8} fill={FILL_BLACK}/>);
      if (cell.count === 2) {
        dots.push(<circle key={1} cx={35} cy={y} r={8} fill={FILL_BLACK}/>, <circle key={2} cx={65} cy={y} r={8} fill={FILL_BLACK}/>);
      }
      if (cell.count === 3) {
        if (cell.layout === 'vertical') {
          dots.push(<circle key={1} cx={50} cy={30} r={8} fill={FILL_BLACK}/>, <circle key={2} cx={50} cy={50} r={8} fill={FILL_BLACK}/>, <circle key={3} cx={50} cy={70} r={8} fill={FILL_BLACK}/>);
        } else {
          dots.push(<circle key={1} cx={25} cy={y} r={8} fill={FILL_BLACK}/>, <circle key={2} cx={50} cy={y} r={8} fill={FILL_BLACK}/>, <circle key={3} cx={75} cy={y} r={8} fill={FILL_BLACK}/>);
        }
      }
      if (cell.count === 4) {
        dots.push(<circle key={1} cx={35} cy={35} r={8} fill={FILL_BLACK}/>, <circle key={2} cx={65} cy={35} r={8} fill={FILL_BLACK}/>, <circle key={3} cx={35} cy={65} r={8} fill={FILL_BLACK}/>, <circle key={4} cx={65} cy={65} r={8} fill={FILL_BLACK}/>);
      }
      if (cell.count === 5) {
        dots.push(<circle key={1} cx={35} cy={35} r={8} fill={FILL_BLACK}/>, <circle key={2} cx={65} cy={35} r={8} fill={FILL_BLACK}/>, <circle key={3} cx={35} cy={65} r={8} fill={FILL_BLACK}/>, <circle key={4} cx={65} cy={65} r={8} fill={FILL_BLACK}/>, <circle key={5} cx={50} cy={50} r={8} fill={FILL_BLACK}/>);
      }
      return <>{dots}</>;
    }
    case 'l_shape': {
      const fill = cell.fill === 'none' ? FILL_NONE : cell.fill === 'gray' ? FILL_GRAY : FILL_BLACK;
      const l_path = <path d="M 25 25 V 75 H 75" fill={fill} stroke={STROKE_COLOR} strokeWidth="3" strokeLinejoin="round"/>;
      return rotate(cell.rotation, l_path);
    }
    case 'icon': {
      let iconPath;
      const fill = cell.fill === false ? FILL_NONE : FILL_BLACK;
      const stroke = fill === FILL_NONE ? STROKE_COLOR : 'none';
      if (cell.shape === 'pacman') iconPath = <path d="M 50 25 A 25 25 0 1 1 25 50 L 50 50 Z" fill={fill} stroke={stroke} strokeWidth={STROKE_WIDTH}/>;
      if (cell.shape === 'star') iconPath = <path d="M50,20 L61.8,40.9 L85.1,42.4 L67.5,59.1 L72.2,82.3 L50,70 L27.8,82.3 L32.5,59.1 L14.9,42.4 L38.2,40.9Z" fill={fill}/>;
      if (cell.shape === 'heart') iconPath = <path d="M50,30 C40,-10 0,15 50,60 C100,15 60,-10 50,30 Z" fill={fill}/>;
      return rotate(cell.rotation ?? 0, <>{iconPath}</>);
    }
    case 'fill': {
      const shape = cell.shape === 'circle'
        ? <circle cx={50} cy={50} r={25} />
        : <rect x="25" y="25" width="50" height="50" />;
      return React.cloneElement(shape as React.ReactElement<any>, { fill: cell.fill ? STROKE_COLOR : 'none', stroke: STROKE_COLOR, strokeWidth: STROKE_WIDTH });
    }
    case 'corner_dot': {
      if (!cell.pos) return null;
      const posMap = { TL: {cx:25, cy:25}, TR: {cx:75, cy:25}, BR: {cx:75, cy:75}, BL: {cx:25, cy:75} };
      return <circle {...posMap[cell.pos]} r={8} fill={FILL_BLACK} />;
    }
    case 'lines': {
        const lineMap: Record<LineName, React.ReactElement | React.ReactElement[]> = {
            frame: <rect x="25" y="25" width="50" height="50" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH}/>,
            diag_down: <Line x1={25} y1={25} x2={75} y2={75} />,
            diag_up: <Line x1={25} y1={75} x2={75} y2={25} />,
            cross: [<Line key="h" x1={25} y1={50} x2={75} y2={50} />,<Line key="v" x1={50} y1={25} x2={50} y2={75} />],
            vert: <Line x1={50} y1={25} x2={50} y2={75} />,
            horiz: <Line x1={25} y1={50} x2={75} y2={50} />,
            frame_h: [<Line key="t" x1={25} y1={25} x2={75} y2={25} />, <Line key="b" x1={25} y1={75} x2={75} y2={75} />],
            frame_v: [<Line key="l" x1={25} y1={25} x2={25} y2={75} />, <Line key="r" x1={75} y1={25} x2={75} y2={75} />],
        };
        if (!cell.lines || cell.lines.length === 0) return null;
        return <>{cell.lines.map((name, index) => {
          const element = lineMap[name];
          if (Array.isArray(element)) {
            return <React.Fragment key={index}>{element}</React.Fragment>;
          }
          return React.cloneElement(element as React.ReactElement<any>, {key: index});
        })}</>;
    }
    case 'shaded_shape': {
        const fill = cell.fill === 'none' ? FILL_NONE : cell.fill === 'gray' ? FILL_GRAY : FILL_BLACK;
        let shape: React.ReactElement;
        if (cell.shape === 'circle') shape = <circle cx="50" cy="50" r={25} />;
        else if (cell.shape === 'square') shape = <rect x="25" y="25" width="50" height="50" />;
        else shape = <path d="M50 20 L80 75 L20 75 Z" strokeLinejoin="round" />;
        return rotate(cell.rotation ?? 0, React.cloneElement(shape as React.ReactElement<any>, { fill, stroke: STROKE_COLOR, strokeWidth: STROKE_WIDTH }));
    }
    case 'endpoints': {
        const shapes: Record<string, React.ReactElement> = {
            line: <Line x1={25} y1={50} x2={75} y2={50} />,
            U: <path d="M 25 75 V 25 H 75" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH}/>,
            E: <path d="M 75 25 H 25 V 75 H 75 M 25 50 H 75" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH}/>,
            v_line: <Line x1={50} y1={25} x2={50} y2={75} />,
            T: <path d="M 25 25 H 75 M 50 25 V 75" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH}/>,
            X: <path d="M 25 25 L 75 75 M 25 75 L 75 25" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH}/>,
            diag: <Line x1={25} y1={25} x2={75} y2={75} />,
            Y: <path d="M 50 50 V 75 M 50 50 L 25 25 M 50 50 L 75 25" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH}/>,
            rhombus_open: <path d="M 50 25 L 25 50 L 50 75 L 75 50" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH}/>,
            square_closed: <rect x="25" y="25" width="50" height="50" fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
        };
        return shapes[cell.shape ?? ''] || null;
    }
    case 'hook':
    case 'arc':
    case 'wedge': {
      let path;
      const props = { fill: "none" as const, stroke: STROKE_COLOR, strokeWidth: "3", strokeLinejoin: "round" as const };
      if (cell.kind === 'hook') path = <path d="M 25 75 V 25 H 75" {...props} />;
      if (cell.kind === 'arc') path = <path d="M 50 25 A 25 25 0 0 1 75 50" {...props} />;
      if (cell.kind === 'wedge') path = <path d="M 25 25 L 75 25 L 75 50" {...props} />;

      // Support both horizontal and vertical mirroring
      const scaleX = cell.mirror_h ? -1 : 1;
      const scaleY = cell.mirror_v ? -1 : 1;
      const content = <g transform={`translate(${CX}, ${CY}) scale(${scaleX}, ${scaleY}) translate(${-CX}, ${-CY})`}>{path}</g>;

      // Apply rotation if specified
      return cell.rotation ? rotate(cell.rotation, content) : content;
    }
    case 'intersection': {
        const shapes: Record<string, string> = {
            rect_full: "M25,25 H75 V75 H25Z",
            circle: "M50,25 A25,25 0 1,1 49.99,25Z",
            rect_top: "M25,25 H75 V50 H25Z",
            rect_left: "M25,25 H50 V75 H25Z",
            rect_top_left: "M25,25 H50 V50 H25Z",
            rect_diag: "M25,25 L75,75 V25 H25Z",
            tri_bottom: "M50,50 L20,80 H80Z",
            segment: "M50,25 A25,25 0,0,1,75,50 V75 H25 V50 A25,25 0,0,1,50,25Z",
        };
        const fill = cell.fill === 'none' ? FILL_NONE : FILL_BLACK;
        return <path d={shapes[cell.shape1]} fill={fill} />;
    }
    case 'orbital_dot': {
        const angle = cell.step * -45; // Moturs
        const rad = angle * Math.PI / 180;
        const orbitRadius = 30;
        const cx = CX + orbitRadius * Math.cos(rad);
        const cy = CY + orbitRadius * Math.sin(rad);
        return <><circle cx={50} cy={50} r={15} fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH}/><circle cx={cx} cy={cy} r={6} fill={FILL_BLACK}/></>;
    }
    case 'swap': {
        const pos1 = { diag: {x:35, y:35}, vert: {x:50, y:30}, horiz: {x:30, y:50} }[cell.arrangement];
        const pos2 = { diag: {x:65, y:65}, vert: {x:50, y:70}, horiz: {x:70, y:50} }[cell.arrangement];
        const blackPos = cell.black_pos === 1 ? pos1 : pos2;
        const whitePos = cell.black_pos === 1 ? pos2 : pos1;
        return <>
            <circle cx={blackPos.x} cy={blackPos.y} r={12} fill={FILL_BLACK} />
            <circle cx={whitePos.x} cy={whitePos.y} r={12} fill="none" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
        </>;
    }
    case 'sized_shape': {
        const sizeMap = { S: 10, M: 20, L: 30 };
        const s = sizeMap[cell.size];
        let shape: React.ReactElement;
        if (cell.shape === 'rhombus') shape = <path d={`M${CX} ${CY-s} L${CX+s} ${CY} L${CX} ${CY+s} L${CX-s} ${CY} Z`} />;
        else if (cell.shape === 'square') shape = <rect x={CX-s/2} y={CY-s/2} width={s} height={s} />;
        else shape = <path d={`M${CX} ${CY - s*0.8} L${CX+s} ${CY+s*0.8} L${CX-s} ${CY+s*0.8} Z`} />;

        const fill = cell.fill === false ? 'none' : FILL_BLACK;
        return rotate(cell.rotation ?? 0, React.cloneElement(shape as React.ReactElement<any>, { fill, stroke: fill === 'none' ? STROKE_COLOR : 'none', strokeWidth: STROKE_WIDTH }));
    }
    case 'subtraction': {
        const outer = cell.outer === 'square' ? 'M25,25 H75 V75 H25Z' : cell.outer === 'circle' ? 'M50,25 A25,25 0 1,1 49.99,25Z' : 'M50 20 L80 80 L20 80 Z';
        let inner = '';
        if (cell.inner === 'circle') inner = 'M50,60 A10,10 0 1,0 49.99,60Z';
        if (cell.inner === 'square') inner = 'M40,40 H60 V60 H40Z';
        return <path d={`${outer} ${inner}`} fill={cell.fill === false ? 'none' : STROKE_COLOR} stroke={cell.fill === false ? STROKE_COLOR : 'none'} fillRule="evenodd" />;
    }
    case 'sudoku': {
        let shapePath: React.ReactElement;
        if (cell.shape === 'arrow') shapePath = <path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" />;
        else if (cell.shape === 'plus') shapePath = <path d="M 40 20 H 60 V 40 H 80 V 60 H 60 V 80 H 40 V 60 H 20 V 40 H 40 Z" />;
        else shapePath = <path d="M 50,25 A 25 25 0 1 0 50,75 A 20 20 0 1 1 50,25 Z" />;

        const fill = cell.fill === 'none' ? FILL_NONE : cell.fill === 'gray' ? FILL_GRAY : FILL_BLACK;
        const stroke = fill === FILL_NONE ? STROKE_COLOR : 'none';
        return rotate(cell.rotation ?? 0, React.cloneElement(shapePath as React.ReactElement<any>, { fill, stroke, strokeWidth: STROKE_WIDTH }));
    }
    case 'sweep': {
        const lines = [];
        const angles = [270, 0, 90, 180]; // Up, Right, Down, Left
        for (let i = 0; i < cell.steps; i++) {
            const angleRad = angles[i] * Math.PI / 180;
            lines.push(<Line key={i} x1={CX} y1={CY} x2={CX + 35 * Math.cos(angleRad)} y2={CY + 35 * Math.sin(angleRad)} />);
        }
        return rotate(cell.rotation ?? 0, <>{lines}</>);
    }
    default: return null;
  }
};

// --- Fullständig Exempelkomponent ---
export const MatrixQuestionComponentV4: React.FC<{ 
  question: Question,
  selected: number | null,
  onSelect: (index: number) => void
}> = ({ question, selected, onSelect }) => {
  
  const renderCellWithGrid = (cell: Cell | null) => (
    <svg viewBox="0 0 100 100" width="100" height="100" shapeRendering="geometricPrecision">
      {question.showGrid && <Grid />}
      {cell && <SvgCellV4 cell={cell} />}
    </svg>
  );

  const styles = {
    questionContainer: {
      fontFamily: 'sans-serif',
    },
    matrixGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
      maxWidth: '360px',
      margin: '20px 0',
    },
    cell: {
      border: '1px solid #ddd',
      borderRadius: '8px',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '110px',
      height: '110px',
      position: 'relative' as const,
    },
    missing: {
      fontSize: '48px',
      color: '#aaa',
    },
    answerButton: {
      border: '1px solid #ddd',
      borderRadius: '8px',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '110px',
      height: '110px',
      position: 'relative' as const,
      flexDirection: 'column' as const,
      padding: '4px',
      cursor: 'pointer',
    },
    answerButtonSelected: {
      borderColor: '#4f46e5',
      borderWidth: '2px',
    },
    answerLabel: {
      fontSize: '12px',
      fontWeight: 'bold' as const,
      color: '#555',
      height: '16px',
    },
  };

  return (
    <div style={styles.questionContainer}>
      <div style={styles.matrixGrid}>
        {question.grid.flat().map((cell, i) => (
          <div style={styles.cell} key={`grid-${i}`}>
            {cell ? renderCellWithGrid(cell) : <div style={styles.missing}>?</div>}
          </div>
        ))}
      </div>

      <div style={styles.matrixGrid} role="radiogroup">
        {question.options.map((option, i) => (
          <button
            key={`option-${i}`}
            style={{...styles.answerButton, ...(selected === i ? styles.answerButtonSelected : {})}}
            onClick={() => onSelect(i)}
            role="radio"
            aria-checked={selected === i}
            aria-label={`Svarsalternativ ${String.fromCharCode(65 + i)}`}
          >
            <div style={styles.answerLabel}>{String.fromCharCode(65 + i)}</div>
            {renderCellWithGrid(option)}
          </button>
        ))}
      </div>
    </div>
  );
};