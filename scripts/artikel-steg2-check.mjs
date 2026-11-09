// scripts/artikel-steg2-check.mjs
// =============================================================================
// Kontrollerar artiklarnas egna uppgifter i talserier, spatial förmåga och
// ordförråd (src/lib/artikelfigurer/{talserier,spatial,ordforrad}.json):
//   1. samma spärrar som testernas banker (talserier TS, spatial SP-B och SP-C)
//   2. ingen artikeluppgift finns i en bank, så att facit i artikeln aldrig
//      är facit i ett prov (SEO-planen 2026-11-10, avsnitt 4.2 krav 3)
//   3. inga av Plikt- och prövningsverkets övningsord (planens risk 4)
//
// Kör: node scripts/artikel-steg2-check.mjs   Exit 1 vid fel.
// =============================================================================

import { readFileSync } from 'node:fs';
import { sparrFel } from './lib/talserie/sparrar.mjs';
import { FORMER, laddaFormer } from './gen-spatial.mjs';

const las = (f) => JSON.parse(readFileSync(f, 'utf8'));
const NIV = ['Grund', 'Avancerad', 'Expert'];
const fel = [];
const ids = new Set();
const unik = (id) => {
  if (ids.has(id)) fel.push(`${id}: id finns två gånger`);
  ids.add(id);
};

// ---------------------------------------------------------------- talserier
const tsBank = NIV.flatMap((n) => las(`src/lib/talserierV1/bank${n}.json`));
const tsBankRad = new Set(tsBank.map((q) => q.visade.join(',')));
for (const q of las('src/lib/artikelfigurer/talserier.json')) {
  unik(q.id);
  fel.push(...sparrFel(q).map((f) => `${q.id}: ${f}`));
  if (tsBankRad.has(q.visade.join(','))) fel.push(`${q.id}: raden finns i en bank`);
  if (q.options.length !== 5) fel.push(`${q.id}: ${q.options.length} alternativ`);
}

// ---------------------------------------------------------- spatial förmåga
await laddaFormer();
const spBank = NIV.flatMap((n) => las(`src/lib/spatialV1/bank${n}.json`));
const spNycklar = new Set(spBank.map((q) => FORMER[q.form].nyckel(q)));
for (const q of las('src/lib/artikelfigurer/spatial.json')) {
  unik(q.id);
  fel.push(...FORMER[q.form].sparrar(q));
  if (spNycklar.has(FORMER[q.form].nyckel(q))) fel.push(`${q.id}: uppgiften finns i en bank`);
  if (q.options.length !== 4) fel.push(`${q.id}: ${q.options.length} alternativ`);
}

// ---------------------------------------------------------------- ordförråd
const ofBank = NIV.flatMap((n) => las(`src/lib/ordforradV1/bank${n}.json`));
const ofOrd = new Set(ofBank.map((q) => q.ord.toLowerCase()));
/** Orden i Plikt- och prövningsverkets övningsuppgifter får inte återges. */
const PLIKTVERKET = new Set(['gata', 'dag']);
for (const q of las('src/lib/artikelfigurer/ordforrad.json')) {
  unik(q.id);
  const ord = q.ord.toLowerCase();
  if (ofOrd.has(ord)) fel.push(`${q.id}: ordet ${ord} finns i en bank`);
  if (PLIKTVERKET.has(ord)) fel.push(`${q.id}: ordet ${ord} är Pliktverkets övningsord`);
  if (q.options.length !== 5) fel.push(`${q.id}: ${q.options.length} alternativ`);
  if (new Set(q.options).size !== 5) fel.push(`${q.id}: två alternativ är lika`);
  if (q.options.some((o) => o.toLowerCase() === ord)) fel.push(`${q.id}: ordet står bland alternativen`);
  if (!(q.correctAnswer >= 0 && q.correctAnswer < 5)) fel.push(`${q.id}: facit utanför alternativen`);
  if (q.typ !== 'synonym' && q.typ !== 'antonym') fel.push(`${q.id}: okänd typ ${q.typ}`);
  if (!q.betyder || !q.exempel) fel.push(`${q.id}: saknar betydelse eller exempelmening`);
  if (/[—–]/.test(`${q.betyder}${q.exempel}`)) fel.push(`${q.id}: tankstreck i texten`);
}

for (const f of fel) console.log(f);
console.log(fel.length ? `${fel.length} fel` : `Artiklarnas ${ids.size} uppgifter klarar spärrarna och finns inte i bankerna.`);
process.exit(fel.length ? 1 : 0);
