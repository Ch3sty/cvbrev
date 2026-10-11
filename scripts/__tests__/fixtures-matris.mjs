// Konstruerade matrisfrågor för enhetstesterna (bandet "svår plus").
import { OPS } from '../lib/matris/tolka.mjs';

const sortNum = (a) => [...a].sort((x, y) => x - y);
const rot = (a, k) => sortNum(a.map((x) => (((x + k) % 8) + 8) % 8));
const opv = (op, a, b) => sortNum([...OPS[op](new Set(a.map(String)), new Set(b.map(String)))].map(Number));

// Tre par (a, b) utan symmetri, där varje operation ger en icke tom mängd
// som skiljer sig från både a och b.
export const PAR = [
  [[0, 1, 3], [1, 4]],
  [[2, 5], [2, 6, 7]],
  [[0, 2, 6], [3, 6]],
];

/** Fråga med strålar där tredje rutan är op(a, b) vriden k steg, per rad (axel kolumn) eller kolumn (axel rad). */
export function vridenFraga(op, k, axel, kind = 'ray') {
  const cell = (s) => (kind === 'ray' ? { kind: 'ray', rays: s } : { kind: 'sectorwheel', filled: s });
  const trip = PAR.map(([a, b]) => [a, b, rot(opv(op, a, b), k)]);
  const g = axel === 'kolumn' ? trip.map((t) => t.map(cell)) : [0, 1, 2].map((r) => trip.map((t) => cell(t[r])));
  const facit = g[2][2];
  g[2][2] = null;
  const [a, b] = PAR[2];
  const C = opv(op, a, b);
  const options = [facit, cell(C), cell(rot(C, -k)), cell(rot(C, k + 4)), cell(rot(a, k)), cell(rot(b, k))];
  return { id: `test-${op}-${k}-${axel}`, title: 't', rule: 'r', grid: g, options, correctAnswer: 0, pred: facit };
}

/** Två latinska kvadrater (bas och symbol) med fyllning i schackmönster eller utan. */
export function latinFraga(L1, L2, fyll) {
  const B = ['circle', 'square', 'triangle'];
  const S = ['plus', 'minus', 'dot'];
  const g = [0, 1, 2].map((r) => [0, 1, 2].map((c) => ({ kind: 'stack', base: B[L1[r][c]], symbol: S[L2[r][c]], baseFill: fyll ? ((r + c) % 2 === 0 ? 'gray' : 'none') : 'none' })));
  const facit = g[2][2];
  g[2][2] = null;
  const options = [facit, { ...facit, base: 'diamond' }, { ...facit, symbol: 'cross' }, { ...facit, baseFill: 'black' }, { ...facit, base: 'diamond', symbol: 'cross' }, { ...facit, symbol: 'ring' }];
  return { id: 'test-latin', title: 't', rule: 'Varje rad och varje kolumn.', grid: g, options, correctAnswer: 0 };
}

/** Plus-fråga (xor, k = 1, per rad) med fem nära miss som klarar distraktorkraven. */
export function godkandPlus() {
  const q = vridenFraga('xor', 1, 'kolumn');
  const [a, b] = PAR[2];
  const ray = (s) => ({ kind: 'ray', rays: s });
  const C = opv('xor', a, b);
  q.options = [q.pred, ray(C), ray(rot(C, -1)), ray(rot(C, 5)), ray(rot(opv('union', a, b), 1)), ray(rot(opv('snitt', a, b), 1))];
  q.id = 'fixtur-godkand';
  return q;
}
export const hjalp = { rot, opv };
