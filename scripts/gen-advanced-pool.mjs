import { readFileSync, writeFileSync } from 'node:fs';

// ============================================================================
// AVANCERAD-OMGÖRNING: behåll de 7 redan rena frågorna (XOR, latin, spegling,
// rotation), ersätt de 8 trasiga (glyf, parallella progressioner, tally=5) med
// nya validerade frågor på SAMMA formattyper. Svårighet mellan grund och expert.
// ============================================================================

const old = JSON.parse(readFileSync('src/lib/logicTestV7/questionBank.v7.json', 'utf8'));
const KEEP = ['v7-q4-vector-rotation', 'v7-q5-lattice-xor', 'v7-q6-orbital-rotation',
  'v7-q8-stack-latin', 'v7-q11-ring-xor', 'v7-q12-triple-stack', 'v7-q13-tile-mirror', 'v7-q15-tile-xor'];
const kept = old.filter((q) => KEEP.includes(q.id));

const keyOf = (c) => JSON.stringify(c);
function pickDistractors(correct, cand) {
  const ck = keyOf(correct); const seen = new Set([ck]); const out = [];
  for (const c of cand) { const k = keyOf(c); if (!seen.has(k)) { seen.add(k); out.push(c); } if (out.length === 5) break; }
  return out;
}

// ---- RING latin square (ersätter ring-progression) ----
function ringCell(fills) { return { kind: 'ring', rings: fills }; }
// innersta ringens fyllning följer latin square; alltid 3 ringar, yttre ofyllda
function ringLatin(id) {
  const L = [['none', 'none', 'none'], ['none', 'none', 'gray'], ['none', 'none', 'black']];
  const lat = [[0, 1, 2], [1, 2, 0], [2, 0, 1]];
  const grid = lat.map((row) => row.map((v) => ringCell(L[v])));
  const correct = grid[2][2];
  grid[2][2] = null;
  const cand = [ringCell(L[0]), ringCell(L[2]), ringCell(['none', 'gray', 'black']),
    ringCell(['gray', 'none', 'gray']), ringCell(['none', 'black'])];
  return { id, title: 'Ringfyllning i rader och kolumner',
    rule: 'Alla figurer har tre ringar där de två yttre är ofyllda. Den innersta ringens fyllning följer en latin square: varje rad och kolumn har exakt en ofylld, en grå och en svart inner-ring.',
    difficulty: 3, grid, options: [correct, ...pickDistractors(correct, cand)], correctAnswer: 0 };
}

// ---- TALLY latin square (ersätter tally-orientation, max 4) ----
function tallyCell(count) { return { kind: 'tally', count, orientation: 'vertical' }; }
function tallyLatin(id) {
  const lat = [[2, 3, 4], [3, 4, 2], [4, 2, 3]];
  const grid = lat.map((row) => row.map(tallyCell));
  const correct = grid[2][2]; grid[2][2] = null;
  const cand = [tallyCell(4), tallyCell(2), { kind: 'tally', count: 3, orientation: 'horizontal' }, tallyCell(1), { kind: 'tally', count: 2, orientation: 'horizontal' }];
  return { id, title: 'Antal streck i rader och kolumner',
    rule: 'Strecken står alltid upprätt. Antalet följer en latin square: varje rad och kolumn har exakt en med två, en med tre och en med fyra streck.',
    difficulty: 3, grid, options: [correct, ...pickDistractors(correct, cand)], correctAnswer: 0 };
}

// ---- POLY latin square (ersätter poly-progression) ----
function polyCell(sides, fill = 'black') { return { kind: 'poly', sides, rotation: 0, fill }; }
function polyLatin(id) {
  const S = [5, 6, 8];
  const lat = [[0, 1, 2], [1, 2, 0], [2, 0, 1]];
  const grid = lat.map((row) => row.map((v) => polyCell(S[v])));
  const correct = grid[2][2]; grid[2][2] = null;
  const cand = [polyCell(5), polyCell(8), polyCell(6, 'gray'), polyCell(6, 'none'), polyCell(5, 'gray')];
  return { id, title: 'Antal sidor i rader och kolumner',
    rule: 'Alla figurer är svarta. Antalet sidor följer en latin square: varje rad och kolumn har exakt en femhörning, en sexhörning och en åttahörning.',
    difficulty: 3, grid, options: [correct, ...pickDistractors(correct, cand)], correctAnswer: 0 };
}

// ---- POLY rotation-bana (ersätter en progression med rörelse) ----
function polyRotWalk(id) {
  const cells = []; for (let i = 0; i < 9; i++) cells.push({ kind: 'poly', sides: 6, rotation: (i * 30) % 360, fill: 'black' });
  const correct = cells[8];
  const grid = [[cells[0], cells[1], cells[2]], [cells[3], cells[4], cells[5]], [cells[6], cells[7], null]];
  const cand = [{ kind: 'poly', sides: 6, rotation: 210, fill: 'black' }, { kind: 'poly', sides: 6, rotation: 180, fill: 'black' },
    { kind: 'poly', sides: 6, rotation: 270, fill: 'black' }, { kind: 'poly', sides: 5, rotation: 240, fill: 'black' },
    { kind: 'poly', sides: 6, rotation: 240, fill: 'gray' }];
  return { id, title: 'Sexhörningen vrider sig',
    rule: 'Sexhörningen vrider sig 30 grader medurs för varje ruta. Läs rutorna som en lång rad, uppifrån och ner.',
    difficulty: 3, grid, options: [correct, ...pickDistractors(correct, cand)], correctAnswer: 0 };
}

// ---- VECTOR moturs (variant) ----
function vectorWalk(id) {
  // moturs: 0, 315, 270, ... (45° moturs per cell)
  const cells = []; for (let i = 0; i < 9; i++) cells.push({ kind: 'vector', angle: ((-i * 45) % 360 + 360) % 360, length: 'long', head: 'filled' });
  const correct = cells[8];
  const grid = [[cells[0], cells[1], cells[2]], [cells[3], cells[4], cells[5]], [cells[6], cells[7], null]];
  const cand = [{ kind: 'vector', angle: 45, length: 'long', head: 'filled' }, { kind: 'vector', angle: 315, length: 'long', head: 'filled' },
    { kind: 'vector', angle: 0, length: 'short', head: 'filled' }, { kind: 'vector', angle: 0, length: 'long', head: 'open' },
    { kind: 'vector', angle: 90, length: 'long', head: 'filled' }];
  return { id, title: 'Pilen vrider sig moturs',
    rule: 'Pilen vrider sig 45 grader moturs för varje ruta. Läs rutorna som en lång rad, uppifrån och ner.',
    difficulty: 3, grid, options: [correct, ...pickDistractors(correct, cand)], correctAnswer: 0 };
}

// ---- ORBITAL moturs (variant) ----
function orbitalWalk(id) {
  const cells = []; for (let i = 0; i < 9; i++) cells.push({ kind: 'orbital', center: 'filled', satellite: ((8 - i) % 8 + 8) % 8 });
  const correct = cells[8];
  const grid = [[cells[0], cells[1], cells[2]], [cells[3], cells[4], cells[5]], [cells[6], cells[7], null]];
  const cand = [{ kind: 'orbital', center: 'filled', satellite: 1 }, { kind: 'orbital', center: 'filled', satellite: 7 },
    { kind: 'orbital', center: 'open', satellite: 0 }, { kind: 'orbital', center: 'filled', satellite: 2 },
    { kind: 'orbital', center: 'filled', satellite: 6 }];
  return { id, title: 'Pricken vandrar moturs',
    rule: 'Pricken flyttar ett steg moturs (45 grader) för varje ruta. Läs rutorna som en lång rad, uppifrån och ner. Mitten är fylld.',
    difficulty: 3, grid, options: [correct, ...pickDistractors(correct, cand)], correctAnswer: 0 };
}

// ---- STACK latin på symbol (variant, ersätter glyf) ----
function stackCell(base, symbol) { return { kind: 'stack', base, symbol, baseFill: 'none' }; }
function stackSymbolLatin(id) {
  const SY = ['plus', 'minus', 'dot'];
  const lat = [[0, 1, 2], [1, 2, 0], [2, 0, 1]];
  const grid = lat.map((row) => row.map((v) => stackCell('circle', SY[v])));
  const correct = grid[2][2]; grid[2][2] = null;
  const cand = [stackCell('circle', 'plus'), stackCell('circle', 'dot'), stackCell('square', 'minus'),
    stackCell('circle', 'ring'), { kind: 'stack', base: 'circle', symbol: 'minus', baseFill: 'black' }];
  return { id, title: 'Symbolen i rader och kolumner',
    rule: 'Alla figurer har en ofylld cirkel som bas. Symbolen följer en latin square: varje rad och kolumn har exakt en med plus, en med minus och en med prick.',
    difficulty: 3, grid, options: [correct, ...pickDistractors(correct, cand)], correctAnswer: 0 };
}

const fresh = [ringLatin('v7-a-ring-latin'), tallyLatin('v7-a-tally-latin'), polyLatin('v7-a-poly-latin'),
  polyRotWalk('v7-a-poly-rot'), vectorWalk('v7-a-vector-ccw'), orbitalWalk('v7-a-orbital-ccw'),
  stackSymbolLatin('v7-a-stack-symbol')];

// totalt: 8 behållna + 7 nya = 15
const bank = [...kept, ...fresh];

// validera fresh-frågorna (kept är redan godkända)
let bad = 0;
for (const q of fresh) {
  if (q.options.length !== 6) { console.log('FEL ANTAL', q.id, q.options.length); bad++; }
  if (new Set(q.options.map(keyOf)).size !== 6) { console.log('DUBBLETT', q.id); bad++; }
}
if (bad === 0) {
  writeFileSync('src/lib/logicTestV7/questionBank.v7.json', JSON.stringify(bank, null, 2));
  console.log('✓ Skrev', bank.length, 'frågor (8 behållna + 7 nya).');
} else console.log('✗', bad, 'problem');
