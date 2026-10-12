#!/usr/bin/env node
// scripts/gen-deduktiv.mjs
// =============================================================================
// Deduktiv slutledning (beställningen omgång 3, B1): kandidaterna.
//
// Två lager per uppgift:
//   pusslet       villkor, fråga, alternativ, facit, etiketter och formell form.
//                 Dras en gång ur generatorn (seed deduktiv-v1) och står sedan
//                 still: granskade uppgifter får aldrig byta innehåll under
//                 sitt id (granskning 01 V3).
//   lösningslagret lösningsgången, remsan, misstagen och familjen
//                 (losningslager i scripts/lib/deduktiv/generera.mjs). Byggs
//                 om ur den formella formen vid varje körning.
//
// Körningen:
//   1. D1 byggs ur de handskrivna (scripts/lib/deduktiv/d1.mjs).
//   2. D2 och D3 som redan finns i kandidatfilerna behåller pusslet; lagret
//      byggs om. Saknas kandidatfilerna dras de första partierna ur seeden
//      (grund 6 D2, avancerad 30 D2, expert 24 D3), som i parti 01.
//   3. Uppgifter som granskningen har strukit (strukna i docs/qa/deduktiv/
//      beslut-*.json) tas bort; deras id används aldrig igen.
//   4. Ersättare dras med egen seed tills nivån har sitt antal
//      (granskning 01 V5: grund D2 07 till 11, minst två steg, högst två
//      villkor per steg, ett plats-villkor som låser först).
// Deterministiskt: samma filer in ger byte-identiska filer ut.
//
// Kör: node scripts/gen-deduktiv.mjs
// Skriver: src/lib/deduktivV1/kandidater/{grund,avancerad,expert}.json
// Kedjan efter: node scripts/validate-deduktiv.mjs
// =============================================================================

import { writeFileSync, mkdirSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { D1 } from './lib/deduktiv/d1.mjs';
import { byggD1, forsokSchema, losningslager, strukturNyckel, NIVA_KOD } from './lib/deduktiv/generera.mjs';
import { mulberry32, hashString } from './lib/serie/slump.mjs';

const UT = 'src/lib/deduktivV1/kandidater';
const BESLUT = 'docs/qa/deduktiv';
const SEED = 'deduktiv-v1';
const start = Date.now();
mkdirSync(UT, { recursive: true });

/** Parti 01, ur seeden. Antal och regler som när kandidaterna drogs första gången. */
const PARTI_01 = {
  grund: [{ typ: 'D2', antal: 6, teman: ['personer', 'saker'], n: [4], vmin: 3, vmax: 3, former: ['maste'], platsTak: 1 }],
  avancerad: [
    { typ: 'D2', antal: 30, teman: ['personer', 'saker', 'personer', 'turordning', 'saker'], n: [5], vmin: 4, vmax: 5, former: ['vem', 'maste'], platsTak: 1 },
  ],
  expert: [{ typ: 'D3', antal: 24, teman: ['personer', 'turordning', 'saker'], n: [5, 6], vmin: 5, vmax: 6, former: ['omojlig'], platsTak: 1 }],
};

/** Ersättare efter granskning: nya id efter de befintliga, egen seed per beställning. */
const ERSATTARE = [
  {
    niva: 'grund',
    typ: 'D2',
    fran: 7,
    till: 11,
    seed: 'granskning-01-V5',
    spec: { teman: ['personer', 'saker'], n: [4], vmin: 3, vmax: 3, former: ['maste'], platsTak: 1, minSteg: 2, maxVillkorPerSteg: 2, platsForst: true },
  },
];

const id = (niva, typ, nr) => `dd-${NIVA_KOD[niva]}-${typ.toLowerCase()}-${String(nr).padStart(2, '0')}`;

// Strukna id ur alla beslutsfiler.
const strukna = new Set();
if (existsSync(BESLUT)) {
  for (const f of readdirSync(BESLUT).filter((x) => /^beslut-\d+\.json$/.test(x)).sort()) {
    const b = JSON.parse(readFileSync(`${BESLUT}/${f}`, 'utf8'));
    for (const x of b.strukna ?? []) strukna.add(typeof x === 'string' ? x : x.id);
  }
}

function dra(niva, del, r, nycklar, idFor, antal) {
  const ut = [];
  let forsok = 0;
  while (ut.length < antal) {
    if (++forsok > 400000) throw new Error(`${niva} ${del.typ}: bara ${ut.length} av ${antal}`);
    const nr = ut.length;
    const tema = del.teman[nr % del.teman.length];
    const n = tema === 'turordning' ? 6 : del.n[nr % del.n.length];
    const form = del.former[nr % del.former.length];
    const q = forsokSchema(r, { ...del, niva, tema, n, form }, idFor(nr), nr % 5);
    if (!q) continue;
    const k = strukturNyckel(q);
    if (nycklar.has(k)) continue;
    nycklar.add(k);
    ut.push(q);
  }
  console.log(`${niva} ${del.typ}: ${ut.length} nya på ${forsok} försök`);
  return ut;
}

const ut = { grund: [], avancerad: [], expert: [] };
const nycklar = new Set();

// 1. D1.
const r1 = mulberry32(hashString(`${SEED}:D1`));
D1.forEach((u, i) => ut.grund.push(byggD1(u, id('grund', 'D1', i + 1), i % 4, r1)));

// 2. D2 och D3: befintliga pussel med nytt lager, annars parti 01 ur seeden.
for (const [niva, delar] of Object.entries(PARTI_01)) {
  const fil = `${UT}/${niva}.json`;
  const befintliga = existsSync(fil) ? JSON.parse(readFileSync(fil, 'utf8')).filter((q) => q.typ !== 'D1') : null;
  if (befintliga && befintliga.length) {
    for (const q of befintliga) {
      const lager = losningslager(q.formell, q.typ);
      if (!lager) throw new Error(`${q.id}: lösningslagret gick inte att bygga`);
      const { family, misstag, losning } = lager;
      ut[niva].push({ ...q, family, misstag, losning });
      nycklar.add(strukturNyckel(q));
    }
    console.log(`${niva}: ${befintliga.length} befintliga pussel, lösningslagret ombyggt`);
    continue;
  }
  for (const del of delar) {
    const r = mulberry32(hashString(`${SEED}:${niva}:${del.typ}`));
    ut[niva].push(...dra(niva, del, r, nycklar, (nr) => id(niva, del.typ, nr + 1), del.antal));
  }
}

// 3. Strukna bort.
for (const niva of Object.keys(ut)) ut[niva] = ut[niva].filter((q) => !strukna.has(q.id));

// 4. Ersättare med nya id.
for (const e of ERSATTARE) {
  const finns = new Set(ut[e.niva].map((q) => q.id));
  const saknas = [];
  for (let nr = e.fran; nr <= e.till; nr++) if (!finns.has(id(e.niva, e.typ, nr)) && !strukna.has(id(e.niva, e.typ, nr))) saknas.push(nr);
  if (!saknas.length) continue;
  const r = mulberry32(hashString(`${SEED}:${e.niva}:${e.typ}:${e.seed}`));
  const nya = dra(e.niva, { typ: e.typ, ...e.spec }, r, nycklar, (nr) => id(e.niva, e.typ, saknas[nr]), saknas.length);
  ut[e.niva].push(...nya);
}

for (const [niva, lista] of Object.entries(ut)) {
  lista.sort((a, b) => a.id.localeCompare(b.id));
  writeFileSync(`${UT}/${niva}.json`, JSON.stringify(lista, null, 1) + '\n');
}
console.log(`Klart på ${((Date.now() - start) / 1000).toFixed(1)} s`);
