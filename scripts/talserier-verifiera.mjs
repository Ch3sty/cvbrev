// scripts/talserier-verifiera.mjs
// =============================================================================
// Oberoende verifierare för talseriernas banker (frågebanksomgången
// 2026-11-19, docs/fragebank/talserier-2026-11-19.md). Delar ingen kod med
// generatorn (scripts/lib/talserie/generera.mjs) eller lösaren (losare.mjs):
// regelfamiljerna räknas om här från params, och biblioteket av alternativa
// regler är skrivet för sig, med exakta bråk i BigInt.
//
// Per uppgift:
//  V1  raden räknas fram ur familj och params: de visade talen stämmer och
//      facit är nästa tal (två tal på två luckor)
//  V2  exakt ett alternativ är facit, och det står på correctAnswer
//  V3  ingen enkel alternativ regel som passar alla visade tal ger ett annat
//      svar, och ingen distraktor följer en sådan regel. Biblioteket:
//      konstant differens, konstant kvot, polynom av grad två, växlande
//      differens (period två och tre), varvade delserier (aritmetiska eller
//      geometriska), Fibonaccilik (summa av två föregående plus c),
//      tribonacci, ×k + c, geometrisk differens, p × förra + q × förrförra,
//      växlande operationer (+d eller ×k), kvot som växer jämnt
//  V4  talen är rimliga: heltal, inom nivåns gräns, högst fyra tecken,
//      alternativen olika och sorterade, inget alternativ är ett visat tal
//  V5  genomgångens bågar stämmer med raden (+d, ×k, ÷k, ×k ± c, summa)
//  V6  regeltexten nämner regelns tal
//  V7  (över bankerna) ingen ny rad är samma serie som en annan rad, förskjuten
//      eller identisk: högst tre tal i följd gemensamma, facit inräknat
// Varningar (fäller inte): ett polynom av grad tre genom alla visade tal som
// ger en distraktor. Med fem visade tal passar ett sådant nästan alltid.
//
// Kör: node scripts/talserier-verifiera.mjs [--version N] [--bara-nya]
//      --version N  räknar bara uppgifter med fran_version N
// Exit 1 vid fel.
// =============================================================================

import { readFileSync } from 'node:fs';

// ------------------------------------------------------------ exakta bråk
const babs = (x) => (x < 0n ? -x : x);
const bgcd = (a, b) => {
  a = babs(a);
  b = babs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1n;
};
function Q(n, d = 1n) {
  n = BigInt(n);
  d = BigInt(d);
  if (d === 0n) return null;
  if (d < 0n) [n, d] = [-n, -d];
  const g = bgcd(n, d);
  return { n: n / g, d: d / g };
}
const plus = (a, b) => (a && b ? Q(a.n * b.d + b.n * a.d, a.d * b.d) : null);
const minus = (a, b) => (a && b ? Q(a.n * b.d - b.n * a.d, a.d * b.d) : null);
const ggr = (a, b) => (a && b ? Q(a.n * b.n, a.d * b.d) : null);
const delat = (a, b) => (a && b && b.n !== 0n ? Q(a.n * b.d, a.d * b.n) : null);
const lika = (a, b) => !!a && !!b && a.n === b.n && a.d === b.d;
const arHel = (a) => !!a && a.d === 1n;
const tilltal = (a) => Number(a.n) / Number(a.d);

// ------------------------------------------------------ familjerna från params
// Ger raden med n tal. Skrivet direkt ur regeltexterna i genomgången.
const FAMILJ = {
  aritmetisk: (p, n) => Array.from({ length: n }, (_, i) => p.a + p.d * i),
  geometrisk: (p, n) => {
    const ut = [Q(p.a)];
    while (ut.length < n) ut.push(ggr(ut[ut.length - 1], Q(p.r, p.q)));
    return ut.map((x) => (arHel(x) ? tilltal(x) : NaN));
  },
  andra_ordningen: (p, n) => {
    const ut = [p.a];
    for (let i = 1; i < n; i++) ut.push(ut[i - 1] + p.d + (i - 1) * p.s);
    return ut;
  },
  vaxelvis: (p, n) => {
    const st = p.forst === 'upp' ? [p.upp, -p.ned] : [-p.ned, p.upp];
    const ut = [p.a];
    for (let i = 1; i < n; i++) ut.push(ut[i - 1] + st[(i - 1) % 2]);
    return ut;
  },
  varvad: (p, n) => {
    const del = (a, d, g, j) => (g ? a * d ** j : a + d * j);
    const s0 = (j) => del(p.a0, p.d0, p.g0, j);
    const s1 = (j) => del(p.a1, p.d1, p.g1, j);
    const [jamn, udda] = p.byt ? [s1, s0] : [s0, s1];
    return Array.from({ length: n }, (_, i) => (i % 2 === 0 ? jamn(i / 2) : udda((i - 1) / 2)));
  },
  geodiff: (p, n) => {
    const ut = [p.a];
    for (let i = 1; i < n; i++) ut.push(ut[i - 1] + p.d * p.r ** (i - 1));
    return ut;
  },
  affin: (p, n) => {
    const ut = [p.a];
    while (ut.length < n) ut.push(p.k * ut[ut.length - 1] + p.c);
    return ut;
  },
  summa: (p, n) => {
    const ut = [p.a, p.b];
    while (ut.length < n) ut.push(ut[ut.length - 1] + ut[ut.length - 2] + (p.c ?? 0));
    return ut.slice(0, n);
  },
};

const GRANS = { grund: [0, 100], avancerad: [-50, 500], expert: [-200, 2000] };
const GEOM_GRUND_MAX = 400;

// ------------------------------------------- biblioteket av alternativa regler
// Varje regel: (v: bråk[]) => funktion som ger nästa tal ur raden hittills,
// eller null om regeln inte går att bestämma. `bestamd` är hur många tal som
// behövs för att bestämma regeln; den räknas bara om minst ett tal till
// bekräftar den (samma krav som en människa ställer).
const sista = (s, k = 1) => s[s.length - k];
const REGLER = [
  { namn: 'konstant differens', bestamd: 2, bygg: (v) => { const d = minus(v[1], v[0]); return (s) => plus(sista(s), d); } },
  { namn: 'konstant kvot', bestamd: 2, bygg: (v) => { const r = delat(v[1], v[0]); return r && ((s) => ggr(sista(s), r)); } },
  {
    namn: 'polynom av grad två',
    bestamd: 3,
    bygg: () => (s) => plus(minus(ggr(Q(3), sista(s)), ggr(Q(3), sista(s, 2))), sista(s, 3)),
  },
  {
    namn: 'växlande differens',
    bestamd: 3,
    bygg: (v) => { const d = [minus(v[1], v[0]), minus(v[2], v[1])]; return (s) => plus(sista(s), d[(s.length - 1) % 2]); },
  },
  {
    namn: 'differens med period tre',
    bestamd: 4,
    bygg: (v) => { const d = [minus(v[1], v[0]), minus(v[2], v[1]), minus(v[3], v[2])]; return (s) => plus(sista(s), d[(s.length - 1) % 3]); },
  },
  { namn: 'Fibonaccilik', bestamd: 3, bygg: (v) => { const c = minus(v[2], plus(v[1], v[0])); return (s) => plus(plus(sista(s), sista(s, 2)), c); } },
  { namn: 'tribonacci', bestamd: 3, bygg: () => (s) => plus(plus(sista(s), sista(s, 2)), sista(s, 3)) },
  {
    namn: '×k + c',
    bestamd: 3,
    bygg: (v) => {
      const k = delat(minus(v[2], v[1]), minus(v[1], v[0]));
      if (!k) return null;
      const c = minus(v[1], ggr(k, v[0]));
      return (s) => plus(ggr(k, sista(s)), c);
    },
  },
  {
    namn: 'geometrisk differens',
    bestamd: 3,
    bygg: (v) => {
      const r = delat(minus(v[2], v[1]), minus(v[1], v[0]));
      return r && ((s) => plus(sista(s), ggr(r, minus(sista(s), sista(s, 2)))));
    },
  },
  {
    namn: 'p × förra + q × förrförra',
    bestamd: 4,
    bygg: (v) => {
      // v2 = p v1 + q v0, v3 = p v2 + q v1
      const det = minus(ggr(v[1], v[1]), ggr(v[0], v[2]));
      if (!det || det.n === 0n) return null;
      const p = delat(minus(ggr(v[2], v[1]), ggr(v[3], v[0])), det);
      const q = delat(minus(ggr(v[3], v[1]), ggr(v[2], v[2])), det);
      return p && q && ((s) => plus(ggr(p, sista(s)), ggr(q, sista(s, 2))));
    },
  },
  {
    namn: 'kvoten växer jämnt',
    bestamd: 3,
    bygg: (v) => {
      const r0 = delat(v[1], v[0]);
      const r1 = delat(v[2], v[1]);
      if (!r0 || !r1) return null;
      const t = minus(r1, r0);
      if (t.n === 0n) return null;
      return (s) => ggr(sista(s), plus(r0, ggr(t, Q(s.length - 1))));
    },
  },
];

/** Växlande operationer: varje steg är +d eller ×k, två steg som turas om. */
function vaxlandeOperationer(v) {
  const ops = (a, b) => [{ f: (x) => plus(x, minus(b, a)) }, ...(a.n !== 0n && delat(b, a) ? [{ f: (x) => ggr(x, delat(b, a)) }] : [])];
  const ut = [];
  for (const o0 of ops(v[0], v[1])) for (const o1 of ops(v[1], v[2])) ut.push({ namn: 'växlande operationer', bestamd: 3, f: (s) => [o0, o1][(s.length - 1) % 2].f(sista(s)) });
  return ut;
}

/** Varvade delserier: jämna och udda platser, var och en aritmetisk eller geometrisk. */
function varvadeRegler(v) {
  const del = [v.filter((_, i) => i % 2 === 0), v.filter((_, i) => i % 2 === 1)];
  if (del.some((d) => d.length < 3)) return [];
  const satt = (d) => {
    const ut = [];
    const dd = minus(d[1], d[0]);
    if (d.every((x, i) => i === 0 || lika(x, plus(d[i - 1], dd)))) ut.push((x) => plus(x, dd));
    const r = delat(d[1], d[0]);
    if (r && d.every((x, i) => i === 0 || lika(x, ggr(d[i - 1], r)))) ut.push((x) => ggr(x, r));
    return ut;
  };
  const ut = [];
  for (const a of satt(del[0])) for (const b of satt(del[1])) ut.push({ namn: 'varvade delserier', f: (s) => (s.length % 2 === 0 ? a : b)(s[s.length - 2]), forbestamd: true });
  return ut;
}

/** Alla regler som passar de visade talen, med vad de säger om k luckor. */
export function alternativaSvar(visade, k) {
  const v = visade.map((x) => Q(x));
  const kandidater = [];
  for (const r of REGLER) {
    if (v.length < r.bestamd + 1) continue;
    const f = r.bygg(v);
    if (f) kandidater.push({ namn: r.namn, f, fran: r.bestamd });
  }
  if (v.length >= 4) for (const r of vaxlandeOperationer(v)) kandidater.push({ namn: r.namn, f: r.f, fran: 3 });
  for (const r of varvadeRegler(v)) kandidater.push({ namn: r.namn, f: r.f, fran: v.length });
  const ut = [];
  for (const c of kandidater) {
    let ok = true;
    for (let i = c.fran; i < v.length; i++) {
      if (!lika(c.f(v.slice(0, i)), v[i])) {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    const s = [...v];
    for (let i = 0; i < k; i++) s.push(c.f(s));
    const svar = s.slice(v.length);
    if (svar.every(arHel)) ut.push({ namn: c.namn, svar: svar.map(tilltal) });
  }
  return ut;
}

/** Grad tre genom alla visade tal (bara varning). */
function kubisk(visade, k) {
  if (visade.length < 5) return null;
  const s = [...visade];
  // fjärde differensen noll: s[n] = 4s[n-1] - 6s[n-2] + 4s[n-3] - s[n-4]
  const f = (x) => 4 * x[x.length - 1] - 6 * x[x.length - 2] + 4 * x[x.length - 3] - x[x.length - 4];
  for (let i = 4; i < s.length; i++) if (f(s.slice(0, i)) !== s[i]) return null;
  for (let i = 0; i < k; i++) s.push(f(s));
  return s.slice(visade.length);
}

// ----------------------------------------------------------------- per uppgift
const fmt = (x) => (x < 0 ? `−${-x}` : `${x}`);

export function verifiera(q) {
  const fel = [];
  const varn = [];
  const id = q.id;
  const k = q.luckor;
  const F = FAMILJ[q.family];
  if (!F) return { fel: [`${id}: okänd familj ${q.family}`], varn };

  // V1
  const full = F(q.params, q.visade.length + k);
  const facit = full.slice(q.visade.length);
  if (full.slice(0, q.visade.length).join(',') !== q.visade.join(',')) fel.push(`${id}: V1 de visade talen följer inte regeln (${full.join(', ')})`);
  if (!facit.every(Number.isInteger)) fel.push(`${id}: V1 regeln ger inget heltal i luckan`);

  // V2
  const nyck = (o) => o.join(',');
  const traffar = q.options.map((o, i) => (nyck(o) === nyck(facit) ? i : -1)).filter((i) => i >= 0);
  if (traffar.length !== 1) fel.push(`${id}: V2 ${traffar.length} alternativ är facit enligt regeln`);
  else if (traffar[0] !== q.correctAnswer) fel.push(`${id}: V2 correctAnswer ${q.correctAnswer} men regeln ger alternativ ${traffar[0]}`);

  // V3
  for (const a of alternativaSvar(q.visade, k)) {
    if (nyck(a.svar) === nyck(facit)) continue;
    const i = q.options.findIndex((o) => nyck(o) === nyck(a.svar));
    fel.push(`${id}: V3 regeln "${a.namn}" passar också och ger ${a.svar.join(' och ')}${i >= 0 ? `, som är alternativ ${i + 1}` : ''}`);
  }
  const kub = kubisk(q.visade, k);
  if (kub && nyck(kub) !== nyck(facit)) {
    const i = q.options.findIndex((o) => nyck(o) === nyck(kub));
    if (i >= 0) varn.push(`${id}: polynom av grad tre ger alternativ ${i + 1}`);
  }

  // V4
  const [lo, hi0] = GRANS[q.niva];
  const hi = q.family === 'geometrisk' && q.niva === 'grund' ? GEOM_GRUND_MAX : hi0;
  for (const x of [...q.visade, ...q.options.flat()]) {
    if (!Number.isInteger(x) || x < lo || x > hi || String(x).length > 4) fel.push(`${id}: V4 talet ${x} är orimligt för nivån`);
  }
  if (q.options.length !== 5) fel.push(`${id}: V4 ${q.options.length} alternativ`);
  if (q.options.some((o) => o.length !== k)) fel.push(`${id}: V4 alternativ med fel antal tal`);
  if (new Set(q.options.map(nyck)).size !== q.options.length) fel.push(`${id}: V4 två alternativ är lika`);
  const visadeM = new Set(q.visade);
  if (q.options.some((o) => o.some((x) => visadeM.has(x)))) fel.push(`${id}: V4 ett alternativ innehåller ett visat tal`);
  for (let i = 1; i < q.options.length; i++) {
    const [a, b] = [q.options[i - 1], q.options[i]];
    if (!(a[0] < b[0] || (a[0] === b[0] && (a[1] ?? 0) < (b[1] ?? 0)))) fel.push(`${id}: V4 alternativen står inte sorterade`);
  }
  if (new Set(q.visade).size < 4) fel.push(`${id}: V4 för få olika tal i raden`);

  // V5
  const rad = [...q.visade, ...facit];
  for (const b of q.bagar ?? []) {
    const t = b.text.replace(/−/g, '-');
    const fran = b.fran.map((i) => rad[i]);
    const till = rad[b.till];
    let m;
    let ok;
    if ((m = t.match(/^([+-]?\d+)$/))) ok = till - fran[0] === Number(m[1]);
    else if ((m = t.match(/^×(\d+)$/))) ok = till === fran[0] * Number(m[1]);
    else if ((m = t.match(/^÷(\d+)$/))) ok = till * Number(m[1]) === fran[0];
    else if ((m = t.match(/^×\(?(-?\d+)\)? ([+-])(\d+)$/))) ok = till === Number(m[1]) * fran[0] + (m[2] === '+' ? 1 : -1) * Number(m[3]);
    else if ((m = t.match(/^summa(?: ([+-])(\d+))?$/))) ok = fran.length === 2 && till === fran[0] + fran[1] + (m[1] ? (m[1] === '+' ? 1 : -1) * Number(m[2]) : 0);
    else ok = null;
    if (ok === null) fel.push(`${id}: V5 okänd bågtext "${b.text}"`);
    else if (!ok) fel.push(`${id}: V5 bågen "${b.text}" till plats ${b.till + 1} stämmer inte`);
  }

  // V6
  const p = q.params;
  const ska = {
    aritmetisk: [Math.abs(p.d)],
    geometrisk: p.q === 1 ? [p.r] : [],
    andra_ordningen: [Math.abs(p.s)],
    vaxelvis: [p.upp, p.ned],
    varvad: [Math.abs(p.d0), Math.abs(p.d1)],
    geodiff: p.r === 2 && /dubblas/.test(q.regel) ? [] : [p.r],
    affin: [Math.abs(p.k), Math.abs(p.c)],
    summa: p.c ? [Math.abs(p.c)] : [],
  }[q.family];
  const talIText = new Set((q.regel.match(/\d+/g) ?? []).map(Number));
  for (const x of ska) if (!talIText.has(x)) fel.push(`${id}: V6 regeltexten nämner inte ${fmt(x)}`);
  if (q.family === 'geometrisk' && p.q > 1 && !/(hälften|tredjedel)/.test(q.regel)) fel.push(`${id}: V6 regeltexten säger inte vilken del`);

  return { fel, varn };
}

export const BANKER = ['bankGrund', 'bankAvancerad', 'bankExpert'].map((b) => `src/lib/talserierV1/${b}.json`);

// --------------------------------------------------------- förskjutna dubbletter
// V7 (granskningen 2026-11-19): två rader är samma serie förskjuten (eller
// identiska) när raden med facit, visade tal plus luckor, delar minst
// FORSKJUTNING_MIN tal i följd med en annan rad. Då står den ena radens facit
// synligt i den andra. Gäller alla nivåer och pensionerade rader också.
export const FORSKJUTNING_MIN = 4;

const helRad = (q) => [...q.visade, ...q.options[q.correctAnswer]];

/** Längsta gemensamma följd av tal i rad mellan a och b. */
function gemensamFoljd(a, b) {
  let bast = 0;
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      let n = 0;
      while (i + n < a.length && j + n < b.length && a[i + n] === b[j + n]) n++;
      if (n > bast) bast = n;
    }
  }
  return bast;
}

/** Alla par med minst `min` gemensamma tal i följd. */
export function forskjutnaPar(fragor, min = FORSKJUTNING_MIN) {
  const rader = fragor.map((q) => ({ q, rad: helRad(q) }));
  const par = [];
  for (let i = 0; i < rader.length; i++) {
    for (let j = i + 1; j < rader.length; j++) {
      const n = gemensamFoljd(rader[i].rad, rader[j].rad);
      if (n >= min) par.push({ a: rader[i].q, b: rader[j].q, n });
    }
  }
  return par;
}

/** Är raden en förskjutning av någon av de andra? */
export function arForskjuten(q, andra, min = FORSKJUTNING_MIN) {
  const rad = helRad(q);
  return andra.some((x) => x.id !== q.id && gemensamFoljd(rad, helRad(x)) >= min);
}

if (process.argv[1]?.endsWith('talserier-verifiera.mjs')) {
  const vi = process.argv.indexOf('--version');
  const bara = vi > 0 ? Number(process.argv[vi + 1]) : null;
  let n = 0;
  const allaFel = [];
  const allaVarn = [];
  for (const fil of BANKER) {
    for (const q of JSON.parse(readFileSync(fil, 'utf8'))) {
      if (bara !== null && q.fran_version !== bara) continue;
      n++;
      const r = verifiera(q);
      allaFel.push(...r.fel);
      allaVarn.push(...r.varn);
    }
  }
  // V7 över alla banker: fel när en ny rad är med i paret, varning för par
  // som bara består av version 1 (kända, tas i nästa omgång).
  const alla = BANKER.flatMap((f) => JSON.parse(readFileSync(f, 'utf8')));
  const nyRad = (q) => (bara !== null ? q.fran_version === bara : q.fran_version > 1);
  let gamlaPar = 0;
  for (const { a, b, n: m } of forskjutnaPar(alla)) {
    if (nyRad(a) || nyRad(b)) allaFel.push(`${a.id} och ${b.id}: V7 samma serie förskjuten, ${m} tal i följd gemensamma`);
    else if (bara === null) gamlaPar++;
  }
  if (gamlaPar) allaVarn.push(`V7 ${gamlaPar} förskjutna eller identiska par bara i version 1 (kända sedan granskningen 2026-11-19)`);
  for (const f of allaFel) console.log(f);
  for (const v of allaVarn) console.log('varning:', v);
  console.log(`${n} uppgifter, ${allaFel.length} fel, ${allaVarn.length} varningar`);
  process.exit(allaFel.length ? 1 : 0);
}
