// scripts/gen-talserier.mjs
// =============================================================================
// Bygger talseriernas banker (brief-tester-steg2-2026-11-09.md avsnitt 3).
//
// Kör: node scripts/gen-talserier.mjs            (skriver de tre bankerna)
//      node scripts/gen-talserier.mjs --torr     (skriver inget, visar antal)
//
// Deterministiskt: samma frö ger samma bank. Varje uppgift klarar TS1 till
// TS9 (scripts/lib/talserie/sparrar.mjs) innan den tas med; nivån klarar TS8
// och TS10. En bank som redan är publicerad ändras aldrig i efterhand: nya
// uppgifter läggs till med ny fran_version och gamla pensioneras med
// pensionerad_fran (samma mönster som figurserierna).
// =============================================================================

import { writeFileSync } from 'node:fs';
import { NIVAER, KORT, FAMILJER, byggFraga, valjAlternativ, misstagText, slumpare, valj } from './lib/talserie/generera.mjs';
import { sparrFel, nivaFel } from './lib/talserie/sparrar.mjs';

const MAL_PER_NIVA = 72;
const FRO = 'talserier-v1-2026-11-09';
const torr = process.argv.includes('--torr');

/** Andel rätt innan uppgiften har svar: nivåns band, justerat per familj (granskningen 2026-11-09). */
const P_PRIOR = { grund: 0.78, avancerad: 0.58, expert: 0.42 };
const P_FAMILJ = { aritmetisk: 0.07, geometrisk: 0.03, vaxelvis: 0, andra_ordningen: -0.06, varvad: 0.02, geodiff: -0.02, affin: -0.03, summa: 0.02 };
const SVARIGHET = {
  aritmetisk: 1,
  geometrisk: 1,
  vaxelvis: 2,
  andra_ordningen: 2,
  varvad: 3,
  geodiff: 3,
  affin: 3,
  summa: 4,
};
const FAMKORT = { aritmetisk: 'arit', geometrisk: 'geom', andra_ordningen: 'andra', vaxelvis: 'vaxel', varvad: 'varv', geodiff: 'geod', affin: 'affin', summa: 'summa' };

function nivaBank(niva) {
  const N = NIVAER[niva];
  const rng = slumpare(`${FRO}:${niva}`);
  const bank = [];
  const sedda = new Set();
  const perFamilj = Object.fromEntries(N.familjer.map((f) => [f, 0]));
  const slut = new Set();
  const missar = Object.fromEntries(N.familjer.map((f) => [f, 0]));
  let forsok = 0;
  const anvanda = [0, 0, 0, 0, 0];
  const avvisade = {};
  while (bank.length < MAL_PER_NIVA && forsok < 400000) {
    forsok++;
    // familjen med minst uppgifter hittills, så att fördelningen blir jämn
    // En familj som inte ger en ny godkänd rad på 20 000 försök är slut
    // (geometrisk på grund har bara ett fåtal rader inom 0 till 100).
    const oppna = N.familjer.filter((f) => !slut.has(f));
    if (!oppna.length) break;
    const minst = Math.min(...oppna.map((f) => perFamilj[f]));
    const familj = valj(rng, oppna.filter((f) => perFamilj[f] === minst));
    if (++missar[familj] > 20000) {
      slut.add(familj);
      continue;
    }
    const params = FAMILJER[familj].params(rng, niva);
    const nVisade = valj(rng, N.visade);
    const nyckel = `${familj}:${JSON.stringify(params)}`;
    if (sedda.has(nyckel)) continue;
    const id = `ts-${KORT[niva]}-${FAMKORT[familj]}-${String(perFamilj[familj] + 1).padStart(2, '0')}`;
    const f = byggFraga({ familj, params, niva, visade: nVisade, id });
    if (!f) continue;
    if (bank.some((b) => b.visade.join(',') === f.visade.join(','))) continue;
    if (bank.filter((b) => b.family === familj && b.regelnyckel === f.regelnyckel).length >= 2) continue;
    const val = valjAlternativ(f, anvanda, rng);
    if (!val) {
      avvisade.alternativ = (avvisade.alternativ ?? 0) + 1;
      continue;
    }
    const fraga = {
      id,
      niva,
      family: familj,
      params,
      difficulty: Math.min(4, SVARIGHET[familj] + (niva === 'expert' ? 1 : 0)),
      p_prior: Math.round((P_PRIOR[niva] + P_FAMILJ[familj]) * 100) / 100,
      regel: f.regel,
      regelnyckel: f.regelnyckel,
      visade: f.visade,
      luckor: N.luckor,
      options: val.alla.map((x) => x.v),
      correctAnswer: val.plats,
      typer: val.alla.map((x) => x.typer),
      misstag: val.alla.map((x) => (x.typer.length ? misstagText(x.typer, { sista: f.visade[f.visade.length - 1], varde: x.v, facit: f.facit }) : '')),
      bagar: f.bagar,
      fran_version: 1,
    };
    const fel = sparrFel(fraga);
    if (fel.length) {
      const typ = fel[0].split(': ')[1].slice(0, 4);
      avvisade[typ] = (avvisade[typ] ?? 0) + 1;
      continue;
    }
    sedda.add(nyckel);
    bank.push(fraga);
    perFamilj[familj]++;
    missar[familj] = 0;
    anvanda[fraga.correctAnswer]++;
  }
  return { bank, perFamilj, avvisade };
}

let fel = 0;
for (const niva of Object.keys(NIVAER)) {
  const { bank, perFamilj, avvisade } = nivaBank(niva);
  const nf = nivaFel(bank);
  console.log(`${niva}: ${bank.length} uppgifter`, perFamilj, 'avvisade', avvisade);
  for (const f of nf) console.log('  ', f);
  fel += nf.length;
  if (bank.length < 60) {
    console.log(`  för få uppgifter på ${niva} (minst 60)`);
    fel++;
  }
  const fil = `src/lib/talserierV1/bank${niva[0].toUpperCase()}${niva.slice(1)}.json`;
  if (!torr) writeFileSync(fil, JSON.stringify(bank, null, 1) + '\n');
}
process.exit(fel ? 1 : 0);
