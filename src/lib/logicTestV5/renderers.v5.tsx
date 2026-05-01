import React from 'react';
import type {
  V5Cell,
  Fill,
  LineSegment,
} from './types.v5';

// =============================================================================
// PREMIUM SVG-RENDERARE för matrislogik-grund
// =============================================================================
// Designprinciper:
// - viewBox 0..100, alla former i [20, 80] (60×60 inre yta)
// - Konsekvent stroke (#0F172A, slate-900) och fyllning
// - Round-linjer för mjukhet
// - Inga inre referensramar
// =============================================================================

const STROKE = '#0F172A';
const FILL_BLACK = '#0F172A';
const FILL_GRAY = '#94A3B8';
const FILL_NONE = 'transparent';
const STROKE_WIDTH = 4;

const fillFor = (f: Fill): string =>
  f === 'black' ? FILL_BLACK : f === 'gray' ? FILL_GRAY : FILL_NONE;

// När fyllning saknas → tjock svart kontur. När fyllning finns → ingen kontur.
const strokeFor = (f: Fill): string =>
  f === 'none' ? STROKE : 'none';

// Center
const CX = 50;
const CY = 50;

// =============================================================================
// HUVUDRENDERARE
// =============================================================================

export const SvgCellV5: React.FC<{ cell: V5Cell }> = ({ cell }) => {
  switch (cell.kind) {
    case 'dots':
      return <DotsRenderer cell={cell} />;
    case 'shape':
      return <ShapeRenderer cell={cell} />;
    case 'arrow':
      return <ArrowRenderer cell={cell} />;
    case 'lines':
      return <LinesRenderer cell={cell} />;
    case 'rotation':
      return <RotationRenderer cell={cell} />;
    case 'corner_dot':
      return <CornerDotRenderer cell={cell} />;
    case 'composite':
      return <CompositeRenderer cell={cell} />;
  }
};

// =============================================================================
// DOTS — prickar i olika antal och arrangemang
// =============================================================================

const DotsRenderer: React.FC<{ cell: Extract<V5Cell, { kind: 'dots' }> }> = ({ cell }) => {
  const r = 7;
  const arrangement = cell.arrangement ?? 'row';
  const positions = getDotPositions(cell.count, arrangement);

  return (
    <>
      {positions.map((pos, i) => (
        <circle key={i} cx={pos.x} cy={pos.y} r={r} fill={FILL_BLACK} />
      ))}
    </>
  );
};

function getDotPositions(
  count: number,
  arrangement: 'row' | 'col' | 'square' | 'triangle'
): Array<{ x: number; y: number }> {
  if (arrangement === 'col') {
    if (count === 1) return [{ x: 50, y: 50 }];
    if (count === 2) return [{ x: 50, y: 35 }, { x: 50, y: 65 }];
    if (count === 3) return [{ x: 50, y: 28 }, { x: 50, y: 50 }, { x: 50, y: 72 }];
    if (count === 4) return [{ x: 50, y: 25 }, { x: 50, y: 42 }, { x: 50, y: 58 }, { x: 50, y: 75 }];
  }
  if (arrangement === 'square') {
    if (count === 4) return [{ x: 35, y: 35 }, { x: 65, y: 35 }, { x: 35, y: 65 }, { x: 65, y: 65 }];
  }
  if (arrangement === 'triangle') {
    if (count === 3) return [{ x: 50, y: 30 }, { x: 32, y: 65 }, { x: 68, y: 65 }];
  }
  // Default: row
  if (count === 1) return [{ x: 50, y: 50 }];
  if (count === 2) return [{ x: 35, y: 50 }, { x: 65, y: 50 }];
  if (count === 3) return [{ x: 28, y: 50 }, { x: 50, y: 50 }, { x: 72, y: 50 }];
  if (count === 4) return [{ x: 22, y: 50 }, { x: 41, y: 50 }, { x: 59, y: 50 }, { x: 78, y: 50 }];
  return [];
}

// =============================================================================
// SHAPE — cirkel, kvadrat, triangel, diamond med fyllning
// =============================================================================

const ShapeRenderer: React.FC<{ cell: Extract<V5Cell, { kind: 'shape' }> }> = ({ cell }) => {
  const size = cell.size ?? 'lg';
  const sizeMap = { sm: 12, md: 18, lg: 24 };
  const r = sizeMap[size];

  const fill = fillFor(cell.fill);
  const stroke = cell.fill === 'none' ? STROKE : 'none';
  const sw = STROKE_WIDTH;

  if (cell.shape === 'circle') {
    return <circle cx={CX} cy={CY} r={r} fill={fill} stroke={stroke} strokeWidth={sw} />;
  }
  if (cell.shape === 'square') {
    return (
      <rect
        x={CX - r}
        y={CY - r}
        width={r * 2}
        height={r * 2}
        rx={2}
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    );
  }
  if (cell.shape === 'triangle') {
    // Equilateral, baseras på r
    const h = r * 1.732;
    const cy = CY + h / 4;
    return (
      <path
        d={`M ${CX} ${cy - h * 0.75} L ${CX + r} ${cy + h * 0.25} L ${CX - r} ${cy + h * 0.25} Z`}
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    );
  }
  if (cell.shape === 'diamond') {
    return (
      <path
        d={`M ${CX} ${CY - r} L ${CX + r} ${CY} L ${CX} ${CY + r} L ${CX - r} ${CY} Z`}
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    );
  }
  return null;
};

// =============================================================================
// ARROW — pilar i fyra riktningar
// =============================================================================

const ArrowRenderer: React.FC<{ cell: Extract<V5Cell, { kind: 'arrow' }> }> = ({ cell }) => {
  const fill = cell.fill === 'black' ? FILL_BLACK : FILL_NONE;
  const stroke = cell.fill === 'black' ? 'none' : STROKE;
  const angles = { up: 0, right: 90, down: 180, left: 270 };
  const angle = angles[cell.direction];

  // Bas-pil pekar uppåt: spets i (50, 22), bas i (50, 78), vingar
  // Tjock pil-form
  const path = 'M 50 22 L 70 50 L 60 50 L 60 78 L 40 78 L 40 50 L 30 50 Z';

  return (
    <g transform={`rotate(${angle}, ${CX}, ${CY})`}>
      <path
        d={path}
        fill={fill}
        stroke={stroke}
        strokeWidth={STROKE_WIDTH}
        strokeLinejoin="round"
      />
    </g>
  );
};

// =============================================================================
// LINES — kant-segment och diagonaler
// =============================================================================

const LinesRenderer: React.FC<{ cell: Extract<V5Cell, { kind: 'lines' }> }> = ({ cell }) => {
  const lineProps = {
    stroke: STROKE,
    strokeWidth: STROKE_WIDTH,
    strokeLinecap: 'round' as const,
  };

  const segmentMap: Record<LineSegment, React.ReactElement> = {
    top: <line x1={20} y1={20} x2={80} y2={20} {...lineProps} />,
    right: <line x1={80} y1={20} x2={80} y2={80} {...lineProps} />,
    bottom: <line x1={20} y1={80} x2={80} y2={80} {...lineProps} />,
    left: <line x1={20} y1={20} x2={20} y2={80} {...lineProps} />,
    diag_down: <line x1={20} y1={20} x2={80} y2={80} {...lineProps} />,
    diag_up: <line x1={20} y1={80} x2={80} y2={20} {...lineProps} />,
    horiz_mid: <line x1={20} y1={50} x2={80} y2={50} {...lineProps} />,
    vert_mid: <line x1={50} y1={20} x2={50} y2={80} {...lineProps} />,
  };

  return (
    <>
      {cell.segments.map((seg, i) => (
        <React.Fragment key={i}>
          {React.cloneElement(segmentMap[seg], { key: seg })}
        </React.Fragment>
      ))}
    </>
  );
};

// =============================================================================
// ROTATION — L/T/F-formade figurer som roteras 0/90/180/270
// =============================================================================

const RotationRenderer: React.FC<{ cell: Extract<V5Cell, { kind: 'rotation' }> }> = ({ cell }) => {
  const fill = fillFor(cell.fill);
  const stroke = cell.fill === 'none' ? STROKE : STROKE; // Alltid stroke för rotation-former
  const sw = STROKE_WIDTH;

  // L-form: en armar uppåt och en till höger
  // T-form: stammen och tvärslaget
  // F-form: stammen och två tvärslag
  let path = '';
  if (cell.shape === 'L') {
    // L: vertikal arm (vänster) + horisontell arm (botten)
    path = 'M 28 22 L 28 72 L 72 72';
  } else if (cell.shape === 'T') {
    // T: horisontell topp + vertikal stam
    path = 'M 22 28 L 78 28 M 50 28 L 50 78';
  } else if (cell.shape === 'F') {
    // F: vertikal stam + två horisontella armar
    path = 'M 28 22 L 28 78 M 28 22 L 72 22 M 28 50 L 60 50';
  }

  return (
    <g transform={`rotate(${cell.angle}, ${CX}, ${CY})`}>
      <path
        d={path}
        fill={cell.fill === 'none' ? 'none' : fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
};

// =============================================================================
// CORNER_DOT — prick i ett av cellens fyra hörn
// =============================================================================

const CornerDotRenderer: React.FC<{ cell: Extract<V5Cell, { kind: 'corner_dot' }> }> = ({ cell }) => {
  const positions = {
    TL: { x: 28, y: 28 },
    TR: { x: 72, y: 28 },
    BR: { x: 72, y: 72 },
    BL: { x: 28, y: 72 },
  };
  const pos = positions[cell.pos];
  return (
    <>
      {/* Subtil cellram (bara streckad konturram för att hörnpositioner ska vara läsbara) */}
      <rect
        x={20}
        y={20}
        width={60}
        height={60}
        rx={4}
        fill="none"
        stroke="#CBD5E1"
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
      <circle cx={pos.x} cy={pos.y} r={9} fill={FILL_BLACK} />
    </>
  );
};

// =============================================================================
// COMPOSITE — yttre form med inre form (inside eller subtract)
// =============================================================================

const CompositeRenderer: React.FC<{ cell: Extract<V5Cell, { kind: 'composite' }> }> = ({ cell }) => {
  const sw = STROKE_WIDTH;

  // Yttre form-paths (för path-sammansättning)
  const outerPaths = {
    square: 'M 22 22 L 78 22 L 78 78 L 22 78 Z',
    circle: 'M 50 22 A 28 28 0 1 0 50 78 A 28 28 0 1 0 50 22 Z',
    triangle: 'M 50 22 L 78 78 L 22 78 Z',
  };

  // Inre form-paths — alltid centrerade i (50, 50), mindre storlek
  const innerPaths = {
    circle: 'M 50 38 A 12 12 0 1 0 50 62 A 12 12 0 1 0 50 38 Z',
    square: 'M 38 38 L 62 38 L 62 62 L 38 62 Z',
    triangle: 'M 50 38 L 62 62 L 38 62 Z',
    none: '',
  };

  const outer = outerPaths[cell.outer];
  const inner = innerPaths[cell.inner];

  if (cell.inner === 'none') {
    // Bara yttre form, fylld
    return (
      <path
        d={outer}
        fill={FILL_BLACK}
        stroke="none"
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    );
  }

  if (cell.mode === 'subtract') {
    // Yttre fylld med inre stansad ut (hål)
    return (
      <path
        d={`${outer} ${inner}`}
        fill={FILL_BLACK}
        fillRule="evenodd"
        stroke="none"
        strokeLinejoin="round"
      />
    );
  }

  // mode === 'inside': yttre fylld + inre i kontrastfärg ovanpå
  return (
    <>
      <path
        d={outer}
        fill={FILL_BLACK}
        stroke="none"
        strokeLinejoin="round"
      />
      <path
        d={inner}
        fill="white"
        stroke="none"
        strokeLinejoin="round"
      />
    </>
  );
};
