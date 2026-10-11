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
  BalanceLineCell,
  Quad,
} from './types.v7';
import { GEOMETRI } from './geometri';

// =============================================================================
// PREMIUM SVG-RENDERARE för matrislogik-avancerad
// =============================================================================
// Alla mått och färger kommer ur geometri.json (via geometri.ts), som
// scripts/v7-geometri-check.mjs räknar G1 till G12 på. Ändra måtten där,
// inte här, så att ritningen och kontrollen inte glider isär.
//
// Designspråk:
// - viewBox 0..100, alla former i [16, 84] (68×68 inre yta)
// - Tunn stroke (#020617 slate-950) — skarpare än V5
// - Strokebredd 3 — finare än V5:s 4
// - Ljusare grå (#CBD5E1 slate-300) — mer subtil
// - Round-linjer för mjukhet
// =============================================================================

const G = GEOMETRI;
const STROKE = G.farger.stroke;
const FILL_BLACK = G.farger.fillBlack;
const FILL_GRAY = G.farger.fillGray;
const FILL_NONE = 'transparent';
const SW = G.kontur.sw;
const SW_THIN = G.kontur.swThin;

const fillFor = (f: Fill): string =>
  f === 'black' ? FILL_BLACK : f === 'gray' ? FILL_GRAY : FILL_NONE;

// Grå fyllning (#CBD5E1) har för låg kontrast mot vit bakgrund utan kontur
// (WCAG 1.4.11 kräver 3:1). Därför får både ofyllda och grå former mörk
// kontur — bara svarta former klarar sig utan.
const strokeFor = (f: Fill): string =>
  f === 'black' ? 'none' : STROKE;

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
    case 'balanceline':
      return <BalanceLineRenderer cell={cell} />;
  }
};

// =============================================================================
// 1. GLYPH — geometriska tecken (förenklade matematiska/grekiska former)
// =============================================================================

const GlyphRenderer: React.FC<{ cell: GlyphCell }> = ({ cell }) => {
  const fill = fillFor(cell.fill);
  const stroke = STROKE;
  const sw = SW;

  // Alla glyfer i [16, 84]-yta. Lambda (två ben från toppen), sigma (två
  // kilar som möts i mitten), omega (hästsko med fötter) och pi (två stammar
  // med vågrät topp) är banor; theta (vågrätt streck) och phi (lodrät stam)
  // är en ellips med ett streck.
  const d = G.glyph;

  // För theta använder vi delade element (ej fyllbar som helhet)
  if (cell.glyph === 'theta') {
    const t = d.theta;
    return (
      <>
        <ellipse
          cx={t.cx}
          cy={t.cy}
          rx={t.rx}
          ry={t.ry}
          fill={fill}
          stroke={strokeFor(cell.fill)}
          strokeWidth={sw}
        />
        {/* Tvärstreck: vitt bara på svart fyllning, mörkt på grå/ofylld */}
        <line
          x1={t.linje[0]}
          y1={t.linje[1]}
          x2={t.linje[2]}
          y2={t.linje[3]}
          stroke={cell.fill === 'black' ? 'white' : stroke}
          strokeWidth={sw}
          strokeLinecap="round"
        />
      </>
    );
  }

  if (cell.glyph === 'phi') {
    const f = d.phi;
    return (
      <>
        <ellipse
          cx={f.cx}
          cy={f.cy}
          rx={f.rx}
          ry={f.ry}
          fill={fill}
          stroke={strokeFor(cell.fill)}
          strokeWidth={sw}
        />
        {/* Stam: vit på svart fyllning så den inte försvinner, mörk annars */}
        <line
          x1={f.linje[0]}
          y1={f.linje[1]}
          x2={f.linje[2]}
          y2={f.linje[3]}
          stroke={cell.fill === 'black' ? 'white' : stroke}
          strokeWidth={sw}
          strokeLinecap="round"
        />
      </>
    );
  }

  return (
    <path
      d={d[cell.glyph]}
      fill={fill}
      stroke={strokeFor(cell.fill)}
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
  const { mittR: centerR, banaR: orbitR, banaSw, banaStreck, satellitR } = G.orbital;

  // 8 positioner runt centrum, med 0 = klockan 12 (top), medurs
  const angleFor = (idx: number) => (idx * 45 - 90) * (Math.PI / 180);

  const isFilled = cell.center === 'filled';

  return (
    <>
      {/* Bas-cirkel (orbit-spår). Referensramen som gör vandringen läsbar,
          minst 3:1 mot vitt (G10), därför slate-500 och inte slate-400. */}
      <circle
        cx="50"
        cy="50"
        r={orbitR}
        fill="none"
        stroke={G.farger.orbitalBana}
        strokeWidth={banaSw}
        strokeDasharray={banaStreck}
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
          <circle cx={cx} cy={cy} r={satellitR} fill={FILL_BLACK} />
        );
      })()}
    </>
  );
};

// =============================================================================
// 3. STACK — basform + symbol ovanpå
// =============================================================================

/** Sluten bana genom hörnen, som 'M 50 18 L 80 78 L 20 78 Z'. */
const bana = (p: [number, number][]) => 'M ' + p.map(([x, y]) => `${x} ${y}`).join(' L ') + ' Z';

const StackRenderer: React.FC<{ cell: StackCell }> = ({ cell }) => {
  const baseFill = fillFor(cell.baseFill);
  const baseStroke = strokeFor(cell.baseFill);
  const S = G.stack;

  // Symbolerna ritas i kontrast: vitt bara på svart bas, mörkt på grå/ofylld
  const symbolColor = cell.baseFill === 'black' ? 'white' : STROKE;
  const symbolStrokeColor = cell.baseFill === 'black' ? 'white' : STROKE;

  const linjer = (l: [number, number, number, number][]) =>
    l.map(([x1, y1, x2, y2], i) => <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />);

  return (
    <>
      {/* Bas */}
      {cell.base === 'circle' && (
        <circle
          cx="50"
          cy="50"
          r={S.cirkelR}
          fill={baseFill}
          stroke={baseStroke}
          strokeWidth={SW}
        />
      )}
      {cell.base === 'square' && (
        <rect
          x={S.kvadrat.x}
          y={S.kvadrat.y}
          width={S.kvadrat.bredd}
          height={S.kvadrat.bredd}
          rx={S.kvadrat.rx}
          fill={baseFill}
          stroke={baseStroke}
          strokeWidth={SW}
        />
      )}
      {cell.base === 'triangle' && (
        <path
          d={bana(S.triangel)}
          fill={baseFill}
          stroke={baseStroke}
          strokeWidth={SW}
          strokeLinejoin="round"
        />
      )}
      {cell.base === 'diamond' && (
        <path
          d={bana(S.romb)}
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
          {linjer(S.plus)}
        </g>
      )}
      {cell.symbol === 'minus' && (
        <line
          x1={S.minus[0][0]}
          y1={S.minus[0][1]}
          x2={S.minus[0][2]}
          y2={S.minus[0][3]}
          stroke={symbolStrokeColor}
          strokeWidth={SW}
          strokeLinecap="round"
        />
      )}
      {cell.symbol === 'dot' && (
        <circle cx="50" cy="50" r={S.prickR} fill={symbolColor} />
      )}
      {cell.symbol === 'ring' && (
        <circle
          cx="50"
          cy="50"
          r={S.ringR}
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
          {linjer(S.kryss)}
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
  const { ruta: cellSize, gap, start } = G.lattice;
  const startX = start;
  const startY = start;

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
  const ki = G.lattice.kryssInsats;

  // Bas-rektangel alltid synlig som tunn ram
  const baseRect = (
    <rect
      x={pos.x}
      y={pos.y}
      width={size}
      height={size}
      rx={G.lattice.rx}
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
      {quad === 'dot' && <circle cx={cx} cy={cy} r={G.lattice.prickR} fill={FILL_BLACK} />}
      {quad === 'cross' && (
        <g
          stroke={STROKE}
          strokeWidth={SW_THIN}
          strokeLinecap="round"
          fill="none"
        >
          <line x1={pos.x + ki} y1={pos.y + ki} x2={pos.x + size - ki} y2={pos.y + size - ki} />
          <line x1={pos.x + ki} y1={pos.y + size - ki} x2={pos.x + size - ki} y2={pos.y + ki} />
        </g>
      )}
    </>
  );
};

// =============================================================================
// 5. RAY — strålar från centrum
// =============================================================================

const RayRenderer: React.FC<{ cell: RayCell }> = ({ cell }) => {
  const { mittR: centerR, langd: rayLen } = G.ray;

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
  // Baslayouten ritar stående pinnar (vertikala linjer, staplade sida vid
  // sida) — det är vertical-orienteringen. Vid horizontal roteras gruppen 90°.
  const { langd: lineLength, gap, diagonalUtstick: ut } = G.tally;

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
          x1={startX - ut}
          y1={yMid + lineLength / 2 - ut}
          x2={startX + (visibleCount - 1) * gap + ut}
          y2={yMid - lineLength / 2 + ut}
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
      ? G.ring.radier['3']
      : cell.rings.length === 2
      ? G.ring.radier['2']
      : G.ring.radier['1'];

  // Spec-rummen 15.10: varje ring är sitt eget fält. En ofylld ring fylls
  // med vitt (inte genomskinligt), annars lyser en svart granne utanför
  // igenom och [svart, ingen, svart] ser ut som en solid skiva. Mellan två
  // ringar går alltid en vit linje (RING_GAP, cirka 2 px i Pixel 7-storlek)
  // strax utanför den mörka konturen, så att [svart, svart, svart] blir en
  // skiva med två tunna vita cirklar och [svart, ingen, svart] en svart
  // ytterring, en vit mellanring och en svart mittpunkt.
  return (
    <>
      {cell.rings.map((fill, i) => {
        const r = radii[i];
        const fillVal = fill === 'none' ? RING_VIT : fillFor(fill);
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <circle
                cx="50"
                cy="50"
                r={r + SW_THIN / 2 + RING_GAP / 2}
                fill="none"
                stroke={RING_VIT}
                strokeWidth={RING_GAP}
              />
            )}
            <circle cx="50" cy="50" r={r} fill={fillVal} stroke={STROKE} strokeWidth={SW_THIN} />
          </React.Fragment>
        );
      })}
    </>
  );
};

/** Ringarnas vita fält och skiljelinje (15.10). Cellerna är alltid vita. */
const RING_VIT = G.farger.vit;
/** Bredden på den vita linjen mellan två ringar, i viewBox-enheter. */
const RING_GAP = G.ring.skiljelinje;

// =============================================================================
// 8. VECTOR — elegant pil (8 vinklar)
// =============================================================================

const VectorRenderer: React.FC<{ cell: VectorCell }> = ({ cell }) => {
  // Bas-vektor pekar uppåt (angle 0). Vi roterar via SVG-transform.
  // long = lång pil från (50, 78) till (50, 22)
  // short = kort pil från (50, 70) till (50, 30)
  const matt = cell.length === 'long' ? G.vector.lang : G.vector.kort;
  const tipY = matt.spets;
  const tailY = matt.svans;

  // Pilhuvud
  const headSize = G.vector.huvud;

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
  const stroke = strokeFor(cell.fill);
  const radius = G.poly.radie;

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
  // 3 tiles à 18 + 2 gap à 2 = 58 → start (100-58)/2 = 21 ger centrum (50,50)
  const { ruta: cellSize, gap, start } = G.tile;
  const startX = start;
  const startY = start;

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
            rx={G.tile.rx}
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
  const r = G.sectorwheel.radie;

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
  const { banaR: orbitR, prickR: dotR } = G.dotsorbit;

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

// =============================================================================
// 13. BALANCELINE — horisontell linje med former ovanför/under
// =============================================================================

const BalanceLineRenderer: React.FC<{ cell: BalanceLineCell }> = ({ cell }) => {
  // Granskningen 2026-10-11 (G1): halvbredd 8 i stället för 11 och formerna
  // på y 31 och 69. Med platserna 27, 50 och 73 får två grannformer 4
  // enheters fritt mellan konturerna och smälter inte ihop på 360 px.
  const B = G.balanceline;
  const lineY = B.linjeY;
  const xs = B.xs;                 // vänster, mitt, höger
  const aboveY = B.ovanY;
  const belowY = B.underY;
  const s = B.halvbredd;           // form-storlek (halv-bredd)

  const drawShape = (it: BalanceLineCell['items'][number], i: number) => {
    const cx = xs[it.posX];
    const cy = it.side === 'above' ? aboveY : belowY;
    const fillVal = it.fill === 'gray' ? FILL_GRAY : 'none';
    const strokeVal = STROKE;
    if (it.shape === 'circle') {
      return (
        <circle key={i} cx={cx} cy={cy} r={s} fill={fillVal} stroke={strokeVal} strokeWidth={SW} />
      );
    }
    return (
      <rect key={i} x={cx - s} y={cy - s} width={s * 2} height={s * 2} fill={fillVal} stroke={strokeVal} strokeWidth={SW} />
    );
  };

  // Avdelare mitt emellan de tre platserna: korta lodräta streck som korsar
  // linjen, så att de tre facken på vardera sida syns tydligt. De går bara
  // y 47 till 53 och når därför aldrig formernas kanter.
  const dividerXs = B.avdelareX;

  return (
    <>
      {/* Vågrät baslinje */}
      <line x1={B.linjeX[0]} y1={lineY} x2={B.linjeX[1]} y2={lineY} stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      {/* Lodräta avdelare (3 fack per sida) */}
      {dividerXs.map((dx, i) => (
        <line
          key={`d${i}`}
          x1={dx}
          y1={B.avdelareY[0]}
          x2={dx}
          y2={B.avdelareY[1]}
          stroke={STROKE}
          strokeWidth={SW_THIN}
          strokeLinecap="round"
        />
      ))}
      {cell.items.map(drawShape)}
    </>
  );
};
