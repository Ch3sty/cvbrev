// scripts/gen-matris-parti-04.mjs
// =============================================================================
// Matrislogik parti 04 (2026-11-19): cirka 100 nya frågor för intensiv
// träning, fördelade så att de familjer och nivåer som har minst frågor i
// dag får flest nya (docs/fragebank/matris-2026-11-19.md).
//
// Kör: node scripts/gen-matris-parti-04.mjs [--prov]
//   --prov  bygger allt och skriver bara resultatet, ingen fil
//
// Utfil: src/lib/logicTestV7/kandidater/matris-parti-04.v7.json. Appen läser
// den aldrig. Varje fråga får fran_version: 5, så att den inte blir valbar
// förrän befordran (scripts/befordra-matris-parti-04.mjs) har lagt den i de
// skarpa V3-filerna och höjt TRANINGSVERSION till 5.
//
// Byggs med byggV3 (generera.mjs), alltså spärrarna S1 till S13, kontrollen i
// kontroll.mjs och distraktorurvalet för bank_version 3. Utöver det, mot
// nästan-dubbletter (samma regelkombination och samma figurer):
//   - inget rutnät som redan finns i någon bank eller kandidatfil;
//   - S10-utseendet (utseendeNyckel: regler, parametrar, mönster och värden)
//     jämförs med VARJE befintlig fråga i samma familj, alla nivåer och
//     recept, inte bara receptet;
//   - spärren mot delade rader räknas mot varje befintlig fråga i familjen;
//   - efterkontrollen per recept (S8, S10 med riktning och fasta drag,
//     delade rader) körs efter varje ny fråga, och en fråga som bryter den
//     tas tillbaka;
//   - på expert ska reglerna vara oberoende (oberoende() i kontroll.mjs, som
//     för plus-bandet), annars tas frågan tillbaka.
//
// Celler (nivå, familj, mål) med kandidatrecept som prövas i ordning tills
// målet är nått. Varje kandidat har en egen slump (seed) som inte beror på
// id:t, och id delas ut i byggordning: v7g-b5-, v7a-b5-, v7e-b5- plus
// familjens förkortning och löpnummer (b5 = bankversion 5).
// Deterministiskt: samma recept och samma banker ger samma fil.
// =============================================================================

import { writeFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { byggV3, key } from './lib/matris/generera.mjs';
import { strukturFelV3, utseendeFel, utseendeNyckel } from './lib/matris/sparrar.mjs';
import { ALLA_BANKFILER, las, valbarI } from './lib/matris/version.mjs';
import { oberoende } from './lib/matris/kontroll.mjs';

const K = 'src/lib/logicTestV7/kandidater';
export const UT = `${K}/matris-parti-04.v7.json`;
const PROV = process.argv.includes('--prov');
const FRAN = 5;
const LOGG = process.argv.includes('--logg');
// Försök per kandidat (byggV3 har 300 som standard). En kandidat som inte
// går att bygga ersätts av nästa i cellen, så färre räcker.
const FORSOK = 120;
// --cell=e:vridning bygger bara en cell (för att pröva recept; skriver ingen fil).
const CELL = process.argv.find((a) => a.startsWith('--cell='))?.slice(7) ?? null;

const KORT = {
  vridning: 'vrid', monsterrotation: 'rot', vandring: 'vand', 'rotation-med-byte': 'byte', 'tva-rorelser': 'tva',
  'latin-antal': 'lant', 'latin-form': 'lform', 'latin-flera': 'lfler', overlagring: 'over', spegling: 'speg', 'antal-andras': 'antal',
};
// Svårighet och p_prior per nivå, inom spannet i validate-v7-questions.mjs.
const NIVA = { g: { d: 2, p: 0.65 }, a: { d: 3, p: 0.55 }, e: { d: 4, p: 0.45 } };
const upprepa = (n, f) => Array.from({ length: n }, (_, i) => f(i));

// Steg som i recept-v3.mjs: (d, k) på åtta lägen, medurs och moturs växlar.
const DK = [[1, 1], [2, 5], [3, 3], [7, 7], [5, 2], [1, 5], [6, 3], [7, 6], [5, 1], [3, 7], [2, 1], [6, 7], [1, 2], [5, 5], [7, 3], [3, 6]];
const dk = (i) => DK[i % DK.length];
const KFRI = [1, 7, 2, 6, 3, 5];
const DK4 = [[1, 1], [2, 5], [1, 2], [3, 6], [2, 1], [5, 5], [3, 3], [6, 7]];
const BAL = [
  [{ d: 1, k: 1 }, { d: 1, k: 2 }], [{ d: 1, k: 2 }, { d: 2, k: 2 }], [{ d: 2, k: 1 }, { d: 1, k: 1 }], [{ d: 2, k: 2 }, { d: 2, k: 1 }],
  [{ d: 1, k: 1 }, { d: 2, k: 1 }], [{ d: 1, k: 2 }, { d: 1, k: 1 }], [{ d: 2, k: 1 }, { d: 2, k: 2 }], [{ d: 2, k: 2 }, { d: 1, k: 2 }],
];
const bal = (i, extra = {}) => ({ square: BAL[i % 8][0], circle: BAL[i % 8][1], ...extra });

// Kandidat: [byggare, p, recept, (difficulty), (p_prior)].
const SPEG = (format, par) => par.map(([m1, m2, axel]) => ['spegling', { format, m1, m2, axel }, 'spegling']);
const PAR_TILE = [['V', 'A', 'kolumn'], ['A', 'H', 'rad'], ['D', 'H', 'kolumn'], ['A', 'V', 'rad'], ['H', 'D', 'rad'], ['V', 'D', 'kolumn'], ['D', 'A', 'rad'], ['A', 'D', 'kolumn'], ['H', 'V', 'kolumn'], ['V', 'H', 'rad']];
const PAR_HV = [['V', 'H', 'kolumn'], ['H', 'V', 'kolumn'], ['V', 'H', 'rad'], ['H', 'V', 'rad']];
const OVER = (ops) => ops.map(([format, op, axel]) => ['overlagring', { format, op, axel }, 'overlagring']);
const LFORM = [
  { format: 'poly-fyll', sidor: 7, diag: 'olika' }, { format: 'poly-fyll', sidor: 4, diag: 'konstant' }, { format: 'poly-fyll', sidor: 3, diag: 'olika' },
  { format: 'poly-sidor', fyll: 'none', diag: 'olika' }, { format: 'poly-sidor', fyll: 'gray', diag: 'konstant' },
  { format: 'stack-symbol', bas: 'triangle', symboler: ['plus', 'cross', 'ring'], diag: 'konstant' }, { format: 'stack-symbol', bas: 'circle', symboler: ['plus', 'cross', 'dot'], diag: 'olika' },
  { format: 'stack-symbol', bas: 'diamond', symboler: ['minus', 'ring', 'dot'], diag: 'olika' }, { format: 'stack-symbol', bas: 'square', symboler: ['cross', 'ring', 'minus'], diag: 'konstant' },
  { format: 'stack-bas', symbol: 'cross', baser: ['circle', 'triangle', 'diamond'], diag: 'olika' }, { format: 'stack-bas', symbol: 'ring', baser: ['square', 'triangle', 'diamond'], diag: 'konstant' },
  { format: 'stack-bas', symbol: 'dot', baser: ['circle', 'square', 'triangle'], diag: 'olika' },
  { format: 'orbital-lage', lagen: [1, 4, 6], center: 'open', diag: 'olika' }, { format: 'orbital-lage', lagen: [0, 2, 5], diag: 'konstant' }, { format: 'orbital-lage', lagen: [3, 4, 7], center: 'open', diag: 'konstant' },
  { format: 'lattice-lage', lagen: [0, 1, 3], typ: 'fill_gray', diag: 'konstant' }, { format: 'lattice-lage', lagen: [0, 2, 3], typ: 'dot', diag: 'olika' }, { format: 'lattice-lage', lagen: [1, 2, 3], typ: 'fill_black', diag: 'olika' },
  { format: 'ring-inre', ringar: 3, diag: 'olika' }, { format: 'ring-inre', ringar: 2, diag: 'konstant' },
].map((p) => ['latinForm', p, 'latin-form']);
const LANTAL = [
  { format: 'sektor', antal: [2, 3, 4], diag: 'olika' }, { format: 'ray', antal: [1, 2, 4], diag: 'konstant' }, { format: 'ring', inre: 'gray', diag: 'konstant' },
  { format: 'tally', antal: [1, 3, 4], riktning: 'horizontal', diag: 'olika' }, { format: 'sektor', antal: [1, 2, 4], diag: 'olika' }, { format: 'tally', antal: [2, 3, 4], riktning: 'horizontal', diag: 'olika' },
  { format: 'ring', inre: 'black', diag: 'olika' }, { format: 'ray', antal: [1, 3, 4], diag: 'olika' }, { format: 'tally', antal: [1, 2, 4], riktning: 'vertical', diag: 'olika' },
  { format: 'sektor', antal: [1, 3, 4], diag: 'konstant' }, { format: 'ray', antal: [1, 2, 3], diag: 'konstant' }, { format: 'tally', antal: [1, 2, 3], riktning: 'vertical', diag: 'konstant' },
  { format: 'ring', inre: 'none', diag: 'olika' }, { format: 'sektor', antal: [1, 2, 3], diag: 'olika' }, { format: 'ray', antal: [2, 3, 4], diag: 'olika' },
].map((p) => ['latinAntal', p, 'latin-antal']);
const LFLERA = [
  { format: 'stack', symboler: ['plus', 'cross', 'ring'] }, { format: 'poly' }, { format: 'stack', symboler: ['minus', 'ring', 'dot'] }, { format: 'stack-fyll' }, { format: 'ring' },
  { format: 'stack', symboler: ['plus', 'minus', 'dot'] }, { format: 'stack', symboler: ['cross', 'dot', 'ring'] },
].map((p) => ['latinFlera', p, 'latin-flera']);
const diag = (dim) => [{ dim, regel: 'diagonal' }];

// [nivå, familj, mål, kandidater]
// En latinsk kvadrat med en egenskap har svårighet 2 och p_prior 0,6 på
// avancerad, som bankens latin-form där.
// Målen är det som gick att bygga utan nästan-dubbletter. Där målet är lägre
// än behovet (latinska kvadrater med antal, antal som ändras, två rörelser)
// är familjens mallar uttömda: varje kandidat ger samma utseende som en
// befintlig fråga, delar rader med en, eller klarar inte distraktorspärrarna.
// Kandidaterna står kvar så att det går att se vad som prövats.
const OMGANG1 = [
  // ------------------------------------------------------------ expert
  ['e', 'vridning', 9, [
    ...upprepa(8, (i) => ['radvisRotation', { prim: 'pil', mall: 'linjar', vaxlar: true, d: DK4[(i + 2) % 8][0], k: DK4[(i + 2) % 8][1], andra: diag(i % 2 ? 'langd' : 'spets') }, 'E-M4-pil']),
    ...upprepa(6, (i) => ['radvisRotation', { prim: 'pil', mall: 'fri', k: KFRI[(i + 4) % 6], andra: diag(i % 2 ? 'spets' : 'langd') }, 'E-M2-pil-fri']),
  ]],
  ['e', 'rotation-med-byte', 8, upprepa(18, (i) => ['radvisRotation', { prim: 'pil', mall: 'fri', k: KFRI[(i + 2) % 6], andra: [{ dim: i % 2 ? 'langd' : 'spets', regel: 'schack' }, { dim: i % 2 ? 'spets' : 'langd', regel: 'diagonal' }] }, 'E-M2-pil-fri-tre'])],
  ['e', 'vandring', 9, [
    ...upprepa(8, (i) => ['radvisRotation', { prim: 'orbital', mall: 'linjar', vaxlar: true, d: DK4[(i + 1) % 8][0], k: DK4[(i + 1) % 8][1], andra: diag('center') }, 'E-M4-orbital']),
    ...upprepa(12, (i) => ['radvisRotation', { prim: 'orbital', mall: 'fri', k: KFRI[(i + 1) % 6], andra: diag('center') }, 'E-M2-orbital-fri']),
  ]],
  // Mönsterrotation på expert går inte med dagens spärrar: sektorhjul och
  // block har ingen andra egenskap, så facit följer alltid av rad 3 ensam
  // (S4, fel på expert). Målet är 0; recepten står kvar som dokumentation.
  ['e', 'monsterrotation', 0, [
    ...upprepa(4, (i) => ['radvisRotation', { prim: 'sektor', mall: 'fri', vaxlar: true, k: KFRI[i % 6] }, 'E-M4-sektor']),
    ...upprepa(3, (i) => ['radvisBlock', { k: i % 2 ? 3 : 1, antal: [4, 5, 3][i] }, 'E-M1-block']),
  ]],
  ['e', 'antal-andras', 5, [
    ...upprepa(4, (i) => ['antalEgenRiktning', { vaxlar: true, d: i % 2 ? -1 : 1, riktning: 'diagonal' }, 'antal-egen-riktning']),
    ...upprepa(2, () => ['antalSumma', { radRiktning: true }, 'antal-summa-radvis']),
    ...upprepa(2, (i) => ['antalEgenRiktning', { vaxlar: false, d: i % 2 ? -1 : 1, riktning: 'diagonal' }, 'antal-egen-riktning']),
  ]],
  // En latinsk kvadrat med en enda egenskap är en grundfråga, inte expert
  // (okulär granskning 2026-11-19): expert får inga nya här.
  ['e', 'latin-form', 0, LFORM],
  ['e', 'latin-antal', 0, LANTAL],
  ['e', 'tva-rorelser', 0, [
    ...upprepa(8, (i) => ['radvisBalans', bal(i + 4, { fyll: 'diagonal', sidor: i % 2 ? 'kvadrat-over' : 'kvadrat-under' }), 'E-balans-diagonal']),
    ...upprepa(8, (i) => ['radvisBalans', bal(i + 4, { fyll: 'schack', sidor: i % 2 ? 'kvadrat-over' : 'kvadrat-under' }), 'P6-balans']),
    ...upprepa(8, (i) => ['radvisBalans', bal(i, { sida: 'schack', sidor: i % 2 ? 'kvadrat-over' : 'kvadrat-under' }), 'M3-balans-sida']),
  ]],
  ['e', 'spegling', 5, [...SPEG('tile', PAR_TILE), ...SPEG('lattice', PAR_HV), ...SPEG('sektor', PAR_HV)]],

  // ------------------------------------------------------------ avancerad
  ['a', 'antal-andras', 2, [
    ...upprepa(4, (i) => ['antalEgenRiktning', { vaxlar: true, d: i % 2 ? -1 : 1, riktning: 'diagonal' }, 'antal-egen-riktning']),
    ...upprepa(2, () => ['antalSumma', { radRiktning: true }, 'antal-summa-radvis']),
    ...upprepa(2, (i) => ['antalEgenRiktning', { vaxlar: false, d: i % 2 ? -1 : 1, riktning: 'diagonal' }, 'antal-egen-riktning']),
  ]],
  ['a', 'rotation-med-byte', 7, [
    ...upprepa(5, (i) => ['radvisRotation', { prim: 'orbital', mall: 'fri', k: KFRI[(i + 4) % 6], andra: [{ dim: 'center', regel: 'schack' }] }, 'M2-orbital-fri-schack']),
    ...upprepa(4, (i) => ['radvisRotation', { prim: 'pil', mall: 'fri', k: KFRI[(i + 1) % 6], andra: [{ dim: 'langd', regel: 'schack' }, { dim: 'spets', regel: 'diagonal' }] }, 'M2-pil-fri-tre']),
  ]],
  ['a', 'tva-rorelser', 4, upprepa(8, (i) => ['radvisBalans', bal(i, { fyll: 'diagonal', sidor: i % 2 ? 'kvadrat-over' : 'kvadrat-under' }), 'M3-balans-fyll'])],
  ['a', 'latin-antal', 3, LANTAL.map((x) => [...x, 2, 0.6])],
  ['a', 'latin-form', 5, LFORM.map((x) => [...x, 2, 0.6])],
  ['a', 'monsterrotation', 5, [
    ...upprepa(6, (i) => ['radvisRotation', { prim: 'sektor', mall: i % 2 ? 'fri' : 'linjar', d: dk(i + 3)[0], k: i % 2 ? KFRI[(i + 2) % 6] : dk(i + 3)[1] }, 'M1-sektor']),
    ...upprepa(4, (i) => ['radvisBlock', { k: i % 2 ? 1 : 3, antal: [5, 2, 4, 3][i] }, 'M1-block-fri']),
    ...upprepa(3, (i) => ['radvisRotation', { prim: 'sektor', mall: 'fri', k: [1, 2, 3][i] }, 'M1-sektor']),
  ]],
  ['a', 'spegling', 4, [...SPEG('tile', PAR_TILE), ...SPEG('lattice', PAR_HV), ...SPEG('sektor', PAR_HV)]],
  ['a', 'vandring', 4, upprepa(10, (i) => ['radvisRotation', { prim: 'orbital', mall: i % 2 ? 'linjar' : 'fri', d: dk(i + 11)[0], k: i % 2 ? dk(i + 11)[1] : KFRI[(i + 3) % 6], andra: diag('center') }, 'M2-orbital-diagonal'])],
  ['a', 'latin-flera', 2, LFLERA],

  // ------------------------------------------------------------ grund
  ['g', 'antal-andras', 0, [
    ...upprepa(3, (i) => ['antalEgenRiktning', { vaxlar: false, d: i % 2 ? -1 : 1, riktning: 'diagonal' }, 'antal-egen-riktning']),
    ...upprepa(3, (i) => ['antalEgenRiktning', { vaxlar: true, d: i % 2 ? 1 : -1, riktning: 'diagonal' }, 'antal-egen-riktning']),
    ...upprepa(2, (i) => ['antalSumma', { o: i % 2 ? 'vertical' : 'horizontal' }, 'antal-summa']),
    ...[['tally', 'upp', true], ['ray', 'ner'], ['sektor', 'upp'], ['tally', 'ner', true], ['ray', 'upp'], ['sektor', 'ner']].map(([format, riktning, vaxlar]) => ['antalSekvens', { format, riktning, vaxlar }, 'antal-sekvens']),
  ]],
  ['g', 'rotation-med-byte', 7, [
    ...upprepa(3, (i) => ['radvisRotation', { prim: 'orbital', mall: 'fri', k: KFRI[(i + 3) % 6], andra: [{ dim: 'center', regel: 'schack' }] }, 'M2-orbital-schack']),
    ...upprepa(4, (i) => ['radvisRotation', { prim: 'pil', mall: 'fri', k: KFRI[(i + 1) % 6], andra: [{ dim: i % 2 ? 'spets' : 'langd', regel: 'schack' }] }, 'M2-pil-schack']),
    ...upprepa(3, (i) => ['radvisRotation', { prim: 'orbital', mall: 'linjar', d: dk(i + 9)[0], k: dk(i + 9)[1], andra: [{ dim: 'center', regel: 'schack' }] }, 'M2-orbital-schack']),
  ]],
  // Två rörelser på grund: balanslinjens åtta stegpar finns redan i familjen
  // (S10), och två markeringar i 2×2 ger alltid facit lika en synlig ruta.
  ['g', 'tva-rorelser', 0, [
    // Pricken räknas från den svarta rutan (fran) med udda förskjutning, och
    // skillnaden i steg är två åt båda hållen: de hamnar aldrig i samma ruta.
    ...[[1, 1, 3, 3, 1], [1, 3, 3, 1, 3], [2, 1, 0, 3, 1], [3, 1, 1, 3, 3], [0, 1, 2, 3, 1], [3, 3, 1, 1, 1], [1, 1, 3, 3, 3], [2, 3, 0, 1, 3]].map(([dA, kA, dB, kB, o]) => ['radvis2x2', { titel: 'Två rutor flyttar radvis', marks: [{ typ: 'fill_black', mall: 'linjar', d: dA, k: kA }, { typ: 'dot', mall: 'linjar', fran: 'fill_black', o, d: dB, k: kB }] }, 'M3-2x2']),
  ]],
  ['g', 'monsterrotation', 4, [
    ...upprepa(4, (i) => ['radvisBlock', { k: i % 2 ? 1 : 3 }, 'M1-block-fri']),
    ...upprepa(4, (i) => ['radvisRotation', { prim: 'sektor', mall: 'linjar', d: dk(i + 5)[0], k: dk(i + 5)[1] }, 'M1-sektor-linjar', 1, 0.8]),
  ]],
  ['g', 'spegling', 5, [...SPEG('lattice', PAR_HV), ...SPEG('sektor', PAR_HV), ...SPEG('tile', PAR_TILE)]],
  ['g', 'overlagring', 5, OVER([['ray', 'union', 'kolumn'], ['lattice', 'xor', 'rad'], ['tile', 'union', 'kolumn'], ['sektor', 'union', 'rad'], ['lattice', 'union', 'kolumn'], ['ray', 'xor', 'kolumn'], ['tile', 'union', 'rad']])],
  ['g', 'latin-antal', 0, LANTAL.map((x) => [...x, 1])],
  ['g', 'latin-form', 3, LFORM.map((x) => [...x, 1])],
  ['g', 'latin-flera', 1, LFLERA],
  ['g', 'vandring', 3, upprepa(8, (i) => ['radvisRotation', { prim: 'orbital', mall: 'linjar', d: dk(i + 12)[0], k: dk(i + 12)[1], center: i % 2 ? 'filled' : 'open' }, 'M1-orbital-linjar', 1, 0.8])],
];

// ---------------------------------------------------------------- omgång 2
// Testansvarigs granskning (docs/fragebank/matris-2026-11-19-granskning.md,
// beslutet i docs/qa/matris-parti-04/beslut.json): 75 godkända låses som de
// är, 25 ströks. Ersättarna får nya löpnummer och en egen slump
// (parti04b), så att ingen struken fråga byggs igen.
//   - grund spegling: bara vågrät och lodrät på sektorhjul och 2×2;
//   - avancerad antal: en annan regel än v7a-b5-antal-01 (spärren mot samma
//     regeltext på nivån sköter det);
//   - expert vridning och vandring: raderna växlar riktning och steget är
//     135 grader, plus en egenskap på diagonalen; expertens
//     rotation-med-byte: växlande riktning, 135 grader och tre oberoende
//     regler. Recepten heter som avancerads när mallen är densamma (M4-pil),
//     så att passets exponeringsregel räknar dem ihop;
//   - expert antal-andras och spegling får inga nya (ingen mall som
//     avancerad inte redan har).
// Hellre färre än för lätta: målen är tak.
const M4_135 = [[1, 3], [2, 5], [3, 5], [5, 3], [6, 3], [7, 5], [1, 5], [2, 3], [3, 3], [5, 5], [6, 5], [7, 3]];
const OMGANG2 = [
  ['g', 'spegling', 1, [...SPEG('sektor', PAR_HV), ...SPEG('lattice', PAR_HV)]],
  ['a', 'antal-andras', 1, [
    ...upprepa(10, () => ['antalSumma', { radRiktning: true }, 'antal-summa-radvis']),
    ...upprepa(8, (i) => ['antalEgenRiktning', { vaxlar: i < 4, d: i % 2 ? -1 : 1, riktning: 'diagonal' }, 'antal-egen-riktning']),
    ...upprepa(4, (i) => ['antalEgenRiktning', { vaxlar: true, d: i % 2 ? -1 : 1, riktning: 'rad' }, 'antal-egen-riktning']),
  ]],
  // Omgranskningen: växlande riktning med 135 grader är avancerads M4-pil
  // (v7a-v3-vrid-31 till -38). Expert får ingen vridning i partiet.
  ['e', 'vridning', 0, [...M4_135, ...M4_135].map(([d, k], i) => ['radvisRotation', { prim: 'pil', mall: 'linjar', vaxlar: true, d, k, andra: diag(i % 2 ? 'langd' : 'spets') }, 'M4-pil'])],
  ['e', 'vandring', 6, [...M4_135, ...M4_135].map(([d, k]) => ['radvisRotation', { prim: 'orbital', mall: 'linjar', vaxlar: true, d, k, andra: diag('center') }, 'E-M4-orbital'])],
  ['e', 'rotation-med-byte', 2, M4_135.map(([d, k], i) => ['radvisRotation', { prim: 'pil', mall: 'linjar', vaxlar: true, d, k, andra: [{ dim: i % 2 ? 'langd' : 'spets', regel: 'schack' }, { dim: i % 2 ? 'spets' : 'langd', regel: 'diagonal' }] }, 'E-M4-pil-tre'])],
];
// Recept som byter namn i omgång 2 (granskningen punkt 10): samma mall som avancerads.
const NYTT_RECEPTNAMN = { 'E-M4-pil': 'M4-pil' };


// ---------------------------------------------------------------- befintliga
const filer = [...ALLA_BANKFILER, ...(existsSync(K) ? readdirSync(K).filter((f) => f.endsWith('.json')).map((f) => path.posix.join(K, f)) : [])]
  .filter((f) => path.resolve(f) !== path.resolve(UT));
const upptagna = new Set();
const befintliga = new Map();
// Partiets egna frågor (-b5-) räknas inte som befintliga när de väl är befordrade,
// så att generatorn ger samma fil före och efter befordran.
for (const f of filer) for (const q of las(f)) { if (/^v7[gae]-b5-/.test(q.id)) continue; upptagna.add(key(q.grid)); if (!q.pensionerad && !befintliga.has(q.id)) befintliga.set(q.id, q); }

// Utseendet och raderna per FAMILJ. byggV3 slår upp per receptnamn, så varje
// recept i en familj får samma mängd och samma lista.
const utsePerFamilj = new Map();
const kvarPerFamilj = new Map();
const familjSet = (f) => { if (!utsePerFamilj.has(f)) { utsePerFamilj.set(f, new Set()); kvarPerFamilj.set(f, []); } };
for (const q of befintliga.values()) {
  familjSet(q.family);
  const u = (() => { try { return utseendeNyckel(q); } catch { return null; } })();
  if (u) utsePerFamilj.get(q.family).add(u);
  kvarPerFamilj.get(q.family).push(q);
}
const utseenden = new Map();
const kvar = new Map();
const receptFamilj = new Map();
for (const [, familj, , kand] of [...OMGANG1, ...OMGANG2]) for (const [, , recept] of kand) {
  if (receptFamilj.has(recept) && receptFamilj.get(recept) !== familj) throw new Error(`recept ${recept} i två familjer`);
  receptFamilj.set(recept, familj);
  familjSet(familj);
  utseenden.set(recept, utsePerFamilj.get(familj));
  kvar.set(recept, kvarPerFamilj.get(familj));
}
const receptFor = (q) => q.recept ?? q.mekanism ?? q.family;
// Befintliga frågor i samma recept (fran_version 3 och senare) för efterkontrollen.
const sammaRecept = (r) => [...befintliga.values()].filter((q) => receptFor(q) === r && (q.fran_version ?? 1) >= 3);
const godkanda = new Set([...befintliga.keys()]);

// ---------------------------------------------------------------- bygg
// Cellerna byggs i ordning efter hur många valbara frågor de har i dag
// (TRANINGSVERSION 4), färst först: där familjen delar mallar mellan
// nivåerna (balanslinjen, latinska kvadrater, antal) får den tunnaste
// nivån de mallar som finns kvar.
const idag = (n, familj) => [...befintliga.values()].filter((q) => q.family === familj && q.id.startsWith(`v7${n}-`) && valbarI(q, 4)).length;
// Samma regeltext två gånger på samma nivå och i samma familj är samma fråga
// med annat startläge (granskningen punkt 4 och 11): nya frågor får inte det.
// Omgranskningen: jämför utan meningar om en egenskap som är lika i alla
// rutor ("Pilen är kort hela vägen", "Strecken står alltid upprätt"), och
// mot alla nivåer i familjen, inte bara den egna.
const utanKonstant = (t) => String(t ?? '').split(/(?<=.)s+/).filter((m) => !/hela vägen|alltid/.test(m)).join(' ');
const regelNyckel = (q) => `${q.family}|${utanKonstant(q.rule)}`;
const regler = new Set([...befintliga.values()].map(regelNyckel));
const OGILTIG_TEXT = /\b(undefined|null|NaN)\b|\[object Object\]/;
const start = Date.now();
const rapport = [];
const raknare = {};

// lasta: omgång 1 med beslutet, då byggs allt som första gången (inga nya
// spärrar), så att de godkända blir exakt de granskade.
function byggCeller(celler, seedPrefix, ut, { lasta = null } = {}) {
  const ORDNING = celler.map((c, i) => ({ c, i, antal: idag(c[0], c[1]) })).sort((a, b) => a.antal - b.antal || a.i - b.i).map((x) => x.c);
  for (const [n, familj, mal, kandidater] of ORDNING) {
    if (CELL && CELL !== `${n}:${familj}`) continue;
    let fatt = 0;
    const skal = new Map();
    for (let ci = 0; ci < kandidater.length && fatt < mal; ci++) {
      const [byggare, p, recept, difficulty, p_prior] = kandidater[ci];
      const pre = `v7${n}-b5-${KORT[familj]}`;
      const nr = (raknare[pre] ?? 0) + 1;
      const rc = {
        id: `${pre}-${String(nr).padStart(2, '0')}`, seed: `${seedPrefix}:${n}:${familj}:${ci}`,
        familj, byggare, p: { ...p, family: familj }, difficulty: difficulty ?? NIVA[n].d, recept,
        p_prior: p_prior ?? NIVA[n].p, fran_version: FRAN, v3: true, forsok: FORSOK,
      };
      let q;
      const t0 = Date.now();
      try { q = byggV3(rc, upptagna, { utseenden, kvar }); }
      catch (e) {
        const s = e.message.split('\n')[1]?.trim() ?? e.message; skal.set(s, (skal.get(s) ?? 0) + 1);
        if (LOGG) console.error(`  ${n} ${familj} #${ci} ✗ ${((Date.now() - t0) / 1000).toFixed(1)} s ${s.slice(0, 90)}`);
        continue;
      }
      if (LOGG) console.error(`  ${n} ${familj} #${ci} ✓ ${((Date.now() - t0) / 1000).toFixed(1)} s`);
      // Expert: reglerna ska vara oberoende över rutnätet (som för plus-bandet),
      // annars går en egenskap att läsa av ur en annan, och frågan blir lättare.
      const ob = n === 'e' ? oberoende(q) : [];
      // Bara fel som den nya frågan för in räknas (S10-taket räknas om med den).
      const fore = [...sammaRecept(recept), ...ut.filter((x) => x.recept === recept)];
      const kontroll = (g) => [...strukturFelV3(g), ...utseendeFel(g, { godkanda })].map((x) => x.replace(/i \d+ av \d+ frågor, högst \d+/, 'över taket'));
      const innan = new Set(kontroll(fore));
      const fel = [
        ...ob.map((x) => `oberoende: ${x}`),
        ...(!lasta && regler.has(regelNyckel(q)) ? ['samma regeltext (utan konstanta egenskaper) som en annan fråga i familjen'] : []),
        ...(!lasta ? [q.title, q.rule, ...(q.misstag ?? [])].filter((t) => OGILTIG_TEXT.test(t ?? '')).map((t) => `ogiltig text: ${t}`) : []),
        ...kontroll([...fore, q]).filter((x) => !innan.has(x)),
      ];
      if (fel.length) {
        upptagna.delete(key(q.grid));
        utseenden.get(recept).delete(utseendeNyckel(q));
        const l = kvar.get(recept); l.splice(l.indexOf(q), 1);
        skal.set(`efterkontroll: ${fel[0]}`, (skal.get(`efterkontroll: ${fel[0]}`) ?? 0) + 1);
        continue;
      }
      raknare[pre] = nr;
      regler.add(regelNyckel(q));
      ut.push(q);
      fatt++;
    }
    rapport.push({ n, familj, mal, fatt, skal });
  }
}

// Omgång 1, exakt som när partiet byggdes första gången. Den ger de 100
// frågorna; med beslutet behålls de godkända, och de strukna försvinner men
// deras id och rutnät förblir upptagna.
const BESLUT = 'docs/qa/matris-parti-04/beslut.json';
const beslut = existsSync(BESLUT) ? las(BESLUT) : null;
const omg1 = [];
byggCeller(OMGANG1, 'parti04', omg1, { lasta: beslut ? new Set(beslut.godkanda) : null });
const ut = beslut ? omg1.filter((q) => beslut.godkanda.includes(q.id)) : omg1;
if (beslut && !CELL) {
  // Att alla godkända finns med kontrolleras efter omgång 2.
  // De låsta ska vara oförändrade i rutnät och alternativ mot filen som granskades.
  const granskad = new Map((existsSync(UT) ? las(UT) : []).map((q) => [q.id, q]));
  for (const q of ut) {
    const g = granskad.get(q.id);
    if (g && (key(g.grid) !== key(q.grid) || key(g.options) !== key(q.options) || g.correctAnswer !== q.correctAnswer)) throw new Error(`${q.id}: rutnät eller alternativ har ändrats sedan granskningen`);
  }
}
if (beslut) {
  // Receptnamn som avancerads (punkt 10). Ändrar inte rutnät eller alternativ.
  for (const q of ut) if (NYTT_RECEPTNAMN[q.recept]) q.recept = NYTT_RECEPTNAMN[q.recept];
  for (const k of Object.keys(NYTT_RECEPTNAMN)) { utseenden.set(NYTT_RECEPTNAMN[k], utseenden.get(k)); kvar.set(NYTT_RECEPTNAMN[k], kvar.get(k)); }
  // De strukna räknas inte i regeltexterna: en ersättare får ha en regel som en struken hade.
  regler.clear();
  for (const q of [...befintliga.values(), ...ut]) regler.add(regelNyckel(q));
  rapport.length = 0;
  byggCeller(OMGANG2, 'parti04b', ut);
  // Efter omgranskningen: bara beslutets godkända går vidare, och varje
  // godkänd ur omgång 2 ska vara byggd exakt som den granskades.
  const granskad = new Map((existsSync(UT) ? las(UT) : []).map((q) => [q.id, q]));
  const ok = new Set(beslut.godkanda);
  for (const q of ut.filter((x) => ok.has(x.id))) {
    const g = granskad.get(q.id);
    if (!CELL && g && key(g) !== key(q)) throw new Error(`${q.id}: har ändrats sedan granskningen`);
  }
  ut.splice(0, ut.length, ...ut.filter((q) => ok.has(q.id)));
  if (!CELL && ut.length !== ok.size) throw new Error(`${ok.size - ut.length} godkända byggdes inte: ${[...ok].filter((id) => !ut.some((q) => q.id === id)).join(', ')}`);
}
// Slutkontroll över hela partiet per recept.
const allaRecept = new Set(ut.map((q) => q.recept));
// Fel som redan finns mellan granskade frågor (före partiet) räknas inte.
const slut = [...allaRecept].flatMap((r) => {
  const fore = sammaRecept(r);
  const innan = new Set([...strukturFelV3(fore), ...utseendeFel(fore, { godkanda })]);
  const grupp = [...fore, ...ut.filter((q) => q.recept === r)];
  return [...strukturFelV3(grupp), ...utseendeFel(grupp, { godkanda })].filter((x) => !innan.has(x));
});

const NAMN = { g: 'grund', a: 'avancerad', e: 'expert' };
console.log(`${slut.length ? '✗' : '✓'} ${ut.length} frågor på ${((Date.now() - start) / 1000).toFixed(1)} s`);
for (const x of rapport) {
  console.log(`  ${x.fatt === x.mal ? ' ' : '!'} ${NAMN[x.n].padEnd(9)} ${x.familj.padEnd(18)} ${x.fatt}/${x.mal}`);
  if (x.fatt < x.mal) for (const [s, c] of x.skal) console.log(`      ${c} × ${s.slice(0, 160)}`);
}
if (slut.length) { console.log('  Slutkontrollen:'); slut.forEach((x) => console.log('  - ' + x)); }
if (!PROV && !CELL) {
  writeFileSync(UT, JSON.stringify(ut, null, 2) + '\n');
  console.log(`Skrev ${UT}`);
}
process.exit(slut.length ? 1 : 0);
