// scripts/gen-bank-v3.mjs
// =============================================================================
// Genererar kandidaterna för bank_version 3 (plan-facit-genvag A3, tillägget
// om variation 1.2) till src/lib/logicTestV7/kandidater/:
//
//   grund-v3-parti-01.v7.json        88 frågor (recept-v3.mjs, GRUND_V3)
//   avancerad-v3-parti-01.v7.json    68 frågor (AVANCERAD_V3)
//   expert-v3-parti-01.v7.json       24 frågor (EXPERT_V3: P6, P8, en
//                                    överlagring och en spegling)
//   expert-plus-parti-02.v7.json     24 frågor (recept-plus.mjs, PLUS_02:
//                                    P1', P2 och P3 omkörda med spärrarna)
//
// Kör: node scripts/gen-bank-v3.mjs [grund|avancerad|expert|plus]
//
// Varje fråga byggs med byggV3 (generera.mjs): spärrarna S1 till S10 körs på
// varje försök och frågan får fran_version 3, recept och p_prior. Inget
// rutnät får finnas i någon bank eller någon annan kandidatfil. Efter
// körningen räknas S8 och S10 över varje recept. Ingen fråga går in i en
// skarp bank: testansvarig granskar kandidatfilerna (befordra-bank-v3.mjs).
//
// Deterministiskt: samma recept ger byte-identiska filer.
// =============================================================================

import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { byggV3, key } from './lib/matris/generera.mjs';
import { upptagnaRutnat } from './lib/matris/kor-generator.mjs';
import { V3_KANDIDATER } from './lib/matris/recept-v3.mjs';
import { PLUS_02, UT_02, STRUKTUR_UNDANTAG_02 } from './lib/matris/recept-plus.mjs';
import { strukturFelV3, utseendeFel } from './lib/matris/sparrar.mjs';
import { ALLA_BANKFILER, las } from './lib/matris/version.mjs';

const vald = process.argv[2] ?? null;
const korningar = [
  ...Object.entries(V3_KANDIDATER).map(([niva, { recept, ut }]) => ({ namn: niva, recept, ut })),
  { namn: 'plus', recept: PLUS_02, ut: UT_02, mjuk: true, undantag: STRUKTUR_UNDANTAG_02 },
].filter((k) => !vald || k.namn === vald);

let fel = 0;
for (const k of korningar) {
  const start = Date.now();
  const upptagna = upptagnaRutnat(k.ut);
  for (const f of ALLA_BANKFILER) for (const q of las(f)) upptagna.add(key(q.grid));
  const utseenden = new Map();
  const mjuka = k.mjuk ? new Set() : null;
  const ut = [];
  const problem = [];
  for (const rc of k.recept) {
    try { ut.push(byggV3(rc, upptagna, { utseenden, mjuka })); }
    catch (e) { problem.push(e.message); }
  }
  const batch = [...strukturFelV3(ut, k.undantag ?? {}), ...utseendeFel(ut)];
  mkdirSync(path.dirname(k.ut), { recursive: true });
  writeFileSync(k.ut, JSON.stringify(ut, null, 2) + '\n');
  const perRecept = {};
  ut.forEach((q) => { perRecept[q.recept] = (perRecept[q.recept] ?? 0) + 1; });
  console.log(`${problem.length || batch.length ? '✗' : '✓'} ${k.namn}: ${ut.length} av ${k.recept.length} frågor till ${k.ut} på ${((Date.now() - start) / 1000).toFixed(1)} s`);
  console.log('  per recept: ' + Object.entries(perRecept).map(([r, n]) => `${r} ${n}`).join(', '));
  console.log('  försök per fråga (median): ' + (ut.map((q) => q.forsok + 1).sort((a, b) => a - b)[Math.floor(ut.length / 2)] ?? '-'));
  if (problem.length) { console.log(`  ${problem.length} recept gick inte att bygga:`); problem.forEach((x) => console.log('  - ' + x.replace(/\n/g, '\n    '))); }
  if (batch.length) { console.log('  S8 och S10:'); batch.forEach((x) => console.log('  - ' + x)); }
  fel += problem.length + batch.length;
}
process.exit(fel ? 1 : 0);
