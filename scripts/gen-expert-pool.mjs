import { writeFileSync } from 'node:fs';

// ============================================================================
// EXPERT-POOL GENERATOR — sektorhjul + tile + lattice, ~28 frågor, nivå 4.
// Allt programmatiskt så facit (forsättning av rotation/bana) är garanterat rätt.
// ============================================================================

const rot8 = (arr, n) => arr.map((s) => (((s + n) % 8) + 8) % 8).sort((a, b) => a - b);
const keyOf = (c) => JSON.stringify({ k: c.kind, f: (c.filled || c.cells || []).map(String), p: c.pattern });

// Bygg 6 unika distraktorer-kandidater och välj 5 som skiljer sig från facit.
function pickDistractors(correct, candidates) {
  const ck = keyOf(correct);
  const seen = new Set([ck]);
  const out = [];
  for (const c of candidates) {
    const k = keyOf(c);
    if (!seen.has(k)) { seen.add(k); out.push(c); }
    if (out.length === 5) break;
  }
  return out;
}

// ---------- SEKTORHJUL ----------
function wheel(filled) { return { kind: 'sectorwheel', filled: [...filled].sort((a, b) => a - b) }; }
function wheelQ(id, title, base, step, dir) {
  const s = dir === 'ccw' ? -step : step;
  const cells = [];
  for (let i = 0; i < 9; i++) cells.push(wheel(rot8(base, i * s)));
  const correct = cells[8];
  const cf = correct.filled;
  // Kandidater: grannrotationer, ±1 sektor, samt en-stegs-skift av facit.
  const shift1 = wheel(cf.map((x) => (x + 1) % 8));
  const cand = [
    wheel(rot8(base, 7 * s)), wheel(rot8(base, 6 * s)),
    shift1, wheel(cf.map((x) => (x + 7) % 8)),
    wheel([...cf.slice(0, cf.length - 1)]),                 // en sektor färre
    wheel([...new Set([...cf, (cf[0] + 4) % 8])]),          // en sektor mer
    wheel([...new Set([...cf, (cf[cf.length - 1] + 1) % 8])]),
    wheel(rot8(base, 5 * s)), wheel(rot8(base, 2 * s)),
  ];
  return {
    id, title,
    rule: `Mönstret av svarta sektorer roterar ${step * 45} grader ${dir === 'ccw' ? 'moturs' : 'medurs'} för varje ruta. Läs rutorna som en lång rad, uppifrån och ner.`,
    difficulty: 4,
    grid: [[cells[0], cells[1], cells[2]], [cells[3], cells[4], cells[5]], [cells[6], cells[7], null]],
    options: [correct, ...pickDistractors(correct, cand)], correctAnswer: 0,
  };
}

// ---------- TILE (3×3 bitmask) ----------
const tileRotCW = (m) => { const b = (i) => (m >> i) & 1; let o = 0; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) if (b((2 - c) * 3 + r)) o |= 1 << (r * 3 + c); return o; };
const tileMirror = (m) => { const b = (i) => (m >> i) & 1; let o = 0; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) if (b(r * 3 + (2 - c))) o |= 1 << (r * 3 + c); return o; };
function tile(p) { return { kind: 'tile', pattern: p }; }
function tileQ(id, title, base, dir) {
  const step = dir === 'ccw' ? (m) => tileRotCW(tileRotCW(tileRotCW(m))) : tileRotCW;
  const cells = []; let m = base;
  for (let i = 0; i < 9; i++) { cells.push(tile(m)); m = step(m); }
  const correct = cells[8];
  // Generera gott om distinkta kandidater: grannceller, speglingar, bit-flips.
  const cand = [
    tile(cells[7].pattern), tile(cells[6].pattern), tile(tileMirror(base)),
    tile(tileRotCW(tileRotCW(base))), tile(tileMirror(cells[8].pattern)),
    tile(cells[8].pattern ^ 0b000010000), tile(cells[8].pattern ^ 0b100000000),
    tile(cells[8].pattern ^ 0b000000001), tile(cells[8].pattern ^ 0b001000000),
    tile(cells[8].pattern ^ 0b000000100), tile(cells[8].pattern ^ 0b010000000),
    tile(cells[8].pattern ^ 0b000001000), tile(cells[7].pattern ^ 0b000010000),
  ];
  return {
    id, title,
    rule: `Mönstret i rutnätet roterar 90 grader ${dir === 'ccw' ? 'moturs' : 'medurs'} för varje ruta. Läs rutorna som en lång rad, uppifrån och ner.`,
    difficulty: 4,
    grid: [[cells[0], cells[1], cells[2]], [cells[3], cells[4], cells[5]], [cells[6], cells[7], null]],
    options: [correct, ...pickDistractors(correct, cand)], correctAnswer: 0,
  };
}

// ---------- LATTICE (2×2) ----------
// index [TL=0, TR=1, BL=2, BR=3]. medurs-bana: TL->TR->BR->BL = 0,1,3,2
const CW = [0, 1, 3, 2];
const CCW = [0, 2, 3, 1];
function latCell(black, dot, gray) {
  const q = ['empty', 'empty', 'empty', 'empty'];
  if (gray !== undefined && gray !== black) q[gray] = 'fill_gray';
  if (dot !== undefined && dot !== black) q[dot] = 'dot';
  q[black] = 'fill_black';
  return { kind: 'lattice', cells: q };
}
// svart vandrar medurs, prick moturs (oberoende dubbel-rörelse)
function latQ(id, title, bStart, dStart) {
  const cells = [];
  for (let i = 0; i < 9; i++) cells.push(latCell(CW[(bStart + i) % 4], CCW[(dStart + i) % 4]));
  const correct = cells[8];
  const cand = [
    latCell(CW[(bStart + 7) % 4], CCW[(dStart + 7) % 4]),
    latCell(CW[(bStart + 8) % 4], CCW[(dStart + 9) % 4]),
    latCell(CW[(bStart + 9) % 4], CCW[(dStart + 8) % 4]),
    latCell(CCW[(bStart + 8) % 4], CW[(dStart + 8) % 4]),
    latCell(CW[(bStart + 8) % 4], CCW[(dStart + 7) % 4]),
    latCell(CW[(bStart + 6) % 4], CCW[(dStart + 8) % 4]),
  ];
  return {
    id, title,
    rule: 'Den svarta rutan vandrar medurs och pricken vandrar moturs, ett steg per ruta. Läs rutorna som en lång rad, uppifrån och ner.',
    difficulty: 4,
    grid: [[cells[0], cells[1], cells[2]], [cells[3], cells[4], cells[5]], [cells[6], cells[7], null]],
    options: [correct, ...pickDistractors(correct, cand)], correctAnswer: 0,
  };
}

const bank = [
  // 9 sektorhjul — varierat antal sektorer, steg, riktning
  wheelQ('v7e-w1', 'Sektormönstret roterar', [0, 1], 1, 'cw'),
  wheelQ('v7e-w2', 'Sektormönstret roterar', [0, 2], 1, 'cw'),
  wheelQ('v7e-w3', 'Sektormönstret hoppar', [0, 1, 4], 2, 'cw'),
  wheelQ('v7e-w4', 'Sektormönstret roterar tre steg', [0, 1, 3], 3, 'cw'),
  wheelQ('v7e-w5', 'Sektormönstret roterar moturs', [0, 1, 2], 1, 'ccw'),
  wheelQ('v7e-w6', 'Sektormönstret roterar', [0, 3, 5], 1, 'cw'),
  wheelQ('v7e-w7', 'Sektormönstret hoppar', [0, 1, 2, 5], 2, 'cw'),
  wheelQ('v7e-w8', 'Sektormönstret roterar moturs', [0, 2, 4], 1, 'ccw'),
  wheelQ('v7e-w9', 'Sektormönstret roterar', [0, 1, 2, 4], 1, 'cw'),
  // 9 tile — olika block, riktning
  tileQ('v7e-t1', 'Blocket roterar', 0b000000111, 'cw'),
  tileQ('v7e-t2', 'L-blocket roterar', 0b100110000, 'cw'),
  tileQ('v7e-t3', 'T-blocket roterar', 0b010111000, 'cw'),
  tileQ('v7e-t4', 'Blocket roterar moturs', 0b000000111, 'ccw'),
  tileQ('v7e-t5', 'Hörn-blocket roterar', 0b110000001, 'cw'),
  tileQ('v7e-t6', 'Z-blocket roterar', 0b011110000, 'cw'),
  tileQ('v7e-t7', 'Trappan roterar', 0b001011110, 'cw'),
  tileQ('v7e-t8', 'L-blocket roterar moturs', 0b100110000, 'ccw'),
  tileQ('v7e-t9', 'Vinkeln roterar', 0b100100110, 'cw'),
  // 10 lattice — svart + prick åt olika håll, olika startlägen
  latQ('v7e-l1', 'Svart ruta och prick vandrar åt olika håll', 0, 0),
  latQ('v7e-l2', 'Svart ruta och prick vandrar åt olika håll', 1, 0),
  latQ('v7e-l3', 'Svart ruta och prick vandrar åt olika håll', 0, 1),
  latQ('v7e-l4', 'Svart ruta och prick vandrar åt olika håll', 2, 1),
  latQ('v7e-l5', 'Svart ruta och prick vandrar åt olika håll', 1, 3),
  latQ('v7e-l6', 'Svart ruta och prick vandrar åt olika håll', 3, 0),
  latQ('v7e-l7', 'Svart ruta och prick vandrar åt olika håll', 0, 2),
  latQ('v7e-l8', 'Svart ruta och prick vandrar åt olika håll', 2, 3),
  latQ('v7e-l9', 'Svart ruta och prick vandrar åt olika håll', 3, 2),
  latQ('v7e-l10', 'Svart ruta och prick vandrar åt olika håll', 1, 1),
];

// validering: 6 unika options, facit≠distraktor, + symmetri-koll för tile
let bad = 0;
for (const q of bank) {
  if (q.options.length !== 6) { console.log('FEL ANTAL', q.id, q.options.length); bad++; continue; }
  const keys = q.options.map(keyOf);
  if (new Set(keys).size !== 6) { console.log('DUBBLETT', q.id); bad++; }

  // Tile: de 4 rotationerna av basmönstret måste vara distinkta, annars blir
  // rotationen osynlig (symmetriskt block) → trivial fråga.
  if (q.grid[0][0].kind === 'tile') {
    const base = q.grid[0][0].pattern;
    const rots = new Set([base, tileRotCW(base), tileRotCW(tileRotCW(base)), tileRotCW(tileRotCW(tileRotCW(base)))]);
    if (rots.size < 4) { console.log('SYMMETRISKT BLOCK (rotation osynlig)', q.id, 'distinkta rotationer:', rots.size); bad++; }
  }
  // Facit får inte vara identisk med näst sista synliga cellen.
  const facit = keyOf(q.options[0]);
  if (facit === keyOf(q.grid[2][1])) { console.log('FACIT = GRANNCELL', q.id); bad++; }
}
if (bad === 0) {
  writeFileSync('src/lib/logicTestV7/questionBankExpert.v7.json', JSON.stringify(bank, null, 2));
  console.log('✓ Skrev', bank.length, 'frågor (9 sektorhjul, 9 tile, 10 lattice).');
} else console.log('✗', bad, 'problem');
