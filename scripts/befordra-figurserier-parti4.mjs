#!/usr/bin/env node
// scripts/befordra-figurserier-parti4.mjs
// =============================================================================
// Befordrar parti 4 (frågebanken 2026-11-19, omgång 2) till egna bankfiler:
//
//   kandidater/parti4-{grund,avancerad,expert}.json -> bankParti4{Grund,Avancerad,Expert}.json
//
// Bara id som testansvarig godkände (docs/fragebank/figurserier-2026-11-19-
// omg2-granskning.md, 77 efter regelnyckeln) och ersättarna som generatorn
// gjorde med --ersatt (scripts/gen-figurserier-parti4.mjs). Skriver aldrig
// bankGrund/Avancerad/Expert.json eller något annat partis filer; det gör
// scripts/befordra-figurserier.mjs, som därför inte används här (den skulle
// radera version 1). Kör sedan verifieraren.
//
// Kör: node scripts/befordra-figurserier-parti4.mjs
// =============================================================================

import { readFileSync, writeFileSync } from 'node:fs';

const K = 'src/lib/figurserierV1/kandidater';
const B = 'src/lib/figurserierV1';

const GODKANDA = new Set([
  'fs-g-vand-21', 'fs-g-vand-22', 'fs-g-vrid-27', 'fs-g-vrid-29', 'fs-g-vrid-30', 'fs-g-vand-25',
  'fs-g-vand-26', 'fs-g-vrid-31', 'fs-g-vand-27', 'fs-g-vrid-33', 'fs-g-vrid-34', 'fs-g-vand-29',
  'fs-g-vand-30', 'fs-g-antal-18', 'fs-g-antal-19', 'fs-g-vax-23', 'fs-g-vax-24', 'fs-g-vax-25',
  'fs-g-vax-27', 'fs-g-vax-28', 'fs-g-vax-29', 'fs-g-vax-30', 'fs-g-vax-31', 'fs-g-vax-34',
  'fs-g-vax-35', 'fs-a-antal-18', 'fs-a-flera-14', 'fs-a-flera-15', 'fs-a-fyll-06', 'fs-a-vrid-12',
  'fs-a-fyll-07', 'fs-a-flera-16', 'fs-a-vax-07', 'fs-a-vax-08', 'fs-a-antal-20', 'fs-a-flera-18',
  'fs-a-flera-19', 'fs-a-fyll-08', 'fs-a-vrid-14', 'fs-a-vand-07', 'fs-a-fyll-09', 'fs-a-flera-20',
  'fs-a-flera-21', 'fs-a-flera-22', 'fs-a-flera-23', 'fs-a-flera-24', 'fs-a-flera-25', 'fs-a-vaxl-31',
  'fs-a-vaxl-32', 'fs-a-vaxl-33', 'fs-a-vaxl-34', 'fs-a-vaxl-35', 'fs-a-vaxl-36', 'fs-a-vaxl-37',
  'fs-a-vaxl-38', 'fs-a-vaxl-39', 'fs-a-vaxl-40', 'fs-a-vaxl-41', 'fs-e-antal-15', 'fs-e-antal-16',
  'fs-e-vaxl-27', 'fs-e-vaxl-28', 'fs-e-antal-17', 'fs-e-antal-18', 'fs-e-vaxl-29', 'fs-e-vaxl-30',
  'fs-e-antal-19', 'fs-e-vaxl-31', 'fs-e-flera-07', 'fs-e-flera-08', 'fs-e-vax-04', 'fs-e-vax-05',
  'fs-e-flera-09', 'fs-e-flera-10', 'fs-e-vax-08', 'fs-e-vax-09', 'fs-e-flera-11',
]);
const ERSATTARE = new Set([
  'fs-g-vand-31', 'fs-g-vand-32', 'fs-g-vand-33', 'fs-g-vand-34', 'fs-g-vand-35',
  'fs-g-vax-36', 'fs-g-vax-37', 'fs-g-vax-38',
  'fs-a-flera-26', 'fs-a-vrid-16', 'fs-a-vrid-17', 'fs-a-fyll-11', 'fs-a-vax-12', 'fs-a-antal-21', 'fs-a-vrid-18', 'fs-a-antal-22',
  'fs-e-vax-12', 'fs-e-flera-12', 'fs-e-vax-13', 'fs-e-flera-13', 'fs-e-vax-14',
]);

let n = 0;
for (const [kand, bank] of [['parti4-grund', 'bankParti4Grund'], ['parti4-avancerad', 'bankParti4Avancerad'], ['parti4-expert', 'bankParti4Expert']]) {
  const alla = JSON.parse(readFileSync(`${K}/${kand}.json`, 'utf8'));
  const ut = alla.filter((q) => GODKANDA.has(q.id) || ERSATTARE.has(q.id));
  const over = alla.filter((q) => !GODKANDA.has(q.id) && !ERSATTARE.has(q.id)).map((q) => q.id);
  if (over.length) throw new Error(`${kand}: ogranskade id i kandidatfilen: ${over.join(', ')}`);
  if (ut.some((q) => q.fran_version !== 4)) throw new Error(`${kand}: fran_version ska vara 4`);
  writeFileSync(`${B}/${bank}.json`, JSON.stringify(ut, null, 1) + '\n');
  console.log(`${bank}.json: ${ut.length} frågor`);
  n += ut.length;
}
if (n !== GODKANDA.size + ERSATTARE.size) throw new Error(`${n} befordrade, väntade ${GODKANDA.size + ERSATTARE.size}`);
