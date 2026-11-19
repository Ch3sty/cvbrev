// scripts/gen-matris-parti-05.mjs
// =============================================================================
// Matrislogik parti 05 (2026-11-19, omgång 2 av dagen): cirka 100 nya frågor,
// ungefär en tredjedel per nivå (docs/fragebank/matris-2026-11-19-omg2.md).
// Samma arbetssätt som parti 04 (scripts/gen-matris-parti-04.mjs), med
// lärdomarna ur båda granskningarna av parti 04
// (docs/fragebank/matris-2026-11-19-granskning.md):
//   - ingen text med undefined, null, NaN eller [object Object];
//   - expert får bara mallar som avancerad inte har: kolumnvis rörelse med
//     växlande riktning (finns inte i någon bank), tre eller fyra oberoende
//     regler, och plus-bandets mekanismer (P1, P2, P4, P5);
//   - ingen vridning med 135-graderssteg på expert (avancerads M4-pil);
//   - spärren mot samma regeltext gäller alla nivåer i familjen och jämför
//     utan meningar om en egenskap som är lika i alla rutor. I parti 04 delade
//     uttrycket meningarna på bokstaven s (/(?<=.)s+/ i stället för
//     /(?<=\.)\s+/), så spärren släppte igenom vrid-13 till -15. Här är det
//     rättat.
//
// Kör: node scripts/gen-matris-parti-05.mjs [--prov] [--cell=e:vandring] [--logg]
//   --prov  bygger allt och skriver bara resultatet, ingen fil
//
// Utfil: src/lib/logicTestV7/kandidater/matris-parti-05.v7.json. Appen läser
// den aldrig. Varje fråga får fran_version: 6, så att den inte blir valbar
// förrän befordran (scripts/befordra-matris-parti-05.mjs) har lagt den i de
// skarpa V3-filerna och höjt TRANINGSVERSION från 5 till 6.
//
// Med docs/qa/matris-parti-05/beslut.json behålls bara de godkända, och
// generatorn avbryter om någon av dem skiljer sig från den granskade filen.
//
// Byggs med byggV3 (generera.mjs), alltså spärrarna S1 till S13, kontrollen i
// kontroll.mjs och distraktorurvalet för bank_version 3. Utöver det, mot
// nästan-dubbletter, som i parti 04: inget rutnät som redan finns, S10-
// utseendet och delade rader mot hela familjen, efterkontrollen per recept,
// oberoende regler på expert, och samma regeltext (utan konstanta
// egenskaper) avvisas mot alla nivåer i familjen.
// =============================================================================

import { writeFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { byggV3, key } from './lib/matris/generera.mjs';
import { strukturFelV3, utseendeFel, utseendeNyckel } from './lib/matris/sparrar.mjs';
import { ALLA_BANKFILER, las, valbarI } from './lib/matris/version.mjs';
import { oberoende } from './lib/matris/kontroll.mjs';

const K = 'src/lib/logicTestV7/kandidater';
export const UT = `${K}/matris-parti-05.v7.json`;
const PROV = process.argv.includes('--prov');
const FRAN = 6;
const PARTI = 'b6';
const LOGG = process.argv.includes('--logg');
const FORSOK = 120;
const CELL = process.argv.find((a) => a.startsWith('--cell='))?.slice(7) ?? null;

const KORT = {
  vridning: 'vrid', monsterrotation: 'rot', vandring: 'vand', 'rotation-med-byte': 'byte', 'tva-rorelser': 'tva',
  'latin-antal': 'lant', 'latin-form': 'lform', 'latin-flera': 'lfler', overlagring: 'over', spegling: 'speg', 'antal-andras': 'antal',
};
// Svårighet och p_prior per nivå, inom spannet i validate-v7-questions.mjs.
const NIVA = { g: { d: 2, p: 0.65 }, a: { d: 3, p: 0.55 }, e: { d: 4, p: 0.45 } };
const upprepa = (n, f) => Array.from({ length: n }, (_, i) => f(i));

// Steg (d, k) på åtta lägen för expertens växling: bara 45 och 90 grader
// (135 är avancerads M4-pil).
const KFRI = [1, 7, 2, 6, 3, 5];
const E_DK = [[1, 1], [2, 7], [3, 2], [5, 6], [6, 1], [7, 7], [1, 2], [3, 6], [5, 1], [2, 2], [6, 6], [7, 2], [1, 7], [3, 1], [5, 2], [6, 7]];
// Alla steg (d, k) utan halva varv, medurs och moturs om vartannat, i en
// fast blandad ordning. Spärren mot samma regeltext stryker de som finns.
const ALLA_DK = (() => {
  const med = []; const mot = [];
  for (let d = 1; d < 8; d++) for (const k of [1, 2, 3, 5, 6, 7]) (k < 4 ? med : mot).push([d, k]);
  const ord = (l) => l.map((x, i) => [x, (i * 17) % l.length]).sort((a, b) => a[1] - b[1]).map((x) => x[0]);
  const a = ord(med); const b = ord(mot);
  return a.flatMap((x, i) => [x, b[i]]);
})();
// Balanslinjen: alla stegpar för kvadraten och cirkeln (steg 1 eller 2 åt
// höger, mod 3) där formerna inte går i takt.
const ALLA_BAL = (() => {
  const st = [[1, 1], [1, 2], [2, 1], [2, 2]];
  const ut = [];
  for (const [a, b] of st) for (const [c, e] of st) if (!(a === c && b === e) && !((2 * a) % 3 === c && (2 * b) % 3 === e)) ut.push({ square: { d: a, k: b }, circle: { d: c, k: e } });
  return ut;
})();
const diag = (dim) => [{ dim, regel: 'diagonal' }];
const schack = (dim) => [{ dim, regel: 'schack' }];

const SPEG = (format, par) => par.map(([m1, m2, axel]) => ['spegling', { format, m1, m2, axel }, 'spegling']);
const PAR_TILE = [['V', 'A', 'kolumn'], ['A', 'H', 'rad'], ['D', 'H', 'kolumn'], ['A', 'V', 'rad'], ['H', 'D', 'rad'], ['V', 'D', 'kolumn'], ['D', 'A', 'rad'], ['A', 'D', 'kolumn'], ['H', 'V', 'kolumn'], ['V', 'H', 'rad'], ['D', 'V', 'rad'], ['H', 'A', 'kolumn']];
const PAR_HV = [['V', 'H', 'kolumn'], ['H', 'V', 'kolumn'], ['V', 'H', 'rad'], ['H', 'V', 'rad']];
const OVER = (ops) => ops.map(([format, op, axel]) => ['overlagring', { format, op, axel }, 'overlagring']);
const OVER_ALLA = (() => {
  const ut = [];
  for (const format of ['tile', 'lattice', 'ray', 'sektor', 'ring']) for (const op of ['union', 'xor', 'snitt', 'diff-ab']) for (const axel of ['kolumn', 'rad']) ut.push([format, op, axel]);
  return ut;
})();
const LFORM = [
  { format: 'poly-fyll', sidor: 5, diag: 'olika' }, { format: 'poly-fyll', sidor: 6, diag: 'konstant' }, { format: 'poly-fyll', sidor: 8, diag: 'olika' },
  { format: 'poly-sidor', fyll: 'black', diag: 'olika' }, { format: 'poly-sidor', fyll: 'none', diag: 'konstant' },
  { format: 'stack-symbol', bas: 'square', symboler: ['plus', 'dot', 'ring'], diag: 'olika' }, { format: 'stack-symbol', bas: 'diamond', symboler: ['plus', 'minus', 'cross'], diag: 'konstant' },
  { format: 'stack-symbol', bas: 'circle', symboler: ['minus', 'cross', 'ring'], diag: 'olika' }, { format: 'stack-symbol', bas: 'triangle', symboler: ['plus', 'minus', 'dot'], diag: 'olika' },
  { format: 'stack-bas', symbol: 'plus', baser: ['circle', 'triangle', 'diamond'], diag: 'konstant' }, { format: 'stack-bas', symbol: 'minus', baser: ['square', 'triangle', 'diamond'], diag: 'olika' },
  { format: 'stack-bas', symbol: 'ring', baser: ['circle', 'square', 'diamond'], diag: 'olika' },
  { format: 'orbital-lage', lagen: [0, 3, 6], center: 'open', diag: 'olika' }, { format: 'orbital-lage', lagen: [1, 2, 5], diag: 'olika' }, { format: 'orbital-lage', lagen: [2, 4, 7], center: 'open', diag: 'konstant' },
  { format: 'lattice-lage', lagen: [0, 1, 2], typ: 'fill_gray', diag: 'olika' }, { format: 'lattice-lage', lagen: [1, 2, 3], typ: 'dot', diag: 'konstant' }, { format: 'lattice-lage', lagen: [0, 1, 3], typ: 'fill_black', diag: 'olika' },
  { format: 'ring-inre', ringar: 3, diag: 'konstant' }, { format: 'ring-inre', ringar: 2, diag: 'olika' },
].map((p) => ['latinForm', p, 'latin-form']);
const LANTAL = [
  { format: 'sektor', antal: [2, 3, 5], diag: 'olika' }, { format: 'ray', antal: [2, 3, 4], diag: 'konstant' }, { format: 'ring', inre: 'gray', diag: 'olika' },
  { format: 'tally', antal: [1, 2, 3], riktning: 'horizontal', diag: 'olika' }, { format: 'sektor', antal: [1, 3, 5], diag: 'olika' }, { format: 'tally', antal: [1, 3, 4], riktning: 'vertical', diag: 'olika' },
  { format: 'ring', inre: 'black', diag: 'konstant' }, { format: 'ray', antal: [1, 2, 3], diag: 'olika' }, { format: 'tally', antal: [2, 3, 4], riktning: 'vertical', diag: 'konstant' },
  { format: 'sektor', antal: [2, 4, 5], diag: 'konstant' }, { format: 'ray', antal: [1, 3, 4], diag: 'konstant' }, { format: 'tally', antal: [1, 2, 4], riktning: 'horizontal', diag: 'konstant' },
  { format: 'ring', inre: 'none', diag: 'konstant' }, { format: 'sektor', antal: [1, 2, 5], diag: 'olika' }, { format: 'ray', antal: [1, 2, 4], diag: 'olika' },
].map((p) => ['latinAntal', p, 'latin-antal']);
const LFLERA = [
  { format: 'stack', symboler: ['plus', 'dot', 'ring'] }, { format: 'stack', symboler: ['minus', 'cross', 'dot'] }, { format: 'poly' }, { format: 'stack-fyll' }, { format: 'ring' },
  { format: 'stack', symboler: ['cross', 'minus', 'ring'] }, { format: 'stack', symboler: ['plus', 'cross', 'dot'] }, { format: 'stack', symboler: ['minus', 'dot', 'ring'] },
].map((p) => ['latinFlera', p, 'latin-flera']);

// Plus-bandets latinska kvadrater (recept-plus.mjs, parti 03: p.alla och
// p.inne, alla värden ur rutnätet). Kombinationer som inte finns i banken.
const BAS = { cst: ['circle', 'square', 'triangle'], csd: ['circle', 'square', 'diamond'], ctd: ['circle', 'triangle', 'diamond'], std: ['square', 'triangle', 'diamond'] };
const P1 = [
  [BAS.std, ['plus', 'minus'], 'hoger'], [BAS.ctd, ['dot', 'cross'], 'vanster'], [BAS.cst, ['dot', 'plus'], 'hoger'], [BAS.csd, ['minus', 'plus'], 'vanster'],
  [BAS.std, ['dot', 'minus'], 'hoger'], [BAS.ctd, ['plus', 'cross'], 'hoger'], [BAS.csd, ['dot', 'minus'], 'vanster'], [BAS.std, ['cross', 'plus'], 'vanster'],
].map(([baser, symboler, forskjutning]) => ['latinTrippelStack', { fyll: 'latin', baser, symboler, forskjutning, alla: true, inne: true }, 'P1', 4, 0.35]);
const P2 = [
  [BAS.std, ['minus', 'dot', 'ring']], [BAS.cst, ['plus', 'dot', 'ring']], [BAS.ctd, ['plus', 'minus', 'cross']], [BAS.csd, ['dot', 'cross', 'ring']],
  [BAS.std, ['plus', 'minus', 'dot']], [BAS.cst, ['plus', 'cross', 'minus']], [BAS.ctd, ['minus', 'cross', 'ring']], [BAS.csd, ['plus', 'minus', 'cross']],
].map(([baser, symboler]) => ['latinTrippelStack', { fyll: 'schack', baser, symboler, alla: true, inne: true }, 'P2', 4, 0.35]);
// P4 (sektorhjul) och P5 (streck): överlagring följd av vridning.
const PVRID = [
  ['sektor', 'xor', 'rad', 1, 'P4'], ['sektor', 'diff-ab', 'rad', 3, 'P4'], ['sektor', 'xor', 'kolumn', 2, 'P4'], ['sektor', 'diff-ab', 'kolumn', 6, 'P4'],
  ['ray', 'xor', 'rad', 7, 'P5'], ['ray', 'diff-ab', 'kolumn', 1, 'P5'], ['ray', 'xor', 'kolumn', 6, 'P5'], ['ray', 'diff-ab', 'rad', 2, 'P5'],
  ['sektor', 'xor', 'rad', 6, 'P4'], ['ray', 'diff-ab', 'rad', 6, 'P5'], ['sektor', 'diff-ab', 'kolumn', 2, 'P4'], ['ray', 'xor', 'rad', 2, 'P5'],
  ['sektor', 'diff-ab', 'rad', 1, 'P4'], ['ray', 'diff-ab', 'rad', 7, 'P5'],
].map(([format, op, axel, k, mek]) => ['overlagringVriden', { format, op, axel, k }, mek, 4, 0.35]);

// [nivå, familj, mål, kandidater]. Kandidat: [byggare, p, recept, (difficulty), (p_prior), (försök)].
// Målen är tak: hellre färre än nästan-dubbletter. Mål 0 betyder att
// familjen är uttömd på nivån (provkörningen 2026-11-19): varje kandidat
// gav samma regeltext som en befintlig fråga, samma utseende (S10), facit
// lika en synlig ruta, eller inga fem distraktorer som klarar spärrarna.
// Kandidaterna står kvar så att det går att se vad som prövats.
const CELLER = [
  // ------------------------------------------------------------ expert
  // Kolumnvis rörelse med växlande riktning finns inte i någon bank (ingen
  // fråga har rad-steg kolumnvis). Man ska upptäcka att raderna inte bär
  // regeln, läsa nedåt och se att mittkolumnen går åt andra hållet. Steget
  // är 45 eller 90 grader.
  ['e', 'vridning', 3, E_DK.map(([d, k], i) => ['radvisRotation', { prim: 'pil', axel: 'kolumn', mall: i % 3 === 2 ? 'fri' : 'linjar', vaxlar: true, d, k, andra: diag(i % 2 ? 'langd' : 'spets') }, 'E-M4K-pil'])],
  ['e', 'vandring', 6, E_DK.map(([d, k], i) => ['radvisRotation', { prim: 'orbital', axel: 'kolumn', mall: i % 3 === 2 ? 'fri' : 'linjar', vaxlar: true, d, k, andra: diag('center') }, 'E-M4K-orbital'])],
  // Tre oberoende regler ovanpå växlingen: vinkeln, längden och spetsen
  // (en i schackmönster, en på diagonalen). Radvis med 45 och 90 grader och
  // eget startläge per rad (expertens E-M4-pil-tre har bara 135 och linjärt
  // startläge), och kolumnvis.
  ['e', 'rotation-med-byte', 9, [
    ...E_DK.slice(0, 8).map(([d, k], i) => ['radvisRotation', { prim: 'pil', axel: 'kolumn', mall: i % 4 === 3 ? 'fri' : 'linjar', vaxlar: true, d, k, andra: [{ dim: i % 2 ? 'langd' : 'spets', regel: 'schack' }, { dim: i % 2 ? 'spets' : 'langd', regel: 'diagonal' }] }, 'E-M4K-pil-tre']),
    ...E_DK.slice(4, 12).map(([, k], i) => ['radvisRotation', { prim: 'pil', mall: 'fri', vaxlar: true, k, andra: [{ dim: i % 2 ? 'spets' : 'langd', regel: 'schack' }, { dim: i % 2 ? 'langd' : 'spets', regel: 'diagonal' }] }, 'E-M4-pil-tre']),
    ...E_DK.slice(8, 14).map(([d, k], i) => ['radvisRotation', { prim: 'orbital', axel: i % 2 ? 'kolumn' : undefined, mall: 'linjar', vaxlar: true, d, k, andra: schack('center') }, 'E-M4-orbital-schack']),
  ]],
  // Fyra oberoende regler på balanslinjen: kvadraten radvis, cirkeln
  // kolumnvis, kvadratens sida i schackmönster och dess fyllning på
  // diagonalen. P6 har tre.
  // Prövat och struket: fyra regler på balanslinjen (kvadratens sida i
  // schackmönster och fyllning på diagonalen). Cirkelns sida är alltid
  // motsatt kvadratens, och fyllningen följer läget, så reglerna är inte
  // oberoende (oberoende() fäller alla).
  ['e', 'latin-flera', 8, P2.flatMap((x, i) => [x, P1[i]])],
  ['e', 'overlagring', 8, PVRID],

  // ------------------------------------------------------------ avancerad
  ['a', 'vridning', 7, [
    ...ALLA_DK.map(([d, k], i) => ['radvisRotation', { prim: 'pil', mall: 'linjar', d, k, andra: diag(i % 2 ? 'langd' : 'spets') }, 'M2-pil-diagonal']),
    ...ALLA_DK.map(([d, k], i) => ['radvisRotation', { prim: 'pil', mall: 'linjar', vaxlar: true, d, k, andra: diag(i % 2 ? 'spets' : 'langd') }, 'M4-pil']),
  ]],
  ['a', 'vandring', 6, ALLA_DK.map(([d, k]) => ['radvisRotation', { prim: 'orbital', mall: 'linjar', d, k, andra: diag('center') }, 'M2-orbital-diagonal'])],
  ['a', 'monsterrotation', 3, [
    ...ALLA_DK.map(([d, k]) => ['radvisRotation', { prim: 'sektor', mall: 'linjar', d, k }, 'M1-sektor']),
    ...upprepa(4, (i) => ['radvisBlock', { k: i % 2 ? 3 : 1, antal: [3, 4, 5, 2][i] }, 'M1-block-fri']),
  ]],
  ['a', 'rotation-med-byte', 8, [
    ...upprepa(6, (i) => ['radvisRotation', { prim: 'orbital', mall: 'fri', k: KFRI[(i + 2) % 6], andra: schack('center') }, 'M2-orbital-fri-schack']),
    ...upprepa(6, (i) => ['radvisRotation', { prim: 'pil', mall: 'fri', k: KFRI[(i + 3) % 6], andra: [{ dim: i % 2 ? 'spets' : 'langd', regel: 'schack' }, { dim: i % 2 ? 'langd' : 'spets', regel: 'diagonal' }] }, 'M2-pil-fri-tre']),
    ...ALLA_DK.map(([d, k], i) => ['radvisRotation', { prim: 'pil', mall: 'linjar', d, k, andra: [{ dim: i % 2 ? 'spets' : 'langd', regel: 'schack' }, { dim: i % 2 ? 'langd' : 'spets', regel: 'diagonal' }] }, 'M2-pil-tre']),
  ]],
  ['a', 'tva-rorelser', 0, [
    ...ALLA_BAL.map((b, i) => ['radvisBalans', { ...b, fyll: 'diagonal', sidor: i % 2 ? 'kvadrat-under' : 'kvadrat-over' }, 'M3-balans-fyll', undefined, undefined, 10]),
    ...ALLA_BAL.map((b) => ['radvisBalans', { ...b, sida: 'schack' }, 'M3-balans-sida', undefined, undefined, 10]),
  ]],
  ['a', 'latin-antal', 0, LANTAL.map((x) => [...x, 2, 0.6])],
  ['a', 'latin-form', 2, LFORM.map((x) => [...x, 2, 0.6])],
  ['a', 'latin-flera', 0, LFLERA],
  ['a', 'spegling', 3, [...SPEG('tile', PAR_TILE), ...SPEG('lattice', PAR_HV), ...SPEG('sektor', PAR_HV)]],
  ['a', 'overlagring', 0, OVER(OVER_ALLA)],
  ['a', 'antal-andras', 2, [
    ...upprepa(4, (i) => ['antalEgenRiktning', { vaxlar: true, d: i % 2 ? 1 : -1, riktning: i < 2 ? 'rad' : 'diagonal' }, 'antal-egen-riktning']),
    ...upprepa(4, (i) => ['antalEgenRiktning', { vaxlar: false, d: i % 2 ? 1 : -1, riktning: i < 2 ? 'rad' : 'konstant' }, 'antal-egen-riktning']),
    ...upprepa(4, () => ['antalSumma', { radRiktning: true }, 'antal-summa-radvis']),
  ]],

  // ------------------------------------------------------------ grund
  // Grundens mallar är radvis rörelse med linjärt startläge. Fritt
  // startläge har bara sex regeltexter per primitiv, och de finns redan.
  ['g', 'vridning', 3, ALLA_DK.flatMap(([d, k], i) => [['radvisRotation', { prim: i % 2 ? 'stralar' : 'pil', mall: 'linjar', d, k }, i % 2 ? 'M1-stralar-linjar' : 'M1-pil-linjar']])],
  ['g', 'vandring', 0, ALLA_DK.map(([d, k], i) => ['radvisRotation', { prim: 'orbital', mall: 'linjar', d, k, center: i % 2 ? 'open' : 'filled' }, 'M1-orbital-linjar'])],
  ['g', 'monsterrotation', 10, ALLA_DK.map(([d, k]) => ['radvisRotation', { prim: 'sektor', mall: 'linjar', d, k }, 'M1-sektor-linjar'])],
  // Pil och orbital om vartannat, så att inte en mall tar hela cellen.
  ['g', 'rotation-med-byte', 13, ALLA_DK.flatMap(([d, k], i) => [
    ['radvisRotation', { prim: 'pil', mall: 'linjar', d, k, andra: schack(i % 2 ? 'spets' : 'langd') }, 'M2-pil-schack'],
    ['radvisRotation', { prim: 'orbital', mall: 'linjar', d: ALLA_DK[(i + 7) % ALLA_DK.length][0], k: ALLA_DK[(i + 7) % ALLA_DK.length][1], andra: schack('center') }, 'M2-orbital-schack'],
  ])],
  ['g', 'tva-rorelser', 0, ALLA_BAL.map((b, i) => ['radvisBalans', { ...b, sidor: i % 2 ? 'kvadrat-over' : 'kvadrat-under' }, 'M3-balans', undefined, undefined, 10])],
  ['g', 'spegling', 0, [...SPEG('sektor', PAR_HV), ...SPEG('lattice', PAR_HV), ...SPEG('tile', PAR_HV)]],
  ['g', 'overlagring', 0, OVER(OVER_ALLA.filter(([, op]) => op === 'union' || op === 'xor' || op === 'snitt'))],
  ['g', 'latin-form', 5, LFORM.map((x) => [...x, 1])],
  ['g', 'latin-antal', 0, LANTAL.map((x) => [...x, 1])],
  ['g', 'latin-flera', 0, LFLERA],
  ['g', 'antal-andras', 0, [
    ...upprepa(4, (i) => ['antalEgenRiktning', { vaxlar: false, d: i % 2 ? -1 : 1, riktning: i < 2 ? 'konstant' : 'rad' }, 'antal-egen-riktning']),
    ...upprepa(4, (i) => ['antalSumma', { o: i % 2 ? 'vertical' : 'horizontal' }, 'antal-summa']),
  ]],
];

// ---------------------------------------------------------------- befintliga
const filer = [...ALLA_BANKFILER, ...(existsSync(K) ? readdirSync(K).filter((f) => f.endsWith('.json')).map((f) => path.posix.join(K, f)) : [])]
  .filter((f) => path.resolve(f) !== path.resolve(UT));
const upptagna = new Set();
const befintliga = new Map();
// Partiets egna frågor (-b6-) räknas inte som befintliga när de väl är
// befordrade, så att generatorn ger samma fil före och efter befordran.
const EGEN = new RegExp(`^v7[gae]-${PARTI}-`);
for (const f of filer) for (const q of las(f)) { if (EGEN.test(q.id)) continue; upptagna.add(key(q.grid)); if (!q.pensionerad && !befintliga.has(q.id)) befintliga.set(q.id, q); }

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
for (const [, familj, , kand] of CELLER) for (const [, , recept] of kand) {
  if (receptFamilj.has(recept) && receptFamilj.get(recept) !== familj) throw new Error(`recept ${recept} i två familjer`);
  receptFamilj.set(recept, familj);
  familjSet(familj);
  utseenden.set(recept, utsePerFamilj.get(familj));
  kvar.set(recept, kvarPerFamilj.get(familj));
}
const receptFor = (q) => q.recept ?? q.mekanism ?? q.family;
const sammaRecept = (r) => [...befintliga.values()].filter((q) => receptFor(q) === r && (q.fran_version ?? 1) >= 3);
const godkandaFore = new Set([...befintliga.keys()]);

// Samma regeltext i samma familj, på någon nivå, är samma fråga med annat
// startläge. Meningar om en egenskap som är lika i alla rutor ("Pilen är
// kort hela vägen", "Cirkeln står alltid på andra sidan") räknas inte.
export const utanKonstant = (t) => String(t ?? '').split(/(?<=\.)\s+/).filter((m) => !/hela vägen|alltid/.test(m)).join(' ');
const regelNyckel = (q) => `${q.family}|${utanKonstant(q.rule)}`;
const regler = new Set([...befintliga.values()].map(regelNyckel));
const OGILTIG_TEXT = /\b(undefined|null|NaN)\b|\[object Object\]/;

// Granskningen av parti 05 (matris-2026-11-19-omg2-granskning.md, punkt 6):
// samma rutnät efter spegling, vridning och transponering är samma fråga.
// symmetriNyckel() tar hela rutnätet med facit insatt, stryker egenskaper
// som är lika i alla nio rutor och tar den minsta nyckeln över rutnätet
// som det är och transponerat, gånger figurens vridning och spegling (värdet
// v blir ±v + j på åtta lägen). Mönster i 3×3 och 2×2 jämförs som de är.
// Spegelbilden av en fråga (steget och startförskjutningen åt andra hållet)
// fångas av -v, en transponerad av bytet av rader och kolumner.
const ROT_FALT = { vector: 'angle', orbital: 'satellite', sectorwheel: 'filled', ray: 'rays' };
// Rutnätet som det är och med rader och kolumner ombytta. Luckan står kvar
// nere till höger; att vända raderna ger en annan fråga (en annan rad är
// facitraden).
const LAYOUT = [(r, c) => [r, c], (r, c) => [c, r]];
const m8 = (x) => ((x % 8) + 8) % 8;
export function symmetriNyckel(q) {
  const G = q.grid.map((rad) => rad.slice()); G[2][2] = q.options[q.correctAnswer];
  const celler = G.flat();
  if (celler.some((c) => !c || Array.isArray(c))) return null;
  const kind = celler[0].kind;
  if (celler.some((c) => c.kind !== kind)) return null;
  const falt = [...new Set(celler.flatMap((c) => Object.keys(c)))].filter((k) => k !== 'kind' && !celler.every((c) => JSON.stringify(c[k]) === JSON.stringify(celler[0][k]))).sort();
  const rf = ROT_FALT[kind] && falt.includes(ROT_FALT[kind]) ? ROT_FALT[kind] : null;
  const rot = (v, sg, j) => (Array.isArray(v) ? v.map((x) => m8(sg * x + j)).sort((a, b) => a - b) : kind === 'vector' ? m8(sg * (v / 45) + j) : m8(sg * v + j));
  let basta = null;
  for (const L of LAYOUT) for (const sg of rf ? [1, -1] : [1]) for (let j = 0; j < (rf ? 8 : 1); j++) {
    const ny = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const [rr, cc] = L(r, c); ny.push(G[rr][cc]); }
    const delar = ny.map((cell) => falt.map((k) => {
      const v = cell[k];
      if (k === rf) return JSON.stringify(rot(v, sg, j));
      return JSON.stringify(v);
    }).join(',')).join('|');
    if (basta === null || delar < basta) basta = delar;
  }
  return `${q.family}|${kind}|${falt.join(',')}|${basta}`;
}
// Avancerad: ingen rad börjar 180 grader från raden ovanför (rad 3 blir då
// samma som rad 1, granskningen av parti 05).
const START_180 = /Varje (rad|kolumn) börjar 180 grader/;
const symNyckel = (q) => { try { return symmetriNyckel(q); } catch { return null; } };
// Jämförs med frågor som är valbara i träningsversion 5 (en pensionerad
// fråga, till exempel läsordningens v7e-3c-byte-01, visas aldrig igen).
const symmetrier = new Map([...befintliga.values()].filter((q) => valbarI(q, 5)).map((q) => [symNyckel(q), q.id]).filter(([k]) => k));
// Med beslutet byggs partiet som det granskades (de nya spärrarna stängda,
// så att löpnumren inte flyttas), och de godkända prövas mot spärrarna efteråt.
const BESLUT = 'docs/qa/matris-parti-05/beslut.json';
const beslut = existsSync(BESLUT) ? las(BESLUT) : null;
const lasta = !!beslut;
const start = Date.now();
const rapport = [];
const raknare = {};
const ut = [];

// Cellerna byggs i ordning efter hur många valbara frågor de har i dag
// (TRANINGSVERSION 5), färst först.
const idag = (n, familj) => [...befintliga.values()].filter((q) => q.family === familj && q.id.startsWith(`v7${n}-`) && valbarI(q, 5)).length;
const ORDNING = CELLER.map((c, i) => ({ c, i, antal: idag(c[0], c[1]) })).sort((a, b) => a.antal - b.antal || a.i - b.i).map((x) => x.c);
for (const [n, familj, mal, kandidater] of ORDNING) {
  if (CELL && CELL !== `${n}:${familj}`) continue;
  let fatt = 0;
  const skal = new Map();
  for (let ci = 0; ci < kandidater.length && fatt < mal; ci++) {
    const [byggare, p, recept, difficulty, p_prior, forsok] = kandidater[ci];
    const pre = `v7${n}-${PARTI}-${KORT[familj]}`;
    const nr = (raknare[pre] ?? 0) + 1;
    const rc = {
      id: `${pre}-${String(nr).padStart(2, '0')}`, seed: `parti05:${n}:${familj}:${ci}`,
      familj, byggare, p: { ...p, family: familj }, difficulty: difficulty ?? NIVA[n].d, recept,
      p_prior: p_prior ?? NIVA[n].p, fran_version: FRAN, v3: true, forsok: forsok ?? FORSOK,
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
    const ob = n === 'e' ? oberoende(q) : [];
    const fore = [...sammaRecept(recept), ...ut.filter((x) => x.recept === recept)];
    const kontroll = (g) => [...strukturFelV3(g), ...utseendeFel(g, { godkanda: godkandaFore })].map((x) => x.replace(/i \d+ av \d+ frågor, högst \d+/, 'över taket'));
    const innan = new Set(kontroll(fore));
    const fel = [
      ...ob.map((x) => `oberoende: ${x}`),
      ...(q.family !== familj ? [`familjen blev ${q.family}, inte ${familj}`] : []),
      ...(regler.has(regelNyckel(q)) ? ['samma regeltext (utan konstanta egenskaper) som en annan fråga i familjen'] : []),
      ...[q.title, q.rule, ...(q.misstag ?? [])].filter((t) => OGILTIG_TEXT.test(t ?? '')).map((t) => `ogiltig text: ${t}`),
      ...(!lasta && symmetrier.has(symNyckel(q)) ? ['samma rutnät som en annan fråga efter spegling, vridning eller transponering'] : []),
      ...(!lasta && n === 'a' && START_180.test(q.rule) ? ['varje rad börjar 180 grader (för lätt på avancerad)'] : []),
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
    if (!lasta) { const sk = symNyckel(q); if (sk) symmetrier.set(sk, q.id); }
    ut.push(q);
    fatt++;
  }
  rapport.push({ n, familj, mal, fatt, skal });
}

// Beslutet: bara de godkända går vidare, oförändrade mot den granskade filen.
if (beslut && !CELL) {
  const granskad = new Map((existsSync(UT) ? las(UT) : []).map((q) => [q.id, q]));
  const ok = new Set(beslut.godkanda);
  for (const q of ut.filter((x) => ok.has(x.id))) {
    const g = granskad.get(q.id);
    if (g && key(g) !== key(q)) throw new Error(`${q.id}: har ändrats sedan granskningen`);
  }
  ut.splice(0, ut.length, ...ut.filter((q) => ok.has(q.id)));
  if (ut.length !== ok.size) throw new Error(`${ok.size - ut.length} godkända byggdes inte: ${[...ok].filter((id) => !ut.some((q) => q.id === id)).join(', ')}`);
  // De godkända ska klara spärrarna från granskningen av parti 05.
  const sett = new Map(symmetrier);
  for (const q of ut) {
    const sk = symNyckel(q);
    if (sk && sett.has(sk)) throw new Error(`${q.id}: samma rutnät som ${sett.get(sk)} efter spegling, vridning eller transponering`);
    if (sk) sett.set(sk, q.id);
    if (q.id.startsWith('v7a-') && START_180.test(q.rule)) throw new Error(`${q.id}: varje rad börjar 180 grader`);
  }
}

// Slutkontroll över hela partiet per recept.
const allaRecept = new Set(ut.map((q) => q.recept));
const slut = [...allaRecept].flatMap((r) => {
  const fore = sammaRecept(r);
  const innan = new Set([...strukturFelV3(fore), ...utseendeFel(fore, { godkanda: godkandaFore })]);
  const grupp = [...fore, ...ut.filter((q) => q.recept === r)];
  return [...strukturFelV3(grupp), ...utseendeFel(grupp, { godkanda: godkandaFore })].filter((x) => !innan.has(x));
});

const NAMN = { g: 'grund', a: 'avancerad', e: 'expert' };
const perNiva = { g: 0, a: 0, e: 0 };
for (const q of ut) perNiva[q.id[2]]++;
// Med beslutet är partiet låst: strykningarna kan rubba balansen medurs och
// moturs per recept (S10), och det redovisas som upplysning, eftersom de
// godkända inte får byggas om. Kedjan (v7-facit-check) prövar bankerna.
const slutFel = lasta ? [] : slut;
console.log(`${slutFel.length ? '✗' : '✓'} ${ut.length} frågor (grund ${perNiva.g}, avancerad ${perNiva.a}, expert ${perNiva.e}) på ${((Date.now() - start) / 1000).toFixed(1)} s`);
for (const x of rapport) {
  console.log(`  ${x.fatt === x.mal ? ' ' : '!'} ${NAMN[x.n].padEnd(9)} ${x.familj.padEnd(18)} ${x.fatt}/${x.mal}`);
  if (x.fatt < x.mal || LOGG) for (const [s, c] of x.skal) console.log(`      ${c} × ${s.slice(0, 160)}`);
}
if (slut.length) { console.log(lasta ? '  Slutkontrollen (upplysning, partiet är låst av beslutet):' : '  Slutkontrollen:'); slut.forEach((x) => console.log('  - ' + x)); }
if (!PROV && !CELL) {
  writeFileSync(UT, JSON.stringify(ut, null, 2) + '\n');
  console.log(`Skrev ${UT}`);
}
process.exit(slutFel.length ? 1 : 0);
