import { writeFileSync } from 'node:fs';

const rot8 = (arr, n) => arr.map((s) => (s + n) % 8).sort((a, b) => a - b);

function wheelRot(id, title, base, step, distractors) {
  const cells = [];
  for (let i = 0; i < 9; i++) cells.push({ kind: 'sectorwheel', filled: rot8(base, i * step) });
  return {
    id, title,
    rule: `Mönstret av svarta sektorer roterar ${step * 45} grader medurs för varje ruta. Läs rutorna som en lång rad, uppifrån och ner.`,
    difficulty: 4,
    grid: [[cells[0], cells[1], cells[2]], [cells[3], cells[4], cells[5]], [cells[6], cells[7], null]],
    options: [cells[8], ...distractors], correctAnswer: 0,
  };
}

const rotTile = (m) => { const b = (i) => (m >> i) & 1; let o = 0; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) if (b((2 - c) * 3 + r)) o |= 1 << (r * 3 + c); return o; };
function tileRot(id, title, base, distractors) {
  const cells = []; let m = base;
  for (let i = 0; i < 9; i++) { cells.push({ kind: 'tile', pattern: m }); m = rotTile(m); }
  return {
    id, title,
    rule: 'Mönstret i rutnätet roterar 90 grader medurs för varje ruta. Läs rutorna som en lång rad, uppifrån och ner.',
    difficulty: 4,
    grid: [[cells[0], cells[1], cells[2]], [cells[3], cells[4], cells[5]], [cells[6], cells[7], null]],
    options: [cells[8], ...distractors], correctAnswer: 0,
  };
}

// Lattice: svart ruta vandrar medurs, prick vandrar moturs, oberoende.
const CW = [0, 1, 3, 2];   // TL, TR, BR, BL (index i [TL,TR,BL,BR])
const CCW = [0, 2, 3, 1];  // TL, BL, BR, TR
function latticeWalk(id, title, blackStart, dotStart, distractors) {
  const cells = [];
  for (let i = 0; i < 9; i++) {
    const bi = CW[(blackStart + i) % 4];
    const di = CCW[(dotStart + i) % 4];
    const q = ['empty', 'empty', 'empty', 'empty'];
    q[bi] = 'fill_black';
    if (di !== bi) q[di] = 'dot';
    cells.push({ kind: 'lattice', cells: q });
  }
  return {
    id, title,
    rule: 'Den svarta rutan vandrar medurs och pricken vandrar moturs, ett steg per ruta. Läs rutorna som en lång rad, uppifrån och ner.',
    difficulty: 4,
    grid: [[cells[0], cells[1], cells[2]], [cells[3], cells[4], cells[5]], [cells[6], cells[7], null]],
    options: [cells[8], ...distractors], correctAnswer: 0,
  };
}

const bank = [
  wheelRot('v7e-q1-wheel-135', 'Sektormönstret roterar tre steg', [0, 1, 3], 3, [
    { kind: 'sectorwheel', filled: [2, 3, 5] }, { kind: 'sectorwheel', filled: [1, 4, 6] },
    { kind: 'sectorwheel', filled: [0, 3, 5] }, { kind: 'sectorwheel', filled: [4, 5, 7] },
    { kind: 'sectorwheel', filled: [1, 3, 4] },
  ]),
  wheelRot('v7e-q2-wheel-asym', 'Sektormönstret hoppar två steg', [0, 1, 4], 2, [
    { kind: 'sectorwheel', filled: [2, 3, 6] }, { kind: 'sectorwheel', filled: [4, 5, 0] },
    { kind: 'sectorwheel', filled: [1, 4, 5] }, { kind: 'sectorwheel', filled: [3, 6, 7] },
    { kind: 'sectorwheel', filled: [0, 2, 4] },
  ]),
  tileRot('v7e-q3-tile-L', 'L-blocket roterar', 0b100110000, [
    { kind: 'tile', pattern: 0b001011000 }, { kind: 'tile', pattern: 0b000110001 },
    { kind: 'tile', pattern: 0b010110010 }, { kind: 'tile', pattern: 0b110100000 },
    { kind: 'tile', pattern: 0b000011001 },
  ]),
  tileRot('v7e-q4-tile-T', 'T-blocket roterar', 0b010111000, [
    { kind: 'tile', pattern: 0b010010110 }, { kind: 'tile', pattern: 0b000111010 },
    { kind: 'tile', pattern: 0b011010010 }, { kind: 'tile', pattern: 0b110010010 },
    { kind: 'tile', pattern: 0b010111001 },
  ]),
  latticeWalk('v7e-q5-lattice-walk', 'Svart ruta och prick vandrar åt olika håll', 0, 0, [
    { kind: 'lattice', cells: ['fill_black', 'empty', 'empty', 'dot'] },
    { kind: 'lattice', cells: ['dot', 'empty', 'fill_black', 'empty'] },
    { kind: 'lattice', cells: ['empty', 'fill_black', 'dot', 'empty'] },
    { kind: 'lattice', cells: ['fill_black', 'dot', 'empty', 'empty'] },
    { kind: 'lattice', cells: ['empty', 'empty', 'empty', 'fill_black'] },
  ]),
];

const norm = (c) => JSON.stringify({ k: c.kind, f: (c.filled || c.cells || []).map(String), p: c.pattern });
let bad = 0;
for (const q of bank) {
  const keys = q.options.map(norm);
  if (keys.slice(1).includes(keys[0])) { console.log('FACIT=DISTRAKTOR', q.id); bad++; }
  const d = keys.filter((k, i) => keys.indexOf(k) !== i);
  if (d.length) { console.log('DUBBLETT', q.id); bad++; }
  if (q.options.length !== 6) { console.log('FEL ANTAL OPTIONS', q.id, q.options.length); bad++; }
}
if (bad === 0) {
  writeFileSync('src/lib/logicTestV7/questionBankExpert.v7.json', JSON.stringify(bank, null, 2));
  console.log('✓ Skrev', bank.length, 'svårare prototyper.');
} else console.log('✗ fixa först');
