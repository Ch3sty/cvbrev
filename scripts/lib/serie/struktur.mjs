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

/**
 * Följdnycklarna (granskning av parti 3, 2026-11-19, punkt 5): samma rörelse
 * får inte återkomma inom nivå och familj, oavsett primitiv eller vridning.
 *
 *   lage   varje rörlig lägesdimension (vinkel, prick, start, kärnans pil):
 *          de sex lägena i ordning, facit inräknat. Samma följd under en
 *          annan primitiv (pricken på banan mot pricken längs kanten, pilen
 *          i mitten mot pilen ensam) räknas som samma.
 *   vriden för växelvisa steg: följden räknad från första läget, så att en
 *          rad som bara är vriden ett antal lägen räknas som samma. (Lika och
 *          växande steg räknas inte så: där är den vridna följden bara stegets
 *          storlek och tillväxt, med fyra möjliga per riktning.)
 *   antal  rörligt antal (streck, sektorer, rutor, hörn): de sex talen, per
 *          primitiv.
 *
 * Returnerar nycklar på formen `<nivå>|<familj>|...`. Två frågor som delar en
 * nyckel har samma följd.
 */
export function foljdNycklar(q) {
  const dims = q.regler?.dims ?? {};
  const rad = [...q.rad, q.options[q.correctAnswer]].map((c) => lasCell(c)?.v);
  if (rad.some((v) => !v)) return [];
  const bas = `${q.niva}|${q.family}`;
  const ut = [];
  for (const id of LAGESDIMENSIONER) {
    const r = dims[id];
    if (!r || r.regel === 'konstant') continue;
    const s = rad.map((v) => v[id]);
    ut.push(`${bas}|lage|${s.join(',')}`);
    if (r.regel === 'vaxelvis') ut.push(`${bas}|vriden|${s.map((x) => mod(x - s[0], 8)).join(',')}`);
  }
  for (const id of ['antal', 'horn']) {
    const r = dims[id];
    if (!r || r.regel === 'konstant') continue;
    ut.push(`${bas}|antal|${q.regler.prim}|${rad.map((v) => v[id]).join(',')}`);
  }
  return ut;
}

/**
 * Regelnyckeln (granskningen av parti 4, 2026-11-19, punkt 2): primitiven,
 * de rörliga reglerna utan startläge (s0, s1) och konstanterna. Cykelns
 * värden räknas sorterade, så att fasen inte räknas. Två frågor med samma
 * regelnyckel är samma uppgift med nytt startläge, alltså samma rad vriden.
 * Utan nivå; den som jämför inom nivå sätter nivån framför.
 */
export function regelNyckel(q) {
  const { prim, dims } = q.regler ?? {};
  if (!prim || !dims) return null;
  const delar = Object.keys(dims).sort().map((id) => {
    const r = dims[id];
    const lage = LAGESDIMENSIONER.includes(id);
    switch (r.regel) {
      case 'konstant': return `${id}=${r.v}`;
      case 'steg': return `${id}:steg${lage ? steg8(r.k) : r.k}`;
      case 'vaxande': return `${id}:vax${r.d0}/${r.dd}`;
      case 'cykel': return `${id}:cykel[${[...r.varden].map(String).sort().join(',')}]`;
      case 'vaxelvis': return `${id}:vxl${lage ? steg8(r.ke) : r.ke}/${lage ? steg8(r.ko) : r.ko}`;
      default: return `${id}:${r.regel}`;
    }
  });
  return `${prim}|${delar.join('|')}`;
}
