#!/usr/bin/env node
// scripts/gen-figurserier.mjs
// =============================================================================
// Genererar figurseriernas kandidater (beställningen omgång 2, A6 punkt 2):
// 36 / 30 / 30 frågor ur mallarna F1 till F7, deterministiskt (samma seed
// ger byte-identiska filer). Inget hamnar i den skarpa banken härifrån;
// befordran sker efter testansvarigs granskning.
//
// Kör: node scripts/gen-figurserier.mjs
// Skriver: src/lib/figurserierV1/kandidater/generator/{grund,avancerad,expert}.json
// (den granskade kandidatlistan byggs av scripts/figurserier-omgang2.mjs)
//
// Kedjan efter generatorn:
//   node scripts/validate-figurserier.mjs              struktur, p_prior, kvoter, spärrar
//   node scripts/v7-facit-check.mjs --serie            FS1 till FS6, S5, S6, S11 till S13
//   node scripts/v7-distraktor-check.mjs --serie       kraven på distraktorerna (A5)
//   node scripts/v7-geometri-check.mjs --serie <fil>   G1 till G12, S1 till S5, V11, V12
//   node node_modules/tsx/dist/cli.mjs scripts/render-matris-granskning.tsx --serie --fil <fil>
//
// Inom en mall: varje primitivgrupp högst ⌈n/3⌉ gånger, ingen strukturnyckel
// (regel och parametrar per dimension, utan startläget) fler än ⌈n/2⌉, och
// ingen rad (fem visade plus facit, per dimension) två gånger i banken.
// =============================================================================

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { MALLAR, NIVA_KOD } from './lib/serie/recept-serie.mjs';
import { bygg } from './lib/serie/generera-serie.mjs';
import { PRIM, dimNyckel } from './lib/serie/celler-serie.mjs';
import { strukturNyckel, radNyckel, lagesNyckel } from './lib/serie/struktur.mjs';
import { mulberry32, hashString } from './lib/serie/slump.mjs';
import { genereraBryter } from './lib/serie/generera-bryter.mjs';

// Omgång 3 (beställning omgång 3, A1 och A2):
//   --bryter   "bryter mönstret" i regelform, mallarna B1 till B4 (16 grund,
//              16 avancerad) till kandidater/bryter-{grund,avancerad}.json
//   --parti=2  härnäst parti 2: 8 grund (F1 4, F2 4) och 16 avancerad (F4 10,
//              F5 6), fran_version 2, till kandidater/parti2-{grund,avancerad}.json.
//              Ingen rad och ingen lägesrad som redan finns i bankerna eller
//              bland kandidaterna; numreringen fortsätter efter dem.
const K = 'src/lib/figurserierV1/kandidater';
if (process.argv.includes('--bryter')) {
  const t0 = Date.now();
  const ut = genereraBryter({ logg: console.log });
  for (const [niva, fragor] of Object.entries(ut)) {
    writeFileSync(`${K}/bryter-${niva}.json`, JSON.stringify(fragor, null, 1) + '\n');
    console.log(`${K}/bryter-${niva}.json: ${fragor.length} frågor`);
  }
  console.log(`Klart på ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  process.exit(0);
}
const PARTI = Number((process.argv.find((a) => a.startsWith('--parti=')) ?? '--parti=1').slice('--parti='.length));
const PARTI2 = { F1: 4, F2: 4, F4: 10, F5: 6 };

// Generatorns råa pool. De granskade kandidaterna (det som kan befordras)
// byggs av scripts/figurserier-omgang2.mjs ur granskningens beslut.
const UT = PARTI === 2 ? K : 'src/lib/figurserierV1/kandidater/generator';
const FAM_KOD = { vridning: 'vrid', vandring: 'vand', antal: 'antal', fyllning: 'fyll', vaxande: 'vax', vaxelvis: 'vaxl', flera: 'flera' };
const SEED = PARTI === 2 ? 'figurserier-v1-parti2' : 'figurserier-v1';

const start = Date.now();
mkdirSync(UT, { recursive: true });
const perNiva = { grund: [], avancerad: [], expert: [] };
const radNycklar = new Set();
const nummer = {};
const lagesrader = new Set();
if (PARTI === 2) {
  // Allt som redan finns: bankerna och kandidatfilerna (strukna inräknade, så att inget id återanvänds).
  const filer = [
    'src/lib/figurserierV1/bankGrund.json', 'src/lib/figurserierV1/bankAvancerad.json', 'src/lib/figurserierV1/bankExpert.json',
    ...['', 'omgang1/', 'omgang2/'].flatMap((d) => ['grund', 'avancerad', 'expert'].map((n) => `${K}/${d}${n}.json`)),
  ].filter((f) => existsSync(f));
  for (const f of filer) for (const q of JSON.parse(readFileSync(f, 'utf8'))) {
    radNycklar.add(radNyckel(q));
    const l = lagesNyckel(q);
    if (l) lagesrader.add(`${q.niva}|${l}`);
    const m = /^fs-([gae])-([a-z]+)-(\d+)$/.exec(q.id);
    if (m) nummer[`${m[1]}-${m[2]}`] = Math.max(nummer[`${m[1]}-${m[2]}`] ?? 0, Number(m[3]));
  }
}
const mallar = PARTI === 2 ? MALLAR.filter((m) => PARTI2[m.id]).map((m) => ({ ...m, antal: PARTI2[m.id] })) : MALLAR;

for (const mall of mallar) {
  const r = mulberry32(hashString(`${SEED}:${mall.id}`));
  const tak = Math.ceil(mall.antal / 3);
  const strukturTak = Math.ceil(mall.antal / 2);
  const perGrupp = {};
  const perStruktur = {};
  // Facits plats: jämnt fördelad över A till F inom mallen, i blandad ordning.
  const platser = [];
  while (platser.length < mall.antal) platser.push(...[0, 1, 2, 3, 4, 5]);
  for (let i = platser.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [platser[i], platser[j]] = [platser[j], platser[i]]; }
  let gjorda = 0;
  let forsok = 0;
  let v = 0;
  // Varianterna i tur och ordning; en variant får upp till 80 försök innan
  // nästa tar vid, så att varianter med lägre träffsäkerhet inte trängs undan.
  let variant = null;
  let perVariant = 0;
  while (gjorda < mall.antal) {
    if (++forsok > 60000) throw new Error(`${mall.id}: fick bara ${gjorda} av ${mall.antal}`);
    if (!variant || perVariant >= 80) { variant = mall.varianter[v++ % mall.varianter.length]; perVariant = 0; }
    perVariant++;
    if ((perGrupp[PRIM[variant.regler(mulberry32(1)).prim].grupp] ?? 0) >= tak) { perVariant = 80; continue; }
    const kod = NIVA_KOD[mall.niva];
    const fam = FAM_KOD[variant.family];
    const nyckelNr = `${kod}-${fam}`;
    const id = `fs-${kod}-${fam}-${String((nummer[nyckelNr] ?? 0) + 1).padStart(2, '0')}`;
    const q = bygg(r, mall, variant, { id, pos: platser[gjorda] });
    if (!q) continue;
    const grupp = PRIM[q.regler.prim].grupp;
    if ((perGrupp[grupp] ?? 0) >= tak) continue;
    const sk = strukturNyckel(q);
    if ((perStruktur[sk] ?? 0) >= strukturTak) continue;
    const rk = radNyckel(q);
    if (radNycklar.has(rk)) continue;
    const lk = lagesNyckel(q);
    if (PARTI === 2 && lk && lagesrader.has(`${q.niva}|${lk}`)) continue;
    radNycklar.add(rk);
    if (lk) lagesrader.add(`${q.niva}|${lk}`);
    if (PARTI === 2) q.fran_version = 2;
    perGrupp[grupp] = (perGrupp[grupp] ?? 0) + 1;
    perStruktur[sk] = (perStruktur[sk] ?? 0) + 1;
    nummer[nyckelNr] = (nummer[nyckelNr] ?? 0) + 1;
    perNiva[mall.niva].push(q);
    gjorda++;
    variant = null;
  }
  console.log(`${mall.id} ${mall.namn}: ${gjorda} frågor (${forsok} försök), primitiver ${JSON.stringify(perGrupp)}`);
}

for (const [niva, fragor] of Object.entries(perNiva)) {
  if (PARTI === 2) {
    if (!fragor.length) continue;
    writeFileSync(`${UT}/parti2-${niva}.json`, JSON.stringify(fragor, null, 1) + '\n');
    console.log(`${UT}/parti2-${niva}.json: ${fragor.length} frågor`);
    continue;
  }
  writeFileSync(`${UT}/${niva}.json`, JSON.stringify(fragor, null, 1) + '\n');
  console.log(`${UT}/${niva}.json: ${fragor.length} frågor`);
}
void dimNyckel;
console.log(`Klart på ${((Date.now() - start) / 1000).toFixed(1)} s`);
