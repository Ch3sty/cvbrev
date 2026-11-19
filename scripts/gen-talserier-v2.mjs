// scripts/gen-talserier-v2.mjs
// =============================================================================
// Frågebanksomgången 2026-11-19: cirka 100 nya talserier med fran_version 2,
// tillagda sist i de tre bankerna (docs/fragebank/talserier-2026-11-19.md).
// Befintliga uppgifter ändras aldrig, så sessioner med talserie_version 1
// drar exakt samma urval som förut.
//
// Samma bygge som scripts/gen-talserier.mjs (byggFraga, valjAlternativ,
// misstagstexterna), men egna parameterrymder: TS8 tillåter samma regel högst
// två gånger per nivå, och flera familjer hade redan fyllt sina regler i
// version 1. Därför nya regler, inte nya startvärden:
//   aritmetisk på grund     steg 10, 14, 16, −10, −13, −14, −15
//   andra_ordningen, grund  startsteg upp till 8, ökning upp till 4
//   geodiff på avancerad    negativt startsteg (−1 till −4), högt starttal
//   summa på expert         plus eller minus 4 och 5
// Varje uppgift ska klara TS1 till TS10 och den oberoende verifieraren
// (scripts/talserier-verifiera.mjs) utan fel och utan varningar.
//
// Kör: node scripts/gen-talserier-v2.mjs --torr   (visar, skriver inget)
//      node scripts/gen-talserier-v2.mjs          (lägger till i bankerna)
// Skriptet vägrar köra om bankerna redan har uppgifter med fran_version 2.
// =============================================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { NIVAER, KORT, byggFraga, valjAlternativ, misstagText, slumpare, randInt, valj } from './lib/talserie/generera.mjs';
import { sparrFel, nivaFel } from './lib/talserie/sparrar.mjs';
import { verifiera } from './talserier-verifiera.mjs';

const VERSION = 2;
const FRO = 'talserier-v2-2026-11-19';
const torr = process.argv.includes('--torr');

const MAL = {
  grund: { aritmetisk: 11, andra_ordningen: 11, vaxelvis: 12 },
  avancerad: { vaxelvis: 8, varvad: 8, geodiff: 8, affin: 9 },
  expert: { andra_ordningen: 8, varvad: 8, affin: 9, summa: 8 },
};

// Samma som gen-talserier.mjs
const P_PRIOR = { grund: 0.78, avancerad: 0.58, expert: 0.42 };
const P_FAMILJ = { aritmetisk: 0.07, geometrisk: 0.03, vaxelvis: 0, andra_ordningen: -0.06, varvad: 0.02, geodiff: -0.02, affin: -0.03, summa: 0.02 };
const SVARIGHET = { aritmetisk: 1, geometrisk: 1, vaxelvis: 2, andra_ordningen: 2, varvad: 3, geodiff: 3, affin: 3, summa: 4 };
const FAMKORT = { aritmetisk: 'arit', geometrisk: 'geom', andra_ordningen: 'andra', vaxelvis: 'vaxel', varvad: 'varv', geodiff: 'geod', affin: 'affin', summa: 'summa' };

/** Parameterrymderna för omgången. */
const PARAMS = {
  grund: {
    aritmetisk(rng) {
      const d = valj(rng, [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, -3, -4, -5, -6, -7, -8, -9, -10, -11, -12, -13, -14, -15]);
      return { a: d > 0 ? randInt(rng, 1, 30) : randInt(rng, 70, 100), d };
    },
    andra_ordningen(rng) {
      return { a: randInt(rng, 1, 25), d: randInt(rng, 1, 8), s: valj(rng, [1, 1, 2, 2, 3, 4]) };
    },
    vaxelvis(rng) {
      const upp = randInt(rng, 3, 14);
      return { a: randInt(rng, 2, 40), upp, ned: randInt(rng, 1, upp - 2), forst: valj(rng, ['upp', 'ned']) };
    },
  },
  avancerad: {
    vaxelvis(rng) {
      const upp = randInt(rng, 8, 60);
      return { a: randInt(rng, -30, 150), upp, ned: randInt(rng, 1, upp - 2), forst: valj(rng, ['upp', 'ned']) };
    },
    varvad(rng) {
      const d0 = valj(rng, [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 20]);
      const d1 = -valj(rng, [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15]);
      return { a0: randInt(rng, -20, 60), d0, g0: false, a1: randInt(rng, 60, 300), d1, g1: false, byt: rng() < 0.5 };
    },
    geodiff(rng) {
      const d = -randInt(rng, 1, 4);
      return { a: randInt(rng, 127 * -d - 50, 500), d, r: 2 };
    },
    affin(rng) {
      const k = valj(rng, [2, 2, -2, 3]);
      return { a: randInt(rng, -8, 14), k, c: valj(rng, [-11, -9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11]) };
    },
  },
  expert: {
    andra_ordningen(rng) {
      const s = valj(rng, [-2, -3, -4, -5, -6, 2, 3, 4, 5, 6]);
      return s < 0 ? { a: randInt(rng, 10, 120), d: randInt(rng, -6, 6), s } : { a: randInt(rng, -120, -10), d: randInt(rng, -6, 6), s };
    },
    varvad(rng) {
      const k = valj(rng, [2, 2, 3]);
      return {
        a0: k === 2 ? randInt(rng, 2, 30) : randInt(rng, 2, 12),
        d0: k,
        g0: true,
        a1: randInt(rng, 40, 600),
        d1: valj(rng, [-7, -8, -9, -10, -11, -12, -13, -15, -20, -25, -30, 6, 8, 9, 11, 13, 17, 19, 25, 30]),
        g1: false,
        byt: rng() < 0.5,
      };
    },
    affin(rng) {
      const k = valj(rng, [2, 3, -2, -3]);
      return { a: randInt(rng, -8, 14), k, c: valj(rng, [-11, -9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11]) };
    },
    summa(rng) {
      return { a: randInt(rng, -15, 25), b: randInt(rng, -10, 30), c: valj(rng, [-5, -4, 4, 5]) };
    },
  },
};

export { PARAMS, P_PRIOR, P_FAMILJ, SVARIGHET, FAMKORT, VERSION };

// Körs bara som skript (talserier-v2-granskning.mjs importerar parametrarna).
if (process.argv[1]?.endsWith('gen-talserier-v2.mjs')) {
  const las = (f) => JSON.parse(readFileSync(f, 'utf8'));
  const fil = (niva) => `src/lib/talserierV1/bank${niva[0].toUpperCase()}${niva.slice(1)}.json`;
  const banker = Object.fromEntries(Object.keys(NIVAER).map((n) => [n, las(fil(n))]));
  if (Object.values(banker).some((b) => b.some((q) => q.fran_version === VERSION))) {
    console.log(`Bankerna har redan uppgifter med fran_version ${VERSION}. Inget görs.`);
    process.exit(1);
  }
  const artiklar = las('src/lib/artikelfigurer/talserier.json');
  const raderOverallt = new Set([...Object.values(banker).flat(), ...artiklar].map((q) => q.visade.join(',')));

  let fel = 0;
  const rapport = {};
  for (const niva of Object.keys(MAL)) {
    const N = NIVAER[niva];
    const rng = slumpare(`${FRO}:${niva}`);
    const gamla = banker[niva];
    const bank = [...gamla];
    const nya = [];
    const nr = {};
    for (const q of gamla) {
      const [, , f, n] = q.id.split('-');
      nr[f] = Math.max(nr[f] ?? 0, Number(n));
    }
    const sedda = new Set(gamla.map((q) => `${q.family}:${JSON.stringify(q.params)}`));
    const anvanda = [0, 0, 0, 0, 0];
    for (const q of gamla) anvanda[q.correctAnswer]++;
    const per = Object.fromEntries(Object.keys(MAL[niva]).map((f) => [f, 0]));
    const avvisade = {};
    const nej = (s) => (avvisade[s] = (avvisade[s] ?? 0) + 1);
    for (let forsok = 0; forsok < 300000; forsok++) {
      const oppna = Object.keys(MAL[niva]).filter((f) => per[f] < MAL[niva][f]);
      if (!oppna.length) break;
      const minst = Math.min(...oppna.map((f) => per[f] / MAL[niva][f]));
      const familj = valj(rng, oppna.filter((f) => per[f] / MAL[niva][f] === minst));
      const params = PARAMS[niva][familj](rng);
      const nyckel = `${familj}:${JSON.stringify(params)}`;
      if (sedda.has(nyckel)) continue;
      const id = `ts-${KORT[niva]}-${FAMKORT[familj]}-${String((nr[FAMKORT[familj]] ?? 0) + 1).padStart(2, '0')}`;
      const f = byggFraga({ familj, params, niva, visade: valj(rng, N.visade), id });
      if (!f) {
        nej('utanför');
        continue;
      }
      if (raderOverallt.has(f.visade.join(','))) {
        nej('rad finns');
        continue;
      }
      if (bank.filter((b) => b.family === familj && b.regelnyckel === f.regelnyckel).length >= 2) {
        nej('regel full');
        continue;
      }
      const val = valjAlternativ(f, anvanda, rng);
      if (!val) {
        nej('alternativ');
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
        fran_version: VERSION,
      };
      const sf = sparrFel(fraga);
      if (sf.length) {
        nej(sf[0].split(': ')[1].slice(0, 4));
        continue;
      }
      const v = verifiera(fraga);
      if (v.fel.length || v.varn.length) {
        nej('verifierare');
        continue;
      }
      if (nivaFel([...bank, fraga]).length) {
        nej('nivå');
        continue;
      }
      sedda.add(nyckel);
      raderOverallt.add(fraga.visade.join(','));
      nr[FAMKORT[familj]] = (nr[FAMKORT[familj]] ?? 0) + 1;
      bank.push(fraga);
      nya.push(fraga);
      per[familj]++;
      anvanda[fraga.correctAnswer]++;
    }
    const nf = nivaFel(bank);
    for (const x of nf) console.log('  ', x);
    fel += nf.length;
    for (const [f, m] of Object.entries(MAL[niva])) {
      if (per[f] < m) {
        console.log(`  ${niva} ${f}: ${per[f]} av ${m}`);
        fel++;
      }
    }
    rapport[niva] = { nya: nya.length, per, platser: anvanda, avvisade };
    console.log(niva, JSON.stringify(rapport[niva]));
    if (!torr && !fel) writeFileSync(fil(niva), (JSON.stringify(bank, null, 1) + '\n').replace(/\n/g, '\r\n')); // arbetskopian har CRLF
  }
  process.exit(fel ? 1 : 0);
}
