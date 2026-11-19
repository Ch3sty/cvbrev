// scripts/gen-talserier-v4.mjs
// =============================================================================
// Frågebanksomgång 3 för talserierna (2026-11-19): cirka 100 nya uppgifter med
// fran_version 4, tillagda sist i de tre bankerna
// (docs/fragebank/talserier-2026-11-19-omg3.md). Befintliga uppgifter ändras
// aldrig och inget pensioneras: sessioner med talserie_version 1 till 3 drar
// exakt samma urval som förut.
//
// Granskningen av omgång 2 (talserier-2026-11-19-omg2-granskning.md) styr
// tyngdpunkten:
//   grund      väger över mot geometrisk (växelvis har redan 48 av 138). Taket
//              400 står kvar, så den nya regeltypen är två räknesätt som turas
//              om (gånger 3, sedan delat med 2), alla tal heltal under 400
//   avancerad  gånger 1,5 hör hemma här: en delserie som går gånger 1,5 i en
//              varvad rad, och gånger 1,5 som turas om med ett tillägg. Steget
//              som halveras och byter tecken (geodiff), och
//              vanlig andra ordningen
//   expert     tredje ordningen med fem visade steg och utan alternativ som
//              stämmer med en enklare läsning av de sista stegen (V9 i
//              verifieraren), nya tillägg i summa, nya räknesätt i ×k + c
// Varje uppgift ska klara TS1 till TS10, den oberoende verifieraren
// (scripts/talserier-verifiera.mjs) utan fel och varningar, V7 (fyra tal i
// följd), V8 (samma stegföljd med annat startvärde, alla nivåer, även samma
// nivå), "inget upprepat tal" och, på grund, ha alla distraktorer inom två
// gånger radens största steg från facit.
//
// Kör: node scripts/gen-talserier-v4.mjs --torr [--visa]  (visar, skriver inget)
//      node scripts/gen-talserier-v4.mjs                  (lägger till i bankerna)
// Skriptet vägrar köra om bankerna redan har uppgifter med fran_version 4.
// Aktiveringen (TALSERIE_VERSION = 4 i src/lib/talserierV1/select.ts) görs
// för sig, efter granskning.
// =============================================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { NIVAER, KORT, byggFraga, valjAlternativ, misstagText, slumpare, randInt, valj } from './lib/talserie/generera.mjs';
import { sparrFel, nivaFel } from './lib/talserie/sparrar.mjs';
import { verifiera, arForskjuten, harSammaSteg } from './talserier-verifiera.mjs';

const VERSION = 4;
const FRO = 'talserier-v4-2026-11-19';
const torr = process.argv.includes('--torr');

const MAL = {
  grund: { geometrisk: 14, aritmetisk: 8, andra_ordningen: 8, vaxelvis: 4 },
  avancerad: { varvad: 8, affin: 10, geodiff: 4, vaxelvis: 5, andra_ordningen: 6 },
  expert: { andra_ordningen: 9, varvad: 8, affin: 9, summa: 7 },
};

// Samma som omgång 1 och 2, plus ett tillägg per ny variant (svårare regel).
const P_PRIOR = { grund: 0.78, avancerad: 0.58, expert: 0.42 };
const P_FAMILJ = { aritmetisk: 0.07, geometrisk: 0.03, vaxelvis: 0, andra_ordningen: -0.06, varvad: 0.02, geodiff: -0.02, affin: -0.03, summa: 0.02 };
const SVARIGHET = { aritmetisk: 1, geometrisk: 1, vaxelvis: 2, andra_ordningen: 2, varvad: 3, geodiff: 3, affin: 3, summa: 4 };
const FAMKORT = { aritmetisk: 'arit', geometrisk: 'geom', andra_ordningen: 'andra', vaxelvis: 'vaxel', varvad: 'varv', geodiff: 'geod', affin: 'affin', summa: 'summa' };

/** Varianten: [extra svårighet, ändring av p_prior]. */
function variant(familj, p) {
  if (familj === 'geometrisk' && p.kv) return [1, -0.08];
  if (familj === 'andra_ordningen' && p.t) return [1, -0.06];
  if (familj === 'vaxelvis' && p.steg) return [1, -0.05];
  if (familj === 'affin' && p.turas) return p.k === 1.5 ? [0, -0.01] : [0, 0.02];
  if (familj === 'varvad' && (p.d0 === 1.5 || p.d1 === 1.5)) return [0, -0.02];
  if (familj === 'varvad' && p.g0 && p.g1) return [0, -0.03];
  if (familj === 'geodiff' && p.r < 0) return [0, -0.03];
  return [0, 0];
}

const ettAv = (rng, lista) => lista[Math.floor(rng() * lista.length)];
const intervall = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

/** Kvotparen på grund: två räknesätt som turas om, [täljare, nämnare]. */
const KVOTPAR = [
  [[2, 1], [3, 1]],
  [[3, 1], [2, 1]],
  [[3, 1], [1, 2]],
  [[1, 2], [3, 1]],
  [[2, 1], [1, 3]],
  [[1, 3], [2, 1]],
  [[3, 1], [1, 4]],
  [[1, 4], [3, 1]],
  [[4, 1], [1, 3]],
  [[1, 3], [4, 1]],
  [[5, 1], [1, 2]],
  [[1, 2], [5, 1]],
];

/** Parameterrymderna för omgången. Returnerar null när slumpen gav en rad som inte passar nivån. */
const PARAMS = {
  grund: {
    geometrisk(rng) {
      return { a: randInt(rng, 1, 15) * ettAv(rng, [1, 1, 2, 3, 4, 8, 9, 16, 27, 32, 64]), kv: ettAv(rng, KVOTPAR) };
    },
    aritmetisk(rng) {
      // steg som ingen rad i bankerna har haft (V8 fäller samma steg på alla nivåer)
      const d = ettAv(rng, [10, 16, 17, 18, 19, -15, -17, -18, -19]);
      return { a: d > 0 ? randInt(rng, 1, 30) : randInt(rng, 70, 100), d };
    },
    andra_ordningen(rng) {
      if (rng() < 0.5) return { a: randInt(rng, 1, 20), d: randInt(rng, 1, 6), s: ettAv(rng, [3, 4, 5]) };
      // krympande steg som håller sig över noll
      const s = -ettAv(rng, [1, 3, 3]);
      return { a: randInt(rng, 1, 30), d: randInt(rng, 6 * -s + 1, 6 * -s + 8), s };
    },
    vaxelvis(rng) {
      const steg = [0, 0, 0].map(() => ettAv(rng, [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, -2, -3, -4, -5, -6, -7, -8, -9]));
      if (new Set(steg).size < 3 || steg.every((x) => x > 0) || steg.every((x) => x < 0)) return null;
      const netto = steg[0] + steg[1] + steg[2];
      if (netto === 0) return null;
      return { a: netto > 0 ? randInt(rng, 2, 40) : randInt(rng, 60, 95), steg };
    },
  },
  avancerad: {
    varvad(rng) {
      // en delserie går gånger 1,5 (fyra tal: a, 1,5a, 2,25a, 3,375a), den andra plus eller minus
      const d1 = ettAv(rng, [...intervall(3, 25), ...intervall(-25, -3)]);
      return { a0: 8 * randInt(rng, 1, 18), d0: 1.5, g0: true, a1: d1 > 0 ? randInt(rng, -40, 300) : randInt(rng, 100, 480), d1, g1: false, byt: rng() < 0.5 };
    },
    affin(rng) {
      if (rng() < 0.85) return { a: 2 * randInt(rng, -10, 45), k: 1.5, c: ettAv(rng, [-12, -10, -9, -8, -7, -6, -5, -4, -3, 3, 4, 5, 6, 7, 8, 9, 10, 12]), forst: ettAv(rng, ['ggr', 'plus']), turas: true };
      return { a: randInt(rng, -10, 20), k: ettAv(rng, [2, 3, -2]), c: ettAv(rng, [-13, -11, -10, -9, -8, -7, -6, -5, -4, -3, 3, 4, 5, 6, 7, 8, 9, 11, 13]), forst: ettAv(rng, ['ggr', 'plus']), turas: true };
    },
    geodiff(rng) {
      // steget halveras och byter tecken, eller halveras från 192. Steget som
      // dubblas och byter tecken är samma regel som gånger −2 plus c och står
      // redan i banken som ×k + c, så den tas inte med.
      const r = ettAv(rng, [-0.5, -0.5, 0.5]);
      const d = r === -0.5 ? ettAv(rng, [64, -64, 128, -128, 192, -192, 256, -256]) : ettAv(rng, [192, -192]);
      return { a: randInt(rng, -45, 495), d, r };
    },
    vaxelvis(rng) {
      const steg = [0, 0, 0].map(() => ettAv(rng, [...intervall(5, 40), ...intervall(-30, -4)]));
      if (new Set(steg).size < 3 || steg.every((x) => x > 0) || steg.every((x) => x < 0)) return null;
      const netto = steg[0] + steg[1] + steg[2];
      if (netto === 0) return null;
      return { a: netto > 0 ? randInt(rng, -40, 150) : randInt(rng, 200, 480), steg };
    },
    andra_ordningen(rng) {
      // vanlig andra ordningen: steget ändras lika mycket varje gång
      const s = ettAv(rng, [-7, -6, -5, -4, 4, 5, 6, 7, 8, 9]);
      return s > 0 ? { a: randInt(rng, -45, 150), d: randInt(rng, -20, 10), s } : { a: randInt(rng, 200, 495), d: randInt(rng, -10, 20), s };
    },
  },
  expert: {
    andra_ordningen(rng) {
      const t = ettAv(rng, [1, 2, 3, 4, -1, -2, -3, -4]);
      return t > 0
        ? { a: randInt(rng, -180, 50), d: randInt(rng, -14, 4), s: randInt(rng, -5, 3), t }
        : { a: randInt(rng, 50, 500), d: randInt(rng, -4, 14), s: randInt(rng, -3, 5), t };
    },
    varvad(rng) {
      if (rng() < 0.5) {
        const [k0, k1] = [ettAv(rng, [2, 3, -2, -3]), ettAv(rng, [2, 3, -2, -3])];
        if (k0 === k1) return null;
        return { a0: randInt(rng, 1, 12) * ettAv(rng, [1, 1, -1]), d0: k0, g0: true, a1: randInt(rng, 1, 12) * ettAv(rng, [1, 1, -1]), d1: k1, g1: true, byt: rng() < 0.5 };
      }
      return { a0: randInt(rng, 2, 20) * ettAv(rng, [1, -1]), d0: ettAv(rng, [-2, -3, 3]), g0: true, a1: randInt(rng, -150, 400), d1: ettAv(rng, [-17, -16, -13, -10, -8, -7, -5, 5, 9, 10, 11, 14, 16, 19, 23, 35]), g1: false, byt: rng() < 0.5 };
    },
    affin(rng) {
      if (rng() < 0.5) return { a: randInt(rng, -12, 20), k: ettAv(rng, [-2, -3, 3, 4, -4, 5]), c: ettAv(rng, [-14, -12, -10, -8, -4, -3, 3, 4, 8, 10, 12, 14]), forst: ettAv(rng, ['ggr', 'plus']), turas: true };
      return { a: randInt(rng, -15, 20), k: -2, c: ettAv(rng, [1, 4, 5, 7, 8, 10, -1, -3, -4, -5, -6, -7, -8, -10]) };
    },
    summa(rng) {
      return { a: randInt(rng, -20, 25), b: randInt(rng, -15, 30), c: ettAv(rng, [-12, -11, -10, -9, 9, 10, 11, 12, 6, 7, -6]) };
    },
  },
};

export { PARAMS, VERSION };

/** Granskningens punkt 7 (omgång 1): på grund bara distraktorer inom två gånger radens största steg från facit. */
function nara(f) {
  const rad = [...f.visade, ...f.facit];
  const grans = 2 * Math.max(...rad.slice(1).map((x, i) => Math.abs(x - rad[i])));
  return f.kandidater.filter((c) => Math.abs(c.v[0] - f.facit[0]) <= grans);
}

/** Villkoret för tredje ordningen på expert: inget alternativ som stämmer med en enklare läsning av de sista stegen. */
const ENKLARE = ['forra_differensen', 'kvadratisk_tolkning'];
const utanEnklare = (f) => f.kandidater.filter((c) => !c.typer.some((t) => ENKLARE.includes(t)));

if (process.argv[1]?.endsWith('gen-talserier-v4.mjs')) {
  const las = (f) => JSON.parse(readFileSync(f, 'utf8'));
  const fil = (niva) => `src/lib/talserierV1/bank${niva[0].toUpperCase()}${niva.slice(1)}.json`;
  const banker = Object.fromEntries(Object.keys(NIVAER).map((n) => [n, las(fil(n))]));
  if (Object.values(banker).some((b) => b.some((q) => q.fran_version === VERSION))) {
    console.log(`Bankerna har redan uppgifter med fran_version ${VERSION}. Inget görs.`);
    process.exit(1);
  }
  const artiklar = las('src/lib/artikelfigurer/talserier.json');
  const allaRader = [...Object.values(banker).flat(), ...artiklar];
  const raderOverallt = new Set(allaRader.map((q) => q.visade.join(',')));

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
    for (let forsok = 0; forsok < 600000; forsok++) {
      const oppna = Object.keys(MAL[niva]).filter((f) => per[f] < MAL[niva][f]);
      if (!oppna.length) break;
      const familj = valj(rng, oppna);
      const params = PARAMS[niva][familj](rng);
      if (!params) continue;
      const nyckel = `${familj}:${JSON.stringify(params)}`;
      if (sedda.has(nyckel)) continue;
      const id = `ts-${KORT[niva]}-${FAMKORT[familj]}-${String((nr[FAMKORT[familj]] ?? 0) + 1).padStart(2, '0')}`;
      // tre steg som turas om och tredje ordningen visar sex tal (fem steg), så att regeln syns mer än en gång
      const nVisade = (familj === 'vaxelvis' && params.steg) || params.t ? 6 : valj(rng, N.visade);
      const f = byggFraga({ familj, params, niva, visade: nVisade, id });
      if (!f) {
        nej('utanför');
        continue;
      }
      if (new Set(f.visade).size !== f.visade.length) {
        nej('upprepat tal');
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
      if (niva === 'grund') f.kandidater = nara(f);
      if (familj === 'andra_ordningen' && params.t) f.kandidater = utanEnklare(f);
      const val = valjAlternativ(f, anvanda, rng);
      if (!val) {
        nej('alternativ');
        continue;
      }
      const [extra, dp] = variant(familj, params);
      const fraga = {
        id,
        niva,
        family: familj,
        params,
        difficulty: Math.min(4, SVARIGHET[familj] + (niva === 'expert' ? 1 : 0) + extra),
        p_prior: Math.round((P_PRIOR[niva] + P_FAMILJ[familj] + dp) * 100) / 100,
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
      if (arForskjuten(fraga, allaRader)) {
        nej('V7');
        continue;
      }
      if (harSammaSteg(fraga, allaRader)) {
        nej('V8');
        continue;
      }
      if (nivaFel([...bank, fraga]).length) {
        nej('nivå');
        continue;
      }
      sedda.add(nyckel);
      raderOverallt.add(fraga.visade.join(','));
      allaRader.push(fraga);
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
    banker[niva] = bank;
    rapport[niva] = { nya: nya.length, per, platser: anvanda, avvisade };
    console.log(niva, JSON.stringify(rapport[niva]));
    if (process.argv.includes('--visa')) for (const q of nya) console.log(`  ${q.id}  ${q.visade.join(' ')}  [${q.options[q.correctAnswer].join(' ')}]  ${q.regel}  | ${q.options.map((o) => o.join('/')).join('  ')}  d${q.difficulty} p${q.p_prior}`);
  }
  if (!torr && !fel) for (const niva of Object.keys(MAL)) writeFileSync(fil(niva), (JSON.stringify(banker[niva], null, 1) + '\n').replace(/\n/g, '\r\n')); // arbetskopian har CRLF
  console.log(fel ? `${fel} fel, inget skrivet` : torr ? 'torrkörning, inget skrivet' : 'skrivet');
  process.exit(fel ? 1 : 0);
}
