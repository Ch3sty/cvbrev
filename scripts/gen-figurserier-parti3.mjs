#!/usr/bin/env node
// scripts/gen-figurserier-parti3.mjs
// =============================================================================
// Parti 3 av figurseriernas härnäst-uppgifter (frågebanken 2026-11-19): 100
// nya uppgifter, 39 grund, 39 avancerad och 22 expert (samma proportioner som
// härnäst-poolen i dag), ur mallarna F1, F3, F4, F5 och F7 (samma p_prior och
// svårighet per mall som banken) med nya
// varianter. De nya varianterna använder primitiver som renderaren redan
// ritar och som spärrarna och geometrikontrollen redan täcker, men som serien
// inte använt i den mallen förut:
//
//   F1  duo med kantprick och symbol, duo med bana och pil, duo med pil som
//       vrids medan pricken står still
//   F3  sektorhjulet och 3×3-kanten med växande steg, duo med bana och symbol
//   F4  grundformen med form och symbol, månghörningen (hörn och fyllning),
//       duo med bana och pil, duo med kantprick och symbol, 3×3-kanten med
//       kvartsvarv och antal
//   F5  3×3-kanten, strålarna och duo med bana och symbol växelvis
//   F7  duo med bana och symbol, duo med kantprick och form i otakt
//
// F2 (antal på grund) får inga nya: varje kombination av primitiv, riktning
// och startantal finns redan på nivån (F2-nyckeln i validate-figurserier.mjs).
// F6 (tre regler) får inga nya: med tre regler och ingen konstant kräver
// spärrarna en nära miss per regel och två som bryter alla, och S6 på expert
// (ingen distraktor ensam om ett värde där facits värde finns två gånger)
// tvingar då de två som bryter alla att bli lika. Ingen ny F6 klarar alla
// spärrar; bankens F6 är godkända före skärpningen (GODKANDA i sparrar.mjs).
//
// Inget återanvänds: ingen rad (fem visade plus facit) och ingen lägesrad
// per nivå som redan finns i någon bank eller kandidatfil, numreringen
// fortsätter efter allt som finns. Deterministiskt (samma seed ger samma fil).
//
// Kör (en mall per process går parallellt, sedan sammanfogning):
//   node node_modules/tsx/dist/cli.mjs scripts/gen-figurserier-parti3.mjs --mall=F1   (F1, F3, F4, F5, F7)
//   node node_modules/tsx/dist/cli.mjs scripts/gen-figurserier-parti3.mjs --sammanfoga
// Skriver: src/lib/figurserierV1/bankParti3{Grund,Avancerad,Expert}.json
// Kontroll: node node_modules/tsx/dist/cli.mjs scripts/figurserier-verifiera.ts
// =============================================================================

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { MALLAR, NIVA_KOD } from './lib/serie/recept-serie.mjs';
import { bygg } from './lib/serie/generera-serie.mjs';
import { PRIM } from './lib/serie/celler-serie.mjs';
import { strukturNyckel, radNyckel, lagesNyckel, foljdNycklar } from './lib/serie/struktur.mjs';
import { mulberry32, hashString } from './lib/serie/slump.mjs';
import { putsa } from './figurserier-copy-omgang3.mjs';

// V11 (noder och bytes per fråga) mäts på renderarens utdata, som är TSX: kör med tsx.
let matSerieFraga, serieGranser;
try {
  ({ matSerieFraga, serieGranser } = await import('../src/lib/logicTestV7/svgMatt.tsx'));
} catch {
  throw new Error('Kör med tsx: node node_modules/tsx/dist/cli.mjs scripts/gen-figurserier-parti3.mjs');
}

const B = 'src/lib/figurserierV1';
const K = `${B}/kandidater`;
const SEED = 'figurserier-v1-parti3';
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
const NYA = {
  F1: [
    { namn: 'duo-kant-symbol-steg', family: 'vandring', regler: (r) => ({ prim: 'duo-kant-symbol', dims: { ylage: steg(r8(r), valj(r, UDDA)), ksymbol: konst(valj(r, SYMB)) } }) },
    { namn: 'duo-orbital-pil-steg', family: 'vandring', regler: (r) => ({ prim: 'duo-orbital-pil', dims: { ylage: steg(r8(r), valj(r, UDDA)), kvinkel: konst(r8(r)) } }) },
    { namn: 'duo-kant-pil-vrid', family: 'vridning', regler: (r) => ({ prim: 'duo-kant-pil', dims: { ylage: konst(r8(r)), kvinkel: steg(r8(r), valj(r, UDDA)) } }) },
  ],
  F3: [
    { namn: 'sektor-vaxande', family: 'vaxande', regler: (r) => ({ prim: 'sektor', dims: { start: vaxande(r), antal: konst(valj(r, [1, 2, 3])) } }) },
    { namn: 'block-vaxande', family: 'vaxande', regler: (r) => ({ prim: 'block', dims: { start: vaxande(r), antal: konst(valj(r, [1, 2])) } }) },
    { namn: 'duo-orbital-symbol-vaxande', family: 'vaxande', regler: (r) => ({ prim: 'duo-orbital-symbol', dims: { ylage: vaxande(r), ksymbol: konst(valj(r, SYMB)) } }) },
  ],
  F4: [
    { namn: 'grundform-form-symbol', family: 'fyllning', regler: (r) => { const p = valj(r, [[3, 2], [2, 3]]); return { prim: 'grundform', dims: { bas: cykelOlika(r, ['circle', 'square', 'triangle', 'diamond'], p[0]), symbol: cykelOlika(r, ['plus', 'minus', 'dot', 'ring', 'cross'], p[1]), fyllning: konst(valj(r, ['none', 'gray', 'black'])) } }; } },
    { namn: 'poly-horn-fyllning', family: 'antal', regler: (r) => ({ prim: 'poly', dims: { horn: antalSteg(r, 3, 8), fyllning: cykelOlika(r, ['none', 'gray', 'black'], valj(r, [2, 3])) } }) },
    { namn: 'duo-orbital-pil', family: 'flera', regler: (r) => ({ prim: 'duo-orbital-pil', dims: { ylage: steg(r8(r), valj(r, UDDA)), kvinkel: steg(r8(r), valj(r, KVART)) } }) },
    { namn: 'duo-kant-symbol', family: 'flera', regler: (r) => ({ prim: 'duo-kant-symbol', dims: { ylage: steg(r8(r), valj(r, UDDA)), ksymbol: cykelOlika(r, SYMB, 3) } }) },
    { namn: 'block-kvart-antal', family: 'antal', regler: (r) => ({ prim: 'block', dims: { start: steg(r8(r), valj(r, KVART)), antal: antalSteg(r, 1, 7) } }) },
  ],
  F5: [
    { namn: 'block-vaxelvis', family: 'vaxelvis', regler: (r) => ({ prim: 'block', dims: { start: vaxelvis(r), antal: konst(valj(r, [1, 2])) } }) },
    { namn: 'stralar-vaxelvis', family: 'vaxelvis', regler: (r) => ({ prim: 'stralar', dims: { start: vaxelvis(r), antal: konst(valj(r, [2, 3])) } }) },
    { namn: 'duo-orbital-symbol-vaxelvis', family: 'vaxelvis', regler: (r) => ({ prim: 'duo-orbital-symbol', dims: { ylage: vaxelvis(r), ksymbol: konst(valj(r, SYMB)) } }) },
  ],
  F7: [
    { namn: 'duo-orbital-symbol-tretakt', family: 'vaxelvis', regler: (r) => ({ prim: 'duo-orbital-symbol', dims: { ylage: vaxelvis(r), ksymbol: cykelOlika(r, SYMB, 3) } }) },
    { namn: 'duo-kant-form-tretakt', family: 'vaxelvis', regler: (r) => ({ prim: 'duo-kant-form', dims: { ylage: vaxelvis(r), kform: cykelOlika(r, KFORM, 3), kfyll: konst(valj(r, ['none', 'black'])) } }) },
  ],
};
// Varianter ur banken som står utanför parti 3 (inga i dag).
const UTAN = new Set();

/** Antal per mall i parti 3. */
const ANTAL = { F1: 25, F3: 14, F4: 25, F5: 14, F7: 22 };

// ---------------------------------------------------------------- det som redan finns
const filer = [
  ...['Grund', 'Avancerad', 'Expert', 'Parti2Grund', 'Parti2Avancerad'].map((n) => `${B}/bank${n}.json`),
  ...['', 'omgang1/', 'omgang2/', 'generator/'].flatMap((d) => ['grund', 'avancerad', 'expert'].map((n) => `${K}/${d}${n}.json`)),
  `${K}/parti2-grund.json`, `${K}/parti2-avancerad.json`,
].filter((f) => existsSync(f));
const radNycklar = new Set();
const lagesrader = new Set();
// Följdnycklarna (granskningen av parti 3, punkt 5): samma lägesföljd inom
// nivå och familj avvisas, också under en annan primitiv eller vriden.
const foljder = new Set();
const nummer = {};
for (const f of filer) for (const q of JSON.parse(readFileSync(f, 'utf8'))) {
  // Bara skarpa banker räknas för raderna och lägena; kandidaterna (strukna inräknade) räknas för numreringen.
  if (f.startsWith(`${B}/bank`)) {
    radNycklar.add(radNyckel(q));
    const l = lagesNyckel(q);
    if (l) lagesrader.add(`${q.niva}|${l}`);
    for (const k of foljdNycklar(q)) foljder.add(k);
  } else radNycklar.add(radNyckel(q));
  const m = /^fs-([gae])-([a-z]+)-(\d+)$/.exec(q.id);
  if (m) nummer[`${m[1]}-${m[2]}`] = Math.max(nummer[`${m[1]}-${m[2]}`] ?? 0, Number(m[3]));
}

// ---------------------------------------------------------------- generering
// En mall per process går att köra parallellt: --mall=F4 skriver
// kandidater/parti3/F4.json. --sammanfoga läser de sex och skriver bankerna
// (och kontrollerar att ingen rad eller lägesrad krockar mellan mallarna).
const DEL = `${K}/parti3`;
const ARG_MALL = process.argv.find((a) => a.startsWith('--mall='))?.slice('--mall='.length);
const FIL = { grund: 'Grund', avancerad: 'Avancerad', expert: 'Expert' };

// ---------------------------------------------------------------- ersättare
// Granskningen av parti 3 (docs/fragebank/figurserier-2026-11-19-granskning.md)
// strök fem uppgifter. --ersatt byter dem i bankParti3*.json: samma mall, facit
// på samma plats, en rad som inte delar rad, lägesrad eller följdnyckel med
// något i bankerna. fs-e-vaxl-24 blir en F7 med antal (fs-e-antal-14) så att
// expert får färre växelvisa i tretakt. Övriga 95 rörs inte. Deterministiskt.
const ERSATT = {
  'fs-a-antal-14': { varianter: ['poly-horn-fyllning'] },
  'fs-g-vax-13': { varianter: ['orbital-vaxande'] },
  'fs-g-vax-17': { varianter: ['duo-orbital-symbol-vaxande'] },
  'fs-a-flera-13': { varianter: ['duo-kant-pil'] },
  'fs-e-vaxl-24': { varianter: ['stralar-vaxelvis-antalsteg', 'sektor-vaxelvis-antalsteg'], nyttId: 'fs-e-antal-14' },
};
if (process.argv.includes('--ersatt')) {
  const VARIANT = Object.fromEntries(MALLAR.flatMap((m) => [...(NYA[m.id] ?? []), ...m.varianter].map((v) => [v.namn, { mall: m, v }])));
  const FILER = Object.fromEntries(Object.entries(FIL).map(([n, f]) => [n, `${B}/bankParti3${f}.json`]));
  const banker = Object.fromEntries(Object.entries(FILER).map(([n, f]) => [n, JSON.parse(readFileSync(f, 'utf8'))]));
  // Allt som står kvar räknas: de skarpa bankerna (redan inlästa ovan) och parti 3 utom de fem.
  for (const q of Object.values(banker).flat()) {
    if (ERSATT[q.id]) continue;
    radNycklar.add(radNyckel(q));
    const l = lagesNyckel(q);
    if (l) lagesrader.add(`${q.niva}|${l}`);
    for (const k of foljdNycklar(q)) foljder.add(k);
  }
  for (const [id, e] of Object.entries(ERSATT)) {
    const niva = Object.keys(banker).find((n) => banker[n].some((q) => q.id === id));
    if (!niva) { console.log(`${id}: redan ersatt`); continue; }
    const i = banker[niva].findIndex((q) => q.id === id);
    const gammal = banker[niva][i];
    const r = mulberry32(hashString(`${SEED}:ersatt:${id}`));
    let ny = null;
    for (let f = 0; f < 20000 && !ny; f++) {
      const { mall: bas, v } = VARIANT[e.varianter[f % e.varianter.length]];
      const mall = { ...bas };
      const q = bygg(r, mall, v, { id: e.nyttId ?? id, pos: gammal.correctAnswer });
      if (!q) continue;
      if (radNycklar.has(radNyckel(q))) continue;
      const lk = lagesNyckel(q);
      if (lk && lagesrader.has(`${q.niva}|${lk}`)) continue;
      if (foljdNycklar(q).some((k) => foljder.has(k))) continue;
      const matt = matSerieFraga(q), grans = serieGranser(q);
      if (matt.noder > grans.noder || matt.bytes > grans.bytes) continue;
      ny = q;
    }
    if (!ny) throw new Error(`${id}: ingen ersättare`);
    ny.fran_version = 3;
    ny.misstag = ny.misstag.map((m) => (m ? putsa(m) : m));
    texter(ny);
    radNycklar.add(radNyckel(ny));
    const lk = lagesNyckel(ny);
    if (lk) lagesrader.add(`${ny.niva}|${lk}`);
    for (const k of foljdNycklar(ny)) foljder.add(k);
    banker[niva][i] = ny;
    console.log(`${id} -> ${ny.id} (${ny.variant}): ${ny.rule}`);
  }
  for (const [n, f] of Object.entries(FILER)) writeFileSync(f, JSON.stringify(banker[n], null, 1) + '\n');
  process.exit(0);
}

if (process.argv.includes('--sammanfoga')) {
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
    const f = `${B}/bankParti3${FIL[niva]}.json`;
    writeFileSync(f, JSON.stringify(fragor, null, 1) + '\n');
    console.log(`${f}: ${fragor.length} frågor`);
  }
  process.exit(0);
}
mkdirSync(DEL, { recursive: true });
const start = Date.now();
const perNiva = { grund: [], avancerad: [], expert: [] };
for (const bas of MALLAR) {
  const antal = ANTAL[bas.id];
  if (!antal || (ARG_MALL && ARG_MALL !== bas.id)) continue;
  // Nya varianter först, sedan mallens egna (utom de som står utanför).
  const varianter = [...NYA[bas.id], ...bas.varianter.filter((v) => !UTAN.has(v.namn))];
  const mall = { ...bas, antal };
  const r = mulberry32(hashString(`${SEED}:${mall.id}`));
  // Kvoterna räknas som validatorn gör: på mallens antal i banken.
  const tak = Math.ceil(bas.antal / 3);
  const strukturTak = Math.ceil(bas.antal / 2);
  const perGrupp = {};
  const perStruktur = {};
  const platser = [];
  while (platser.length < antal) platser.push(0, 1, 2, 3, 4, 5);
  for (let i = platser.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [platser[i], platser[j]] = [platser[j], platser[i]]; }
  let gjorda = 0, forsok = 0, v = 0, variant = null, perVariant = 0;
  const perVariantGjorda = {};
  while (gjorda < antal) {
    if (++forsok > 80000) throw new Error(`${mall.id}: fick bara ${gjorda} av ${antal}`);
    if (forsok % 2000 === 0) console.log(`${mall.id}: ${forsok} försök, ${gjorda} klara, ${((Date.now() - start) / 1000).toFixed(0)} s`);
    if (!variant || perVariant >= 80) { variant = varianter[v++ % varianter.length]; perVariant = 0; }
    perVariant++;
    if ((perGrupp[PRIM[variant.regler(mulberry32(1)).prim].grupp] ?? 0) >= tak) { perVariant = 80; continue; }
    const kod = NIVA_KOD[mall.niva];
    const nyckelNr = `${kod}-${FAM_KOD[variant.family]}`;
    const id = `fs-${kod}-${FAM_KOD[variant.family]}-${String((nummer[nyckelNr] ?? 0) + 1).padStart(2, '0')}`;
    const q = bygg(r, mall, variant, { id, pos: platser[gjorda] });
    if (!q) continue;
    const grupp = PRIM[q.regler.prim].grupp;
    if ((perGrupp[grupp] ?? 0) >= tak) continue;
    const sk = strukturNyckel(q);
    if ((perStruktur[sk] ?? 0) >= strukturTak) continue;
    const rk = radNyckel(q);
    if (radNycklar.has(rk)) continue;
    const lk = lagesNyckel(q);
    if (lk && lagesrader.has(`${q.niva}|${lk}`)) continue;
    if (foljdNycklar(q).some((k) => foljder.has(k))) continue;
    const matt = matSerieFraga(q), grans = serieGranser(q);
    if (matt.noder > grans.noder || matt.bytes > grans.bytes) continue;
    radNycklar.add(rk);
    if (lk) lagesrader.add(`${q.niva}|${lk}`);
    for (const k of foljdNycklar(q)) foljder.add(k);
    q.fran_version = 3;
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
  writeFileSync(`${DEL}/${mall.id}.json`, JSON.stringify(perNiva[mall.niva].filter((q) => q.recept === mall.id), null, 1) + '\n');
}
console.log(`Klart på ${((Date.now() - start) / 1000).toFixed(1)} s. Sedan: --sammanfoga`);

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
  if (['sektor', 'stralar'].includes(prim) && dims.start?.regel === 'vaxelvis' && dims.antal?.regel === 'steg') {
    const T = {
      'sektor+': ['En sektor till blir svart medurs i varje steg.', 'Antalet svarta sektorer ökar med en i varje figur, oavsett serie. De sitter ihop medurs från den första svarta.'],
      'sektor-': ['Den sista svarta sektorn medurs blir vit i varje steg.', 'Antalet svarta sektorer minskar med en i varje figur, oavsett serie. De sitter ihop medurs från den första svarta.'],
      'stralar+': ['Ett streck till läggs till medurs i varje steg.', 'Antalet streck ökar med ett i varje figur, oavsett serie. Strecken sitter ihop medurs från det första.'],
      'stralar-': ['Det sista strecket medurs försvinner i varje steg.', 'Antalet streck minskar med ett i varje figur, oavsett serie. Strecken sitter ihop medurs från det första.'],
    }[`${prim}${dims.antal.k > 0 ? '+' : '-'}`];
    if (!q.rule.includes(T[0])) throw new Error(`${q.id}: väntad antalsmening saknas`);
    q.rule = q.rule.replace(T[0], T[1]);
  }
  if (prim === 'poly' && dims.fyllning?.regel === 'cykel') {
    q.rule = q.rule.replace('Figuren följer ordningen', 'Fyllningen följer ordningen').replace('Figuren växlar mellan', 'Fyllningen växlar mellan');
  }
}
