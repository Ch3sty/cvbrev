// scripts/lib/serie/sparrar.mjs
// =============================================================================
// Spärrarna för figurserier (beställningen omgång 2, A4). Varje spärr är en
// funktion per fråga som returnerar felmeningar. De körs i bygg()
// (generera-serie.mjs: ett underkänt försök slängs), i
// scripts/v7-facit-check.mjs --serie och i scripts/validate-figurserier.mjs.
//
//   FS1 aterkomst  facit och alla distraktorer skiljer sig per dimension från
//                  var och en av de fem visade; ingen visad lika en annan (G9)
//   FS2 period     hela figurens period minst 6 (G9)
//   FS3 takt       inget par rörliga dimensioner är en bijektion över de fem
//                  visade (G7)
//   FS4 entydig    alla regelhypoteser som passar ger samma sjätte figur, och
//                  exakt ett alternativ är den
//   FS5 steg_fram  position 4 som distraktor är förbjuden; position 6 bara om
//                  den inte är lika någon visad
//   FS6 antal_tak  antal inom primitivens gränser och inga tomma figurer, i
//                  raden och i alla alternativ
//
// Ur matrisernas spärrar (scripts/lib/matris/sparrar.mjs), räknade per
// dimension över de sex alternativen med seriens dimensioner:
//   S5  facit_udda    facit ensamt om sitt värde medan två distraktorer delar
//   S6  eliminerbar   högst en distraktor kan strykas genom majoritet på grund
//                     och avancerad, ingen på expert
//   S11 majoritet     facits värde strikt vanligast i en dimension: fel på
//                     expert, upplysning annars. Röstningen (strikt vanligast
//                     i varje regelstyrd dimension) är fel på alla nivåer
//   S12 utanfor       i en dimension som följer en cykel bär en distraktor ett
//                     värde som saknas i raden: högst en, ingen på expert
//   S13 otestad       en regelstyrd dimension har samma värde i alla sex
// =============================================================================

import { PRIM, lasCell, dimNyckel, giltigt, stable } from './celler-serie.mjs';
import { tolkaRad, period, iTakt, sekvens, VISADE } from './tolka-serie.mjs';

export const MIN_PERIOD = 6;
const BOKSTAV = 'ABCDEF';

export const arExpert = (q) => q.niva === 'expert';

/** Regelstyrda dimensioner: de som inte är konstanta enligt frågans regler. */
export function regelDims(q) {
  const r = q.regler?.dims ?? {};
  return Object.keys(r).filter((id) => r[id].regel !== 'konstant');
}

// ---------------------------------------------------------------- FS1
export function fs1(q) {
  const fel = [];
  const visade = q.rad.map(dimNyckel);
  if (new Set(visade).size < visade.length) fel.push(`${q.id}: FS1 aterkomst, två visade figurer är lika`);
  q.options.forEach((o, i) => {
    const k = dimNyckel(o);
    const j = visade.indexOf(k);
    if (j >= 0) fel.push(`${q.id}: FS1 aterkomst, ${i === q.correctAnswer ? 'facit' : `alternativ ${BOKSTAV[i]}`} är lika figur ${j + 1} i raden`);
  });
  const alt = q.options.map(dimNyckel);
  if (new Set(alt).size < alt.length) fel.push(`${q.id}: FS1 aterkomst, två alternativ är lika`);
  return fel;
}

// ---------------------------------------------------------------- FS2
export function fs2(q) {
  if (!q.regler) return [`${q.id}: FS2 period, frågan saknar regler`];
  const P = period(q.regler.prim, q.regler.dims);
  return P < MIN_PERIOD ? [`${q.id}: FS2 period, hela figurens period är ${P}, minst ${MIN_PERIOD}`] : [];
}

// ---------------------------------------------------------------- FS3
export function fs3(q) {
  return iTakt(q.rad).map(([a, b]) => `${q.id}: FS3 takt, ${a} och ${b} går i takt över de fem visade`);
}

// ---------------------------------------------------------------- FS4
/** Indexen bland alternativen som är tolkningens sjätte figur. */
export function traffar(q, t = tolkaRad(q.rad)) {
  if (!t.ok || !t.entydig) return [];
  const nyckel = `${t.prim}|${PRIM[t.prim].dims.map((d) => `${d.id}=${t.pred[d.id]}`).join('|')}`;
  return q.options.map((o, i) => (dimNyckel(o) === nyckel ? i : -1)).filter((i) => i >= 0);
}
export function fs4(q, t = tolkaRad(q.rad)) {
  if (!t.ok) return [`${q.id}: FS4 entydig, ${t.orsak}`];
  if (!t.entydig) {
    const tvetydiga = Object.entries(t.per)
      .filter(([, x]) => !x.entydig)
      .map(([id, x]) => `${id} (${x.hyp.length === 0 ? 'ingen regel passar' : x.hyp.map((h) => `${h.regel}${h.pred === null ? ' utan svar' : ` ger ${h.pred}`}`).join(', ')})`);
    return [`${q.id}: FS4 entydig, tvetydig: ${tvetydiga.join('; ')}`];
  }
  const tr = traffar(q, t);
  if (tr.length !== 1) return [`${q.id}: FS4 entydig, ${tr.length} alternativ är den sjätte figuren`];
  if (tr[0] !== q.correctAnswer) return [`${q.id}: FS4 entydig, tolkningen ger ${BOKSTAV[tr[0]]} men facit är ${BOKSTAV[q.correctAnswer]}`];
  return [];
}

// ---------------------------------------------------------------- FS5
export function fs5(q) {
  const fel = [];
  const fem = dimNyckel(q.rad[VISADE - 1]);
  const visade = new Set(q.rad.map(dimNyckel));
  let sjunde = null;
  if (q.regler) {
    const v = Object.fromEntries(PRIM[q.regler.prim].dims.map((d) => [d.id, sekvens(d, q.regler.dims[d.id], 6)]));
    if (PRIM[q.regler.prim].dims.every((d) => giltigt(d, v[d.id]))) sjunde = dimNyckel(PRIM[q.regler.prim].bygg(v));
  }
  q.options.forEach((o, i) => {
    if (i === q.correctAnswer) return;
    const k = dimNyckel(o);
    if (k === fem) fel.push(`${q.id}: FS5 steg_fram, alternativ ${BOKSTAV[i]} är figur 5 (en kopia)`);
    if (sjunde && k === sjunde && visade.has(k)) fel.push(`${q.id}: FS5 steg_fram, alternativ ${BOKSTAV[i]} är figur 7 och lika en visad`);
  });
  return fel;
}

// ---------------------------------------------------------------- FS6
const TOM = (c) =>
  (c.kind === 'ray' && c.rays.length === 0) ||
  (c.kind === 'sectorwheel' && c.filled.length === 0) ||
  (c.kind === 'tile' && c.pattern === 0);
export function fs6(q) {
  const fel = [];
  const celler = [...q.rad.map((c, i) => [c, `figur ${i + 1}`]), ...q.options.map((c, i) => [c, `alternativ ${BOKSTAV[i]}`])];
  for (const [c, namn] of celler) {
    if (!c || Array.isArray(c)) { fel.push(`${q.id}: FS6 antal_tak, ${namn} saknas eller är en lagercell`); continue; }
    if (TOM(c)) { fel.push(`${q.id}: FS6 antal_tak, ${namn} är en tom figur`); continue; }
    const l = lasCell(c);
    if (!l) { fel.push(`${q.id}: FS6 antal_tak, ${namn} går inte att läsa (${c.kind})`); continue; }
    for (const d of PRIM[l.prim].dims) if (!giltigt(d, l.v[d.id])) fel.push(`${q.id}: FS6 antal_tak, ${namn} har ${d.id} = ${l.v[d.id]} utanför gränserna`);
  }
  return fel;
}

// ---------------------------------------------------------------- per dimension över alternativen
export function vardenPerDim(q) {
  const per = new Map();
  q.options.forEach((o, i) => {
    const l = lasCell(o);
    if (!l) return;
    for (const d of PRIM[l.prim].dims) {
      if (!per.has(d.id)) per.set(d.id, []);
      per.get(d.id)[i] = stable(l.v[d.id]);
    }
  });
  return per;
}
const rakna = (v) => { const m = new Map(); v.forEach((x) => m.set(x, (m.get(x) ?? 0) + 1)); return m; };

/** S5: dimensionerna där facit sticker ut. */
export function facitUdda(q) {
  const ut = [];
  for (const [id, v] of vardenPerDim(q)) {
    const n = rakna(v);
    if (n.get(v[q.correctAnswer]) !== 1) continue;
    const dist = rakna(v.filter((_, i) => i !== q.correctAnswer));
    if ([...dist.values()].some((x) => x >= 2)) ut.push(id);
  }
  return ut;
}
export const s5 = (q) => facitUdda(q).map((d) => `${q.id}: S5 facit_udda, facit är ensamt om sitt värde i ${d} medan två distraktorer delar värde där`);

/** S6: distraktorer som kan strykas genom majoritet. */
export function eliminerbara(q) {
  const ut = new Set();
  for (const [, v] of vardenPerDim(q)) {
    const n = rakna(v);
    if ((n.get(v[q.correctAnswer]) ?? 0) < 2) continue;
    v.forEach((x, i) => { if (i !== q.correctAnswer && n.get(x) === 1) ut.add(BOKSTAV[i]); });
  }
  return [...ut].sort();
}
export function s6(q) {
  const e = eliminerbara(q);
  const tak = arExpert(q) ? 0 : 1;
  return e.length > tak ? [`${q.id}: S6 eliminerbar, ${e.length} distraktorer kan strykas utan att regeln lästs (${e.join(', ')}), högst ${tak}`] : [];
}

/** S11 majoritet: dimensionerna där facits värde är strikt vanligast. */
export function majoritet(q) {
  const ut = [];
  for (const [id, v] of vardenPerDim(q)) {
    const n = rakna(v);
    if (n.size < 2) continue;
    const f = n.get(v[q.correctAnswer]);
    if ([...n.entries()].every(([k, c]) => k === v[q.correctAnswer] || c < f)) ut.push(id);
  }
  return ut;
}
export function s11(q) {
  const maj = majoritet(q);
  const regel = regelDims(q);
  const fel = [];
  const info = [];
  const majText = maj.map((id) => `${q.id}: S11 majoritet, facits värde i ${id} är vanligast bland alternativen`);
  if (arExpert(q)) fel.push(...majText); else info.push(...majText);
  if (regel.length > 0 && regel.every((id) => maj.includes(id))) fel.push(`${q.id}: S11 röstning, facits värde är vanligast i alla regelstyrda egenskaper (${regel.join(', ')}), facit går att rösta fram`);
  return { fel, info };
}

/** S12: distraktorer med ett värde som saknas i raden, i dimensioner som följer en cykel. */
export function utanfor(q) {
  const dims = Object.entries(q.regler?.dims ?? {}).filter(([, r]) => r.regel === 'cykel').map(([id]) => id);
  const ut = new Set();
  for (const id of dims) {
    const rad = new Set(q.rad.map((c) => stable(lasCell(c)?.v[id])));
    q.options.forEach((o, i) => { if (i !== q.correctAnswer && !rad.has(stable(lasCell(o)?.v[id]))) ut.add(i); });
  }
  return [...ut];
}
export function s12(q) {
  const ut = utanfor(q);
  const tak = arExpert(q) ? 0 : 1;
  return ut.length > tak ? [`${q.id}: S12 utanfor, ${ut.length} distraktorer har ett värde som inte finns i raden i en egenskap som följer en cykel, högst ${tak}`] : [];
}

/** S13: en regel vars dimension har samma värde i alla sex alternativ. */
export function s13(q) {
  const per = vardenPerDim(q);
  return regelDims(q)
    .filter((id) => new Set(per.get(id) ?? []).size < 2)
    .map((id) => `${q.id}: S13 otestad, regeln för ${id} testas inte, alla alternativ har samma värde`);
}

// ---------------------------------------------------------------- alla
/** Alla spärrar för en fråga. { fel, info }. */
export function sparrFelSerie(q) {
  const t = tolkaRad(q.rad);
  const fel = [...fs6(q)];
  if (fel.length) return { fel, info: [] };
  fel.push(...fs1(q), ...fs2(q), ...fs3(q), ...fs4(q, t), ...fs5(q), ...s5(q), ...s6(q), ...s12(q), ...s13(q));
  const s = s11(q);
  fel.push(...s.fel);
  return { fel, info: s.info };
}

export { tolkaRad };
