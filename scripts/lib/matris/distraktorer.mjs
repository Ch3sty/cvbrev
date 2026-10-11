// scripts/lib/matris/distraktorer.mjs
// =============================================================================
// Distraktorkontrollen (beställningen "svarare frågor", avsnitt 2): räknar
// för varje alternativ vilka regler det uppfyller, ur tolkningen av de åtta
// synliga rutorna (tolka.mjs).
//
// Regellistan R: en post per dimension med icke konstant regel. Överlagring
// med vridning ger två poster, `op` (rätt operation, vilken vridning som
// helst) och `vrid` (rätt vridning, vilken operation som helst).
//
//   nära miss  uppfyller exakt |R| - 1 poster
//   träff      uppfyller alla (bara facit ska göra det)
//   tomt       uppfyller 0 poster när |R| >= 2
//   kopia      identiskt med en synlig ruta
//   dubbel     uppfyller op och vrid var för sig men med olika partner
//              (rätt operation med fel vridning är också fel operation med
//              rätt vridning). Ingen träff, utan dubbel diagnos: misstaget
//              är "op eller vrid" (granskningen av parti 01, 2.4).
//   tom figur  strålar utan streck, hjul utan sektor, orbital utan prick när
//              rutnätet har prick, 3×3 eller 2×2 helt tomt (G11)
//
// Kraven för bandet "svår plus" (2.2) i `plusFel`. Skriptet
// scripts/v7-distraktor-check.mjs är ett tunt skal runt den här modulen, och
// generatorn (generera.mjs, bygg) och granskningssidan
// (render-matris-granskning.tsx) använder samma funktioner.
// =============================================================================

import { stable, vKey, rotera } from './celler.mjs';
import { tolka, OPS, POS } from './tolka.mjs';

const lika = (a, b) => vKey(a) === vKey(b);
const BOKSTAV = 'ABCDEF';

function opMangd(op, a, b) {
  const s = OPS[op](new Set(a.map(String)), new Set(b.map(String)));
  return [...s].map(Number).sort((x, y) => x - y);
}

/** Regellistan R ur tolkningen. */
export function regelLista(t) {
  const R = [];
  for (const [id, r] of Object.entries(t.regel)) {
    if (r.regel === 'konstant') continue;
    if (r.regel === 'overlagring-vriden') {
      R.push({ post: 'op', dim: id, regel: r });
      R.push({ post: 'vrid', dim: id, regel: r });
    } else R.push({ post: id, dim: id, regel: r });
  }
  return R;
}

/** De två rutorna som läggs ihop för tomrummet (rad 3 eller kolumn 3). */
function parFor(q, t, dimId, axel) {
  const v = (r, c) => t.dimsVy(q.grid[r][c]).find((d) => d.id === dimId).varde;
  return axel === 'kolumn' ? [v(2, 0), v(2, 1)] : [v(0, 2), v(1, 2)];
}

/**
 * Uppfyller alternativet S posten p? Returnerar { ok, fel } där fel är det
 * felaktiga värdet (för att se om två distraktorer bryter samma post på
 * samma sätt).
 */
function uppfyller(q, t, p, S) {
  const v = t.dimsVy(S).find((d) => d.id === p.dim)?.varde;
  if (p.post !== 'op' && p.post !== 'vrid') return { ok: lika(v, t.pred[p.dim]), fel: vKey(v) };
  const dim = p.regel.dim;
  const { op, axel, k } = p.regel.info;
  const [a, b] = parFor(q, t, p.dim, axel);
  if (p.post === 'op') {
    const C = opMangd(op, a, b);
    const vridningar = [];
    for (let j = 0; j < 8; j++) if (lika(rotera(dim, C, j), v)) vridningar.push(j);
    return { ok: vridningar.length > 0, fel: `op:${Object.keys(OPS).filter((o) => o !== op && lika(rotera(dim, opMangd(o, a, b), k), v)).join('+') || vKey(v)}` };
  }
  const ops = Object.keys(OPS).filter((o) => lika(rotera(dim, opMangd(o, a, b), k), v));
  const C = opMangd(op, a, b);
  const j = [0, 1, 2, 3, 4, 5, 6, 7].filter((x) => lika(rotera(dim, C, x), v));
  return { ok: ops.length > 0, fel: `vrid:${j.join('+') || vKey(v)}` };
}

/** Tom figur (G11). */
export function tomFigur(cell, q) {
  if (!cell || Array.isArray(cell)) return false;
  if (cell.kind === 'ray') return cell.rays.length === 0;
  if (cell.kind === 'sectorwheel') return cell.filled.length === 0;
  if (cell.kind === 'tile') return cell.pattern === 0;
  if (cell.kind === 'lattice') return cell.cells.every((x) => x === 'empty');
  if (cell.kind === 'dotsorbit') return cell.dots.length === 0;
  if (cell.kind === 'orbital') return cell.satellite === null && POS.some(([r, c]) => q.grid[r][c]?.satellite !== null && q.grid[r][c]?.satellite !== undefined);
  return false;
}

/**
 * Analys av en fråga. Returnerar
 *   { id, ok, R: [post], alternativ: [{ i, bokstav, facit, uppfyllda, bryter,
 *     felVarden, naraMiss, traff, tomt, kopia, tomFigur }], naraMiss, tomma,
 *     kopior, brutna }
 */
export function analysera(q, t = tolka(q)) {
  if (!t || !t.ok) return { id: q.id, ok: false, orsak: t?.orsak ?? `ingen regel för ${(t?.saknar ?? []).join(', ')}` };
  const R = regelLista(t);
  const synliga = POS.map(([r, c]) => stable(q.grid[r][c]));
  const alternativ = q.options.map((S, i) => {
    const res = R.map((p) => ({ post: p.post, ...uppfyller(q, t, p, S) }));
    const uppfyllda = res.filter((x) => x.ok).map((x) => x.post);
    const bryter = res.filter((x) => !x.ok).map((x) => x.post);
    const kopiaIdx = synliga.indexOf(stable(S));
    return {
      i,
      bokstav: BOKSTAV[i],
      facit: i === q.correctAnswer,
      uppfyllda,
      bryter,
      felVarden: res.filter((x) => !x.ok).map((x) => `${x.post}=${x.fel}`),
      traff: uppfyllda.length === R.length && !(i !== q.correctAnswer && R.some((p) => p.post === 'op')),
      dubbel: i !== q.correctAnswer && uppfyllda.length === R.length && R.some((p) => p.post === 'op'),
      naraMiss: R.length >= 1 && uppfyllda.length === R.length - 1,
      tomt: R.length >= 2 && uppfyllda.length === 0,
      kopia: kopiaIdx >= 0 ? kopiaIdx + 1 : null,
      tomFigur: tomFigur(S, q),
    };
  });
  const dist = alternativ.filter((a) => !a.facit);
  const brutna = new Set(dist.filter((a) => a.naraMiss).flatMap((a) => a.bryter));
  return {
    id: q.id,
    ok: true,
    R: R.map((p) => p.post),
    alternativ,
    naraMiss: dist.filter((a) => a.naraMiss).length,
    tomma: dist.filter((a) => a.tomt).length,
    kopior: dist.filter((a) => a.kopia !== null).length,
    dubbla: dist.filter((a) => a.dubbel).length,
    brutna: [...brutna],
  };
}

/** Felen för bandet "svår plus" (2.2), som meningar. Tom lista = godkänd. */
export function plusFel(a) {
  if (!a.ok) return [`${a.id}: ${a.orsak}`];
  const fel = [];
  const dist = a.alternativ.filter((x) => !x.facit);
  if (a.naraMiss < 3) fel.push(`${a.id}: bara ${a.naraMiss} nära miss bland de fem distraktorerna, minst tre krävs`);
  const obrutna = a.R.filter((p) => !a.brutna.includes(p));
  if (obrutna.length) fel.push(`${a.id}: ingen nära miss bryter ${obrutna.join(', ')}`);
  if (a.R.length >= 2) dist.filter((x) => x.tomt).forEach((x) => fel.push(`${a.id}: alternativ ${x.bokstav} stämmer på ingen regel`));
  if (a.kopior > 1) fel.push(`${a.id}: ${a.kopior} alternativ är kopior av synliga rutor, högst en får vara det`);
  const sett = new Map();
  for (const x of dist.filter((d) => d.naraMiss)) {
    const nyckel = x.felVarden.join('|');
    if (sett.has(nyckel)) fel.push(`${a.id}: alternativ ${sett.get(nyckel)} och ${x.bokstav} bryter samma regel på samma sätt`);
    else sett.set(nyckel, x.bokstav);
  }
  dist.filter((x) => x.tomFigur).forEach((x) => fel.push(`${a.id}: alternativ ${x.bokstav} är en tom figur`));
  return fel;
}

/** Kort rad per alternativ för granskningssidan: "A bryter: symbol", "F: kopia av ruta 5". */
export function radPerAlternativ(a) {
  if (!a.ok) return [];
  return a.alternativ.map((x) => {
    if (x.facit) return `${x.bokstav}: rätt svar`;
    const delar = [];
    if (x.dubbel) delar.push(`${x.bokstav}: dubbel diagnos, op eller vrid`);
    else if (x.bryter.length) delar.push(`${x.bokstav} bryter: ${x.bryter.join(', ')}`);
    else delar.push(`${x.bokstav} bryter inget`);
    if (x.kopia) delar.push(`kopia av ruta ${x.kopia}`);
    if (x.tomFigur) delar.push('tom figur');
    return delar.join(', ');
  });
}

export { BOKSTAV };
