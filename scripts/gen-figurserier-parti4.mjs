#!/usr/bin/env node
// scripts/gen-figurserier-parti4.mjs
// =============================================================================
// Parti 4 av figurseriernas härnäst-uppgifter (omgång 2 av frågebanken
// 2026-11-19): cirka 100 nya kandidater, fran_version 4. De går in i appen
// först efter testansvarigs granskning (befordran till bankfiler och en ny
// SERIE_VERSION); den här generatorn skriver bara kandidatfiler.
//
// Granskningen av parti 3 (docs/fragebank/figurserier-2026-11-19-granskning.md)
// styr omgången:
//   punkt 5  följdspärren (foljdNycklar i struktur.mjs) gäller: ingen
//            lägesföljd, vriden växelvis följd eller antalsföljd som redan finns
//            i nivå och familj, i bankerna eller i parti 3
//   punkt 7  expert mindre enformig: den nya mallen F8 (två rörelser, ingen
//            tretakt) och F7 med antal före tretakten; pilen och orbitalen i
//            tretakt står utanför
//   nytt     prickbågen (renderarens dotsorbit) som primitiv i F1 till F5 och
//            F7 och F8
//
// Granskningen av parti 4 (docs/fragebank/figurserier-2026-11-19-omg2-
// granskning.md) lade till:
//   punkt 1  F8 utan F4-kopior: pilen, orbitalen och duon med växlande fyllning
//            är strukna ur mallen, och i stället går symbolen eller formen i
//            mitten i en trecykel (recept-serie.mjs). F8 på p 0,45, svårighet 3.
//   punkt 2  regelnyckeln (regelNyckel i struktur.mjs): primitiven, de rörliga
//            reglerna utan startläge och konstanterna. Samma regelnyckel som
//            någon fråga i någon bank, på vilken nivå som helst, avvisas.
//   --ersatt stryker de uppgifter granskningen fällde ur parti4-*.json och
//            genererar ersättare med alla spärrar ovan, mot bankerna och de
//            kvarvarande i parti 4. Godkända uppgifter rörs inte.
//
// Kör (en mall per process går parallellt, sedan sammanfogning):
//   node node_modules/tsx/dist/cli.mjs scripts/gen-figurserier-parti4.mjs --mall=F1   (F1 till F5, F7, F8)
//   node node_modules/tsx/dist/cli.mjs scripts/gen-figurserier-parti4.mjs --sammanfoga
//   node node_modules/tsx/dist/cli.mjs scripts/gen-figurserier-parti4.mjs --ersatt   (efter granskningen)
// Skriver: src/lib/figurserierV1/kandidater/parti4-{grund,avancerad,expert}.json
// Kontroll: node node_modules/tsx/dist/cli.mjs scripts/figurserier-verifiera.ts <filerna>
// =============================================================================

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { MALLAR, NIVA_KOD } from './lib/serie/recept-serie.mjs';
import { bygg } from './lib/serie/generera-serie.mjs';
import { PRIM } from './lib/serie/celler-serie.mjs';
import { strukturNyckel, radNyckel, lagesNyckel, foljdNycklar, regelNyckel } from './lib/serie/struktur.mjs';
import { mulberry32, hashString } from './lib/serie/slump.mjs';
import { putsa } from './figurserier-copy-omgang3.mjs';

// V11 (noder och bytes per fråga) mäts på renderarens utdata, som är TSX: kör med tsx.
let matSerieFraga, serieGranser;
try {
  ({ matSerieFraga, serieGranser } = await import('../src/lib/logicTestV7/svgMatt.tsx'));
} catch {
  throw new Error('Kör med tsx: node node_modules/tsx/dist/cli.mjs scripts/gen-figurserier-parti4.mjs');
}

const B = 'src/lib/figurserierV1';
const K = `${B}/kandidater`;
const SEED = 'figurserier-v1-parti4';
const FAM_KOD = { vridning: 'vrid', vandring: 'vand', antal: 'antal', fyllning: 'fyll', vaxande: 'vax', vaxelvis: 'vaxl', flera: 'flera' };

// ---------------------------------------------------------------- regelbyggare (som recept-serie.mjs)
const valj = (r, a) => a[Math.floor(r() * a.length)];
const r8 = (r) => Math.floor(r() * 8);
function blanda(r, arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const konst = (v) => ({ regel: 'konstant', v });
const steg = (s0, k) => ({ regel: 'steg', s0, k });
const cykel = (varden) => ({ regel: 'cykel', varden });
const UDDA = [1, 3, 5, 7];
const KVART = [2, 6];
function vaxande(r) { const t = valj(r, [1, -1]); return { regel: 'vaxande', s0: r8(r), d0: t * valj(r, [1, 2]), dd: t }; }
function vaxelvis(r, L = [1, 2, 3, -1, -2, -3]) { const ke = valj(r, L); const ko = valj(r, L.filter((x) => x !== ke)); return { regel: 'vaxelvis', s0: r8(r), ke, s1: r8(r), ko }; }
function antalSteg(r, min, max) {
  const upp = r() < 0.5;
  const s0 = upp ? min + Math.floor(r() * (max - 5 - min + 1)) : max - Math.floor(r() * (max - 5 - min + 1));
  return steg(s0, upp ? 1 : -1);
}
const cykelOlika = (r, L, p) => cykel(blanda(r, L).slice(0, p));
const SYMB = ['plus', 'minus', 'cross', 'ring'];
const KFORM = ['circle', 'square', 'diamond'];

// ---------------------------------------------------------------- nya varianter per mall
const PRICK = (r, lo, hi) => konst(lo + Math.floor(r() * (hi - lo + 1)));
const NYA = {
  F1: [
    { namn: 'prickar-steg', family: 'vandring', regler: (r) => ({ prim: 'prickar', dims: { start: steg(r8(r), valj(r, UDDA)), antal: PRICK(r, 2, 4) } }) },
    { namn: 'duo-orbital-form-steg', family: 'vandring', regler: (r) => ({ prim: 'duo-orbital-form', dims: { ylage: steg(r8(r), valj(r, UDDA)), kform: konst(valj(r, KFORM)), kfyll: konst(valj(r, ['none', 'black'])) } }) },
    { namn: 'duo-orbital-pil-vrid', family: 'vridning', regler: (r) => ({ prim: 'duo-orbital-pil', dims: { ylage: konst(r8(r)), kvinkel: steg(r8(r), valj(r, UDDA)) } }) },
  ],
  F2: [
    { namn: 'prickar-antal', family: 'antal', regler: (r) => ({ prim: 'prickar', dims: { start: konst(r8(r)), antal: antalSteg(r, 2, 7) } }) },
  ],
  F3: [
    { namn: 'prickar-vaxande', family: 'vaxande', regler: (r) => ({ prim: 'prickar', dims: { start: vaxande(r), antal: PRICK(r, 2, 3) } }) },
    { namn: 'duo-kant-symbol-vaxande', family: 'vaxande', regler: (r) => ({ prim: 'duo-kant-symbol', dims: { ylage: vaxande(r), ksymbol: konst(valj(r, SYMB)) } }) },
    { namn: 'duo-kant-pil-vaxande-grund', family: 'vaxande', regler: (r) => ({ prim: 'duo-kant-pil', dims: { ylage: konst(r8(r)), kvinkel: vaxande(r) } }) },
  ],
  F4: [
    { namn: 'prickar-kvart-antal', family: 'antal', regler: (r) => ({ prim: 'prickar', dims: { start: steg(r8(r), valj(r, KVART)), antal: antalSteg(r, 2, 7) } }) },
    { namn: 'prickar-steg-antal', family: 'antal', regler: (r) => ({ prim: 'prickar', dims: { start: steg(r8(r), valj(r, UDDA)), antal: antalSteg(r, 2, 7) } }) },
    { namn: 'duo-orbital-symbol', family: 'flera', regler: (r) => ({ prim: 'duo-orbital-symbol', dims: { ylage: steg(r8(r), valj(r, UDDA)), ksymbol: cykelOlika(r, SYMB, 3) } }) },
    { namn: 'duo-kant-form', family: 'flera', regler: (r) => ({ prim: 'duo-kant-form', dims: { ylage: steg(r8(r), valj(r, UDDA)), kform: cykelOlika(r, KFORM, 3), kfyll: konst(valj(r, ['none', 'black'])) } }) },
    { namn: 'duo-orbital-fyll', family: 'fyllning', regler: (r) => ({ prim: 'duo-orbital-form', dims: { ylage: steg(r8(r), valj(r, UDDA)), kform: konst(valj(r, KFORM)), kfyll: cykelOlika(r, ['none', 'black'], 2) } }) },
    { namn: 'grundform-symbol-fyllning', family: 'fyllning', regler: (r) => { const p = valj(r, [[3, 2], [2, 3]]); return { prim: 'grundform', dims: { bas: konst(valj(r, ['circle', 'square', 'triangle', 'diamond'])), symbol: cykelOlika(r, ['plus', 'minus', 'dot', 'ring', 'cross'], p[0]), fyllning: cykelOlika(r, ['none', 'gray', 'black'], p[1]) } }; } },
  ],
  F5: [
    { namn: 'prickar-vaxelvis', family: 'vaxelvis', regler: (r) => ({ prim: 'prickar', dims: { start: vaxelvis(r), antal: PRICK(r, 2, 3) } }) },
    { namn: 'duo-kant-symbol-vaxelvis', family: 'vaxelvis', regler: (r) => ({ prim: 'duo-kant-symbol', dims: { ylage: vaxelvis(r), ksymbol: konst(valj(r, SYMB)) } }) },
    { namn: 'duo-orbital-form-vaxelvis', family: 'vaxelvis', regler: (r) => ({ prim: 'duo-orbital-form', dims: { ylage: vaxelvis(r), kform: konst(valj(r, KFORM)), kfyll: konst(valj(r, ['none', 'black'])) } }) },
  ],
  F7: [
    { namn: 'prickar-vaxelvis-antalsteg', family: 'antal', regler: (r) => ({ prim: 'prickar', dims: { start: vaxelvis(r, [4, 1, 2, 3, -1, -2, -3]), antal: antalSteg(r, 2, 7) } }) },
    { namn: 'block-vaxelvis-antalsteg', family: 'antal', regler: (r) => ({ prim: 'block', dims: { start: vaxelvis(r, [4, 1, 2, 3, -1, -2, -3]), antal: antalSteg(r, 1, 7) } }) },
  ],
};
// Expert (granskningen av parti 3, punkt 7): pilen och orbitalen i tretakt står
// utanför, och antal går före tretakten i F7 genom ordningen ovan.
const UTAN = new Set(['pil-vaxelvis-tretakt', 'orbital-vaxelvis-tretakt']);

/** Antal per mall i parti 4. */
const ANTAL = { F1: 18, F2: 2, F3: 13, F4: 34, F5: 11, F7: 10, F8: 14 };

// ---------------------------------------------------------------- ersättarna (--ersatt)
// Granskningen av parti 4: punkt 1 (F8 på fel nivå) och punkt 2 (kopior med
// nytt startläge). fs-a-flera-17 (= fs-a-flera-02) och fs-a-fyll-10
// (= fs-a-fyll-05) har samma cykelordning som sitt par och fälls av
// regelnyckeln på samma sätt som de arton i listan; de byts också.
const ERSATT = process.argv.includes('--ersatt');
const STRYK = new Set([
  'fs-e-vax-06', 'fs-e-vax-07', 'fs-e-vax-10', 'fs-e-vax-11', 'fs-e-fyll-07',
  'fs-g-vrid-32', 'fs-g-vand-23', 'fs-g-vand-24', 'fs-g-vrid-28', 'fs-g-vand-28', 'fs-g-vax-26', 'fs-g-vax-32', 'fs-g-vax-33',
  'fs-a-vrid-11', 'fs-a-vrid-13', 'fs-a-vrid-15', 'fs-a-vand-06', 'fs-a-vand-08', 'fs-a-vand-09', 'fs-a-vax-09', 'fs-a-vax-10', 'fs-a-vax-11', 'fs-a-antal-19',
  'fs-a-flera-17', 'fs-a-fyll-10',
]);
/**
 * Varianterna för ersättarna. F1: inte 3×3-blocket som vandrar (läses som en
 * figur som byter form, punkt 5) och inte de två duovarianter som redan står
 * två och tre gånger i partiet (punkt 3); i stället duo med kantprick och
 * symbol eller form, som grund redan har i F3. F8: bara trecykeln.
 */
const ERSATT_VARIANTER = {
  F1: [
    { namn: 'duo-kant-symbol-steg', family: 'vandring', regler: (r) => ({ prim: 'duo-kant-symbol', dims: { ylage: steg(r8(r), valj(r, UDDA)), ksymbol: konst(valj(r, SYMB)) } }) },
    { namn: 'duo-kant-form-steg', family: 'vandring', regler: (r) => ({ prim: 'duo-kant-form', dims: { ylage: steg(r8(r), valj(r, UDDA)), kform: konst(valj(r, KFORM)), kfyll: konst(valj(r, ['none', 'black'])) } }) },
    ...NYA.F1.filter((v) => v.namn === 'prickar-steg'),
  ],
  // F4: regelnycklarna tar slut på pilen och orbitalen, så parti 3:s varianter
  // (månghörningen, grundform med form och symbol, 3×3-kanten, duo med pil) är med.
  F4: (m) => [
    ...NYA.F4,
    ...m.varianter,
    { namn: 'grundform-form-symbol', family: 'fyllning', regler: (r) => { const p = valj(r, [[3, 2], [2, 3]]); return { prim: 'grundform', dims: { bas: cykelOlika(r, ['circle', 'square', 'triangle', 'diamond'], p[0]), symbol: cykelOlika(r, ['plus', 'minus', 'dot', 'ring', 'cross'], p[1]), fyllning: konst(valj(r, ['none', 'gray', 'black'])) } }; } },
    { namn: 'poly-horn-fyllning', family: 'antal', regler: (r) => ({ prim: 'poly', dims: { horn: antalSteg(r, 3, 8), fyllning: cykelOlika(r, ['none', 'gray', 'black'], valj(r, [2, 3])) } }) },
    { namn: 'duo-orbital-pil', family: 'flera', regler: (r) => ({ prim: 'duo-orbital-pil', dims: { ylage: steg(r8(r), valj(r, UDDA)), kvinkel: steg(r8(r), valj(r, KVART)) } }) },
    { namn: 'block-kvart-antal', family: 'antal', regler: (r) => ({ prim: 'block', dims: { start: steg(r8(r), valj(r, KVART)), antal: antalSteg(r, 1, 7) } }) },
  ],
  F8: (m) => m.varianter.filter((v) => v.namn.endsWith('-vaxande-cykel')),
};
const UTAN_ERSATT = new Set(['block-steg', 'duo-orbital-form-steg', 'duo-orbital-pil-vrid']);
/**
 * Rörelsen: regelnyckeln utan konstanterna. Med --ersatt får två ersättare på
 * samma nivå inte dela rörelse (punkt 3: fs-g-vand-26 och fs-g-vand-30 skiljer
 * bara i formen i mitten, och det är i mesta laget).
 */
const rorelse = (q) => `${q.niva}|${regelNyckel(q).split('|').filter((d) => !d.includes('=')).join('|')}`;
const rorelser = new Set();

// ---------------------------------------------------------------- det som redan finns
const filer = [
  ...['Grund', 'Avancerad', 'Expert', 'Parti2Grund', 'Parti2Avancerad', 'Parti3Grund', 'Parti3Avancerad', 'Parti3Expert'].map((n) => `${B}/bank${n}.json`),
  ...['', 'omgang1/', 'omgang2/', 'generator/'].flatMap((d) => ['grund', 'avancerad', 'expert'].map((n) => `${K}/${d}${n}.json`)),
  `${K}/parti2-grund.json`, `${K}/parti2-avancerad.json`,
  ...(ERSATT ? ['grund', 'avancerad', 'expert'].map((n) => `${K}/parti4-${n}.json`) : []),
].filter((f) => existsSync(f));
const radNycklar = new Set();
const lagesrader = new Set();
// Följdnycklarna (granskningen av parti 3, punkt 5): samma lägesföljd inom
// nivå och familj avvisas, också under en annan primitiv eller vriden.
const foljder = new Set();
// F2-nyckeln (validate-figurserier.mjs): primitiv, riktning och startantal en gång per nivå.
const f2 = (q) => (q.recept === 'F2' && q.regler.dims.antal?.regel === 'steg' ? `${q.niva}|${q.regler.prim}|${q.regler.dims.antal.k}|${q.regler.dims.antal.s0}` : null);
const f2Nycklar = new Set();
// Regelnyckeln (granskningen av parti 4, punkt 2), över alla nivåer.
const regelNycklar = new Map();
// Med --ersatt: de kvarvarande i parti 4, per mall (räknas som bank).
const kvar = {};
const nummer = {};
for (const f of filer) for (const q of JSON.parse(readFileSync(f, 'utf8'))) {
  // Bara skarpa banker räknas för raderna och lägena; kandidaterna (strukna inräknade) räknas för numreringen.
  const iParti4 = /parti4-/.test(f);
  if (iParti4 && STRYK.has(q.id)) { /* strukna: bara numreringen */ }
  else if (f.startsWith(`${B}/bank`) || iParti4) {
    if (iParti4) (kvar[q.recept] ??= []).push(q);
    const rn = regelNyckel(q);
    if (rn && !regelNycklar.has(rn)) regelNycklar.set(rn, q.id);
    radNycklar.add(radNyckel(q));
    const l = lagesNyckel(q);
    if (l) lagesrader.add(`${q.niva}|${l}`);
    for (const k of foljdNycklar(q)) foljder.add(k);
    if (f2(q)) f2Nycklar.add(f2(q));
  } else radNycklar.add(radNyckel(q));
  const m = /^fs-([gae])-([a-z]+)-(\d+)$/.exec(q.id);
  if (m) nummer[`${m[1]}-${m[2]}`] = Math.max(nummer[`${m[1]}-${m[2]}`] ?? 0, Number(m[3]));
}
// De strukna id:na används aldrig igen (granskningen hänvisar till dem).
for (const id of ERSATT ? STRYK : []) {
  const m = /^fs-([gae])-([a-z]+)-(\d+)$/.exec(id);
  nummer[`${m[1]}-${m[2]}`] = Math.max(nummer[`${m[1]}-${m[2]}`] ?? 0, Number(m[3]));
}

// ---------------------------------------------------------------- generering
// En mall per process går att köra parallellt: --mall=F4 skriver
// kandidater/parti4/F4.json. --sammanfoga läser de sex och skriver bankerna
// (och kontrollerar att ingen rad eller lägesrad krockar mellan mallarna).
const DEL = `${K}/parti4`;
const ARG_MALL = process.argv.find((a) => a.startsWith('--mall='))?.slice('--mall='.length);
const FIL = { grund: 'Grund', avancerad: 'Avancerad', expert: 'Expert' };

if (process.argv.includes('--sammanfoga') && !ERSATT) {
  const perNiva = { grund: [], avancerad: [], expert: [] };
  const rk = new Map(), lk = new Map(), idn = new Set();
  for (const m of Object.keys(ANTAL)) {
    for (const q of JSON.parse(readFileSync(`${DEL}/${m}.json`, 'utf8'))) {
      const r = radNyckel(q), l = lagesNyckel(q);
      if (rk.has(r)) throw new Error(`${q.id}: samma rad som ${rk.get(r)}`);
      if (l && lk.has(`${q.niva}|${l}`)) throw new Error(`${q.id}: samma lägesrad som ${lk.get(`${q.niva}|${l}`)}`);
      if (idn.has(q.id)) throw new Error(`${q.id}: dubbelt id`);
      rk.set(r, q.id); if (l) lk.set(`${q.niva}|${l}`, q.id); idn.add(q.id);
      perNiva[q.niva].push(q);
    }
  }
  for (const [niva, fragor] of Object.entries(perNiva)) {
    const f = `${K}/parti4-${niva}.json`;
    writeFileSync(f, JSON.stringify(fragor, null, 1) + '\n');
    console.log(`${f}: ${fragor.length} frågor`);
  }
  process.exit(0);
}
mkdirSync(DEL, { recursive: true });
const start = Date.now();
const perNiva = { grund: [], avancerad: [], expert: [] };
for (const bas of MALLAR) {
  // Med --ersatt: lika många som strukits ur mallen.
  const antal = ERSATT ? ANTAL[bas.id] - (kvar[bas.id]?.length ?? 0) : ANTAL[bas.id];
  if (!antal || (ARG_MALL && ARG_MALL !== bas.id)) continue;
  // Nya varianter först, sedan mallens egna (utom de som står utanför).
  const ev = ERSATT_VARIANTER[bas.id];
  const varianter = ERSATT && ev
    ? (typeof ev === 'function' ? ev(bas) : ev)
    : [...(NYA[bas.id] ?? []), ...bas.varianter.filter((v) => !UTAN.has(v.namn))].filter((v) => !ERSATT || !UTAN_ERSATT.has(v.namn));
  const mall = { ...bas, antal };
  const r = mulberry32(hashString(`${SEED}:${ERSATT ? 'ersatt:' : ''}${mall.id}`));
  // Kvoterna räknas som validatorn gör: på mallens antal i banken.
  const tak = bas.grupptak ?? Math.ceil(bas.antal / 3);
  const strukturTak = Math.ceil(bas.antal / 2);
  const perGrupp = {};
  const perStruktur = {};
  for (const q of ERSATT ? kvar[bas.id] ?? [] : []) {
    perGrupp[PRIM[q.regler.prim].grupp] = (perGrupp[PRIM[q.regler.prim].grupp] ?? 0) + 1;
    perStruktur[strukturNyckel(q)] = (perStruktur[strukturNyckel(q)] ?? 0) + 1;
  }
  const platser = [];
  while (platser.length < antal) platser.push(0, 1, 2, 3, 4, 5);
  for (let i = platser.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [platser[i], platser[j]] = [platser[j], platser[i]]; }
  let gjorda = 0, forsok = 0, v = 0, variant = null, perVariant = 0;
  const perVariantGjorda = {};
  const skal = {};
  while (gjorda < antal) {
    if (++forsok > 80000) {
      // Med --ersatt: hellre färre än kopior (granskningen av parti 4, punkt 2).
      if (ERSATT) { console.log(`${mall.id}: ${gjorda} av ${antal}, spärrarna tar slut; skäl ${JSON.stringify(skal)}`); break; }
      throw new Error(`${mall.id}: fick bara ${gjorda} av ${antal}`);
    }
    if (forsok % 2000 === 0) console.log(`${mall.id}: ${forsok} försök, ${gjorda} klara, ${((Date.now() - start) / 1000).toFixed(0)} s`);
    if (!variant || perVariant >= 80) { variant = varianter[v++ % varianter.length]; perVariant = 0; }
    perVariant++;
    if ((perGrupp[PRIM[variant.regler(mulberry32(1)).prim].grupp] ?? 0) >= tak) { perVariant = 80; continue; }
    const kod = NIVA_KOD[mall.niva];
    const nyckelNr = `${kod}-${FAM_KOD[variant.family]}`;
    const id = `fs-${kod}-${FAM_KOD[variant.family]}-${String((nummer[nyckelNr] ?? 0) + 1).padStart(2, '0')}`;
    // Regelnyckeln prövas före bygget, som är det dyra steget.
    const regler = variant.regler(r);
    if (regelNycklar.has(regelNyckel({ regler }))) { skal[`${variant.namn}:regel`] = (skal[`${variant.namn}:regel`] ?? 0) + 1; continue; }
    const q = bygg(r, mall, { ...variant, regler: () => regler }, { id, pos: platser[gjorda] });
    if (!q) { skal[`${variant.namn}:bygg`] = (skal[`${variant.namn}:bygg`] ?? 0) + 1; continue; }
    const grupp = PRIM[q.regler.prim].grupp;
    if ((perGrupp[grupp] ?? 0) >= tak) continue;
    const sk = strukturNyckel(q);
    if ((perStruktur[sk] ?? 0) >= strukturTak) continue;
    const rk = radNyckel(q);
    if (radNycklar.has(rk)) continue;
    const lk = lagesNyckel(q);
    if (lk && lagesrader.has(`${q.niva}|${lk}`)) continue;
    if (foljdNycklar(q).some((k) => foljder.has(k))) { skal[`${variant.namn}:foljd`] = (skal[`${variant.namn}:foljd`] ?? 0) + 1; continue; }
    if (f2(q) && f2Nycklar.has(f2(q))) continue;
    const rn = regelNyckel(q);
    if (regelNycklar.has(rn)) continue;
    if (ERSATT && rorelser.has(rorelse(q))) { skal[`${variant.namn}:rorelse`] = (skal[`${variant.namn}:rorelse`] ?? 0) + 1; continue; }
    const matt = matSerieFraga(q), grans = serieGranser(q);
    if (matt.noder > grans.noder || matt.bytes > grans.bytes) continue;
    radNycklar.add(rk);
    if (lk) lagesrader.add(`${q.niva}|${lk}`);
    for (const k of foljdNycklar(q)) foljder.add(k);
    if (f2(q)) f2Nycklar.add(f2(q));
    regelNycklar.set(rn, q.id);
    if (ERSATT) rorelser.add(rorelse(q));
    q.fran_version = 4;
    q.misstag = q.misstag.map((m) => (m ? putsa(m) : m));
    texter(q);
    perGrupp[grupp] = (perGrupp[grupp] ?? 0) + 1;
    perStruktur[sk] = (perStruktur[sk] ?? 0) + 1;
    perVariantGjorda[variant.namn] = (perVariantGjorda[variant.namn] ?? 0) + 1;
    nummer[nyckelNr] = (nummer[nyckelNr] ?? 0) + 1;
    perNiva[mall.niva].push(q);
    gjorda++;
    variant = null;
  }
  console.log(`${mall.id} ${mall.namn}: ${gjorda} (${forsok} försök) ${JSON.stringify(perVariantGjorda)}`);
  const nya = perNiva[mall.niva].filter((q) => q.recept === mall.id);
  writeFileSync(`${DEL}/${mall.id}.json`, JSON.stringify([...(ERSATT ? kvar[mall.id] ?? [] : []), ...nya], null, 1) + '\n');
}
if (ERSATT) {
  // Kandidatfilerna: de kvarvarande i sin ordning, ersättarna efter.
  for (const niva of ['grund', 'avancerad', 'expert']) {
    const f = `${K}/parti4-${niva}.json`;
    const fore = JSON.parse(readFileSync(f, 'utf8'));
    const ut = [...fore.filter((q) => !STRYK.has(q.id)), ...perNiva[niva]];
    // F8 på p 0,45 och svårighet 3 (granskningen, avsnittet F8): mallens värden på alla.
    for (const q of ut) { const m = MALLAR.find((x) => x.id === q.recept); q.p_prior = m.p_prior; q.difficulty = m.difficulty; }
    writeFileSync(f, JSON.stringify(ut, null, 1) + '\n');
    console.log(`${f}: ${fore.length} före, ${ut.length} efter (${perNiva[niva].length} ersättare)`);
  }
}
console.log(`Klart på ${((Date.now() - start) / 1000).toFixed(1)} s.${ERSATT ? '' : ' Sedan: --sammanfoga'}`);

/**
 * Texterna som mallarna i misstag-serie.mjs inte täcker för de nya
 * varianterna: rubriken när bara kärnan i en duo rör sig (den talar annars om
 * pricken), och månghörningens fyllning, som heter "Fyllningen" i regeln som
 * hos grundformen.
 */
function texter(q) {
  const { prim, dims } = q.regler;
  if (prim.startsWith('duo-') && dims.ylage?.regel === 'konstant') {
    const karna = prim.split('-')[2];
    const namn = { pil: 'Pilen i mitten', form: 'Formen i mitten', symbol: 'Symbolen i mitten' }[karna];
    q.title = q.title.replace(/^[^,]+,/, `${namn},`);
  }
  // F7 med antal: copywriterns mening för antalet (figurserier-copy-omgang3.mjs, 6.1).
  if (['sektor', 'stralar', 'prickar', 'block'].includes(prim) && dims.start?.regel === 'vaxelvis' && dims.antal?.regel === 'steg') {
    const T = {
      'sektor+': ['En sektor till blir svart medurs i varje steg.', 'Antalet svarta sektorer ökar med en i varje figur, oavsett serie. De sitter ihop medurs från den första svarta.'],
      'sektor-': ['Den sista svarta sektorn medurs blir vit i varje steg.', 'Antalet svarta sektorer minskar med en i varje figur, oavsett serie. De sitter ihop medurs från den första svarta.'],
      'stralar+': ['Ett streck till läggs till medurs i varje steg.', 'Antalet streck ökar med ett i varje figur, oavsett serie. Strecken sitter ihop medurs från det första.'],
      'stralar-': ['Det sista strecket medurs försvinner i varje steg.', 'Antalet streck minskar med ett i varje figur, oavsett serie. Strecken sitter ihop medurs från det första.'],
      'prickar+': ['En prick till läggs till medurs i varje steg.', 'Antalet prickar ökar med en i varje figur, oavsett serie. Prickarna sitter ihop medurs från den första.'],
      'prickar-': ['Den sista pricken medurs försvinner i varje steg.', 'Antalet prickar minskar med en i varje figur, oavsett serie. Prickarna sitter ihop medurs från den första.'],
      'block+': ['En ruta till blir svart medurs längs kanten i varje steg.', 'Antalet svarta rutor ökar med en i varje figur, oavsett serie. De sitter ihop medurs längs kanten från den första svarta.'],
      'block-': ['Den sista svarta rutan medurs blir vit i varje steg.', 'Antalet svarta rutor minskar med en i varje figur, oavsett serie. De sitter ihop medurs längs kanten från den första svarta.'],
    }[`${prim}${dims.antal.k > 0 ? '+' : '-'}`];
    if (!q.rule.includes(T[0])) throw new Error(`${q.id}: väntad antalsmening saknas`);
    q.rule = q.rule.replace(T[0], T[1]);
  }
  if (prim === 'poly' && dims.fyllning?.regel === 'cykel') {
    q.rule = q.rule.replace('Figuren följer ordningen', 'Fyllningen följer ordningen').replace('Figuren växlar mellan', 'Fyllningen växlar mellan');
  }
}
