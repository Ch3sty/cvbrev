// scripts/lib/serie/distraktorer.mjs
// =============================================================================
// Distraktorerna i figurserier (beställningen omgång 2, A5).
//
// Kandidater i ordning: per regelstyrd dimension facit med värdet ett steg för
// långt, ett steg bakåt (om inte kopia), ett annat värde ur raden; sedan en
// konstant egenskap fel; därefter två (och på expert tre) dimensioner fel.
//
// Analysen räknar för varje alternativ vilka regler det bryter (värdet skiljer
// sig från tolkningens sjätte figur) och vilka konstanta egenskaper som är fel.
//
// Kraven på urvalet av fem (kravFel):
//   alla nivåer      minst två distraktorer bryter varje regel, ingen kopia
//   grund, avancerad minst en distraktor bryter bara den regeln (och inget
//                    annat), för varje regel
//   expert           minst en nära miss (bryter exakt en regel) och två som
//                    bryter alla regler med olika fel
// Spärrarna (sparrar.mjs) prövas sedan på hela frågan i bygg().
// =============================================================================

import { PRIM, dimNyckel, giltigt, norm, stable, mod } from './celler-serie.mjs';
import { sekvens, VISADE } from './tolka-serie.mjs';

const BOKSTAV = 'ABCDEF';

/** Stegstorleken sista gången (för "ett steg för långt" och "fel håll"). */
export function sistaSteg(dim, r) {
  if (r.regel === 'steg') return r.k;
  if (r.regel === 'vaxande') return r.d0 + r.dd * (VISADE - 1);
  if (r.regel === 'vaxelvis') return r.ko;
  return null;
}

/** Felvärden för en dimension, med en etikett för misstagstexten. */
export function felVarden(dim, r, rad, facitV) {
  const ut = [];
  const add = (v, typ) => {
    v = norm(dim, v);
    if (!giltigt(dim, v) || stable(v) === stable(facitV)) return;
    if (ut.some((x) => stable(x.v) === stable(v))) return;
    ut.push({ v, typ });
  };
  const s = rad.map((x) => x);
  const s4 = s[VISADE - 1];
  if (dim.typ === 'kat') {
    for (const x of dim.L) add(x, 'annat');
    return ut;
  }
  if (r.regel === 'konstant') {
    for (const d of [1, -1, 2, -2]) add(facitV + d, 'konstant');
    return ut;
  }
  const steg = sistaSteg(dim, r);
  if (r.regel === 'vaxelvis') {
    add(sekvens(dim, r, 6), 'jamn');
    add(s[VISADE - 2] , 'stilla');
  }
  if (r.regel === 'vaxande') add(s4 + (r.d0 + r.dd * (VISADE - 2)), 'vaxer_inte');
  if (steg !== null) {
    add(facitV + steg, 'for_langt');
    add(s4 - steg, 'fel_hall');
    add(s4, 'stilla');
  }
  if (r.regel === 'cykel') for (const x of new Set(s)) add(x, 'annat_ur_raden');
  for (const x of s) add(x, 'ur_raden');
  for (const d of [1, -1, 2, -2]) add(facitV + d, 'fel_lage');
  return ut;
}

/** Felvärden för en konstant dimension. */
function konstFel(dim, facitV) {
  const ut = [];
  if (dim.typ === 'kat') for (const x of dim.L) { if (x !== facitV) ut.push({ v: x, typ: 'konstant' }); }
  // Rot: alla andra lägen, så att fem distraktorer kan få olika fel läge (S5).
  else for (const d of dim.typ === 'rot' ? [1, -1, 2, -2, 3, -3, 4] : [1, -1, 2, -2]) { const v = norm(dim, facitV + d); if (giltigt(dim, v) && !ut.some((x) => x.v === v)) ut.push({ v, typ: 'konstant' }); }
  return ut;
}

/**
 * Kandidaterna: värdeobjekt med felen de bär. `regler` = { prim, dims },
 * `radV` = värdena på position 0 till 4, `facitV` = position 5.
 */
export function kandidater(regler, radV, facitV, { expert = false } = {}) {
  const dims = PRIM[regler.prim].dims;
  const per = {};
  for (const d of dims) {
    const r = regler.dims[d.id];
    per[d.id] = r.regel === 'konstant' ? konstFel(d, facitV[d.id]) : felVarden(d, r, radV.map((v) => v[d.id]), facitV[d.id]);
  }
  const ut = [];
  const lagg = (andringar) => {
    const v = { ...facitV };
    for (const [id, x] of andringar) v[id] = x.v;
    ut.push({ v, fel: andringar.map(([id, x]) => ({ dim: id, typ: x.typ, v: x.v })) });
  };
  const ids = dims.map((d) => d.id);
  for (const id of ids) for (const x of per[id]) lagg([[id, x]]);
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++)
    for (const a of per[ids[i]]) for (const b of per[ids[j]]) lagg([[ids[i], a], [ids[j], b]]);
  if (expert && ids.length >= 3) {
    for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) for (let k = j + 1; k < ids.length; k++)
      for (const a of per[ids[i]].slice(0, 4)) for (const b of per[ids[j]].slice(0, 4)) for (const c of per[ids[k]].slice(0, 4))
        lagg([[ids[i], a], [ids[j], b], [ids[k], c]]);
  }
  return ut;
}

/**
 * Analys av en fråga med kända regler: per alternativ vilka regler det bryter
 * och vilka konstanta egenskaper som är fel, mot värdena i facit.
 */
export function analysera(q, lasta) {
  const prim = q.regler.prim;
  const dims = PRIM[prim].dims;
  const regel = dims.filter((d) => q.regler.dims[d.id].regel !== 'konstant').map((d) => d.id);
  const facit = lasta[q.correctAnswer];
  const visade = new Set(q.rad.map(dimNyckel));
  const alternativ = lasta.map((v, i) => {
    const bryter = regel.filter((id) => stable(v[id]) !== stable(facit[id]));
    const konst = dims.filter((d) => !regel.includes(d.id) && stable(v[d.id]) !== stable(facit[d.id])).map((d) => d.id);
    return {
      i,
      bokstav: BOKSTAV[i],
      facit: i === q.correctAnswer,
      bryter,
      konst,
      felVarden: [...bryter, ...konst].map((id) => `${id}=${stable(v[id])}`).join('|'),
      kopia: visade.has(dimNyckel(q.options[i])),
    };
  });
  // Antal vid gränsen (till exempel avtagande till ett): ingen ren
  // antalsdistraktor finns utan kopia, och "rätt antal, fel plats" räknas som
  // nära miss (granskning 01, avsnitt 4 punkt 6).
  const minskande = regel.filter((id) => utanRen(dims.find((x) => x.id === id), q.regler.dims[id], facit[id]));
  return { R: regel, alternativ, minskande, harKonstant: dims.some((d) => !regel.includes(d.id)) };
}

/** Antal vid gränsen: nästa steg efter facit går utanför primitivens gränser. */
export function utanRen(dim, r, facitV) {
  return dim.typ === 'ord' && r.regel === 'steg' && !giltigt(dim, facitV + r.k);
}

/** Kraven på urvalet (A5). Tom lista = godkänt. */
export function kravFel(a, niva) {
  const fel = [];
  const dist = a.alternativ.filter((x) => !x.facit);
  if (dist.some((x) => x.kopia)) fel.push('en distraktor är en kopia av en visad figur');
  if (dist.some((x) => x.bryter.length === 0 && x.konst.length === 0)) fel.push('en distraktor är lika facit');
  for (const id of a.R) {
    const n = dist.filter((x) => x.bryter.includes(id)).length;
    if (n < 2) fel.push(`bara ${n} distraktorer bryter regeln för ${id}, minst två`);
    // S14 balans: med minst två regler bryts ingen av alla fem.
    if (a.R.length >= 2 && n === dist.length) fel.push(`alla fem distraktorer bryter ${id} (S14)`);
  }
  if (niva !== 'expert') {
    for (const id of a.R) {
      const bara = dist.some((x) => x.bryter.length === 1 && x.bryter[0] === id && x.konst.length === 0);
      const nara = (a.minskande ?? []).includes(id) && dist.some((x) => x.bryter.length === 0 && x.konst.length === 1);
      if (!bara && !nara) fel.push(`ingen distraktor bryter bara regeln för ${id}`);
    }
  } else {
    // Nära miss: exakt en regel fel, inga konstanter fel (granskning 01, 4.5).
    const nara = dist.filter((x) => x.bryter.length === 1 && x.konst.length === 0).length;
    if (a.R.length >= 2 && nara < 1) fel.push('ingen nära miss (bryter exakt en regel)');
    // Granskning 02, F6: en nära miss per regel bland dem som håller konstanterna.
    if (a.harKonstant) for (const id of a.R) if (!dist.some((x) => x.konst.length === 0 && x.bryter.length === 1 && x.bryter[0] === id)) fel.push(`ingen nära miss på ${id} bland dem som håller konstanterna`);
    const alla = dist.filter((x) => x.bryter.length === a.R.length);
    if (new Set(alla.map((x) => x.felVarden)).size < 2) fel.push('färre än två distraktorer bryter alla regler med olika fel');
  }
  return fel;
}

/** Kort rad per alternativ för granskningssidan. */
export function radPerAlternativ(a) {
  return a.alternativ.map((x) => {
    if (x.facit) return `${x.bokstav}: rätt svar`;
    const delar = [];
    if (x.bryter.length) delar.push(`bryter ${x.bryter.join(', ')}`);
    if (x.konst.length) delar.push(`fel i ${x.konst.join(', ')}`);
    if (x.kopia) delar.push('kopia');
    return `${x.bokstav}: ${delar.join('; ') || 'bryter inget'}`;
  });
}

export { BOKSTAV, mod };
