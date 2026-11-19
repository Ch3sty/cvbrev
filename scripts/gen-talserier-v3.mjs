// scripts/gen-talserier-v3.mjs
// =============================================================================
// Frågebanksomgång 2 för talserierna (2026-11-19): cirka 100 nya uppgifter med
// fran_version 3, tillagda sist i de tre bankerna
// (docs/fragebank/talserier-2026-11-19-omg2.md). Befintliga uppgifter ändras
// aldrig, utom att åtta rader från version 1 som är samma serie som en annan
// rad förskjuten (granskningen 2026-11-19, punkt 6) får pensionerad_fran: 3.
// Sessioner med talserie_version 1 eller 2 drar alltså exakt samma urval.
//
// Omgången vidgar regelrymden i stället för att byta startvärden. Nya
// varianter inom de åtta familjerna (scripts/lib/talserie/generera.mjs):
//   vaxelvis         tre steg som turas om (+5, +3, −4, och sedan om igen)
//   andra_ordningen  tredje ordningen: skillnaden mellan stegen växer också
//                    (stegen +1, +2, +4, +7 ...), på avancerad och expert;
//                    krympande steg på grund
//   affin            två räknesätt som turas om (gånger 2, sedan plus 3)
//   geodiff          steget halveras för varje tal (+64, +32, +16 ...)
//   varvad           två delserier åt samma håll (avancerad), två
//                    geometriska delserier eller kvoten −2 (expert)
//   geometrisk       hälften av det förra (grund), med ett fjärde typat fel
//   summa            summan plus eller minus 6, 7 och 8 (expert)
// Varje uppgift ska klara TS1 till TS10, den oberoende verifieraren
// (scripts/talserier-verifiera.mjs) utan fel och varningar, V7 (ingen rad
// delar fyra tal i följd med en annan rad i bankerna eller artiklarna) och,
// på grund, ha alla distraktorer inom två gånger radens största steg från
// facit (granskningens punkt 7).
//
// Kör: node scripts/gen-talserier-v3.mjs --torr   (visar, skriver inget)
//      node scripts/gen-talserier-v3.mjs          (lägger till i bankerna)
// Skriptet vägrar köra om bankerna redan har uppgifter med fran_version 3.
// Aktiveringen (TALSERIE_VERSION = 3 i src/lib/talserierV1/select.ts) görs
// för sig, efter granskning.
// =============================================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { NIVAER, KORT, byggFraga, valjAlternativ, misstagText, slumpare, randInt, valj } from './lib/talserie/generera.mjs';
import { sparrFel, nivaFel } from './lib/talserie/sparrar.mjs';
import { verifiera, arForskjuten, harSammaSteg } from './talserier-verifiera.mjs';

const VERSION = 3;
const FRO = 'talserier-v3-2026-11-19';
const torr = process.argv.includes('--torr');

const MAL = {
  grund: { aritmetisk: 7, andra_ordningen: 11, vaxelvis: 14, geometrisk: 2 },
  avancerad: { vaxelvis: 7, varvad: 7, geodiff: 6, affin: 7, andra_ordningen: 6 },
  expert: { andra_ordningen: 9, varvad: 8, affin: 9, summa: 7 },
};

/** Rader i version 1 som är samma serie som en annan rad, förskjuten (granskningen punkt 6). Den ena i varje par pensioneras. */
const PENSIONERA = ['ts-e-affin-16', 'ts-a-affin-08', 'ts-a-affin-06', 'ts-e-affin-14', 'ts-a-affin-16', 'ts-e-affin-06', 'ts-g-andra-09', 'ts-g-vaxel-09'];

// Samma som gen-talserier.mjs, plus ett tillägg per ny variant (svårare regel).
const P_PRIOR = { grund: 0.78, avancerad: 0.58, expert: 0.42 };
const P_FAMILJ = { aritmetisk: 0.07, geometrisk: 0.03, vaxelvis: 0, andra_ordningen: -0.06, varvad: 0.02, geodiff: -0.02, affin: -0.03, summa: 0.02 };
const SVARIGHET = { aritmetisk: 1, geometrisk: 1, vaxelvis: 2, andra_ordningen: 2, varvad: 3, geodiff: 3, affin: 3, summa: 4 };
const FAMKORT = { aritmetisk: 'arit', geometrisk: 'geom', andra_ordningen: 'andra', vaxelvis: 'vaxel', varvad: 'varv', geodiff: 'geod', affin: 'affin', summa: 'summa' };

/** Varianten: [extra svårighet, ändring av p_prior]. */
function variant(familj, p) {
  if (familj === 'andra_ordningen' && p.t) return [1, -0.06];
  if (familj === 'vaxelvis' && p.steg) return [1, -0.05];
  if (familj === 'affin' && p.turas) return [0, 0.02];
  if (familj === 'geometrisk' && p.q > 1) return [1, -0.06];
  if (familj === 'varvad' && p.g0 && p.g1) return [0, -0.03];
  return [0, 0];
}

const ettAv = (rng, lista) => lista[Math.floor(rng() * lista.length)];
const intervall = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

/** Parameterrymderna för omgången. Returnerar null när slumpen gav en rad som inte passar nivån. */
const PARAMS = {
  grund: {
    aritmetisk(rng) {
      const d = ettAv(rng, [3, 4, 9, 10, 12, 14, 15, 16, 17, -3, -4, -10, -12, -13, -14, -15, -16, -17]);
      return { a: d > 0 ? randInt(rng, 1, 25) : randInt(rng, 75, 100), d };
    },
    andra_ordningen(rng) {
      // krympande steg: stegen minskar men håller sig över noll
      const s = -ettAv(rng, [1, 1, 2, 2, 3]);
      const d = randInt(rng, 6 * -s + 1, 6 * -s + 8);
      return { a: randInt(rng, 1, 30), d, s };
    },
    vaxelvis(rng) {
      const steg = [0, 0, 0].map(() => ettAv(rng, [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, -2, -3, -4, -5, -6, -7, -8]));
      if (new Set(steg).size < 3 || steg.every((x) => x > 0) || steg.every((x) => x < 0)) return null;
      const netto = steg[0] + steg[1] + steg[2];
      if (netto === 0) return null;
      return { a: netto > 0 ? randInt(rng, 2, 40) : randInt(rng, 60, 95), steg };
    },
    geometrisk(rng) {
      // hälften av det förra (TS8 tillåter regeln två gånger, version 1 och 2 har den inte)
      return { a: 64 * randInt(rng, 1, 6), r: 1, q: 2 };
    },
  },
  avancerad: {
    vaxelvis(rng) {
      const steg = [0, 0, 0].map(() => ettAv(rng, [...intervall(5, 40), ...intervall(-30, -4)]));
      if (new Set(steg).size < 3 || steg.every((x) => x > 0) || steg.every((x) => x < 0)) return null;
      const netto = steg[0] + steg[1] + steg[2];
      if (netto === 0) return null;
      return { a: netto > 0 ? randInt(rng, -40, 150) : randInt(rng, 200, 480), steg };
    },
    varvad(rng) {
      // båda delserierna åt samma håll, olika steg
      const upp = rng() < 0.5;
      const [d0, d1] = [ettAv(rng, [3, 4, 5, 6, 7, 8, 9, 11, 12, 14, 15, 20, 25]), ettAv(rng, [2, 3, 4, 5, 6, 7, 8, 9, 10, 13, 16, 30])];
      if (d0 === d1) return null;
      return upp
        ? { a0: randInt(rng, -30, 60), d0, g0: false, a1: randInt(rng, 60, 250), d1, g1: false, byt: rng() < 0.5 }
        : { a0: randInt(rng, 120, 450), d0: -d0, g0: false, a1: randInt(rng, 0, 200), d1: -d1, g1: false, byt: rng() < 0.5 };
    },
    geodiff(rng) {
      // åtta halveringar ska ge heltal: steget delbart med 128
      const d = ettAv(rng, [128, -128, 256, -256]);
      return { a: d > 0 ? randInt(rng, -45, 500 - 2 * d) : randInt(rng, -2 * d - 45, 495), d, r: 0.5 };
    },
    affin(rng) {
      return { a: randInt(rng, -10, 20), k: ettAv(rng, [2, 2, 3]), c: ettAv(rng, [-12, -10, -9, -8, -7, -6, -5, -4, -3, 3, 4, 5, 6, 7, 8, 9, 10, 12]), forst: ettAv(rng, ['ggr', 'plus']), turas: true };
    },
    andra_ordningen(rng) {
      return { a: randInt(rng, -30, 60), d: randInt(rng, -3, 6), s: randInt(rng, 0, 3), t: ettAv(rng, [1, 1, 2, 2, 3]) };
    },
  },
  expert: {
    andra_ordningen(rng) {
      const t = ettAv(rng, [1, 2, 3, 4, -1, -2, -3, -4]);
      return t > 0
        ? { a: randInt(rng, -150, 50), d: randInt(rng, -12, 4), s: randInt(rng, -4, 3), t }
        : { a: randInt(rng, 50, 400), d: randInt(rng, -4, 12), s: randInt(rng, -3, 4), t };
    },
    varvad(rng) {
      if (rng() < 0.5) {
        // två geometriska delserier med olika kvot
        const [k0, k1] = [ettAv(rng, [2, 3, -2]), ettAv(rng, [2, 3, -2, -3])];
        if (k0 === k1) return null;
        return { a0: randInt(rng, 1, 12) * ettAv(rng, [1, 1, -1]), d0: k0, g0: true, a1: randInt(rng, 1, 12), d1: k1, g1: true, byt: rng() < 0.5 };
      }
      // kvoten −2 i den ena, den andra aritmetisk
      return { a0: randInt(rng, 2, 20), d0: -2, g0: true, a1: randInt(rng, -100, 400), d1: ettAv(rng, [-14, -12, -9, -8, -6, 7, 8, 12, 15, 18, 21, 40]), g1: false, byt: rng() < 0.5 };
    },
    affin(rng) {
      return { a: randInt(rng, -12, 20), k: ettAv(rng, [-2, -3, 3, 4, -4]), c: ettAv(rng, [-15, -13, -11, -9, -7, -6, -5, 5, 6, 7, 9, 11, 13, 15]), forst: ettAv(rng, ['ggr', 'plus']), turas: true };
    },
    summa(rng) {
      return { a: randInt(rng, -20, 25), b: randInt(rng, -15, 30), c: ettAv(rng, [-8, -7, -6, 6, 7, 8]) };
    },
  },
};

export { PARAMS, VERSION, PENSIONERA };

/** Granskningens punkt 7: på grund bara distraktorer inom två gånger radens största steg från facit. */
function nara(f) {
  const rad = [...f.visade, ...f.facit];
  const grans = 2 * Math.max(...rad.slice(1).map((x, i) => Math.abs(x - rad[i])));
  return f.kandidater.filter((c) => Math.abs(c.v[0] - f.facit[0]) <= grans);
}

if (process.argv[1]?.endsWith('gen-talserier-v3.mjs')) {
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

  // Pensioneringen (version 1, granskningens punkt 6)
  for (const id of PENSIONERA) {
    const q = Object.values(banker).flat().find((x) => x.id === id);
    if (!q || q.fran_version !== 1 || q.pensionerad_fran) throw new Error(`${id} kan inte pensioneras`);
    q.pensionerad_fran = VERSION;
  }

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
    for (let forsok = 0; forsok < 400000; forsok++) {
      const oppna = Object.keys(MAL[niva]).filter((f) => per[f] < MAL[niva][f]);
      if (!oppna.length) break;
      const familj = valj(rng, oppna);
      const params = PARAMS[niva][familj](rng);
      if (!params) continue;
      const nyckel = `${familj}:${JSON.stringify(params)}`;
      if (sedda.has(nyckel)) continue;
      const id = `ts-${KORT[niva]}-${FAMKORT[familj]}-${String((nr[FAMKORT[familj]] ?? 0) + 1).padStart(2, '0')}`;
      // tre steg som turas om och tredje ordningen visar sex tal, så att regeln syns två gånger
      const nVisade = (familj === 'vaxelvis' && params.steg) || params.t ? 6 : valj(rng, N.visade);
      const f = byggFraga({ familj, params, niva, visade: nVisade, id });
      if (!f) {
        nej('utanför');
        continue;
      }
      // omgång 2: inget tal upprepas i raden (granskningens anmärkning 11)
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
      // V8 (granskningen av omgång 2): inte samma stegföljd som en annan rad på någon nivå
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
    if (process.argv.includes('--visa')) for (const q of nya) console.log(`  ${q.id}  ${q.visade.join(' ')}  [${q.options[q.correctAnswer].join(' ')}]  ${q.regel}  | ${q.options.map((o) => o.join('/')).join('  ')}`);
  }
  if (!torr && !fel) for (const niva of Object.keys(MAL)) writeFileSync(fil(niva), (JSON.stringify(banker[niva], null, 1) + '\n').replace(/\n/g, '\r\n')); // arbetskopian har CRLF
  console.log(fel ? `${fel} fel, inget skrivet` : torr ? 'torrkörning, inget skrivet' : 'skrivet');
  process.exit(fel ? 1 : 0);
}
