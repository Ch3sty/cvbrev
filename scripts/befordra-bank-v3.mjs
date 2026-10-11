// scripts/befordra-bank-v3.mjs
// =============================================================================
// Befordran till bank_version 3 (plan-facit-genvag A4), efter testansvarigs
// granskning. Läser beslutsfilen och skriver de godkända kandidaterna till
// de skarpa V3-filerna:
//
//   grund-v3-parti-01       -> questionBankGrundV3.v7.json
//   avancerad-v3-parti-01   -> questionBankAvanceradV3.v7.json
//   expert-v3-parti-01      -> questionBankExpertV3.v7.json (utan band)
//   plus (alla kandidatfiler, band "plus") -> questionBankExpertPlus.v7.json
//
// Plus-frågor ur parti 01 får fran_version 3, recept = mekanism och p_prior
// ur mallen (tillägget om variation 1.1: P4 och P5 0,35). Ordningen i en
// V3-fil är kandidatfilens; ett id som en gång befordrats får aldrig byta
// innehåll (generatorn och bankversion3.test vaktar det).
//
// Kör: node scripts/befordra-bank-v3.mjs --beslut=docs/qa/bank-v3/beslut.json
//      ... --sla-pa   sätter också BANK_VERSION = 3 i selectQuestions.v7.ts
//
// Beslutsfilen: { "godkanda": ["v7g-v3-vrid-01", ...] }. Strukna frågor står
// inte med; deras recept får nya löpnummer och körs om före befordran.
// Efteråt: hela kedjan (validate, parallel, facit, distraktor --krav=plus,
// geometri, bank-version-3.mjs --kontroll), vitest och build.
// =============================================================================

import { readFileSync, writeFileSync } from 'node:fs';

const arg = (n) => process.argv.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3) ?? null;
const beslutFil = arg('beslut');
if (!beslutFil) { console.error('Ange --beslut=<fil> med { "godkanda": [...] }'); process.exit(2); }
const godkanda = new Set(JSON.parse(readFileSync(beslutFil, 'utf8')).godkanda ?? []);

const K = 'src/lib/logicTestV7/kandidater';
const D = 'src/lib/logicTestV7';
const las = (f) => JSON.parse(readFileSync(f, 'utf8'));
const MALL_P = { P4: 0.35, P5: 0.35 };

const kandidater = [
  ...las(`${K}/grund-v3-parti-01.v7.json`),
  ...las(`${K}/avancerad-v3-parti-01.v7.json`),
  ...las(`${K}/expert-v3-parti-01.v7.json`),
  ...las(`${K}/expert-plus-parti-01.v7.json`),
  ...las(`${K}/expert-plus-parti-02.v7.json`),
].filter((q) => godkanda.has(q.id));

const saknas = [...godkanda].filter((id) => !kandidater.some((q) => q.id === id));
if (saknas.length) { console.error(`✗ finns inte bland kandidaterna: ${saknas.join(', ')}`); process.exit(1); }

const v3 = (q) => {
  const { id, ...rest } = q;
  const ut = { id, ...rest, fran_version: 3 };
  if (!ut.recept) ut.recept = ut.mekanism ?? ut.family;
  if (MALL_P[ut.mekanism] && ut.p_prior === 0.3) ut.p_prior = MALL_P[ut.mekanism];
  return ut;
};
const filer = {
  [`${D}/questionBankGrundV3.v7.json`]: kandidater.filter((q) => /^v7g-/.test(q.id) && q.band !== 'plus'),
  [`${D}/questionBankAvanceradV3.v7.json`]: kandidater.filter((q) => /^v7a-/.test(q.id) && q.band !== 'plus'),
  [`${D}/questionBankExpertV3.v7.json`]: kandidater.filter((q) => /^v7e-/.test(q.id) && q.band !== 'plus'),
  [`${D}/questionBankExpertPlus.v7.json`]: kandidater.filter((q) => q.band === 'plus'),
};
for (const [fil, fragor] of Object.entries(filer)) {
  const tidigare = new Map(las(fil).map((q) => [q.id, JSON.stringify(q)]));
  const nya = fragor.map(v3);
  for (const q of nya) if (tidigare.has(q.id) && tidigare.get(q.id) !== JSON.stringify(q)) { console.error(`✗ ${q.id} skulle byta innehåll i ${fil}`); process.exit(1); }
  writeFileSync(fil, JSON.stringify(nya, null, 2) + '\n');
  console.log(`✓ ${fil}: ${nya.length} frågor`);
}
if (process.argv.includes('--sla-pa')) {
  const f = `${D}/selectQuestions.v7.ts`;
  const s = readFileSync(f, 'utf8');
  writeFileSync(f, s.replace(/export const BANK_VERSION: BankVersion = 2;/, 'export const BANK_VERSION: BankVersion = 3;'));
  console.log('✓ BANK_VERSION = 3');
}
