// scripts/gen-expert-plus.mjs
// =============================================================================
// Genererar parti 1 av bandet "svår plus" (40 matrisfrågor, 8 per mekanism)
// till kandidatfilen src/lib/logicTestV7/kandidater/expert-plus-parti-01.v7.json.
// Ingen fråga går in i någon skarp bank: testansvarig granskar kandidatfilen.
//
// Kör: node scripts/gen-expert-plus.mjs
//
// Deterministiskt: samma recept ger byte-identisk fil (seed per id och försök).
// Kör sedan valideringskedjan (se scripts/v7-distraktor-check.mjs).
// =============================================================================

import { genereraKandidater } from './lib/matris/kor-generator.mjs';
import { PLUS, UT, STRUKTUR_UNDANTAG } from './lib/matris/recept-plus.mjs';
import { strukturNyckel } from './lib/matris/generera.mjs';

const start = Date.now();
const res = genereraKandidater(PLUS, UT, { undantag: STRUKTUR_UNDANTAG });
if (!res) process.exit(1);
const per = {};
res.fragor.forEach((q) => { per[q.mekanism] = (per[q.mekanism] ?? 0) + 1; });
console.log(`✓ skrev ${res.fragor.length} frågor till ${UT} på ${((Date.now() - start) / 1000).toFixed(1)} s`);
console.log('  per mekanism: ' + Object.entries(per).map(([m, n]) => `${m} ${n}`).join(', '));
const struktur = {};
res.fragor.filter((q) => q.family === 'latin-flera').forEach((q) => { (struktur[q.mekanism] ??= new Set()).add(strukturNyckel(q)); });
console.log('  olika latinska mönster per mekanism, upp till omdöpning av värdena (ordning 3 har bara två; minst två krävs per mekanism): ' + Object.entries(struktur).map(([m, s]) => `${m} ${s.size}${STRUKTUR_UNDANTAG[m] ? ` (undantag: ${STRUKTUR_UNDANTAG[m]})` : ''}`).join(', '));
console.log('  försök per fråga: ' + res.fragor.map((q) => `${q.id.replace('v7e-plus-', '')} ${res.forsok[q.id] + 1}`).join(', '));
