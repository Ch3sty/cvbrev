// scripts/lib/serie/generera-bryter.mjs
// =============================================================================
// byggBryter(): en "bryter mönstret"-fråga ur en variant (bryter-regler.mjs),
// eller null när slumpen gav sex figurer som inte klarar spärrarna BM1 till
// BM5 (sparrar-bryter.mjs) eller geometrin (G1, G2, G4, G11, G12, S1 till S4).
// genereraBryter(): hela kandidatlistan för grund och avancerad.
// =============================================================================

import { BRYTER_MALLAR, bryterTexter, lasBryter, bryterNyckel, grupp } from './bryter-regler.mjs';
import { sparrFelBryter } from './sparrar-bryter.mjs';
import { geometriSerie } from '../../v7-geometri-check.mjs';
import { mulberry32, hashString } from './slump.mjs';

const NIVA_KOD = { grund: 'g', avancerad: 'a' };
const FAM_KOD = { antal: 'antal', fyllning: 'fyll', flera: 'flera', vridning: 'vrid' };

export function byggBryter(r, mall, variant, { id, pos }) {
  const v = variant.bygg(r);
  if (!v) return null;
  const fem = v.celler.slice(0, 5);
  const rad = [...fem];
  rad.splice(pos, 0, v.celler[5]);
  const V = rad.map((c) => lasBryter(c)?.v);
  if (V.some((x) => !x)) return null;
  const t = bryterTexter(mall.id, v.prim, V, pos);
  const q = {
    id,
    form: 'bryter',
    niva: mall.niva,
    family: mall.family,
    recept: mall.id,
    variant: variant.namn,
    difficulty: mall.difficulty,
    p_prior: mall.p_prior,
    title: t.title,
    rule: t.rule,
    rad,
    options: [],
    correctAnswer: pos,
    misstag: t.misstag,
    regler: { mall: mall.id, prim: v.prim, regel: v.regel },
    fran_version: 2,
  };
  if (sparrFelBryter(q).fel.length) return null;
  if (geometriSerie({ rad, options: [] }).length) return null;
  return q;
}

/** Nyckeln för hela raden oberoende av ordning (samma sex figurer två gånger är en dubblett). */
export const bryterRadNyckel = (q) => q.rad.map(bryterNyckel).sort().join('¦');

export function genereraBryter({ seed = 'figurserier-bryter-v1', logg = () => {} } = {}) {
  const perNiva = { grund: [], avancerad: [] };
  const nycklar = new Set();
  for (const mall of BRYTER_MALLAR) {
    const r = mulberry32(hashString(`${seed}:${mall.id}`));
    const grupper = new Set(mall.varianter.map((v) => grupp(v.prim)));
    const tak = Math.ceil(mall.antal / grupper.size);
    const perGrupp = {};
    const platser = [];
    while (platser.length < mall.antal) platser.push(0, 1, 2, 3, 4, 5);
    for (let i = platser.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [platser[i], platser[j]] = [platser[j], platser[i]]; }
    let gjorda = 0;
    let forsok = 0;
    let vi = 0;
    while (gjorda < mall.antal) {
      if (++forsok > 200000) throw new Error(`${mall.id}: fick bara ${gjorda} av ${mall.antal}`);
      const variant = mall.varianter[vi % mall.varianter.length];
      const g = grupp(variant.prim);
      if ((perGrupp[g] ?? 0) >= tak) { vi++; continue; }
      const id = `fsb-${NIVA_KOD[mall.niva]}-${FAM_KOD[mall.family]}-${String(gjorda + 1).padStart(2, '0')}`;
      const q = byggBryter(r, mall, variant, { id, pos: platser[gjorda] });
      if (!q) continue;
      const k = bryterRadNyckel(q);
      if (nycklar.has(k)) continue;
      nycklar.add(k);
      perGrupp[g] = (perGrupp[g] ?? 0) + 1;
      perNiva[mall.niva].push(q);
      gjorda++;
      vi++;
    }
    logg(`${mall.id} ${mall.namn}: ${gjorda} frågor (${forsok} försök), grupper ${JSON.stringify(perGrupp)}`);
  }
  return perNiva;
}
