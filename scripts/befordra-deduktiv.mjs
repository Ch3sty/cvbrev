#!/usr/bin/env node
// scripts/befordra-deduktiv.mjs
// =============================================================================
// Befordrar deduktivens granskade kandidater till den skarpa banken
// (src/lib/deduktivV1/bank{Grund,Avancerad,Expert}.json) och sätter
// BANK_BEFORDRAD i src/lib/deduktivV1/status.ts.
//
//   node scripts/befordra-deduktiv.mjs --beslut=docs/qa/deduktiv/beslut-01.json ...
//       Skarpt: besluten läses i ordning och det senaste beslutet per id gäller
//       (godkanda ja; andra och strukna nej). Bara id som slutar på ja. Felar
//       om en nivå hamnar under golvet (beslutets golv_per_niva, annars 20)
//       eller om validate-deduktiv inte är grön.
//   node scripts/befordra-deduktiv.mjs --lokalt
//       Bara för klicktest: alla kandidater i bankfilerna, BANK_BEFORDRAD
//       orörd (kortet syns med NEXT_PUBLIC_DEDUKTIV_QA=1). Återställ med
//       git checkout src/lib/deduktivV1/bank*.json efteråt; committas aldrig.
// =============================================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const K = 'src/lib/deduktivV1/kandidater';
const BANK = { grund: 'bankGrund', avancerad: 'bankAvancerad', expert: 'bankExpert' };
const lokalt = process.argv.includes('--lokalt');
const beslutFiler = process.argv.filter((a) => a.startsWith('--beslut=')).map((a) => a.slice('--beslut='.length));
if (!lokalt && !beslutFiler.length) throw new Error('Ange --beslut=<fil> (en eller flera) eller --lokalt');
const status = new Map();
let golv = 20;
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
  writeFileSync(`src/lib/deduktivV1/${fil}.json`, JSON.stringify(ut, null, 1) + '\n');
  console.log(`${fil}.json: ${ut.length} uppgifter${lokalt ? ' (lokalt, committas inte)' : ''}`);
}

if (!lokalt) {
  const filer = Object.values(BANK).map((f) => `src/lib/deduktivV1/${f}.json`);
  execFileSync(process.execPath, ['scripts/validate-deduktiv.mjs', ...filer], { stdio: 'inherit' });
  const s = 'src/lib/deduktivV1/status.ts';
  writeFileSync(s, readFileSync(s, 'utf8').replace('export const BANK_BEFORDRAD = false;', 'export const BANK_BEFORDRAD = true;'));
  console.log('BANK_BEFORDRAD = true');
}
