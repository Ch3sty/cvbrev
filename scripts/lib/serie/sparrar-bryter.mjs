// scripts/lib/serie/sparrar-bryter.mjs
// =============================================================================
// Spärrarna för "bryter mönstret" i regelform (beställning omgång 3, A1). Fel i
// byggBryter() (ett underkänt försök slängs), i scripts/v7-facit-check.mjs
// --bryter och i fixturerna (src/lib/figurserierV1/__tests__/sparrar-bryter.test.ts).
//
//   BM1 entydig      Regeln håller för de fem utan brytaren och inte för alla
//                    sex. Ingen regel i biblioteket (bryter-regler.mjs,
//                    regelBibliotek: lika, samband, relation) pekar ut någon
//                    annan figur: för varje regel som inte redan håller för
//                    alla sex gäller den bara för de fem utan brytaren. En
//                    regel som håller för alla sex (alla har samma antal i
//                    B4) är något figurerna delar, inte en läsning som pekar
//                    ut någon.
//   BM2 olika        Alla sex figurer har olika nyckel (S8).
//   BM3 fria         Varje egenskap som inte ingår i regeln har minst tre olika
//                    värden bland de fem; i B3 gäller det pricken och pilen
//                    var för sig. Regeln får inte kunna läsas som "den som ser
//                    annorlunda ut".
//   BM4 ingen_outlier Brytaren är aldrig ensam om ett värde på en fri
//                    egenskap, och i B2 och B3 inte heller på någon av
//                    regelns egenskaper: minst en av de fem delar värdet. I B4
//                    (mönstret vridet) har brytaren en granne bland de fem som
//                    skiljer sig i högst två lägen.
//                    I B4 får mönstret varken ha spegel- eller
//                    vridningssymmetri (spec 15.1).
//   BM5 synlig       Brytarens avvikelse är minst ett antalssteg, tom mot
//                    svart (aldrig grå), 90 eller 180 grader, eller en
//                    spegling som flyttar minst ett läge (R5).
// =============================================================================

import { lasBryter, bryterNyckel, regelBibliotek, avseddRegel, PRIMAR, MANGD, BRYTER_MALLAR, rotera, arKiralt } from './bryter-regler.mjs';
import { stable, mod } from './celler-serie.mjs';

const BOKSTAV = 'ABCDEF';
const ID = /^fsb-[ga]-[a-z]+-\d{2}$/;
const TANKSTRECK = /[–—]/;
const MALL = Object.fromEntries(BRYTER_MALLAR.map((m) => [m.id, m]));

function las(q) {
  const L = (q.rad ?? []).map(lasBryter);
  if (L.length !== 6 || L.some((l) => !l)) return null;
  const prim = L[0].prim;
  if (L.some((l) => l.prim !== prim)) return null;
  return { prim, V: L.map((l) => l.v) };
}
const utan = (V, i) => V.filter((_, k) => k !== i);

/** Regelns egenskaper (BM3: de som inte är fria). Vridningsklassen bär antalet med sig. */
function regelEgenskaper(regel) {
  if (regel.typ === 'lika') return regel.egenskaper.includes('klass') ? [...regel.egenskaper, 'antal'] : regel.egenskaper;
  if (regel.typ === 'samband') return [regel.fran, regel.till];
  if (regel.typ === 'relation') return [regel.a, regel.b];
  return [];
}

// ---------------------------------------------------------------- BM1
export function bm1(q) {
  const l = las(q);
  if (!l) return [`${q.id}: BM1 entydig, figurerna går inte att läsa som en primitiv`];
  const { prim, V } = l;
  const b = q.correctAnswer;
  const fel = [];
  const avsedd = avseddRegel(q.regler.regel);
  if (!avsedd(utan(V, b))) fel.push(`${q.id}: BM1 entydig, regeln håller inte för de fem utan brytaren`);
  if (avsedd(V)) fel.push(`${q.id}: BM1 entydig, regeln håller för alla sex`);
  // Spec 15.1 (B4): grundmönstret får inte ha spegel- eller vridningssymmetri,
  // annars är spegelbilden en vridning och frågan olöslig.
  if (q.regler.regel.typ === 'lika' && q.regler.regel.egenskaper.includes('klass') && !arKiralt(utan(V, b)[0].lagen)) {
    fel.push(`${q.id}: BM1 entydig, mönstret är symmetriskt, så spegelbilden är en vridning av det`);
  }
  for (const R of regelBibliotek(prim)) {
    if (R.galler(V)) continue;
    for (let i = 0; i < 6; i++) {
      if (i === b) continue;
      if (R.galler(utan(V, i))) fel.push(`${q.id}: BM1 entydig, ${R.namn} håller också utan figur ${BOKSTAV[i]}, så den kan läsas som brytaren`);
    }
  }
  return fel;
}

// ---------------------------------------------------------------- BM2
export function bm2(q) {
  const n = (q.rad ?? []).map(bryterNyckel);
  const fel = [];
  for (let i = 0; i < n.length; i++) for (let j = i + 1; j < n.length; j++) {
    if (n[i] === n[j]) fel.push(`${q.id}: BM2 olika, figur ${BOKSTAV[i]} och ${BOKSTAV[j]} är lika`);
  }
  return fel;
}

// ---------------------------------------------------------------- BM3
export function bm3(q) {
  const l = las(q);
  if (!l) return [`${q.id}: BM3 fria, figurerna går inte att läsa`];
  const { prim, V } = l;
  const fem = utan(V, q.correctAnswer);
  const regel = q.regler.regel;
  const iRegel = regelEgenskaper(regel);
  const krav = regel.typ === 'relation' ? [regel.a, regel.b] : PRIMAR[prim].filter((e) => !iRegel.includes(e));
  const fel = [];
  for (const e of krav) {
    const n = new Set(fem.map((v) => stable(v[e]))).size;
    if (n < 3) fel.push(`${q.id}: BM3 fria, ${e} har ${n} olika värden bland de fem, minst 3`);
  }
  return fel;
}

// ---------------------------------------------------------------- BM4
const symdiff = (a, b) => a.filter((x) => !b.includes(x)).length + b.filter((x) => !a.includes(x)).length;

export function bm4(q) {
  const l = las(q);
  if (!l) return [`${q.id}: BM4 ingen_outlier, figurerna går inte att läsa`];
  const { prim, V } = l;
  const b = q.correctAnswer;
  const fem = utan(V, b);
  const regel = q.regler.regel;
  const iRegel = regelEgenskaper(regel);
  const fel = [];
  if (regel.typ === 'lika' && regel.egenskaper.includes('klass')) {
    const narmast = Math.min(...fem.map((v) => symdiff(v.lagen, V[b].lagen)));
    if (narmast > 2) fel.push(`${q.id}: BM4 ingen_outlier, brytaren skiljer sig i ${narmast} lägen från den närmaste av de fem, högst 2`);
    return fel;
  }
  const prova = PRIMAR[prim].filter((e) => !iRegel.includes(e) || regel.typ !== 'lika');
  for (const e of prova) {
    if (!fem.some((v) => stable(v[e]) === stable(V[b][e]))) fel.push(`${q.id}: BM4 ingen_outlier, brytaren är ensam om ${e} = ${V[b][e]}`);
  }
  return fel;
}

// ---------------------------------------------------------------- BM5
export function bm5(q) {
  const l = las(q);
  if (!l) return [`${q.id}: BM5 synlig, figurerna går inte att läsa`];
  const { V } = l;
  const b = q.correctAnswer;
  const fem = utan(V, b);
  const regel = q.regler.regel;
  const fel = [];
  if (regel.typ === 'lika' && regel.egenskaper.includes('antal')) {
    const d = Math.abs(V[b].antal - fem[0].antal);
    if (d < 1) fel.push(`${q.id}: BM5 synlig, brytaren har samma antal`);
  } else if (regel.typ === 'lika' && regel.egenskaper.includes('klass')) {
    if (V[b].kiral !== fem[0].kiral) fel.push(`${q.id}: BM5 synlig, brytaren är inte spegelbilden av mönstret utan ett annat mönster`);
    const P = fem[0].lagen;
    const minst = Math.min(...Array.from({ length: 8 }, (_, r) => symdiff(rotera(P, r), V[b].lagen)));
    if (minst < 2) fel.push(`${q.id}: BM5 synlig, spegelbilden går att vrida till mönstret`);
  } else if (regel.typ === 'samband') {
    const varden = [V[b][regel.till], ...fem.map((v) => v[regel.till])];
    if (varden.some((x) => x !== 'none' && x !== 'black')) fel.push(`${q.id}: BM5 synlig, fyllningen ska vara tom eller svart, aldrig grå`);
  } else if (regel.typ === 'relation') {
    const d = mod(V[b][regel.b] - V[b][regel.a] - regel.vinkel, 8);
    if (![2, 4, 6].includes(d)) fel.push(`${q.id}: BM5 synlig, brytarens pil pekar ${d * 45} grader fel, ska vara 90 eller 180`);
  }
  return fel;
}

// ---------------------------------------------------------------- struktur
export function strukturFel(q) {
  const fel = [];
  const f = (x) => fel.push(`${q.id ?? '?'}: ${x}`);
  if (!ID.test(q.id ?? '')) f('id ska vara fsb-<g|a>-<familj>-<nn>');
  if (q.form !== 'bryter') f("form ska vara 'bryter'");
  const m = MALL[q.recept];
  if (!m) f(`okänd mall ${q.recept}`);
  else {
    if (q.niva !== m.niva) f(`nivån ${q.niva}, mallen ${m.id} säger ${m.niva}`);
    if (q.p_prior !== m.p_prior) f(`p_prior ${q.p_prior}, mallen ${m.id} säger ${m.p_prior}`);
    if (q.family !== m.family) f(`familjen ${q.family}, mallen ${m.id} säger ${m.family}`);
    if (q.difficulty !== m.difficulty) f(`difficulty ${q.difficulty}, mallen säger ${m.difficulty}`);
  }
  if (!Array.isArray(q.rad) || q.rad.length !== 6) f('raden ska ha sex figurer');
  if (!Array.isArray(q.options) || q.options.length !== 0) f('options ska vara tom: figurerna är alternativen');
  if (!Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer > 5) f('correctAnswer utanför 0 till 5');
  if (!Array.isArray(q.misstag) || q.misstag.length !== 6) f('misstag ska ha sex poster');
  else q.misstag.forEach((x, i) => {
    if (i === q.correctAnswer && x) f('misstag för brytaren ska vara tomt');
    if (i !== q.correctAnswer && !/^Den här följer regeln: /.test(x ?? '')) f(`misstaget för figur ${BOKSTAV[i]} ska börja "Den här följer regeln: "`);
  });
  for (const [namn, text] of [['rule', q.rule], ['title', q.title], ...(q.misstag ?? []).map((x, i) => [`misstag ${BOKSTAV[i]}`, x])]) {
    if (typeof text !== 'string') continue;
    if (TANKSTRECK.test(text)) f(`tankstreck i ${namn}`);
    if (/\blätt/i.test(text)) f(`"lätt" i ${namn}`);
  }
  if (!q.rule) f('rule saknas');
  if (!q.title) f('title saknas');
  if (!q.regler?.regel) f('regler.regel saknas');
  if (q.fran_version !== 2) f('fran_version ska vara 2');
  return fel;
}

/** Alla spärrar på en fråga: { fel, info }. */
export function sparrFelBryter(q) {
  const s = strukturFel(q);
  if (s.length) return { fel: s, info: [] };
  return { fel: [...bm1(q), ...bm2(q), ...bm3(q), ...bm4(q), ...bm5(q)], info: [] };
}

export { MANGD };

// ---------------------------------------------------------------- kontrollskriptet
// node scripts/v7-facit-check.mjs --bryter [fil ...]
// Utan filer: de två bryterbankerna. Struktur, BM1 till BM5, unika id och
// ingen rad (samma sex figurer) två gånger. Exit 1 vid fel.
export const BRYTER_FILER = ['src/lib/figurserierV1/bankBryterGrund.json', 'src/lib/figurserierV1/bankBryterAvancerad.json'];

export async function facitCheckBryter(argv) {
  const { readFileSync, existsSync } = await import('node:fs');
  const filer = argv.length ? argv : BRYTER_FILER.filter((f) => existsSync(f));
  const fel = [];
  const id = new Map();
  const rader = new Map();
  let n = 0;
  for (const f of filer) {
    const bank = JSON.parse(readFileSync(f, 'utf8'));
    for (const q of bank) {
      n++;
      fel.push(...sparrFelBryter(q).fel);
      if (id.has(q.id)) fel.push(`${q.id}: id finns redan i ${id.get(q.id)}`);
      id.set(q.id, f);
      const k = (q.rad ?? []).map(bryterNyckel).sort().join('¦');
      if (rader.has(k)) fel.push(`${q.id}: samma sex figurer som ${rader.get(k)}`);
      rader.set(k, q.id);
    }
    console.log(`${f}: ${bank.length} frågor`);
  }
  if (fel.length) {
    console.log(`\n${fel.length} fel:`);
    fel.forEach((x) => console.log('  ' + x));
    return 1;
  }
  console.log(`\n${n} frågor: strukturen och BM1 till BM5 utan fel.`);
  return 0;
}
