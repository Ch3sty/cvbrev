// scripts/gen-bank-v3.mjs
// =============================================================================
// Genererar kandidaterna för bank_version 3 (plan-facit-genvag A3, tillägget
// om variation 1.2, granskningarna av omgång 1) till
// src/lib/logicTestV7/kandidater/:
//
//   grund-v3-parti-01.v7.json        recept-v3.mjs, GRUND_V3
//   avancerad-v3-parti-01.v7.json    AVANCERAD_V3
//   expert-v3-parti-01.v7.json       EXPERT_V3
//   expert-plus-parti-03.v7.json     recept-plus.mjs, PLUS_03_FRAN (P1', P2
//                                    och P3 på parti 02:s rutnät)
//
// Kör: node scripts/gen-bank-v3.mjs [grund|avancerad|expert|plus]
//
// Lås: en fråga som en beslutsfil (docs/qa/bank-v3/beslut-*.json) har
// godkänt behålls exakt som den är i utfilen; alla andra recept byggs. Strukna frågor försvinner ur filen, och deras
// rutnät får återanvändas (recept.seed). Varje ny fråga byggs med byggV3:
// spärrarna S1 till S13 och spärren mot delade rader körs på varje försök.
// Efter körningen räknas S8, S10 och de delade raderna över varje recept.
// Frågor som ingen beslutsfil godkänt listas i docs/qa/bank-v3/nya.json
// för granskningssidan.
//
// Deterministiskt: samma recept och samma beslutsfiler ger samma filer.
// =============================================================================

import { writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { byggV3, key } from './lib/matris/generera.mjs';
import { V3_KANDIDATER, STRUKNA, GODKANDA } from './lib/matris/recept-v3.mjs';
import { PLUS_03_FRAN, UT_03, STRUKTUR_UNDANTAG_03 } from './lib/matris/recept-plus.mjs';
import { strukturFelV3, utseendeFel, utseendeNyckel } from './lib/matris/sparrar.mjs';
import { ALLA_BANKFILER, las } from './lib/matris/version.mjs';

const K = 'src/lib/logicTestV7/kandidater';
const vald = process.argv[2] ?? null;
const korningar = [
  ...Object.entries(V3_KANDIDATER).map(([niva, { recept, ut }]) => ({ namn: niva, recept, ut })),
  { namn: 'plus', recept: PLUS_03_FRAN(), ut: UT_03, mjuk: true, undantag: STRUKTUR_UNDANTAG_03 },
].filter((k) => !vald || k.namn === vald);

const NYA = 'docs/qa/bank-v3/nya.json';
const nya = existsSync(NYA) ? las(NYA) : {};

let fel = 0;
for (const k of korningar) {
  const start = Date.now();
  // Upptagna rutnät: alla banker och kandidatfiler utom strukna frågor och utfilen.
  const upptagna = new Set();
  const filer = [...ALLA_BANKFILER, ...(existsSync(K) ? readdirSync(K).filter((f) => f.endsWith('.json')).map((f) => path.posix.join(K, f)) : [])];
  for (const f of filer) {
    if (path.resolve(f) === path.resolve(k.ut)) continue;
    for (const q of las(f)) if (!STRUKNA.has(q.id)) upptagna.add(key(q.grid));
  }
  // Bara godkända frågor är låsta; allt annat byggs om (deterministiskt).
  const tidigare = new Map(las(k.ut).filter((q) => GODKANDA.has(q.id)).map((q) => [q.id, q]));
  const utseenden = new Map();
  const kvar = new Map();
  const receptFor = (q) => q.recept ?? q.mekanism ?? q.family;
  for (const q of tidigare.values()) {
    upptagna.add(key(q.grid));
    if (!utseenden.has(receptFor(q))) utseenden.set(receptFor(q), new Set());
    utseenden.get(receptFor(q)).add(utseendeNyckel(q));
    if (!kvar.has(receptFor(q))) kvar.set(receptFor(q), []);
    kvar.get(receptFor(q)).push(q);
  }
  const mjuka = k.mjuk ? new Set() : null;
  const ut = [];
  const byggda = [];
  const problem = [];
  for (const rc of k.recept) {
    if (tidigare.has(rc.id)) { ut.push(tidigare.get(rc.id)); continue; }
    try { const q = byggV3(rc, upptagna, { utseenden, mjuka, kvar }); ut.push(q); byggda.push(q); }
    catch (e) { problem.push(e.message); }
  }
  for (const [id] of tidigare) if (!k.recept.some((r) => r.id === id)) problem.push(`${id}: finns i filen men inte bland recepten`);
  const batch = [...strukturFelV3(ut, k.undantag ?? {}), ...utseendeFel(ut, { godkanda: GODKANDA })];
  mkdirSync(path.dirname(k.ut), { recursive: true });
  writeFileSync(k.ut, JSON.stringify(ut, null, 2) + '\n');
  // Nya för granskning: allt i filen som ingen beslutsfil har godkänt.
  nya[k.ut] = ut.filter((q) => !GODKANDA.has(q.id)).map((q) => q.id);
  const perRecept = {};
  byggda.forEach((q) => { perRecept[q.recept] = (perRecept[q.recept] ?? 0) + 1; });
  console.log(`${problem.length || batch.length ? '✗' : '✓'} ${k.namn}: ${ut.length} frågor i ${k.ut} (${tidigare.size} låsta, ${byggda.length} nya) på ${((Date.now() - start) / 1000).toFixed(1)} s`);
  if (byggda.length) console.log('  nya per recept: ' + Object.entries(perRecept).map(([r, n]) => `${r} ${n}`).join(', '));
  if (problem.length) { console.log(`  ${problem.length} recept gick inte att bygga:`); problem.forEach((x) => console.log('  - ' + x.replace(/\n/g, '\n    '))); }
  if (batch.length) { console.log('  S8, S10 och delade rader:'); batch.forEach((x) => console.log('  - ' + x)); }
  fel += problem.length + batch.length;
}
mkdirSync(path.dirname(NYA), { recursive: true });
writeFileSync(NYA, JSON.stringify(nya, null, 2) + '\n');
process.exit(fel ? 1 : 0);
