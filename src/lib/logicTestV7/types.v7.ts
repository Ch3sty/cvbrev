// Premium-typsystem för matrislogik-avancerad (v7).
// Tio fristående primitiver designade för komplexa, flerdimensionella mönster.
// Inget återbruk av V5 — egen visuell signatur (tunnare stroke, ljusare grå,
// skarpare svart) och nya former som glyfer, orbitaler, ringar, vektorer.

export type Fill = 'none' | 'gray' | 'black';

// =============================================================================
// 1. GLYPH — geometriska tecken (lambda, sigma, omega, theta, phi, pi)
// =============================================================================
export type GlyphCell = {
  kind: 'glyph';
  glyph: 'lambda' | 'sigma' | 'omega' | 'theta' | 'phi' | 'pi';
  fill: Fill;
};

// =============================================================================
// 2. ORBITAL — bas-cirkel med satellit i 1 av 8 positioner
// =============================================================================
export type OrbitalCell = {
  kind: 'orbital';
  center: 'filled' | 'open';
  // 0 = klockan 12 (top), sedan medurs i 45°-steg.
  // null = ingen satellit
  satellite: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | null;
};

// =============================================================================
// 3. STACK — basform + symbol ovanpå
// =============================================================================
export type StackBase = 'circle' | 'square' | 'triangle' | 'diamond';
export type StackSymbol = 'plus' | 'minus' | 'dot' | 'ring' | 'cross' | 'none';

export type StackCell = {
  kind: 'stack';
  base: StackBase;
  symbol: StackSymbol;
  baseFill: Fill;
};

// =============================================================================
// 4. LATTICE — 2×2 mini-grid
// =============================================================================
export type Quad = 'empty' | 'fill_black' | 'fill_gray' | 'dot' | 'cross';

export type LatticeCell = {
  kind: 'lattice';
  // [TL, TR, BL, BR]
  cells: [Quad, Quad, Quad, Quad];
};

// =============================================================================
// 5. RAY — strålar från centrum
// =============================================================================
// 0 = N (klockan 12), 1 = NE, 2 = E, 3 = SE, 4 = S, 5 = SW, 6 = W, 7 = NW
export type RayDirection = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type RayCell = {
  kind: 'ray';
  rays: RayDirection[];
};

// =============================================================================
// 6. TALLY — räknepinnar
// =============================================================================
export type TallyCell = {
  kind: 'tally';
  count: 1 | 2 | 3 | 4 | 5;
  orientation: 'vertical' | 'horizontal';
};

// =============================================================================
// 7. RING — koncentriska ringar
// =============================================================================
// Längd 1-3, från ytter till inner. Varje ring har egen fyllning.
export type RingCell = {
  kind: 'ring';
  rings: Fill[];
};

// =============================================================================
// 8. VECTOR — elegant vektor-pil
// =============================================================================
export type VectorAngle = 0 | 45 | 90 | 135 | 180 | 225 | 270 | 315;

export type VectorCell = {
  kind: 'vector';
  angle: VectorAngle;
  length: 'short' | 'long';
  head: 'open' | 'filled';
};

// =============================================================================
// 9. POLY — reguljär polygon
// =============================================================================
export type PolyCell = {
  kind: 'poly';
  sides: 5 | 6 | 8;
  rotation: 0 | 30 | 60 | 90;
  fill: Fill;
};

// =============================================================================
// 10. TILE — 3×3 mini-schackmönster
// =============================================================================
// pattern är en 9-bits bitmask. Bit 0 = TL, bit 1 = TC, ..., bit 8 = BR.
// 1 = fylld, 0 = tom.
export type TileCell = {
  kind: 'tile';
  pattern: number;
};

// =============================================================================
// 11. SECTORWHEEL — cirkel delad i 8 sektorer, vissa fyllda svart
// =============================================================================
// Sektor 0 = överst (12-positionen), sedan medurs i 45°-steg.
// `filled` listar vilka sektorer (0–7) som är svartfyllda. Resten är vita.
// Branschrealistiskt "tårtbits"-format för expert-nivå.
export type SectorWheelCell = {
  kind: 'sectorwheel';
  filled: number[];
};

// =============================================================================
// HUVUDTYP
// =============================================================================
export type V7Cell =
  | GlyphCell
  | OrbitalCell
  | StackCell
  | LatticeCell
  | RayCell
  | TallyCell
  | RingCell
  | VectorCell
  | PolyCell
  | TileCell
  | SectorWheelCell;

export type Question = {
  id: string;
  title: string;
  rule: string;
  // 1-4: avancerad-testet använder 2-4
  difficulty: 1 | 2 | 3 | 4;
  grid: (V7Cell | null)[][];
  options: V7Cell[];
  correctAnswer: number;
};
