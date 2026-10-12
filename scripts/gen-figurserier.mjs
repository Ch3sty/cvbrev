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

import { writeFileSync, mkdirSync } from 'node:fs';
import { MALLAR, NIVA_KOD } from './lib/serie/recept-serie.mjs';
import { bygg } from './lib/serie/generera-serie.mjs';
import { PRIM, dimNyckel } from './lib/serie/celler-serie.mjs';
import { strukturNyckel, radNyckel } from './lib/serie/struktur.mjs';
import { mulberry32, hashString } from './lib/serie/slump.mjs';

// Generatorns råa pool. De granskade kandidaterna (det som kan befordras)
// byggs av scripts/figurserier-omgang2.mjs ur granskningens beslut.
const UT = 'src/lib/figurserierV1/kandidater/generator';
const FAM_KOD = { vridning: 'vrid', vandring: 'vand', antal: 'antal', fyllning: 'fyll', vaxande: 'vax', vaxelvis: 'vaxl', flera: 'flera' };
const SEED = 'figurserier-v1';

const start = Date.now();
mkdirSync(UT, { recursive: true });
const perNiva = { grund: [], avancerad: [], expert: [] };
const radNycklar = new Set();
const nummer = {};

for (const mall of MALLAR) {
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
    if (++forsok > 20000) throw new Error(`${mall.id}: fick bara ${gjorda} av ${mall.antal}`);
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
    radNycklar.add(rk);
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
  writeFileSync(`${UT}/${niva}.json`, JSON.stringify(fragor, null, 1) + '\n');
  console.log(`${UT}/${niva}.json: ${fragor.length} frågor`);
}
void dimNyckel;
console.log(`Klart på ${((Date.now() - start) / 1000).toFixed(1)} s`);
