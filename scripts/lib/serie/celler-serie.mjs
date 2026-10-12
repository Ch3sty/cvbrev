// scripts/lib/serie/celler-serie.mjs
// =============================================================================
// Figurseriernas celler som dimensioner (beställningen omgång 2, avsnitt A;
// figurserier-spec.md avsnitt 3).
//
// Kedjan för figurserier, i ordning:
//   celler-serie.mjs   primitiverna: dimensioner, bygg och läs tillbaka
//   tolka-serie.mjs    regelhypoteser per dimension ur de fem visade (FS4)
//   sparrar.mjs        FS1 till FS6 och S5, S6, S11, S12, S13 för serier
//   distraktorer.mjs   kandidater, analys och urval av fem
//   misstag-serie.mjs  misstagstext per distraktor, regeltext per fråga
//   recept-serie.mjs   mallarna F1 till F7: antal, p_prior, varianter
//   generera-serie.mjs bygg(): en fråga ur en variant, eller null
//   scripts/gen-figurserier.mjs, scripts/validate-figurserier.mjs och
//   serie-lägena i v7-facit-check, v7-distraktor-check och v7-geometri-check.
//
// En primitiv har dimensioner av tre slag:
//   rot  cyklisk, n = 8 lägen (vinkel, läge runt en bana)
//   ord  heltal i [min, max] utan omstart (antal)
//   kat  kategori ur en lista (fyllning, form, symbol, längd, spets)
//
// Bara primitiver som specen tillåter i serien (3.1 och 3.2): pil, orbital,
// strålar, sektorhjul, 3×3-block, månghörning, grundform och duo. Räknestreck,
// ringar och 2×2 förekommer inte. Strålar, sektorhjul, 3×3-blockets kant och
// duons kantprickar är samma modell: en båge av `antal` sammanhängande lägen
// som börjar på `start` (medurs, 0 = klockan 12).
// =============================================================================

import { stable, mod } from '../matris/celler.mjs';

export { stable, mod };

/** Kanten i 3×3 medurs från övre vänstra hörnet. */
export const TILE_KANT = [0, 1, 2, 5, 8, 7, 6, 3];

const sortNum = (a) => [...a].sort((x, y) => x - y);
export const bage = (start, antal) => Array.from({ length: antal }, (_, i) => mod(start + i, 8));

/** En mängd lägen 0..7 som båge: { start, antal }, eller null om den inte hänger ihop. */
export function bageAv(lagen) {
  const s = new Set(lagen);
  const n = s.size;
  if (n === 0) return null;
  if (n === 8) return { start: 0, antal: 8 };
  for (const st of s) {
    if (s.has(mod(st - 1, 8))) continue;
    return bage(st, n).every((x) => s.has(x)) ? { start: st, antal: n } : null;
  }
  return null;
}

// ---------------------------------------------------------------- dimensioner
const rot = (id, namn) => ({ id, typ: 'rot', n: 8, namn });
const ord = (id, min, max, namn) => ({ id, typ: 'ord', min, max, namn });
const kat = (id, L, namn) => ({ id, typ: 'kat', L, namn });

/**
 * Primitiverna. `grupp` är primitivgruppen för kvoterna (varje primitiv högst
 * ⌈n/3⌉ gånger per mall); duo med kantprickar och duo med orbital är var sin
 * grupp, eftersom de ser helt olika ut (prickar på en osynlig kvadrat mot en
 * prick på en prickad bana). `bygg` gör en cell
 * av dimensionsvärden, `las` gör tillbaka (null när cellen inte är en giltig
 * cell för primitiven, till exempel en båge som inte hänger ihop).
 */
export const PRIM = {
  pil: {
    grupp: 'pil',
    dims: [rot('vinkel', 'riktningen'), kat('langd', ['long', 'short'], 'längden'), kat('spets', ['open', 'filled'], 'spetsen')],
    bygg: (v) => ({ kind: 'vector', angle: mod(v.vinkel, 8) * 45, length: v.langd, head: v.spets }),
    las: (c) => (c.kind === 'vector' && c.angle % 45 === 0 ? { vinkel: mod(c.angle / 45, 8), langd: c.length, spets: c.head } : null),
  },
  orbital: {
    grupp: 'orbital',
    dims: [rot('satellit', 'pricken'), kat('mitt', ['filled', 'open'], 'mittpunkten')],
    bygg: (v) => ({ kind: 'orbital', center: v.mitt, satellite: mod(v.satellit, 8) }),
    las: (c) => (c.kind === 'orbital' && c.satellite !== null ? { satellit: c.satellite, mitt: c.center } : null),
  },
  stralar: {
    grupp: 'stralar',
    // Minst två streck (granskning 01, F1): ett streck med punkt läses som en nål.
    dims: [rot('start', 'strecken'), ord('antal', 2, 7, 'antalet streck')],
    bygg: (v) => ({ kind: 'ray', rays: sortNum(bage(v.start, v.antal)) }),
    las: (c) => {
      if (c.kind !== 'ray') return null;
      const b = bageAv(c.rays);
      return b && b.antal <= 7 ? { start: b.start, antal: b.antal } : null;
    },
  },
  sektor: {
    grupp: 'sektorhjul',
    dims: [rot('start', 'de svarta sektorerna'), ord('antal', 1, 7, 'antalet svarta sektorer')],
    bygg: (v) => ({ kind: 'sectorwheel', filled: sortNum(bage(v.start, v.antal)) }),
    las: (c) => {
      if (c.kind !== 'sectorwheel') return null;
      const b = bageAv(c.filled);
      return b && b.antal <= 7 ? { start: b.start, antal: b.antal } : null;
    },
  },
  block: {
    grupp: 'block3x3',
    dims: [rot('start', 'de svarta rutorna'), ord('antal', 1, 7, 'antalet svarta rutor')],
    bygg: (v) => ({ kind: 'tile', pattern: bage(v.start, v.antal).reduce((m, p) => m | (1 << TILE_KANT[p]), 0) }),
    las: (c) => {
      if (c.kind !== 'tile' || (c.pattern >> 4) & 1) return null;
      const lagen = TILE_KANT.map((bit, p) => ((c.pattern >> bit) & 1 ? p : -1)).filter((p) => p >= 0);
      const b = bageAv(lagen);
      return b && b.antal <= 7 ? { start: b.start, antal: b.antal } : null;
    },
  },
  poly: {
    grupp: 'manghorning',
    dims: [ord('horn', 3, 8, 'antalet hörn'), kat('fyllning', ['none', 'gray', 'black'], 'fyllningen')],
    bygg: (v) => ({ kind: 'poly', sides: v.horn, rotation: 0, fill: v.fyllning }),
    las: (c) => (c.kind === 'poly' && c.rotation === 0 ? { horn: c.sides, fyllning: c.fill } : null),
  },
  grundform: {
    grupp: 'grundform',
    dims: [
      kat('bas', ['circle', 'square', 'triangle', 'diamond'], 'grundformen'),
      kat('symbol', ['plus', 'minus', 'dot', 'ring', 'cross'], 'symbolen'),
      kat('fyllning', ['none', 'gray', 'black'], 'fyllningen'),
    ],
    bygg: (v) => ({ kind: 'stack', base: v.bas, symbol: v.symbol, baseFill: v.fyllning }),
    las: (c) => (c.kind === 'stack' && c.symbol !== 'none' ? { bas: c.base, symbol: c.symbol, fyllning: c.baseFill } : null),
  },
};

// Duo: ytter (kant eller orbital) och kärna (pil, form eller symbol), 2 × 3.
const YTTER = {
  // En kantprick, aldrig flera (granskning 01, F2): utan ram läses flera
  // prickar som ett tärningsmönster, inte som en vandring.
  kant: [rot('ylage', 'pricken')],
  orbital: [rot('ylage', 'pricken på banan')],
};
const KARNA = {
  pil: [rot('kvinkel', 'pilen i mitten')],
  form: [kat('kform', ['circle', 'square', 'diamond'], 'formen i mitten'), kat('kfyll', ['none', 'black'], 'fyllningen i mitten')],
  // Aldrig prick som kärnsymbol (granskning 01, F3): samma glyf som kantpricken.
  symbol: [kat('ksymbol', ['plus', 'minus', 'cross', 'ring'], 'symbolen i mitten')],
};
for (const y of Object.keys(YTTER)) {
  for (const k of Object.keys(KARNA)) {
    PRIM[`duo-${y}-${k}`] = {
      grupp: `duo-${y}`,
      dims: [...YTTER[y], ...KARNA[k]],
      bygg: (v) => ({
        kind: 'duo',
        ytter: y === 'kant' ? { typ: 'kant', lage: mod(v.ylage, 8) } : { typ: 'orbital', lage: mod(v.ylage, 8) },
        karna:
          k === 'pil' ? { typ: 'pil', vinkel: mod(v.kvinkel, 8) * 45 } : k === 'form' ? { typ: 'form', form: v.kform, fyllning: v.kfyll } : { typ: 'symbol', symbol: v.ksymbol },
      }),
      las: (c) => {
        if (c.kind !== 'duo' || c.ytter.typ !== y || c.karna.typ !== k) return null;
        const v = { ylage: mod(c.ytter.lage, 8) };
        // Flera kantprickar är ingen giltig figur längre (FS6 fäller den).
        if (y === 'kant' && (c.ytter.antal ?? 1) !== 1) return null;
        if (k === 'pil') {
          if (c.karna.vinkel % 45 !== 0) return null;
          v.kvinkel = mod(c.karna.vinkel / 45, 8);
        } else if (k === 'form') {
          v.kform = c.karna.form;
          v.kfyll = c.karna.fyllning;
        } else v.ksymbol = c.karna.symbol;
        return v;
      },
    };
  }
}

/** Primitivens id för en cell, eller null. */
export function primFor(cell) {
  if (!cell || Array.isArray(cell)) return null;
  switch (cell.kind) {
    case 'vector': return 'pil';
    case 'orbital': return 'orbital';
    case 'ray': return 'stralar';
    case 'sectorwheel': return 'sektor';
    case 'tile': return 'block';
    case 'poly': return 'poly';
    case 'stack': return 'grundform';
    case 'duo': return `duo-${cell.ytter.typ}-${cell.karna.typ}`;
    default: return null;
  }
}

/** Cellens dimensionsvärden: { prim, v } eller null när cellen inte går att läsa. */
export function lasCell(cell) {
  const prim = primFor(cell);
  if (!prim || !PRIM[prim]) return null;
  const v = PRIM[prim].las(cell);
  return v ? { prim, v } : null;
}

export const dimDef = (prim, id) => PRIM[prim]?.dims.find((d) => d.id === id);

/** Giltigt värde i dimensionen (FS6: antal inom primitivens gränser). */
export function giltigt(dim, x) {
  if (x === null || x === undefined) return false;
  if (dim.typ === 'rot') return Number.isInteger(x);
  if (dim.typ === 'ord') return Number.isInteger(x) && x >= dim.min && x <= dim.max;
  return dim.L.includes(x);
}
/** Värdet normaliserat (rot mod n). */
export const norm = (dim, x) => (dim.typ === 'rot' ? mod(x, dim.n) : x);

/** Nyckeln per dimension (FS1, "lika per dimension"). */
export function dimNyckel(cell) {
  const l = lasCell(cell);
  if (!l) return `okand:${stable(cell)}`;
  return `${l.prim}|${PRIM[l.prim].dims.map((d) => `${d.id}=${l.v[d.id]}`).join('|')}`;
}

export const byggCell = (prim, v) => PRIM[prim].bygg(v);
