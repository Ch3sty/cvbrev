// src/lib/logicTestV7/geometri.ts
// =============================================================================
// Matrisfigurernas mått och färger, delade mellan renderaren och kontrollen.
//
// Måtten ligger i geometri.json. Renderaren (renderers.v7.tsx) ritar med dem
// och scripts/v7-geometri-check.mjs räknar G1 till G12 på samma fil, så att
// ritning och kontroll inte kan glida isär (granskning-figurer.md avsnitt 1
// och 5). Ändra ett mått här, inte i renderaren, och kör skriptet efteråt.
// Enhet: viewBox 0 till 100 per cell.
// =============================================================================

import data from './geometri.json';

type Punkt = [number, number];
type Linje = [number, number, number, number];
type Ellips = { cx: number; cy: number; rx: number; ry: number; linje: Linje };

export type Geometri = {
  regler: {
    /** Allt målat ligger i [14, 86] (G2). */
    inre: [number, number];
    /** Referensramar (streckad bana, baslinje) får gå ut till [10, 90] (G2). */
    ram: [number, number];
    /** Minsta fria avstånd mellan målade kanter (G1). */
    minGap: number;
    /** Ingen sträcka slutar närmare ett annat elements centrum än så (G4). */
    minAndpunktTillCentrum: number;
    /** Distinkta lägen för ett element som vrids (G6). */
    minLagen: number;
    /** Hela figurens period i en figurserie med fem visade (G9). */
    minPeriodFigurserie: number;
  };
  /** Pixel per viewBox-enhet på en 360-mobil (G5). */
  skala360: { rutnat: number; alternativ: number };
  g5: {
    minFigurRutnatPx: number;
    minFigurAlternativPx: number;
    minKonturPx: number;
    minAvstandPx: number;
    minPrickPx: number;
    minLangdskillnadPx: number;
  };
  /** Kontrastkrav mot cellens bakgrund (G10, WCAG 1.4.11). */
  g10: { information: number; referensram: number };
  farger: {
    bakgrund: string;
    stroke: string;
    fillBlack: string;
    fillGray: string;
    vit: string;
    orbitalBana: string;
  };
  kontur: { sw: number; swThin: number };
  glyph: {
    lambda: string;
    sigma: string;
    omega: string;
    theta: Ellips;
    phi: Ellips;
    pi: string;
  };
  orbital: { banaR: number; banaSw: number; banaStreck: string; mittR: number; satellitR: number };
  stack: {
    cirkelR: number;
    kvadrat: { x: number; y: number; bredd: number; rx: number };
    triangel: Punkt[];
    romb: Punkt[];
    plus: Linje[];
    minus: Linje[];
    kryss: Linje[];
    prickR: number;
    ringR: number;
  };
  lattice: { ruta: number; gap: number; start: number; rx: number; prickR: number; kryssInsats: number };
  ray: { mittR: number; langd: number };
  tally: { langd: number; gap: number; diagonalUtstick: number };
  ring: { radier: Record<'1' | '2' | '3', number[]>; skiljelinje: number };
  vector: { lang: { spets: number; svans: number }; kort: { spets: number; svans: number }; huvud: number };
  poly: { radie: number };
  tile: { ruta: number; gap: number; start: number; rx: number };
  sectorwheel: { radie: number };
  dotsorbit: { banaR: number; prickR: number };
  balanceline: {
    linjeY: number;
    linjeX: [number, number];
    xs: [number, number, number];
    ovanY: number;
    underY: number;
    halvbredd: number;
    avdelareX: [number, number];
    avdelareY: [number, number];
  };
};

export const GEOMETRI = data as unknown as Geometri;

// ---------------------------------------------------------------- kontrast (G10)

/** Relativ luminans enligt WCAG 2.x för en färg på formen #RRGGBB. */
export function luminans(hex: string): number {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) throw new Error(`Ogiltig färg: ${hex}`);
  const kanal = (i: number) => {
    const c = parseInt(m[1].slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * kanal(0) + 0.7152 * kanal(2) + 0.0722 * kanal(4);
}

/** Kontrastkvot mellan två färger, 1 till 21. */
export function kontrastkvot(a: string, b: string): number {
  const [ljus, mork] = [luminans(a), luminans(b)].sort((x, y) => y - x);
  return (ljus + 0.05) / (mork + 0.05);
}
