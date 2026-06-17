// Anti-trivialitetsfilter för matrislogik-frågor.
// Avvisar frågor som går att lösa utan att förstå regeln, dvs. genom ren avläsning.
//
// En fråga UNDERKÄNNS om någon av dessa gäller (med facit isatt i tomrummet):
//   T1. Två rader är identiska (rad-repetition → kopiera grannen).
//   T2. Två kolumner är identiska (kolumn-repetition).
//   T3. En-dimensionell: bara ETT cell-attribut varierar i hela griden
//       (t.ex. allt är dots och bara count ändras, allt annat konstant och raderna lika).
//   T4. Facit-cellen är identisk med den cell som står rakt ovanför eller rakt till vänster
//       om tomrummet (då räcker det att kopiera grannen).
//
// Kör: node scripts/anti-trivial-matrix.mjs <fil.json>

import { readFileSync } from 'node:fs';

const path = process.argv[2] ?? 'scripts/new-matrix-questions.json';
const bank = JSON.parse(readFileSync(path, 'utf8'));

const norm = (c) => {
  if (c === null) return 'null';
  return JSON.stringify(
    Object.keys(c).sort().reduce((o, k) => {
      o[k] = Array.isArray(c[k]) ? [...c[k]].sort() : c[k];
      return o;
    }, {})
  );
};

const rejects = [];

for (const q of bank) {
  const g = q.grid.map((r) => r.slice());
  g[2][2] = q.options[q.correctAnswer]; // sätt in facit
  const reasons = [];

  const rowKeys = g.map((r) => r.map(norm).join('|'));
  const colKeys = [0, 1, 2].map((c) => g.map((r) => norm(r[c])).join('|'));

  // Symmetri-regler (spegling, schack) ger AVSIKTLIGT identiska rader/kolumner och är
  // inte triviala — då är symmetrin själva resonemanget. Undanta T1/T2 för dem.
  const isSymmetryRule = /spegl|schack|symmetr|vänder 180|rakt motsatt/i.test(q.rule);

  // T1: identiska rader
  if (!isSymmetryRule)
    for (let a = 0; a < 3; a++)
      for (let b = a + 1; b < 3; b++)
        if (rowKeys[a] === rowKeys[b]) reasons.push(`rad ${a + 1} = rad ${b + 1} (rad-repetition)`);

  // T2: identiska kolumner
  if (!isSymmetryRule)
    for (let a = 0; a < 3; a++)
      for (let b = a + 1; b < 3; b++)
        if (colKeys[a] === colKeys[b]) reasons.push(`kolumn ${a + 1} = kolumn ${b + 1} (kol-repetition)`);

  // T3: en-dimensionell variation — räkna hur många attribut som varierar över hela griden
  const flat = g.flat();
  const allKinds = new Set(flat.map((c) => c.kind));
  if (allKinds.size === 1) {
    // samla alla attribut-värden per nyckel
    const attrValues = {};
    for (const cell of flat) {
      for (const [k, v] of Object.entries(cell)) {
        if (k === 'kind') continue;
        (attrValues[k] ??= new Set()).add(Array.isArray(v) ? v.slice().sort().join('+') : v);
      }
    }
    const varyingAttrs = Object.entries(attrValues).filter(([, s]) => s.size > 1).map(([k]) => k);
    if (varyingAttrs.length <= 1) {
      // bara ett attribut varierar — men det är bara trivialt OM raderna dessutom upprepas
      // (en latin square varierar t.ex. bara 'fill' men har unika rader). Vi flaggar
      // bara om kombinerat med rad- eller kol-repetition, vilket fångas av T1/T2 ovan,
      // ELLER om varje rad har exakt samma sekvens av det varierande attributet.
      const attr = varyingAttrs[0];
      if (attr) {
        const rowSeqs = g.map((r) => r.map((c) => {
          const v = c[attr];
          return Array.isArray(v) ? v.slice().sort().join('+') : v;
        }).join('>'));
        if (new Set(rowSeqs).size === 1) {
          reasons.push(`en-dimensionellt: bara "${attr}" varierar och alla rader har samma sekvens`);
        }
      } else {
        reasons.push('alla celler identiska');
      }
    }
  }

  // T4: facit = cell ovanför eller till vänster om tomrummet
  if (norm(g[2][2]) === norm(g[1][2])) reasons.push('facit = cellen rakt ovanför tomrummet');
  if (norm(g[2][2]) === norm(g[2][1])) reasons.push('facit = cellen rakt till vänster om tomrummet');

  if (reasons.length) rejects.push({ id: q.id, title: q.title, reasons: [...new Set(reasons)] });
}

console.log(`\nAnti-trivialitetskontroll: ${bank.length} frågor.\n`);
if (rejects.length === 0) {
  console.log('✓ Inga triviala frågor. Alla kräver att man förstår regeln.');
  process.exit(0);
} else {
  console.log(`✗ ${rejects.length} triviala frågor underkända:\n`);
  for (const r of rejects) {
    console.log(`  [${r.id}] ${r.title}`);
    r.reasons.forEach((x) => console.log(`      → ${x}`));
  }
  process.exit(1);
}
