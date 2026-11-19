#!/usr/bin/env node
// scripts/befordra-figurserier-parti5.mjs
// =============================================================================
// Befordrar parti 5 (frågebanken 2026-11-19, omgång 3) till egna bankfiler:
//
//   kandidater/parti5-{grund,avancerad,expert}.json -> bankParti5{Grund,Avancerad,Expert}.json
//
// Bara de 92 id som testansvarig godkände (docs/fragebank/figurserier-2026-11-19-
// omg3-granskning.md). fs-e-flera-19, fs-a-flera-35 och fs-g-vrid-42 är
// strukna och ersätts inte. Skriver aldrig bankGrund/Avancerad/Expert.json eller
// något annat partis filer; det gör scripts/befordra-figurserier.mjs, som därför
// inte används här. Kör sedan verifieraren.
//
// Kör: node scripts/befordra-figurserier-parti5.mjs
// =============================================================================

import { readFileSync, writeFileSync } from 'node:fs';

const K = 'src/lib/figurserierV1/kandidater';
const B = 'src/lib/figurserierV1';

const GODKANDA = new Set([
  'fs-g-vrid-35', 'fs-g-vand-36', 'fs-g-vand-37', 'fs-g-vand-38', 'fs-g-vrid-36', 'fs-g-vrid-37',
  'fs-g-vand-39', 'fs-g-vrid-38', 'fs-g-vrid-39', 'fs-g-vrid-40', 'fs-g-vrid-41', 'fs-g-antal-20',
  'fs-a-vaxl-42', 'fs-a-vaxl-43', 'fs-a-vaxl-44', 'fs-a-vaxl-45', 'fs-a-vaxl-46', 'fs-a-vaxl-47',
  'fs-a-vaxl-48', 'fs-a-vaxl-49', 'fs-a-vaxl-50', 'fs-a-vrid-19', 'fs-a-flera-27', 'fs-a-vrid-20',
  'fs-a-flera-28', 'fs-a-flera-29', 'fs-a-vrid-21', 'fs-a-flera-30', 'fs-a-vrid-22', 'fs-a-flera-31',
  'fs-a-flera-32', 'fs-a-vrid-23', 'fs-a-vrid-24', 'fs-a-flera-33', 'fs-a-flera-34', 'fs-a-vrid-25',
  'fs-a-vrid-26', 'fs-a-vrid-27', 'fs-a-flera-36', 'fs-a-vrid-28', 'fs-a-vrid-29', 'fs-a-vrid-30',
  'fs-a-vrid-31', 'fs-a-vrid-32', 'fs-a-vrid-33', 'fs-a-vrid-34', 'fs-e-vaxl-32', 'fs-e-antal-20',
  'fs-e-vaxl-33', 'fs-e-vaxl-34', 'fs-e-vaxl-35', 'fs-e-vaxl-36', 'fs-e-vaxl-37', 'fs-e-vaxl-38',
  'fs-e-vaxl-39', 'fs-e-vaxl-40', 'fs-e-vaxl-41', 'fs-e-vaxl-42', 'fs-e-vax-15', 'fs-e-flera-14',
  'fs-e-vax-16', 'fs-e-flera-15', 'fs-e-vax-17', 'fs-e-flera-16', 'fs-e-vax-18', 'fs-e-flera-17',
  'fs-e-vax-19', 'fs-e-flera-18', 'fs-e-vax-20', 'fs-e-vaxl-43', 'fs-e-vax-21', 'fs-e-vaxl-44',
  'fs-e-flera-20', 'fs-e-vax-22', 'fs-e-vaxl-45', 'fs-e-flera-21', 'fs-e-vax-23', 'fs-e-vaxl-46',
  'fs-e-flera-22', 'fs-e-vax-24', 'fs-e-vaxl-47', 'fs-e-flera-23', 'fs-e-vax-25', 'fs-e-vaxl-48',
  'fs-e-flera-24', 'fs-e-vax-26', 'fs-e-vaxl-49', 'fs-e-flera-25', 'fs-e-vax-27', 'fs-e-vaxl-50',
  'fs-e-flera-26', 'fs-e-vax-28',
]);
const STRUKNA = new Set(['fs-e-flera-19', 'fs-a-flera-35', 'fs-g-vrid-42']);
const VANTADE = { grund: 12, avancerad: 34, expert: 46 };

let n = 0;
for (const [niva, bank] of [['grund', 'bankParti5Grund'], ['avancerad', 'bankParti5Avancerad'], ['expert', 'bankParti5Expert']]) {
  const alla = JSON.parse(readFileSync(`${K}/parti5-${niva}.json`, 'utf8'));
  const over = alla.filter((q) => !GODKANDA.has(q.id) && !STRUKNA.has(q.id)).map((q) => q.id);
  if (over.length) throw new Error(`${niva}: ogranskade id i kandidatfilen: ${over.join(', ')}`);
  const ut = alla.filter((q) => GODKANDA.has(q.id));
  if (ut.some((q) => q.fran_version !== 5)) throw new Error(`${niva}: fran_version ska vara 5`);
  if (ut.length !== VANTADE[niva]) throw new Error(`${niva}: ${ut.length} godkända, väntade ${VANTADE[niva]}`);
  writeFileSync(`${B}/${bank}.json`, JSON.stringify(ut, null, 1) + '\n');
  console.log(`${bank}.json: ${ut.length} frågor`);
  n += ut.length;
}
if (n !== GODKANDA.size) throw new Error(`${n} befordrade, väntade ${GODKANDA.size}`);
