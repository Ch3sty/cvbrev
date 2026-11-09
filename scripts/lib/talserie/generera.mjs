// scripts/lib/talserie/generera.mjs
// =============================================================================
// Generatorn för talserierna (brief-tester-steg2-2026-11-09.md avsnitt 3).
//
// Åtta regelfamiljer: aritmetisk, geometrisk, andra_ordningen (växande eller
// krympande differens), vaxelvis (+a, −b), varvad (två delserier, på expert
// en geometrisk), geodiff (differensen är geometrisk), affin (×k + c) och
// summa (summan av de två föregående, egna startvärden).
//
// Facit räknas ur regeln, aldrig för hand. Distraktorerna är fel på regeln
// (typade, TS5): varje typ är en regel som en människa kan ha använt, och
// varje alternativ får en misstagstext av sin typ.
// =============================================================================

import { mulberry32, hashString } from '../serie/slump.mjs';

export const NIVAER = {
  grund: { min: 0, max: 100, luckor: 1, visade: [5, 6], familjer: ['aritmetisk', 'geometrisk', 'andra_ordningen', 'vaxelvis'] },
  avancerad: { min: -50, max: 500, luckor: 2, visade: [6], familjer: ['vaxelvis', 'varvad', 'geodiff', 'affin'] },
  expert: { min: -200, max: 2000, luckor: 2, visade: [6], familjer: ['affin', 'summa', 'varvad', 'andra_ordningen'] },
};

export const KORT = { grund: 'g', avancerad: 'a', expert: 'e' };

const fmt = (x) => (x < 0 ? `−${-x}` : `${x}`);
const steg = (d) => (d < 0 ? `−${-d}` : d === 0 ? '0' : `+${d}`);

const heltal = (x) => Number.isInteger(x);
const randInt = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
const valj = (rng, lista) => lista[Math.floor(rng() * lista.length)];

// ------------------------------------------------------------- familjerna
// Varje familj: params(rng, niva) slumpar parametrar, serie(p, n) ger n tal,
// regel(p) är texten i genomgången, bagar(p, n) ritar den dolda regeln.

function iterera(start, n, f) {
  const s = [...start];
  while (s.length < n) s.push(f(s));
  return s.slice(0, n);
}

const differensbagar = (s) => s.slice(1).map((x, i) => ({ fran: [i], till: i + 1, text: steg(x - s[i]) }));

const FAMILJER = {
  aritmetisk: {
    params(rng) {
      const d = valj(rng, [3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 15, -3, -4, -5, -6, -7, -8, -9, -11, -12]);
      return { a: d > 0 ? randInt(rng, 1, 40) : randInt(rng, 60, 100), d };
    },
    serie: (p, n) => iterera([p.a], n, (s) => s[s.length - 1] + p.d),
    regel: (p) => (p.d > 0 ? `Varje tal är ${p.d} mer än det förra.` : `Varje tal är ${-p.d} mindre än det förra.`),
    bagar: (p, s) => differensbagar(s),
    fel: (p) => [
      { typ: 'okande', f: (s) => s[s.length - 1] + (s[s.length - 1] - s[s.length - 2]) + Math.sign(p.d) },
      { typ: 'okande', f: (s) => s[s.length - 1] + (s[s.length - 1] - s[s.length - 2]) + 2 * Math.sign(p.d) },
      { typ: 'minskande', f: (s) => s[s.length - 1] + (s[s.length - 1] - s[s.length - 2]) - Math.sign(p.d) },
      { typ: 'minskande', f: (s) => s[s.length - 1] + (s[s.length - 1] - s[s.length - 2]) - 2 * Math.sign(p.d) },
    ],
  },
  geometrisk: {
    params(rng) {
      const r = valj(rng, ['2', '2', '1/2']);
      if (r === '2') return { a: randInt(rng, 1, 3), r: 2, q: 1 };
      return { a: valj(rng, [64, 96]), r: 1, q: 2 };
    },
    serie: (p, n) => iterera([p.a], n, (s) => (s[s.length - 1] * p.r) / p.q),
    regel: (p) => (p.q === 1 ? `Varje tal är ${p.r} gånger det förra.` : `Varje tal är hälften av det förra.`),
    bagar: (p, s) => s.slice(1).map((_, i) => ({ fran: [i], till: i + 1, text: p.q === 1 ? `×${p.r}` : '÷2' })),
    fel: (p) => [
      { typ: 'okande_kvot', f: (s) => (p.q === 1 ? s[s.length - 1] * (p.r + 1) : s[s.length - 1] / 4) },
    ],
  },
  andra_ordningen: {
    params(rng, niva) {
      if (niva === 'grund') return { a: randInt(rng, 1, 25), d: randInt(rng, 1, 5), s: valj(rng, [1, 1, 2, 2, 3]) };
      // expert: differensen ändras och talen går under noll
      const s = valj(rng, [-2, -3, -4, -5, 2, 3, 4, 5]);
      return s < 0 ? { a: randInt(rng, 10, 80), d: randInt(rng, -6, 4), s } : { a: randInt(rng, -80, -10), d: randInt(rng, -4, 6), s };
    },
    serie: (p, n) => iterera([p.a], n, (s) => s[s.length - 1] + p.d + (s.length - 1) * p.s),
    regel: (p) =>
      p.s > 0
        ? `Steget växer med ${p.s} för varje tal (${steg(p.d)}, ${steg(p.d + p.s)}, ${steg(p.d + 2 * p.s)} och så vidare).`
        : `Steget minskar med ${-p.s} för varje tal (${steg(p.d)}, ${steg(p.d + p.s)}, ${steg(p.d + 2 * p.s)} och så vidare).`,
    bagar: (p, s) => differensbagar(s),
    fel: (p) => [
      { typ: 'dubbel_okning', f: (s) => s[s.length - 1] + (s[s.length - 1] - s[s.length - 2]) + 2 * p.s },
      { typ: 'tecken_andra', f: (s) => s[s.length - 1] + (s[s.length - 1] - s[s.length - 2]) - p.s },
    ],
  },
  vaxelvis: {
    params(rng, niva) {
      const a = niva === 'grund' ? randInt(rng, 3, 12) : randInt(rng, 8, 60);
      const b = randInt(rng, 1, a - 2);
      const start = niva === 'grund' ? randInt(rng, 2, 40) : randInt(rng, -30, 150);
      return { a: start, upp: a, ned: b, forst: valj(rng, ['upp', 'ned']) };
    },
    serie: (p, n) => {
      const st = p.forst === 'upp' ? [p.upp, -p.ned] : [-p.ned, p.upp];
      return iterera([p.a], n, (s) => s[s.length - 1] + st[(s.length - 1) % 2]);
    },
    regel: (p) => `Stegen växlar: ${p.forst === 'upp' ? `+${p.upp}, sedan −${p.ned}` : `−${p.ned}, sedan +${p.upp}`}, och så vidare.`,
    bagar: (p, s) => differensbagar(s),
    fel: (p) => {
      const st = p.forst === 'upp' ? [p.upp, -p.ned] : [-p.ned, p.upp];
      return [
        { typ: 'fel_fas', f: (s) => s[s.length - 1] + st[s.length % 2] },
        { typ: 'netto', f: (s) => s[s.length - 1] + (p.upp - p.ned) },
      ];
    },
  },
  varvad: {
    params(rng, niva) {
      if (niva === 'avancerad') {
        const d0 = valj(rng, [2, 3, 4, 5, 6, 7, 8, 10, 12, 15]);
        const d1 = -valj(rng, [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
        return { a0: randInt(rng, -20, 60), d0, g0: false, a1: randInt(rng, 60, 300), d1, g1: false, byt: rng() < 0.5 };
      }
      // expert: en delserie geometrisk (×2 eller ×3), den andra aritmetisk
      const k = valj(rng, [2, 2, 3]);
      return {
        a0: k === 2 ? randInt(rng, 2, 25) : randInt(rng, 2, 9),
        d0: k,
        g0: true,
        a1: randInt(rng, 40, 400),
        d1: valj(rng, [-7, -9, -10, -11, -12, -15, -20, -25, 6, 9, 13, 17, 30]),
        g1: false,
        byt: rng() < 0.5,
      };
    },
    serie: (p, n) => {
      const del = [
        { a: p.a0, d: p.d0, g: p.g0 },
        { a: p.a1, d: p.d1, g: p.g1 },
      ];
      const [x, y] = p.byt ? [del[1], del[0]] : del;
      const nasta = (d, i) => (d.g ? d.a * d.d ** i : d.a + d.d * i);
      return Array.from({ length: n }, (_, i) => nasta(i % 2 === 0 ? x : y, Math.floor(i / 2)));
    },
    regel: (p) => {
      const t = (a, d, g) => (g ? `gånger ${d}` : d > 0 ? `plus ${d}` : `minus ${-d}`);
      const del = [t(p.a0, p.d0, p.g0), t(p.a1, p.d1, p.g1)];
      const [x, y] = p.byt ? [del[1], del[0]] : del;
      return `Två serier varvas. Tal 1, 3, 5 och så vidare går ${x} för varje steg, tal 2, 4, 6 går ${y}.`;
    },
    bagar: (p, s) => {
      const del = [
        { d: p.d0, g: p.g0 },
        { d: p.d1, g: p.g1 },
      ];
      const [x, y] = p.byt ? [del[1], del[0]] : del;
      return s.slice(2).map((_, j) => {
        const i = j + 2;
        const d = i % 2 === 0 ? x : y;
        return { fran: [i - 2], till: i, text: d.g ? `×${d.d}` : steg(d.d), serie: i % 2 };
      });
    },
    fel: (p) => [
      // delserien med geometri räknad som addition
      ...(p.g0 || p.g1
        ? [
            {
              typ: 'aritmetisk_geo',
              f: (s) => {
                const i = s.length;
                return s[i - 2] + (s[i - 2] - s[i - 4]);
              },
            },
          ]
        : []),
      // fortsatte den andra delserien (förra talet plus den delseriens steg)
      {
        typ: 'fel_serie',
        f: (s) => {
          const i = s.length;
          const d = s[i - 1] - s[i - 3];
          return s[i - 1] + d;
        },
      },
    ],
  },
  geodiff: {
    params(rng) {
      return { a: randInt(rng, -20, 40), d: randInt(rng, 1, 5) * valj(rng, [1, 1, -1]), r: valj(rng, [2, 2, 3]) };
    },
    serie: (p, n) => iterera([p.a], n, (s) => s[s.length - 1] + p.d * p.r ** (s.length - 1)),
    regel: (p) => `Steget blir ${p.r} gånger större för varje tal (${steg(p.d)}, ${steg(p.d * p.r)}, ${steg(p.d * p.r * p.r)} och så vidare).`,
    bagar: (p, s) => differensbagar(s),
    fel: (p) => [
      { typ: 'kvot_fel', f: (s) => s[s.length - 1] + (s[s.length - 1] - s[s.length - 2]) * (p.r + 1) },
    ],
  },
  affin: {
    params(rng, niva) {
      const k = niva === 'avancerad' ? 2 : valj(rng, [2, 3, -2]);
      const c = valj(rng, [-9, -7, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 9]);
      return { a: randInt(rng, -6, 12), k, c };
    },
    serie: (p, n) => iterera([p.a], n, (s) => p.k * s[s.length - 1] + p.c),
    regel: (p) => `Varje tal är det förra gånger ${p.k < 0 ? `minus ${-p.k}` : p.k}, ${p.c > 0 ? `plus ${p.c}` : `minus ${-p.c}`}.`,
    bagar: (p, s) => s.slice(1).map((_, i) => ({ fran: [i], till: i + 1, text: `×${p.k < 0 ? `(−${-p.k})` : p.k} ${p.c > 0 ? '+' : '−'}${Math.abs(p.c)}` })),
    fel: (p) => [
      { typ: 'utan_c', f: (s) => p.k * s[s.length - 1] },
      { typ: 'fel_ordning', f: (s) => p.k * (s[s.length - 1] + p.c) },
    ],
  },
  summa: {
    params(rng) {
      return { a: randInt(rng, -12, 20), b: randInt(rng, -8, 25) };
    },
    serie: (p, n) => iterera([p.a, p.b], n, (s) => s[s.length - 1] + s[s.length - 2]),
    regel: () => 'Varje tal är summan av de två talen närmast före.',
    bagar: (p, s) => s.slice(2).map((x, j) => ({ fran: [j, j + 1], till: j + 2, text: 'summa' })),
    fel: () => [
      { typ: 'summa_fel_par', f: (s) => s[s.length - 1] + s[s.length - 3] },
      { typ: 'dubbel', f: (s) => 2 * s[s.length - 1] },
    ],
  },
};

// Gemensamma feltolkningar, gäller alla familjer.
const GEMENSAMMA = [
  { typ: 'forra_differensen', f: (s) => s[s.length - 1] + (s[s.length - 1] - s[s.length - 2]) },
  {
    typ: 'kvadratisk_tolkning',
    f: (s) => {
      const n = s.length;
      const d1 = s[n - 1] - s[n - 2];
      const d0 = s[n - 2] - s[n - 3];
      return s[n - 1] + d1 + (d1 - d0);
    },
  },
  {
    typ: 'kvot_tolkning',
    f: (s) => {
      const n = s.length;
      if (s[n - 2] === 0) return NaN;
      return (s[n - 1] * s[n - 1]) / s[n - 2];
    },
  },
];

// ---------------------------------------------------------- misstagstexter

const TEXT = {
  forra_differensen: ['Du fortsatte med samma steg som sist, men steget ändras från tal till tal.', 'fortsatte du med samma steg som sist'],
  kvadratisk_tolkning: ['Du lät steget ändras lika mycket varje gång. Här följer steget en annan regel.', 'lät du steget ändras lika mycket som förra gången'],
  kvot_tolkning: ['Du multiplicerade med samma kvot som mellan de två sista talen. Serien följer inte den regeln.', 'multiplicerade du med samma kvot som mellan de två talen före'],
  tecken: ['Rätt storlek på steget men åt fel håll.', 'tog du steget åt fel håll'],
  ett_steg_for_langt: ['Det här talet kommer ett steg senare. Du hoppade över ett tal.', 'hoppade du över ett tal'],
  bytt_ordning: ['Rätt tal men i fel ordning.', 'står talen i fel ordning'],
  okande: ['Du lät steget växa, men steget är detsamma hela vägen.', 'lät du steget växa'],
  minskande: ['Du lät steget krympa, men steget är detsamma hela vägen.', 'lät du steget krympa'],
  okande_kvot: ['Du multiplicerade med fel tal. Kvoten mellan talen är densamma hela vägen.', 'multiplicerade du med fel tal'],
  dubbel_okning: ['Du ändrade steget dubbelt så mycket som serien gör.', 'ändrade du steget dubbelt så mycket'],
  tecken_andra: ['Du ändrade steget åt fel håll. Titta på hur stegen utvecklas.', 'ändrade du steget åt fel håll'],
  fel_fas: ['Du tog fel steg i växlingen. Stegen turas om, ett i taget.', 'tog du fel steg i växlingen'],
  netto: ['Du räknade med nettot av de två stegen, men serien tar dem ett i taget.', 'räknade du med nettot av stegen'],
  fel_serie: ['Du fortsatte fel delserie. Varannat tal hör till samma serie.', 'fortsatte du fel delserie'],
  aritmetisk_geo: ['Du räknade delserien med addition, men den multipliceras.', 'räknade du delserien med addition i stället för multiplikation'],
  kvot_fel: ['Du gjorde steget för stort. Steget växer med samma faktor varje gång.', 'gjorde du steget för stort'],
  utan_c: ['Du multiplicerade men glömde tillägget efteråt.', 'glömde du tillägget efter multiplikationen'],
  fel_ordning: ['Du lade till före multiplikationen. Regeln multiplicerar först.', 'lade du till före multiplikationen'],
  summa_fel_par: ['Du lade ihop fel tal. Varje tal är summan av de två närmast före.', 'lade du ihop fel tal'],
  dubbel: ['Du dubblade förra talet i stället för att lägga ihop de två närmast före.', 'dubblade du förra talet'],
};

export const DISTRAKTORTYPER = Object.keys(TEXT);

export function misstagText(typer, ctx = null) {
  // typer: ['forra_differensen'] eller ['ratt', 'forra_differensen'] (rätt första, fel andra)
  if (typer[0] === 'ratt') return `Första talet stämmer, men i det andra ${TEXT[typer[1]][1]}.`;
  // Med en lucka får steget stå i texten, så att två alternativ av samma typ inte får samma text.
  if (ctx && (typer[0] === 'okande' || typer[0] === 'minskande')) {
    return `Du tog steget ${steg(ctx.varde[0] - ctx.sista)}, men steget är ${steg(ctx.facit[0] - ctx.sista)} hela vägen.`;
  }
  return TEXT[typer[0]][0];
}

// ----------------------------------------------------------------- frågan

const tecken = (x) => String(x).length;

/** En fråga ur familj, parametrar och nivå. Null om något tal hamnar utanför. */
export function byggFraga({ familj, params, niva, visade: nVisade, id }) {
  const N = NIVAER[niva];
  const F = FAMILJER[familj];
  const k = N.luckor;
  const full = F.serie(params, nVisade + k + 1);
  if (!full.every(heltal)) return null;
  const visade = full.slice(0, nVisade);
  const facit = full.slice(nVisade, nVisade + k);
  const efter = full[nVisade + k];
  const inom = (x) => heltal(x) && x >= N.min && x <= N.max && tecken(x) <= 4;
  if (![...visade, ...facit].every(inom)) return null;

  // Kandidater av typade fel
  const regler = [...F.fel(params), ...GEMENSAMMA];
  const fortsatt = (f, start, n) => {
    const s = [...start];
    for (let i = 0; i < n; i++) s.push(f(s));
    return s.slice(start.length);
  };
  const kand = [];
  if (k === 1) {
    for (const r of regler) kand.push({ v: fortsatt(r.f, visade, 1), typer: [r.typ] });
    kand.push({ v: [visade[nVisade - 1] - (facit[0] - visade[nVisade - 1])], typer: ['tecken'] });
    kand.push({ v: [efter], typer: ['ett_steg_for_langt'] });
  } else {
    for (const r of regler) {
      kand.push({ v: fortsatt(r.f, visade, 2), typer: [r.typ] });
      kand.push({ v: [facit[0], ...fortsatt(r.f, [...visade, facit[0]], 1)], typer: ['ratt', r.typ] });
    }
    const t1 = visade[nVisade - 1] - (facit[0] - visade[nVisade - 1]);
    kand.push({ v: [t1, t1 - (facit[1] - facit[0])], typer: ['tecken'] });
    kand.push({ v: [facit[1], efter], typer: ['ett_steg_for_langt'] });
    kand.push({ v: [facit[1], facit[0]], typer: ['bytt_ordning'] });
  }
  const nyckel = (v) => v.join(',');
  const sedda = new Set([nyckel(facit)]);
  const visadeMangd = new Set(visade);
  const giltiga = [];
  for (const c of kand) {
    if (!c.v.every(inom)) continue;
    if (c.v.some((x) => visadeMangd.has(x))) continue;
    if (sedda.has(nyckel(c.v))) continue;
    sedda.add(nyckel(c.v));
    giltiga.push(c);
  }
  return { id, niva, familj, params, visade, facit, efter, kandidater: giltiga, regel: F.regel(params), bagar: F.bagar(params, [...visade, ...facit]) };
}

/**
 * Väljer fyra distraktorer så att facit hamnar på den plats i den sorterade
 * listan som nivån har använt minst (`anvanda`, antal per plats), och så att TS7 och TS9 håller på två luckor.
 */
export function valjAlternativ(fraga, anvanda, rng) {
  const { facit, kandidater } = fraga;
  const k = facit.length;
  const jmf = (a, b) => a[0] - b[0] || (a[1] ?? 0) - (b[1] ?? 0);
  const blanda = (a) => {
    const x = [...a];
    for (let i = x.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [x[i], x[j]] = [x[j], x[i]];
    }
    return x;
  };
  let bast = null;
  for (let forsok = 0; forsok < 300; forsok++) {
    const urval = blanda(kandidater).slice(0, 4);
    if (urval.length < 4) return null;
    const alla = [{ v: facit, typer: [] }, ...urval].sort((a, b) => jmf(a.v, b.v));
    const plats = alla.findIndex((x) => x.typer.length === 0);
    if (k === 2) {
      if (!urval.some((u) => u.v[0] === facit[0])) continue; // TS7
      if (!ts9Ok(alla.map((x) => x.v), plats)) continue;
    }
    const kandidat = { alla, plats };
    // den plats som har använts minst hittills på nivån (TS10)
    if (!bast || anvanda[plats] < anvanda[bast.plats]) bast = kandidat;
  }
  return bast;
}

/** TS9: facit får inte vara det enda alternativet som delar flest tal med de andra. */
export function ts9Ok(alternativ, facitIndex) {
  if (alternativ[0].length < 2) return true;
  const poang = alternativ.map((a, i) =>
    alternativ.reduce((s, b, j) => s + (i !== j && b[0] === a[0] ? 1 : 0) + (i !== j && b[1] === a[1] ? 1 : 0), 0)
  );
  const max = Math.max(...poang);
  return !(poang[facitIndex] === max && poang.filter((p) => p === max).length === 1);
}

export function slumpare(fro) {
  return mulberry32(hashString(fro));
}

export { FAMILJER, randInt, valj };
