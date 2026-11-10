// scripts/gen-artikel-steg2.mjs
// =============================================================================
// Bygger artiklarnas egna uppgifter i talserier och spatial förmåga (SEO-planen
// för de nya testerna 2026-11-10, krav 3 i avsnitt 4.2): samma generatorer och
// spärrar som testernas banker, men ett eget frö, och varje uppgift kontrolleras
// mot bankerna så att ingen artikeluppgift finns i ett test. Facit i artikeln
// får aldrig vara facit i provet.
//
// Kör: node scripts/gen-artikel-steg2.mjs          (skriver filerna)
//      node scripts/gen-artikel-steg2.mjs --torr   (skriver inget)
//
// Ut: src/lib/artikelfigurer/talserier.json och spatial.json. Kontrollen körs
// igen av scripts/artikel-steg2-check.mjs.
// =============================================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { NIVAER, byggFraga, valjAlternativ, misstagText, slumpare, FAMILJER, valj } from './lib/talserie/generera.mjs';
import { sparrFel } from './lib/talserie/sparrar.mjs';
import { FORMER, laddaFormer } from './gen-spatial.mjs';

const torr = process.argv.includes('--torr');
const FRO = 'artikel-steg2-2026-11-10';
const NIV = ['Grund', 'Avancerad', 'Expert'];

// ------------------------------------------------------------- talserier

const tsBank = NIV.flatMap((n) => JSON.parse(readFileSync(`src/lib/talserierV1/bank${n}.json`, 'utf8')));
const tsSedda = new Set(tsBank.map((q) => q.visade.join(',')));
const tsParams = new Set(tsBank.map((q) => `${q.family}:${JSON.stringify(q.params)}`));

/** Vilka uppgifter artiklarna behöver: id, familj, nivå. */
const TALSERIER = [
  // N2, en per regelfamilj, i familjens enklaste nivå
  ['ts-art-fam-aritmetisk', 'aritmetisk', 'grund'],
  ['ts-art-fam-geometrisk', 'geometrisk', 'grund'],
  ['ts-art-fam-andra', 'andra_ordningen', 'grund'],
  ['ts-art-fam-vaxelvis', 'vaxelvis', 'grund'],
  ['ts-art-fam-varvad', 'varvad', 'avancerad'],
  ['ts-art-fam-geodiff', 'geodiff', 'avancerad'],
  ['ts-art-fam-affin', 'affin', 'avancerad'],
  ['ts-art-fam-summa', 'summa', 'expert'],
  // N2, tolv graderade uppgifter
  ['ts-art-01', 'aritmetisk', 'grund'],
  ['ts-art-02', 'geometrisk', 'grund'],
  ['ts-art-03', 'vaxelvis', 'grund'],
  ['ts-art-04', 'andra_ordningen', 'grund'],
  ['ts-art-05', 'vaxelvis', 'avancerad'],
  ['ts-art-06', 'varvad', 'avancerad'],
  ['ts-art-07', 'geodiff', 'avancerad'],
  ['ts-art-08', 'affin', 'avancerad'],
  ['ts-art-09', 'andra_ordningen', 'expert'],
  ['ts-art-10', 'varvad', 'expert'],
  ['ts-art-11', 'affin', 'expert'],
  ['ts-art-12', 'summa', 'expert'],
  // N1, deltest 3 (två luckor som i I-provet)
  ['ts-art-iprov', 'varvad', 'avancerad'],
];

function byggTalserie(id, familj, niva, egna) {
  const rng = slumpare(`${FRO}:${id}`);
  const N = NIVAER[niva];
  for (let i = 0; i < 20000; i++) {
    const params = FAMILJER[familj].params(rng, niva);
    if (tsParams.has(`${familj}:${JSON.stringify(params)}`)) continue;
    const f = byggFraga({ familj, params, niva, visade: valj(rng, N.visade), id });
    if (!f) continue;
    const nyckel = f.visade.join(',');
    if (tsSedda.has(nyckel) || egna.has(nyckel)) continue;
    // Ingen artikeluppgift får heller dela regel och start med en bankuppgift.
    if (tsBank.some((b) => b.family === familj && b.visade[0] === f.visade[0] && b.regelnyckel === f.regelnyckel)) continue;
    const val = valjAlternativ(f, [0, 0, 0, 0, 0], rng);
    if (!val) continue;
    const q = {
      id,
      niva,
      family: familj,
      params,
      regel: f.regel,
      regelnyckel: f.regelnyckel,
      visade: f.visade,
      luckor: N.luckor,
      options: val.alla.map((x) => x.v),
      correctAnswer: val.plats,
      typer: val.alla.map((x) => x.typer),
      misstag: val.alla.map((x) => (x.typer.length ? misstagText(x.typer, { sista: f.visade[f.visade.length - 1], varde: x.v, facit: f.facit }) : '')),
      bagar: f.bagar,
      difficulty: 1,
      p_prior: 0.5,
      fran_version: 1,
    };
    if (sparrFel(q).length) continue;
    egna.add(nyckel);
    return q;
  }
  throw new Error(`${id}: ingen uppgift`);
}

const egnaTs = new Set();
const talserier = TALSERIER.map(([id, f, n]) => byggTalserie(id, f, n, egnaTs));

// ------------------------------------------------------------- spatial

await laddaFormer();
const spBank = NIV.flatMap((n) => JSON.parse(readFileSync(`src/lib/spatialV1/bank${n}.json`, 'utf8')));
const spNycklar = new Set(spBank.map((q) => FORMER[q.form].nyckel(q)));

/** U1 och N1: id, form, nivå, klipp. */
const SPATIAL = [
  ['sp-art-u1-vik', 'B', 'grund'],
  ['sp-art-u1-kub', 'C', 'grund'],
  ['sp-art-iprov-klipp', 'B', 'expert'],
  ['sp-art-iprov-kub', 'C', 'avancerad'],
  // Pappersvikning i I-provets riktning (form D, 2026-11-10): deltest 2 i i-prov och rotationsguiden
  ['sp-art-iprov-ihop', 'D', 'avancerad'],
  ['sp-art-u1-ihop', 'D', 'grund'],
];

function byggSpatial(id, form, niva, egna) {
  const F = FORMER[form];
  for (let i = 0; i < 20000; i++) {
    const q = F.bygg({ niva, id, fro: `${FRO}:${id}:${i}` });
    if (!q) continue;
    if (F.sparrar(q).length) continue;
    const k = F.nyckel(q);
    if (spNycklar.has(k) || egna.has(k)) continue;
    egna.add(k);
    return q;
  }
  throw new Error(`${id}: ingen uppgift`);
}

const egnaSp = new Set();
const spatial = SPATIAL.map(([id, form, niva]) => byggSpatial(id, form, niva, egnaSp));

for (const q of talserier) console.log(q.id, q.visade.join(' '), '|', q.options[q.correctAnswer].join(' och '), '|', q.regel);
for (const q of spatial) console.log(q.id, q.form, q.klipp ? 'klipp' : '', q.forklaring);

if (!torr) {
  writeFileSync('src/lib/artikelfigurer/talserier.json', JSON.stringify(talserier, null, 1) + '\n');
  writeFileSync('src/lib/artikelfigurer/spatial.json', JSON.stringify(spatial, null, 1) + '\n');
}
