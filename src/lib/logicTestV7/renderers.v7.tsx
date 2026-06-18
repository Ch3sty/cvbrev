import React from 'react';
import type {
  V7Cell,
  Fill,
  GlyphCell,
  OrbitalCell,
  StackCell,
  LatticeCell,
  RayCell,
  TallyCell,
  RingCell,
  VectorCell,
  PolyCell,
  TileCell,
  SectorWheelCell,
  DotsOrbitCell,
  Quad,
} from './types.v7';

// =============================================================================
// PREMIUM SVG-RENDERARE för matrislogik-avancerad
// =============================================================================
// Designspråk:
// - viewBox 0..100, alla former i [16, 84] (68×68 inre yta)
// - Tunn stroke (#020617 slate-950) — skarpare än V5
// - Strokebredd 3 — finare än V5:s 4
// - Ljusare grå (#CBD5E1 slate-300) — mer subtil
// - Round-linjer för mjukhet
// =============================================================================

const STROKE = '#020617';
const FILL_BLACK = '#020617';
const FILL_GRAY = '#CBD5E1';
const FILL_NONE = 'transparent';
const SW = 3;
const SW_THIN = 2;

const fillFor = (f: Fill): string =>
  f === 'black' ? FILL_BLACK : f === 'gray' ? FILL_GRAY : FILL_NONE;

const strokeFor = (f: Fill): string =>
  f === 'none' ? STROKE : 'none';

// =============================================================================
// HUVUDRENDERARE
// =============================================================================

export const SvgCellV7: React.FC<{ cell: V7Cell }> = ({ cell }) => {
  switch (cell.kind) {
    case 'glyph':
      return <GlyphRenderer cell={cell} />;
    case 'orbital':
      return <OrbitalRenderer cell={cell} />;
    case 'stack':
      return <StackRenderer cell={cell} />;
    case 'lattice':
      return <LatticeRenderer cell={cell} />;
    case 'ray':
      return <RayRenderer cell={cell} />;
    case 'tally':
      return <TallyRenderer cell={cell} />;
    case 'ring':
      return <RingRenderer cell={cell} />;
    case 'vector':
      return <VectorRenderer cell={cell} />;
    case 'poly':
      return <PolyRenderer cell={cell} />;
    case 'tile':
      return <TileRenderer cell={cell} />;
    case 'sectorwheel':
      return <SectorWheelRenderer cell={cell} />;
    case 'dotsorbit':
      return <DotsOrbitRenderer cell={cell} />;
  }
};

// =============================================================================
// 1. GLYPH — geometriska tecken (förenklade matematiska/grekiska former)
// =============================================================================

const GlyphRenderer: React.FC<{ cell: GlyphCell }> = ({ cell }) => {
  const fill = fillFor(cell.fill);
  const stroke = STROKE;
  const sw = SW;

  // Alla glyfer i [16, 84]-yta
  const paths: Record<GlyphCell['glyph'], { d: string; closed: boolean }> = {
    // Lambda (Λ): två ben från topp som spretar ut
    lambda: {
      d: 'M 50 18 L 30 82 L 42 82 L 50 50 L 58 82 L 70 82 L 50 18 Z',
      closed: true,
    },
    // Sigma (Σ-aktig): två kilar som möts i mitten
    sigma: {
      d: 'M 78 22 L 22 22 L 50 50 L 22 78 L 78 78 L 78 68 L 38 68 L 58 50 L 38 32 L 78 32 Z',
      closed: true,
    },
    // Omega (Ω): hästsko-form med fötter
    omega: {
      d: 'M 22 78 L 32 78 L 32 60 Q 32 28 50 28 Q 68 28 68 60 L 68 78 L 78 78 L 78 60 Q 78 18 50 18 Q 22 18 22 60 Z',
      closed: true,
    },
    // Theta (θ): cirkel med horisontell linje genom mitten
    theta: {
      d: 'M 50 18 A 22 32 0 1 0 50 82 A 22 32 0 1 0 50 18 Z M 32 50 L 68 50',
      closed: true,
    },
    // Phi (φ): cirkel med vertikal stam genom
    phi: {
      d: 'M 50 28 A 16 18 0 1 0 50 64 A 16 18 0 1 0 50 28 Z M 50 18 L 50 82',
      closed: true,
    },
    // Pi (π): två vertikala stammar med horisontell topp
    pi: {
      d: 'M 22 26 L 78 26 L 78 36 L 70 36 L 70 82 L 60 82 L 60 36 L 40 36 L 40 82 L 30 82 L 30 36 L 22 36 Z',
      closed: true,
    },
  };

  const def = paths[cell.glyph];

  // För theta använder vi delade paths (ej fyllbar som helhet)
  if (cell.glyph === 'theta') {
    return (
      <>
        <ellipse
          cx="50"
          cy="50"
          rx="22"
          ry="32"
          fill={fill}
          stroke={cell.fill === 'none' ? stroke : 'none'}
          strokeWidth={sw}
        />
        <line
          x1="32"
          y1="50"
          x2="68"
          y2="50"
          stroke={cell.fill === 'none' ? stroke : 'white'}
          strokeWidth={sw}
          strokeLinecap="round"
        />
      </>
    );
  }

  if (cell.glyph === 'phi') {
    return (
      <>
        <ellipse
          cx="50"
          cy="46"
          rx="16"
          ry="18"
          fill={fill}
          stroke={cell.fill === 'none' ? stroke : 'none'}
          strokeWidth={sw}
        />
        <line
          x1="50"
          y1="18"
          x2="50"
          y2="82"
          stroke={cell.fill === 'black' ? STROKE : stroke}
          strokeWidth={sw}
          strokeLinecap="round"
        />
      </>
    );
  }

  return (
    <path
      d={def.d}
      fill={fill}
      stroke={cell.fill === 'none' ? stroke : 'none'}
      strokeWidth={sw}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  );
};

// =============================================================================
// 2. ORBITAL — bas-cirkel med satellit i 1 av 8 positioner
// =============================================================================

const OrbitalRenderer: React.FC<{ cell: OrbitalCell }> = ({ cell }) => {
  // Centerpunkt
  const centerR = 6;
  const orbitR = 26;

  // 8 positioner runt centrum, med 0 = klockan 12 (top), medurs
  const angleFor = (idx: number) => (idx * 45 - 90) * (Math.PI / 180);

  const isFilled = cell.center === 'filled';

  return (
    <>
      {/* Bas-cirkel (orbit-spår) */}
      <circle
        cx="50"
        cy="50"
        r={orbitR}
        fill="none"
        stroke="#E2E8F0"
        strokeWidth="1.5"
        strokeDasharray="2 3"
      />
      {/* Centerpunkt */}
      <circle
        cx="50"
        cy="50"
        r={centerR}
        fill={isFilled ? FILL_BLACK : 'none'}
        stroke={isFilled ? 'none' : STROKE}
        strokeWidth={SW}
      />
      {/* Satellit */}
      {cell.satellite !== null && (() => {
        const a = angleFor(cell.satellite);
        const cx = 50 + orbitR * Math.cos(a);
        const cy = 50 + orbitR * Math.sin(a);
        return (
          <circle cx={cx} cy={cy} r="5" fill={FILL_BLACK} />
        );
      })()}
    </>
  );
};

// =============================================================================
// 3. STACK — basform + symbol ovanpå
// =============================================================================

const StackRenderer: React.FC<{ cell: StackCell }> = ({ cell }) => {
  const baseFill = fillFor(cell.baseFill);
  const baseStroke = cell.baseFill === 'none' ? STROKE : 'none';

  // Symbolerna ritas i kontrast
  const symbolColor = cell.baseFill === 'none' ? STROKE : 'white';
  const symbolStrokeColor = cell.baseFill === 'none' ? STROKE : 'white';

  return (
    <>
      {/* Bas */}
      {cell.base === 'circle' && (
        <circle
          cx="50"
          cy="50"
          r="28"
          fill={baseFill}
          stroke={baseStroke}
          strokeWidth={SW}
        />
      )}
      {cell.base === 'square' && (
        <rect
          x="22"
          y="22"
          width="56"
          height="56"
          rx="3"
          fill={baseFill}
          stroke={baseStroke}
          strokeWidth={SW}
        />
      )}
      {cell.base === 'triangle' && (
        <path
          d="M 50 18 L 80 78 L 20 78 Z"
          fill={baseFill}
          stroke={baseStroke}
          strokeWidth={SW}
          strokeLinejoin="round"
        />
      )}
      {cell.base === 'diamond' && (
        <path
          d="M 50 18 L 82 50 L 50 82 L 18 50 Z"
          fill={baseFill}
          stroke={baseStroke}
          strokeWidth={SW}
          strokeLinejoin="round"
        />
      )}

      {/* Symbol (centerad i mitten av basen) */}
      {cell.symbol === 'plus' && (
        <g
          stroke={symbolStrokeColor}
          strokeWidth={SW}
          strokeLinecap="round"
          fill="none"
        >
          <line x1="42" y1="50" x2="58" y2="50" />
          <line x1="50" y1="42" x2="50" y2="58" />
        </g>
      )}
      {cell.symbol === 'minus' && (
        <line
          x1="42"
          y1="50"
          x2="58"
          y2="50"
          stroke={symbolStrokeColor}
          strokeWidth={SW}
          strokeLinecap="round"
        />
      )}
      {cell.symbol === 'dot' && (
        <circle cx="50" cy="50" r="4" fill={symbolColor} />
      )}
      {cell.symbol === 'ring' && (
        <circle
          cx="50"
          cy="50"
          r="6"
          fill="none"
          stroke={symbolStrokeColor}
          strokeWidth={SW_THIN}
        />
      )}
      {cell.symbol === 'cross' && (
        <g
          stroke={symbolStrokeColor}
          strokeWidth={SW}
          strokeLinecap="round"
          fill="none"
        >
          <line x1="43" y1="43" x2="57" y2="57" />
          <line x1="43" y1="57" x2="57" y2="43" />
        </g>
      )}
    </>
  );
};

// =============================================================================
// 4. LATTICE — 2×2 mini-grid
// =============================================================================

const LatticeRenderer: React.FC<{ cell: LatticeCell }> = ({ cell }) => {
  // 2×2 grid i [16, 84]-yta. Cell-storlek 30, gap 4
  const cellSize = 30;
  const gap = 4;
  const startX = 18;
  const startY = 18;

  const positions = [
    { x: startX, y: startY },                        // TL
    { x: startX + cellSize + gap, y: startY },       // TR
    { x: startX, y: startY + cellSize + gap },       // BL
    { x: startX + cellSize + gap, y: startY + cellSize + gap }, // BR
  ];

  return (
    <>
      {cell.cells.map((quad, i) => (
        <LatticeQuad key={i} pos={positions[i]} size={cellSize} quad={quad} />
      ))}
    </>
  );
};

const LatticeQuad: React.FC<{
  pos: { x: number; y: number };
  size: number;
  quad: Quad;
}> = ({ pos, size, quad }) => {
  const cx = pos.x + size / 2;
  const cy = pos.y + size / 2;

  // Bas-rektangel alltid synlig som tunn ram
  const baseRect = (
    <rect
      x={pos.x}
      y={pos.y}
      width={size}
      height={size}
      rx="2"
      fill={
        quad === 'fill_black'
          ? FILL_BLACK
          : quad === 'fill_gray'
          ? FILL_GRAY
          : 'none'
      }
      stroke={STROKE}
      strokeWidth={SW_THIN}
    />
  );

  return (
    <>
      {baseRect}
      {quad === 'dot' && <circle cx={cx} cy={cy} r="4" fill={FILL_BLACK} />}
      {quad === 'cross' && (
        <g
          stroke={STROKE}
          strokeWidth={SW_THIN}
          strokeLinecap="round"
          fill="none"
        >
          <line x1={pos.x + 7} y1={pos.y + 7} x2={pos.x + size - 7} y2={pos.y + size - 7} />
          <line x1={pos.x + 7} y1={pos.y + size - 7} x2={pos.x + size - 7} y2={pos.y + 7} />
        </g>
      )}
    </>
  );
};

// =============================================================================
// 5. RAY — strålar från centrum
// =============================================================================

const RayRenderer: React.FC<{ cell: RayCell }> = ({ cell }) => {
  const centerR = 4;
  const rayLen = 28;

  // 0 = N (klockan 12), medurs i 45°-steg
  const angleFor = (dir: number) => (dir * 45 - 90) * (Math.PI / 180);

  return (
    <>
      {/* Strålar */}
      {cell.rays.map((dir, i) => {
        const a = angleFor(dir);
        const x2 = 50 + rayLen * Math.cos(a);
        const y2 = 50 + rayLen * Math.sin(a);
        return (
          <line
            key={i}
            x1="50"
            y1="50"
            x2={x2}
            y2={y2}
            stroke={STROKE}
            strokeWidth={SW}
            strokeLinecap="round"
          />
        );
      })}
      {/* Centerpunkt */}
      <circle cx="50" cy="50" r={centerR} fill={FILL_BLACK} />
    </>
  );
};

// =============================================================================
// 6. TALLY — räknepinnar (5:e korsar de 4 första)
// =============================================================================

const TallyRenderer: React.FC<{ cell: TallyCell }> = ({ cell }) => {
  const isVertical = cell.orientation === 'vertical';
  // Använd lokala koordinater i en horizontal layout, rotera om vertical
  // Horizontal layout: pinnarna går vertikalt (linje från top till bottom),
  // staplade horisontellt
  const lineLength = 44;
  const gap = 7;

  // Vi placerar 4 pinnar och om count=5 ritar vi en 5:e som korsar diagonalt
  const visibleCount = Math.min(cell.count, 4);
  const totalWidth = (visibleCount - 1) * gap;
  const startX = 50 - totalWidth / 2;
  const yMid = 50;

  return (
    <g transform={isVertical ? '' : `rotate(90, 50, 50)`}>
      {/* 4 raka pinnar */}
      {Array.from({ length: visibleCount }).map((_, i) => {
        const x = startX + i * gap;
        return (
          <line
            key={i}
            x1={x}
            y1={yMid - lineLength / 2}
            x2={x}
            y2={yMid + lineLength / 2}
            stroke={STROKE}
            strokeWidth={SW}
            strokeLinecap="round"
          />
        );
      })}
      {/* 5:e diagonal */}
      {cell.count === 5 && (
        <line
          x1={startX - 4}
          y1={yMid + lineLength / 2 - 4}
          x2={startX + (visibleCount - 1) * gap + 4}
          y2={yMid - lineLength / 2 + 4}
          stroke={STROKE}
          strokeWidth={SW}
          strokeLinecap="round"
        />
      )}
    </g>
  );
};

// =============================================================================
// 7. RING — koncentriska ringar
// =============================================================================

const RingRenderer: React.FC<{ cell: RingCell }> = ({ cell }) => {
  // Yttre ring först. Radie för n ringar baserat på antal.
  // 3 ringar: r = 30, 22, 14
  // 2 ringar: r = 28, 18
  // 1 ring: r = 28
  const radii =
    cell.rings.length === 3
      ? [30, 22, 14]
      : cell.rings.length === 2
      ? [28, 18]
      : [28];

  return (
    <>
      {cell.rings.map((fill, i) => {
        const r = radii[i];
        const fillVal = fillFor(fill);
        return (
          <circle
            key={i}
            cx="50"
            cy="50"
            r={r}
            fill={fillVal}
            stroke={STROKE}
            strokeWidth={SW_THIN}
          />
        );
      })}
    </>
  );
};

// =============================================================================
// 8. VECTOR — elegant pil (8 vinklar)
// =============================================================================

const VectorRenderer: React.FC<{ cell: VectorCell }> = ({ cell }) => {
  // Bas-vektor pekar uppåt (angle 0). Vi roterar via SVG-transform.
  // long = lång pil från (50, 78) till (50, 22)
  // short = kort pil från (50, 70) till (50, 30)
  const isLong = cell.length === 'long';
  const tipY = isLong ? 22 : 30;
  const tailY = isLong ? 78 : 70;

  // Pilhuvud
  const headSize = 9;

  return (
    <g transform={`rotate(${cell.angle}, 50, 50)`}>
      {/* Skaft */}
      <line
        x1="50"
        y1={tailY}
        x2="50"
        y2={tipY + 2}
        stroke={STROKE}
        strokeWidth={SW}
        strokeLinecap="round"
      />
      {/* Pilhuvud */}
      {cell.head === 'filled' ? (
        <path
          d={`M 50 ${tipY} L ${50 - headSize} ${tipY + headSize + 2} L ${50 + headSize} ${tipY + headSize + 2} Z`}
          fill={FILL_BLACK}
          stroke={STROKE}
          strokeWidth={SW_THIN}
          strokeLinejoin="round"
        />
      ) : (
        <g
          stroke={STROKE}
          strokeWidth={SW}
          strokeLinecap="round"
          fill="none"
        >
          <line x1="50" y1={tipY} x2={50 - headSize} y2={tipY + headSize + 2} />
          <line x1="50" y1={tipY} x2={50 + headSize} y2={tipY + headSize + 2} />
        </g>
      )}
    </g>
  );
};

// =============================================================================
// 9. POLY — reguljär polygon
// =============================================================================

const PolyRenderer: React.FC<{ cell: PolyCell }> = ({ cell }) => {
  const fill = fillFor(cell.fill);
  const stroke = cell.fill === 'none' ? STROKE : 'none';
  const radius = 30;

  // Bygg polygon-punkter
  const points: string[] = [];
  for (let i = 0; i < cell.sides; i++) {
    // Starta uppåt (klockan 12), gå medurs
    const angle = ((i * 360) / cell.sides - 90) * (Math.PI / 180);
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }

  return (
    <polygon
      points={points.join(' ')}
      fill={fill}
      stroke={stroke}
      strokeWidth={SW}
      strokeLinejoin="round"
      transform={`rotate(${cell.rotation}, 50, 50)`}
    />
  );
};

// =============================================================================
// 10. TILE — 3×3 mini-schackmönster (bitmask)
// =============================================================================

const TileRenderer: React.FC<{ cell: TileCell }> = ({ cell }) => {
  const cellSize = 18;
  const gap = 2;
  const startX = 17;
  const startY = 17;

  return (
    <>
      {Array.from({ length: 9 }).map((_, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const x = startX + col * (cellSize + gap);
        const y = startY + row * (cellSize + gap);
        const isFilled = (cell.pattern >> i) & 1;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={cellSize}
            height={cellSize}
            rx="1.5"
            fill={isFilled ? FILL_BLACK : 'none'}
            stroke={STROKE}
            strokeWidth={SW_THIN}
          />
        );
      })}
    </>
  );
};

// =============================================================================
// 11. SECTORWHEEL — cirkel delad i 8 sektorer, vissa fyllda svart
// =============================================================================

const SectorWheelRenderer: React.FC<{ cell: SectorWheelCell }> = ({ cell }) => {
  const cx = 50;
  const cy = 50;
  const r = 32;

  // Sektor i: börjar vid vinkel (i*45 - 90)° (sektor 0 överst), spänner 45°.
  // Punkt på cirkeln för en given grad.
  const pt = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };

  const sectorPath = (i: number) => {
    const start = i * 45 - 90;
    const end = start + 45;
    const [x1, y1] = pt(start);
    const [x2, y2] = pt(end);
    // large-arc=0 (45° < 180°), sweep=1 (medurs)
    return `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
  };

  const filledSet = new Set(cell.filled);

  return (
    <>
      {/* Fyllda sektorer först (bakom linjerna) */}
      {Array.from({ length: 8 }).map((_, i) =>
        filledSet.has(i) ? (
          <path key={`f${i}`} d={sectorPath(i)} fill={FILL_BLACK} stroke="none" />
        ) : null
      )}
      {/* Yttre cirkel */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={STROKE} strokeWidth={SW} />
      {/* 8 sektorlinjer (4 diametrar) genom centrum */}
      {Array.from({ length: 4 }).map((_, i) => {
        const [x1, y1] = pt(i * 45 - 90);
        const [x2, y2] = pt(i * 45 - 90 + 180);
        return (
          <line
            key={`l${i}`}
            x1={x1.toFixed(2)}
            y1={y1.toFixed(2)}
            x2={x2.toFixed(2)}
            y2={y2.toFixed(2)}
            stroke={STROKE}
            strokeWidth={SW_THIN}
          />
        );
      })}
    </>
  );
};

// =============================================================================
// 12. DOTSORBIT — prickar i positioner runt en osynlig cirkelbana
// =============================================================================

const DotsOrbitRenderer: React.FC<{ cell: DotsOrbitCell }> = ({ cell }) => {
  const cx = 50;
  const cy = 50;
  const orbitR = 30;
  const dotR = 6;

  // Position 0 = överst (12), medurs i 45°-steg.
  const pos = (i: number) => {
    const a = ((i * 45 - 90) * Math.PI) / 180;
    return [cx + orbitR * Math.cos(a), cy + orbitR * Math.sin(a)];
  };

  return (
    <>
      {cell.dots.map((i) => {
        const [x, y] = pos(i);
        return <circle key={i} cx={x.toFixed(2)} cy={y.toFixed(2)} r={dotR} fill={FILL_BLACK} />;
      })}
    </>
  );
};

// Workaround för oanvänd import
void strokeFor;
