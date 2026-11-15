// scripts/artikelbild/gen-uppgifter.mjs
// =============================================================================
// Artikelbildernas egna uppgifter (docs/design/koncept-artikelbilder-2026-11-14.md,
// avsnitt 3): en matris eller figurserie per testartikel som inte har en egen
// uppgift i texten. Samma generatorer och spärrar som testernas banker
// (scripts/lib/matris, scripts/lib/serie), egna id och eget frö. Inget rutnät
// och ingen rad som finns i en bank, en kandidatfil eller artiklarnas figurer.
//
// Bilden visar bara rutnätet med luckan, aldrig alternativ eller facit, men
// uppgiften är ändå en riktig uppgift med en entydig regel (tolka i bygg()).
//
// Kör: node scripts/artikelbild/gen-uppgifter.mjs
// Ut:  src/lib/artikelfigurer/bild-matriser.json och bild-serier.json
// Kontroll efteråt:
//   node scripts/v7-facit-check.mjs src/lib/artikelfigurer/bild-matriser.json
//   node scripts/v7-geometri-check.mjs src/lib/artikelfigurer/bild-matriser.json
//   node scripts/v7-facit-check.mjs --serie src/lib/artikelfigurer/bild-serier.json
//   node scripts/v7-geometri-check.mjs --serie src/lib/artikelfigurer/bild-serier.json
// =============================================================================

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { bygg, key } from '../lib/matris/generera.mjs';
import { NIVAER } from '../lib/matris/recept.mjs';
import { upptagnaRutnat } from '../lib/matris/kor-generator.mjs';
import { MALLAR } from '../lib/serie/recept-serie.mjs';
import { bygg as byggSerie } from '../lib/serie/generera-serie.mjs';
import { radNyckel } from '../lib/serie/struktur.mjs';
import { mulberry32, hashString } from '../lib/serie/slump.mjs';

const UT = 'src/lib/artikelfigurer/bild-matriser.json';
const UT_SERIE = 'src/lib/artikelfigurer/bild-serier.json';
const las = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : []);

/** Matriserna: id → recept ur bankernas receptlistor (regeln, inte frågan). */
const MATRISER = [
  // [id, recept att pröva i ordning (id i recept.mjs)]. Första som går att bygga vinner.
  ['bild-m-01', ['v7g-3c-lform-01', 'v7g-3c-lform-02']],
  ['bild-m-02', ['v7a-3c-over-01', 'v7a-3c-over-02']],
  ['bild-m-03', ['v7g-3c-lant-01', 'v7g-3c-lant-03']],
  ['bild-m-04', ['v7a-3c-speg-01', 'v7a-3c-speg-02']],
  ['bild-m-05', ['v7a-3c-lfler-01', 'v7a-3c-lfler-02']],
  ['bild-m-06', ['v7g-3c-lform-05', 'v7g-3c-lform-06']],
  ['bild-m-07', ['v7a-3c-tva-03', 'v7a-3c-tva-04']],
  ['bild-m-08', ['v7g-3c-over-03', 'v7g-3c-over-04']],
  ['bild-m-09', ['v7g-3c-speg-02', 'v7g-3c-speg-03']],
  ['bild-m-10', ['v7a-3c-lant-02', 'v7a-3c-lant-03']],
];
/** Figurserierna: id → mall och variant ur recept-serie.mjs. */
const SERIER = [
  ['bild-s-01', 'F1', 'sektor-steg'],
  ['bild-s-02', 'F2', 'block-antal'],
];

// ------------------------------------------------------------------ matriser
const upptagna = upptagnaRutnat(UT);
for (const f of ['matriser', 'analogier', 'serier']) for (const q of las(`src/lib/artikelfigurer/${f}.json`)) if (q.grid) upptagna.add(key(q.grid));
const recept = new Map(Object.values(NIVAER).flatMap((n) => n.recept).map((r) => [r.id, r]));

const ut = [];
const utSerie = [];
const tidigare = new Map(las(UT).map((q) => [q.id, q]));
for (const [id, receptIds] of MATRISER) {
  // Eget id ger eget frö: samma regel som bankens fråga, ett annat rutnät.
  let q = null;
  const fel = [];
  for (const receptId of receptIds) {
    const rc = recept.get(receptId);
    if (!rc) throw new Error(`${id}: okänt recept ${receptId}`);
    try { q = { ...bygg({ ...rc, id }, upptagna, { kandidatKrav: true }), recept: receptId }; break; } catch (e) { fel.push(`${receptId}: ${e.message.split('\n')[0]}`); }
  }
  if (!q) throw new Error(`${id}: inget recept gick att bygga\n  ${fel.join('\n  ')}`);
  if (tidigare.has(id) && key(tidigare.get(id)) !== key(q)) throw new Error(`${id}: innehållet skulle ändras`);
  upptagna.add(key(q.grid));
  ut.push(q);
}

// ------------------------------------------------------------------ serier
const radNycklar = new Set();
const SERIEBANKER = ['src/lib/figurserierV1', 'src/lib/figurserierV1/kandidater', 'src/lib/figurserierV1/kandidater/generator', 'src/lib/figurserierV1/kandidater/omgang1', 'src/lib/figurserierV1/kandidater/omgang2'];
for (const d of SERIEBANKER) {
  if (!existsSync(d)) continue;
  for (const f of readdirSync(d).filter((x) => x.endsWith('.json') && x !== 'familjer.json')) {
    for (const q of las(path.posix.join(d, f))) if (q && q.rad) radNycklar.add(radNyckel(q));
  }
}
for (const [id, mallId, variantNamn] of SERIER) {
  const mall = MALLAR.find((m) => m.id === mallId);
  const variant = mall.varianter.find((v) => v.namn === variantNamn);
  const r = mulberry32(hashString(`artikelbild:${id}`));
  let q = null;
  for (let i = 0; i < 400 && !q; i++) {
    const k = byggSerie(r, mall, variant, { id, pos: 2 });
    if (k && !radNycklar.has(radNyckel(k))) q = k;
  }
  if (!q) throw new Error(`${id}: ingen ny rad`);
  radNycklar.add(radNyckel(q));
  utSerie.push(q);
}

writeFileSync(UT, JSON.stringify(ut, null, 1) + '\n');
writeFileSync(UT_SERIE, JSON.stringify(utSerie, null, 1) + '\n');
console.log(`${UT}: ${ut.length}, ${UT_SERIE}: ${utSerie.length}`);
for (const q of [...ut, ...utSerie]) console.log(`  ${q.id}  ${q.title}: ${q.rule}`);
