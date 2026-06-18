// Validering av V7-frågor (primitiv- eller lager-celler).
// Struktur + anti-trivialitet, generiskt över alla V7-celltyper.
//
// Kör: node scripts/validate-v7-questions.mjs <fil.json>

import { readFileSync } from 'node:fs';

const path = process.argv[2];
const bank = JSON.parse(readFileSync(path, 'utf8'));

// Kanonisk nyckel för en cell (primitiv ELLER array av primitiver).
// Stabil, djup serialisering (hanterar arrayer av objekt, t.ex. balanceline.items)
const stable = (v) => {
  if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
  if (v && typeof v === 'object') {
    return '{' + Object.keys(v).sort().map((k) => `${k}:${stable(v[k])}`).join(',') + '}';
  }
  return String(v);
};
const norm = (cell) => (cell === null ? 'null' : stable(cell));

const errors = [];
const seen = new Set();

for (const q of bank) {
  const tag = `[${q.id}]`;
  if (!q.id) errors.push(`${tag} saknar id`);
  else if (seen.has(q.id)) errors.push(`${tag} duplicerat id`);
  else seen.add(q.id);

  // grid 3x3, exakt en null sist
  if (!Array.isArray(q.grid) || q.grid.length !== 3 || q.grid.some((r) => r.length !== 3)) {
    errors.push(`${tag} grid är inte 3x3`);
  } else {
    const flat = q.grid.flat();
    if (flat.filter((c) => c === null).length !== 1) errors.push(`${tag} ska ha exakt 1 null-cell`);
    if (q.grid[2][2] !== null) errors.push(`${tag} null-cellen ska vara sist (grid[2][2])`);
  }

  // läsbarhet: vissa värden renderar otydligt i det lilla cellformatet och
  // ska inte användas på grundnivå. Skanna både grid och options.
  const allCells = [...q.grid.flat().filter(Boolean), ...(q.options ?? [])];
  for (const cell of allCells) {
    const prims = Array.isArray(cell) ? cell : [cell];
    for (const p of prims) {
      // tally=5 ritas som "buntat femtal" med diagonalstreck → svårläst litet
      if (p.kind === 'tally' && p.count === 5) {
        errors.push(`${tag} tally med 5 pinnar (buntat femtal) är svårläst — använd max 4`);
      }
    }
  }

  // options = 6, unika, correctAnswer giltig
  if (!Array.isArray(q.options) || q.options.length !== 6) {
    errors.push(`${tag} options ska vara 6 (är ${q.options?.length})`);
  } else {
    const keys = q.options.map(norm);
    const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
    if (dupes.length) errors.push(`${tag} identiska svarsalternativ`);
    if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 5) {
      errors.push(`${tag} correctAnswer ogiltigt`);
    } else {
      const ck = keys[q.correctAnswer];
      if (keys.filter((k, i) => i !== q.correctAnswer && k === ck).length) {
        errors.push(`${tag} rätt svar identiskt med distraktor → två rätta`);
      }
    }
  }

  // anti-trivialitet (facit isatt)
  if (Array.isArray(q.grid) && q.grid.length === 3 && typeof q.correctAnswer === 'number') {
    const g = q.grid.map((r) => r.slice());
    g[2][2] = q.options[q.correctAnswer];
    const isSym = /spegl|schack|symmetr|180|motsatt/i.test(q.rule);
    const rk = g.map((r) => r.map(norm).join('¦'));
    const ck = [0, 1, 2].map((c) => g.map((r) => norm(r[c])).join('¦'));
    if (!isSym) {
      for (let a = 0; a < 3; a++) for (let b = a + 1; b < 3; b++) {
        if (rk[a] === rk[b]) errors.push(`${tag} rad ${a + 1} = rad ${b + 1} (trivial)`);
        if (ck[a] === ck[b]) errors.push(`${tag} kolumn ${a + 1} = kolumn ${b + 1} (trivial)`);
      }
    }
    if (norm(g[2][2]) === norm(g[1][2])) errors.push(`${tag} facit = cellen ovanför (trivial)`);
    if (norm(g[2][2]) === norm(g[2][1])) errors.push(`${tag} facit = cellen till vänster (trivial)`);
  }
}

console.log(`\nV7-validering: ${bank.length} frågor i ${path}\n`);
if (errors.length === 0) {
  console.log('✓ ALLA passerade. Struktur ok, inga dubbletter, inga triviala frågor.');
  process.exit(0);
} else {
  console.log(`✗ ${errors.length} problem:\n`);
  errors.forEach((e) => console.log('  - ' + e));
  process.exit(1);
}
