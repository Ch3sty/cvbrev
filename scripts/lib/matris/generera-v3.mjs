// scripts/lib/matris/generera-v3.mjs
// =============================================================================
// Byggarna för bank_version 3 (plan-facit-genvag 2.4 och tillägget om
// variation 1.2). Reglerna går längs rader och kolumner, aldrig genom
// rutnätet i läsordning:
//
//   M1  radvis rörelse: inom varje rad tar figuren k steg per kolumn.
//       linjär: varje ny rad börjar d steg längre fram. fri: varje rad har
//       sitt eget startläge (för 3×3 och 2×2 sitt eget mönster).
//   M2  M1 plus en regel kopplad till rutnätet på en annan egenskap
//       (diagonal, latinsk kvadrat) eller en växling i schackmönster.
//   M3  två element, två riktningar: A går radvis, B kolumnvis, med olika
//       steg, så att de aldrig går i takt (G7).
//   M4  egen riktning per rad: rad 1 och 3 vrider sig k steg, rad 2 lika
//       långt åt andra hållet, plus en regel på en andra egenskap.
//   P6  M3 på balanslinjen med en tredje regel (fyllningen i schackmönster
//       eller på diagonalen): tre regler.
//   P8  dubbel överlagring: tredje kolumnen är XOR av de två första i varje
//       rad, och tredje raden XOR av de två första i varje kolumn.
//
// Kontraktet är detsamma som i generera.mjs: (r, p) => { family, title,
// rule, grid, facit, kandidater }. Byggaren lägger många kandidater; bygg()
// väljer fem som klarar spärrarna (sparrar.mjs). Byggaren returnerar null
// när slumpen gav ett ogiltigt rutnät, så att bygg() försöker igen.
//
// Filen importerar inte generera.mjs (den importerar hit).
// =============================================================================

import { stable, tile as T, LAT_MEDURS, mod } from './celler.mjs';

const key = (c) => stable(c);
const sortNum = (a) => [...a].sort((x, y) => x - y);
const valj = (r, arr) => arr[Math.floor(r() * arr.length)];
function blanda(r, arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function rutnat(f) {
  const g = [0, 1, 2].map((rr) => [0, 1, 2].map((cc) => f(rr, cc)));
  const facit = g[2][2]; g[2][2] = null;
  return { grid: g, facit };
}

// ---------------------------------------------------------------- celler
const vec = (angle, length = 'long', head = 'filled') => ({ kind: 'vector', angle: mod(angle, 360), length, head });
const orb = (satellite, center = 'filled') => ({ kind: 'orbital', center, satellite: satellite === null ? null : mod(satellite, 8) });
const rays = (a) => ({ kind: 'ray', rays: sortNum([...new Set(a.map((x) => mod(x, 8)))]) });
const hjul = (a) => ({ kind: 'sectorwheel', filled: sortNum([...new Set(a.map((x) => mod(x, 8)))]) });
const tl = (p) => ({ kind: 'tile', pattern: p });
const tally = (count, orientation = 'vertical') => ({ kind: 'tally', count, orientation });

// Mönster utan rotationssymmetri (samma som generera.mjs).
export const STRALMONSTER = [[0, 1], [0, 2], [0, 3], [0, 1, 3], [0, 2, 3], [0, 1, 4], [0, 1, 5], [0, 2, 5], [0, 1, 2, 4]];
export const SEKTORMONSTER = [[0, 1], [0, 2], [0, 3], [0, 1, 3], [0, 1, 4], [0, 2, 3], [0, 1, 2, 4], [0, 1, 5], [0, 2, 5], [0, 1, 2, 5], [0, 1, 3, 4]];
export const TILEMONSTER = [
  0b000011010, 0b000110011, 0b001011001, 0b011010000, 0b010011000, 0b100110100, 0b000111001,
  0b001001110, 0b011001000, 0b010110000, 0b001010000, 0b100111000, 0b011110010,
  0b110011000, 0b000101011, 0b101010001, 0b100010011, 0b010011100, 0b000110101, 0b111100000,
].filter((m) => new Set([m, T.rot(m, 1), T.rot(m, 2), T.rot(m, 3)]).size === 4);

const RIKT = (k, n = 8) => (mod(k, n) * 2 < n ? 'medurs' : 'moturs');
const GRAD = (k, n = 8) => (mod(k, n) * 2 < n ? mod(k, n) : n - mod(k, n)) * (360 / n);
const SCHACK = (rr, cc) => (rr + cc) % 2 === 0;
const DIAG = (rr, cc) => rr === cc;
const ORD = { 1: 'ett', 2: 'två', 3: 'tre', 4: 'fyra' };

/** Startläget för rad r: linjärt (s + d·r) eller fritt (tre olika lägen). */
function starter(r, p, n) {
  if (p.mall === 'fri') {
    const s = blanda(r, Array.from({ length: n }, (_, i) => i)).slice(0, 3);
    return (rr) => s[rr];
  }
  const s0 = Math.floor(r() * n);
  return (rr) => s0 + p.d * rr;
}
/** Steget i rad r: k, eller -k i mittraden när raderna växlar riktning (M4). */
const stegFor = (p) => (rr) => (p.vaxlar && rr === 1 ? -p.k : p.k);

/** Text för en andra egenskap (M2, M4): schackmönster eller diagonal. */
function andraText(dim, regel, a, b) {
  const D = 'på diagonalen från övre vänstra hörnet till nedre högra';
  if (dim === 'langd') {
    if (regel === 'schack') return 'Längden växlar mellan lång och kort som ett schackmönster.';
    return `Pilarna ${D} är ${a === 'long' ? 'långa' : 'korta'}, de andra ${b === 'long' ? 'långa' : 'korta'}.`;
  }
  if (dim === 'spets') {
    if (regel === 'schack') return 'Spetsen växlar mellan fylld och öppen som ett schackmönster.';
    return `Spetsen är ${a === 'open' ? 'öppen' : 'fylld'} ${D}, annars ${b === 'open' ? 'öppen' : 'fylld'}.`;
  }
  if (dim === 'center') {
    if (regel === 'schack') return 'Mittpunkten växlar mellan fylld och ofylld som ett schackmönster.';
    return `Mittpunkten är ${a === 'open' ? 'ofylld' : 'fylld'} ${D}, annars ${b === 'open' ? 'ofylld' : 'fylld'}.`;
  }
  return '';
}
const VARDEN = { langd: ['long', 'short'], spets: ['filled', 'open'], center: ['filled', 'open'] };
const andraVarde = (regel, a, b) => (rr, cc) => (regel === 'schack' ? (SCHACK(rr, cc) ? a : b) : regel === 'diagonal' ? (DIAG(rr, cc) ? a : b) : a);

/** Rörelsens text (M1, M4) för en egenskap som vrids. */
function rorelseText(subj, verb, p, n = 8) {
  const g = GRAD(p.k, n); const rk = RIKT(p.k, n);
  let t = p.vaxlar
    ? `${subj} ${verb} ${g} grader ${rk} för varje steg åt höger i den första och den tredje raden, och lika mycket ${rk === 'medurs' ? 'moturs' : 'medurs'} i mittraden.`
    : `${subj} ${verb} ${g} grader ${rk} för varje steg åt höger i raden.`;
  if (p.mall === 'fri') t += ' Varje rad har sitt eget startläge.';
  else if (p.d) t += ` Varje rad börjar ${GRAD(p.d, n)} grader ${RIKT(p.d, n)} jämfört med raden ovanför.`;
  return t;
}

// =============================================================================
// M1, M2, M4 på pil, orbital, strålar och sektorhjul
// =============================================================================
/**
 * p: { prim: 'pil' | 'orbital' | 'stralar' | 'sektor', mall: 'linjar' | 'fri',
 *      k, d, vaxlar, monster, andra: [{ dim, regel: 'schack' | 'diagonal' }],
 *      langd, spets, center, family }
 */
export function radvisRotation(r, p) {
  const n = 8;
  const st = starter(r, p, n);
  const kr = stegFor(p);
  const lage = (rr, cc) => st(rr) + kr(rr) * cc;
  const monster = p.prim === 'stralar' ? (p.monster ?? valj(r, STRALMONSTER)) : p.prim === 'sektor' ? (p.monster ?? valj(r, SEKTORMONSTER)) : null;
  // Andra egenskaper: konstant eller enligt regel, värdena slumpade.
  const andra = {};
  for (const dim of ['langd', 'spets', 'center']) {
    const regel = (p.andra ?? []).find((x) => x.dim === dim)?.regel ?? null;
    const [x, y] = blanda(r, VARDEN[dim]);
    const fast = p[dim] ?? x;
    andra[dim] = regel ? { regel, a: x, b: y, f: andraVarde(regel, x, y) } : { regel: null, a: fast, f: () => fast };
  }
  const mk = (pos, v) => {
    if (p.prim === 'pil') return vec(pos * 45, v.langd, v.spets);
    if (p.prim === 'orbital') return orb(pos, v.center);
    if (p.prim === 'stralar') return rays(monster.map((x) => x + pos));
    return hjul(monster.map((x) => x + pos));
  };
  const v = (rr, cc) => ({ langd: andra.langd.f(rr, cc), spets: andra.spets.f(rr, cc), center: andra.center.f(rr, cc) });
  const { grid, facit } = rutnat((rr, cc) => mk(lage(rr, cc), v(rr, cc)));
  // Facits läge får inte finnas bland de synliga i samma egenskap när den är
  // ensam om att variera; spärrarna avgör resten.
  const fp = lage(2, 2); const fv = v(2, 2);
  const huvud = [fp + 1, fp - 1, fp + 4, fp + p.k, fp - p.k, fp - 2 * p.k, lage(2, 1), lage(2, 0), fp + 2, fp - 2, lage(1, 2) + (lage(1, 2) - lage(0, 2)), lage(1, 2), fp + (p.d ?? 0) - p.k];
  const kand = [];
  const flips = [{}];
  for (const dim of ['langd', 'spets', 'center']) {
    const relevant = p.prim === 'pil' ? dim !== 'center' : p.prim === 'orbital' ? dim === 'center' : false;
    if (!relevant) continue;
    const annat = VARDEN[dim].find((x) => x !== fv[dim]);
    for (const f of [...flips]) flips.push({ ...f, [dim]: annat });
  }
  // Fel i rörelsen först, sedan fel i den andra egenskapen, sist båda.
  for (const pos of huvud) kand.push(mk(pos, fv));
  for (const f of flips.slice(1)) kand.push(mk(fp, { ...fv, ...f }));
  for (const pos of huvud) for (const f of flips.slice(1)) kand.push(mk(pos, { ...fv, ...f }));
  if (monster) {
    // spegelbild och ett element för mycket eller för lite
    const F = monster.map((x) => x + fp);
    kand.push(mk(0, {}), p.prim === 'stralar' ? rays(F.map((x) => 8 - x)) : hjul(F.map((x) => 7 - x)), p.prim === 'stralar' ? rays(F.slice(1)) : hjul(F.slice(1)));
    kand.splice(kand.findIndex((c) => key(c) === key(mk(0, {}))), 1);
  }
  const subj = { pil: 'Pilen', orbital: 'Pricken', stralar: 'Strecken', sektor: 'Mönstret av svarta sektorer' }[p.prim];
  const verb = { pil: 'vrider sig', orbital: 'flyttar', stralar: 'vrider sig', sektor: 'vrider sig' }[p.prim];
  const delar = [rorelseText(subj, verb, p)];
  for (const x of p.andra ?? []) delar.push(andraText(x.dim, x.regel, andra[x.dim].a, andra[x.dim].b));
  if (p.prim === 'pil') {
    const konst = ['langd', 'spets'].filter((d) => !andra[d].regel);
    if (konst.length === 2) delar.push(`Pilen är ${andra.langd.a === 'long' ? 'lång' : 'kort'} och spetsen ${andra.spets.a === 'open' ? 'öppen' : 'fylld'} hela vägen.`);
    else if (konst[0] === 'langd') delar.push(`Pilen är ${andra.langd.a === 'long' ? 'lång' : 'kort'} hela vägen.`);
    else if (konst[0] === 'spets') delar.push(`Spetsen är ${andra.spets.a === 'open' ? 'öppen' : 'fylld'} hela vägen.`);
  }
  if (p.prim === 'orbital' && !andra.center.regel) delar.push(`Mittpunkten är ${andra.center.a === 'open' ? 'ofylld' : 'fylld'} hela vägen.`);
  if (p.prim === 'stralar') delar.push('Antalet streck och vinkeln mellan dem ändras aldrig.');
  const title = {
    pil: p.andra?.length ? 'Pilen vrider sig radvis och byter' : 'Pilen vrider sig radvis',
    orbital: p.andra?.length ? 'Pricken vandrar radvis och mitten byter' : 'Pricken vandrar radvis',
    stralar: 'Strecken vrider sig radvis',
    sektor: 'Sektorerna vrider sig radvis',
  }[p.prim];
  return { family: p.family, title: p.vaxlar ? `${title}, raderna växlar riktning` : title, rule: delar.join(' '), grid, facit, kandidater: kand };
}

// =============================================================================
// M1 fri på 3×3-blocket: varje rad har sitt eget mönster, som vrids ett
// kvarts varv per kolumn.
// =============================================================================
export function radvisBlock(r, p) {
  const ms = blanda(r, TILEMONSTER.filter((m) => !p.antal || T.antal(m) === p.antal));
  const valda = [];
  for (const m of ms) {
    if (valda.length === 3) break;
    if (valda.some((x) => [0, 1, 2, 3].some((j) => T.rot(x, j) === m))) continue;
    valda.push(m);
  }
  if (valda.length < 3) return null;
  const k = p.k; // 1 medurs, 3 moturs
  const vr = (rr) => T.rot(valda[rr], Math.floor(r() * 4));
  const bas = [vr(0), vr(1), vr(2)];
  const { grid, facit } = rutnat((rr, cc) => tl(T.rot(bas[rr], k * cc)));
  const f = facit.pattern;
  const flips = [];
  for (let i = 0; i < 9; i++) { const x = f ^ (1 << i); if (Math.abs(T.antal(x) - T.antal(f)) === 1) flips.push(x); }
  const kand = [grid[2][1], tl(T.rot(f, k)), tl(T.rot(f, 2)), grid[2][0], tl(T.spegelH(f)), tl(T.spegelV(f)), tl(T.rot(bas[1], 2 * k)), tl(T.rot(bas[0], 2 * k)), ...blanda(r, flips).slice(0, 6).map(tl)];
  const rule = `Blocket roterar 90 grader ${k === 1 ? 'medurs' : 'moturs'} för varje steg åt höger i raden. Varje rad har sitt eget block.`;
  return { family: 'monsterrotation', title: `Blocket roterar ${k === 1 ? 'medurs' : 'moturs'} radvis`, rule, grid, facit, kandidater: kand };
}

// =============================================================================
// 2×2: markeringar som går radvis (M1), två fyllningar som vrids tillsammans
// (mönsterrotation), en markering som går kolumnvis (M3) och en markering i
// latinsk kvadrat (M2).
// =============================================================================
const LATIN = (() => {
  const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  const out = [];
  for (const a of perms) for (const b of perms) for (const c of perms) if ([0, 1, 2].every((j) => new Set([a[j], b[j], c[j]]).size === 3)) out.push([a, b, c]);
  return out;
})();
export { LATIN };
const LAT_NAMN = { fill_black: 'den svarta rutan', fill_gray: 'den grå rutan', dot: 'pricken', cross: 'krysset' };
const LAGE_NAMN = ['uppe till vänster', 'uppe till höger', 'nere till höger', 'nere till vänster'];
/**
 * p.marks: [{ typ, mall: 'linjar' | 'fri' | 'foljer', d, k, foljer, o }]
 *   linjar: läge s + d·r + k·c; fri: eget startläge per rad, k per kolumn;
 *   foljer: samma läge som markeringen `foljer` plus o (mönster som vrids).
 * p.latin: { typ, lagen: [tre lägen] } en markering i latinsk kvadrat.
 */
export function radvis2x2(r, p) {
  const fn = {};
  for (const m of p.marks) {
    if (m.mall === 'foljer') { const f = fn[m.foljer]; fn[m.typ] = (rr, cc) => f(rr, cc) + m.o; continue; }
    // m.fran: startläget räknas från en annan markering (plus m.o), så att
    // två markeringar som går olika aldrig hamnar i samma ruta.
    const st = m.fran ? ((rr) => fn[m.fran](rr, 0) + m.o + (m.d - p.marks.find((x) => x.typ === m.fran).d) * 0) : starter(r, m, 4);
    const s0 = m.fran ? null : null;
    fn[m.typ] = m.fran
      ? (() => { const base = fn[m.fran](0, 0) + m.o; return (rr, cc) => base + m.d * rr + m.k * cc; })()
      : (rr, cc) => st(rr) + m.k * cc;
  }
  if (p.latin) {
    const L = valj(r, LATIN); const perm = blanda(r, [0, 1, 2]);
    fn[p.latin.typ] = (rr, cc) => p.latin.lagen[perm[L[rr][cc]]];
  }
  const typer = Object.keys(fn);
  const cellAv = (lagen) => {
    const c = ['empty', 'empty', 'empty', 'empty'];
    for (const t of typer) {
      if (lagen[t] === null) continue;
      const i = LAT_MEDURS[mod(lagen[t], 4)];
      if (c[i] !== 'empty') return null;
      c[i] = t;
    }
    return { kind: 'lattice', cells: c };
  };
  const lagenAt = (rr, cc) => Object.fromEntries(typer.map((t) => [t, fn[t](rr, cc)]));
  for (let rr = 0; rr < 3; rr++) for (let cc = 0; cc < 3; cc++) if (!cellAv(lagenAt(rr, cc))) return null;
  const { grid, facit } = rutnat((rr, cc) => cellAv(lagenAt(rr, cc)));
  const F = lagenAt(2, 2);
  const kand = [];
  const varianter = [];
  for (const t of typer) for (const dx of [1, 2, 3]) varianter.push({ [t]: F[t] + dx });
  for (let i = 0; i < typer.length; i++) for (let j = i + 1; j < typer.length; j++) {
    varianter.push({ [typer[i]]: F[typer[j]], [typer[j]]: F[typer[i]] });
    for (const a of [1, 3]) for (const b of [1, 3]) varianter.push({ [typer[i]]: F[typer[i]] + a, [typer[j]]: F[typer[j]] + b });
  }
  for (const vnt of varianter) { const c = cellAv({ ...F, ...vnt }); if (c) kand.push(c); }
  kand.push(grid[2][1], grid[2][0], grid[1][2]);
  // Fyllnad byts mot en annan typ (rätt plats, fel fyllning)
  const andraTyp = { fill_black: 'fill_gray', fill_gray: 'fill_black', dot: 'cross', cross: 'dot' };
  for (const t of typer) {
    const c = facit.cells.map((x) => (x === t ? andraTyp[t] : x));
    if (!typer.includes(andraTyp[t])) kand.push({ kind: 'lattice', cells: c });
  }
  // Text
  const delar = [];
  const rorliga = p.marks.filter((m) => m.mall !== 'foljer');
  for (const m of rorliga) {
    const N = LAT_NAMN[m.typ]; const Nst = N.charAt(0).toUpperCase() + N.slice(1);
    const steg = m.k === 1 ? 'ett steg medurs' : m.k === 3 ? 'ett steg moturs' : 'två steg';
    const foljare = p.marks.filter((x) => x.mall === 'foljer' && x.foljer === m.typ).map((x) => LAT_NAMN[x.typ]);
    const subj = foljare.length ? `${Nst} och ${foljare.join(' och ')}` : Nst;
    const verb = foljare.length ? 'flyttar tillsammans' : 'flyttar';
    if (m.kolumnvis) {
      delar.push(`${subj} ${verb} ${m.k === 1 ? 'ett steg medurs' : m.k === 3 ? 'ett steg moturs' : 'två steg'} runt de fyra rutorna för varje steg åt höger, och varje rad börjar ${m.d === 2 ? 'två steg' : m.d === 1 ? 'ett steg medurs' : 'ett steg moturs'} längre fram. Läst nedåt i kolumnen flyttar ${foljare.length ? 'de' : N} alltså ${m.d === 2 ? 'två steg' : m.d === 1 ? 'ett steg medurs' : 'ett steg moturs'} per rad.`);
    } else {
      delar.push(`${subj} ${verb} ${steg} runt de fyra rutorna för varje steg åt höger i raden.${m.mall === 'fri' ? ' Varje rad har sitt eget startläge.' : ` Varje rad börjar ${m.d === 2 ? 'två steg' : m.d === 1 ? 'ett steg medurs' : 'ett steg moturs'} jämfört med raden ovanför.`}`);
    }
  }
  if (p.latin) delar.push(`${LAT_NAMN[p.latin.typ].charAt(0).toUpperCase() + LAT_NAMN[p.latin.typ].slice(1)} sitter ${LAGE_NAMN[mod(p.latin.lagen[0], 4)]}, ${LAGE_NAMN[mod(p.latin.lagen[1], 4)]} eller ${LAGE_NAMN[mod(p.latin.lagen[2], 4)]}, och varje rad och varje kolumn har varje läge exakt en gång.`);
  delar.push('Medurs betyder uppe till vänster, uppe till höger, nere till höger, nere till vänster.');
  return { family: p.family, title: p.titel ?? 'Rutorna flyttar radvis', rule: delar.join(' '), grid, facit, kandidater: kand };
}

// =============================================================================
// M3 och P6 på balanslinjen: kvadraten går radvis, cirkeln kolumnvis, i tre
// fack (läge 0, 1, 2 från vänster). Läget är s + d·rad + k·kolumn (mod 3);
// med olika (d, k) för formerna, som inte är multipler av varandra, går de
// aldrig i takt. Sidorna står still (kvadraten och cirkeln på var sin sida),
// eller i P6 växlar kvadratens fyllning i schackmönster eller på diagonalen.
// =============================================================================
const SIDA_NAMN = { above: 'ovanför', below: 'under' };
export function radvisBalans(r, p) {
  const s = { square: Math.floor(r() * 3), circle: Math.floor(r() * 3) };
  const pos = (shape, rr, cc) => mod(s[shape] + p[shape].d * rr + p[shape].k * cc, 3);
  const [sidaS, sidaC] = p.sidor === 'kvadrat-over' ? ['above', 'below'] : p.sidor === 'kvadrat-under' ? ['below', 'above'] : valj(r, [['above', 'below'], ['below', 'above']]);
  const fyll0 = valj(r, ['gray', 'none']); const fyll1 = fyll0 === 'gray' ? 'none' : 'gray';
  const fyll = (rr, cc) => (!p.fyll ? null : p.fyll === 'schack' ? (SCHACK(rr, cc) ? fyll0 : fyll1) : (DIAG(rr, cc) ? fyll0 : fyll1));
  const sq = (posX, side, f) => (f ? { posX, side, shape: 'square', fill: f } : { posX, side, shape: 'square' });
  const ci = (posX, side) => ({ posX, side, shape: 'circle', fill: 'gray' });
  const cell = (a, b, f, sa = sidaS, sb = sidaC) => ({ kind: 'balanceline', items: [sq(a, sa, f), ci(b, sb)] });
  const { grid, facit } = rutnat((rr, cc) => cell(pos('square', rr, cc), pos('circle', rr, cc), fyll(rr, cc)));
  const A = pos('square', 2, 2); const B = pos('circle', 2, 2); const Fy = fyll(2, 2);
  const andraFyll = Fy === 'gray' ? 'none' : Fy === 'none' ? 'gray' : null;
  const kand = [];
  const fyllar = Fy ? [Fy, andraFyll] : [null];
  for (const da of [0, 1, 2]) for (const db of [0, 1, 2]) for (const f of fyllar) {
    if (da === 0 && db === 0 && f === Fy) continue;
    kand.push(cell(mod(A + da, 3), mod(B + db, 3), f));
  }
  kand.push(cell(A, B, Fy, sidaC, sidaS));
  // de som skiljer i en regel först
  kand.sort((x, y) => {
    const fel = (c) => (c.items[0].posX !== A) + (c.items[1].posX !== B) + ((c.items[0].fill ?? null) !== Fy) + (c.items[0].side !== sidaS);
    return fel(x) - fel(y);
  });
  const besk = (N, q, sida) => {
    const steg = (x) => (x === 1 ? 'ett steg åt höger' : 'ett steg åt vänster');
    return `${N} står ${SIDA_NAMN[sida]} linjen och flyttar ${steg(q.k)} för varje steg åt höger i raden. Varje rad börjar ${steg(q.d)} från raden ovanför.`;
  };
  const delar = [besk('Kvadraten', p.square, sidaS), besk('Cirkeln', p.circle, sidaC), 'Kommer en form till kanten fortsätter den från andra sidan.'];
  if (p.fyll === 'schack') delar.push(`Kvadraten växlar mellan ${fyll0 === 'gray' ? 'grå och ofylld' : 'ofylld och grå'} som ett schackmönster.`);
  if (p.fyll === 'diagonal') delar.push(`Kvadraten är ${fyll0 === 'gray' ? 'grå' : 'ofylld'} på diagonalen från övre vänstra hörnet till nedre högra, annars ${fyll1 === 'gray' ? 'grå' : 'ofylld'}.`);
  return { family: 'tva-rorelser', title: p.fyll ? 'Två former och en fyllning' : 'Två former, två riktningar', rule: delar.join(' '), grid, facit, kandidater: kand };
}

// =============================================================================
// Antal som ändras radvis: varje rad räknar upp eller ner ett streck per
// kolumn. Med egen riktning per rad räknar mittraden åt andra hållet.
// Riktningen på strecken står still, är densamma i varje rad (rad) eller
// skiljer sig på diagonalen.
// =============================================================================
export function antalEgenRiktning(r, p) {
  const d = p.d ?? valj(r, [1, -1]);
  const steg = (rr) => (p.vaxlar && rr === 1 ? -d : d);
  // startvärden så att alla antal ligger i 1..4 och raderna skiljer sig
  const mojliga = (rr) => [1, 2, 3, 4].filter((s) => [0, 1, 2].every((cc) => s + steg(rr) * cc >= 1 && s + steg(rr) * cc <= 4));
  const st = [0, 1, 2].map((rr) => valj(r, mojliga(rr)));
  if (st[0] === st[2] || (!p.vaxlar && (st[0] === st[1] || st[1] === st[2]))) return null;
  const [o0, o1] = valj(r, [['vertical', 'horizontal'], ['horizontal', 'vertical']]);
  const radO = blanda(r, [o0, o1, o0]);
  const o = (rr, cc) => (p.riktning === 'rad' ? radO[rr] : p.riktning === 'diagonal' ? (DIAG(rr, cc) ? o0 : o1) : o0);
  const n = (rr, cc) => st[rr] + steg(rr) * cc;
  const { grid, facit } = rutnat((rr, cc) => tally(n(rr, cc), o(rr, cc)));
  const f = facit.count; const fo = facit.orientation; const ao = fo === 'vertical' ? 'horizontal' : 'vertical';
  const kand = [];
  for (const c of [f + 1, f - 1, grid[2][1].count, f - 2 * d, f + 2]) for (const oo of [fo, ao]) if (c >= 1 && c <= 4 && !(c === f && oo === fo)) kand.push(tally(c, oo));
  kand.unshift(tally(f, ao));
  const ord = (x) => (x === 'vertical' ? 'stående' : 'liggande');
  const upp = d > 0 ? 'ökar' : 'minskar'; const ner = d > 0 ? 'minskar' : 'ökar';
  const delar = [p.vaxlar
    ? `Antalet streck ${upp} med ett för varje steg åt höger i den första och den tredje raden, och ${ner} med ett i mittraden.`
    : `Antalet streck ${upp} med ett för varje steg åt höger i raden. Varje rad börjar på sitt eget antal.`];
  if (p.riktning === 'rad') delar.push('Strecken har samma riktning i hela raden, och raderna växlar mellan stående och liggande.');
  else if (p.riktning === 'diagonal') delar.push(`Strecken är ${ord(o0)} på diagonalen från övre vänstra hörnet till nedre högra, annars ${ord(o1)}.`);
  else delar.push(`Strecken är ${ord(o0)} hela vägen.`);
  return { family: 'antal-andras', title: p.vaxlar ? 'Raderna räknar åt var sitt håll' : 'Strecken räknas radvis', rule: delar.join(' '), grid, facit, kandidater: kand };
}

// =============================================================================
// P8 dubbel överlagring: den tredje rutan i varje rad är det som finns i
// bara en av de två första, och den nedersta rutan i varje kolumn likaså.
// Luckan följer av båda.
// =============================================================================
export function dubbelOverlagring(r, p) {
  const ray = p.format === 'ray';
  const mk = ray ? (s) => rays([...s]) : (s) => hjul([...s]);
  const maxC = ray ? 4 : 5;
  const monster = (ray ? STRALMONSTER : SEKTORMONSTER).filter((m) => m.length >= 2 && m.length <= 3);
  const slump = () => { const m = valj(r, monster); const j = Math.floor(r() * 8); return new Set(m.map((x) => mod(x + j, 8))); };
  const xor = (a, b) => new Set([...a, ...b].filter((x) => a.has(x) !== b.has(x)));
  const A = [[slump(), slump()], [slump(), slump()]];
  const M = [0, 1, 2].map((rr) => [0, 1, 2].map((cc) => {
    if (rr < 2 && cc < 2) return A[rr][cc];
    if (rr < 2) return xor(A[rr][0], A[rr][1]);
    if (cc < 2) return xor(A[0][cc], A[1][cc]);
    return xor(xor(A[0][0], A[0][1]), xor(A[1][0], A[1][1]));
  }));
  const lika = (a, b) => key(sortNum([...a])) === key(sortNum([...b]));
  const alla = M.flat();
  if (alla.some((s) => s.size < 1 || s.size > maxC)) return null;
  for (let i = 0; i < 9; i++) for (let j = i + 1; j < 9; j++) if (lika(alla[i], alla[j])) return null;
  // facitlinjerna ska dela element (annars är XOR samma sak som unionen)
  const delar = (a, b) => [...a].some((x) => b.has(x));
  if (!delar(M[2][0], M[2][1]) || !delar(M[0][2], M[1][2]) || M[2][2].size < 2) return null;
  const { grid, facit } = rutnat((rr, cc) => mk(M[rr][cc]));
  const F = M[2][2];
  const union = (a, b) => new Set([...a, ...b]);
  const snitt = (a, b) => new Set([...a].filter((x) => b.has(x)));
  const kand = [mk(union(M[2][0], M[2][1])), mk(union(M[0][2], M[1][2])), mk(snitt(M[2][0], M[2][1])), mk(snitt(M[0][2], M[1][2])),
    mk(new Set([...M[2][0]].filter((x) => !M[2][1].has(x)))), mk(new Set([...M[0][2]].filter((x) => !M[1][2].has(x)))),
    mk(new Set([...M[2][1]].filter((x) => !M[2][0].has(x)))), mk(new Set([...M[1][2]].filter((x) => !M[0][2].has(x))))];
  for (let x = 0; x < 8; x++) { const s = new Set(F); if (s.has(x)) s.delete(x); else s.add(x); if (s.size >= 1 && s.size <= maxC) kand.push(mk(s)); }
  const rule = 'Den tredje rutan i varje rad visar det som finns i bara en av de två första. Det gemensamma försvinner. Samma sak gäller nedåt: den nedersta rutan i varje kolumn visar det som finns i bara en av de två ovanför.';
  return { family: 'overlagring', title: 'Bara det som skiljer, åt två håll', rule, grid, facit, kandidater: kand };
}
