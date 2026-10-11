// scripts/lib/matris/recept-plus.mjs
// =============================================================================
// Recepten för bandet "svår plus", parti 1 (beställningen "svarare frågor",
// 1.2): 40 frågor, 8 per mekanism.
//
//   P1  grundform och symbol i latinska kvadrater, fyllning på diagonalen
//   P2  grundform och symbol i latinska kvadrater, fyllning i schackmönster
//   P3  pilens riktning i latinsk kvadrat, längd i schackmönster, spets på diagonalen
//   P4  sektorhjul: överlagring och vridning
//   P5  streck från mitten: överlagring och vridning
//
// Regeln varieras, inte bara startläget (kvalitetsregel 8): former och
// symboler per fråga, riktningar och spets i P3, och i P4 och P5 operation
// (xor 5, diff-ab 3), axel (kolumn 5, rad 3) och vridning så att ingen
// kombination (operation, axel, vridning) förekommer mer än två gånger.
//
// Id: v7e-plus-p1-NN, -p2-, -p3-, och -over- för P4 (01 till 08) och P5
// (09 till 16). En fråga som stryks i granskningen får ett nytt löpnummer,
// aldrig samma id med nytt innehåll.
// =============================================================================

export const UT = 'src/lib/logicTestV7/kandidater/expert-plus-parti-01.v7.json';

const BAS = {
  cst: ['circle', 'square', 'triangle'],
  csd: ['circle', 'square', 'diamond'],
  ctd: ['circle', 'triangle', 'diamond'],
  std: ['square', 'triangle', 'diamond'],
};
const STACK = [
  [BAS.cst, ['plus', 'minus', 'dot']],
  [BAS.csd, ['plus', 'dot', 'cross']],
  [BAS.ctd, ['minus', 'dot', 'ring']],
  [BAS.std, ['plus', 'cross', 'ring']],
  [BAS.cst, ['minus', 'cross', 'ring']],
  [BAS.csd, ['plus', 'minus', 'ring']],
  [BAS.ctd, ['dot', 'cross', 'ring']],
  [BAS.std, ['plus', 'minus', 'cross']],
];
// Tre riktningar (multipler av 45 grader), inga två motsatta.
const PIL = [[0, 2, 5], [0, 1, 3], [0, 2, 7], [1, 2, 7], [0, 3, 6], [2, 3, 5], [1, 4, 6], [3, 4, 6]];
const OVER = [
  // P4, sektorhjul
  ['P4', 'sektor', 'xor', 'kolumn', 1],
  ['P4', 'sektor', 'xor', 'kolumn', 3],
  ['P4', 'sektor', 'xor', 'kolumn', 5],
  ['P4', 'sektor', 'xor', 'rad', 7],
  ['P4', 'sektor', 'xor', 'rad', 3],
  ['P4', 'sektor', 'diff-ab', 'kolumn', 7],
  ['P4', 'sektor', 'diff-ab', 'kolumn', 1],
  ['P4', 'sektor', 'diff-ab', 'rad', 5],
  // P5, streck från mitten
  ['P5', 'ray', 'xor', 'kolumn', 7],
  ['P5', 'ray', 'xor', 'kolumn', 1],
  ['P5', 'ray', 'xor', 'kolumn', 5],
  ['P5', 'ray', 'xor', 'rad', 1],
  ['P5', 'ray', 'xor', 'rad', 5],
  ['P5', 'ray', 'diff-ab', 'kolumn', 3],
  ['P5', 'ray', 'diff-ab', 'kolumn', 5],
  ['P5', 'ray', 'diff-ab', 'rad', 3],
];

const nr = (i) => String(i + 1).padStart(2, '0');
const falt = { difficulty: 4, band: 'plus', p_prior: 0.3 };

export const PLUS = [
  ...STACK.map(([baser, symboler], i) => ({ id: `v7e-plus-p1-${nr(i)}`, familj: 'latin-flera', byggare: 'latinTrippelStack', p: { fyll: 'diagonal', baser, symboler }, mekanism: 'P1', ...falt })),
  // P2 tar formerna och symbolerna i en annan kombination än P1
  ...STACK.map(([, symboler], i) => ({ id: `v7e-plus-p2-${nr(i)}`, familj: 'latin-flera', byggare: 'latinTrippelStack', p: { fyll: 'schack', baser: STACK[(i + 3) % 8][0], symboler }, mekanism: 'P2', ...falt })),
  ...PIL.map((vinklar, i) => ({ id: `v7e-plus-p3-${nr(i)}`, familj: 'latin-flera', byggare: 'latinTrippelPil', p: { vinklar, spetsDiag: i % 2 === 0 ? 'open' : 'filled' }, mekanism: 'P3', ...falt })),
  ...OVER.map(([mekanism, format, op, axel, k], i) => ({ id: `v7e-plus-over-${nr(i)}`, familj: 'overlagring', byggare: 'overlagringVriden', p: { format, op, axel, k }, mekanism, ...falt })),
];
