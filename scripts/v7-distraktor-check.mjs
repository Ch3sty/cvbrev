// scripts/v7-distraktor-check.mjs
// =============================================================================
// Distraktorkontroll för matrisbankerna (V7).
//
// Kör: node scripts/v7-distraktor-check.mjs                    (alla sex banker, rapport)
//      node scripts/v7-distraktor-check.mjs <fil.json>         (en fil, rapport, exit 0)
//      node scripts/v7-distraktor-check.mjs <fil.json> --krav=plus
//                                                              (kraven för "svår plus", exit 1 vid fel)
//
// Per fråga: id, antal regler |R|, antal nära miss (distraktorer som stämmer
// på alla regler utom en), vilka regler de bryter, antal tomma (stämmer på
// ingen regel) och antal kopior av synliga rutor. Sist en fördelning per fil
// över antalet nära miss. Logiken ligger i scripts/lib/matris/distraktorer.mjs.
//
// Valideringskedjan för matrisfrågor är nu, i den här ordningen:
//   1. validate-v7-questions.mjs   struktur, dubbletter, triviala frågor
//   2. v7-parallel-check.mjs       inga parallella rader eller kolumner
//   3. v7-facit-check.mjs          facit entydigt, family och misstag, strikt kontroll
//   4. v7-distraktor-check.mjs     nära miss och tomma distraktorer (det här skriptet)
//   5. v7-geometri-check.mjs       mått G1 till G6 (när skriptet finns på main)
// =============================================================================

import { readFileSync } from 'node:fs';
import { analysera, plusFel } from './lib/matris/distraktorer.mjs';

const ALLA = [
  'src/lib/logicTestV7/questionBankGrund.v7.json',
  'src/lib/logicTestV7/questionBank.v7.json',
  'src/lib/logicTestV7/questionBankExpert.v7.json',
  'src/lib/logicTestV7/questionBankGrund3c.v7.json',
  'src/lib/logicTestV7/questionBankAvancerad3c.v7.json',
  'src/lib/logicTestV7/questionBankExpert3c.v7.json',
];
const args = process.argv.slice(2);
const krav = args.find((a) => a.startsWith('--krav='))?.slice('--krav='.length) ?? null;
if (krav && krav !== 'plus') { console.error(`Okänt krav: ${krav} (bara plus finns)`); process.exit(2); }
const filer = args.filter((a) => !a.startsWith('--'));
const lista = filer.length ? filer : ALLA;

const fel = [];
let antal = 0;
for (const fil of lista) {
  const bank = JSON.parse(readFileSync(fil, 'utf8'));
  const fordelning = [0, 0, 0, 0, 0, 0];
  let otolkade = 0;
  console.log(`\n${fil}`);
  for (const q of bank) {
    if (q.pensionerad === true) continue;
    antal++;
    const a = analysera(q);
    if (!a.ok) { otolkade++; console.log(`  ${q.id}: ingen tolkning (${a.orsak})`); if (krav) fel.push(`${q.id}: ${a.orsak}`); continue; }
    fordelning[a.naraMiss]++;
    const bryter = a.alternativ.filter((x) => !x.facit && x.naraMiss).map((x) => x.bryter.join('+'));
    console.log(`  ${q.id}: |R| ${a.R.length} (${a.R.join(', ') || 'ingen'}), nära miss ${a.naraMiss}${bryter.length ? ` (bryter ${bryter.join(', ')})` : ''}, tomma ${a.tomma}, kopior ${a.kopior}`);
    if (krav === 'plus') fel.push(...plusFel(a));
  }
  console.log(`  Fördelning, antal nära miss per fråga: ${fordelning.map((n, i) => `${i}: ${n}`).join(', ')}${otolkade ? `, utan tolkning: ${otolkade}` : ''}`);
}

console.log(`\nDistraktorkontroll: ${antal} frågor i ${lista.length} filer${krav ? `, krav ${krav}` : ', bara rapport'}`);
if (!krav) process.exit(0);
if (fel.length === 0) {
  console.log('✓ Alla frågor klarar kraven: minst tre nära miss, varje regel bruten, inga tomma, högst en kopia, inga tomma figurer.');
  process.exit(0);
}
console.log(`✗ ${fel.length} fel:\n`);
fel.forEach((x) => console.log('  - ' + x));
process.exit(1);
