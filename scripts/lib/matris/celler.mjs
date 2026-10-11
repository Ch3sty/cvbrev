// scripts/lib/matris/celler.mjs
// =============================================================================
// Matrisfrågornas celler som dimensioner.
//
// Varje celltyp (types.v7.ts) delas upp i de dimensioner en människa läser:
// en pils vinkel, längd och spets; en ruta i 2×2 per fyllnadstyp; en
// balanslinjes kvadrat och cirkel med fack och sida. Tolkningen
// (tolka.mjs) letar regel per dimension, misstagstexterna (misstag.mjs)
// beskriver vilken dimension ett fel alternativ har fel i.
//
// Dimensionstyper:
//   rot   cyklisk: värdet kan vridas k steg av n (vinkel, läge, mönster, mängd)
//   kat   kategorisk: fyllning, form, symbol, längd, antal
// =============================================================================

export const stable = (v) => {
  if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
  if (v && typeof v === 'object') {
    return '{' + Object.keys(v).sort().map((k) => `${k}:${stable(v[k])}`).join(',') + '}';
  }
  return String(v);
};
export const cellKey = (c) => (c === null ? 'null' : stable(c));
export const mod = (a, n) => ((a % n) + n) % n;
const sortNum = (a) => [...a].sort((x, y) => x - y);

// ---------------------------------------------------------------- tile 3×3
// Bit i = rad floor(i/3), kolumn i%3.
const bit = (m, r, c) => (m >> (r * 3 + c)) & 1;
const fromFn = (f) => { let o = 0; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) if (f(r, c)) o |= 1 << (r * 3 + c); return o; };
export const tile = {
  rotCW: (m) => fromFn((r, c) => bit(m, 2 - c, r)),
  rot: (m, k) => { let x = m; for (let i = 0; i < mod(k, 4); i++) x = tile.rotCW(x); return x; },
  spegelH: (m) => fromFn((r, c) => bit(m, r, 2 - c)),      // vänster <-> höger
  spegelV: (m) => fromFn((r, c) => bit(m, 2 - r, c)),      // upp <-> ner
  diag: (m) => fromFn((r, c) => bit(m, c, r)),             // övre vänster till nedre höger
  antidiag: (m) => fromFn((r, c) => bit(m, 2 - c, 2 - r)),
  antal: (m) => { let n = 0; for (let i = 0; i < 9; i++) n += (m >> i) & 1; return n; },
};
// Kanten i 3×3 medurs från övre vänstra hörnet (för vandring längs kanten).
export const TILE_KANT = [0, 1, 2, 5, 8, 7, 6, 3];

// ---------------------------------------------------------------- lattice 2×2
// Index i cells: [TL, TR, BL, BR]. Medurs ordning: TL, TR, BR, BL.
export const LAT_MEDURS = [0, 1, 3, 2];
const latPos = (idx) => LAT_MEDURS.indexOf(idx);
export const LAT_TYPER = ['fill_black', 'fill_gray', 'dot', 'cross'];
export const lattice = {
  // vrid hela 2×2 k kvarts varv medurs
  rot: (cells, k) => { const out = ['empty', 'empty', 'empty', 'empty']; for (let p = 0; p < 4; p++) out[LAT_MEDURS[mod(p + k, 4)]] = cells[LAT_MEDURS[p]]; return out; },
  spegelH: (c) => [c[1], c[0], c[3], c[2]],
  spegelV: (c) => [c[2], c[3], c[0], c[1]],
  diag: (c) => [c[0], c[2], c[1], c[3]],
};

// ---------------------------------------------------------------- sektorhjul
// Sektor 0 = överst, medurs. Spegling i lodrät linje: i -> 7-i. Vågrät: i -> 3-i.
export const sektor = {
  rot: (arr, k) => sortNum(arr.map((s) => mod(s + k, 8))),
  spegelLodrat: (arr) => sortNum(arr.map((s) => mod(7 - s, 8))),
  spegelVagrat: (arr) => sortNum(arr.map((s) => mod(3 - s, 8))),
};
export const ray = {
  rot: (arr, k) => sortNum(arr.map((s) => mod(s + k, 8))),
  spegelLodrat: (arr) => sortNum(arr.map((s) => mod(8 - s, 8))),
  spegelVagrat: (arr) => sortNum(arr.map((s) => mod(4 - s, 8))),
};

// ---------------------------------------------------------------- räkneord
export const ORD = { 0: 'noll', 1: 'ett', 2: 'två', 3: 'tre', 4: 'fyra', 5: 'fem', 6: 'sex', 7: 'sju', 8: 'åtta' };
const ORD_EN = { ...ORD, 1: 'en' };

// ---------------------------------------------------------------- värdenamn
// en: 'en grå' (obestämd form), pl: plural/adjektiv i plural, adj: 'grå'.
const FYLL = {
  none: { en: 'en ofylld', pl: 'ofyllda', adj: 'ofylld' },
  gray: { en: 'en grå', pl: 'grå', adj: 'grå' },
  black: { en: 'en svart', pl: 'svarta', adj: 'svart' },
};
const SIDOR = {
  5: { en: 'en femhörning', pl: 'femhörningar' },
  6: { en: 'en sexhörning', pl: 'sexhörningar' },
  8: { en: 'en åttahörning', pl: 'åttahörningar' },
};
const BAS = {
  circle: { en: 'en cirkel', pl: 'cirklar' },
  square: { en: 'en kvadrat', pl: 'kvadrater' },
  triangle: { en: 'en triangel', pl: 'trianglar' },
  diamond: { en: 'en romb', pl: 'romber' },
};
const SYMBOL = {
  plus: { en: 'ett plus', pl: 'plus' },
  minus: { en: 'ett minus', pl: 'minus' },
  dot: { en: 'en prick', pl: 'prickar' },
  ring: { en: 'en ring', pl: 'ringar' },
  cross: { en: 'ett kryss', pl: 'kryss' },
  none: { en: 'ingen symbol', pl: 'utan symbol' },
};
const LAGE8 = ['uppe', 'uppe till höger', 'till höger', 'nere till höger', 'nere', 'nere till vänster', 'till vänster', 'uppe till vänster'];
// Pilens riktning i 45-gradessteg från uppåt, medurs.
const PIL8 = ['uppåt', 'snett uppåt höger', 'åt höger', 'snett nedåt höger', 'nedåt', 'snett nedåt vänster', 'åt vänster', 'snett uppåt vänster'];
const LAGE4 = ['uppe till vänster', 'uppe till höger', 'nere till höger', 'nere till vänster']; // medurs ordning

const ETT_ORD = new Set(['streck', 'kryss']);
const medAntal = (n, sing, plur) => `${(n === 1 && ETT_ORD.has(sing.split(' ').pop()) ? 'ett' : ORD_EN[n]) ?? n} ${n === 1 ? sing : plur}`;

// ---------------------------------------------------------------- dimensioner
// En dimension: { id, namn (substantiv i bestämd form), typ, varde, n?, subj?, verb?, element? }
// rot-dimensioner har varde som tal (läge) eller sorterad lista (mängd) eller bitmask (tile).

function dimsVector(c) {
  return [
    { id: 'vinkel', typ: 'rot', n: 8, varde: c.angle / 45, namn: 'vridningen', subj: 'Pilen', verb: 'vridit sig', grad: 45 },
    { id: 'langd', typ: 'kat', varde: c.length, namn: 'längden', subj: 'Pilen' },
    { id: 'spets', typ: 'kat', varde: c.head, namn: 'spetsen', subj: 'Spetsen' },
  ];
}
function dimsOrbital(c) {
  return [
    { id: 'satellit', typ: 'rot', n: 8, varde: c.satellite, namn: 'pricken', subj: 'Pricken', verb: 'flyttat', grad: 45 },
    { id: 'mitt', typ: 'kat', varde: c.center, namn: 'mittpunkten', subj: 'Mittpunkten' },
  ];
}
function dimsRay(c) {
  return [{ id: 'stralar', typ: 'rot', mangd: true, n: 8, varde: sortNum(c.rays), namn: 'strecken', subj: 'Strecken', verb: 'vridit sig', grad: 45, element: ['streck', 'streck'], bestPl: 'strecken' }];
}
function dimsSektor(c) {
  return [{ id: 'sektorer', typ: 'rot', mangd: true, n: 8, varde: sortNum(c.filled), namn: 'mönstret', subj: 'Mönstret', verb: 'vridit sig', grad: 45, element: ['svart sektor', 'svarta sektorer'], bestPl: 'de svarta sektorerna' }];
}
function dimsTile(c) {
  return [{ id: 'monster', typ: 'rot', tile: true, n: 4, varde: c.pattern, namn: 'mönstret', subj: 'Mönstret', verb: 'vridit sig', grad: 90, element: ['svart ruta', 'svarta rutor'], bestPl: 'de svarta rutorna' }];
}
const LAT_NAMN = {
  fill_black: { sing: 'Den svarta rutan', plur: 'De svarta rutorna', ingen: 'ingen svart ruta', element: ['svart ruta', 'svarta rutor'] },
  fill_gray: { sing: 'Den grå rutan', plur: 'De grå rutorna', ingen: 'ingen grå ruta', element: ['grå ruta', 'grå rutor'] },
  dot: { sing: 'Pricken', plur: 'Prickarna', ingen: 'ingen prick', element: ['prick', 'prickar'] },
  cross: { sing: 'Krysset', plur: 'Kryssen', ingen: 'inget kryss', element: ['kryss', 'kryss'] },
};
function dimsLattice(c) {
  return LAT_TYPER.map((t) => {
    const pos = sortNum(c.cells.map((q, i) => (q === t ? latPos(i) : -1)).filter((p) => p >= 0));
    const nm = LAT_NAMN[t];
    return { id: 'lat-' + t, typ: 'rot', mangd: true, lat: t, n: 4, varde: pos, namn: nm.sing.toLowerCase(), subj: pos.length > 1 ? nm.plur : nm.sing, verb: 'flyttat', grad: 90, element: nm.element, ingen: nm.ingen };
  });
}
function dimsPoly(c) {
  const period = 360 / c.sides;
  return [
    { id: 'sidor', typ: 'kat', varde: c.sides, namn: 'formen' },
    { id: 'polyrot', typ: 'kat', varde: Math.round(mod(c.rotation, period) * 100) / 100, namn: 'vridningen' },
    { id: 'fyllning', typ: 'kat', varde: c.fill, namn: 'fyllningen' },
  ];
}
function dimsStack(c) {
  return [
    { id: 'bas', typ: 'kat', varde: c.base, namn: 'grundformen' },
    { id: 'symbol', typ: 'kat', varde: c.symbol, namn: 'symbolen' },
    { id: 'basfyll', typ: 'kat', varde: c.baseFill, namn: 'fyllningen' },
  ];
}
function dimsTally(c) {
  return [
    { id: 'antal', typ: 'kat', antal: true, varde: c.count, namn: 'antalet streck' },
    { id: 'riktning', typ: 'kat', varde: c.orientation, namn: 'riktningen' },
  ];
}
function dimsRing(c) {
  const r = c.rings;
  return [
    { id: 'ringantal', typ: 'kat', antal: true, varde: r.length, namn: 'antalet ringar' },
    { id: 'inre', typ: 'kat', varde: r[r.length - 1], namn: 'den innersta ringen' },
    { id: 'yttre', typ: 'kat', varde: r.slice(0, -1).every((f) => f === 'none') ? 'ofyllda' : r.slice(0, -1).join('+'), namn: 'de yttre ringarna' },
  ];
}
const FORM_NAMN = { square: 'Kvadraten', circle: 'Cirkeln' };
function dimsBalans(c) {
  const out = [];
  for (const shape of ['square', 'circle']) {
    const it = c.items.find((i) => i.shape === shape);
    out.push({ id: 'pos-' + shape, typ: 'kat', balans: shape, varde: it ? it.posX : null, namn: FORM_NAMN[shape].toLowerCase(), subj: FORM_NAMN[shape] });
    out.push({ id: 'sida-' + shape, typ: 'kat', balans: shape, sida: true, varde: it ? it.side : null, namn: FORM_NAMN[shape].toLowerCase(), subj: FORM_NAMN[shape] });
  }
  // Kvadratens fyllning (bank_version 3, P6). Saknas fältet är den ofylld.
  const kv = c.items.find((i) => i.shape === 'square');
  out.push({ id: 'fyll-square', typ: 'kat', varde: kv ? (kv.fill ?? 'none') : null, namn: 'kvadratens fyllning', subj: 'Kvadraten' });
  return out;
}

export function dimsFor(cell) {
  if (cell === null || Array.isArray(cell)) return null;
  switch (cell.kind) {
    case 'vector': return dimsVector(cell);
    case 'orbital': return dimsOrbital(cell);
    case 'ray': return dimsRay(cell);
    case 'sectorwheel': return dimsSektor(cell);
    case 'tile': return dimsTile(cell);
    case 'lattice': return dimsLattice(cell);
    case 'poly': return dimsPoly(cell);
    case 'stack': return dimsStack(cell);
    case 'tally': return dimsTally(cell);
    case 'ring': return dimsRing(cell);
    case 'balanceline': return dimsBalans(cell);
    default: return null;
  }
}

/** Värdet för dimension `id` i cellen, som jämförbar nyckel. */
export const dimVarde = (cell, id) => {
  const d = dimsFor(cell)?.find((x) => x.id === id);
  return d === undefined ? undefined : d.varde;
};
export const vKey = (v) => stable(v);

// ---------------------------------------------------------------- vridning av dimensionsvärden
export function rotera(dim, v, k) {
  if (v === null || v === undefined) return v;
  if (dim.latHel) return lattice.rot(v, k);
  if (dim.tile) return tile.rot(v, k);
  if (dim.mangd) return sortNum(v.map((s) => mod(s + k, dim.n)));
  return mod(v + k, dim.n);
}
export function spegelbilder(dim, v) {
  if (dim.latHel) return [lattice.spegelH(v), lattice.spegelV(v), lattice.diag(v)];
  if (dim.tile) return [tile.spegelH(v), tile.spegelV(v), tile.diag(v), tile.antidiag(v)];
  if (dim.mangd && dim.n === 8 && dim.id === 'sektorer') return [sektor.spegelLodrat(v), sektor.spegelVagrat(v)];
  if (dim.mangd && dim.n === 8) return [ray.spegelLodrat(v), ray.spegelVagrat(v)];
  if (dim.mangd && dim.n === 4) {
    // läget i medurs ordning -> index -> spegling -> läge
    const toIdx = (p) => LAT_MEDURS[p];
    const fromIdx = (i) => LAT_MEDURS.indexOf(i);
    const H = { 0: 1, 1: 0, 2: 3, 3: 2 }; const V = { 0: 2, 2: 0, 1: 3, 3: 1 };
    return [sortNum(v.map((p) => fromIdx(H[toIdx(p)]))), sortNum(v.map((p) => fromIdx(V[toIdx(p)])))];
  }
  return [];
}
export const mangdStorlek = (dim, v) => (dim.tile ? tile.antal(v) : Array.isArray(v) ? v.length : null);
/** Elementen som mängd av strängar (för ±1-jämförelser). */
export function element(dim, v) {
  if (v === null || v === undefined) return null;
  if (dim.tile) return Array.from({ length: 9 }, (_, i) => ((v >> i) & 1 ? String(i) : null)).filter(Boolean);
  if (Array.isArray(v)) return v.map(String);
  return null;
}

// ---------------------------------------------------------------- värdets namn
/** Namn på ett värde i en dimension, i obestämd singular ('en grå') och plural. */
export function vardeNamn(cell, dimId) {
  const d = dimsFor(cell)?.find((x) => x.id === dimId);
  if (!d) return null;
  const v = d.varde;
  switch (dimId) {
    case 'fyllning': case 'basfyll': case 'inre': case 'fyll-square': return FYLL[v] ?? null;
    case 'sidor': return SIDOR[v] ?? null;
    case 'bas': return BAS[v] ?? null;
    case 'symbol': return SYMBOL[v] ?? null;
    case 'antal': return { en: `en med ${medAntal(v, 'streck', 'streck')}`, pl: medAntal(v, 'streck', 'streck') };
    case 'ringantal': return { en: `en med ${medAntal(v, 'ring', 'ringar')}`, pl: medAntal(v, 'ring', 'ringar') };
    case 'riktning': return v === 'vertical' ? { en: 'en med stående streck', pl: 'stående' } : { en: 'en med liggande streck', pl: 'liggande' };
    case 'stralar': return { en: `en med ${medAntal(v.length, 'streck', 'streck')}`, pl: medAntal(v.length, 'streck', 'streck') };
    case 'sektorer': return { en: `en med ${medAntal(v.length, 'svart sektor', 'svarta sektorer')}`, pl: medAntal(v.length, 'svart sektor', 'svarta sektorer') };
    case 'satellit': return v === null ? { en: 'en utan prick', pl: 'utan prick' } : { en: `en med pricken ${LAGE8[v]}`, pl: `med pricken ${LAGE8[v]}` };
    case 'polyrot': return v === 0 ? { en: 'en ovriden', pl: 'ovridna' } : { en: `en vriden ${v} grader`, pl: `vridna ${v} grader` };
    case 'vinkel': return { en: `en pil som pekar ${PIL8[v]}`, pl: `pilar som pekar ${PIL8[v]}` };
    default:
      if (dimId.startsWith('lat-')) {
        if (v.length === 1) return { en: `en med ${LAT_NAMN[d.lat].element[0]} ${LAGE4[v[0]]}`, pl: `med ${LAT_NAMN[d.lat].element[0]} ${LAGE4[v[0]]}` };
        return { en: `en med ${medAntal(v.length, LAT_NAMN[d.lat].element[0], LAT_NAMN[d.lat].element[1])}`, pl: medAntal(v.length, LAT_NAMN[d.lat].element[0], LAT_NAMN[d.lat].element[1]) };
      }
      return null;
  }
}

/** Mening för en dimension som är densamma i hela matrisen. */
export function konstantText(cell, dimId, kind) {
  const d = dimsFor(cell)?.find((x) => x.id === dimId);
  if (!d) return null;
  const v = d.varde;
  switch (dimId) {
    case 'langd': return v === 'long' ? 'Pilen är lång hela vägen.' : 'Pilen är kort hela vägen.';
    case 'spets': return v === 'filled' ? 'Spetsen är fylld hela vägen.' : 'Spetsen är öppen hela vägen.';
    case 'mitt': return v === 'filled' ? 'Mittpunkten är fylld i alla rutor.' : 'Mittpunkten är ofylld i alla rutor.';
    case 'satellit': return null;
    case 'sidor': return `Alla figurer är ${SIDOR[v].pl}.`;
    case 'polyrot': return v === 0 ? 'Ingen figur är vriden.' : `Alla figurer är vridna ${v} grader.`;
    case 'fyllning': case 'basfyll': return `Alla figurer är ${FYLL[v].pl}.`;
    case 'fyll-square': return v === null ? null : `Kvadraten är ${FYLL[v].adj} i alla rutor.`;
    case 'bas': return `Grundformen är alltid ${BAS[v].en}.`;
    case 'symbol': return v === 'none' ? 'Ingen figur har en symbol.' : `Alla figurer har ${SYMBOL[v].en}.`;
    case 'antal': return `Alla figurer har ${medAntal(v, 'streck', 'streck')}.`;
    case 'riktning': return v === 'vertical' ? 'Strecken står alltid upprätt.' : 'Strecken ligger alltid ner.';
    case 'ringantal': return `Alla figurer har ${medAntal(v, 'ring', 'ringar')}.`;
    case 'inre': return `Den innersta ringen är alltid ${FYLL[v].adj}.`;
    case 'yttre': return v.split('+').every((x) => x === 'none') ? 'De yttre ringarna är alltid ofyllda.' : null;
    default:
      if (dimId.startsWith('lat-') && v.length === 0) return `Matrisen har ${LAT_NAMN[d.lat].ingen}.`;
      return null;
  }
}

/** Om cellen saknar något som dimensionen alltid har, eller tvärtom. */
export function saknasText(dim, felV, ratt) {
  if (dim.id === 'satellit' && felV === null) return 'Pricken saknas.';
  if (dim.balans && felV === null) return `${dim.subj} saknas.`;
  if (dim.balans && ratt === null) return `Det ska inte finnas någon ${dim.balans === 'square' ? 'kvadrat' : 'cirkel'} här.`;
  return null;
}

export const SIDA = { above: 'ovanför', below: 'under' };

// ---------------------------------------------------------------- primitiv
// Primitivgruppen en fråga ritas med, läst ur första cellen. Passets
// exponeringsregel (högst två frågor per primitiv och pass, tillägget om
// variation 2.1 punkt 3) och spärren S10 läser den. Samma tabell finns i
// src/lib/traning/bank.server.ts (PRIMITIV), som inte får importera hit.
export const PRIMITIV = {
  vector: 'pil', orbital: 'orbital', ray: 'stralar', sectorwheel: 'sektorhjul', tile: 'block3x3', lattice: 'ruta2x2',
  stack: 'grundform', poly: 'grundform', ring: 'ringar', balanceline: 'balanslinje', tally: 'rakning', dotsorbit: 'orbital',
};
export function primitivFor(q) {
  const c = q?.grid?.[0]?.[0];
  if (!c || Array.isArray(c)) return 'lager';
  return PRIMITIV[c.kind] ?? c.kind;
}
export { LAGE4, LAGE8, FYLL, SIDOR, BAS, SYMBOL, LAT_NAMN };
