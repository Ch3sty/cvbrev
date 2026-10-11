// scripts/v7-geometri-check.mjs
// =============================================================================
// Geometrisk kontroll av matrisfigurerna (V7), regel G1 till G12 i
// docs/design/tester-v2-2026-10-11/granskning-figurer.md.
//
// Kör: node scripts/v7-geometri-check.mjs            (alla sex banker)
//      node scripts/v7-geometri-check.mjs <fil.json> (en bank)
//
// Måtten läses ur src/lib/logicTestV7/geometri.json, samma fil som
// renderaren (renderers.v7.tsx via geometri.ts) ritar med. Ändras ett mått
// där slår kontrollen igenom direkt; ritning och kontroll kan inte glida isär.
//
// Varje cell byggs om till sina målade element: kapslar (streck med runda
// ändar), skivor, cirkelkonturer och lådor (rektangel med kontur). Avstånden
// räknas analytiskt mellan målade kanter, konturbredden inräknad.
//
//   G1  separata element har minst 4 enheters fritt mellan målade kanter
//       (tile, lattice och sektorhjul är rutnät av avsikt och undantas)
//   G2  allt målat ligger i [14, 86], referensramar i [10, 90]
//   G3  alla lägen en familj kan använda (åtta vridningar, alla fack) klarar
//       G1 och G2, inte bara de som visas
//   G4  ingen sträcka slutar inom 6 enheter från ett annat elements centrum,
//       och ett element som står på en referensram har centrum på ramen
//   G5  minsta storlek på 360 px (kontur, avstånd, prick, längdskillnad)
//   G6  ett element som vrids har minst 4 distinkta lägen i regelns stegmängd
//   G7  två rörliga element går inte i takt (läge A bestämmer läge B och
//       tvärtom över de visade rutorna)
//   G8  spegling: källrutan är inte invariant under axeln, och inga två rutor
//       i en kedja (rad eller kolumn) är lika
//   G9  figurserier (finns inte i V7-bankerna än)
//   G10 kontrast mot cellens bakgrund: information 4,5:1, referensram 3:1
//   G11 tomma alternativ: aldrig i rutnätet, högst ett per fråga, inga på
//       expert (kända undantag står i G11_KANDA)
//   G12 lagerceller (arrayceller) felar tills en sammansatt primitiv är
//       godkänd
//
// Exit 1 vid fel.
// =============================================================================

import { readFileSync } from 'node:fs';
import { tolka } from './lib/matris/tolka.mjs';
import { rotera, spegelbilder, vKey, stable } from './lib/matris/celler.mjs';

const G = JSON.parse(readFileSync(new URL('../src/lib/logicTestV7/geometri.json', import.meta.url), 'utf8'));
const GLOBALS_CSS = new URL('../src/app/globals.css', import.meta.url);

const ALLA = [
  'src/lib/logicTestV7/questionBankGrund.v7.json',
  'src/lib/logicTestV7/questionBank.v7.json',
  'src/lib/logicTestV7/questionBankExpert.v7.json',
  'src/lib/logicTestV7/questionBankGrund3c.v7.json',
  'src/lib/logicTestV7/questionBankAvancerad3c.v7.json',
  'src/lib/logicTestV7/questionBankExpert3c.v7.json',
];

// G11: tomma distraktorer på expert som granskningen 2026-10-11 hittade.
// De byts vid nästa generatorkörning, inte för hand (granskning-figurer.md
// avsnitt 3). Står ett id här rapporteras det som känt; ett nytt brott felar.
const G11_KANDA = new Set([
  'v7e-3c-vand-03', // lattice utan element som alternativ 5
  'v7e-3c-over-07', // lattice utan element som alternativ 1
]);

// G7: frågor i familjen två rörelser där de två elementen går i takt, funna
// av det här skriptet 2026-10-11 (granskningen räknade inte G7 på bankerna).
// Två vridningar med period 4 och ett steg per ruta ger alltid en bijektion
// mellan lägena, så den som följer ett element får det andra gratis. Ska
// avgöras av testansvarig och bytas i generatorn, inte för hand.
const G7_KANDA = new Set([
  'v7e-b2',
  'v7g-3c-tva-01',
  'v7g-3c-tva-02',
  'v7g-3c-tva-04',
  'v7a-3c-tva-01',
  'v7a-3c-tva-02',
  'v7e-3c-tva-01',
  'v7e-3c-tva-02',
  'v7e-3c-tva-04',
]);

const EPS = 1e-9;
const C = [50, 50];
const sw = G.kontur.sw / 2;
const swT = G.kontur.swThin / 2;
const [INRE_MIN, INRE_MAX] = G.regler.inre;
const [RAM_MIN, RAM_MAX] = G.regler.ram;

// ---------------------------------------------------------------- vektorgeometri
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const len = (a) => Math.hypot(a[0], a[1]);
const dist = (a, b) => len(sub(a, b));
const rot = (p, grad, c = C) => {
  const a = (grad * Math.PI) / 180;
  const [x, y] = sub(p, c);
  return [c[0] + x * Math.cos(a) - y * Math.sin(a), c[1] + x * Math.sin(a) + y * Math.cos(a)];
};
/** Läge i (0 = klockan 12, medurs i 45-gradersteg) på radien r. */
const pa = (i, r) => {
  const a = ((i * 45 - 90) * Math.PI) / 180;
  return [50 + r * Math.cos(a), 50 + r * Math.sin(a)];
};

function punktSträcka(p, a, b) {
  const ab = sub(b, a);
  const l2 = dot(ab, ab);
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, dot(sub(p, a), ab) / l2));
  return dist(p, [a[0] + t * ab[0], a[1] + t * ab[1]]);
}
function korsar(a, b, c, d) {
  const o = (p, q, r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
  return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0;
}
function sträckaSträcka(a, b, c, d) {
  if (korsar(a, b, c, d)) return 0;
  return Math.min(punktSträcka(a, c, d), punktSträcka(b, c, d), punktSträcka(c, a, b), punktSträcka(d, a, b));
}
const iLåda = (p, l) => p[0] >= l.x0 && p[0] <= l.x1 && p[1] >= l.y0 && p[1] <= l.y1;
function punktLåda(p, l) {
  const dx = Math.max(l.x0 - p[0], 0, p[0] - l.x1);
  const dy = Math.max(l.y0 - p[1], 0, p[1] - l.y1);
  return Math.hypot(dx, dy);
}
const hörn = (l) => [[l.x0, l.y0], [l.x1, l.y0], [l.x1, l.y1], [l.x0, l.y1]];
function sträckaLåda(a, b, l) {
  if (iLåda(a, l) || iLåda(b, l)) return 0;
  const h = hörn(l);
  let m = Infinity;
  for (let i = 0; i < 4; i++) m = Math.min(m, sträckaSträcka(a, b, h[i], h[(i + 1) % 4]));
  return m;
}

// ---------------------------------------------------------------- former
// kapsel: streck a till b med halv bredd w (runda ändar och runda hörn)
// skiva:  fylld cirkel, målad radie r
// cirkel: cirkelkontur med radie r och halv bredd w
// låda:   axelparallell rektangel, målad yta x0..x1, y0..y1 (konturen inräknad)
const kapsel = (a, b, w) => ({ t: 'kapsel', a, b, w });
const skiva = (c, r) => ({ t: 'skiva', c, r });
const cirkel = (c, r, w) => ({ t: 'cirkel', c, r, w });
const låda = (x0, y0, x1, y1) => ({ t: 'låda', x0, y0, x1, y1 });
/** Sluten polygon som kapslar (runda hörn, strokeLinejoin round). */
const polygon = (pts, w) => pts.map((p, i) => kapsel(p, pts[(i + 1) % pts.length], w));

/** Fritt avstånd mellan två formers målade kanter (0 om de möts). */
function gap(f, g) {
  if (f.t > g.t) [f, g] = [g, f];
  const k = `${f.t}-${g.t}`;
  switch (k) {
    case 'kapsel-kapsel': return sträckaSträcka(f.a, f.b, g.a, g.b) - f.w - g.w;
    case 'kapsel-skiva': return punktSträcka(g.c, f.a, f.b) - f.w - g.r;
    case 'cirkel-kapsel': {
      const dmin = punktSträcka(f.c, g.a, g.b);
      const dmax = Math.max(dist(f.c, g.a), dist(f.c, g.b));
      const d = dmax < f.r ? f.r - dmax : dmin > f.r ? dmin - f.r : 0;
      return d - f.w - g.w;
    }
    case 'cirkel-cirkel': {
      const d = dist(f.c, g.c);
      return Math.max(0, d - f.r - g.r, Math.abs(f.r - g.r) - d) - f.w - g.w;
    }
    case 'cirkel-skiva': {
      const d = dist(f.c, g.c);
      return Math.max(0, d - g.r - f.r, f.r - d - g.r) - f.w;
    }
    case 'skiva-skiva': return dist(f.c, g.c) - f.r - g.r;
    case 'kapsel-låda': return sträckaLåda(f.a, f.b, g) - f.w;
    case 'låda-skiva': return punktLåda(g.c, f) - g.r;
    case 'låda-låda': {
      const dx = Math.max(0, g.x0 - f.x1, f.x0 - g.x1);
      const dy = Math.max(0, g.y0 - f.y1, f.y0 - g.y1);
      return Math.hypot(dx, dy);
    }
    case 'cirkel-låda': {
      const dmin = punktLåda(f.c, g);
      const dmax = Math.max(...hörn(g).map((p) => dist(f.c, p)));
      const d = dmax < f.r ? f.r - dmax : dmin > f.r ? dmin - f.r : 0;
      return d - f.w;
    }
    default: throw new Error(`Okänt formpar ${k}`);
  }
}

function bbox(former, punkter = []) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const ta = (x, y, r) => { x0 = Math.min(x0, x - r); y0 = Math.min(y0, y - r); x1 = Math.max(x1, x + r); y1 = Math.max(y1, y + r); };
  for (const f of former) {
    if (f.t === 'kapsel') { ta(...f.a, f.w); ta(...f.b, f.w); }
    else if (f.t === 'skiva') ta(...f.c, f.r);
    else if (f.t === 'cirkel') ta(...f.c, f.r + f.w);
    else { ta(f.x0, f.y0, 0); ta(f.x1, f.y1, 0); }
  }
  for (const [x, y, r] of punkter) ta(x, y, r);
  return { x0, y0, x1, y1 };
}

// ---------------------------------------------------------------- element per primitiv
// Ett element: { namn, ram (referensram), paRam (står på ramen), inuti (namnet
// på elementet det ligger i, som symbolen i en stack), korsar (korsar ett
// annat element av avsikt, som femte räknestrecket), centrum, former,
// andpunkter (öppna streckändar för G4), extra (punkter med radie för G2) }.
const el = (namn, former, o = {}) => ({ namn, former, centrum: o.centrum ?? C, andpunkter: o.andpunkter ?? [], ...o });

function glyfPunkter(d) {
  const tal = d.match(/-?\d+(\.\d+)?/g).map(Number);
  const out = [];
  for (let i = 0; i + 1 < tal.length; i += 2) out.push([tal[i], tal[i + 1], sw]);
  return out;
}
const ellipsPunkter = (e) => [[e.cx - e.rx, e.cy, sw], [e.cx + e.rx, e.cy, sw], [e.cx, e.cy - e.ry, sw], [e.cx, e.cy + e.ry, sw], [e.linje[0], e.linje[1], sw], [e.linje[2], e.linje[3], sw]];

/** Undantagna från G1 (rutnät av avsikt, granskningen avsnitt 3). */
const G1_UNDANTAG = new Set(['tile', 'lattice', 'sectorwheel']);

export function element(cell) {
  switch (cell.kind) {
    case 'glyph': {
      const d = G.glyph[cell.glyph];
      const punkter = typeof d === 'string' ? glyfPunkter(d) : ellipsPunkter(d);
      return [el('glyf', [], { extra: punkter })];
    }
    case 'orbital': {
      const o = G.orbital;
      const ut = [
        el('bana', [cirkel(C, o.banaR, o.banaSw / 2)], { ram: true, radie: o.banaR }),
        el('mittpunkt', [cell.center === 'filled' ? skiva(C, o.mittR) : cirkel(C, o.mittR, sw)]),
      ];
      if (cell.satellite !== null) ut.push(el('satellit', [skiva(pa(cell.satellite, o.banaR), o.satellitR)], { paRam: 'bana', centrum: pa(cell.satellite, o.banaR) }));
      return ut;
    }
    case 'stack': {
      const S = G.stack;
      const k = S.kvadrat;
      const bas = {
        circle: [cirkel(C, S.cirkelR, sw)],
        square: polygon([[k.x, k.y], [k.x + k.bredd, k.y], [k.x + k.bredd, k.y + k.bredd], [k.x, k.y + k.bredd]], sw),
        triangle: polygon(S.triangel, sw),
        diamond: polygon(S.romb, sw),
      }[cell.base];
      const ut = [el('bas', bas)];
      const linjer = (l) => l.map(([x1, y1, x2, y2]) => kapsel([x1, y1], [x2, y2], sw));
      const ändar = (l) => l.flatMap(([x1, y1, x2, y2]) => [[x1, y1], [x2, y2]]);
      if (cell.symbol === 'plus') ut.push(el('symbol', linjer(S.plus), { inuti: 'bas', andpunkter: ändar(S.plus) }));
      if (cell.symbol === 'minus') ut.push(el('symbol', linjer(S.minus), { inuti: 'bas', andpunkter: ändar(S.minus) }));
      if (cell.symbol === 'cross') ut.push(el('symbol', linjer(S.kryss), { inuti: 'bas', andpunkter: ändar(S.kryss) }));
      if (cell.symbol === 'dot') ut.push(el('symbol', [skiva(C, S.prickR)], { inuti: 'bas' }));
      if (cell.symbol === 'ring') ut.push(el('symbol', [cirkel(C, S.ringR, swT)], { inuti: 'bas' }));
      return ut;
    }
    case 'lattice': {
      const L = G.lattice;
      const a = L.start - swT, b = L.start + 2 * L.ruta + L.gap + swT;
      return [el('rutnät', [låda(a, a, b, b)])];
    }
    case 'tile': {
      const T = G.tile;
      const a = T.start - swT, b = T.start + 3 * T.ruta + 2 * T.gap + swT;
      return [el('rutnät', [låda(a, a, b, b)])];
    }
    case 'sectorwheel':
      return [el('hjul', [cirkel(C, G.sectorwheel.radie, sw)])];
    case 'ray': {
      const R = G.ray;
      return [el('strålar', [skiva(C, R.mittR), ...cell.rays.map((r) => kapsel(C, pa(r, R.langd), sw))])];
    }
    case 'tally': {
      const T = G.tally;
      const n = Math.min(cell.count, 4);
      const start = 50 - ((n - 1) * T.gap) / 2;
      const vrid = (p) => (cell.orientation === 'vertical' ? p : rot(p, 90));
      const ut = [];
      for (let i = 0; i < n; i++) {
        const x = start + i * T.gap;
        const a = vrid([x, 50 - T.langd / 2]), b = vrid([x, 50 + T.langd / 2]);
        ut.push(el(`streck ${i + 1}`, [kapsel(a, b, sw)], { centrum: vrid([x, 50]), andpunkter: [a, b] }));
      }
      if (cell.count === 5) {
        const a = vrid([start - T.diagonalUtstick, 50 + T.langd / 2 - T.diagonalUtstick]);
        const b = vrid([start + (n - 1) * T.gap + T.diagonalUtstick, 50 - T.langd / 2 + T.diagonalUtstick]);
        ut.push(el('femte streck', [kapsel(a, b, sw)], { korsar: true, andpunkter: [a, b] }));
      }
      return ut;
    }
    case 'ring': {
      const radier = G.ring.radier[String(Math.min(Math.max(cell.rings.length, 1), 3))];
      return cell.rings.map((_, i) => el(`ring ${i + 1}`, [cirkel(C, radier[i], swT)]));
    }
    case 'vector': {
      const V = G.vector;
      const m = cell.length === 'long' ? V.lang : V.kort;
      const h = V.huvud;
      const r = (p) => rot(p, cell.angle);
      const skaft = kapsel(r([50, m.svans]), r([50, m.spets + 2]), sw);
      const hw = cell.head === 'filled' ? swT : sw;
      const huvud = polygon([[50, m.spets], [50 - h, m.spets + h + 2], [50 + h, m.spets + h + 2]].map(r), hw);
      return [el('pil', [skaft, ...huvud])];
    }
    case 'poly': {
      const pts = Array.from({ length: cell.sides }, (_, i) => {
        const a = (((i * 360) / cell.sides - 90) * Math.PI) / 180;
        return rot([50 + G.poly.radie * Math.cos(a), 50 + G.poly.radie * Math.sin(a)], cell.rotation);
      });
      return [el('polygon', polygon(pts, cell.fill === 'black' ? 0 : sw))];
    }
    case 'dotsorbit':
      return cell.dots.map((i) => el(`prick ${i}`, [skiva(pa(i, G.dotsorbit.banaR), G.dotsorbit.prickR)], { centrum: pa(i, G.dotsorbit.banaR) }));
    case 'balanceline': {
      const B = G.balanceline;
      const ut = [
        el('baslinje', [kapsel([B.linjeX[0], B.linjeY], [B.linjeX[1], B.linjeY], sw)], { ram: true, andpunkter: [[B.linjeX[0], B.linjeY], [B.linjeX[1], B.linjeY]] }),
        ...B.avdelareX.map((x, i) => el(`avdelare ${i + 1}`, [kapsel([x, B.avdelareY[0]], [x, B.avdelareY[1]], swT)], { ram: true, centrum: [x, B.linjeY], andpunkter: [[x, B.avdelareY[0]], [x, B.avdelareY[1]]] })),
      ];
      for (const it of cell.items) {
        const c = [B.xs[it.posX], it.side === 'above' ? B.ovanY : B.underY];
        const s = B.halvbredd + sw;
        const form = it.shape === 'circle' ? skiva(c, s) : låda(c[0] - s, c[1] - s, c[0] + s, c[1] + s);
        ut.push(el(it.shape === 'circle' ? 'cirkel' : 'kvadrat', [form], { centrum: c }));
      }
      return ut;
    }
    default:
      return null;
  }
}

// ---------------------------------------------------------------- G1, G2, G4 på en cell
const fmt = (x) => (Math.round(x * 100) / 100).toString().replace('.', ',');

function kontrolleraCell(cell) {
  const fel = { g1: [], g2: [], g4: [] };
  const els = element(cell);
  if (!els) return { ...fel, okand: true };
  // G2
  for (const e of els) {
    const b = bbox(e.former, e.extra);
    const [lo, hi] = e.ram ? [RAM_MIN, RAM_MAX] : [INRE_MIN, INRE_MAX];
    if (b.x0 < lo - EPS || b.y0 < lo - EPS || b.x1 > hi + EPS || b.y1 > hi + EPS) {
      fel.g2.push(`${cell.kind}: ${e.namn} målas i [${fmt(b.x0)}, ${fmt(b.x1)}] × [${fmt(b.y0)}, ${fmt(b.y1)}], ska ligga i [${lo}, ${hi}]`);
    }
  }
  // G1
  if (!G1_UNDANTAG.has(cell.kind)) {
    for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) {
      const a = els[i], b = els[j];
      if (a.ram && b.ram) continue; // ramens delar (baslinje och avdelare) korsar av avsikt
      if (a.korsar || b.korsar) continue;
      if ((a.paRam && b.ram) || (b.paRam && a.ram)) continue; // står på ramen, G4
      let m = Infinity;
      for (const f of a.former) for (const g of b.former) m = Math.min(m, gap(f, g));
      if (m < G.regler.minGap - EPS) fel.g1.push(`${cell.kind}: ${a.namn} och ${b.namn} har ${fmt(Math.max(m, 0))} enheters fritt, minst ${G.regler.minGap}`);
    }
  }
  // G4
  for (const a of els) {
    if (a.paRam) {
      const ram = els.find((e) => e.namn === a.paRam);
      const avvik = Math.abs(dist(a.centrum, C) - ram.radie);
      if (avvik > EPS) fel.g4.push(`${cell.kind}: ${a.namn} står ${fmt(avvik)} vid sidan av ${ram.namn}`);
    }
    for (const p of a.andpunkter) for (const b of els) {
      if (a === b || a.korsar || b.korsar) continue;
      if (a.inuti === b.namn || b.inuti === a.namn) continue; // symbolen står i basen av avsikt
      if (a.ram && b.ram) continue;
      const d = dist(p, b.centrum);
      if (d < G.regler.minAndpunktTillCentrum - EPS) fel.g4.push(`${cell.kind}: ${a.namn} slutar ${fmt(d)} från centrum av ${b.namn}, minst ${G.regler.minAndpunktTillCentrum}`);
    }
  }
  return fel;
}

// ---------------------------------------------------------------- G3: alla lägen
/** Alla vridningar och platser familjerna kan använda, inte bara de visade. */
function allaLagen() {
  const ut = [];
  for (const length of ['long', 'short']) for (const head of ['filled', 'open']) for (let a = 0; a < 360; a += 45) ut.push({ kind: 'vector', angle: a, length, head });
  for (const sides of [3, 4, 5, 6, 8]) for (const fill of ['none', 'gray', 'black']) for (let r = 0; r < 360; r += 45) ut.push({ kind: 'poly', sides, rotation: r, fill });
  for (let m = 1; m < 256; m++) ut.push({ kind: 'ray', rays: [0, 1, 2, 3, 4, 5, 6, 7].filter((i) => (m >> i) & 1) });
  for (let m = 1; m < 256; m++) ut.push({ kind: 'dotsorbit', dots: [0, 1, 2, 3, 4, 5, 6, 7].filter((i) => (m >> i) & 1) });
  for (const center of ['filled', 'open']) for (const satellite of [null, 0, 1, 2, 3, 4, 5, 6, 7]) ut.push({ kind: 'orbital', center, satellite });
  for (const orientation of ['vertical', 'horizontal']) for (let count = 1; count <= 5; count++) ut.push({ kind: 'tally', count, orientation });
  // balanslinjen: kvadrat och cirkel i alla par av olika fack
  const fack = [];
  for (let posX = 0; posX < 3; posX++) for (const side of ['above', 'below']) fack.push({ posX, side });
  for (const a of fack) for (const b of fack) if (a !== b) ut.push({ kind: 'balanceline', items: [{ shape: 'square', fill: 'none', ...a }, { shape: 'circle', fill: 'none', ...b }] });
  return ut;
}

/**
 * Kombinationer som inte vrids men som en generator kan välja: grundform
 * och symbol, antal ringar, glyfer. Brott här är upplysning till generatorn
 * (kombinationen får inte väljas), inte fel, så länge ingen fråga använder den.
 */
function allaKombinationer() {
  const ut = [];
  for (const base of ['circle', 'square', 'triangle', 'diamond']) for (const symbol of ['plus', 'minus', 'dot', 'ring', 'cross', 'none']) ut.push({ kind: 'stack', base, symbol, baseFill: 'none' });
  for (let n = 1; n <= 3; n++) ut.push({ kind: 'ring', rings: Array(n).fill('none') });
  for (const glyph of Object.keys(G.glyph)) ut.push({ kind: 'glyph', glyph, fill: 'none' });
  return ut;
}

// ---------------------------------------------------------------- G6, G7, G8 på en fråga
const sgd = (a, b) => (b === 0 ? Math.abs(a) : sgd(b, a % b));
const mod = (a, n) => ((a % n) + n) % n;

function g6(q, t) {
  const fel = [];
  const fynd = [];
  for (const r of Object.values(t.regel)) {
    if (r.dim.typ !== 'rot' || !['rot-steg', 'rot-kumulativ'].includes(r.regel)) continue;
    const v0 = t.dimsVy(q.grid[0][0]).find((d) => d.id === r.dim.id).varde;
    if (v0 === null || v0 === undefined || (Array.isArray(v0) && v0.length === 0) || v0 === 0 && r.dim.tile) continue;
    const n = r.dim.n;
    let k;
    if (r.regel === 'rot-steg') k = sgd(n, mod(r.info.k, n));
    else { k = n; for (let i = 0; i < 8; i++) k = sgd(k, mod(r.info.a + r.info.b * i, n)); }
    const lagen = new Set();
    for (let j = 0; j < n; j++) lagen.add(vKey(rotera(r.dim, v0, j * k)));
    fynd.push({ dim: r.dim.id, lagen: lagen.size, n });
    if (lagen.size < G.regler.minLagen) fel.push(`${r.dim.id} har ${lagen.size} distinkta lägen, minst ${G.regler.minLagen}`);
  }
  return { fel, fynd };
}

/** Rörliga element per celltyp: varje elements läge som nyckel (null = saknas). */
function rorligaLagen(cell) {
  if (cell.kind === 'balanceline') {
    const out = {};
    for (const shape of ['square', 'circle']) {
      const it = cell.items.find((i) => i.shape === shape);
      out[shape] = it ? `${it.posX}:${it.side}` : null;
    }
    return out;
  }
  if (cell.kind === 'lattice') {
    const out = {};
    for (const typ of ['fill_black', 'fill_gray', 'dot', 'cross']) {
      const pos = cell.cells.map((x, i) => (x === typ ? i : -1)).filter((i) => i >= 0);
      out[typ] = pos.length ? pos.join(',') : null;
    }
    return out;
  }
  return null;
}

/**
 * G7 gäller frågor som påstår två rörelser (familjen tva-rorelser). När hela
 * mönstret vrids (monsterrotation) följs elementen åt av avsikt: det är en
 * rörelse, och då är takten regeln, inte ett fel.
 */
function g7(q) {
  if (q.family !== 'tva-rorelser') return [];
  const POS = [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1]];
  const celler = POS.map(([r, c]) => q.grid[r][c]);
  const L = celler.map(rorligaLagen);
  if (L.some((x) => x === null)) return [];
  const namn = Object.keys(L[0]);
  // bara element som finns i alla visade rutor och faktiskt rör sig
  const rorliga = namn.filter((n) => L.every((x) => x[n] !== null) && new Set(L.map((x) => x[n])).size > 1);
  const fel = [];
  for (let i = 0; i < rorliga.length; i++) for (let j = i + 1; j < rorliga.length; j++) {
    const A = rorliga[i], B = rorliga[j];
    const ab = new Map(), ba = new Map();
    let funktion = true;
    for (const x of L) {
      if (ab.has(x[A]) && ab.get(x[A]) !== x[B]) funktion = false;
      if (ba.has(x[B]) && ba.get(x[B]) !== x[A]) funktion = false;
      ab.set(x[A], x[B]); ba.set(x[B], x[A]);
    }
    if (funktion) fel.push(`${A} och ${B} går i takt (${ab.size} lägen, varje läge för ${A} ger exakt ett för ${B})`);
  }
  return fel;
}

function g8(q, t) {
  const fel = [];
  let steg = 0;
  const full = q.grid.map((r) => r.slice());
  full[2][2] = q.options[q.correctAnswer];
  for (const r of Object.values(t.regel)) {
    if (r.regel !== 'spegling') continue;
    const dim = r.dim;
    const f = (namn) => (v) => (namn.startsWith('spegel') ? spegelbilder(dim, v)[Number(namn.slice(6))] : rotera(dim, v, Number(namn.slice(3))));
    const val = (c) => t.dimsVy(c).find((d) => d.id === dim.id).varde;
    for (let i = 0; i < 3; i++) {
      const kedja = [0, 1, 2].map((j) => (r.info.axel === 'kolumn' ? full[i][j] : full[j][i]));
      const vard = kedja.map(val);
      const vad = r.info.axel === 'kolumn' ? `rad ${i + 1}` : `kolumn ${i + 1}`;
      for (const [s, m] of [[0, r.info.m1], [1, r.info.m2]]) {
        if (!m.startsWith('spegel')) continue;
        steg++;
        if (vKey(f(m)(vard[s])) === vKey(vard[s])) fel.push(`${vad}: ruta ${s + 1} är invariant under speglingen (${m}), ingen spegling syns`);
      }
      const nycklar = kedja.map((c) => stable(c));
      if (new Set(nycklar).size < 3) fel.push(`${vad}: två lika rutor i speglingskedjan`);
    }
  }
  return { fel, steg };
}

// ---------------------------------------------------------------- G11: tomma figurer
function tom(cell) {
  switch (cell.kind) {
    case 'lattice': return cell.cells.every((x) => x === 'empty');
    case 'tile': return cell.pattern === 0;
    case 'sectorwheel': return cell.filled.length === 0;
    case 'ray': return cell.rays.length === 0;
    case 'dotsorbit': return cell.dots.length === 0;
    case 'balanceline': return cell.items.length === 0;
    case 'tally': return cell.count === 0;
    case 'ring': return cell.rings.length === 0;
    default: return false;
  }
}

// ---------------------------------------------------------------- G5 och G10 på konstanterna
function luminans(hex) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  const k = (i) => { const c = parseInt(m[1].slice(i, i + 2), 16) / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * k(0) + 0.7152 * k(2) + 0.0722 * k(4);
}
const kontrast = (a, b) => { const [l, d] = [luminans(a), luminans(b)].sort((x, y) => y - x); return (l + 0.05) / (d + 0.05); };

function g5() {
  const s = G.skala360, k = G.g5;
  const prickar = [G.stack.prickR, G.lattice.prickR, G.ray.mittR, G.orbital.satellitR, G.dotsorbit.prickR];
  const langd = (G.vector.lang.svans - G.vector.lang.spets) - (G.vector.kort.svans - G.vector.kort.spets);
  const rader = [
    ['figuren i rutnätet', 100 * s.rutnat, k.minFigurRutnatPx],
    ['figuren i alternativen', 100 * s.alternativ, k.minFigurAlternativPx],
    ['kontur', G.kontur.sw * s.rutnat, k.minKonturPx],
    ['minsta fria avstånd (G1)', G.regler.minGap * s.rutnat, k.minAvstandPx],
    ['minsta prick (diameter)', 2 * Math.min(...prickar) * s.rutnat, k.minPrickPx],
    ['kort mot lång pil', langd * s.rutnat, k.minLangdskillnadPx],
  ];
  const upplysning = [`tunn kontur ${G.kontur.swThin} enheter = ${fmt(G.kontur.swThin * s.rutnat)} px (rutnätens ramar, sektorlinjer, ringkonturer); gränsfall som granskningen godkände för ringarna, under ${k.minKonturPx} px`];
  return { rader: rader.map(([n, px, min]) => ({ n, px, min, ok: px >= min - EPS })), upplysning };
}

function g10() {
  const F = G.farger, K = G.g10;
  const rader = [
    ['kontur', F.stroke, F.bakgrund, K.information],
    ['svart fyllning', F.fillBlack, F.bakgrund, K.information],
    ['vit symbol på svart', F.vit, F.fillBlack, K.information],
    ['orbitalens bana (referensram)', F.orbitalBana, F.bakgrund, K.referensram],
  ];
  // Orbitalens bana mappas inte av .matrisyta och står därför i samma färg
  // på mörkt papper. Kontrollera den mot varje papper i globals.css.
  const css = readFileSync(GLOBALS_CSS, 'utf8');
  const papper = [...new Set([...css.matchAll(/--papper:\s*(#[0-9A-Fa-f]{6})/g)].map((m) => m[1].toUpperCase()))];
  for (const p of papper) rader.push([`orbitalens bana på papper ${p}`, F.orbitalBana, p, K.referensram]);
  return rader.map(([n, a, b, min]) => ({ n, kvot: kontrast(a, b), min, ok: kontrast(a, b) >= min }));
}

// ---------------------------------------------------------------- körning
const filer = process.argv[2] ? [process.argv[2]] : ALLA;
const fel = [];
const kanda = [];
// Pensionerade frågor (spec-rummen 15) ligger kvar för gamla sessioner men
// väljs aldrig. De kontrolleras som alla andra, men fynden är upplysning.
const pensioneradeFynd = [];
const räkna = { fragor: 0, pensionerade: 0, celler: 0, g1: 0, g2: 0, g3: 0, g4: 0, g6: 0, g6fragor: 0, g6min: Infinity, g7: 0, g7fragor: 0, g7kanda: 0, g8: 0, g8steg: 0, g8fragor: 0, g9: 0, g11: 0, g11alt: 0, g11fragor: 0, g12: 0 };
const g6Grans = [];
const kandaKvar = { g7: new Set(), g11: new Set() };

for (const fil of filer) {
  const bank = JSON.parse(readFileSync(fil, 'utf8'));
  const expert = /Expert/.test(fil);
  for (const q of bank) {
    räkna.fragor++;
    const tag = `[${q.id}]`;
    const pensionerad = q.pensionerad === true;
    if (pensionerad) räkna.pensionerade++;
    /** Ett fynd: fel för valbara frågor, upplysning för pensionerade. */
    const fynd = (regel, text) => {
      if (pensionerad) { pensioneradeFynd.push(`${tag} ${regel}: ${text}`); return; }
      räkna[regel.toLowerCase()]++;
      fel.push(`${tag} ${regel}: ${text}`);
    };
    if (q.typ === 'figurserie' || Array.isArray(q.serie)) räkna.g9++;
    const alla = [...q.grid.flat(), ...q.options].filter((c) => c !== null);
    // G12
    const lager = alla.filter((c) => Array.isArray(c)).length;
    if (lager) { fynd('G12', `${lager} lagerceller, en sammansatt primitiv kräver eget beslut och egna G1 till G4-mått`); continue; }
    // G1, G2, G4 på varje visad cell
    for (const c of alla) {
      räkna.celler++;
      const k = kontrolleraCell(c);
      if (k.okand) { fel.push(`${tag} okänd celltyp ${c.kind}, saknar geometri`); continue; }
      for (const g of ['g1', 'g2', 'g4']) k[g].forEach((x) => fynd(g.toUpperCase(), x));
    }
    // G11
    const tommaRutor = q.grid.flat().filter((c) => c !== null && tom(c)).length;
    const tommaAlt = q.options.map((o, i) => (tom(o) ? i + 1 : 0)).filter(Boolean);
    if (tommaRutor) fynd('G11', `${tommaRutor} tomma figurer i rutnätet`);
    if (tommaAlt.length) { räkna.g11fragor++; räkna.g11alt += tommaAlt.length; }
    if (tommaAlt.length > 1) fynd('G11', `${tommaAlt.length} tomma alternativ (${tommaAlt.join(', ')}), högst ett`);
    if (tommaAlt.length && expert) {
      const text = `tomt alternativ ${tommaAlt.join(', ')} på expert`;
      if (G11_KANDA.has(q.id)) { kandaKvar.g11.add(q.id); kanda.push(`${tag} G11: ${text}`); }
      else fynd('G11', text);
    }
    // G6, G7, G8 kräver tolkningen
    const t = tolka(q);
    if (!t.ok) continue;
    const r6 = g6(q, t);
    if (r6.fynd.length) räkna.g6fragor++;
    for (const f of r6.fynd) {
      räkna.g6min = Math.min(räkna.g6min, f.lagen);
      // gränsfall: elementet kunde ha haft fler lägen men symmetrin eller
      // steget ger precis det minsta tillåtna
      if (f.lagen === G.regler.minLagen && f.lagen < f.n) g6Grans.push(`${q.id} (${f.dim}, ${f.lagen} av ${f.n})`);
    }
    r6.fel.forEach((x) => fynd('G6', x));
    if (q.family === 'tva-rorelser') räkna.g7fragor++;
    for (const x of g7(q)) {
      if (G7_KANDA.has(q.id) && !pensionerad) { kandaKvar.g7.add(q.id); räkna.g7kanda++; kanda.push(`${tag} G7: ${x}`); }
      else fynd('G7', x);
    }
    const r8 = g8(q, t);
    if (r8.steg) räkna.g8fragor++;
    räkna.g8steg += r8.steg;
    r8.fel.forEach((x) => fynd('G8', x));
  }
}

// Kända undantag som inte längre bryter kan strykas (bara vid körning på alla banker)
const inaktuella = filer === ALLA
  ? [...[...G11_KANDA].filter((id) => !kandaKvar.g11.has(id)), ...[...G7_KANDA].filter((id) => !kandaKvar.g7.has(id))]
  : [];

// G3: alla lägen familjerna kan använda
const lagen = allaLagen();
for (const c of lagen) {
  const k = kontrolleraCell(c);
  [...k.g1, ...k.g2, ...k.g4].forEach((x) => { räkna.g3++; fel.push(`[alla lägen] G3: ${x} (${stable(c)})`); });
}
// Kombinationer som ingen fråga använder: upplysning till generatorn
const kombinationer = allaKombinationer();
const kombinationsFynd = [];
for (const c of kombinationer) {
  const k = kontrolleraCell(c);
  [...k.g1, ...k.g2, ...k.g4].forEach((x) => kombinationsFynd.push(`${x} (${stable(c)})`));
}

const r5 = g5();
const r10 = g10();
r5.rader.filter((x) => !x.ok).forEach((x) => fel.push(`[konstanter] G5: ${x.n} ${fmt(x.px)} px, minst ${x.min} px`));
r10.filter((x) => !x.ok).forEach((x) => fel.push(`[konstanter] G10: ${x.n} ${fmt(x.kvot)}:1, minst ${x.min}:1`));

const ok = (n) => (n === 0 ? '✓' : '✗');
const valbara = räkna.fragor - räkna.pensionerade;
console.log(`\nGeometrikontroll: ${räkna.fragor} frågor i ${filer.length} banker (${räkna.pensionerade} pensionerade, ${valbara} valbara), ${räkna.celler} celler. Mått ur src/lib/logicTestV7/geometri.json.\n`);
console.log(`  ${ok(räkna.g1)} G1  fritt mellan element ≥ ${G.regler.minGap}: ${räkna.g1} fel (tile, lattice och sektorhjul undantas)`);
console.log(`  ${ok(räkna.g2)} G2  inom [${INRE_MIN}, ${INRE_MAX}], ramar inom [${RAM_MIN}, ${RAM_MAX}]: ${räkna.g2} fel`);
console.log(`  ${ok(räkna.g3)} G3  alla lägen, ${lagen.length} varianter (åtta vridningar, alla fack): ${räkna.g3} fel`);
console.log(`  ${ok(räkna.g4)} G4  streckändar ≥ ${G.regler.minAndpunktTillCentrum} från annat centrum, centrum på ramen: ${räkna.g4} fel`);
console.log(`  ${ok(r5.rader.filter((x) => !x.ok).length)} G5  360 px: ${r5.rader.map((x) => `${x.n} ${fmt(x.px)} px (≥ ${x.min})`).join('; ')}`);
r5.upplysning.forEach((x) => console.log(`        upplysning: ${x}`));
console.log(`  ${ok(räkna.g6)} G6  ≥ ${G.regler.minLagen} lägen: ${räkna.g6fragor} frågor med vridning, ${räkna.g6} fel, minst ${räkna.g6min === Infinity ? '-' : räkna.g6min} lägen`);
if (g6Grans.length) console.log(`        gränsfall (precis ${G.regler.minLagen} lägen av fler möjliga): ${g6Grans.join(', ')}`);
console.log(`  ${ok(räkna.g7)} G7  rörelser i takt: ${räkna.g7fragor} frågor med två rörelser, ${räkna.g7kanda} kända brott, ${räkna.g7} fel`);
console.log(`  ${ok(räkna.g8)} G8  spegling: ${räkna.g8fragor} frågor, ${räkna.g8steg} speglingssteg, ${räkna.g8} fel`);
console.log(`  · G9  figurserier: ej tillämplig, ${räkna.g9} figurserier i bankerna`);
console.log(`  ${ok(r10.filter((x) => !x.ok).length)} G10 kontrast: ${r10.map((x) => `${x.n} ${fmt(x.kvot)}:1 (≥ ${x.min})`).join('; ')}`);
console.log(`  ${ok(räkna.g11)} G11 tomma figurer: ${räkna.g11alt} tomma alternativ i ${räkna.g11fragor} frågor, ${kandaKvar.g11.size} kända på expert, ${räkna.g11} fel`);
console.log(`  ${ok(räkna.g12)} G12 lagerceller: ${räkna.g12} fel`);
if (kanda.length) {
  console.log(`\nKända brott, byts i generatorn och inte för hand (${kanda.length}):`);
  kanda.forEach((x) => console.log('  · ' + x));
}
if (kombinationsFynd.length) {
  console.log(`\nUpplysning till generatorn, kombinationer som ingen fråga använder i dag och som inte får väljas (${kombinationsFynd.length}):`);
  kombinationsFynd.forEach((x) => console.log('  · ' + x));
}
if (pensioneradeFynd.length) {
  console.log(`\nUpplysning om pensionerade frågor, räknas inte som fel (${pensioneradeFynd.length}):`);
  pensioneradeFynd.forEach((x) => console.log('  · ' + x));
}
if (inaktuella.length) {
  console.log(`\nUpplysning: ${inaktuella.join(', ')} bryter inte längre och kan strykas ur listan med kända brott.`);
}
if (fel.length === 0) {
  console.log('\n✓ Inga geometrifel i de valbara frågorna.');
  process.exit(0);
}
console.log(`\n✗ ${fel.length} fel:\n`);
fel.forEach((x) => console.log('  - ' + x));
process.exit(1);
