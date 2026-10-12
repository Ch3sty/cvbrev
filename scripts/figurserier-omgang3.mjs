#!/usr/bin/env node
// scripts/figurserier-omgang3.mjs
// =============================================================================
// Granskning 02 genomförd (docs/qa/figurserier/granskning-02.md och
// beslut-02.json). Läser omgång 2:s kandidater
// (src/lib/figurserierV1/kandidater/omgang2/) och skriver
// src/lib/figurserierV1/kandidater/{grund,avancerad,expert}.json:
//
//   godkända  oförändrade (granskning 01 och 02)
//   andra     fs-e-vaxl-01, 03, 05, 07: samma rad och id, nya alternativ
//             (S14 med konstanter, högst två konstantbrott)
//   strukna   fs-e-flera-04 och fs-e-antal-03 tas bort
//   nya       sex expertfrågor: två F6 flera (duo orbital + form, duo kant +
//             form) och fyra F7 antal med antal i steg (sektorhjul, strålar);
//             ingen delar rad eller lägesrad med en fråga på nivån
//
// Skriver docs/qa/figurserier/omgang3/lista.json. Deterministiskt.
// Kör: node scripts/figurserier-omgang3.mjs
// =============================================================================

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { MALLAR, NIVA_KOD } from './lib/serie/recept-serie.mjs';
import { bygg, byggAlternativ, byggRad } from './lib/serie/generera-serie.mjs';
import { radNyckel, lagesNyckel } from './lib/serie/struktur.mjs';
import { mulberry32, hashString } from './lib/serie/slump.mjs';

const IN = 'src/lib/figurserierV1/kandidater/omgang2';
const UT = 'src/lib/figurserierV1/kandidater';
const beslut = JSON.parse(readFileSync('docs/qa/figurserier/beslut-02.json', 'utf8'));
const MALL = Object.fromEntries(MALLAR.map((m) => [m.id, m]));
const VARIANT = Object.fromEntries(MALLAR.flatMap((m) => m.varianter.map((v) => [v.namn, { mall: m, v }])));
const andra = new Set(beslut.andra.map((x) => x.id));
const strukna = new Set(beslut.strukna.map((x) => x.id));
const FAM_KOD = { vridning: 'vrid', vandring: 'vand', antal: 'antal', fyllning: 'fyll', vaxande: 'vax', vaxelvis: 'vaxl', flera: 'flera' };
const NYA = [
  { variant: 'duo-orbital-form-flera', ersatter: 'fs-e-flera-04' },
  { variant: 'duo-kant-form-flera' },
  { variant: 'sektor-vaxelvis-antalsteg', ersatter: 'fs-e-antal-03' },
  { variant: 'stralar-vaxelvis-antalsteg' },
  { variant: 'sektor-vaxelvis-antalsteg' },
  { variant: 'stralar-vaxelvis-antalsteg' },
];

const ut = { grund: [], avancerad: [], expert: [] };
const lista = { andrade: [], nya: [], strukna: [...strukna] };
const nummer = {};
const rader = new Set();
const lagen = new Set();
const minns = (q) => { rader.add(radNyckel(q)); const l = lagesNyckel(q); if (l) lagen.add(`${q.niva}|${l}`); };
const ledig = (q) => !rader.has(radNyckel(q)) && !(lagesNyckel(q) && lagen.has(`${q.niva}|${lagesNyckel(q)}`));

const filer = ['grund', 'avancerad', 'expert'].flatMap((n) => JSON.parse(readFileSync(`${IN}/${n}.json`, 'utf8')));
for (const q of filer) {
  const m = /^fs-([gae])-([a-z]+)-(\d+)$/.exec(q.id);
  nummer[`${m[1]}-${m[2]}`] = Math.max(nummer[`${m[1]}-${m[2]}`] ?? 0, Number(m[3]));
}
for (const q of filer) if (!strukna.has(q.id) && !andra.has(q.id)) minns(q);

for (const q of filer) {
  const mall = MALL[q.recept];
  if (strukna.has(q.id)) continue;
  if (!andra.has(q.id)) { ut[mall.niva].push(q); continue; }
  const r = mulberry32(hashString(`omgang3:${q.id}`));
  const rad = byggRad(q.regler);
  if (rad.fel) throw new Error(`${q.id}: ${rad.fel}`);
  let ny = null;
  for (let f = 0; f < 6 && !ny; f++) ny = byggAlternativ(r, mall, q.regler, { id: q.id, family: q.family, variant: q.variant }, { pos: Math.floor(r() * 6), rad, forsok: 200000 });
  if (!ny) throw new Error(`${q.id}: inga alternativ klarar spärrarna`);
  ut[mall.niva].push(ny);
  lista.andrade.push(q.id);
  minns(ny);
}

for (const [i, n] of NYA.entries()) {
  const { mall, v } = VARIANT[n.variant];
  const r = mulberry32(hashString(`omgang3:ny:${i}:${n.variant}`));
  const kod = NIVA_KOD[mall.niva];
  const fam = FAM_KOD[v.family];
  let ny = null;
  for (let f = 0; f < 3000 && !ny; f++) {
    const id = `fs-${kod}-${fam}-${String((nummer[`${kod}-${fam}`] ?? 0) + 1).padStart(2, '0')}`;
    const kand = bygg(r, mall, v, { id, pos: Math.floor(r() * 6) });
    if (kand && ledig(kand)) ny = kand;
  }
  if (!ny) throw new Error(`${n.variant}: ingen ny fråga`);
  nummer[`${kod}-${fam}`] = (nummer[`${kod}-${fam}`] ?? 0) + 1;
  ut[mall.niva].push(ny);
  lista.nya.push({ id: ny.id, ...(n.ersatter ? { ersatter: n.ersatter } : {}) });
  minns(ny);
}

for (const [niva, fragor] of Object.entries(ut)) {
  writeFileSync(`${UT}/${niva}.json`, JSON.stringify(fragor, null, 1) + '\n');
  console.log(`${UT}/${niva}.json: ${fragor.length} frågor`);
}
mkdirSync('docs/qa/figurserier/omgang3', { recursive: true });
writeFileSync('docs/qa/figurserier/omgang3/lista.json', JSON.stringify(lista, null, 1) + '\n');
console.log(`ändrade ${lista.andrade.length}, nya ${lista.nya.length}: ${lista.nya.map((x) => x.id).join(', ')}`);
