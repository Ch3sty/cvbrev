// scripts/bank-version-3.mjs
// =============================================================================
// Förberedelsen av bank_version 3 för matrisfrågorna (granskningen av parti
// 01, avsnitt 6 punkt 4). Skriptet slår INTE på något: det räknar fram
// pensionslistan och skriver den till en fil som beställningen om befordran
// läser. Bankerna och BANK_VERSION (selectQuestions.v7.ts) rörs inte.
//
// Kör: node scripts/bank-version-3.mjs             (skriver listan)
//      node scripts/bank-version-3.mjs --kontroll  (felar om listan i filen
//                                                    inte längre stämmer med bankerna)
//
// Pensionslistan: valbara frågor i de två expertbankerna som är rena rörelser
// i läsordning (lasordningsCykel i scripts/lib/matris/kontroll.mjs): alla
// aktiva regler går i läsordning, eller familjen är vridning, vandring,
// mönsterrotation, rotation med byte, två rörelser eller antal som ändras
// utan summa. Granskningen räknade 53: mönsterrotation 24, två rörelser 11,
// rotation med byte 7, vridning 4, vandring 4, antal 3.
// =============================================================================

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { lasordningsCykel, facitRuta0 } from './lib/matris/kontroll.mjs';

export const UT = 'docs/design/tester-v2-2026-10-11/bank-version-3-pensioneras.json';
const EXPERT = ['src/lib/logicTestV7/questionBankExpert.v7.json', 'src/lib/logicTestV7/questionBankExpert3c.v7.json'];

export function pensionsLista() {
  const ut = [];
  for (const fil of EXPERT) {
    for (const q of JSON.parse(readFileSync(fil, 'utf8'))) {
      if (q.pensionerad === true) continue;
      const { ren, slutna } = lasordningsCykel(q);
      if (!ren) continue;
      ut.push({ id: q.id, fil, family: q.family, facit_ruta0: facitRuta0(q), sluter_sig: slutna.length > 0 });
    }
  }
  return ut;
}

if (process.argv[1]?.replace(/\\/g, '/').endsWith('scripts/bank-version-3.mjs')) {
  const lista = pensionsLista();
  const per = {};
  lista.forEach((x) => { per[x.family] = (per[x.family] ?? 0) + 1; });
  const data = {
    beskrivning: 'Expertfrågor som pensioneras i bank_version 3 (granskningen av parti 01, avsnitt 6 punkt 4). Inte påslaget: BANK_VERSION är 2.',
    antal: lista.length,
    per_familj: per,
    ids: lista.map((x) => x.id),
    fragor: lista,
  };
  if (process.argv.includes('--kontroll')) {
    if (!existsSync(UT)) { console.error(`✗ ${UT} saknas`); process.exit(1); }
    const fil = JSON.parse(readFileSync(UT, 'utf8'));
    const a = [...fil.ids].sort().join(','); const b = data.ids.slice().sort().join(',');
    if (a !== b) { console.error(`✗ pensionslistan i ${UT} stämmer inte med bankerna (${fil.antal} mot ${data.antal})`); process.exit(1); }
    console.log(`✓ pensionslistan stämmer: ${data.antal} expertfrågor`);
  } else {
    writeFileSync(UT, JSON.stringify(data, null, 2) + '\n');
    console.log(`✓ ${data.antal} expertfrågor på pensionslistan för bank_version 3: ${Object.entries(per).map(([f, n]) => `${f} ${n}`).join(', ')}`);
    console.log(`  varav facit identiskt med rutan uppe till vänster: ${lista.filter((x) => x.facit_ruta0).length}`);
    console.log(`  skrev ${UT}`);
  }
}
