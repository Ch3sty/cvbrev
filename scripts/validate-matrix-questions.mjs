// Validering av matrislogik-frågor (v5).
// Mål: bevisa att varje fråga har EXAKT ett korrekt svarsalternativ enligt sin egen
// strukturella konsistens, samt att inga två svarsalternativ är identiska (annars
// finns två "rätta" eller en omöjlig distraktor-situation).
//
// Eftersom reglerna är fritext kan vi inte symboliskt bevisa varje regel. Däremot kan vi
// validera de hårda invarianterna som MÅSTE gälla för en välformad fråga:
//   1. Grid är 3x3, exakt en null (sista cellen).
//   2. options har exakt 6 element.
//   3. correctAnswer är ett giltigt index (0-5).
//   4. Det korrekta alternativet är INTE identiskt med någon distraktor
//      (då vore två svar lika korrekta).
//   5. Alla 6 alternativ är unika (inga dubletter).
//   6. Varje cell följer typschemat (giltiga kind/fält).
//   7. id:n är unika över hela banken.
//
// Kör: node scripts/validate-matrix-questions.mjs [sökväg-till-json]

import { readFileSync } from 'node:fs';

const path = process.argv[2] ?? 'src/lib/logicTestV5/questionBank.v5.json';
const bank = JSON.parse(readFileSync(path, 'utf8'));

const errors = [];
const seenIds = new Set();

function cellKey(cell) {
  // Kanonisk nyckel för en cell, oberoende av fältordning.
  if (cell === null) return 'null';
  const keys = Object.keys(cell).sort();
  return keys.map((k) => `${k}=${Array.isArray(cell[k]) ? [...cell[k]].sort().join('+') : cell[k]}`).join(',');
}

const VALID_KINDS = new Set(['dots', 'shape', 'arrow', 'lines', 'rotation', 'corner_dot', 'composite']);

function validateCell(cell, where) {
  if (cell === null) return;
  if (!cell.kind || !VALID_KINDS.has(cell.kind)) {
    errors.push(`${where}: ogiltig cell-kind "${cell.kind}"`);
  }
}

bank.forEach((q, qi) => {
  const tag = `[${q.id ?? 'q' + qi}]`;

  // 7. unika id
  if (!q.id) errors.push(`${tag}: saknar id`);
  else if (seenIds.has(q.id)) errors.push(`${tag}: duplicerat id`);
  else seenIds.add(q.id);

  // 1. grid 3x3, exakt en null sist
  if (!Array.isArray(q.grid) || q.grid.length !== 3 || q.grid.some((r) => r.length !== 3)) {
    errors.push(`${tag}: grid är inte 3x3`);
  } else {
    const flat = q.grid.flat();
    const nulls = flat.filter((c) => c === null).length;
    if (nulls !== 1) errors.push(`${tag}: grid har ${nulls} null-celler (ska vara exakt 1)`);
    if (q.grid[2][2] !== null) errors.push(`${tag}: null-cellen är inte sist (grid[2][2])`);
    flat.forEach((c, i) => validateCell(c, `${tag} grid#${i}`));
  }

  // 2. options = 6
  if (!Array.isArray(q.options) || q.options.length !== 6) {
    errors.push(`${tag}: options har ${q.options?.length} element (ska vara 6)`);
  } else {
    q.options.forEach((c, i) => validateCell(c, `${tag} option#${i}`));

    // 5. alla options unika
    const keys = q.options.map(cellKey);
    const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
    if (dupes.length) errors.push(`${tag}: identiska svarsalternativ (${dupes.length} dubbletter)`);

    // 3. correctAnswer giltigt index
    if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 5) {
      errors.push(`${tag}: correctAnswer=${q.correctAnswer} är ogiltigt index`);
    } else {
      // 4. korrekt svar får inte vara lika med en distraktor
      const correctKey = keys[q.correctAnswer];
      const matchingDistractors = keys.filter((k, i) => i !== q.correctAnswer && k === correctKey);
      if (matchingDistractors.length) {
        errors.push(`${tag}: det korrekta svaret är identiskt med ${matchingDistractors.length} distraktor(er) → två rätta svar`);
      }
    }
  }
});

console.log(`\nValiderade ${bank.length} frågor i ${path}\n`);
if (errors.length === 0) {
  console.log('✓ ALLA frågor passerade. Inga strukturfel, inga dubbla rätta svar, inga id-krockar.');
  process.exit(0);
} else {
  console.log(`✗ ${errors.length} problem hittades:\n`);
  errors.forEach((e) => console.log('  - ' + e));
  process.exit(1);
}
