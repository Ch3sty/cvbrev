#!/usr/bin/env node
// scripts/befordra-figurserier-omgang3.mjs
// =============================================================================
// Befordrar omgång 3:s granskade kandidater (docs/qa/omgang3-e/beslut.json) till
// bankerna som bara figurpasset och övningsprovet läser:
//
//   kandidater/bryter-{grund,avancerad}.json  -> bankBryter{Grund,Avancerad}.json
//   kandidater/parti2-{grund,avancerad}.json  -> bankParti2{Grund,Avancerad}.json
//
// Bara id i godkanda i beslut.json och beslut-tillagg.json (granskning avsnitt
// 9: textbytet i B1 block och de fyra ersättarna). Textvillkoren i tillägget
// är redan inkörda i kandidatfilerna.
// Felar under golvet (12 bryter per nivå) och om kedjan inte är grön.
// De klassiska nivåtestens banker (serie_version 1) rörs inte.
//
// Kör: node scripts/befordra-figurserier-omgang3.mjs
// =============================================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const K = 'src/lib/figurserierV1/kandidater';
const B = 'src/lib/figurserierV1';
const beslut = JSON.parse(readFileSync('docs/qa/omgang3-e/beslut.json', 'utf8'));
const tillagg = JSON.parse(readFileSync('docs/qa/omgang3-e/beslut-tillagg.json', 'utf8'));
const ja = new Set([...beslut.godkanda, ...tillagg.godkanda]);
const GOLV_BRYTER = 12;

const par = [
  ['bryter-grund', 'bankBryterGrund', true],
  ['bryter-avancerad', 'bankBryterAvancerad', true],
  ['parti2-grund', 'bankParti2Grund', false],
  ['parti2-avancerad', 'bankParti2Avancerad', false],
];
for (const [kand, bank, bryter] of par) {
  const ut = JSON.parse(readFileSync(`${K}/${kand}.json`, 'utf8')).filter((q) => ja.has(q.id));
  if (bryter && ut.length < GOLV_BRYTER) throw new Error(`${kand}: ${ut.length} godkända, golvet är ${GOLV_BRYTER}`);
  writeFileSync(`${B}/${bank}.json`, JSON.stringify(ut, null, 1) + '\n');
  console.log(`${bank}.json: ${ut.length} frågor`);
}

const bryter = [`${B}/bankBryterGrund.json`, `${B}/bankBryterAvancerad.json`];
const parti2 = [`${B}/bankParti2Grund.json`, `${B}/bankParti2Avancerad.json`];
for (const [skript, ...arg] of [
  ['scripts/v7-facit-check.mjs', '--bryter', ...bryter],
  ['scripts/v7-geometri-check.mjs', '--bryter', ...bryter],
  ['scripts/validate-figurserier.mjs', ...parti2],
  ['scripts/v7-facit-check.mjs', '--serie', ...parti2],
  ['scripts/v7-distraktor-check.mjs', '--serie', ...parti2],
  ['scripts/v7-geometri-check.mjs', '--serie', ...parti2],
]) execFileSync(process.execPath, [skript, ...arg], { stdio: 'inherit' });
