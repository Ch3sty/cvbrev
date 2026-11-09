// scripts/lib/talserie/losare.mjs
// =============================================================================
// Lösaren för talserierna (spärr TS1 i docs/design/brief-tester-steg2-2026-11-09.md
// avsnitt 3). Den prövar hela regelbiblioteket mot de visade talen och
// returnerar varje regel som passar, med vad den säger att luckorna ska vara.
//
// En regel räknas bara när den är bestämd av talen OCH bekräftad av minst
// ett tal till (en regel med två parametrar passar alltid två tal och säger
// då ingenting). Så gör en människa också: den som ser 3, 7 prövar inte en
// regel som bara bygger på de två talen.
//
// Biblioteket är bredare än generatorns åtta familjer, så att en rad som
// råkar passa en annan naturlig regel stryks:
//   aritmetisk, geometrisk, kvadratisk (alla polynom av grad högst 2),
//   vaxelvis (differenserna växlar mellan två värden), vaxelvis_op (stegen
//   växlar mellan två operationer, var och en +d eller ×k), varvad (två
//   delserier, var och en aritmetisk eller geometrisk), geodiff (differensen
//   är geometrisk), affin (×k + c), summa_c (summan av de två föregående plus
//   c) och rekursion2 (p × förra + q × förrförra).
// =============================================================================

import { q, add, sub, mul, div, eq, arHeltal, tal } from './rationell.mjs';

const R = (x) => q(x, 1);

/** Förlänger en serie med f(serie) k gånger. f får returnera null (regeln går inte). */
function forlang(start, k, f) {
  const s = [...start];
  for (let i = 0; i < k; i++) {
    const x = f(s);
    if (!x) return null;
    s.push(x);
  }
  return s.slice(start.length);
}

/** Kontrollerar att f återskapar varje tal från index `fran` ur talen före. */
function passar(v, fran, f) {
  for (let i = fran; i < v.length; i++) {
    const x = f(v.slice(0, i));
    if (!x || !eq(x, v[i])) return false;
  }
  return true;
}

// ------------------------------------------------------------------ modellerna

function aritmetisk(v, k) {
  if (v.length < 3) return null;
  const d = sub(v[1], v[0]);
  const f = (s) => add(s[s.length - 1], d);
  return passar(v, 2, f) ? forlang(v, k, f) : null;
}

function geometrisk(v, k) {
  if (v.length < 3 || v[0].n === 0) return null;
  const r = div(v[1], v[0]);
  if (!r) return null;
  const f = (s) => mul(s[s.length - 1], r);
  return passar(v, 2, f) ? forlang(v, k, f) : null;
}

/** Polynom av grad högst 2: konstant andra differens. */
function kvadratisk(v, k) {
  if (v.length < 4) return null;
  const f = (s) => {
    const n = s.length;
    // s[n] = 3 s[n-1] - 3 s[n-2] + s[n-3]
    return add(sub(mul(R(3), s[n - 1]), mul(R(3), s[n - 2])), s[n - 3]);
  };
  return passar(v, 3, f) ? forlang(v, k, f) : null;
}

/** Differenserna växlar mellan d0 och d1. */
function vaxelvis(v, k) {
  if (v.length < 4) return null;
  const d = [sub(v[1], v[0]), sub(v[2], v[1])];
  const f = (s) => add(s[s.length - 1], d[(s.length - 1) % 2]);
  return passar(v, 3, f) ? forlang(v, k, f) : null;
}

/** Stegen växlar mellan två operationer, var och en +d eller ×k. */
function vaxelvisOp(v, k) {
  if (v.length < 4) return [];
  const ops = (a, b) => {
    const ut = [{ typ: '+', x: sub(b, a) }];
    const r = a.n === 0 ? null : div(b, a);
    if (r) ut.push({ typ: '×', x: r });
    return ut;
  };
  const tillamp = (op, a) => (op.typ === '+' ? add(a, op.x) : mul(a, op.x));
  const svar = [];
  for (const o0 of ops(v[0], v[1])) {
    for (const o1 of ops(v[1], v[2])) {
      const op = [o0, o1];
      const f = (s) => tillamp(op[(s.length - 1) % 2], s[s.length - 1]);
      if (passar(v, 3, f)) svar.push(forlang(v, k, f));
    }
  }
  return svar;
}

/** Två delserier (jämna och udda index), var och en aritmetisk eller geometrisk. */
function varvad(v, k) {
  const delar = [v.filter((_, i) => i % 2 === 0), v.filter((_, i) => i % 2 === 1)];
  if (delar.some((d) => d.length < 3)) return [];
  const satt = (d) => {
    const ar = aritmetisk(d, k) ? { f: (s) => add(s[s.length - 1], sub(d[1], d[0])) } : null;
    const r = d[0].n !== 0 ? div(d[1], d[0]) : null;
    const g = geometrisk(d, k) ? { f: (s) => mul(s[s.length - 1], r) } : null;
    return [ar, g].filter(Boolean);
  };
  const s0 = satt(delar[0]);
  const s1 = satt(delar[1]);
  const svar = [];
  for (const a of s0) {
    for (const b of s1) {
      const serie = [delar[0].slice(), delar[1].slice()];
      const ut = [];
      for (let i = v.length; i < v.length + k; i++) {
        const del = i % 2;
        const x = (del === 0 ? a : b).f(serie[del]);
        if (!x) break;
        serie[del].push(x);
        ut.push(x);
      }
      if (ut.length === k) svar.push(ut);
    }
  }
  return svar;
}

/** Differenserna är en geometrisk följd. */
function geodiff(v, k) {
  if (v.length < 4) return null;
  const d = v.slice(1).map((x, i) => sub(x, v[i]));
  if (d[0].n === 0) return null;
  const r = div(d[1], d[0]);
  if (!r) return null;
  const f = (s) => {
    const n = s.length;
    const sista = sub(s[n - 1], s[n - 2]);
    return add(s[n - 1], mul(sista, r));
  };
  return passar(v, 3, f) ? forlang(v, k, f) : null;
}

/** a(i+1) = k a(i) + c. */
function affin(v, k) {
  if (v.length < 4) return null;
  const nam = sub(v[1], v[0]);
  if (nam.n === 0) return null;
  const kk = div(sub(v[2], v[1]), nam);
  const c = sub(v[1], mul(kk, v[0]));
  const f = (s) => add(mul(kk, s[s.length - 1]), c);
  return passar(v, 3, f) ? forlang(v, k, f) : null;
}

/** a(i) = a(i-1) + a(i-2) + c. */
function summaC(v, k) {
  if (v.length < 4) return null;
  const c = sub(v[2], add(v[1], v[0]));
  const f = (s) => add(add(s[s.length - 1], s[s.length - 2]), c);
  return passar(v, 3, f) ? forlang(v, k, f) : null;
}

/** a(i) = p a(i-1) + q a(i-2), p och q bestämda av de fyra första talen. */
function rekursion2(v, k) {
  if (v.length < 5) return null;
  // v2 = p v1 + q v0 ; v3 = p v2 + q v1
  const det = sub(mul(v[1], v[1]), mul(v[2], v[0]));
  if (det.n === 0) return null; // singulärt: geometrisk följd, täcks av geometrisk
  const p = div(sub(mul(v[2], v[1]), mul(v[3], v[0])), det);
  const qq = div(sub(mul(v[3], v[1]), mul(v[2], v[2])), det);
  const f = (s) => add(mul(p, s[s.length - 1]), mul(qq, s[s.length - 2]));
  return passar(v, 4, f) ? forlang(v, k, f) : null;
}

const ENKLA = { aritmetisk, geometrisk, kvadratisk, vaxelvis, geodiff, affin, summa_c: summaC, rekursion2 };
const FLERA = { vaxelvis_op: vaxelvisOp, varvad };

/**
 * Alla regler i biblioteket som passar de visade talen, med vad de säger
 * om de k luckorna. `heltal` är false när regeln ger ett bråk (kan aldrig
 * vara ett alternativ, räknas inte som ett annat svar).
 */
export function forutsagelser(visade, k) {
  const v = visade.map(R);
  const ut = [];
  for (const [namn, f] of Object.entries(ENKLA)) {
    const r = f(v, k);
    if (r) ut.push({ modell: namn, varden: r.map(tal), heltal: r.every(arHeltal) });
  }
  for (const [namn, f] of Object.entries(FLERA)) {
    for (const r of f(v, k)) ut.push({ modell: namn, varden: r.map(tal), heltal: r.every(arHeltal) });
  }
  return ut;
}

/**
 * TS1: regler som passar men ger ett annat svar än facit (heltal). Tom lista
 * betyder entydig rad. `traffar` är reglerna som ger facit (minst en krävs,
 * annars är generatorns regel inte i biblioteket).
 */
export function entydighet(visade, facit) {
  const alla = forutsagelser(visade, facit.length);
  const samma = (a) => a.length === facit.length && a.every((x, i) => x === facit[i]);
  return {
    traffar: alla.filter((f) => f.heltal && samma(f.varden)).map((f) => f.modell),
    andra: alla.filter((f) => f.heltal && !samma(f.varden)),
  };
}
