// Semantisk kontroll: för de frågor vars regel går att lösa programmatiskt,
// härled det korrekta svaret oberoende och jämför med det markerade correctAnswer.
// Detta fångar om fel alternativ råkat markeras som rätt.
//
// Kör: node scripts/semantic-check-matrix.mjs scripts/new-matrix-questions.json

import { readFileSync } from 'node:fs';

const path = process.argv[2] ?? 'scripts/new-matrix-questions.json';
const bank = JSON.parse(readFileSync(path, 'utf8'));

const sameCell = (a, b) => {
  const norm = (c) => JSON.stringify(Object.keys(c).sort().reduce((o, k) => {
    o[k] = Array.isArray(c[k]) ? [...c[k]].sort() : c[k];
    return o;
  }, {}));
  return norm(a) === norm(b);
};

const findOption = (q, predicate) => q.options.findIndex(predicate);
const issues = [];
let checked = 0;

for (const q of bank) {
  const missing = q.grid[2][1]; // cellen före tomrummet i sista raden
  const before = q.grid[2][0];
  let expected = null; // härlett facit-cell

  // --- Antal: summa (kol3 = kol1 + kol2) ---
  if (/summan av kolumn 1 och kolumn 2|summa av kolumn 1|summan av de två/.test(q.rule)) {
    expected = { kind: 'dots', count: before.count + missing.count };
  }
  // --- Antal: fördubblas (kol2 = 2*kol1, kol3 = kol2) ---
  else if (/fördubblas/.test(q.rule)) {
    expected = { kind: 'dots', count: missing.count }; // kol3 = kol2
  }
  // --- Antal: ökar/minskar med 1 ---
  else if (/minskar med 1 per kolumn/.test(q.rule)) {
    expected = { kind: 'dots', count: missing.count - 1 };
  }
  else if (/ökar med 1 per kolumn/.test(q.rule)) {
    expected = { kind: 'dots', count: missing.count + 1 };
  }
  // --- Linjer: union (kol3 = kol1 ∪ kol2) ---
  else if (/union|alla linjer från kolumn 1 och kolumn 2/.test(q.rule)) {
    expected = { kind: 'lines', segments: [...new Set([...before.segments, ...missing.segments])] };
  }

  if (expected) {
    checked++;
    const idx = findOption(q, (o) => sameCell(o, expected));
    if (idx === -1) {
      issues.push(`[${q.id}] härlett facit ${JSON.stringify(expected)} finns inte bland alternativen`);
    } else if (idx !== q.correctAnswer) {
      issues.push(`[${q.id}] correctAnswer=${q.correctAnswer} men härlett facit är option#${idx}`);
    }
  }
}

console.log(`\nSemantisk kontroll: ${checked} av ${bank.length} frågor kunde lösas programmatiskt.\n`);
if (issues.length === 0) {
  console.log(`✓ Alla ${checked} maskinlösbara frågor har korrekt markerat svar.`);
  console.log(`  (Resterande ${bank.length - checked} bygger på rotation/latin-square/komposit och granskas visuellt.)`);
} else {
  console.log(`✗ ${issues.length} avvikelser:\n`);
  issues.forEach((i) => console.log('  - ' + i));
  process.exit(1);
}
