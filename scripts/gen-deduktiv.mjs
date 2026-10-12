#!/usr/bin/env node
// scripts/gen-deduktiv.mjs
// =============================================================================
// Deduktiv slutledning (beställningen omgång 3, B1): kandidaterna.
//   grund      24 D1 (handskrivna, d1.mjs) och 6 D2 (fyra element, tre villkor)
//   avancerad  30 D2 (fem eller sex element, fyra till fem villkor)
//   expert     24 D3 (fem eller sex element, fem till sex villkor och ett antagande)
// Deterministiskt: samma seed ger byte-identiska filer. Inget hamnar i den
// skarpa banken härifrån; befordran sker efter testansvarigs granskning
// (scripts/befordra-deduktiv.mjs).
//
// Kör: node scripts/gen-deduktiv.mjs
// Skriver: src/lib/deduktivV1/kandidater/{grund,avancerad,expert}.json
// Kedjan efter: node scripts/validate-deduktiv.mjs
// =============================================================================

import { writeFileSync, mkdirSync } from 'node:fs';
import { D1 } from './lib/deduktiv/d1.mjs';
import { byggD1, forsokSchema, strukturNyckel, NIVA_KOD } from './lib/deduktiv/generera.mjs';
import { mulberry32, hashString } from './lib/serie/slump.mjs';

const UT = 'src/lib/deduktivV1/kandidater';
const SEED = 'deduktiv-v1';
const start = Date.now();
mkdirSync(UT, { recursive: true });

const PLAN = {
  grund: [{ typ: 'D2', antal: 6, teman: ['personer', 'saker'], n: [4], vmin: 3, vmax: 3, former: ['maste'], platsTak: 1 }],
  avancerad: [
    { typ: 'D2', antal: 30, teman: ['personer', 'saker', 'personer', 'turordning', 'saker'], n: [5], vmin: 4, vmax: 5, former: ['vem', 'maste'], platsTak: 1 },
  ],
  expert: [{ typ: 'D3', antal: 24, teman: ['personer', 'turordning', 'saker'], n: [5, 6], vmin: 5, vmax: 6, former: ['omojlig'], platsTak: 1 }],
};

const ut = { grund: [], avancerad: [], expert: [] };
const nycklar = new Set();

// D1: facit jämnt över A till D.
const r1 = mulberry32(hashString(`${SEED}:D1`));
D1.forEach((u, i) => {
  ut.grund.push(byggD1(u, `dd-g-d1-${String(i + 1).padStart(2, '0')}`, i % 4, r1));
});

for (const [niva, delar] of Object.entries(PLAN)) {
  for (const del of delar) {
    const r = mulberry32(hashString(`${SEED}:${niva}:${del.typ}`));
    let nr = 0;
    let forsok = 0;
    while (nr < del.antal) {
      if (++forsok > 400000) throw new Error(`${niva} ${del.typ}: bara ${nr} av ${del.antal}`);
      const tema = del.teman[nr % del.teman.length];
      const n = tema === 'turordning' ? 6 : del.n[nr % del.n.length];
      const form = del.former[nr % del.former.length];
      const id = `dd-${NIVA_KOD[niva]}-${del.typ.toLowerCase()}-${String(nr + 1).padStart(2, '0')}`;
      const q = forsokSchema(r, { typ: del.typ, niva, tema, n, vmin: del.vmin, vmax: del.vmax, form, platsTak: del.platsTak }, id, nr % 5);
      if (!q) continue;
      const k = strukturNyckel(q);
      if (nycklar.has(k)) continue;
      nycklar.add(k);
      ut[niva].push(q);
      nr++;
    }
    console.log(`${niva} ${del.typ}: ${nr} uppgifter på ${forsok} försök`);
  }
}

for (const [niva, lista] of Object.entries(ut)) writeFileSync(`${UT}/${niva}.json`, JSON.stringify(lista, null, 1) + '\n');
console.log(`Klart på ${((Date.now() - start) / 1000).toFixed(1)} s`);
