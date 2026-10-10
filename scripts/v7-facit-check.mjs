// scripts/v7-facit-check.mjs
// =============================================================================
// Maskinell facit- och latin-square-kontroll av matrisbankerna (V7).
//
// Kör: node scripts/v7-facit-check.mjs            (alla sex banker)
//      node scripts/v7-facit-check.mjs <fil.json> (en bank)
//
// För varje fråga, ur de åtta synliga rutorna utan att titta på facit
// (scripts/lib/matris/tolka.mjs):
//   1. Varje dimension har en regel, och ingen annan enkel regel ger ett
//      annat svar (tvetydighet).
//   2. Regeln pekar på exakt ett alternativ, och det är facit.
//   3. Latinska kvadrater: med facit isatt har varje rad och kolumn varje
//      värde exakt en gång, och ingen distraktor fullbordar kvadraten.
//   4. family och misstag i banken är desamma som generatorns logik ger
//      (misstag som står i misstagGranskas räknas inte).
// Över alla banker: unika id och inget rutnät två gånger.
//
// 3c-bankerna körs dessutom genom den strikta kvalitetskontrollen
// (scripts/lib/matris/kontroll.mjs). För de 84 ursprungliga skrivs den som
// upplysning, eftersom de är frysta och redan granskade.
// =============================================================================

import { readFileSync } from 'node:fs';
import { tolka, familjFor, POS } from './lib/matris/tolka.mjs';
import { misstagFor } from './lib/matris/misstag.mjs';
import { kontrollera } from './lib/matris/kontroll.mjs';
import { stable, vKey } from './lib/matris/celler.mjs';

const ALLA = [
  'src/lib/logicTestV7/questionBankGrund.v7.json',
  'src/lib/logicTestV7/questionBank.v7.json',
  'src/lib/logicTestV7/questionBankExpert.v7.json',
  'src/lib/logicTestV7/questionBankGrund3c.v7.json',
  'src/lib/logicTestV7/questionBankAvancerad3c.v7.json',
  'src/lib/logicTestV7/questionBankExpert3c.v7.json',
];
const filer = process.argv[2] ? [process.argv[2]] : ALLA;
const fel = [];
const info = [];
const ids = new Map();
const rutnat = new Map();
let antal = 0;

for (const fil of filer) {
  const bank = JSON.parse(readFileSync(fil, 'utf8'));
  const ny = /3c\.v7\.json$/.test(fil);
  for (const q of bank) {
    antal++;
    const tag = `[${q.id}]`;
    if (ids.has(q.id)) fel.push(`${tag} id finns också i ${ids.get(q.id)}`);
    ids.set(q.id, fil);
    const g = stable(q.grid);
    if (rutnat.has(g)) (ny ? fel : info).push(`${tag} samma rutnät som ${rutnat.get(g)}`);
    else rutnat.set(g, q.id);

    const t = tolka(q);
    if (!t.ok) { fel.push(`${tag} ingen regel för ${(t.saknar ?? [t.orsak]).join(', ')}`); continue; }
    if (t.tvetydig.length) fel.push(`${tag} tvetydig: ${t.tvetydig.map((x) => x.dim + ' ' + x.regler.join(' / ')).join('; ')}`);
    if (t.traffar.length !== 1) fel.push(`${tag} ${t.traffar.length} alternativ stämmer med regeln (${t.traffar.join(', ')})`);
    else if (t.traffar[0] !== q.correctAnswer) fel.push(`${tag} regeln pekar på alternativ ${t.traffar[0] + 1}, facit är ${q.correctAnswer + 1}`);

    // latinska kvadrater med facit isatt
    for (const [dimId, r] of Object.entries(t.regel)) {
      if (r.regel !== 'latin') continue;
      const val = (c) => vKey(t.dimsVy(c).find((d) => d.id === dimId).varde);
      const full = q.grid.map((rad) => rad.slice());
      full[2][2] = q.options[q.correctAnswer];
      const M = full.map((rad) => rad.map(val));
      const alla = new Set(M.flat());
      const ok = alla.size === 3 && [0, 1, 2].every((i) => new Set(M[i]).size === 3 && new Set(M.map((rad) => rad[i])).size === 3);
      if (!ok) fel.push(`${tag} ${dimId} är inte en latinsk kvadrat med facit isatt`);
      q.options.forEach((o, i) => {
        if (i === q.correctAnswer) return;
        const alla2 = Object.entries(t.regel).filter(([, x]) => x.regel === 'latin').every(([d]) => vKey(t.dimsVy(o).find((x) => x.id === d).varde) === vKey(t.pred[d]));
        const ovriga = Object.entries(t.regel).filter(([, x]) => x.regel !== 'latin').every(([d]) => vKey(t.dimsVy(o).find((x) => x.id === d).varde) === vKey(t.pred[d]));
        if (alla2 && ovriga) fel.push(`${tag} alternativ ${i + 1} fullbordar också kvadraten`);
      });
    }

    // fälten
    const fam = familjFor(q, t);
    if (q.family !== fam) fel.push(`${tag} family är ${q.family}, tolkningen säger ${fam}`);
    const m = misstagFor(q, t).map((x) => x ?? '');
    const granskas = new Set(q.misstagGranskas ?? []);
    (q.misstag ?? []).forEach((x, i) => {
      if (granskas.has(i)) return;
      if (x !== m[i]) fel.push(`${tag} misstag ${i + 1} skiljer sig från generatorns: "${x}" mot "${m[i]}"`);
    });

    const k = kontrollera(q, { strikt: true, familj: q.family });
    if (ny) fel.push(...k.map((x) => `[strikt] ${x}`));
    else info.push(...k.filter((x) => !/saknar misstagstext/.test(x)).map((x) => `[strikt, fryst] ${x}`));
  }
}

console.log(`\nFacit- och latin-square-kontroll: ${antal} frågor i ${filer.length} banker\n`);
if (info.length) {
  console.log(`Upplysning om de frysta bankerna (${info.length}), räknas inte som fel:`);
  info.forEach((x) => console.log('  · ' + x));
  console.log('');
}
if (fel.length === 0) {
  console.log('✓ Facit stämmer, inga tvetydiga frågor, alla latinska kvadrater håller, family och misstag i takt med generatorn.');
  process.exit(0);
}
console.log(`✗ ${fel.length} fel:\n`);
fel.forEach((x) => console.log('  - ' + x));
process.exit(1);
