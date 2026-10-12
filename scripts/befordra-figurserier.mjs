#!/usr/bin/env node
// scripts/befordra-figurserier.mjs
// =============================================================================
// Befordrar figurseriernas granskade kandidater till den skarpa banken
// (src/lib/figurserierV1/bank{Grund,Avancerad,Expert}.json) och sätter
// BANK_BEFORDRAD i src/lib/figurserierV1/status.ts.
//
//   node scripts/befordra-figurserier.mjs --beslut=beslut-01.json --beslut=beslut-02.json ...
//       Skarpt: besluten läses i ordning och det senaste beslutet per id gäller
//       (godkanda ja; andra och strukna nej). Bara id som slutar på ja. Felar om en nivå hamnar under
//       golvet (beslutets golv_per_niva, annars 28) eller om kedjan inte är grön.
//   node scripts/befordra-figurserier.mjs --lokalt
//       Bara för klicktest: alla kandidater i bankfilerna, BANK_BEFORDRAD
//       orörd (kortet syns med NEXT_PUBLIC_FIGURSERIER_QA=1). Återställ med
//       git checkout src/lib/figurserierV1/bank*.json efteråt; committas aldrig.
// =============================================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const K = 'src/lib/figurserierV1/kandidater';
const BANK = { grund: 'bankGrund', avancerad: 'bankAvancerad', expert: 'bankExpert' };
const lokalt = process.argv.includes('--lokalt');
const beslutFiler = process.argv.filter((a) => a.startsWith('--beslut=')).map((a) => a.slice('--beslut='.length));
if (!lokalt && !beslutFiler.length) throw new Error('Ange --beslut=<fil> (en eller flera) eller --lokalt');
const status = new Map();
let golv = 28;
for (const f of beslutFiler) {
  const b = JSON.parse(readFileSync(f, 'utf8'));
  for (const id of b.godkanda ?? []) status.set(id, true);
  for (const x of [...(b.andra ?? []), ...(b.strukna ?? [])]) status.set(typeof x === 'string' ? x : x.id, false);
  if (b.golv_per_niva) golv = b.golv_per_niva;
}
const ja = beslutFiler.length ? new Set([...status].filter(([, v]) => v).map(([id]) => id)) : null;

for (const [niva, fil] of Object.entries(BANK)) {
  const alla = JSON.parse(readFileSync(`${K}/${niva}.json`, 'utf8'));
  const ut = ja ? alla.filter((q) => ja.has(q.id)) : alla;
  if (!lokalt && ut.length < golv) throw new Error(`${niva}: ${ut.length} godkända, golvet är ${golv}`);
  writeFileSync(`src/lib/figurserierV1/${fil}.json`, JSON.stringify(ut, null, 1) + '\n');
  console.log(`${fil}.json: ${ut.length} frågor${lokalt ? ' (lokalt, committas inte)' : ''}`);
}

if (!lokalt) {
  const filer = Object.values(BANK).map((f) => `src/lib/figurserierV1/${f}.json`);
  for (const [skript, ...arg] of [
    ['scripts/validate-figurserier.mjs', ...filer],
    ['scripts/v7-facit-check.mjs', '--serie', ...filer],
    ['scripts/v7-distraktor-check.mjs', '--serie', ...filer],
    ['scripts/v7-geometri-check.mjs', '--serie', ...filer],
  ]) execFileSync(process.execPath, [skript, ...arg], { stdio: 'inherit' });
  const p = 'src/lib/figurserierV1/status.ts';
  writeFileSync(p, readFileSync(p, 'utf8').replace('export const BANK_BEFORDRAD = false;', 'export const BANK_BEFORDRAD = true;'));
  console.log('BANK_BEFORDRAD = true');
}
