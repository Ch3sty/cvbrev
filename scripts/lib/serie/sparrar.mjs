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
//   S12 utanfor       i en regelstyrd dimension vars nåbara mängd är mindre än
//                     primitivens (steg 2, 4 eller 6 av 8, cykel) bär en
//                     distraktor ett värde utanför mängden: noll på alla nivåer
//                     (granskning 01, avsnitt 4 punkt 4)
//   S13 otestad       en regelstyrd dimension har samma värde i alla sex
//   S14 balans        med minst två regelstyrda dimensioner bryts ingen av alla
//                     fem distraktorer; expert har minst en nära miss och två som
//                     bryter alla regler med olika värden (granskning 01, 4.5)
//
//   S15 grupp_antal   antal i cykel på strålar, sektorhjul eller 3×3-kant
//                     (granskning 02, F8)
//
// Frågor som testansvarig godkänt (granskning 01 och 02) står i GODKANDA:
// för dem är S12, S14 och S15 upplysning, eftersom spärrarna skärptes efter
// beslutet.
// =============================================================================

import { PRIM, lasCell, dimNyckel, giltigt, stable } from './celler-serie.mjs';
import { tolkaRad, period, iTakt, sekvens, VISADE } from './tolka-serie.mjs';

/** Godkända i granskning 01 (docs/qa/figurserier/beslut-01.json, godkanda). */
export const GODKANDA_FORE_OMGANG2 = new Set([
  'fs-g-vrid-01', 'fs-g-vrid-02', 'fs-g-vrid-03', 'fs-g-vrid-04', 'fs-g-vrid-05', 'fs-g-vrid-06', 'fs-g-vrid-07', 'fs-g-vrid-09', 'fs-g-vrid-10',
  'fs-g-vand-01', 'fs-g-vand-02', 'fs-g-vand-03', 'fs-g-vand-04', 'fs-g-vand-05', 'fs-g-vand-06',
  'fs-g-antal-02', 'fs-g-antal-03', 'fs-g-antal-05', 'fs-g-antal-06', 'fs-g-antal-08', 'fs-g-antal-09', 'fs-g-antal-11', 'fs-g-antal-12',
  'fs-g-vax-01', 'fs-g-vax-02', 'fs-g-vax-04', 'fs-g-vax-05', 'fs-g-vax-07', 'fs-g-vax-08',
  'fs-a-vrid-01', 'fs-a-vrid-02', 'fs-a-vrid-03', 'fs-a-vrid-04', 'fs-a-vand-01', 'fs-a-vand-02', 'fs-a-antal-03', 'fs-a-antal-06',
  'fs-a-fyll-01', 'fs-a-fyll-02', 'fs-a-flera-02', 'fs-a-flera-04', 'fs-a-vax-01', 'fs-a-vax-02',
  'fs-a-vaxl-01', 'fs-a-vaxl-02', 'fs-a-vaxl-04', 'fs-a-vaxl-05', 'fs-a-vaxl-06', 'fs-a-vaxl-08', 'fs-a-vaxl-09', 'fs-a-vaxl-10',
  'fs-e-vrid-03', 'fs-e-vrid-04', 'fs-e-fyll-04', 'fs-e-fyll-05', 'fs-e-vaxl-02', 'fs-e-vaxl-09',
]);

/** Godkända i granskning 02 (beslut-02.json). */
export const GODKANDA_OMGANG2 = new Set([
  'fs-g-vrid-11', 'fs-g-antal-01', 'fs-g-antal-04', 'fs-g-antal-10', 'fs-g-antal-13', 'fs-g-vax-03', 'fs-g-vax-06',
  'fs-a-antal-02', 'fs-a-antal-04', 'fs-a-antal-05', 'fs-a-antal-07', 'fs-a-flera-01', 'fs-a-flera-03', 'fs-a-vaxl-03', 'fs-a-vaxl-07',
  'fs-e-vrid-01', 'fs-e-vrid-02', 'fs-e-vax-01', 'fs-e-vax-02', 'fs-e-vax-03', 'fs-e-vand-04', 'fs-e-vand-05', 'fs-e-vand-06', 'fs-e-vand-07',
  'fs-e-vand-08', 'fs-e-vand-09', 'fs-e-fyll-01', 'fs-e-fyll-02', 'fs-e-fyll-03', 'fs-e-flera-03', 'fs-e-vaxl-04', 'fs-e-vaxl-06', 'fs-e-vaxl-10',
]);
/** Godkända i granskning 03 (beslut-03.json). */
export const GODKANDA_OMGANG3 = new Set([
  'fs-e-vaxl-01', 'fs-e-vaxl-03', 'fs-e-vaxl-05', 'fs-e-vaxl-07', 'fs-e-antal-04', 'fs-e-antal-05', 'fs-e-antal-06', 'fs-e-antal-07',
]);
/** Godkända i granskning 01 till 03: de skärpta spärrarna är upplysning för dem. */
export const GODKANDA = new Set([...GODKANDA_FORE_OMGANG2, ...GODKANDA_OMGANG2, ...GODKANDA_OMGANG3]);

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

/** Värdena en regel kan ta (nåbara mängden), som nycklar. */
export function nabarMangd(dim, r) {
  const m = new Set();
  for (let i = 0; i < 48; i++) m.add(stable(sekvens(dim, r, i)));
  return m;
}
const domanStorlek = (dim) => (dim.typ === 'rot' ? dim.n : dim.typ === 'kat' ? dim.L.length : dim.max - dim.min + 1);

/**
 * S12: distraktorer med ett värde utanför den nåbara mängden i en
 * regelstyrd dimension, när mängden är mindre än primitivens (granskning 01,
 * F4: ortogonala pilar när raden bara har diagonala, startsektorer utanför
 * kvartsvarven).
 */
export function utanfor(q) {
  if (!q.regler) return [];
  const ut = new Set();
  for (const d of PRIM[q.regler.prim].dims) {
    const r = q.regler.dims[d.id];
    if (!r || r.regel === 'konstant') continue;
    const m = nabarMangd(d, r);
    if (m.size >= domanStorlek(d)) continue;
    q.options.forEach((o, i) => { if (i !== q.correctAnswer && !m.has(stable(lasCell(o)?.v[d.id]))) ut.add(i); });
  }
  return [...ut];
}
export function s12(q) {
  const ut = utanfor(q);
  return ut.length ? [`${q.id}: S12 utanfor, ${ut.length} distraktorer har ett värde utanför regelns mängd (${ut.map((i) => BOKSTAV[i]).join(', ')}), noll tillåtna`] : [];
}

/** S14 balans (granskning 01, F5). */
export function s14(q) {
  const regel = regelDims(q);
  if (regel.length < 2 && q.niva === 'grund') return [];
  if (regel.length === 0) return [];
  const fel = [];
  const V = q.options.map((o) => lasCell(o)?.v);
  if (V.some((v) => !v)) return [];
  const f = V[q.correctAnswer];
  const dist = V.map((v, i) => ({ v, i })).filter((x) => x.i !== q.correctAnswer);
  const ids = PRIM[q.regler.prim].dims.map((d) => d.id);
  const bryter = (v) => regel.filter((id) => stable(v[id]) !== stable(f[id]));
  const konst = (v) => ids.filter((id) => !regel.includes(id) && stable(v[id]) !== stable(f[id]));
  for (const id of regel) if (regel.length >= 2 && dist.every((x) => bryter(x.v).includes(id))) fel.push(`${q.id}: S14 balans, alla fem distraktorer bryter ${id}; den regeln ensam löser frågan`);
  // Konstanten är en gratis kontroll (granskning 02, F6). Spärren är nära
  // missen per regel bland dem som håller konstanterna; att högst två av fem
  // bryter en konstant är generatorns krav på nya frågor (generera-serie.mjs),
  // eftersom fs-e-vaxl-09 med tre konstantbrott ska släppas.
  if (arExpert(q)) {
    // Bland dem som håller alla konstanter har varje regel en nära miss (granskning 02, F6).
    // Gäller frågor med minst en konstant; på F6 med tre regler och ingen
    // konstant är en nära miss per regel en rekommendation (granskning 02, 5.5).
    const harKonstant = ids.some((id) => !regel.includes(id));
    // Granskning 03, 5.2: krav på expert, med eller utan konstant.
    void harKonstant;
    for (const id of regel) if (!dist.some((x) => konst(x.v).length === 0 && bryter(x.v).length === 1 && bryter(x.v)[0] === id)) fel.push(`${q.id}: S14 balans, ingen nära miss på ${id} bland dem som håller konstanterna`);
    const alla = dist.filter((x) => bryter(x.v).length === regel.length);
    if (regel.length >= 2 && new Set(alla.map((x) => regel.map((id) => stable(x.v[id])).join('|'))).size < 2) fel.push(`${q.id}: S14 balans, färre än två distraktorer bryter alla regler med olika värden`);
  }
  return fel;
}

/**
 * S15 grupp-antal: antalet på en grupprimitiv (strålar, sektorhjul, 3×3-kant)
 * får bara gå i steg, aldrig i cykel; gruppens läge blir annars tvetydigt
 * (granskning 02, F8).
 */
export function s15(q) {
  const r = q.regler?.dims?.antal;
  return ['stralar', 'sektor', 'block'].includes(q.regler?.prim) && r?.regel === 'cykel' ? [`${q.id}: S15 grupp-antal, antalet går i cykel på en grupprimitiv`] : [];
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
// ---------------------------------------------------------------- F9
/**
 * F9 forsta_serien (granskning omgång 3, avsnitt 5): i en växelvis regel på
 * ett läge får första serien (figur ett, tre och fem) förlängd ett steg inte
 * landa på facit, annars behövs växlingen aldrig. Med åtta lägen:
 * s0 + 3·ke ≠ s1 + 2·ko (mod 8).
 */
export function f9(q) {
  const dims = q.regler?.dims ?? {};
  const fel = [];
  for (const [id, r] of Object.entries(dims)) {
    if (r.regel !== 'vaxelvis') continue;
    const d = PRIM[q.regler.prim]?.dims.find((x) => x.id === id);
    if (!d || d.typ !== 'rot') continue;
    const m = (x) => ((x % 8) + 8) % 8;
    if (m(r.s0 + 3 * r.ke) === m(r.s1 + 2 * r.ko)) fel.push(`${q.id}: F9 forsta_serien, första serien förlängd ger facit i ${id}`);
  }
  return fel;
}

export function sparrFelSerie(q) {
  const t = tolkaRad(q.rad);
  const fel = [...fs6(q)];
  if (fel.length) return { fel, info: [] };
  fel.push(...fs1(q), ...fs2(q), ...fs3(q), ...fs4(q, t), ...fs5(q), ...s5(q), ...s6(q), ...s13(q));
  const s = s11(q);
  fel.push(...s.fel);
  const info = [...s.info];
  const nya = [...s12(q), ...s14(q), ...s15(q), ...f9(q)];
  if (GODKANDA.has(q.id)) info.push(...nya.map((x) => `${x} (godkänd i granskning 01 eller 02)`));
  else fel.push(...nya);
  return { fel, info };
}

export { tolkaRad };
