// scripts/lib/matris/generera.mjs
// =============================================================================
// Byggstenar för att generera matrisfrågor programmatiskt (våg 3c).
//
// Varje byggare konstruerar regeln i kod (vridningsbana, latinsk kvadrat,
// överlagring, spegling ...) och returnerar rutnätet, facit och en lista
// near-miss-kandidater där en dimension är ändrad. `bygg()` väljer fem
// distraktorer som har en maskinell misstagstext och skiljer sig åt, blandar
// facits plats, sätter `family`, `misstag` och `difficulty`, och kör hela
// kvalitetskontrollen (kontroll.mjs). Underkända försök slängs och byggaren
// försöker igen med ett nytt startläge.
// =============================================================================

import { mulberry32, hashString } from '../blanda-alternativ.mjs';
import { stable, tile as T, sektor, ray as RAY, lattice as LAT, LAT_MEDURS, mod, dimsFor, vKey } from './celler.mjs';
import { kontrollera } from './kontroll.mjs';
import { misstagFor, urvalsText } from './misstag.mjs';
import { tolka, familjFor } from './tolka.mjs';
import { analysera, plusFel, tomFigur, facitUdda, eliminerbara } from './distraktorer.mjs';
import { radvisRotation, radvisBlock, radvis2x2, radvisBalans, antalEgenRiktning, dubbelOverlagring } from './generera-v3.mjs';
import { sparrFel, dimNyckel, utseendeNyckel, s11Majoritet, delarRader } from './sparrar.mjs';

export const key = (c) => stable(c);
const sortNum = (a) => [...a].sort((x, y) => x - y);
const RIKT = { cw: 'medurs', ccw: 'moturs' };
const LAS = 'Läs rutorna som en lång rad, uppifrån och ner.';
const ORD = { 1: 'ett', 2: 'två', 3: 'tre', 4: 'fyra' };

export function rng(seed) { return mulberry32(hashString(String(seed))); }
const valj = (r, arr) => arr[Math.floor(r() * arr.length)];
function blanda(r, arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function sekvensGrid(celler) {
  return { grid: [[celler[0], celler[1], celler[2]], [celler[3], celler[4], celler[5]], [celler[6], celler[7], null]], facit: celler[8] };
}
function rutnat(f) { // f(r, c) -> cell
  const g = [0, 1, 2].map((r) => [0, 1, 2].map((c) => f(r, c)));
  const facit = g[2][2]; g[2][2] = null;
  return { grid: g, facit };
}

// ---------------------------------------------------------------- celler
const vec = (angle, length = 'long', head = 'filled') => ({ kind: 'vector', angle: mod(angle, 360), length, head });
const rays = (a) => ({ kind: 'ray', rays: sortNum(a.map((x) => mod(x, 8))) });
const hjul = (a) => ({ kind: 'sectorwheel', filled: sortNum(a.map((x) => mod(x, 8))) });
const tl = (p) => ({ kind: 'tile', pattern: p });
const lat = (cells) => ({ kind: 'lattice', cells: [...cells] });
// Orbital (spec-rummen 15.8): pricken står bara på de åtta kompasspunkterna
// (index 0 till 7, multipler av 45 grader, aldrig 30), och ramen är alltid
// den streckade cirkeln med fylld eller ofylld mittpunkt. Prickar utan ram
// är förbjudna.
const orb = (satellite, center = 'filled') => {
  if (!(satellite === null || (Number.isInteger(satellite) && satellite >= 0 && satellite <= 7))) {
    throw new Error(`orbital: pricken måste stå på en av de åtta kompasspunkterna (fick ${satellite})`);
  }
  if (center !== 'filled' && center !== 'open') throw new Error(`orbital: mittpunkten måste vara fylld eller ofylld (fick ${center})`);
  return { kind: 'orbital', center, satellite };
};
const poly = (sides, fill) => ({ kind: 'poly', sides, rotation: 0, fill });
const stack = (base, symbol, baseFill = 'none') => ({ kind: 'stack', base, symbol, baseFill });
const tally = (count, orientation = 'vertical') => ({ kind: 'tally', count, orientation });
const ring = (r) => ({ kind: 'ring', rings: [...r] });
const bal = (items) => ({ kind: 'balanceline', items: items.map((i) => (i.shape === 'circle' ? { posX: i.posX, side: i.side, shape: 'circle', fill: 'gray' } : { posX: i.posX, side: i.side, shape: 'square' })) });

// Alla 12 latinska kvadrater av ordning 3.
export const LATIN = (() => {
  const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  const out = [];
  for (const a of perms) for (const b of perms) for (const c of perms) {
    const L = [a, b, c];
    const ok = [0, 1, 2].every((j) => new Set([a[j], b[j], c[j]]).size === 3);
    if (ok) out.push(L);
  }
  return out;
})();

// =============================================================================
// Byggare. Var och en: (r, p) => { family, title, rule, grid, facit, kandidater }
// p är receptets parametrar. r är en seedad slump för startläget.
// =============================================================================

// ---------------------------------------------------------------- vridning
export function pilVridning(r, p) {
  const k = p.k; const s = p.dir === 'ccw' ? -k : k;
  const start = valj(r, [0, 1, 2, 3, 4, 5, 6, 7]);
  const L = p.langd ?? 'long'; const H = p.spets ?? 'filled';
  const ang = (i) => (start + s * i) * 45;
  const celler = Array.from({ length: 9 }, (_, i) => vec(ang(i), L, H));
  const { grid, facit } = sekvensGrid(celler);
  const a = facit.angle;
  const kand = [vec(celler[7].angle, L, H), vec(a + s * 45, L, H), vec(a + 180, L, H), vec(a - (p.dir === 'ccw' ? -45 : 45), L, H), vec(a + (p.dir === 'ccw' ? -45 : 45), L, H), vec(celler[6].angle, L, H), vec(a, L === 'long' ? 'short' : 'long', H), vec(a, L, H === 'filled' ? 'open' : 'filled'), vec(a + 90, L, H)];
  if (p.kum) kand.unshift(vec(celler[7].angle + (celler[7].angle - celler[6].angle), L, H));
  const grader = k * 45;
  const rule = p.kum
    ? `Pilen vrider sig ${RIKT[p.dir]}, och för varje ruta vrider den sig 45 grader längre än förra gången (45, 90, 135 grader och så vidare). ${LAS}`
    : `Pilen vrider sig ${grader} grader ${RIKT[p.dir]} för varje ruta. ${LAS} Längden och spetsen är likadana hela vägen.`;
  return { family: 'vridning', title: p.kum ? 'Pilen vrider sig allt längre' : `Pilen vrider sig ${grader} grader ${RIKT[p.dir]}`, rule, grid, facit, kandidater: kand };
}

// Strålar utan rotationssymmetri.
const STRALMONSTER = [[0, 1], [0, 2], [0, 3], [0, 1, 3], [0, 2, 3], [0, 1, 4], [0, 1, 5], [0, 2, 5], [0, 1, 2, 4]];
export function stralVridning(r, p) {
  const s = p.dir === 'ccw' ? -p.k : p.k;
  const bas = p.monster ?? valj(r, STRALMONSTER);
  const start = valj(r, [0, 1, 2, 3, 4, 5, 6, 7]);
  const off = (i) => start + (p.kum ? (i * (i + 1)) / 2 * (p.dir === 'ccw' ? -1 : 1) : s * i);
  const celler = Array.from({ length: 9 }, (_, i) => rays(bas.map((x) => x + off(i))));
  const { grid, facit } = sekvensGrid(celler);
  const f = facit.rays;
  const kand = [celler[7], rays(f.map((x) => x + s)), celler[6], rays(f.map((x) => x + 4)), rays(f.map((x) => 8 - x)), rays(f.slice(1)), rays([...f, f[f.length - 1] + 1].filter((x, i, a) => a.indexOf(mod(x, 8)) === i)), rays(f.map((x) => x + 1)), rays(f.map((x) => x - 1))];
  const rule = p.kum
    ? `Strecken vrider sig ${RIKT[p.dir]}, och för varje ruta vrider de sig 45 grader längre än förra gången (45, 90, 135 grader och så vidare). ${LAS}`
    : `Strecken vrider sig ${p.k * 45} grader ${RIKT[p.dir]} för varje ruta. ${LAS} Antalet streck och vinkeln mellan dem ändras aldrig.`;
  return { family: 'vridning', title: p.kum ? 'Strecken vrider sig allt längre' : `Strecken vrider sig ${p.k * 45} grader`, rule, grid, facit, kandidater: kand };
}

// ---------------------------------------------------------------- mönster som roterar
// 3×3-block med fyra olika lägen (regel 5).
const TILEMONSTER = [
  0b000011010, 0b000110011, 0b001011001, 0b011010000, 0b010011000, 0b100110100, 0b000111001,
  0b001001110, 0b011001000, 0b010110000, 0b001010100 ^ 0b000000100, 0b100111000, 0b011110010,
  0b110011000, 0b000101011, 0b101010001, 0b100010011, 0b010011100, 0b000110101, 0b111100000,
].filter((m) => new Set([m, T.rot(m, 1), T.rot(m, 2), T.rot(m, 3)]).size === 4);
export { TILEMONSTER };
function bitflips(m) {
  const out = [];
  for (let i = 0; i < 9; i++) out.push(m ^ (1 << i));
  return out;
}
export function tileRotation(r, p) {
  const bas = p.monster ?? valj(r, TILEMONSTER.filter((m) => !p.antal || T.antal(m) === p.antal));
  const step = p.dir === 'ccw' ? 3 : 1;
  const celler = []; let m = bas;
  for (let i = 0; i < 9; i++) {
    celler.push(tl(m));
    m = p.kum ? T.rot(m, (p.dir === 'ccw' ? -1 : 1) * (i + 1)) : T.rot(m, step);
  }
  const { grid, facit } = sekvensGrid(celler);
  const f = facit.pattern;
  const nara = bitflips(f).filter((x) => Math.abs(T.antal(x) - T.antal(f)) === 1);
  const kand = [celler[7], celler[6], tl(T.rot(f, 2)), tl(T.spegelH(f)), tl(T.spegelV(f)), tl(T.rot(f, step)), ...blanda(r, nara).slice(0, 5).map(tl)];
  const rule = p.kum
    ? `Mönstret i rutnätet vrider sig ${RIKT[p.dir]}: först ett kvarts varv, sedan två, sedan tre och så vidare. ${LAS}`
    : `Mönstret i rutnätet roterar 90 grader ${RIKT[p.dir]} för varje ruta. ${LAS}`;
  return { family: 'monsterrotation', title: p.kum ? 'Blocket vrider sig allt längre' : `Blocket roterar ${RIKT[p.dir]}`, rule, grid, facit, kandidater: kand };
}

const SEKTORMONSTER = [[0, 1], [0, 2], [0, 3], [0, 1, 3], [0, 1, 4], [0, 2, 3], [0, 1, 2, 4], [0, 1, 5], [0, 2, 5], [0, 1, 2, 5], [0, 1, 3, 4]];
export function sektorRotation(r, p) {
  const bas = p.monster ?? valj(r, SEKTORMONSTER.filter((m) => !p.antal || m.length === p.antal));
  const s = p.dir === 'ccw' ? -p.k : p.k;
  const start = valj(r, [0, 1, 2, 3, 4, 5, 6, 7]);
  const off = (i) => start + (p.kum ? (i * (i + 1)) / 2 * (p.dir === 'ccw' ? -1 : 1) : s * i);
  const celler = Array.from({ length: 9 }, (_, i) => hjul(bas.map((x) => x + off(i))));
  const { grid, facit } = sekvensGrid(celler);
  const f = facit.filled;
  const tom = [0, 1, 2, 3, 4, 5, 6, 7].filter((x) => !f.includes(x));
  const kand = [celler[7], hjul(f.map((x) => x + s)), celler[6], hjul(f.map((x) => x + 1)), hjul(f.map((x) => x - 1)), hjul(f.map((x) => x + 4)), hjul(sektor.spegelLodrat(f)), hjul(f.slice(1)), hjul([...f, valj(r, tom)])];
  const rule = p.kum
    ? `Mönstret av svarta sektorer vrider sig ${RIKT[p.dir]}, och för varje ruta vrider det sig 45 grader längre än förra gången. ${LAS}`
    : `Mönstret av svarta sektorer roterar ${p.k * 45} grader ${RIKT[p.dir]} för varje ruta. ${LAS}`;
  return { family: 'monsterrotation', title: p.kum ? 'Sektorerna vrider sig allt längre' : `Sektormönstret roterar ${p.k * 45} grader`, rule, grid, facit, kandidater: kand };
}

// 2×2-mönster med två olika fyllningar, vrids ett kvarts varv per ruta.
export function latticeMonster(r, p) {
  const typer = p.typer ?? ['fill_black', 'fill_gray'];
  const bas = ['empty', 'empty', 'empty', 'empty'];
  const plats = blanda(r, [0, 1, 2, 3]);
  typer.forEach((t, i) => { bas[plats[i]] = t; });
  const step = p.dir === 'ccw' ? 3 : 1;
  const celler = Array.from({ length: 9 }, (_, i) => lat(LAT.rot(bas, step * i)));
  const { grid, facit } = sekvensGrid(celler);
  const f = facit.cells;
  const byt = f.map((q) => (q === typer[0] ? typer[1] : q === typer[1] ? typer[0] : q));
  const kand = [celler[7], celler[6], lat(LAT.rot(f, step)), lat(LAT.rot(f, 2)), lat(byt), lat(LAT.spegelH(f)), lat(LAT.spegelV(f)), lat(f.map((q) => (q === typer[1] ? 'empty' : q)))];
  const rule = `Mönstret i de fyra rutorna vrider sig ett kvarts varv ${RIKT[p.dir]} för varje ruta. ${LAS}`;
  return { family: 'monsterrotation', title: `Rutmönstret vrider sig ${RIKT[p.dir]}`, rule, grid, facit, kandidater: kand };
}

// ---------------------------------------------------------------- vandring
const LATNAMN = { fill_black: 'Den svarta rutan', fill_gray: 'Den grå rutan', dot: 'Pricken' };
export function latticeVandring(r, p) {
  const typ = p.typ ?? 'fill_black';
  const start = valj(r, [0, 1, 2, 3]);
  const dir = p.dir === 'ccw' ? -1 : 1;
  const pos = (i) => mod(start + dir * (p.kum ? (i * (i + 1)) / 2 : i), 4);
  const cell = (pp, t = typ) => { const c = ['empty', 'empty', 'empty', 'empty']; c[LAT_MEDURS[pp]] = t; return lat(c); };
  const celler = Array.from({ length: 9 }, (_, i) => cell(pos(i)));
  const { grid, facit } = sekvensGrid(celler);
  const fp = pos(8);
  const annan = typ === 'fill_black' ? 'fill_gray' : 'fill_black';
  const kand = [celler[7], cell(mod(fp + dir, 4)), celler[6], cell(mod(fp + 2, 4)), cell(fp, annan), lat(['empty', 'empty', 'empty', 'empty']), (() => { const c = [...facit.cells]; c[LAT_MEDURS[mod(fp + 1, 4)]] = typ; return lat(c); })()];
  const vag = p.dir === 'ccw' ? '(uppe till vänster, nere till vänster, nere till höger, uppe till höger)' : '(uppe till vänster, uppe till höger, nere till höger, nere till vänster)';
  const rule = p.kum
    ? `${LATNAMN[typ]} flyttar ${RIKT[p.dir]} runt de fyra rutorna ${vag}, och varje gång ett steg längre än förra gången: ett steg, två steg, tre steg och så vidare. ${LAS}`
    : `${LATNAMN[typ]} flyttar ett steg ${RIKT[p.dir]} runt de fyra rutorna ${vag} för varje ruta. ${LAS}`;
  return { family: 'vandring', title: p.kum ? `${LATNAMN[typ]} tar allt längre steg` : `${LATNAMN[typ]} vandrar ${RIKT[p.dir]}`, rule, grid, facit, kandidater: kand };
}

export function orbitalVandring(r, p) {
  const center = p.center ?? 'filled';
  const start = valj(r, [0, 1, 2, 3, 4, 5, 6, 7]);
  const dir = p.dir === 'ccw' ? -1 : 1;
  const pos = (i) => mod(start + dir * (p.kum ? (i * (i + 1)) / 2 : p.k * i), 8);
  const celler = Array.from({ length: 9 }, (_, i) => orb(pos(i), center));
  const { grid, facit } = sekvensGrid(celler);
  const fp = facit.satellite;
  const kand = [celler[7], orb(mod(fp + dir * (p.k ?? 1), 8), center), celler[6], orb(mod(fp + 4, 8), center), orb(mod(fp + 1, 8), center), orb(mod(fp - 1, 8), center), orb(fp, center === 'filled' ? 'open' : 'filled'), orb(null, center)];
  const mitt = center === 'filled' ? 'Mittpunkten är fylld hela vägen.' : 'Mittpunkten är ofylld hela vägen.';
  const rule = p.kum
    ? `Pricken flyttar ${RIKT[p.dir]} runt cirkeln, och varje gång ett steg längre än förra gången (45, 90, 135 grader och så vidare). ${LAS} ${mitt}`
    : `Pricken flyttar ${p.k * 45} grader ${RIKT[p.dir]} runt cirkeln för varje ruta. ${LAS} ${mitt}`;
  return { family: 'vandring', title: p.kum ? 'Pricken tar allt längre steg' : `Pricken vandrar ${p.k * 45} grader`, rule, grid, facit, kandidater: kand };
}

// ---------------------------------------------------------------- rotation med byte
export function pilMedByte(r, p) {
  const k = p.k; const s = p.dir === 'ccw' ? -k : k;
  const start = valj(r, [0, 1, 2, 3, 4, 5, 6, 7]);
  const byt = p.byt; // 'spets' | 'langd'
  const varden = byt === 'spets' ? ['filled', 'open'] : ['long', 'short'];
  const fas = valj(r, [0, 1]);
  const mk = (ang, v) => (byt === 'spets' ? vec(ang, p.langd ?? 'long', v) : vec(ang, v, p.spets ?? 'filled'));
  const vAt = (i) => varden[(i + fas) % 2];
  const ang = (i) => (start + (p.kum ? (i * (i + 1)) / 2 * (p.dir === 'ccw' ? -1 : 1) : s * i)) * 45;
  const celler = Array.from({ length: 9 }, (_, i) => mk(ang(i), vAt(i)));
  const { grid, facit } = sekvensGrid(celler);
  const a = facit.angle; const v = vAt(8); const v2 = vAt(7);
  const kand = [mk(a, v2), mk(celler[7].angle, v), mk(a + s * 45, v), mk(a + 180, v), celler[7], mk(a + 45, v), mk(a - 45, v), byt === 'spets' ? vec(a, (p.langd ?? 'long') === 'long' ? 'short' : 'long', v) : vec(a, v, (p.spets ?? 'filled') === 'filled' ? 'open' : 'filled')];
  const bytText = byt === 'spets' ? 'Spetsen växlar mellan fylld och öppen för varje ruta.' : 'Längden växlar mellan lång och kort för varje ruta.';
  const rule = p.kum
    ? `Pilen vrider sig ${RIKT[p.dir]}, och för varje ruta 45 grader längre än förra gången. ${bytText} ${LAS}`
    : `Pilen vrider sig ${k * 45} grader ${RIKT[p.dir]} för varje ruta. ${bytText} ${LAS}`;
  return { family: 'rotation-med-byte', title: byt === 'spets' ? 'Pilen vrider sig och byter spets' : 'Pilen vrider sig och byter längd', rule, grid, facit, kandidater: kand };
}

export function orbitalMedByte(r, p) {
  const start = valj(r, [0, 1, 2, 3, 4, 5, 6, 7]);
  const dir = p.dir === 'ccw' ? -1 : 1;
  const fas = valj(r, [0, 1]);
  const cAt = (i) => ['filled', 'open'][(i + fas) % 2];
  const pos = (i) => mod(start + dir * p.k * i, 8);
  const celler = Array.from({ length: 9 }, (_, i) => orb(pos(i), cAt(i)));
  const { grid, facit } = sekvensGrid(celler);
  const fp = facit.satellite; const c = cAt(8); const c2 = cAt(7);
  const kand = [orb(fp, c2), orb(pos(7), c), orb(mod(fp + dir * p.k, 8), c), orb(mod(fp + 4, 8), c), celler[7], orb(mod(fp + 1, 8), c), orb(mod(fp - 1, 8), c), orb(null, c)];
  const rule = `Pricken flyttar ${p.k * 45} grader ${RIKT[p.dir]} runt cirkeln för varje ruta. Mittpunkten växlar mellan fylld och ofylld för varje ruta. ${LAS}`;
  return { family: 'rotation-med-byte', title: 'Pricken vandrar och mitten byter fyllning', rule, grid, facit, kandidater: kand };
}

// ---------------------------------------------------------------- två rörelser
export function latticeTvaVandrare(r, p) {
  const [ta, tb] = p.typer ?? ['fill_black', 'dot'];
  const a0 = valj(r, [0, 1, 2, 3]);
  const off = valj(r, [1, 3]); // udda avstånd: de möts aldrig när de går åt olika håll
  const da = p.dirA === 'ccw' ? -1 : 1; const db = -da;
  const pa = (i) => mod(a0 + da * i, 4); const pb = (i) => mod(a0 + off + db * i, 4);
  const cell = (x, y) => { const c = ['empty', 'empty', 'empty', 'empty']; c[LAT_MEDURS[x]] = ta; c[LAT_MEDURS[y]] = tb; return lat(c); };
  const celler = Array.from({ length: 9 }, (_, i) => cell(pa(i), pb(i)));
  const { grid, facit } = sekvensGrid(celler);
  const andra = { fill_black: 'fill_gray', fill_gray: 'fill_black', dot: 'cross' };
  const typbyt = (t0) => lat(facit.cells.map((q) => (q === t0 ? andra[t0] : q)));
  const kand = [cell(pa(7), pb(8)), cell(pa(8), pb(7)), cell(mod(pa(8) + da, 4), pb(8)), cell(pa(8), mod(pb(8) + db, 4)), celler[7], cell(pb(8), pa(8)), cell(mod(pa(8) - da, 4), mod(pb(8) - db, 4)), cell(mod(pa(8) + 2, 4), pb(8)), cell(pa(8), mod(pb(8) + 2, 4)), typbyt(ta), typbyt(tb)].filter((c) => c.cells.filter((q) => q !== 'empty').length === 2);
  const namn = { fill_black: 'den svarta rutan', fill_gray: 'den grå rutan', dot: 'pricken' };
  const rule = `${namn[ta].charAt(0).toUpperCase() + namn[ta].slice(1)} flyttar ett steg ${RIKT[p.dirA]} och ${namn[tb]} ett steg ${RIKT[p.dirA === 'cw' ? 'ccw' : 'cw']} runt de fyra rutorna för varje ruta. ${LAS}`;
  return { family: 'tva-rorelser', title: 'Två markeringar vandrar åt olika håll', rule, grid, facit, kandidater: kand };
}

// Balanslinjen: position i raden följer en latinsk ordning (flyttar ett steg
// åt höger eller vänster per ruta, varje rad börjar ett steg förskjutet), sidan
// växlar i läsordning eller står still. Inga två former i samma fack.
const SIDA2 = ['above', 'below'];
export function balansRegel(r, p) {
  const regler = p.regel; // { square: {d, sida: 'vaxlar'|'fast'}, circle: {...} }
  const oS = { square: valj(r, [1, 2]), circle: valj(r, [1, 2]) };
  const st = { square: valj(r, [0, 1, 2]), circle: valj(r, [0, 1, 2]) };
  const sid0 = { square: valj(r, [0, 1]), circle: valj(r, [0, 1]) };
  const item = (shape, rr, cc) => {
    const rg = regler[shape]; if (!rg) return null;
    const posX = mod(st[shape] + oS[shape] * rr + rg.d * cc, 3);
    const i = rr * 3 + cc;
    const side = SIDA2[mod(sid0[shape] + (rg.sida === 'vaxlar' ? i : 0), 2)];
    return { posX, side, shape };
  };
  const { grid, facit } = rutnat((rr, cc) => bal(['square', 'circle'].map((s) => item(s, rr, cc)).filter(Boolean)));
  const it = (shape) => facit.items.find((x) => x.shape === shape);
  const med = (shape, f) => bal(facit.items.map((x) => (x.shape === shape ? f({ ...x }) : { ...x })));
  const vanster = grid[2][1];
  const kand = [];
  for (const shape of ['square', 'circle']) {
    if (!it(shape)) continue;
    const vi = vanster.items.find((x) => x.shape === shape);
    kand.push(med(shape, (x) => ({ ...x, posX: vi.posX })));
    kand.push(med(shape, (x) => ({ ...x, posX: mod(2 * x.posX - vi.posX, 3) })));
    kand.push(med(shape, (x) => ({ ...x, side: x.side === 'above' ? 'below' : 'above' })));
  }
  kand.push(bal(facit.items.map((x) => ({ ...x, side: x.side === 'above' ? 'below' : 'above' }))));
  kand.push(vanster);
  for (const x of facit.items) {
    const vi = vanster.items.find((y) => y.shape === x.shape);
    kand.push(med(x.shape, (y) => ({ ...y, posX: vi.posX, side: y.side === 'above' ? 'below' : 'above' })));
  }
  if (facit.items.length === 1) {
    const fri = [0, 1, 2].flatMap((px) => SIDA2.map((sd) => ({ posX: px, side: sd }))).filter((pl) => !(pl.posX === facit.items[0].posX && pl.side === facit.items[0].side));
    kand.push(bal([...facit.items, { ...valj(r, fri), shape: facit.items[0].shape === 'square' ? 'circle' : 'square' }]));
  }
  const beskriv = (shape) => {
    const rg = regler[shape]; if (!rg) return '';
    const N = shape === 'square' ? 'Kvadraten' : 'Cirkeln';
    const rorelse = rg.d === 1 ? 'flyttar ett steg åt höger' : 'flyttar ett steg åt vänster';
    const sida = rg.sida === 'vaxlar' ? 'och byter sida om linjen för varje ruta' : 'och stannar på samma sida om linjen';
    return `${N} ${rorelse} ${sida}.`;
  };
  const rule = `${beskriv('square')} ${beskriv('circle')} Kommer en form till kanten fortsätter den från andra sidan. Varje rad börjar förskjuten mot raden ovanför.${Object.values(regler).some((x) => x.sida === 'vaxlar') ? ' Sidbytet följer läsordningen, uppifrån och ner.' : ''}`.replace(/\s+/g, ' ').trim();
  return { family: 'tva-rorelser', title: 'Former kring linjen', rule, grid, facit, kandidater: kand };
}

// ---------------------------------------------------------------- latinska kvadrater
// Bank_version 3 (plan-facit-genvag 2.4): p.diag väljer kvadrat med
// konstant huvuddiagonal (facit lika ruta 0 och 4) eller olika (facit lika
// ruta 1 och 3), så att bankkvoten per facitruta (S1b) håller.
const diagKonstant = (L) => L[0][0] === L[1][1] && L[1][1] === L[2][2];
function latinGrid(r, varden, mk, diag = null) {
  const L = valj(r, diag ? LATIN.filter((x) => diagKonstant(x) === (diag === 'konstant')) : LATIN);
  const perm = blanda(r, [0, 1, 2]);
  return rutnat((rr, cc) => mk(varden[perm[L[rr][cc]]]));
}

export function latinAntal(r, p) {
  const format = p.format;
  let varden; let mk; let utanfor; let konstantByt = null; let rule; let title;
  if (format === 'tally') {
    varden = p.antal ?? [1, 2, 3];
    const o = p.riktning ?? 'vertical';
    mk = (n) => tally(n, o);
    utanfor = [tally(varden[2] + 1 <= 4 ? varden[2] + 1 : varden[0] - 1, o)];
    konstantByt = (c) => tally(c.count, o === 'vertical' ? 'horizontal' : 'vertical');
    rule = `Strecken ${o === 'vertical' ? 'står alltid upprätt' : 'ligger alltid ner'}. Varje rad och varje kolumn har exakt en figur med ${ORD[varden[0]]}, en med ${ORD[varden[1]]} och en med ${ORD[varden[2]]} streck.`;
    title = 'Antal streck i rader och kolumner';
  } else if (format === 'ray') {
    varden = p.antal ?? [2, 3, 4];
    const lay = { 1: [0], 2: [0, 4], 3: [0, 2, 4], 4: [0, 2, 4, 6], 5: [0, 1, 2, 4, 6] };
    const alt = { 2: [0, 2], 3: [0, 1, 2], 4: [0, 1, 2, 3] };
    mk = (n) => rays(lay[n]);
    utanfor = [rays(lay[varden[2] + 1] ?? lay[1]), rays(lay[varden[0] - 1] ?? lay[5])];
    konstantByt = (c) => rays(c.rays.map((x) => x + 1));
    rule = `Strecken går ut från mitten och sitter alltid på samma platser. Varje rad och varje kolumn har exakt en figur med ${ORD[varden[0]]}, en med ${ORD[varden[1]]} och en med ${ORD[varden[2]]} streck.`;
    title = 'Antal streck från mitten';
  } else if (format === 'ring') {
    varden = [1, 2, 3];
    const inner = p.inre ?? 'black';
    mk = (n) => ring([...Array(n - 1).fill('none'), inner]);
    utanfor = [];
    konstantByt = (c) => ring([...c.rings.slice(0, -1), inner === 'black' ? 'gray' : 'black']);
    rule = `Den innersta ringen är alltid ${inner === 'black' ? 'svart' : 'grå'}, de andra är ofyllda. Varje rad och varje kolumn har exakt en figur med en ring, en med två och en med tre.`;
    title = 'Antal ringar i rader och kolumner';
  } else if (format === 'sektor') {
    varden = p.antal ?? [1, 2, 3];
    mk = (n) => hjul(Array.from({ length: n }, (_, i) => i));
    utanfor = [hjul(Array.from({ length: varden[2] + 1 }, (_, i) => i))];
    konstantByt = (c) => hjul(c.filled.map((x) => x + 2));
    rule = `De svarta sektorerna börjar alltid överst och fyller medurs. Varje rad och varje kolumn har exakt ett hjul med ${ORD[varden[0]]}, ett med ${ORD[varden[1]]} och ett med ${ORD[varden[2]]} svarta sektorer.`;
    title = 'Antal sektorer i rader och kolumner';
  }
  const { grid, facit } = latinGrid(r, varden, mk, p.diag);
  const ovr = varden.map(mk).filter((c) => key(c) !== key(facit));
  const kand = [...ovr, ...utanfor, konstantByt(facit), ...ovr.map(konstantByt)];
  // Version 3: ändringen i den konstanta egenskapen också på utanför-värdena,
  // så att urvalet kan balansera värdena (S6).
  if (p.diag) kand.push(...utanfor.map(konstantByt));
  return { family: 'latin-antal', title, rule, grid, facit, kandidater: kand };
}

export function latinForm(r, p) {
  const format = p.format;
  let varden; let mk; let extra; let rule; let title;
  if (format === 'poly-sidor') {
    const f = p.fyll ?? 'black';
    varden = [5, 6, 8]; mk = (s) => poly(s, f);
    extra = (c) => [poly(c.sides, f === 'black' ? 'gray' : 'black'), poly(c.sides, 'none')].filter((x) => x.fill !== f);
    rule = `Alla figurer är ${f === 'black' ? 'svarta' : f === 'gray' ? 'grå' : 'ofyllda'}. Varje rad och varje kolumn har exakt en femhörning, en sexhörning och en åttahörning.`;
    title = 'Antal hörn i rader och kolumner';
  } else if (format === 'poly-fyll') {
    const s = p.sidor ?? 6;
    varden = ['none', 'gray', 'black']; mk = (f) => poly(s, f);
    extra = (c) => [poly(s === 5 ? 6 : 5, c.fill), poly(8, c.fill)].filter((x) => x.sides !== s);
    rule = `Alla figurer är ${s === 5 ? 'femhörningar' : s === 6 ? 'sexhörningar' : 'åttahörningar'}. Varje rad och varje kolumn har exakt en ofylld, en grå och en svart.`;
    title = 'Fyllning i rader och kolumner';
  } else if (format === 'stack-bas') {
    const sym = p.symbol ?? 'dot';
    const baser = p.baser ?? ['circle', 'square', 'triangle'];
    varden = baser; mk = (b) => stack(b, sym);
    const fjarde = ['circle', 'square', 'triangle', 'diamond'].find((b) => !baser.includes(b));
    extra = (c) => [stack(fjarde, sym), stack(c.base, sym === 'dot' ? 'plus' : 'dot'), stack(c.base, sym, 'black')];
    const NB = { circle: 'cirkel', square: 'kvadrat', triangle: 'triangel', diamond: 'romb' };
    const SY = { dot: 'en prick', plus: 'ett plus', minus: 'ett minus' };
    rule = `Alla figurer är ofyllda och har ${SY[sym]}. Varje rad och varje kolumn har exakt en ${NB[baser[0]]}, en ${NB[baser[1]]} och en ${NB[baser[2]]}.`;
    title = 'Grundformen i rader och kolumner';
  } else if (format === 'stack-symbol') {
    const b = p.bas ?? 'circle';
    varden = p.symboler ?? ['plus', 'minus', 'dot']; mk = (s) => stack(b, s);
    const fjarde = ['plus', 'minus', 'dot', 'cross'].find((s) => !varden.includes(s));
    extra = (c) => [stack(b, fjarde), stack(b === 'circle' ? 'square' : 'circle', c.symbol), stack(b, c.symbol, 'black')];
    const NB = { circle: 'en cirkel', square: 'en kvadrat', diamond: 'en romb' };
    const SY = { plus: 'plus', minus: 'minus', dot: 'prick', cross: 'kryss' };
    rule = `Alla figurer har ${NB[b]} som grundform. Varje rad och varje kolumn har exakt en med ${SY[varden[0]]}, en med ${SY[varden[1]]} och en med ${SY[varden[2]]}.`;
    title = 'Symbolen i rader och kolumner';
  } else if (format === 'ring-inre') {
    const n = p.ringar ?? 3;
    varden = ['none', 'gray', 'black']; mk = (f) => ring([...Array(n - 1).fill('none'), f]);
    extra = (c) => [ring([...Array(n - 2).fill('none'), c.rings[n - 1], c.rings[n - 1]]), ring([...Array(n).fill('none').slice(0, n - 2), c.rings[n - 1]])];
    rule = `Alla figurer har ${ORD[n]} ringar där de yttre är ofyllda. Varje rad och varje kolumn har exakt en ofylld, en grå och en svart innerring.`;
    title = 'Innerringen i rader och kolumner';
  } else if (format === 'orbital-lage') {
    const lagen = p.lagen ?? [0, 3, 5];
    const center = p.center ?? 'filled';
    varden = lagen; mk = (s) => orb(s, center);
    extra = (c) => [orb(c.satellite, center === 'filled' ? 'open' : 'filled'), orb(mod(lagen[0] + 2, 8), center), orb(null, center)];
    const L8 = ['uppe', 'uppe till höger', 'till höger', 'nere till höger', 'nere', 'nere till vänster', 'till vänster', 'uppe till vänster'];
    rule = `Mittpunkten är ${center === 'filled' ? 'fylld' : 'ofylld'} i alla. Pricken sitter på ett av tre ställen: ${L8[lagen[0]]}, ${L8[lagen[1]]} eller ${L8[lagen[2]]}. Varje rad och varje kolumn har varje läge exakt en gång.`;
    title = 'Prickens läge i rader och kolumner';
  } else if (format === 'lattice-lage') {
    const lagen = p.lagen ?? [0, 1, 3];
    const typ = p.typ ?? 'fill_black';
    mk = (pp) => { const c = ['empty', 'empty', 'empty', 'empty']; c[pp] = typ; return lat(c); };
    varden = lagen;
    const fjarde = [0, 1, 2, 3].find((x) => !lagen.includes(x));
    extra = (c) => [mk(fjarde), lat(c.cells.map((q) => (q === typ ? (typ === 'fill_black' ? 'fill_gray' : 'fill_black') : q))), lat(c.cells.map((q) => (q === typ ? 'dot' : q)))];
    const NL = ['uppe till vänster', 'uppe till höger', 'nere till vänster', 'nere till höger'];
    rule = `En av de fyra rutorna är ${typ === 'fill_black' ? 'svart' : 'grå'}. Den sitter ${NL[lagen[0]]}, ${NL[lagen[1]]} eller ${NL[lagen[2]]}, och varje rad och varje kolumn har varje läge exakt en gång.`;
    title = 'Rutans läge i rader och kolumner';
  }
  const { grid, facit } = latinGrid(r, varden, mk, p.diag);
  const ovr = varden.map(mk).filter((c) => key(c) !== key(facit));
  const kand = [...ovr, ...extra(facit), ...ovr.flatMap((c) => extra(c).slice(0, 1))];
  // Version 3: alla ändringar på alla värden, så att urvalet kan balansera (S6).
  if (p.diag) kand.push(...ovr.flatMap((c) => extra(c)));
  return { family: 'latin-form', title, rule, grid, facit, kandidater: kand };
}

// Två eller tre egenskaper, var och en en egen latinsk kvadrat.
export function latinFlera(r, p) {
  const format = p.format;
  const ett = valj(r, LATIN);
  let tva; do { tva = valj(r, LATIN); } while (key(tva) === key(ett));
  let tre = null; if (p.tre) { do { tre = valj(r, LATIN); } while (key(tre) === key(ett) || key(tre) === key(tva)); }
  // Egenskaperna får inte följa varandra (då är det bara en ordning)
  const par = new Set(); for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) par.add(`${ett[a][b]}-${tva[a][b]}`);
  if (par.size < 5) return null;
  const P1 = blanda(r, [0, 1, 2]); const P2 = blanda(r, [0, 1, 2]); const P3 = blanda(r, [0, 1, 2]);
  let mk; let rule; let title; let V1; let V2; let V3;
  if (format === 'poly') {
    V1 = [5, 6, 8]; V2 = ['none', 'gray', 'black'];
    mk = (a, b) => poly(a, b);
    rule = 'Varje rad och varje kolumn har exakt en femhörning, en sexhörning och en åttahörning. Varje rad och varje kolumn har också exakt en ofylld, en grå och en svart figur. Formen och fyllningen följer var sin ordning.';
    title = 'Form och fyllning i rader och kolumner';
  } else if (format === 'stack') {
    V1 = ['circle', 'square', 'triangle']; V2 = p.symboler ?? ['plus', 'minus', 'dot'];
    if (p.tre) { V3 = ['none', 'gray', 'black']; mk = (a, b, c) => stack(a, b, c); }
    else mk = (a, b) => stack(a, b);
    const SY = { plus: 'plus', minus: 'minus', dot: 'prick', ring: 'ring' };
    rule = `Varje rad och varje kolumn har exakt en cirkel, en kvadrat och en triangel, och exakt en med ${SY[V2[0]]}, en med ${SY[V2[1]]} och en med ${SY[V2[2]]}.${p.tre ? ' Varje rad och varje kolumn har också exakt en ofylld, en grå och en svart grundform.' : ' Formerna är ofyllda.'} Egenskaperna följer var sin ordning.`;
    title = p.tre ? 'Form, symbol och fyllning' : 'Form och symbol i rader och kolumner';
  } else if (format === 'stack-fyll') {
    V1 = ['circle', 'square', 'diamond']; V2 = ['none', 'gray', 'black'];
    mk = (a, b) => stack(a, 'none', b);
    rule = 'Varje rad och varje kolumn har exakt en cirkel, en kvadrat och en romb. Varje rad och varje kolumn har också exakt en ofylld, en grå och en svart. Formen och fyllningen följer var sin ordning.';
    title = 'Form och fyllning i rader och kolumner';
  } else if (format === 'ring') {
    V1 = [1, 2, 3]; V2 = ['none', 'gray', 'black'];
    mk = (a, b) => ring([...Array(a - 1).fill('none'), b]);
    rule = 'Varje rad och varje kolumn har exakt en figur med en ring, en med två och en med tre. Varje rad och varje kolumn har också exakt en ofylld, en grå och en svart innerring. Antalet och fyllningen följer var sin ordning. De yttre ringarna är alltid ofyllda.';
    title = 'Antal ringar och innerring';
  }
  const v = (rr, cc) => [V1[P1[ett[rr][cc]]], V2[P2[tva[rr][cc]]], ...(tre ? [V3[P3[tre[rr][cc]]]] : [])];
  const { grid, facit } = rutnat((rr, cc) => mk(...v(rr, cc)));
  const [f1, f2, f3] = v(2, 2);
  const kand = [];
  for (const a of V1) if (a !== f1) kand.push(mk(a, f2, f3));
  for (const b of V2) if (b !== f2) kand.push(mk(f1, b, f3));
  if (tre) for (const c of V3) if (c !== f3) kand.push(mk(f1, f2, c));
  for (const a of V1) for (const b of V2) if (a !== f1 && b !== f2) kand.push(mk(a, b, f3));
  return { family: 'latin-flera', title, rule, grid, facit, kandidater: blanda(r, kand.slice(0, 2 + (tre ? 2 : 0))).concat(kand) };
}

// ---------------------------------------------------------------- överlagring
const OPTEXT = {
  union: (t, a, b) => `${t} visar allt som finns i ${a} och ${b} tillsammans.`,
  xor: (t, a, b) => `${t} visar det som finns i bara en av ${a} och ${b}. Det som finns i båda försvinner.`,
  snitt: (t, a, b) => `${t} visar bara det som finns i både ${a} och ${b}.`,
  'diff-ab': (t, a, b) => `${t} visar det som finns i ${a} men inte i ${b}.`,
};
const OPF = {
  union: (a, b) => new Set([...a, ...b]),
  xor: (a, b) => new Set([...a, ...b].filter((x) => a.has(x) !== b.has(x))),
  snitt: (a, b) => new Set([...a].filter((x) => b.has(x))),
  'diff-ab': (a, b) => new Set([...a].filter((x) => !b.has(x))),
};
export function overlagring(r, p) {
  const { format, op, axel } = p;
  let N; let mk; let elementNamn;
  if (format === 'tile') { N = 9; mk = (s) => tl([...s].reduce((m, x) => m | (1 << x), 0)); }
  else if (format === 'lattice') { N = 4; mk = (s) => lat([0, 1, 2, 3].map((i) => (s.has(i) ? 'fill_black' : 'empty'))); }
  else if (format === 'ray') { N = 8; mk = (s) => rays([...s]); }
  else if (format === 'sektor') { N = 8; mk = (s) => hjul([...s]); }
  else if (format === 'ring') { N = 3; mk = (s) => ring([0, 1, 2].map((i) => (s.has(i) ? 'black' : 'none'))); }
  const minA = format === 'lattice' ? 1 : format === 'ring' ? 1 : 2;
  const maxA = format === 'tile' ? 4 : format === 'lattice' ? 2 : format === 'ring' ? 2 : 3;
  const slump = () => { const n = minA + Math.floor(r() * (maxA - minA + 1)); return new Set(blanda(r, Array.from({ length: N }, (_, i) => i)).slice(0, n)); };
  const trip = [];
  for (let i = 0; i < 3; i++) {
    let a; let b; let c; let tries = 0;
    do { a = slump(); b = slump(); c = OPF[op](a, b); tries++; } while ((c.size === 0 || c.size === N) && tries < 50);
    trip.push([a, b, c]);
  }
  const g = axel === 'kolumn' ? trip.map((t) => t.map(mk)) : [0, 1, 2].map((rr) => trip.map((t) => mk(t[rr])));
  const facit = g[2][2]; g[2][2] = null;
  const [A, B] = trip[2];
  const C = OPF[op](A, B);
  const kand = [];
  for (const o of Object.keys(OPF)) if (o !== op) kand.push(mk(OPF[o](A, B)));
  kand.push(mk(OPF['diff-ab'](B, A)), mk(A), mk(B));
  for (let x = 0; x < N; x++) { const s = new Set(C); if (s.has(x)) s.delete(x); else s.add(x); if (s.size) kand.push(mk(s)); }
  const [t, a, b] = axel === 'kolumn' ? ['Den tredje rutan i varje rad', 'den första', 'den andra'] : ['Den nedersta rutan i varje kolumn', 'den översta', 'den mittersta'];
  const rule = OPTEXT[op](t, a, b);
  const TIT = { union: 'Allt tillsammans', xor: 'Bara det som skiljer', snitt: 'Bara det gemensamma', 'diff-ab': 'Det som blir kvar' };
  return { family: 'overlagring', title: TIT[op], rule, grid: g, facit, kandidater: kand };
}

// ---------------------------------------------------------------- spegling
const SPEGLAR = {
  tile: { H: T.spegelH, V: T.spegelV, D: T.diag, A: T.antidiag },
  lattice: { H: LAT.spegelH, V: LAT.spegelV },
  sektor: { H: sektor.spegelLodrat, V: sektor.spegelVagrat },
};
const SPEGELTEXT = {
  H: 'speglad i en lodrät linje (vänster och höger byter plats)',
  V: 'speglad i en vågrät linje (upp och ner byter plats)',
  D: 'speglad i diagonalen från övre vänstra hörnet',
  A: 'speglad i diagonalen från övre högra hörnet',
};
export function spegling(r, p) {
  const { format, m1, m2, axel } = p;
  const S = SPEGLAR[format];
  let slump; let mk; let val;
  if (format === 'tile') { slump = () => valj(r, TILEMONSTER); mk = tl; val = (c) => c.pattern; }
  else if (format === 'lattice') {
    const andraTyp = p.andra ?? valj(r, ['fill_gray', 'dot']);
    slump = () => { const c = ['empty', 'empty', 'empty', 'empty']; const pl = blanda(r, [0, 1, 2, 3]); c[pl[0]] = 'fill_black'; c[pl[1]] = andraTyp; return c; };
    mk = lat; val = (c) => c.cells;
  } else { slump = () => valj(r, SEKTORMONSTER); mk = hjul; val = (c) => c.filled; }
  const rader = [];
  const anvanda = new Set();
  for (let i = 0; i < 3; i++) {
    let a; let tries = 0;
    do { a = slump(); tries++; } while ((anvanda.has(key(a)) || key(S[m1](a)) === key(a) || key(S[m2](S[m1](a))) === key(S[m1](a)) || key(S[m2](S[m1](a))) === key(a)) && tries < 100);
    anvanda.add(key(a));
    rader.push([a, S[m1](a), S[m2](S[m1](a))]);
  }
  const g = axel === 'kolumn' ? rader.map((rr) => rr.map(mk)) : [0, 1, 2].map((i) => rader.map((rr) => mk(rr[i])));
  const facit = g[2][2]; g[2][2] = null;
  const [A, B, C] = rader[2];
  const kand = [mk(B), mk(A), ...Object.keys(S).filter((m) => m !== m2).map((m) => mk(S[m](B)))];
  if (format === 'tile') kand.push(mk(T.rot(C, 1)), mk(T.rot(B, 1)), ...bitflips(C).filter((x) => Math.abs(T.antal(x) - T.antal(C)) === 1).slice(0, 3).map(mk));
  if (format === 'sektor') kand.push(mk(sektor.rot(C, 1)), mk(sektor.rot(C, 2)), mk(C.slice(1)));
  if (format === 'lattice') {
    const andra = C.find((q) => q !== 'empty' && q !== 'fill_black');
    const byt = andra === 'dot' ? 'fill_gray' : 'dot';
    const tom = C.findIndex((q) => q === 'empty');
    kand.push(mk(LAT.rot(C, 1)), mk(LAT.rot(C, 2)), mk(C.map((q) => (q === andra ? byt : q))), mk(C.map((q, i) => (i === tom ? 'fill_black' : q))), mk(C.map((q) => (q === 'fill_black' ? 'empty' : q))));
  }
  const [forsta, andra, tredje] = axel === 'kolumn' ? ['Den andra rutan i varje rad', 'Den tredje', 'den första'] : ['Den mittersta rutan i varje kolumn', 'Den nedersta', 'den översta'];
  const rule = `${forsta} är ${tredje} ${SPEGELTEXT[m1]}. ${andra} är den ${axel === 'kolumn' ? 'andra' : 'mittersta'} ${SPEGELTEXT[m2]}.`;
  return { family: 'spegling', title: 'Två speglingar i rad', rule, grid: g, facit, kandidater: kand };
}

// ---------------------------------------------------------------- antal som ändras
export function antalSekvens(r, p) {
  const { format } = p;
  const upp = p.riktning !== 'ner';
  const start = valj(r, [0, 1, 2, 3]);
  const n = (i) => (upp ? mod(start + i, 4) + 1 : 4 - mod(start + i, 4));
  let mk; let rule; let title;
  const vaxlar = p.vaxlar; // tally: riktningen växlar
  if (format === 'tally') {
    const fas = valj(r, [0, 1]);
    const o = (i) => (vaxlar ? ['vertical', 'horizontal'][(i + fas) % 2] : (p.o ?? 'vertical'));
    mk = (i, nn = n(i), oo = o(i)) => tally(nn, oo);
    rule = `Antalet streck ${upp ? 'ökar' : 'minskar'} med ett för varje ruta (${upp ? 'ett, två, tre, fyra' : 'fyra, tre, två, ett'}) och börjar sedan om. ${vaxlar ? 'Strecken växlar mellan stående och liggande för varje ruta. ' : ''}${LAS}`;
    title = upp ? 'Strecken blir fler' : 'Strecken blir färre';
  } else if (format === 'ray') {
    const s0 = valj(r, [0, 2, 4, 6]);
    mk = (i, nn = n(i)) => rays(Array.from({ length: nn }, (_, j) => s0 + 2 * j));
    rule = `Ett streck ${upp ? 'läggs till' : 'tas bort'} för varje ruta, medurs runt mitten, tills ${upp ? 'det finns fyra' : 'ett är kvar'}. Sedan börjar det om. ${LAS}`;
    title = upp ? 'Strecken blir fler' : 'Strecken blir färre';
  } else if (format === 'sektor') {
    const s0 = valj(r, [0, 2, 4, 6]);
    mk = (i, nn = n(i)) => hjul(Array.from({ length: nn }, (_, j) => s0 + j));
    rule = `De svarta sektorerna ${upp ? 'blir en fler' : 'blir en färre'} för varje ruta, medurs från samma startpunkt, och börjar om efter ${upp ? 'fyra' : 'en'}. ${LAS}`;
    title = upp ? 'Sektorerna fylls på' : 'Sektorerna töms';
  }
  const celler = Array.from({ length: 9 }, (_, i) => mk(i));
  const { grid, facit } = sekvensGrid(celler);
  const f = n(8);
  const kand = [celler[7], ...(f < 4 ? [mk(8, f + 1)] : []), ...(f > 1 ? [mk(8, f - 1)] : []), celler[6]];
  if (format === 'tally') { const flip = (o) => (o === 'vertical' ? 'horizontal' : 'vertical'); kand.push(tally(f, flip(facit.orientation)), tally(celler[7].count, flip(celler[7].orientation === facit.orientation ? facit.orientation : celler[7].orientation)), tally(celler[7].count, facit.orientation), ...(f > 2 ? [tally(f - 2, facit.orientation)] : [])); }
  if (format === 'ray') { const fr = facit.rays; kand.push(rays(fr.map((x) => x + 1)), rays([...fr, fr[fr.length - 1] + 1]), rays(fr.slice(1)), rays(fr.slice(0, -1))); }
  if (format === 'sektor') { const ff = facit.filled; kand.push(hjul(ff.map((x) => x + 1)), hjul(ff.map((x) => x - 1)), hjul([...ff, ff[ff.length - 1] + 4]), hjul(ff.slice(1))); }
  return { family: 'antal-andras', title, rule, grid, facit, kandidater: kand };
}

export function antalSumma(r, p) {
  // p.radRiktning (bank_version 3, avancerad): riktningen växlar i varje rad,
  // som ett schackmönster. (Samma riktning i hela raden är parallellt, V7
  // regel 1: alla kolumner får samma sekvens.)
  if (p.radRiktning) return antalSummaRadvis(r, p);
  const o = p.o ?? 'vertical';
  const PAR = [[1, 1], [1, 2], [2, 1], [1, 3], [3, 1], [2, 2]];
  let rader; do { rader = blanda(r, PAR).slice(0, 3); } while (rader[2][0] === rader[2][1]);
  const g = rader.map(([a, b]) => [tally(a, o), tally(b, o), tally(a + b, o)]);
  const facit = g[2][2]; g[2][2] = null;
  const [a, b] = rader[2];
  const kand = [tally(g[1][2].count, o), tally(a, o), tally(b, o), tally(Math.abs(a - b) || 1, o), tally(a + b - 1, o), ...(a + b < 4 ? [tally(a + b + 1, o)] : []), tally(a + b, o === 'vertical' ? 'horizontal' : 'vertical'), tally(a, o === 'vertical' ? 'horizontal' : 'vertical'), tally(a + b - 1, o === 'vertical' ? 'horizontal' : 'vertical')];
  const rule = `Strecken ${o === 'vertical' ? 'står alltid upprätt' : 'ligger alltid ner'}. I varje rad har den tredje rutan lika många streck som de två första tillsammans.`;
  return { family: 'antal-andras', title: 'Strecken läggs ihop', rule, grid: g, facit, kandidater: kand };
}

function antalSummaRadvis(r, p) {
  const PAR = [[1, 1], [1, 2], [2, 1], [1, 3], [3, 1], [2, 2]];
  let rader; do { rader = blanda(r, PAR).slice(0, 3); } while (rader[2][0] === rader[2][1]);
  const [o0, o1] = valj(r, [['vertical', 'horizontal'], ['horizontal', 'vertical']]);
  const oA = (rr, cc) => ((rr + cc) % 2 === 0 ? o0 : o1);
  const g = rader.map(([a, b], rr) => [tally(a, oA(rr, 0)), tally(b, oA(rr, 1)), tally(a + b, oA(rr, 2))]);
  const facit = g[2][2]; g[2][2] = null;
  const [a, b] = rader[2];
  const kand = [];
  for (const n of [a + b - 1, a + b + 1, a, b, Math.abs(a - b), g[1][2].count]) for (const o of [o0, o1]) if (n >= 1 && n <= 4) kand.push(tally(n, o));
  kand.push(tally(a + b, o1));
  const ord = (x) => (x === 'vertical' ? 'står upprätt' : 'ligger ner');
  const rule = `I varje rad har den tredje rutan lika många streck som de två första tillsammans. Strecken växlar mellan stående och liggande som ett schackmönster: de ${ord(o0)} i hörnen och i mitten.`;
  return { family: 'antal-andras', title: 'Strecken läggs ihop, raderna växlar', rule, grid: g, facit, kandidater: kand };
}

// =============================================================================
// Bandet "svår plus" (beställningen "svarare frågor", 1.2). Svårigheten
// kommer av regler som är kopplade över hela rutnätet (latinsk kvadrat,
// diagonal, schackmönster, överlagring med vridning), aldrig av fler
// sekvenser i läsordning. Distraktorerna kommer i ordningen "fel i en regel"
// först, så att urvalet i bygg() tar nära missar.
// =============================================================================

const BAS_NAMN = { circle: 'cirkel', square: 'kvadrat', triangle: 'triangel', diamond: 'romb' };
const SYM_NAMN = { plus: 'plus', minus: 'minus', dot: 'prick', cross: 'kryss', ring: 'ring' };
const DIAG = (rr, cc) => rr === cc;
const SCHACK = (rr, cc) => (rr + cc) % 2 === 0;

// Två latinska kvadrater med nio olika kombinationer (ortogonala).
function ortogonaltPar(r) {
  const A = valj(r, LATIN);
  const B = blanda(r, LATIN.filter((L) => new Set([0, 1, 2].flatMap((rr) => [0, 1, 2].map((cc) => `${A[rr][cc]}${L[rr][cc]}`))).size === 9))[0];
  return [A, B];
}
const diagOlika = (L) => new Set([L[0][0], L[1][1], L[2][2]]).size >= 2;

/** Kandidater med fel i en dimension först, sedan i två. Aldrig en kopia av en synlig ruta. */
function felKandidater(grid, facit, dims) {
  const synliga = new Set(grid.flat().filter(Boolean).map(key));
  const ett = []; const tva = [];
  dims.forEach((d, i) => {
    for (const v of d.varden) if (v !== facit[d.falt]) ett.push({ ...facit, [d.falt]: v });
    dims.slice(i + 1).forEach((e) => {
      for (const v of d.varden) for (const w of e.varden) if (v !== facit[d.falt] && w !== facit[e.falt]) tva.push({ ...facit, [d.falt]: v, [e.falt]: w });
    });
  });
  return { ett: ett.filter((c) => !synliga.has(key(c))), tva: tva.filter((c) => !synliga.has(key(c))), kopior: ett.filter((c) => synliga.has(key(c))) };
}

/**
 * Ordningen på kandidaterna: fel i en regel med värden ur rutnätet, sedan ett
 * värde utanför rutnätet för varje regel som annars inte bryts av någon nära
 * miss (när alla värden ur rutnätet ger kopior av synliga rutor), sedan fel i
 * två regler, sist övriga värden utanför. Ett värde som inte finns i
 * rutnätet är lättare att utesluta, så det används bara när det behövs.
 */
function ordna(facit, ett, utanfor, tva, falt) {
  const bruten = new Set(ett.flatMap((c) => falt.filter((f) => c[f] !== facit[f])));
  const forst = [];
  for (const f of falt) {
    if (bruten.has(f)) continue;
    const u = utanfor.find((c) => c[f] !== facit[f]);
    if (u) forst.push(u);
  }
  return [...ett, ...forst, ...tva, ...utanfor.filter((c) => !forst.includes(c))];
}

const ALLA_BASER = ['circle', 'square', 'triangle', 'diamond'];
/** Alla kombinationer av fältens värden utom facit och synliga rutor, med färst ändringar först. */
function produkt(grid, facit, falt, maxFel = 2) {
  const synliga = new Set(grid.flat().filter(Boolean).map(key));
  let ut = [{ ...facit }];
  for (const [f, varden] of Object.entries(falt)) ut = ut.flatMap((c) => varden.map((v) => ({ ...c, [f]: v })));
  const fel = (c) => Object.keys(falt).filter((f) => c[f] !== facit[f]).length;
  return ut.filter((c) => fel(c) > 0 && fel(c) <= maxFel && !synliga.has(key(c))).sort((a, b) => fel(a) - fel(b));
}
const ALLA_SYMBOLER = ['plus', 'minus', 'dot', 'cross', 'ring'];
const utanforVarden = (alla, anvanda) => alla.filter((x) => !anvanda.includes(x));

// P1' och P2.
//
// P2: grundform och symbol i var sin latinsk kvadrat (ortogonala, nio
// kombinationer), fyllningen i schackmönster.
//
// P1' (granskningen av parti 01, 2.1): grundform och fyllning (ofylld, grå,
// svart) i var sin latinsk kvadrat, ortogonala, och symbolen växlar mellan
// två i schackmönster. Samma styrka som P2 (3 + 3 + 2) med en annan visuell
// signatur. Den första P1 (grå diagonal) bar en genväg: schackmönstret är
// konstant på huvuddiagonalen, så de två synliga grå rutorna hade alltid
// facits symbol och fyllning, och kvar var bara formen.
//
// p.forskjutning ('vanster' eller 'hoger') väljer formens kvadrat: höger när
// rad 2 är rad 1 flyttad ett steg åt höger, vänster när den är flyttad åt
// vänster. Ordning 3 har bara de två mönstren upp till omdöpning.
//
// Distraktorer: fel i en regel med värden ur rutnätet, sedan fel i en regel
// med en form eller symbol som inte finns i rutnätet (de är aldrig kopior
// av en synlig ruta), sedan fel i två regler.
export const arHoger = (L) => [0, 1, 2].every((c) => L[1][c] === L[0][(c + 2) % 3]);
const FYLL3 = ['none', 'gray', 'black'];
export function latinTrippelStack(r, p) {
  const baser = p.baser;
  const p1 = p.fyll === 'latin';
  const symboler = p1 ? p.symboler.slice(0, 2) : p.symboler;
  let A; let B;
  if (p1) {
    A = valj(r, p.forskjutning ? LATIN.filter((L) => arHoger(L) === (p.forskjutning === 'hoger')) : LATIN);
    B = blanda(r, LATIN.filter((L) => new Set([0, 1, 2].flatMap((rr) => [0, 1, 2].map((cc) => `${A[rr][cc]}${L[rr][cc]}`))).size === 9))[0];
  } else [A, B] = ortogonaltPar(r);
  const PA = blanda(r, [0, 1, 2]); const PB = blanda(r, [0, 1, 2]);
  const s0 = valj(r, [0, 1]);
  const start = valj(r, ['none', 'gray']);
  const andra = start === 'none' ? 'gray' : 'none';
  const sym = (rr, cc) => (p1 ? symboler[SCHACK(rr, cc) ? s0 : 1 - s0] : symboler[PB[B[rr][cc]]]);
  const fyll = (rr, cc) => (p1 ? FYLL3[PB[B[rr][cc]]] : (SCHACK(rr, cc) ? start : andra));
  const { grid, facit } = rutnat((rr, cc) => stack(baser[PA[A[rr][cc]]], sym(rr, cc), fyll(rr, cc)));
  const { ett, tva, kopior } = felKandidater(grid, facit, [
    { falt: 'base', varden: baser },
    { falt: 'symbol', varden: symboler },
    { falt: 'baseFill', varden: p1 ? FYLL3 : ['none', 'gray'] },
  ]);
  // P1': ring på svart botten är för lik prick, så ringen används inte ens som distraktor
  const utanfor = [
    ...utanforVarden(ALLA_BASER, baser).map((v) => ({ ...facit, base: v })),
    ...utanforVarden(p1 ? ['plus', 'minus', 'dot', 'cross'] : ALLA_SYMBOLER, symboler).map((v) => ({ ...facit, symbol: v })),
  ];
  const b = baser.map((x) => `en ${BAS_NAMN[x]}`);
  let rule; let title;
  if (p1) {
    // Parti 02 (p.alla): utan ordet läsordning (plan-facit-genvag 2.4).
    rule = `Varje rad och varje kolumn har exakt ${b[0]}, ${b[1]} och ${b[2]}, och exakt en ofylld, en grå och en svart. Formen och fyllningen följer var sin ordning. Symbolen växlar mellan ${SYM_NAMN[symboler[0]]} och ${SYM_NAMN[symboler[1]]} som ett schackmönster${p.alla ? ', så att två rutor bredvid varandra aldrig har samma symbol' : ': varannan ruta i läsordning'}.`;
    title = 'Form, fyllning och schackmönster';
  } else {
    const s = symboler.map((x) => `en med ${SYM_NAMN[x]}`);
    rule = `Varje rad och varje kolumn har exakt ${b[0]}, ${b[1]} och ${b[2]}, och exakt ${s[0]}, ${s[1]} och ${s[2]}. Formen och symbolen följer var sin ordning. Fyllningen växlar mellan ofylld och grå som ett schackmönster${p.alla ? ', så att två rutor bredvid varandra aldrig har samma fyllning' : ': varannan ruta i läsordning'}.`;
    title = 'Form, symbol och schackmönster';
  }
  // Kopior av synliga rutor sist: bygg() tar högst en, och bara när en regel annars inte bryts.
  const kand = ordna(facit, ett, utanfor, tva, ['base', 'symbol', 'baseFill']);
  const bas = p1 ? [...kand, ...kopior] : kand;
  // Parti 02 (p.alla): alla kombinationer av värdena, också utanför
  // rutnätet, så att urvalet kan balansera varje egenskap (S5, S6).
  if (!p.alla) return { family: 'latin-flera', title, rule, grid, facit, kandidater: bas };
  const symAlla = p1 ? ['plus', 'minus', 'dot', 'cross'] : ALLA_SYMBOLER;
  const fyllAlla = p1 ? FYLL3 : ['none', 'gray'];
  return { family: 'latin-flera', title, rule, grid, facit, kandidater: [...bas, ...produkt(grid, facit, p.inne ? { base: baser, symbol: symboler, baseFill: fyllAlla } : { base: ALLA_BASER, symbol: symAlla, baseFill: fyllAlla }, p.inne ? 3 : 2).filter((c) => !(c.base === 'triangle' && c.symbol === 'cross'))] };
}

// P3: pilens riktning i latinsk kvadrat, längden i schackmönster, spetsen på diagonalen.
export function latinTrippelPil(r, p) {
  const vinklar = p.vinklar.map((x) => x * 45);
  // p.forskjutning (parti 02): höger- eller vänsterförskjutning av riktningens kvadrat.
  const A = valj(r, p.forskjutning ? LATIN.filter((L) => arHoger(L) === (p.forskjutning === 'hoger')) : LATIN);
  if (!diagOlika(A)) return null;
  const PA = blanda(r, [0, 1, 2]);
  const l0 = valj(r, ['long', 'short']);
  const l1 = l0 === 'long' ? 'short' : 'long';
  const diagSpets = p.spetsDiag; const ovrSpets = diagSpets === 'open' ? 'filled' : 'open';
  const { grid, facit } = rutnat((rr, cc) => vec(vinklar[PA[A[rr][cc]]], SCHACK(rr, cc) ? l0 : l1, DIAG(rr, cc) ? diagSpets : ovrSpets));
  const { ett, tva } = felKandidater(grid, facit, [
    { falt: 'angle', varden: vinklar },
    { falt: 'length', varden: ['long', 'short'] },
    { falt: 'head', varden: ['open', 'filled'] },
  ]);
  // Riktningar som inte finns i rutnätet: fel i en regel, men lättare att se.
  const utanfor = [0, 45, 90, 135, 180, 225, 270, 315].filter((v) => !vinklar.includes(v)).map((v) => ({ ...facit, angle: v }));
  const spets = diagSpets === 'open' ? 'Spetsen är öppen på diagonalen från övre vänstra hörnet till nedre högra, annars fylld.' : 'Spetsen är fylld på diagonalen från övre vänstra hörnet till nedre högra, annars öppen.';
  const rule = `Varje rad och varje kolumn har pilen i var och en av de tre riktningarna exakt en gång. Längden växlar mellan lång och kort som ett schackmönster. ${spets}`;
  const bas = ordna(facit, ett, utanfor, tva, ['angle', 'length', 'head']);
  if (!p.alla) return { family: 'latin-flera', title: 'Riktning, längd och spets', rule, grid, facit, kandidater: bas };
  return { family: 'latin-flera', title: 'Riktning, längd och spets', rule, grid, facit, kandidater: [...bas, ...produkt(grid, facit, { angle: p.inne ? vinklar : [0, 45, 90, 135, 180, 225, 270, 315], length: ['long', 'short'], head: ['open', 'filled'] }, p.inne ? 3 : 2)] };
}

// P4 (sektorhjul) och P5 (streck från mitten): överlagring och vridning.
const VRID = (k) => `${(k <= 4 ? k : 8 - k) * 45} grader ${k <= 4 ? 'medurs' : 'moturs'}`;
const PLUS_OPS = { ...OPF, 'diff-ba': (a, b) => new Set([...b].filter((x) => !a.has(x))) };
export function overlagringVriden(r, p) {
  const { format, op, axel, k } = p;
  const mk = format === 'ray' ? (s) => rays([...s]) : (s) => hjul([...s]);
  const monster = (format === 'ray' ? STRALMONSTER : SEKTORMONSTER).filter((m) => m.length >= 2 && m.length <= 3);
  const maxC = format === 'ray' ? 4 : 5;
  const lagen = (s) => new Set([0, 1, 2, 3, 4, 5, 6, 7].map((j) => key(sortNum([...s].map((x) => mod(x + j, 8)))))).size;
  const slump = () => { const m = valj(r, monster); const j = valj(r, [0, 1, 2, 3, 4, 5, 6, 7]); return new Set(m.map((x) => mod(x + j, 8))); };
  const vrid = (s, j) => new Set([...s].map((x) => mod(Number(x) + j, 8)));
  const lika = (s, t) => key(sortNum([...s])) === key(sortNum([...t]));
  const trip = [];
  for (let i = 0; i < 3; i++) {
    let a; let b; let c0; let ok = false; let tries = 0;
    do {
      a = slump(); b = slump(); c0 = OPF[op](a, b); tries++;
      ok = !lika(a, b) && c0.size >= 1 && c0.size <= maxC && !lika(c0, a) && !lika(c0, b) && lagen(c0) === 8;
    } while (!ok && tries < 100);
    if (!ok) return null;
    trip.push([a, b, vrid(c0, k)]);
  }
  // Facitlinjen (granskningen av parti 01, 2.4): a och b delar minst ett
  // element, annars är xor samma sak som unionen och a minus b samma sak som
  // a, och operationen testas inte i svaret. Facit har minst två element,
  // annars blir frågan "vilken sektor" och inte "vilken regel". Försöket
  // kastas i stället för att dras om, så att godkända frågor byggs likadant.
  if (![...trip[2][0]].some((x) => trip[2][1].has(x)) || trip[2][2].size < 2) return null;
  const g = axel === 'kolumn' ? trip.map((t) => t.map(mk)) : [0, 1, 2].map((rr) => trip.map((t) => mk(t[rr])));
  const facit = g[2][2]; g[2][2] = null;
  const [A, B] = trip[2];
  const C = OPF[op](A, B);
  const F = vrid(C, k);
  const tom = [0, 1, 2, 3, 4, 5, 6, 7].filter((x) => !F.has(x));
  const kand = [mk(C), mk(vrid(C, -k)), mk(vrid(C, k + 4))];
  for (const o of Object.keys(PLUS_OPS)) if (o !== op) kand.push(mk(vrid(PLUS_OPS[o](A, B), k)));
  kand.push(mk(vrid(A, k)), mk(vrid(B, k)));
  for (const x of tom) kand.push(mk(new Set([...F, x])));
  for (const x of F) kand.push(mk(new Set([...F].filter((y) => y !== x))));
  const [t, fa, fb] = axel === 'kolumn' ? ['Den tredje rutan i varje rad', 'den första', 'den andra'] : ['Den nedersta rutan i varje kolumn', 'den översta', 'den mittersta'];
  const vad = op === 'xor'
    ? `visar det som finns i bara en av ${fa} och ${fb} (det gemensamma försvinner)`
    : `visar det som finns i ${fa} men inte i ${fb}`;
  const rule = `${t} ${vad}, vridet ${VRID(k)}.`;
  const title = op === 'xor' ? 'Bara det som skiljer, vridet' : 'Det som blir kvar, vridet';
  return { family: 'overlagring', title, rule, grid: g, facit, kandidater: kand };
}

/**
 * Mjuk dubblettnyckel för bandet "svår plus": mekanismen och varje
 * dimensions mönster över rutnätet (facit isatt), med värdena ersatta av
 * ordningstal efter första förekomst, plus mängden värden dimensionen tar.
 * Två frågor med samma nyckel är samma fråga med värdena omkastade.
 *
 * Mängden värden är med för att latinska kvadrater av ordning 3 bara har
 * två mönster upp till omdöpning (a·rad + b·kolumn med a = b eller a = -b).
 * Utan den skulle en mekanism med en latinsk kvadrat rymma högst två frågor.
 * `strukturNyckel` är nyckeln utan värdemängderna; generatorn skriver hur
 * många olika sådana partiet har per mekanism, som upplysning.
 */
export function strukturNyckel(q) { return mjukNyckel(q, false); }
export function mjukNyckel(q, medVarden = true) {
  const full = q.grid.map((rad) => rad.slice());
  full[2][2] = q.options[q.correctAnswer];
  const t = tolka(q);
  if (!t.ok) return null;
  const delar = Object.keys(t.regel).map((id) => {
    const ord = new Map();
    const monster = full.flat().map((c) => { const v = key(t.dimsVy(c).find((d) => d.id === id).varde); if (!ord.has(v)) ord.set(v, ord.size); return ord.get(v); }).join('');
    return medVarden ? `${monster}{${[...ord.keys()].sort().join(',')}}` : monster;
  });
  return `${q.mekanism ?? ''}:${delar.join('/')}`;
}

// =============================================================================
// Bygg en färdig fråga ur ett recept.
// =============================================================================
const BYGGARE = { pilVridning, stralVridning, tileRotation, sektorRotation, latticeMonster, latticeVandring, orbitalVandring, pilMedByte, orbitalMedByte, latticeTvaVandrare, balansRegel, latinAntal, latinForm, latinFlera, overlagring, spegling, antalSekvens, antalSumma, latinTrippelStack, latinTrippelPil, overlagringVriden, radvisRotation, radvisBlock, radvis2x2, radvisBalans, antalEgenRiktning, dubbelOverlagring };
export { BYGGARE };

// =============================================================================
// Urvalet av fem distraktorer för bank_version 3 (plan-facit-genvag avsnitt
// 3). En sökning över byggarens kandidater, i byggarens ordning, efter fem
// som tillsammans med facit klarar:
//   - varje distraktor har en misstagstext, högst två med samma text (först
//     prövas fem olika texter)
//   - ingen tom figur (G11)
//   - S2: är facit en kopia av en synlig ruta krävs minst två distraktorer
//     som också är kopior
//   - S5 och S6: facit sticker inte ut, och ingen distraktor (expert och
//     plus) eller högst en (grund och avancerad) kan strykas genom att räkna
//     majoritet per egenskap
//   - plus: distraktorkraven (minst tre nära miss, varje regel bruten, högst
//     en kopia, inga två lika fel)
// Returnerar index i kand, eller null.
// =============================================================================
const POS_SYNLIGA = [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1]];
function valjFem(prov, t, kand, m, { plus, expert }) {
  const synliga = new Set(POS_SYNLIGA.map(([r, c]) => dimNyckel(prov.grid[r][c])));
  const facitKopia = synliga.has(dimNyckel(prov.options[0]));
  const an = analysera(prov, t);
  // Varje regel ska testas (granskningen av grund och avancerad, omgång 1):
  // med två eller fler regler bryter minst två distraktorer varje regel,
  // och minst en av dem bryter bara den regeln. Annars löses frågan med en
  // regel ensam (M2 och M4 i omgång 1 hade alla sex alternativ med facits
  // värde i den andra regeln).
  const R = an.ok ? an.R : [];
  const tackning = R.length >= 2;
  let info = kand.map((c, i) => ({
    i,
    text: urvalsText(m[i + 1]),
    tom: tomFigur(c, prov) || (c.kind === 'lattice' && c.cells.every((x) => x === 'empty')),
    kopia: synliga.has(dimNyckel(c)),
    a: an.ok ? an.alternativ[i + 1] : null,
  })).filter((x) => x.text && !x.tom && (!plus || !x.a?.tomFigur));
  if (tackning) {
    // En nära miss per regel först, turvis, så att sökningen hittar täckningen tidigt.
    const per = R.map((p) => info.filter((x) => x.a?.bryter.length === 1 && x.a.bryter[0] === p));
    const forst = [];
    for (let k = 0; k < 3; k++) for (const l of per) if (l[k] && !forst.includes(l[k])) forst.push(l[k]);
    info = [...forst, ...info.filter((x) => !forst.includes(x))];
  }
  const tak = expert ? 0 : 1;
  // Värden som inte finns bland de synliga rutorna i en kategorisk egenskap
  // (en kort pil när alla är långa) går att stryka utan regeln. Högst ett
  // sådant alternativ prövas först, sedan två.
  const synligaVarden = new Map();
  for (const [r, c] of POS_SYNLIGA) for (const d of dimsFor(prov.grid[r][c]) ?? []) {
    if (!synligaVarden.has(d.id)) synligaVarden.set(d.id, new Set());
    synligaVarden.get(d.id).add(vKey(d.varde));
  }
  const utanfor = (c) => (dimsFor(c) ?? []).some((d) => d.typ === 'kat' && !synligaVarden.get(d.id)?.has(vKey(d.varde)));
  info.forEach((x) => { x.utanfor = utanfor(kand[x.i]); });
  // S12: värden utanför rutnätet i en regelstyrd egenskap (latin, diagonal,
  // schackmönster). Aldrig på expert och plus, högst ett på grund och avancerad.
  const regelDims = t.ok ? Object.entries(t.regel).filter(([, r]) => ['latin', 'diagonal'].includes(r.regel) || (r.regel === 'periodisk' && r.info?.p === 2)).map(([id]) => id) : [];
  const synligaRegel = new Map(regelDims.map((id) => [id, new Set(POS_SYNLIGA.map(([r, c]) => vKey(t.dimsVy(prov.grid[r][c]).find((d) => d.id === id)?.varde)))]));
  info.forEach((x) => { x.s12 = regelDims.some((id) => !synligaRegel.get(id).has(vKey(t.dimsVy(kand[x.i]).find((d) => d.id === id)?.varde))); });
  if (expert) info = info.filter((x) => !x.s12);
  let provade = 0;
  const ok = (val) => {
    const opts = [prov.options[0], ...val.map((x) => kand[x.i])];
    const q = { id: prov.id, grid: prov.grid, options: opts, correctAnswer: 0 };
    if (facitKopia && val.filter((x) => x.kopia).length < 2) return false;
    if (facitUdda(q).length) return false;
    if (eliminerbara(q).length > tak) return false;
    if (!expert && val.filter((x) => x.s12).length > 1) return false;
    if (tackning) {
      // Expert och plus: varje regel bruten av två, minst en nära miss totalt
      // (fler nära miss gör facit till majoritet, S11). Grund och avancerad:
      // dessutom en nära miss per regel, så att diagnosen finns.
      for (const p of R) {
        const bryter = val.filter((x) => x.a?.bryter.includes(p));
        if (bryter.length < 2) return false;
        if (!expert && !bryter.some((x) => x.a.bryter.length === 1)) return false;
      }
      if (expert && !val.some((x) => x.a?.naraMiss)) return false;
    }
    if (expert && s11Majoritet(q).length) return false;
    if (plus) {
      const dist = val.map((x) => x.a);
      const a2 = {
        ...an,
        alternativ: [an.alternativ[0], ...dist],
        naraMiss: dist.filter((x) => x.naraMiss).length,
        kopior: dist.filter((x) => x.kopia !== null).length,
        tomma: dist.filter((x) => x.tomt).length,
        brutna: [...new Set(dist.filter((x) => x.naraMiss).flatMap((x) => x.bryter))],
      };
      if (plusFel(a2, { v3: true }).length) return false;
    }
    return true;
  };
  for (const [maxSamma, maxUtanfor] of [[1, 0], [2, 0], [1, 1], [2, 1], [2, 2], [2, 3]]) {
    provade = 0;
    const val = [];
    const texter = new Map();
    const dfs = (start) => {
      if (provade > (plus || tackning ? 60000 : 8000)) return null;
      if (val.length === 5) { provade++; return ok(val) ? [...val] : null; }
      for (let j = start; j < info.length; j++) {
        const x = info[j];
        if ((texter.get(x.text) ?? 0) >= maxSamma) continue;
        if (plus && x.kopia && val.some((y) => y.kopia)) continue;
        if (x.utanfor && val.filter((y) => y.utanfor).length >= maxUtanfor) continue;
        val.push(x); texter.set(x.text, (texter.get(x.text) ?? 0) + 1);
        const res = dfs(j + 1);
        val.pop(); texter.set(x.text, texter.get(x.text) - 1);
        if (res) return res;
      }
      return null;
    };
    const res = dfs(0);
    if (res) return res.map((x) => x.i);
  }
  return null;
}

/**
 * Bygg en fråga för bank_version 3 ur ett recept: { id, byggare, p,
 * difficulty, recept, p_prior, familj } och för plus { band, mekanism }.
 * Spärrarna S1 till S10 körs på varje försök (S8 och S10 över receptet via
 * `utseenden`). Frågan får fran_version: 3 och recept.
 */
// recept.seed: bygg med en annan frågas slump (samma rutnät som en struken
// fråga, nya alternativ; granskningen av omgång 1). `kvar`: frågorna per
// recept som redan finns, för spärren mot delade rader.
export function byggV3(recept, upptagna = new Set(), { utseenden = new Map(), mjuka = null, kvar = new Map() } = {}) {
  const fel = [];
  const plus = recept.band === 'plus';
  const fackKrock = (c) => c && c.kind === 'balanceline' && new Set(c.items.map((i) => `${i.posX}:${i.side}`)).size !== c.items.length;
  for (let forsok = 0; forsok < (recept.forsok ?? 300); forsok++) {
    const r = rng(`${recept.seed ?? recept.id}#${forsok}`);
    const b = BYGGARE[recept.byggare](r, recept.p);
    if (!b) { fel.push(`försök ${forsok}: byggaren gav inget rutnät`); continue; }
    if ([...b.grid.flat(), b.facit].some(fackKrock)) { fel.push(`försök ${forsok}: två former i samma fack`); continue; }
    const sett = new Set([key(b.facit)]);
    const kand = [];
    for (const c of b.kandidater) {
      if (!c) continue;
      const k = key(c);
      if (sett.has(k)) continue;
      if (c.kind === 'tally' && (c.count < 1 || c.count > 4)) continue;
      if (c.kind === 'sectorwheel' && (c.filled.length === 0 || c.filled.length === 8)) continue;
      if (c.kind === 'ray' && (c.rays.length === 0 || c.rays.length > 4)) continue;
      if (c.kind === 'tile' && (c.pattern === 0 || c.pattern === 511)) continue;
      if (fackKrock(c)) continue;
      sett.add(k); kand.push(c);
    }
    const prov = { id: recept.id, title: b.title, rule: b.rule, grid: b.grid, options: [b.facit, ...kand], correctAnswer: 0, fran_version: 3, ...(plus ? { band: 'plus' } : {}) };
    const t = tolka(prov);
    if (!t.ok || t.tvetydig.length) { fel.push(`försök ${forsok}: ${t.ok ? 'tvetydig ' + t.tvetydig.map((x) => x.dim + ' ' + x.regler.join('/')).join('; ') : 'ingen regel för ' + (t.saknar ?? [t.orsak]).join(', ')}`); continue; }
    if (t.traffar.length !== 1) { fel.push(`försök ${forsok}: ${t.traffar.length} kandidater stämmer med regeln`); continue; }
    const m = (() => { try { return misstagFor(prov, t); } catch (e) { return null; } })();
    if (!m) { fel.push(`försök ${forsok}: misstag kastade`); continue; }
    // Facit är aldrig en kopia av en synlig ruta utanför latin-antal och
    // latin-form, där det är ofrånkomligt; kvoten per facitruta (S1b) håller då.
    const fNyckel = dimNyckel(b.facit);
    if (!['latin-antal', 'latin-form'].includes(b.family) && b.grid.flat().some((c) => c && dimNyckel(c) === fNyckel)) { fel.push(`försök ${forsok}: facit är en kopia av en synlig ruta`); continue; }
    const expert = plus || /^v7e-/.test(recept.id);
    const valda = valjFem(prov, t, kand, m, { plus, expert });
    if (!valda) { fel.push(`försök ${forsok}: inga fem distraktorer klarar spärrarna`); continue; }
    const pos = Math.floor(r() * 6);
    const options = valda.map((i) => kand[i]); options.splice(pos, 0, b.facit);
    const q = { id: recept.id, title: b.title, rule: b.rule, difficulty: recept.difficulty, family: b.family, grid: b.grid, options, correctAnswer: pos };
    if (plus) Object.assign(q, { band: 'plus', mekanism: recept.mekanism });
    Object.assign(q, { p_prior: recept.p_prior, recept: recept.recept, fran_version: 3 });
    const sig = key(q.grid);
    if (upptagna.has(sig)) { fel.push(`försök ${forsok}: samma rutnät som en annan fråga`); continue; }
    const mjuk = mjuka ? mjukNyckel(q) : null;
    if (mjuk && mjuka.has(mjuk)) { fel.push(`försök ${forsok}: samma mönster som en annan fråga i partiet`); continue; }
    const utse = utseendeNyckel(q);
    const receptNyckel = recept.recept ?? recept.mekanism ?? b.family;
    if (utseenden.get(receptNyckel)?.has(utse)) { fel.push(`försök ${forsok}: S10 samma utseende som en annan fråga i receptet`); continue; }
    const dr = delarRader(q, kvar.get(receptNyckel) ?? []);
    if (dr.length) { fel.push(`försök ${forsok}: ${dr[0]}`); continue; }
    if (plus) {
      const df = plusFel(analysera(q), { v3: true });
      if (df.length) { fel.push(`försök ${forsok}: ${df.join('; ')}`); continue; }
    }
    const kf = kontrollera(q, { strikt: true, familj: recept.familj ?? b.family, kandidat: true });
    if (kf.length) { fel.push(`försök ${forsok}: ${kf.join('; ')}`); continue; }
    const sp = sparrFel(q, { t: tolka(q) });
    if (sp.fel.length) { fel.push(`försök ${forsok}: ${sp.fel.join('; ')}`); continue; }
    q.misstag = misstagFor(q);
    upptagna.add(sig);
    if (mjuk) mjuka.add(mjuk);
    if (!utseenden.has(receptNyckel)) utseenden.set(receptNyckel, new Set());
    utseenden.get(receptNyckel).add(utse);
    if (!kvar.has(receptNyckel)) kvar.set(receptNyckel, []);
    kvar.get(receptNyckel).push(q);
    Object.defineProperty(q, 'forsok', { value: forsok, enumerable: false });
    return q;
  }
  const vanligast = new Map();
  for (const x of fel) { const k = x.replace(/^försök \d+: /, '').replace(/v7[gae]-[\w-]+: /g, '').slice(0, 200); vanligast.set(k, (vanligast.get(k) ?? 0) + 1); }
  throw new Error(`${recept.id} gick inte att bygga. Vanligaste skälen:\n    ${[...vanligast.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, n]) => `${n} × ${k}`).join('\n    ')}`);
}

/**
 * recept: { id, byggare, p, difficulty } och för bandet "svår plus" även
 * { band: 'plus', mekanism, p_prior }.
 * Returnerar frågan (med family, misstag, difficulty) eller kastar med skälen.
 *
 * För plus-recept tas tomma distraktorer, tomma figurer och kopior av
 * synliga rutor bort före urvalet, och urvalet ska klara distraktorkraven
 * (distraktorer.mjs) innan kontrollen körs. Taket är 200 försök. `mjuka`
 * är en mängd mjuka dubblettnycklar (mjukNyckel) som inte får återkomma.
 *
 * `kandidatKrav` (standard): kraven för nya frågor i kontroll.mjs, facit
 * inte rutan uppe till vänster och inga rena läsordningsrörelser på
 * avancerad och expert. genereraNiva stänger av dem för id som redan finns i
 * en fryst bank, så att de byggs likadant.
 */
export function bygg(recept, upptagna = new Set(), { mjuka = null, kandidatKrav = true } = {}) {
  const fel = [];
  const plus = recept.band === 'plus';
  for (let forsok = 0; forsok < (plus ? 200 : 60); forsok++) {
    const r = rng(`${recept.id}#${forsok}`);
    const b = BYGGARE[recept.byggare](r, recept.p);
    if (!b) continue;
    // Två rörelser (balanslinjen): aldrig två former i samma fack, varken i
    // rutnätet eller i facit (spec-rummen 15.4, regel 6). Distraktorerna
    // filtreras nedan.
    const fackKrock = (c) => c && c.kind === 'balanceline' && new Set(c.items.map((i) => `${i.posX}:${i.side}`)).size !== c.items.length;
    if ([...b.grid.flat(), b.facit].some(fackKrock)) { fel.push(`försök ${forsok}: två former i samma fack`); continue; }
    const facitKey = key(b.facit);
    const sett = new Set([facitKey]);
    const kand = [];
    for (const c of b.kandidater) {
      if (!c) continue;
      const k = key(c);
      if (sett.has(k)) continue;
      if (c.kind === 'tally' && (c.count < 1 || c.count > 4)) continue;
      if (c.kind === 'sectorwheel' && (c.filled.length === 0 || c.filled.length === 8)) continue;
      if (c.kind === 'ray' && c.rays.length === 0) continue;
      if (c.kind === 'tile' && (c.pattern === 0 || c.pattern === 511)) continue;
      if (c.kind === 'balanceline' && new Set(c.items.map((i) => `${i.posX}:${i.side}`)).size !== c.items.length) continue;
      sett.add(k); kand.push(c);
    }
    // misstag för alla kandidater på en gång, med facit först
    const prov = { id: recept.id, title: b.title, rule: b.rule, grid: b.grid, options: [b.facit, ...kand], correctAnswer: 0 };
    const t = tolka(prov);
    if (!t.ok || t.tvetydig.length) { fel.push(`försök ${forsok}: ${t.ok ? 'tvetydig' : 'ingen regel'}`); continue; }
    let m = (() => { try { return misstagFor(prov, t); } catch (e) { return null; } })();
    if (!m) { fel.push(`försök ${forsok}: misstag kastade`); continue; }
    if (plus) {
      // bara alternativ som stämmer på minst en regel och inte är en synlig ruta
      // i byggarens ordning, som har nära missar först
      const an = analysera(prov, t);
      const alla = kand.map((c, i) => ({ c, m: m[i + 1], a: an.alternativ[i + 1] }));
      const rader = alla.filter((x) => !x.a.tomt && !x.a.tomFigur && x.a.kopia === null);
      // En regel som ingen nära miss utan kopia kan bryta (P1' med formens
      // kvadrat åt höger: varje annan fyllning ger en av diagonalens rutor)
      // får en nära miss som är en kopia, högst en per fråga (distraktorkravet
      // 2.2 punkt 4). Den läggs först så att urvalet tar den.
      const brutna = new Set(rader.filter((x) => x.a.naraMiss).flatMap((x) => x.a.bryter));
      const obrutna = an.R.filter((p) => !brutna.has(p));
      if (obrutna.length === 1) {
        const kopia = alla.find((x) => x.a.kopia !== null && x.a.naraMiss && !x.a.tomFigur && x.a.bryter[0] === obrutna[0]);
        if (kopia) rader.unshift(kopia);
      }
      kand.splice(0, kand.length, ...rader.map((x) => x.c));
      m = [m[0], ...rader.map((x) => x.m)];
    }
    // välj fem med olika texter först, i byggarens ordning
    const valda = []; const texter = new Set();
    kand.forEach((c, i) => { const x = urvalsText(m[i + 1]); if (x && !texter.has(x) && valda.length < 5) { valda.push(c); texter.add(x); } });
    kand.forEach((c, i) => { const x = urvalsText(m[i + 1]); if (x && !valda.includes(c) && valda.length < 5 && [...texter].filter((y) => y === x).length < 2) { valda.push(c); } });
    if (valda.length < 5) { fel.push(`försök ${forsok}: bara ${valda.length} förklarade distraktorer`); continue; }
    // facits plats slumpas (blandningen per session gör det ändå, men banken ska inte ha ett mönster)
    const pos = Math.floor(r() * 6);
    const options = [...valda]; options.splice(pos, 0, b.facit);
    const q = { id: recept.id, title: b.title, rule: b.rule, difficulty: recept.difficulty, family: b.family, grid: b.grid, options, correctAnswer: pos };
    if (plus) Object.assign(q, { band: 'plus', mekanism: recept.mekanism, p_prior: recept.p_prior });
    const sig = key(q.grid);
    if (upptagna.has(sig)) { fel.push(`försök ${forsok}: samma rutnät som en annan fråga`); continue; }
    const mjuk = mjuka ? mjukNyckel(q) : null;
    if (mjuk && mjuka.has(mjuk)) { fel.push(`försök ${forsok}: samma mönster som en annan fråga i partiet`); continue; }
    if (plus) {
      const df = plusFel(analysera(q));
      if (df.length) { fel.push(`försök ${forsok}: ${df.join('; ')}`); continue; }
    }
    const kf = kontrollera(q, { strikt: true, familj: b.family, kandidat: kandidatKrav });
    if (kf.length) { fel.push(`försök ${forsok}: ${kf.join('; ')}`); continue; }
    q.misstag = misstagFor(q);
    upptagna.add(sig);
    if (mjuk) mjuka.add(mjuk);
    Object.defineProperty(q, 'forsok', { value: forsok, enumerable: false });
    return q;
  }
  throw new Error(`${recept.id} gick inte att bygga:\n  ${fel.slice(-6).join('\n  ')}`);
}

export { familjFor, tolka };
