// scripts/lib/serie/struktur.mjs
// =============================================================================
// Strukturnyckel och radnyckel för figurserier (beställningen A3: "variera
// regeln, inte startläget"; S8 och S10 på rad).
//
//   strukturNyckel  primitiven och regeln per dimension med parametrar (steg,
//                   tillväxt, period, växelvisa steg), utan startläge och
//                   utan konstanta värden. Två frågor med samma nyckel skiljer
//                   sig bara i var de börjar.
//   radNyckel       de fem visade och facit per dimension (dubblettkontroll).
// =============================================================================

import { dimNyckel, lasCell, mod } from './celler-serie.mjs';

const steg8 = (k) => mod(k, 8);

export function strukturNyckel(q) {
  const { prim, dims } = q.regler;
  const delar = Object.keys(dims).sort().map((id) => {
    const r = dims[id];
    switch (r.regel) {
      case 'konstant': return `${id}:k`;
      case 'steg': return `${id}:steg${typeof r.k === 'number' && ['vinkel', 'satellit', 'start', 'ylage', 'kvinkel'].includes(id) ? steg8(r.k) : r.k}`;
      case 'vaxande': return `${id}:vax${r.d0}/${r.dd}`;
      case 'cykel': return `${id}:cykel${r.varden.length}${new Set(r.varden).size < r.varden.length ? 'u' : ''}`;
      case 'vaxelvis': return `${id}:vxl${r.ke}/${r.ko}`;
      default: return `${id}:${r.regel}`;
    }
  });
  return `${prim}|${delar.join('|')}`;
}

export function radNyckel(q) {
  return [...q.rad, q.options[q.correctAnswer]].map(dimNyckel).join('¦');
}

/**
 * Lägesraden (granskning 02, F7): de fem visade lägena eller vinklarna i
 * ordning, oavsett form- eller fyllningsfas. Två frågor på samma nivå får
 * inte dela den. Null när frågan inte har någon rörlig lägesdimension.
 */
const LAGESDIMENSIONER = ['vinkel', 'satellit', 'start', 'ylage', 'kvinkel'];
export function lagesNyckel(q) {
  const rorliga = LAGESDIMENSIONER.filter((id) => q.regler?.dims?.[id] && q.regler.dims[id].regel !== 'konstant');
  if (!rorliga.length) return null;
  const v = q.rad.map((c) => lasCell(c)?.v);
  return rorliga.map((id) => `${id}:${v.map((x) => x?.[id]).join(',')}`).join('|');
}
