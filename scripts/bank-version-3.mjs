// scripts/bank-version-3.mjs
// =============================================================================
// Pensionslistan för bank_version 3 (plan-facit-genvag 2.5 och A2).
//
// Regeln (scripts/lib/matris/version.mjs, pensionsListaV3): varje fråga som
// är valbar i version 2 och har facit lika rutan uppe till vänster (spärren
// S1, per dimension; 149 frågor), plus de uttryckligen uppräknade (tomma
// alternativ och två rörelser i takt; åtta frågor, eftersom v7a-3c-lform-03
// redan har facit på ruta 0). Totalt 157: grund 64, avancerad 45, expert 48.
// På expert försvinner därmed alla rena rörelsefamiljer (vridning, vandring,
// mönsterrotation, rotation med byte).
//
// Frågorna får fältet pensionerad_fran: 3 i sin bankfil. De ligger kvar och
// är valbara i version 2 (valbarI), så att version 2-urvalet och gamla
// sessioners resultatsidor är oförändrade.
//
// Kör: node scripts/bank-version-3.mjs             (skriver listan till UT)
//      node scripts/bank-version-3.mjs --skriv     (sätter pensionerad_fran: 3
//                                                    i bankfilerna, rad för rad)
//      node scripts/bank-version-3.mjs --kontroll  (felar om listan, fälten i
//                                                    bankerna eller filen UT
//                                                    inte stämmer med varandra)
// =============================================================================

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { pensionsListaV3, lasBanker, UTTRYCKLIGA_V3 } from './lib/matris/version.mjs';

export const UT = 'docs/design/tester-v2-2026-10-11/bank-version-3-pensioneras.json';

/** Sätter "pensionerad_fran": 3 efter id-raden, utan att formatera om filen. */
function skrivFalt(fil, ids) {
  let s = readFileSync(fil, 'utf8');
  const nl = s.includes('\r\n') ? '\r\n' : '\n';
  let n = 0;
  for (const id of ids) {
    const re = new RegExp(`^([ \\t]*)"id": "${id.replace(/[-]/g, '\\-')}",(\\r?\\n)(?![ \\t]*"pensionerad_fran")`, 'm');
    if (!re.test(s)) continue;
    s = s.replace(re, (_m, ind) => `${ind}"id": "${id}",${nl}${ind}"pensionerad_fran": 3,${nl}`);
    n++;
  }
  writeFileSync(fil, s);
  return n;
}

const lista = pensionsListaV3();
const per = {};
lista.forEach((x) => { per[x.niva] = (per[x.niva] ?? 0) + 1; });
const data = {
  beskrivning: 'Frågor som pensioneras i bank_version 3 (plan-facit-genvag 2.5): facit lika rutan uppe till vänster, plus uppräknade med tomt alternativ eller två rörelser i takt. Fältet pensionerad_fran: 3 i bankfilen; valbara i version 2.',
  antal: lista.length,
  per_niva: per,
  uttryckliga: UTTRYCKLIGA_V3,
  ids: lista.map((x) => x.id),
  fragor: lista,
};

if (process.argv.includes('--skriv')) {
  const perFil = {};
  for (const x of lista) (perFil[x.fil] ??= []).push(x.id);
  let n = 0;
  for (const [fil, ids] of Object.entries(perFil)) n += skrivFalt(fil, ids);
  console.log(`✓ pensionerad_fran: 3 satt på ${n} nya frågor (${lista.length} på listan)`);
} else if (process.argv.includes('--kontroll')) {
  const fel = [];
  const banker = lasBanker();
  const listan = new Set(data.ids);
  for (const q of Object.values(banker).flat()) {
    if (q.pensionerad_fran === 3 && !listan.has(q.id)) fel.push(`${q.id} har pensionerad_fran: 3 men står inte på listan`);
    if (listan.has(q.id) && q.pensionerad_fran !== 3) fel.push(`${q.id} står på listan men saknar pensionerad_fran: 3 (kör --skriv)`);
  }
  if (!existsSync(UT)) fel.push(`${UT} saknas`);
  else {
    const fil = JSON.parse(readFileSync(UT, 'utf8'));
    if ([...fil.ids].sort().join(',') !== [...data.ids].sort().join(',')) fel.push(`listan i ${UT} stämmer inte med bankerna (${fil.antal} mot ${data.antal})`);
  }
  if (fel.length) { console.error(`✗ ${fel.length} fel:\n` + fel.map((x) => '  - ' + x).join('\n')); process.exit(1); }
  console.log(`✓ pensionslistan stämmer: ${data.antal} frågor (${Object.entries(per).map(([n, x]) => `${n} ${x}`).join(', ')}), fälten i bankerna och ${UT} är i takt`);
} else {
  writeFileSync(UT, JSON.stringify(data, null, 2) + '\n');
  console.log(`✓ ${data.antal} frågor på pensionslistan för bank_version 3: ${Object.entries(per).map(([n, x]) => `${n} ${x}`).join(', ')}`);
  console.log(`  skrev ${UT}`);
}
