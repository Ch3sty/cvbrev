// scripts/lib/matris/sparrar.mjs
// =============================================================================
// Spärrarna mot facit-genvägen (plan-facit-genvag avsnitt 3, tillägget om
// variation 2.1 punkt 4). Varje spärr är en funktion per fråga, utom S1b och
// S4b (kvoter över en nivås pool) och S8 och S10 (över en receptkörning).
// De körs på tre ställen: i bygg() (ett underkänt försök slängs), i
// v7-facit-check.mjs (fel för frågor med fran_version 3 och för kandidater,
// upplysning för de frysta) och i v7-distraktor-check.mjs (S5, S6).
//
// "Lika" betyder lika per dimension (dimsFor, vKey), inte råcellen, så att
// ordningsskillnader i listor inte döljer en kopia.
//
//   S1   facit_ruta0      facit lika ruta 0 (inte latin-antal, latin-form)
//   S1b  facitruta_kvot   högst 20 % per facitruta och nivå, högst 10 % ruta 0
//   S2   facit_kopia      facit lika en synlig ruta bara med minst två
//                         distraktorkopior, aldrig rutan ovanför eller till vänster
//   S3   vanligast        facit är inte den vanligaste figuren bland de åtta
//   S4   enrad            facit följer inte av rad 3 ensam (expert och plus);
//                         S4b högst 40 % på avancerad; upplysning på grund
//   S5   facit_udda       (distraktorer.mjs)
//   S6   eliminerbar      (distraktorer.mjs)
//   S7   takt och tomt    geometrikontrollen per fråga (G7, G11 och övriga)
//   S8   struktur         minst två utseenden per recept med minst fyra frågor
//   S9   lasordning       ingen regel i läsordning (avancerad och expert)
//   S10  utseende         inom ett recept: ingen bas, symbol, fyllning eller
//                         vridriktning i fler än hälften, och två frågor delar
//                         aldrig både utseende och primitiv
//
// Rutornas nummer: ruta 0 uppe till vänster, ruta 4 i mitten, ruta 7 till
// vänster om luckan (läsordning, index i POS).
// =============================================================================

import { dimsFor, vKey, stable, rotera, mod, primitivFor } from './celler.mjs';
import { tolka, POS } from './tolka.mjs';
import { facitUdda, eliminerbara } from './distraktorer.mjs';
import { geometriFraga } from '../../v7-geometri-check.mjs';

export const LATIN_UNDANTAG = new Set(['latin-antal', 'latin-form']);

/** Cellens nyckel per dimension. */
export function dimNyckel(cell) {
  if (cell === null || cell === undefined) return 'null';
  const d = dimsFor(cell);
  return d ? d.map((x) => `${x.id}=${vKey(x.varde)}`).join('|') : stable(cell);
}

/** De synliga rutor (0 till 7) som är lika facit per dimension. */
export function facitRutor(q) {
  const f = dimNyckel(q.options?.[q.correctAnswer]);
  return POS.map(([r, c], i) => (dimNyckel(q.grid[r][c]) === f ? i : -1)).filter((i) => i >= 0);
}

const niva = (q) => {
  const m = /^v7([gae])-/.exec(q?.id ?? '');
  return m ? { g: 'grund', a: 'avancerad', e: 'expert' }[m[1]] : null;
};
export const arExpert = (q) => q.band === 'plus' || niva(q) === 'expert';

// ---------------------------------------------------------------- S1, S2, S3
export function s1(q) {
  if (LATIN_UNDANTAG.has(q.family)) return [];
  return facitRutor(q).includes(0) ? [`${q.id}: S1 facit är lika rutan uppe till vänster`] : [];
}

export function s2(q) {
  const rutor = facitRutor(q);
  if (!rutor.length) return [];
  const fel = [];
  if (rutor.includes(5) || rutor.includes(7)) fel.push(`${q.id}: S2 facit är lika rutan ovanför eller till vänster`);
  const synliga = new Set(POS.map(([r, c]) => dimNyckel(q.grid[r][c])));
  const kopior = q.options.filter((o, i) => i !== q.correctAnswer && synliga.has(dimNyckel(o))).length;
  if (kopior < 2) fel.push(`${q.id}: S2 facit är lika ruta ${rutor.join(' och ')} men bara ${kopior} distraktorer är kopior av synliga rutor (minst två krävs)`);
  return fel;
}

export function s3(q) {
  if (LATIN_UNDANTAG.has(q.family)) return [];
  const antal = new Map();
  for (const [r, c] of POS) { const k = dimNyckel(q.grid[r][c]); antal.set(k, (antal.get(k) ?? 0) + 1); }
  const max = Math.max(...antal.values());
  if (max < 2) return [];
  return antal.get(dimNyckel(q.options[q.correctAnswer])) === max ? [`${q.id}: S3 facit är den vanligaste figuren bland de åtta (${max} gånger)`] : [];
}

// ---------------------------------------------------------------- S4
/**
 * Förutsägelsen ur rad 3 ensam, per dimension: vridning 2·v7 − v6, mängd
 * samma vridning som v6 till v7, kategori v7 om v6 = v7 annars v6. Null när
 * en dimension inte går att förutsäga (då är frågan ingen enradsfråga).
 */
function enradPred(q) {
  const d6 = dimsFor(q.grid[2][0]);
  const d7 = dimsFor(q.grid[2][1]);
  if (!d6 || !d7) return null;
  const pred = {};
  for (const d of d6) {
    const v6 = d.varde; const v7 = d7.find((x) => x.id === d.id)?.varde;
    if (d.typ === 'rot' && v6 !== null && v7 !== null && v6 !== undefined && v7 !== undefined) {
      if (d.mangd || d.tile) {
        const preds = new Set();
        for (let k = 0; k < d.n; k++) if (vKey(rotera(d, v6, k)) === vKey(v7)) preds.add(vKey(rotera(d, v7, k)));
        if (preds.size !== 1) return null;
        pred[d.id] = [...preds][0];
      } else pred[d.id] = vKey(mod(2 * v7 - v6, d.n));
    } else pred[d.id] = vKey(vKey(v6) === vKey(v7) ? v7 : v6);
  }
  return pred;
}

/** Facit följer av rad 3 ensam: exakt ett alternativ stämmer på allt, och det är facit. */
export function arEnrad(q) {
  const pred = enradPred(q);
  if (!pred) return false;
  const traffar = q.options.map((o, i) => (dimsFor(o)?.every((d) => pred[d.id] === vKey(d.varde)) ? i : -1)).filter((i) => i >= 0);
  return traffar.length === 1 && traffar[0] === q.correctAnswer;
}

export function s4(q) {
  return arExpert(q) && arEnrad(q) ? [`${q.id}: S4 facit följer av rad 3 ensam`] : [];
}

// ---------------------------------------------------------------- S5, S6
export function s5(q) {
  return facitUdda(q).map((d) => `${q.id}: S5 facit är ensamt om sitt värde i ${d} medan två distraktorer delar värde där`);
}
export function s6(q) {
  const e = eliminerbara(q);
  const tak = arExpert(q) ? 0 : 1;
  return e.length > tak ? [`${q.id}: S6 ${e.length} distraktorer kan strykas utan att regeln lästs (${e.join(', ')}), högst ${tak}`] : [];
}

// ---------------------------------------------------------------- S7
export function s7(q) {
  return geometriFraga(q, { expert: arExpert(q), strikt: true }).map((x) => `${q.id}: S7 ${x}`);
}

// ---------------------------------------------------------------- S9
const LASORDNINGS_REGLER = new Set(['rot-steg', 'rot-kumulativ', 'antal-steg']);
/**
 * Regler i läsordning. Period 2 i läsordning är ett schackmönster i ett
 * 3×3-rutnät (index 3r + c har samma paritet som r + c) och räknas som
 * rutnätskopplat; period 3 är en kolumnregel. Kvar är period 4.
 */
export function lasordningsDimensioner(q, t = tolka(q)) {
  if (!t?.ok) return [];
  return Object.entries(t.regel)
    .filter(([, r]) => LASORDNINGS_REGLER.has(r.regel) || (r.regel === 'periodisk' && r.info.p === 4))
    .map(([id]) => id);
}
export function s9(q, t = tolka(q)) {
  const fel = [];
  if (/som en lång rad/i.test(q.rule ?? '')) fel.push(`${q.id}: S9 regeltexten säger "som en lång rad"`);
  const dims = lasordningsDimensioner(q, t);
  if (dims.length) fel.push(`${q.id}: S9 regel i läsordning (${dims.join(', ')})`);
  return fel;
}

// ---------------------------------------------------------------- per fråga
/**
 * Alla spärrar per fråga för en ny fråga (fran_version 3 eller kandidat).
 * Returnerar { fel, info }: S4 är fel bara på expert och plus, S9 fel på
 * avancerad och expert; resten är fel för alla nya. Upplysningarna är S4 och
 * S9 på de nivåer där de inte stoppar.
 */
export function sparrFel(q, { t = tolka(q), geometri = true } = {}) {
  const n = q.band === 'plus' ? 'expert' : niva(q);
  const fel = [...s1(q), ...s2(q), ...s3(q), ...s5(q), ...s6(q), ...(geometri ? s7(q) : [])];
  const info = [];
  const enrad = arEnrad(q);
  if (enrad && (n === 'expert')) fel.push(`${q.id}: S4 facit följer av rad 3 ensam`);
  else if (enrad) info.push(`${q.id}: S4 enradsfråga`);
  const lo = s9(q, t);
  if (n === 'grund') info.push(...lo); else fel.push(...lo);
  return { fel, info };
}

// ---------------------------------------------------------------- S1b, S4b
/** Andelen frågor per facitruta (0 till 7) i en pool. */
export function facitrutaAndelar(fragor) {
  const n = fragor.length || 1;
  const per = Array(8).fill(0);
  for (const q of fragor) for (const i of facitRutor(q)) per[i]++;
  return per.map((x) => ({ antal: x, andel: x / n }));
}
export function kvotFel(fragor, nivaNamn) {
  const fel = [];
  const a = facitrutaAndelar(fragor);
  a.forEach((x, i) => {
    const tak = i === 0 ? 0.1 : 0.2;
    if (x.andel > tak + 1e-9) fel.push(`${nivaNamn}: S1b facit är lika ruta ${i} i ${(x.andel * 100).toFixed(1)} % av frågorna, högst ${tak * 100} %`);
  });
  if (nivaNamn === 'avancerad') {
    const enrad = fragor.filter(arEnrad).length;
    if (enrad / (fragor.length || 1) > 0.4 + 1e-9) fel.push(`avancerad: S4b ${enrad} av ${fragor.length} är enradsfrågor, högst 40 %`);
  }
  return fel;
}

// ---------------------------------------------------------------- S8, S10
/**
 * Utseendet: regel och parametrar per dimension (steg, axel, operation,
 * period) plus mönstret över rutnätet med värdena ersatta av ordningstal.
 * Två frågor med samma utseende skiljer sig bara i startläget.
 */
export function utseendeNyckel(q, t = tolka(q)) {
  if (!t?.ok) return null;
  const full = q.grid.map((rad) => rad.slice());
  full[2][2] = q.options[q.correctAnswer];
  return Object.entries(t.regel).map(([id, r]) => {
    const ord = new Map();
    const monster = full.flat().map((c) => { const v = vKey(t.dimsVy(c).find((d) => d.id === id).varde); if (!ord.has(v)) ord.set(v, ord.size); return ord.get(v); }).join('');
    const i = r.info ?? {};
    // Värdena räknas för regler som inte är vridningar: vilka former,
    // symboler och riktningar en fråga använder är en del av utseendet, men
    // startläget i en vridning är det inte.
    // För en mängd eller ett block som vrids är formen (upp till vridning) en
    // del av utseendet.
    const dim = r.dim;
    const form = (v) => (dim?.mangd || dim?.tile ? Array.from({ length: dim.n }, (_, j) => vKey(rotera(dim, v, j))).sort()[0] : '');
    const former = ROTATIONSREGLER.has(r.regel) && (dim?.mangd || dim?.tile) ? `<${[...new Set(full.flat().map((c) => form(t.dimsVy(c).find((d) => d.id === id).varde)))].sort().join(';')}>` : '';
    const varden = ROTATIONSREGLER.has(r.regel) ? former : `{${[...ord.keys()].sort().join(',')}}`;
    return `${id}:${r.regel}:${[i.k, i.axel, i.vaxlar, i.op, i.p, i.d].map((x) => x ?? '').join(',')}:${monster}${varden}`;
  }).join('/');
}

const ROTATIONSREGLER = new Set(['rad-steg', 'rot-steg', 'rot-kumulativ', 'spegling', 'overlagring', 'overlagring-vriden']);
const receptFor = (q) => q.recept ?? q.mekanism ?? q.family;

/** S8: struktur utan värden (mönster och regelparametrar). `undantag`: recept som godkänts med en struktur. */
export function strukturFelV3(fragor, undantag = {}) {
  const per = {};
  const utanVarden = (q) => utseendeNyckel(q)?.replace(/{[^}]*}/g, '');
  for (const q of fragor) (per[receptFor(q)] ??= []).push(utanVarden(q));
  return Object.entries(per)
    .filter(([r, n]) => n.length >= 4 && new Set(n).size < 2 && !undantag[r])
    .map(([r, n]) => `${r}: S8 alla ${n.length} frågor har samma utseende`);
}

/** Egenskaper som är desamma i hela rutnätet (frågans "utseende" för S10). */
function konstantaDrag(q, t) {
  const drag = [];
  const full = [...q.grid.flat().filter(Boolean), q.options[q.correctAnswer]];
  const c0 = full[0];
  const konst = (f) => full.every((c) => f(c) === f(c0)) ? f(c0) : null;
  if (c0.kind === 'stack') {
    const b = konst((c) => c.base); if (b) drag.push(`bas:${b}`);
    const s = konst((c) => c.symbol); if (s) drag.push(`symbol:${s}`);
    const f = konst((c) => c.baseFill); if (f) drag.push(`fyllning:${f}`);
  }
  if (c0.kind === 'poly') { const f = konst((c) => c.fill); if (f) drag.push(`fyllning:${f}`); }
  if (c0.kind === 'vector') {
    const l = konst((c) => c.length); if (l) drag.push(`langd:${l}`);
    const h = konst((c) => c.head); if (h) drag.push(`spets:${h}`);
  }
  if (c0.kind === 'orbital') { const m = konst((c) => c.center); if (m) drag.push(`fyllning:${m}`); }
  for (const r of Object.values(t?.regel ?? {})) {
    if ((r.regel === 'rad-steg' || r.regel === 'rot-steg') && r.dim.n) drag.push(`riktning:${r.info.k * 2 < r.dim.n ? 'medurs' : 'moturs'}`);
  }
  return [...new Set(drag)];
}

export function utseendeFel(fragor) {
  const fel = [];
  const per = {};
  for (const q of fragor) (per[receptFor(q)] ??= []).push(q);
  for (const [recept, qs] of Object.entries(per)) {
    const tak = Math.ceil(qs.length / 2);
    const rakna = new Map();
    const sett = new Map();
    for (const q of qs) {
      const t = tolka(q);
      for (const d of konstantaDrag(q, t)) rakna.set(d, (rakna.get(d) ?? 0) + 1);
      const k = `${utseendeNyckel(q, t)}#${primitivFor(q)}`;
      if (sett.has(k)) fel.push(`${recept}: S10 ${q.id} och ${sett.get(k)} har samma utseende och primitiv`);
      else sett.set(k, q.id);
    }
    if (qs.length >= 3) for (const [d, n] of rakna) if (n > tak) fel.push(`${recept}: S10 ${d} i ${n} av ${qs.length} frågor, högst ${tak}`);
  }
  return fel;
}

export { primitivFor, niva as nivaForId };
