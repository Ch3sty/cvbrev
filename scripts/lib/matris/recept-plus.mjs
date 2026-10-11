// scripts/lib/matris/recept-plus.mjs
// =============================================================================
// Recepten för bandet "svår plus", parti 1 (beställningen "svarare frågor",
// 1.2, med testansvarigs granskning av parti 01, 2.6): 40 frågor, 8 per
// mekanism.
//
//   P1' grundform och fyllning (ofylld, grå, svart) i ortogonala latinska
//       kvadrater, symbolen växlar mellan två i schackmönster (granskningen
//       2.1; ersätter P1 med grå diagonal, som bar en genväg)
//   P2  grundform och symbol i latinska kvadrater, fyllning i schackmönster
//   P3  pilens riktning i latinsk kvadrat, längd i schackmönster, spets på
//       diagonalen (p_prior 0,45, granskningen 2.3)
//   P4  sektorhjul: överlagring och vridning
//   P5  streck från mitten: överlagring och vridning
//
// Regeln varieras, inte bara startläget (kvalitetsregel 8): former och
// symboler per fråga, förskjutningen i P1' (minst tre av åtta åt höger),
// riktningar och spets i P3, och i P4 och P5 operation, axel och vridning.
//
// Id: v7e-plus-p1-NN, -p2-, -p3-, och -over- för P4 och P5. En fråga som
// stryks i granskningen får ett nytt löpnummer, aldrig samma id med nytt
// innehåll. Strukna i granskningen av parti 01: p1-01 till -08 (ersatta av
// p1-09 till -16) och over-01, -02, -06, -08 (ersatta av over-17 till -20
// med samma varianter).
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
// P1': två symboler ur plus, minus, prick och kryss (ring på svart botten är
// för lik prick), förskjutningen av formens kvadrat åt höger i fyra av åtta.
const P1B = [
  [BAS.cst, ['plus', 'minus'], 'hoger'],
  [BAS.csd, ['dot', 'cross'], 'vanster'],
  [BAS.ctd, ['plus', 'dot'], 'hoger'],
  [BAS.std, ['minus', 'cross'], 'vanster'],
  [BAS.cst, ['plus', 'cross'], 'vanster'],
  [BAS.csd, ['minus', 'dot'], 'hoger'],
  [BAS.ctd, ['minus', 'cross'], 'vanster'],
  [BAS.std, ['plus', 'dot'], 'hoger'],
];
// Tre riktningar (multipler av 45 grader), inga två motsatta.
const PIL = [[0, 2, 5], [0, 1, 3], [0, 2, 7], [1, 2, 7], [0, 3, 6], [2, 3, 5], [1, 4, 6], [3, 4, 6]];
const OVER = [
  // P4, sektorhjul. 01, 02, 06 och 08 ströks i granskningen och byggs om
  // som 17 till 20 med samma varianter.
  [3, 'P4', 'sektor', 'xor', 'kolumn', 5],
  [4, 'P4', 'sektor', 'xor', 'rad', 7],
  [5, 'P4', 'sektor', 'xor', 'rad', 3],
  [7, 'P4', 'sektor', 'diff-ab', 'kolumn', 1],
  [17, 'P4', 'sektor', 'xor', 'kolumn', 1],
  [18, 'P4', 'sektor', 'xor', 'kolumn', 3],
  [19, 'P4', 'sektor', 'diff-ab', 'kolumn', 7],
  [20, 'P4', 'sektor', 'diff-ab', 'rad', 5],
  // P5, streck från mitten
  [9, 'P5', 'ray', 'xor', 'kolumn', 7],
  [10, 'P5', 'ray', 'xor', 'kolumn', 1],
  [11, 'P5', 'ray', 'xor', 'kolumn', 5],
  [12, 'P5', 'ray', 'xor', 'rad', 1],
  [13, 'P5', 'ray', 'xor', 'rad', 5],
  [14, 'P5', 'ray', 'diff-ab', 'kolumn', 3],
  [15, 'P5', 'ray', 'diff-ab', 'kolumn', 5],
  [16, 'P5', 'ray', 'diff-ab', 'rad', 3],
];

const nr = (n) => String(n).padStart(2, '0');
const falt = { difficulty: 4, band: 'plus', p_prior: 0.3 };

export const PLUS = [
  ...P1B.map(([baser, symboler, forskjutning], i) => ({ id: `v7e-plus-p1-${nr(i + 9)}`, familj: 'latin-flera', byggare: 'latinTrippelStack', p: { fyll: 'latin', baser, symboler, forskjutning }, mekanism: 'P1', ...falt })),
  // P2 tar formerna och symbolerna i en annan kombination än STACK-raden
  ...STACK.map(([, symboler], i) => ({ id: `v7e-plus-p2-${nr(i + 1)}`, familj: 'latin-flera', byggare: 'latinTrippelStack', p: { fyll: 'schack', baser: STACK[(i + 3) % 8][0], symboler }, mekanism: 'P2', ...falt })),
  ...PIL.map((vinklar, i) => ({ id: `v7e-plus-p3-${nr(i + 1)}`, familj: 'latin-flera', byggare: 'latinTrippelPil', p: { vinklar, spetsDiag: i % 2 === 0 ? 'open' : 'filled' }, mekanism: 'P3', ...falt, p_prior: 0.45 })),
  ...OVER.map(([n, mekanism, format, op, axel, k]) => ({ id: `v7e-plus-over-${nr(n)}`, familj: 'overlagring', byggare: 'overlagringVriden', p: { format, op, axel, k }, mekanism, ...falt })),
];

/**
 * Mekanismer som får ha samma strukturnyckel i alla åtta frågor (2.6 punkt
 * 4 gäller från nästa parti för dem). P3 godkändes i granskningen av parti
 * 01 med vänsterförskjutning i alla åtta; nästa parti ska ha minst tre åt
 * höger.
 */
export const STRUKTUR_UNDANTAG = { P3: 'godkänd i granskningen av parti 01 (2.3), kravet gäller från parti 02' };
