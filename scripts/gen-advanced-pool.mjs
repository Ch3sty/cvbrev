import { readFileSync, writeFileSync } from 'node:fs';

// ============================================================================
// AVANCERAD = 28 frågor, svårighet MELLAN grund och expert.
// Behåll de bevisat bra frågorna (XOR, latin, spegling, rotation av former med
// referensram). INGA lösa prickar (orbital), inga glyfer, inga svaga symmetrier.
// Generera resten programmatiskt + validera.
// ============================================================================

const old = JSON.parse(readFileSync('src/lib/logicTestV7/questionBank.v7.json', 'utf8'));
// Behåll dessa (rena, varierade, läsbara). Ta bort orbital (lösa prickar) + poly-rot 30° (svag).
const KEEP = ['v7-q4-vector-rotation', 'v7-q5-lattice-xor', 'v7-q8-stack-latin',
  'v7-q11-ring-xor', 'v7-q12-triple-stack', 'v7-q13-tile-mirror', 'v7-q15-tile-xor',
  'v7-a-ring-latin', 'v7-a-tally-latin', 'v7-a-poly-latin', 'v7-a-vector-ccw', 'v7-a-stack-symbol'];
const kept = old.filter((q) => KEEP.includes(q.id)); // 12 st

const keyOf = (c) => JSON.stringify(c);
function pickD(correct, cand) {
  const ck = keyOf(correct); const seen = new Set([ck]); const out = [];
  for (const c of cand) { const k = keyOf(c); if (!seen.has(k)) { seen.add(k); out.push(c); } if (out.length === 5) break; }
  return out;
}

// ---------- TILE-helpers ----------
const tRotCW = (m) => { const b = (i) => (m >> i) & 1; let o = 0; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) if (b((2 - c) * 3 + r)) o |= 1 << (r * 3 + c); return o; };
const tile = (p) => ({ kind: 'tile', pattern: p });
function tileRotQ(id, title, base, dir) {
  const step = dir === 'ccw' ? (m) => tRotCW(tRotCW(tRotCW(m))) : tRotCW;
  const cells = []; let m = base; for (let i = 0; i < 9; i++) { cells.push(tile(m)); m = step(m); }
  const correct = cells[8];
  const cand = [tile(cells[7].pattern), tile(cells[6].pattern),
    tile(correct.pattern ^ 0b000010000), tile(correct.pattern ^ 0b100000000),
    tile(correct.pattern ^ 0b000000001), tile(correct.pattern ^ 0b001000000), tile(correct.pattern ^ 0b000000100)];
  return { id, title, rule: `Mönstret i rutnätet roterar 90 grader ${dir === 'ccw' ? 'moturs' : 'medurs'} för varje ruta. Läs rutorna som en lång rad, uppifrån och ner.`,
    difficulty: 3, grid: [[cells[0], cells[1], cells[2]], [cells[3], cells[4], cells[5]], [cells[6], cells[7], null]],
    options: [correct, ...pickD(correct, cand)], correctAnswer: 0 };
}

// ---------- VECTOR rotation ----------
function vectorQ(id, title, step, dir) {
  const s = dir === 'ccw' ? -step : step;
  const cells = []; for (let i = 0; i < 9; i++) cells.push({ kind: 'vector', angle: ((i * s * 45) % 360 + 360) % 360, length: 'long', head: 'filled' });
  const correct = cells[8];
  const cand = [{ kind: 'vector', angle: ((7 * s * 45) % 360 + 360) % 360, length: 'long', head: 'filled' },
    { kind: 'vector', angle: ((6 * s * 45) % 360 + 360) % 360, length: 'long', head: 'filled' },
    { kind: 'vector', angle: correct.angle, length: 'short', head: 'filled' },
    { kind: 'vector', angle: correct.angle, length: 'long', head: 'open' },
    { kind: 'vector', angle: (correct.angle + 90) % 360, length: 'long', head: 'filled' },
    { kind: 'vector', angle: (correct.angle + 45) % 360, length: 'long', head: 'filled' }];
  return { id, title, rule: `Pilen vrider sig ${step * 45} grader ${dir === 'ccw' ? 'moturs' : 'medurs'} för varje ruta. Läs rutorna som en lång rad, uppifrån och ner.`,
    difficulty: 3, grid: [[cells[0], cells[1], cells[2]], [cells[3], cells[4], cells[5]], [cells[6], cells[7], null]],
    options: [correct, ...pickD(correct, cand)], correctAnswer: 0 };
}

// ---------- RING latin (innersta fyllning) ----------
function ringLatinQ(id, perm) {
  const L = [['none', 'none', 'none'], ['none', 'none', 'gray'], ['none', 'none', 'black']];
  const grid = perm.map((row) => row.map((v) => ({ kind: 'ring', rings: L[v] })));
  const correct = grid[2][2]; grid[2][2] = null;
  const cand = [{ kind: 'ring', rings: L[0] }, { kind: 'ring', rings: L[1] }, { kind: 'ring', rings: L[2] },
    { kind: 'ring', rings: ['none', 'gray', 'black'] }, { kind: 'ring', rings: ['gray', 'none', 'gray'] }, { kind: 'ring', rings: ['none', 'black'] }];
  return { id, title: 'Ringfyllning i rader och kolumner',
    rule: 'Alla figurer har tre ringar där de två yttre är ofyllda. Den innersta ringens fyllning följer en latin square: varje rad och kolumn har exakt en ofylld, en grå och en svart inner-ring.',
    difficulty: 3, grid, options: [correct, ...pickD(correct, cand)], correctAnswer: 0 };
}

// ---------- POLY latin (sidor) ----------
function polyLatinQ(id, perm) {
  const S = [5, 6, 8];
  const grid = perm.map((row) => row.map((v) => ({ kind: 'poly', sides: S[v], rotation: 0, fill: 'black' })));
  const correct = grid[2][2]; grid[2][2] = null;
  const cand = [{ kind: 'poly', sides: 5, rotation: 0, fill: 'black' }, { kind: 'poly', sides: 6, rotation: 0, fill: 'black' },
    { kind: 'poly', sides: 8, rotation: 0, fill: 'black' }, { kind: 'poly', sides: 6, rotation: 0, fill: 'gray' },
    { kind: 'poly', sides: 6, rotation: 0, fill: 'none' }, { kind: 'poly', sides: 5, rotation: 0, fill: 'gray' }];
  return { id, title: 'Antal sidor i rader och kolumner',
    rule: 'Alla figurer är svarta. Antalet sidor följer en latin square: varje rad och kolumn har exakt en femhörning, en sexhörning och en åttahörning.',
    difficulty: 3, grid, options: [correct, ...pickD(correct, cand)], correctAnswer: 0 };
}

// ---------- POLY fyllning latin (sexhörning, fyllning varierar) ----------
function polyFillLatinQ(id, perm) {
  const F = ['none', 'gray', 'black'];
  const grid = perm.map((row) => row.map((v) => ({ kind: 'poly', sides: 6, rotation: 0, fill: F[v] })));
  const correct = grid[2][2]; grid[2][2] = null;
  const cand = [{ kind: 'poly', sides: 6, rotation: 0, fill: 'none' }, { kind: 'poly', sides: 6, rotation: 0, fill: 'gray' },
    { kind: 'poly', sides: 6, rotation: 0, fill: 'black' }, { kind: 'poly', sides: 5, rotation: 0, fill: 'gray' },
    { kind: 'poly', sides: 8, rotation: 0, fill: 'gray' }, { kind: 'poly', sides: 6, rotation: 30, fill: 'gray' }];
  return { id, title: 'Fyllning i rader och kolumner',
    rule: 'Alla figurer är sexhörningar. Fyllningen följer en latin square: varje rad och kolumn har exakt en ofylld, en grå och en svart.',
    difficulty: 3, grid, options: [correct, ...pickD(correct, cand)], correctAnswer: 0 };
}

// ---------- STACK bas-latin (form varierar) ----------
function stackBaseLatinQ(id, perm) {
  const B = ['circle', 'square', 'triangle'];
  const grid = perm.map((row) => row.map((v) => ({ kind: 'stack', base: B[v], symbol: 'dot', baseFill: 'none' })));
  const correct = grid[2][2]; grid[2][2] = null;
  const cand = [{ kind: 'stack', base: 'circle', symbol: 'dot', baseFill: 'none' }, { kind: 'stack', base: 'square', symbol: 'dot', baseFill: 'none' },
    { kind: 'stack', base: 'triangle', symbol: 'dot', baseFill: 'none' }, { kind: 'stack', base: 'diamond', symbol: 'dot', baseFill: 'none' },
    { kind: 'stack', base: 'square', symbol: 'plus', baseFill: 'none' }, { kind: 'stack', base: 'square', symbol: 'dot', baseFill: 'black' }];
  return { id, title: 'Basformen i rader och kolumner',
    rule: 'Alla figurer är ofyllda och bär en prick. Basformen följer en latin square: varje rad och kolumn har exakt en cirkel, en kvadrat och en triangel.',
    difficulty: 3, grid, options: [correct, ...pickD(correct, cand)], correctAnswer: 0 };
}

// Tre latin-permutationer (cykliska) för variation
const P1 = [[0, 1, 2], [1, 2, 0], [2, 0, 1]];
const P2 = [[0, 1, 2], [2, 0, 1], [1, 2, 0]];
const P3 = [[1, 0, 2], [0, 2, 1], [2, 1, 0]];

const fresh = [
  tileRotQ('v7-a-tile-L', 'L-blocket roterar', 0b100110000, 'cw'),
  tileRotQ('v7-a-tile-T', 'T-blocket roterar', 0b010111000, 'cw'),
  tileRotQ('v7-a-tile-Z-ccw', 'Z-blocket roterar moturs', 0b011110000, 'ccw'),
  tileRotQ('v7-a-tile-corner', 'Hörn-blocket roterar', 0b110000001, 'cw'),
  vectorQ('v7-a-vector-90', 'Pilen vrider sig', 2, 'cw'),
  vectorQ('v7-a-vector-cw45', 'Pilen vrider sig', 1, 'cw'),
  ringLatinQ('v7-a-ring-latin2', P2),
  polyLatinQ('v7-a-poly-latin2', P2),
  polyFillLatinQ('v7-a-poly-fill', P1),
  polyFillLatinQ('v7-a-poly-fill2', P3),
  stackBaseLatinQ('v7-a-stack-base', P1),
  stackBaseLatinQ('v7-a-stack-base2', P3),
  ringLatinQ('v7-a-ring-latin3', P3),
  polyLatinQ('v7-a-poly-latin3', P1),
  vectorQ('v7-a-vector-ccw90', 'Pilen vrider sig', 2, 'ccw'),
  tileRotQ('v7-a-tile-vinkel', 'Vinkeln roterar', 0b100100110, 'cw'),
];

const bank = [...kept, ...fresh].slice(0, 28);

let bad = 0;
for (const q of fresh) {
  if (q.options.length !== 6) { console.log('FEL ANTAL', q.id, q.options.length); bad++; }
  if (new Set(q.options.map(keyOf)).size !== 6) { console.log('DUBBLETT', q.id); bad++; }
}
console.log('kept:', kept.length, 'fresh:', fresh.length, 'total:', bank.length);
if (bad === 0 && bank.length === 28) {
  writeFileSync('src/lib/logicTestV7/questionBank.v7.json', JSON.stringify(bank, null, 2));
  console.log('✓ Skrev 28 frågor.');
} else console.log('✗', bad, 'problem eller fel antal:', bank.length);
