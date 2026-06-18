// Parallellitets-detektor för V7-frågor.
// =============================================================================
// Fångar den subtila trivialiteten: en fråga där varje rad är "samma sekvens"
// (kolumnmönstret identiskt på alla rader), så att tomrummet kan läsas av enbart
// från sin egen rad + kolumn utan att de andra raderna tillför något.
//
// Princip: för varje attribut som förekommer i cellerna, bygg en 3×3-matris av
// dess värden. En fråga UNDERKÄNNS som "parallell" om, för MINST ett varierande
// attribut, alla tre raderna har EXAKT samma värdesekvens — ELLER alla tre
// kolumnerna har exakt samma värdesekvens. Då löper regeln parallellt utan
// koppling mellan rader/kolumner.
//
// Latin squares passerar (rad-sekvenserna är permutationer, inte identiska).
// Diagonaler passerar. Genuint kopplade regler passerar.
//
// Kör: node scripts/v7-parallel-check.mjs <fil.json>

import { readFileSync } from 'node:fs';

const path = process.argv[2];
const bank = JSON.parse(readFileSync(path, 'utf8'));

// Plocka ut ett jämförbart värde för ett attribut ur en (ev. lager-)cell.
const attrVal = (cell, key) => {
  if (cell === null) return '∅';
  const prims = Array.isArray(cell) ? cell : [cell];
  // slå ihop attributet över alla lager (oftast bara ett)
  const vals = prims
    .map((p) => (key in p ? (Array.isArray(p[key]) ? p[key].join('+') : String(p[key])) : null))
    .filter((v) => v !== null);
  return vals.length ? vals.join(',') : '·';
};

const allAttrs = (cell) => {
  if (cell === null) return [];
  const prims = Array.isArray(cell) ? cell : [cell];
  return [...new Set(prims.flatMap((p) => Object.keys(p)))];
};

const issues = [];

for (const q of bank) {
  if (typeof q.correctAnswer !== 'number') continue;
  const g = q.grid.map((r) => r.slice());
  g[2][2] = q.options[q.correctAnswer]; // facit isatt
  const isSym = /spegl|schack|symmetr|180|motsatt|diagonal/i.test(q.rule);
  if (isSym) continue; // symmetri/diagonal är avsiktligt strukturerade

  // samla alla attribut som förekommer
  const attrs = new Set();
  g.flat().forEach((c) => allAttrs(c).forEach((a) => attrs.add(a)));
  attrs.delete('kind'); // kind ensamt räknas inte som varierande regel

  for (const a of attrs) {
    const M = g.map((row) => row.map((c) => attrVal(c, a)));
    const distinct = new Set(M.flat());
    if (distinct.size <= 1) continue; // varierar inte → ointressant

    // radsekvenser och kolumnsekvenser
    const rowSeqs = M.map((r) => r.join('>'));
    const colSeqs = [0, 1, 2].map((c) => M.map((r) => r[c]).join('>'));

    // alla rader identiska sekvens? → parallellt i radled
    if (new Set(rowSeqs).size === 1) {
      issues.push(`[${q.id}] attribut "${a}": alla rader har samma sekvens (${rowSeqs[0]}) → läses kolumnvis utan koppling`);
    }
    // alla kolumner identiska sekvens? → parallellt i kolumnled
    if (new Set(colSeqs).size === 1) {
      issues.push(`[${q.id}] attribut "${a}": alla kolumner har samma sekvens (${colSeqs[0]}) → läses radvis utan koppling`);
    }
  }
}

console.log(`\nParallellitetskontroll: ${bank.length} frågor i ${path}\n`);
if (issues.length === 0) {
  console.log('✓ Inga parallella frågor. Reglerna kopplar rader och kolumner.');
  process.exit(0);
} else {
  console.log(`✗ ${issues.length} parallella mönster (kan läsas utan att integrera hela matrisen):\n`);
  issues.forEach((i) => console.log('  - ' + i));
  process.exit(1);
}
