// scripts/gen-matris-parti-06.mjs
// =============================================================================
// Matrislogik parti 06 (2026-11-19, omgång 3 av dagen): cirka 100 nya frågor
// på nya primitiver och nya regeltyper (docs/fragebank/matris-2026-11-19-omg3.md).
// Samma arbetssätt som parti 05 (scripts/gen-matris-parti-05.mjs), men med
// grund och avancerad nästan uttömda i dagens familjer bygger partiet inte på
// nya startlägen utan på
//
//   klocka       två visare med var sin regel (vridning radvis eller kolumnvis,
//                schackmönster, diagonal, latinsk kvadrat), familjen tva-rorelser
//   grupp        ett till nio små tecken: antalet med aritmetik över raden
//                eller kolumnen (summa, skillnad, jämna steg), formen och
//                fyllningen med egna regler (latinsk kvadrat, schackmönster,
//                diagonal), familjen antal-andras
//   streckfigur  åtta streck i en kvadrat: överlagring (allt, skillnad,
//                gemensamt, det som blir kvar), familjen overlagring, och
//                figurer som byggs upp eller plockas isär streck för streck,
//                familjen antal-andras
//
// Byggarna står i scripts/lib/matris/generera-parti06.mjs, de nya reglerna
// (skillnad, tillägg) i tolka.mjs och texterna i misstag.mjs.
//
// Kör: node scripts/gen-matris-parti-06.mjs [--prov] [--cell=g:klocka-schack] [--logg]
//   --prov  bygger allt och skriver bara resultatet, ingen fil
//
// Utfil: src/lib/logicTestV7/kandidater/matris-parti-06.v7.json. Appen läser
// den aldrig. Varje fråga får fran_version: 7, så att den inte blir valbar
// förrän befordran (scripts/befordra-matris-parti-06.mjs) har lagt den i de
// skarpa V3-filerna och höjt TRANINGSVERSION från 6 till 7.
//
// Med docs/qa/matris-parti-06/beslut.json behålls bara de godkända, och
// generatorn avbryter om någon av dem skiljer sig från den granskade filen.
//
// Spärrarna utöver byggV3 (S1 till S13, kontroll.mjs, distraktorurvalet), som
// i parti 05: inget rutnät som redan finns, S10 och delade rader per recept,
// samma regeltext (utan konstanta egenskaper) i familjen på någon nivå, samma
// rutnät efter spegling, vridning och transponering, oberoende regler på
// expert, ingen text med undefined, null, NaN eller [object Object]. Nytt här:
//   - strukturnyckeln: samma regel upp till transponering, spegling (medurs
//     och moturs ombytta) och ombytta visare är samma fråga, på alla nivåer
//   - varje egenskap med en regel förklaras av en enda regeltyp i tolkningen
//     (ingen annan regel passar de åtta synliga rutorna, inte ens med samma svar)
//   - inga klockor där visarna pekar åt samma håll (K1), aldrig 180 grader
// =============================================================================

import { writeFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { byggV3, key } from './lib/matris/generera.mjs';
import { strukturFelV3, utseendeFel, utseendeNyckel } from './lib/matris/sparrar.mjs';
import { ALLA_BANKFILER, las, valbarI } from './lib/matris/version.mjs';
import { oberoende } from './lib/matris/kontroll.mjs';
import { tolka } from './lib/matris/tolka.mjs';
import { mod } from './lib/matris/celler.mjs';

const K = 'src/lib/logicTestV7/kandidater';
export const UT = `${K}/matris-parti-06.v7.json`;
const PROV = process.argv.includes('--prov');
const FRAN = 7;
const PARTI = 'b7';
const LOGG = process.argv.includes('--logg');
const FORSOK = 120;
const CELL = process.argv.find((a) => a.startsWith('--cell='))?.slice(7) ?? null;
const BESLUT = 'docs/qa/matris-parti-06/beslut.json';
// Högst så många frågor per recept, så att ingen mall tar hela cellen.
const MAX_PER_RECEPT = 10;
// Två visare radvis är den enklaste klockmallen på avancerad; högst sex.
const TAK = { 'K-tva-radvis': 6 };

// Svårighet och p_prior per nivå, inom spannet i validate-v7-questions.mjs.
const NIVA = { g: { d: 2, p: 0.65 }, a: { d: 3, p: 0.55 }, e: { d: 4, p: 0.45 } };
const PRIM = { klockaRegler: 'klocka', gruppRakna: 'grupp', streckOverlagring: 'streck', streckTillagg: 'streck' };

// ---------------------------------------------------------------- parametrar
// Steg på åtta lägen utan halva varv (k och d aldrig 0 eller 4), i en fast
// blandad ordning, medurs och moturs om vartannat.
const STEG = [1, 7, 2, 6, 3, 5];
const DK = (() => {
  const ut = [];
  for (const k of STEG) for (const d of STEG) ut.push([d, k]);
  return ut.map((x, i) => [x, (i * 23) % ut.length]).sort((a, b) => a[1] - b[1]).map((x) => x[0]);
})();
const rot = (axel, k, d, extra = {}) => ({ regel: 'rorelse', axel, k, d, mall: 'linjar', ...extra });
const fri = (axel, k, extra = {}) => ({ regel: 'rorelse', axel, k, mall: 'fri', ...extra });

// Klockan, grund: en visare vrider sig radvis med linjärt startläge, den
// andra växlar i schackmönster eller står på diagonalen.
const K_GRUND = DK.flatMap(([d, k], i) => [
  ['klockaRegler', { oberoende: true, lang: rot('rad', k, d), kort: { regel: i % 2 ? 'diagonal' : 'schack' } }, i % 2 ? 'K-diagonal' : 'K-schack'],
  ['klockaRegler', { oberoende: true, lang: { regel: i % 2 ? 'schack' : 'diagonal' }, kort: rot('rad', k, d) }, i % 2 ? 'K-schack' : 'K-diagonal'],
]);
// Avancerad: båda visarna vrider sig radvis i olika takt; en radvis och en
// kolumnvis (kolumnens visare med eget startläge, annars går de i takt); en
// radvis och en i latinsk kvadrat.
// Två visare som vrider sig: samma håll (medurs eller moturs) i båda, och
// hållet växlar mellan frågorna, så att receptet håller S10 (högst hälften
// av frågorna med samma vridriktning).
const MED = [1, 2, 3]; const MOT = [7, 6, 5];
const PAR = (() => {
  const per = [MED, MOT].map((sida) => {
    const l = [];
    for (const k of sida) for (const k2 of sida) if (k !== k2) for (const d of sida) for (const d2 of sida) l.push([k, k2, d, d2]);
    return l.map((x, i) => [x, (i * 13) % l.length]).sort((a, b) => a[1] - b[1]).map((x) => x[0]);
  });
  return per[0].flatMap((x, i) => [x, per[1][i]]);
})();
const K_AVANCERAD = [
  ...PAR.flatMap(([k, k2, d, d2], i) => [
    ['klockaRegler', i % 2 ? { lang: fri('kolumn', k2), kort: rot('rad', k, d) } : { lang: rot('rad', k, d), kort: fri('kolumn', k2) }, 'K-rad-kolumn'],
    ['klockaRegler', { lang: rot('rad', k, d), kort: rot('rad', k2, d2) }, 'K-tva-radvis'],
  ]),
  ...DK.map(([d, k], i) => ['klockaRegler', i % 2 ? { lang: { regel: 'latin', s: 2 }, kort: rot('rad', k, d) } : { lang: rot('rad', k, d), kort: { regel: 'latin', s: 1 } }, 'K-latin']),
];
// Expert: en visare växlar riktning per rad med eget startläge, den andra går
// kolumnvis med eget startläge (eller i latinsk kvadrat). Två axlar, och
// ingen av dem syns i rad 3 ensam.
const OB = { oberoende: true };
const K_EXPERT = [
  ...PAR.map(([k, k2], i) => ['klockaRegler', { ...OB, ...(i % 2 ? { lang: fri('kolumn', k2), kort: fri('rad', k, { vaxlar: true }) } : { lang: fri('rad', k, { vaxlar: true }), kort: fri('kolumn', k2) }) }, 'E-K-vaxla-kolumn']),
  ...STEG.map((k, i) => ['klockaRegler', { ...OB, ...(i % 2 ? { lang: { regel: 'latin', s: 1 }, kort: fri('rad', k, { vaxlar: true }) } : { lang: fri('rad', k, { vaxlar: true }), kort: { regel: 'latin', s: 2 } }) }, 'E-K-vaxla-latin']),
  // Båda visarna växlar riktning, den ena per rad, den andra per kolumn.
  ...PAR.map(([k, k2], i) => ['klockaRegler', { ...OB, lang: fri(i % 2 ? 'kolumn' : 'rad', k, { vaxlar: true }), kort: fri(i % 2 ? 'rad' : 'kolumn', k2, { vaxlar: true }) }, 'E-K-dubbel-vaxling']),
];

// Gruppen.
const ARITM = [1, -1, 2, -2, 3, -3];
const G_GRUND = [
  ['gruppRakna', { antal: { regel: 'summa', linje: 'rad' } }, 'G-summa'],
  ['gruppRakna', { antal: { regel: 'differens', linje: 'rad' } }, 'G-skillnad'],
  ['gruppRakna', { antal: { regel: 'summa', linje: 'kolumn' } }, 'G-summa'],
  ['gruppRakna', { antal: { regel: 'differens', linje: 'kolumn' } }, 'G-skillnad'],
  ...ARITM.map((d) => ['gruppRakna', { antal: { regel: 'aritm', linje: 'rad', d } }, 'G-steg']),
];
const ANDRA = [{ form: { regel: 'latin', s: 1 } }, { fyll: { regel: 'schack' } }, { form: { regel: 'diagonal' } }, { fyll: { regel: 'diagonal' } }, { form: { regel: 'schack' } }, { form: { regel: 'latin', s: 2 } }];
const ANTAL_A = [
  { regel: 'summa', linje: 'rad' }, { regel: 'differens', linje: 'kolumn' }, { regel: 'aritm', linje: 'rad', d: 2 }, { regel: 'summa', linje: 'kolumn' },
  { regel: 'aritm', linje: 'rad', d: -1, vaxlar: true }, { regel: 'differens', linje: 'rad' }, { regel: 'aritm', linje: 'kolumn', d: 3 }, { regel: 'aritm', linje: 'rad', d: 1, vaxlar: true },
];
// Varvat: varje antalsregel en gång innan någon kommer igen.
const G_AVANCERAD = ANDRA.flatMap((_, j) => ANTAL_A.map((antal, i) => { const x = ANDRA[(i + j) % ANDRA.length]; return ['gruppRakna', { antal, ...x }, x.form?.regel === 'latin' ? 'G-antal-latin' : 'G-antal-monster']; }));
const G_EXPERT = [
  { regel: 'summa', linje: 'kolumn' }, { regel: 'differens', linje: 'rad' }, { regel: 'aritm', linje: 'rad', d: 2, vaxlar: true }, { regel: 'differens', linje: 'kolumn' },
  { regel: 'aritm', linje: 'kolumn', d: -1, vaxlar: true }, { regel: 'summa', linje: 'rad' }, { regel: 'aritm', linje: 'rad', d: -2, vaxlar: true }, { regel: 'aritm', linje: 'kolumn', d: 1, vaxlar: true },
].flatMap((antal, i) => [
  // Fyllningen på diagonalen kräver latinska kvadraten med s = 1, annars har
  // diagonalen en enda form och fyllningen följer formen.
  ['gruppRakna', { oberoende: true, antal, form: { regel: 'latin', s: 1 }, fyll: { regel: i % 2 ? 'diagonal' : 'schack' } }, 'E-G-tre-regler'],
  ['gruppRakna', { oberoende: true, antal, form: { regel: 'latin', s: i % 2 ? 2 : 1 }, fyll: { regel: i % 2 ? 'schack' : 'diagonal' } }, 'E-G-tre-regler'],
]);

// Streckfiguren.
const S_GRUND = [
  ['streckOverlagring', { op: 'union', axel: 'kolumn' }, 'S-overlagring'],
  ['streckOverlagring', { op: 'snitt', axel: 'rad' }, 'S-overlagring'],
  ['streckTillagg', { axel: 'rad', steg: [[1, 0], [1, 0]] }, 'S-bygg'],
  ['streckTillagg', { axel: 'kolumn', steg: [[0, 1], [0, 1]] }, 'S-riv'],
  ['streckTillagg', { axel: 'rad', steg: [[2, 0], [1, 0]] }, 'S-bygg'],
  ['streckTillagg', { axel: 'kolumn', steg: [[1, 0], [2, 0]] }, 'S-bygg'],
  ['streckTillagg', { axel: 'rad', steg: [[0, 2], [0, 1]] }, 'S-riv'],
  ['streckTillagg', { axel: 'rad', steg: [[0, 1], [0, 2]] }, 'S-riv'],
  ['streckTillagg', { axel: 'kolumn', steg: [[2, 0], [2, 0]] }, 'S-bygg'],
  ['streckTillagg', { axel: 'kolumn', steg: [[0, 2], [0, 2]] }, 'S-riv'],
];
const S_AVANCERAD = [
  ['streckOverlagring', { op: 'xor', axel: 'kolumn' }, 'S-overlagring-a'],
  ['streckOverlagring', { op: 'diff-ab', axel: 'rad' }, 'S-overlagring-a'],
  ['streckTillagg', { axel: 'rad', steg: [[1, 0], [0, 1]] }, 'S-blandat'],
  ['streckTillagg', { axel: 'kolumn', steg: [[0, 1], [1, 0]] }, 'S-blandat'],
  ['streckTillagg', { axel: 'rad', steg: [[1, 1], [1, 0]] }, 'S-blandat'],
  ['streckTillagg', { axel: 'kolumn', steg: [[0, 1], [1, 1]] }, 'S-blandat'],
  ['streckTillagg', { axel: 'rad', steg: [[2, 0], [0, 1]] }, 'S-blandat'],
  ['streckTillagg', { axel: 'kolumn', steg: [[1, 1], [1, 1]] }, 'S-blandat'],
  ['streckTillagg', { axel: 'rad', steg: [[2, 0], [0, 2]] }, 'S-blandat'],
  ['streckTillagg', { axel: 'kolumn', steg: [[0, 2], [2, 0]] }, 'S-blandat'],
];

// [nivå, cellnamn, familj, mål, kandidater]. Kandidat: [byggare, p, recept].
// Målen är tak: hellre färre än nästan-dubbletter.
const CELLER = [
  ['e', 'klocka', 'tva-rorelser', 14, K_EXPERT],
  ['e', 'grupp', 'antal-andras', 10, G_EXPERT],
  ['a', 'klocka', 'tva-rorelser', 20, K_AVANCERAD],
  ['a', 'grupp', 'antal-andras', 14, G_AVANCERAD],
  ['a', 'streck-over', 'overlagring', 2, S_AVANCERAD.filter((x) => x[0] === 'streckOverlagring')],
  ['a', 'streck', 'antal-andras', 8, S_AVANCERAD.filter((x) => x[0] === 'streckTillagg')],
  ['g', 'klocka', 'tva-rorelser', 20, K_GRUND],
  ['g', 'grupp', 'antal-andras', 8, G_GRUND],
  ['g', 'streck-over', 'overlagring', 2, S_GRUND.filter((x) => x[0] === 'streckOverlagring')],
  ['g', 'streck', 'antal-andras', 8, S_GRUND.filter((x) => x[0] === 'streckTillagg')],
];

// ---------------------------------------------------------------- strukturnyckeln
// Samma regel upp till transponering (rad och kolumn byter roll), spegling
// (medurs och moturs byter) och, för klockan, ombytta visare är samma fråga
// med andra startlägen. Nyckeln tas ur receptets parametrar.
function strukturNyckel(byggare, p) {
  if (byggare === 'klockaRegler') {
    const norm = (s, tr, sg) => (s.regel === 'rorelse'
      ? { r: 'rot', axel: tr ? (s.axel === 'rad' ? 'kolumn' : 'rad') : s.axel, k: mod(sg * s.k, 8), d: s.mall === 'fri' ? 'fri' : mod(sg * s.d, 8), v: !!s.vaxlar }
      : { r: s.regel });
    const ut = [];
    for (const tr of [false, true]) for (const sg of [1, -1]) for (const byt of [false, true]) {
      const [a, b] = byt ? [p.kort, p.lang] : [p.lang, p.kort];
      ut.push(JSON.stringify([norm(a, tr, sg), norm(b, tr, sg)]));
    }
    return `klocka|${ut.sort()[0]}`;
  }
  if (byggare === 'gruppRakna') {
    const a = p.antal;
    const ny = (tr) => JSON.stringify({ r: a.regel, d: a.d ?? 0, v: !!a.vaxlar, l: tr ? (a.linje === 'rad' ? 'kolumn' : 'rad') : a.linje, f: p.form?.regel ?? 'konstant', y: p.fyll?.regel ?? 'konstant' });
    // Summa och skillnad har ingen riktning inom linjen; transponerat är samma fråga.
    return `grupp|${a.regel === 'aritm' ? [ny(false), ny(true)].sort()[0].replace(/"l":"\w+"/, '') : [ny(false), ny(true)].sort()[0].replace(/"l":"\w+"/, '')}`;
  }
  if (byggare === 'streckOverlagring') return `streck-over|${p.op}`;
  return `streck-tillagg|${JSON.stringify(p.steg)}`;
}

// ---------------------------------------------------------------- befintliga
const filer = [...ALLA_BANKFILER, ...(existsSync(K) ? readdirSync(K).filter((f) => f.endsWith('.json')).map((f) => path.posix.join(K, f)) : [])]
  .filter((f) => path.resolve(f) !== path.resolve(UT));
const upptagna = new Set();
const befintliga = new Map();
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
for (const [, , familj, , kand] of CELLER) for (const [, , recept] of kand) {
  if (receptFamilj.has(recept) && receptFamilj.get(recept) !== familj) throw new Error(`recept ${recept} i två familjer`);
  receptFamilj.set(recept, familj);
  familjSet(familj);
  utseenden.set(recept, utsePerFamilj.get(familj));
  kvar.set(recept, kvarPerFamilj.get(familj));
}
const receptFor = (q) => q.recept ?? q.mekanism ?? q.family;
const sammaRecept = (r) => [...befintliga.values()].filter((q) => receptFor(q) === r && (q.fran_version ?? 1) >= 3);
const godkandaFore = new Set([...befintliga.keys()]);

export const utanKonstant = (t) => String(t ?? '').split(/(?<=\.)\s+/).filter((m) => !/hela vägen|alltid/.test(m)).join(' ');
const regelNyckel = (q) => `${q.family}|${utanKonstant(q.rule)}`;
const regler = new Set([...befintliga.values()].map(regelNyckel));
const OGILTIG_TEXT = /\b(undefined|null|NaN)\b|\[object Object\]/;

// Samma rutnät efter spegling, vridning och transponering (som parti 05),
// utvidgat till de nya primitiverna: klockans båda visare vrids och speglas
// tillsammans, streckfiguren i kvadratens åtta symmetrier, och gruppens
// kategorier (form, fyllning) döps om i den ordning de dyker upp.
const LAYOUT = [(r, c) => [r, c], (r, c) => [c, r]];
const m8 = (x) => ((x % 8) + 8) % 8;
// Kvadratens symmetrier på strecken 0 till 7 (sidorna medurs från toppen,
// diagonalerna, mittstrecken): vridning ett kvarts varv och spegling i lodlinjen.
const S_ROT = [1, 2, 3, 0, 5, 4, 7, 6];
const S_SPEG = [0, 3, 2, 1, 5, 4, 6, 7];
const D4 = (() => {
  const ut = [];
  let r = [0, 1, 2, 3, 4, 5, 6, 7];
  for (let i = 0; i < 4; i++) { ut.push(r); ut.push(r.map((x) => S_SPEG[x])); r = r.map((x) => S_ROT[x]); }
  return ut;
})();
export function symmetriNyckel(q) {
  const G = q.grid.map((rad) => rad.slice()); G[2][2] = q.options[q.correctAnswer];
  const celler = G.flat();
  if (celler.some((c) => !c || Array.isArray(c))) return null;
  const kind = celler[0].kind;
  if (celler.some((c) => c.kind !== kind)) return null;
  let varianter;
  if (kind === 'klocka') varianter = [1, -1].flatMap((sg) => [0, 1, 2, 3, 4, 5, 6, 7].map((j) => (c) => `${m8(sg * c.lang + j)}/${m8(sg * c.kort + j)}`));
  else if (kind === 'streckfigur') varianter = D4.map((perm) => (c) => c.streck.map((x) => perm[x]).sort().join(''));
  else if (kind === 'grupp') varianter = [null];
  else return null;
  let basta = null;
  for (const L of LAYOUT) for (const v of varianter) {
    const ny = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const [rr, cc] = L(r, c); ny.push(G[rr][cc]); }
    let delar;
    if (kind === 'grupp') {
      const ord = { form: new Map(), fill: new Map() };
      const namn = (f, x) => { if (!ord[f].has(x)) ord[f].set(x, ord[f].size); return ord[f].get(x); };
      delar = ny.map((c) => `${c.antal}:${namn('form', c.form)}:${namn('fill', c.fill)}`).join('|');
    } else delar = ny.map(v).join('|');
    if (basta === null || delar < basta) basta = delar;
  }
  return `${q.family}|${kind}|${basta}`;
}
const symNyckel = (q) => { try { return symmetriNyckel(q); } catch { return null; } };
const symmetrier = new Map();

/** Varje egenskap med en regel förklaras av en enda regeltyp. */
function flerTolkningar(q) {
  const t = tolka(q);
  const fel = [];
  for (const [id, r] of Object.entries(t.regel)) {
    if (r.regel === 'konstant') continue;
    const typer = new Set((t.allaRegler[id] ?? []).map((f) => f.regel));
    // Diagonalen är också en period 4 i läsordning (rutorna 0, 4 och 8); det är samma regel.
    if (r.regel === 'diagonal') typer.delete('periodisk');
    if (typer.size !== 1) fel.push(`${id} kan läsas som ${[...typer].join(' eller ')}`);
  }
  return fel;
}
const K1 = (c) => c && c.kind === 'klocka' && m8(c.lang) === m8(c.kort);

const beslut = existsSync(BESLUT) ? las(BESLUT) : null;
const lasta = !!beslut;
const start = Date.now();
const rapport = [];
const raknare = {};
const ut = [];
const strukturer = new Map();

for (const [n, cellNamn, familj, mal, kandidater] of CELLER) {
  if (CELL && CELL !== `${n}:${cellNamn}`) continue;
  let fatt = 0;
  const skal = new Map();
  const notera = (s) => skal.set(s, (skal.get(s) ?? 0) + 1);
  for (let ci = 0; ci < kandidater.length && fatt < mal; ci++) {
    const [byggare, p, recept] = kandidater[ci];
    if (ut.filter((x) => x.recept === recept).length >= (TAK[recept] ?? MAX_PER_RECEPT)) { notera(`receptet ${recept} är fullt`); continue; }
    const sk = strukturNyckel(byggare, p);
    if (strukturer.has(sk)) { notera(`samma struktur som ${strukturer.get(sk)}`.replace(/v7\w-b7-[\w-]+/, 'en annan fråga i partiet')); continue; }
    const pre = `v7${n}-${PARTI}-${PRIM[byggare]}`;
    const nr = (raknare[pre] ?? 0) + 1;
    const rc = {
      id: `${pre}-${String(nr).padStart(2, '0')}`, seed: `parti06:${n}:${cellNamn}:${ci}`,
      familj, byggare, p: { ...p, family: familj }, difficulty: NIVA[n].d, recept,
      p_prior: NIVA[n].p, fran_version: FRAN, v3: true, forsok: FORSOK,
    };
    let q;
    const t0 = Date.now();
    try { q = byggV3(rc, upptagna, { utseenden, kvar }); }
    catch (e) {
      const s = e.message.split('\n')[1]?.trim() ?? e.message; notera(s);
      if (LOGG) console.error(`  ${n} ${cellNamn} #${ci} ✗ ${((Date.now() - t0) / 1000).toFixed(1)} s ${s.slice(0, 90)}`);
      continue;
    }
    if (LOGG) console.error(`  ${n} ${cellNamn} #${ci} ✓ ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    // Oberoende på alla nivåer (parti 06): bestämmer den ena egenskapen den
    // andra över rutnätet går facit att läsa av utan den andra regeln.
    const ob = oberoende(q);
    const fore = [...sammaRecept(recept), ...ut.filter((x) => x.recept === recept)];
    const kontroll = (g) => [...strukturFelV3(g), ...utseendeFel(g, { godkanda: godkandaFore })].map((x) => x.replace(/i \d+ av \d+ frågor, högst \d+/, 'över taket'));
    const innan = new Set(kontroll(fore));
    const fel = [
      ...ob.map((x) => `oberoende: ${x}`),
      ...(q.family !== familj ? [`familjen blev ${q.family}, inte ${familj}`] : []),
      ...(regler.has(regelNyckel(q)) ? ['samma regeltext (utan konstanta egenskaper) som en annan fråga i familjen'] : []),
      ...[q.title, q.rule, ...(q.misstag ?? [])].filter((t) => OGILTIG_TEXT.test(t ?? '') || /[—–]/.test(t ?? '')).map((t) => `ogiltig text: ${t}`),
      ...(!lasta && symmetrier.has(symNyckel(q)) ? ['samma rutnät som en annan fråga efter spegling, vridning eller transponering'] : []),
      ...flerTolkningar(q).map((x) => `flera tolkningar: ${x}`),
      ...([...q.grid.flat(), ...q.options].some(K1) ? ['K1: visarna pekar åt samma håll'] : []),
      ...(/180 grader/.test(q.rule) ? ['halvt varv i regeln'] : []),
      ...kontroll([...fore, q]).filter((x) => !innan.has(x)),
    ];
    if (fel.length) {
      upptagna.delete(key(q.grid));
      utseenden.get(recept).delete(utseendeNyckel(q));
      const l = kvar.get(recept); l.splice(l.indexOf(q), 1);
      notera(`efterkontroll: ${fel[0]}`);
      continue;
    }
    raknare[pre] = nr;
    regler.add(regelNyckel(q));
    strukturer.set(sk, q.id);
    if (!lasta) { const s = symNyckel(q); if (s) symmetrier.set(s, q.id); }
    ut.push(q);
    fatt++;
  }
  rapport.push({ n, cellNamn, mal, fatt, skal });
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
  const sett = new Map();
  for (const q of ut) {
    const s = symNyckel(q);
    if (s && sett.has(s)) throw new Error(`${q.id}: samma rutnät som ${sett.get(s)} efter spegling, vridning eller transponering`);
    if (s) sett.set(s, q.id);
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
const slutFel = lasta ? [] : slut;
console.log(`${slutFel.length ? '✗' : '✓'} ${ut.length} frågor (grund ${perNiva.g}, avancerad ${perNiva.a}, expert ${perNiva.e}) på ${((Date.now() - start) / 1000).toFixed(1)} s`);
for (const x of rapport) {
  console.log(`  ${x.fatt === x.mal ? ' ' : '!'} ${NAMN[x.n].padEnd(9)} ${x.cellNamn.padEnd(12)} ${x.fatt}/${x.mal}`);
  if (x.fatt < x.mal || LOGG) for (const [s, c] of [...x.skal].sort((a, b) => b[1] - a[1]).slice(0, 6)) console.log(`      ${c} × ${s.slice(0, 160)}`);
}
if (slut.length) { console.log(lasta ? '  Slutkontrollen (upplysning, partiet är låst av beslutet):' : '  Slutkontrollen:'); slut.forEach((x) => console.log('  - ' + x)); }
if (!PROV && !CELL) {
  writeFileSync(UT, JSON.stringify(ut, null, 2) + '\n');
  console.log(`Skrev ${UT}`);
}
process.exit(slutFel.length ? 1 : 0);
