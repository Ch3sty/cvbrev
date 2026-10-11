// scripts/v7-distraktor-check.mjs
// =============================================================================
// Distraktorkontroll för matrisbankerna (V7).
//
// Kör: node scripts/v7-distraktor-check.mjs                    (alla sex banker, rapport)
//      node scripts/v7-distraktor-check.mjs <fil.json>         (en fil, rapport, exit 0)
//      node scripts/v7-distraktor-check.mjs <fil.json> --krav=plus
//                                                              (kraven för "svår plus", exit 1 vid fel)
//      node scripts/v7-distraktor-check.mjs <fil.json> --krav=v3
//                                                              (S5 och S6 för fran_version 3, exit 1 vid fel;
//                                                               --krav=plus tar med dem också)
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
//   5. v7-geometri-check.mjs       mått G1 till G12
//   6. bank-version-3.mjs --kontroll   pensionslistan i takt med bankerna
// =============================================================================

import { readFileSync } from 'node:fs';
import { analysera, plusFel, facitUdda, eliminerbara } from './lib/matris/distraktorer.mjs';

import { ALLA_BANKFILER } from './lib/matris/version.mjs';
import { existsSync } from 'node:fs';

const ALLA = ALLA_BANKFILER.filter((f) => existsSync(f));
const args = process.argv.slice(2);
const krav = args.find((a) => a.startsWith('--krav='))?.slice('--krav='.length) ?? null;
if (krav && krav !== 'plus' && krav !== 'v3') { console.error(`Okänt krav: ${krav} (plus eller v3)`); process.exit(2); }
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
    // S5 och S6 (plan-facit-genvag avsnitt 3): facit sticker ut, distraktorer som kan strykas genom majoritet.
    const udda = facitUdda(q);
    const strykbara = eliminerbara(q);
    console.log(`  ${q.id}: |R| ${a.R.length} (${a.R.join(', ') || 'ingen'}), nära miss ${a.naraMiss}${bryter.length ? ` (bryter ${bryter.join(', ')})` : ''}, tomma ${a.tomma}, kopior ${a.kopior}${a.dubbla ? `, dubbel diagnos (op eller vrid) ${a.dubbla}` : ''}, S5 ${udda.length ? udda.join('+') : 0}, S6 ${strykbara.length}`);
    if (krav === 'plus' && q.band === 'plus') fel.push(...plusFel(a));
    // Version 3: S5 noll, S6 högst en (noll på expert och plus) för frågor med fran_version 3.
    if ((krav === 'v3' || krav === 'plus') && q.fran_version >= 3) {
      if (udda.length) fel.push(`${q.id}: S5 facit sticker ut i ${udda.join(', ')}`);
      const tak = q.band === 'plus' || /^v7e-/.test(q.id) ? 0 : 1;
      if (strykbara.length > tak) fel.push(`${q.id}: S6 ${strykbara.length} distraktorer kan strykas (${strykbara.join(', ')}), högst ${tak}`);
    }
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
