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
    /** Nominellt yttermått per primitiv utan kontur, längsta axeln (V1). */
    yttermatt: [number, number];
    /** Primitiver som mäts på annat sätt i V1 (linjeformer, referensram). */
    yttermattUndantag: Record<string, string>;
  };
  /** Pixel per viewBox-enhet på en 360-mobil (G5). Samma skala i rutnät och alternativ (V9). */
  skala360: { rutnat: number; alternativ: number };
  /** Pixel per viewBox-enhet på 1280 (frågekolumnen 420 px). */
  skala1280: { rutnat: number; alternativ: number };
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
    /** Ram-grått: referens som bara hjälper ögat (tomma rutor, banan, luckan). Mappas till --m-ram. */
    ram: string;
    /** Alias för ram, behålls för äldre läsare. */
    orbitalBana: string;
  };
  /** sw: bläck, all information. swThin: ringar, sektorlinjer, fylld pilspets. ram: referens i ram-grått. */
  kontur: { sw: number; swThin: number; ram: number };
  glyph: {
    lambda: string;
    sigma: string;
    omega: string;
    theta: Ellips;
    phi: Ellips;
    pi: string;
  };
  orbital: {
    banaR: number;
    banaSw: number;
    banaStreck: string;
    banaLinecap: 'round' | 'butt' | 'square';
    mittR: number;
    satellitR: number;
  };
  stack: {
    cirkelR: number;
    kvadrat: { x: number; y: number; bredd: number; rx: number };
    triangel: Punkt[];
    romb: Punkt[];
    /** Symbolens centrum per bas. Plus, minus och kryss är offset från det. */
    symbolCentrum: Record<'circle' | 'square' | 'triangle' | 'diamond', Punkt>;
    plus: Linje[];
    minus: Linje[];
    kryss: Linje[];
    prickR: number;
    ringR: number;
  };
  lattice: { ruta: number; gap: number; start: number; rx: number; prickR: number; kryssInsats: number; symbolSw: number };
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
    kvadratRx: number;
  };
  /** Luckan före svaret: streckad ram och ritat frågetecken i ram-grått (spec avsnitt 5). */
  lucka: {
    ram: [number, number];
    rx: number;
    sw: number;
    streck: string;
    fragetecken: string;
    frageteckenSw: number;
    /** cx, cy, r */
    prick: [number, number, number];
  };
  /**
   * Figurserier (figurserier-spec.md, bilagan): remsan, zonerna och den
   * sammansatta primitiven duo (ett ytterelement och ett kärnelement i
   * koncentriska zoner), "bryter"-rutornas val och nod- och bytesgränserna.
   */
  serie: {
    rad: { figurer: number; cellerBryter: number; perRemsa360: number; perRemsa1280: number; remsluft: number; kolumn1280: number; altLuft360: number; altLuft1280: number };
    zon: { karnaMax: number; ytterMin: number; minGap: number };
    duo: {
      kant: { ram: [number, number]; stopp: number; prickR: number; maxAntal: number };
      orbital: { banaR: number; satellitR: number; banaSw: number; banaStreck: string };
      pil: { svans: number; skaftSlut: number; spets: number; huvudHalv: number; huvudHojd: number };
      form: { cirkelR: number; kvadrat: { x: number; y: number; sida: number; rx: number }; romb: Punkt[]; fyllning: string[] };
      symbol: { plus: Linje[]; minus: Linje[]; kryss: Linje[]; prickR: number; ringR: number };
    };
    bryter: { bokstav: { px: number; vikt: number; left: number; top: number }; valRam: number; rattRam: number; valdRattInre: number; punkt: { px: number; right: number; top: number } };
    noder: { harnastMax: number; harnastBytes: number; bryterMax: number; bryterBytes: number };
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
