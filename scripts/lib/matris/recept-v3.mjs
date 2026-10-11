// scripts/lib/matris/recept-v3.mjs
// =============================================================================
// Recepten för bank_version 3 (plan-facit-genvag 2.5, tillägget om variation
// 1.1 och 1.2): ersättarna för de 157 frågor som får pensionerad_fran: 3,
// plus volymen upp till målen 113 / 103 / 99 valbara per nivå.
//
// Kvar efter pensioneringen: grund 25, avancerad 35, expert 35. Nya här:
// grund 88, avancerad 68, expert 24 (P6, P8, en överlagring och en
// spegling) och i recept-plus.mjs parti 02 omkörningen av P1', P2 och P3
// (24). Med de 16 överlagringarna med vridning i parti 01 blir expert 99.
//
// Varje recept har:
//   recept   mallens namn (tillägget 2.1 punkt 2: ingen mall två gånger i
//            rad i passet, S8 och S10 räknas per recept)
//   p_prior  ur mallen (tillägget 1.1), aldrig per fråga för hand
//
// Mallarna (generera-v3.mjs): M1 radvis rörelse (linjär eller fri), M2 M1
// plus schackmönster eller diagonal, M3 två former i två riktningar, M4 egen
// riktning per rad, P6 M3 med en tredje regel, P8 dubbel överlagring.
// Latin-form och latin-antal växlar diag mellan 'olika' och 'konstant' så
// att bankkvoten per facitruta (S1b) håller.
//
// Avvikelser från planens tabell 2.5, skälen i docs/qa/bank-v3/ATT-GRANSKA.md:
// 2×2 i M1 och M3 och mönsterrotation med antal i latinsk kvadrat går inte
// att bygga (en fyrcykel i ett 3×3 ger alltid kopior eller speglingar, och
// antal plus vridning i samma mängd läser tolkningen inte), och P7 (strålar
// med antal, startläge och vridning i en och samma mängd) väntar på en
// tolkning av sammansatta mängder. Volymen tas av orbital, sektorhjul,
// balanslinjen och P8.
//
// Id: v7g-v3-, v7a-v3-, v7e-v3- plus familjens förkortning och löpnummer;
// plus-banden i recept-plus.mjs. Ett id som stryks i granskningen får ett
// nytt löpnummer, aldrig nytt innehåll.
// =============================================================================

const KORT = {
  vridning: 'vrid', monsterrotation: 'rot', vandring: 'vand', 'rotation-med-byte': 'byte', 'tva-rorelser': 'tva',
  'latin-antal': 'lant', 'latin-form': 'lform', 'latin-flera': 'lfler', overlagring: 'over', spegling: 'speg', 'antal-andras': 'antal',
};

// Tillåtna (d, k) för radvis rörelse på åtta lägen: facit lika ingen synlig
// ruta, och d är aldrig 3k (läsordningen). Medurs k: 1, 2, 3; moturs: 5, 6, 7.
// Ordnade så att medurs och moturs växlar (S10: ingen riktning i fler än hälften).
const DK = [[1, 1], [2, 5], [3, 3], [7, 7], [5, 2], [1, 5], [6, 3], [7, 6], [5, 1], [3, 7], [2, 1], [6, 7], [1, 2], [5, 5], [7, 3], [3, 6]];
// Längd, spets och mittpunkt växlar mellan frågorna i ett recept (S10).
const LS = (i) => ({ langd: i % 2 ? 'short' : 'long', spets: (i >> 1) % 2 ? 'open' : 'filled' });
const MP = (i) => ({ center: i % 2 ? 'open' : 'filled' });
const dk = (i) => DK[i % DK.length];
const KFRI = [1, 7, 2, 6, 3, 5];
// M4 (mittraden går åt andra hållet): facit lika ingen synlig ruta för de här.
const DK4 = [[1, 1], [2, 5], [1, 2], [3, 6], [2, 1], [5, 5], [3, 3], [6, 7]];

function lista(prefix, rader) {
  const raknare = {};
  return rader.map(([familj, byggare, p, difficulty, recept, p_prior]) => {
    raknare[familj] = (raknare[familj] ?? 0) + 1;
    return { id: `${prefix}-${KORT[familj]}-${String(raknare[familj]).padStart(2, '0')}`, familj, byggare, p: { ...p, family: familj }, difficulty, recept, p_prior, v3: true };
  });
}
const upprepa = (n, f) => Array.from({ length: n }, (_, i) => f(i));

// Balanslinjen: (d, k) per form över tre fack. Paren är inte multipler av
// varandra, så formerna går aldrig i takt (G7).
const BAL = [
  [{ d: 1, k: 1 }, { d: 1, k: 2 }], [{ d: 1, k: 2 }, { d: 2, k: 2 }], [{ d: 2, k: 1 }, { d: 1, k: 1 }], [{ d: 2, k: 2 }, { d: 2, k: 1 }],
  [{ d: 1, k: 1 }, { d: 2, k: 1 }], [{ d: 1, k: 2 }, { d: 1, k: 1 }], [{ d: 2, k: 1 }, { d: 2, k: 2 }], [{ d: 2, k: 2 }, { d: 1, k: 2 }],
];
const bal = (i, extra = {}) => ({ square: BAL[i % 8][0], circle: BAL[i % 8][1], ...extra });

// ---------------------------------------------------------------- grund (88)
export const GRUND_V3 = lista('v7g-v3', [
  ...upprepa(4, (i) => ['vridning', 'radvisRotation', { prim: 'pil', mall: 'linjar', d: dk(i)[0], k: dk(i)[1], ...LS(i) }, 1, 'M1-pil-linjar', 0.8]),
  ...upprepa(5, (i) => ['vridning', 'radvisRotation', { prim: 'pil', mall: 'fri', k: KFRI[i % 6], ...LS(i + 1) }, 2, 'M1-pil-fri', 0.72]),
  ...upprepa(3, (i) => ['vridning', 'radvisRotation', { prim: 'stralar', mall: 'linjar', d: dk(i + 4)[0], k: dk(i + 4)[1] }, 2, 'M1-stralar-linjar', 0.8]),
  ...upprepa(10, (i) => ['vridning', 'radvisRotation', { prim: 'stralar', mall: 'fri', k: KFRI[i % 6] }, 2, 'M1-stralar-fri', 0.72]),

  ...upprepa(4, (i) => ['vandring', 'radvisRotation', { prim: 'orbital', mall: 'linjar', d: dk(i + 8)[0], k: dk(i + 8)[1], ...MP(i) }, 1, 'M1-orbital-linjar', 0.8]),
  ...upprepa(9, (i) => ['vandring', 'radvisRotation', { prim: 'orbital', mall: 'fri', k: KFRI[(i + 2) % 6], ...MP(i + 1) }, 2, 'M1-orbital-fri', 0.72]),

  ...upprepa(3, (i) => ['monsterrotation', 'radvisBlock', { k: i % 2 === 0 ? 1 : 3 }, 2, 'M1-block-fri', 0.72]),
  ...upprepa(2, (i) => ['monsterrotation', 'radvisRotation', { prim: 'sektor', mall: 'linjar', d: dk(i + 12)[0], k: dk(i + 12)[1] }, 1, 'M1-sektor-linjar', 0.8]),
  ...upprepa(8, (i) => ['monsterrotation', 'radvisRotation', { prim: 'sektor', mall: 'fri', k: KFRI[(i + 1) % 6] }, 2, 'M1-sektor-fri', 0.72]),

  ...upprepa(4, (i) => ['rotation-med-byte', 'radvisRotation', { prim: 'pil', mall: 'linjar', d: dk(i + 2)[0], k: dk(i + 2)[1], andra: [{ dim: i % 2 ? 'langd' : 'spets', regel: 'schack' }], ...LS(i >> 1) }, 2, 'M2-pil-schack', 0.65]),
  ...upprepa(2, (i) => ['rotation-med-byte', 'radvisRotation', { prim: 'orbital', mall: 'linjar', d: dk(i + 6)[0], k: dk(i + 6)[1], andra: [{ dim: 'center', regel: 'schack' }] }, 2, 'M2-orbital-schack', 0.65]),

  ...upprepa(4, (i) => ['tva-rorelser', 'radvisBalans', bal(i, { sidor: i % 2 ? 'kvadrat-under' : 'kvadrat-over' }), 2, 'M3-balans', 0.62]),

  ['antal-andras', 'antalSumma', { o: 'vertical' }, 2, 'antal-summa', 0.65],
  ['antal-andras', 'antalSumma', { o: 'horizontal' }, 2, 'antal-summa', 0.65],
  ...upprepa(3, (i) => ['antal-andras', 'antalEgenRiktning', { vaxlar: true, d: i % 2 ? -1 : 1 }, 2, 'antal-egen-riktning', 0.65]),

  ['latin-form', 'latinForm', { format: 'poly-sidor', fyll: 'gray', diag: 'olika' }, 1, 'latin-form', 0.65],
  ['latin-form', 'latinForm', { format: 'poly-fyll', sidor: 6, diag: 'konstant' }, 1, 'latin-form', 0.65],
  ['latin-form', 'latinForm', { format: 'stack-bas', symbol: 'plus', baser: ['square', 'triangle', 'diamond'], diag: 'olika' }, 1, 'latin-form', 0.65],
  ['latin-form', 'latinForm', { format: 'stack-symbol', bas: 'square', symboler: ['plus', 'minus', 'dot'], diag: 'konstant' }, 1, 'latin-form', 0.65],
  ['latin-form', 'latinForm', { format: 'ring-inre', ringar: 2, diag: 'olika' }, 1, 'latin-form', 0.65],
  ['latin-form', 'latinForm', { format: 'orbital-lage', lagen: [1, 3, 6], center: 'open', diag: 'konstant' }, 2, 'latin-form', 0.65],
  ['latin-form', 'latinForm', { format: 'poly-fyll', sidor: 5, diag: 'olika' }, 1, 'latin-form', 0.65],
  ['latin-form', 'latinForm', { format: 'poly-sidor', fyll: 'black', diag: 'konstant' }, 1, 'latin-form', 0.65],
  ['latin-form', 'latinForm', { format: 'stack-bas', symbol: 'minus', baser: ['circle', 'square', 'diamond'], diag: 'konstant' }, 1, 'latin-form', 0.65],

  ['latin-antal', 'latinAntal', { format: 'tally', antal: [1, 2, 3], riktning: 'horizontal', diag: 'olika' }, 1, 'latin-antal', 0.65],
  ['latin-antal', 'latinAntal', { format: 'tally', antal: [2, 3, 4], riktning: 'vertical', diag: 'konstant' }, 1, 'latin-antal', 0.65],
  ['latin-antal', 'latinAntal', { format: 'ray', antal: [1, 2, 3], diag: 'olika' }, 1, 'latin-antal', 0.65],
  ['latin-antal', 'latinAntal', { format: 'ray', antal: [2, 3, 4], diag: 'konstant' }, 1, 'latin-antal', 0.65],
  ['latin-antal', 'latinAntal', { format: 'ring', inre: 'gray', diag: 'olika' }, 1, 'latin-antal', 0.65],
  ['latin-antal', 'latinAntal', { format: 'sektor', antal: [1, 2, 3], diag: 'konstant' }, 1, 'latin-antal', 0.65],
  ['latin-antal', 'latinAntal', { format: 'sektor', antal: [2, 3, 4], diag: 'olika' }, 2, 'latin-antal', 0.65],
  ['latin-antal', 'latinAntal', { format: 'ring', inre: 'black', diag: 'konstant' }, 1, 'latin-antal', 0.65],

  ['spegling', 'spegling', { format: 'sektor', m1: 'V', m2: 'H', axel: 'kolumn' }, 2, 'spegling', 0.65],
  ['spegling', 'spegling', { format: 'lattice', m1: 'H', m2: 'V', axel: 'rad' }, 2, 'spegling', 0.65],
  ['spegling', 'spegling', { format: 'sektor', m1: 'H', m2: 'V', axel: 'rad' }, 2, 'spegling', 0.65],
  ['overlagring', 'overlagring', { format: 'ray', op: 'union', axel: 'rad' }, 2, 'overlagring', 0.65],
  ['overlagring', 'overlagring', { format: 'sektor', op: 'union', axel: 'kolumn' }, 2, 'overlagring', 0.65],
  ['overlagring', 'overlagring', { format: 'lattice', op: 'union', axel: 'rad' }, 1, 'overlagring', 0.65],
  ['overlagring', 'overlagring', { format: 'sektor', op: 'xor', axel: 'rad' }, 2, 'overlagring', 0.65],
  ['latin-flera', 'latinFlera', { format: 'stack-fyll' }, 2, 'latin-flera', 0.62],
]);

// ---------------------------------------------------------------- avancerad (68)
export const AVANCERAD_V3 = lista('v7a-v3', [
  ...upprepa(7, (i) => ['vridning', 'radvisRotation', { prim: 'pil', mall: 'linjar', d: dk(i + 1)[0], k: dk(i + 1)[1], andra: [{ dim: i % 2 ? 'langd' : 'spets', regel: 'diagonal' }] }, 3, 'M2-pil-diagonal', 0.55]),
  ...upprepa(4, (i) => ['vridning', 'radvisRotation', { prim: 'pil', mall: 'fri', k: KFRI[(i + 3) % 6], andra: [{ dim: i % 2 ? 'spets' : 'langd', regel: 'diagonal' }] }, 3, 'M2-pil-fri-diagonal', 0.55]),
  ...upprepa(8, (i) => ['vridning', 'radvisRotation', { prim: 'pil', mall: 'linjar', vaxlar: true, d: DK4[i][0], k: DK4[i][1], andra: [{ dim: i % 2 ? 'spets' : 'langd', regel: 'diagonal' }] }, 3, 'M4-pil', 0.5]),

  ...upprepa(4, (i) => ['rotation-med-byte', 'radvisRotation', { prim: 'pil', mall: 'linjar', d: dk(i + 9)[0], k: dk(i + 9)[1], andra: [{ dim: 'langd', regel: 'schack' }, { dim: 'spets', regel: 'diagonal' }] }, 3, 'M2-pil-tre', 0.5]),
  ...upprepa(2, (i) => ['rotation-med-byte', 'radvisRotation', { prim: 'pil', mall: 'linjar', d: dk(i + 13)[0], k: dk(i + 13)[1], andra: [{ dim: 'spets', regel: 'schack' }, { dim: 'langd', regel: 'diagonal' }] }, 3, 'M2-pil-tre', 0.5]),
  ...upprepa(5, (i) => ['rotation-med-byte', 'radvisRotation', { prim: 'orbital', mall: 'linjar', d: dk(i + 3)[0], k: dk(i + 3)[1], andra: [{ dim: 'center', regel: 'schack' }] }, 3, 'M2-orbital-schack', 0.55]),

  ...upprepa(10, (i) => ['vandring', 'radvisRotation', { prim: 'orbital', mall: i % 2 ? 'fri' : 'linjar', d: dk(6 + (i >> 1))[0], k: i % 2 ? KFRI[((i >> 1) + 1) % 6] : dk(6 + (i >> 1))[1], andra: [{ dim: 'center', regel: 'diagonal' }] }, 3, 'M2-orbital-diagonal', 0.55]),
  ['vandring', 'radvis2x2', { marks: [{ typ: 'fill_black', mall: 'linjar', d: 1, k: 1 }], latin: { typ: 'dot', lagen: [0, 1, 2] } }, 3, 'M2-2x2-latin', 0.55],

  ...upprepa(5, (i) => ['monsterrotation', 'radvisBlock', { k: i % 2 === 0 ? 3 : 1, ...(i < 2 ? { antal: [3, 4][i] } : {}) }, 3, 'M1-block-fri', 0.6]),
  ...upprepa(5, (i) => ['monsterrotation', 'radvisRotation', { prim: 'sektor', mall: i < 3 ? 'linjar' : 'fri', d: dk(i + 10)[0], k: i < 3 ? dk(i + 10)[1] : KFRI[i % 6] }, 3, 'M1-sektor', 0.6]),

  ...upprepa(4, (i) => ['tva-rorelser', 'radvisBalans', bal(i, { sidor: i % 2 ? 'kvadrat-under' : 'kvadrat-over' }), 3, 'M3-balans', 0.5]),

  ['antal-andras', 'antalSumma', { o: 'horizontal' }, 2, 'antal-summa', 0.6],
  ...upprepa(2, (i) => ['antal-andras', 'antalEgenRiktning', { vaxlar: true, d: i % 2 ? 1 : -1, riktning: 'diagonal' }, 3, 'antal-egen-riktning', 0.5]),

  ['latin-form', 'latinForm', { format: 'poly-fyll', sidor: 8, diag: 'olika' }, 2, 'latin-form', 0.6],
  ['latin-form', 'latinForm', { format: 'stack-symbol', bas: 'diamond', symboler: ['plus', 'cross', 'dot'], diag: 'konstant' }, 2, 'latin-form', 0.6],
  ['latin-form', 'latinForm', { format: 'orbital-lage', lagen: [2, 5, 7], diag: 'konstant' }, 2, 'latin-form', 0.6],
  ['latin-form', 'latinForm', { format: 'orbital-lage', lagen: [0, 3, 5], center: 'open', diag: 'olika' }, 2, 'latin-form', 0.6],
  ['latin-antal', 'latinAntal', { format: 'ray', antal: [2, 3, 4], diag: 'konstant' }, 2, 'latin-antal', 0.6],
  ['spegling', 'spegling', { format: 'tile', m1: 'V', m2: 'D', axel: 'rad' }, 3, 'spegling', 0.55],
  ['overlagring', 'overlagring', { format: 'tile', op: 'diff-ab', axel: 'rad' }, 3, 'overlagring', 0.55],
  ['overlagring', 'overlagring', { format: 'ray', op: 'snitt', axel: 'rad' }, 3, 'overlagring', 0.55],
  ['overlagring', 'overlagring', { format: 'sektor', op: 'xor', axel: 'kolumn' }, 3, 'overlagring', 0.55],
  ['latin-flera', 'latinFlera', { format: 'ring' }, 3, 'latin-flera', 0.55],
]);

// ---------------------------------------------------------------- expert (24)
// P6 och P8 är band plus; en överlagring ersätter over-07 och en spegling
// fyller volymen (planen 5.5, fyllnad ur samma byggare).
const plusFalt = { difficulty: 4, band: 'plus', p_prior: 0.3 };
export const EXPERT_V3 = [
  { id: 'v7e-v3-over-01', familj: 'overlagring', byggare: 'overlagring', p: { format: 'tile', op: 'xor', axel: 'kolumn' }, difficulty: 4, recept: 'overlagring', p_prior: 0.45, v3: true },
  { id: 'v7e-v3-speg-01', familj: 'spegling', byggare: 'spegling', p: { format: 'tile', m1: 'A', m2: 'D', axel: 'rad' }, difficulty: 4, recept: 'spegling', p_prior: 0.45, v3: true },
  // P6: fyllningen i schackmönster. På diagonalen blir den en funktion av ett
  // av lägena (ett av två ortogonala lägen är konstant på diagonalen), så
  // diagonalen fälls av oberoendet. Två strukturer gånger två sidor ger fyra
  // olika utseenden (S10), därför fyra frågor.
  ...upprepa(4, (i) => ({ id: `v7e-plus-p6-${String(i + 1).padStart(2, '0')}`, familj: 'tva-rorelser', byggare: 'radvisBalans', p: bal(i, { fyll: 'schack', sidor: i < 2 ? 'kvadrat-over' : 'kvadrat-under' }), mekanism: 'P6', recept: 'P6-balans', ...plusFalt, v3: true })),
  { id: 'v7e-v3-over-02', familj: 'overlagring', byggare: 'overlagring', p: { format: 'tile', op: 'diff-ab', axel: 'rad' }, difficulty: 4, recept: 'overlagring', p_prior: 0.45, v3: true },
  { id: 'v7e-v3-over-03', familj: 'overlagring', byggare: 'overlagring', p: { format: 'sektor', op: 'xor', axel: 'kolumn' }, difficulty: 4, recept: 'overlagring', p_prior: 0.45, v3: true },
  ...upprepa(16, (i) => ({ id: `v7e-plus-p8-${String(i + 1).padStart(2, '0')}`, familj: 'overlagring', byggare: 'dubbelOverlagring', p: { format: i % 2 ? 'ray' : 'sektor' }, mekanism: 'P8', recept: i % 2 ? 'P8-stralar' : 'P8-sektor', ...plusFalt, v3: true })),
];

const K = 'src/lib/logicTestV7/kandidater';
export const V3_KANDIDATER = {
  grund: { recept: GRUND_V3, ut: `${K}/grund-v3-parti-01.v7.json` },
  avancerad: { recept: AVANCERAD_V3, ut: `${K}/avancerad-v3-parti-01.v7.json` },
  expert: { recept: EXPERT_V3, ut: `${K}/expert-v3-parti-01.v7.json` },
};
