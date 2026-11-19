// scripts/befordra-matris-parti-05.mjs
// =============================================================================
// Aktiverar matrislogikens parti 05 (2026-11-19, omgång 2) EFTER
// testansvarigs granskning. Läser beslutsfilen och lägger de godkända
// kandidaterna ur src/lib/logicTestV7/kandidater/matris-parti-05.v7.json
// sist i de skarpa V3-filerna, med fran_version: 6:
//
//   v7g-b6-*  -> questionBankGrundV3.v7.json
//   v7a-b6-*  -> questionBankAvanceradV3.v7.json
//   v7e-b6-*  -> questionBankExpertV3.v7.json
//
// Steg 1 (utan --sla-pa) ändrar ingenting för någon användare: frågorna med
// fran_version 6 är inte valbara i bank_version 3 (klassiska test) eller i
// TRANINGSVERSION 5 (passen, Nivåkollen, övningsprovet). De finns bara i
// ALLA_<nivå>, så att rättningen hittar dem när de väl visas.
// Steg 2 (--sla-pa) höjer TRANINGSVERSION från 5 till 6 i
// selectQuestions.v7.ts. Pass som redan pågår har sitt urval sparat i meta
// och påverkas inte, och klassiska test står kvar på BANK_VERSION 3.
//
// Kör: node scripts/befordra-matris-parti-05.mjs --beslut=docs/qa/matris-parti-05/beslut.json
//      ... --sla-pa
// Beslutsfilen: { "godkanda": ["v7g-b6-vrid-01", ...] }. Ett id som redan
// finns i en V3-fil skrivs inte två gånger, och ett befordrat id får aldrig
// byta innehåll.
// Efteråt: validate-v7-questions, v7-parallel-check, v7-facit-check,
// v7-distraktor-check --krav=v3 och v7-geometri-check på de tre V3-filerna,
// samt vitest för logicTestV7 och traning (traningsversion.test.ts klarar
// version 5 och 6, parti05.test.ts räknar kandidaterna).
// =============================================================================

import { readFileSync, writeFileSync } from 'node:fs';

const arg = (n) => process.argv.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3) ?? null;
const beslutFil = arg('beslut');
if (!beslutFil) { console.error('Ange --beslut=<fil> med { "godkanda": [...] }'); process.exit(2); }
const godkanda = new Set(JSON.parse(readFileSync(beslutFil, 'utf8')).godkanda ?? []);

const D = 'src/lib/logicTestV7';
const las = (f) => JSON.parse(readFileSync(f, 'utf8'));
const kandidater = las(`${D}/kandidater/matris-parti-05.v7.json`).filter((q) => godkanda.has(q.id));
const saknas = [...godkanda].filter((id) => !kandidater.some((q) => q.id === id));
if (saknas.length) { console.error(`✗ finns inte bland kandidaterna: ${saknas.join(', ')}`); process.exit(1); }

const MAL = { g: `${D}/questionBankGrundV3.v7.json`, a: `${D}/questionBankAvanceradV3.v7.json`, e: `${D}/questionBankExpertV3.v7.json` };
for (const [n, fil] of Object.entries(MAL)) {
  const bank = las(fil);
  const finns = new Map(bank.map((q) => [q.id, q]));
  let nya = 0;
  for (const q of kandidater.filter((x) => x.id.startsWith(`v7${n}-b6-`))) {
    const ut = { ...q, fran_version: 6 };
    if (finns.has(q.id)) {
      if (JSON.stringify(finns.get(q.id)) !== JSON.stringify(ut)) { console.error(`✗ ${q.id} finns redan i ${fil} med annat innehåll`); process.exit(1); }
      continue;
    }
    bank.push(ut); nya++;
  }
  writeFileSync(fil, JSON.stringify(bank, null, 2) + '\n');
  console.log(`✓ ${fil}: ${nya} nya`);
}

if (process.argv.includes('--sla-pa')) {
  const f = `${D}/selectQuestions.v7.ts`;
  const text = readFileSync(f, 'utf8');
  if (!/export const TRANINGSVERSION = 5;/.test(text)) { console.error('✗ hittar inte TRANINGSVERSION = 5'); process.exit(1); }
  writeFileSync(f, text.replace('export const TRANINGSVERSION = 5;', 'export const TRANINGSVERSION = 6;'));
  console.log('✓ TRANINGSVERSION = 6');
}
