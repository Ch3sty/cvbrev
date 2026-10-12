// scripts/lib/serie/tolka-serie.mjs
// =============================================================================
// Tolkningen av en figurserie (beställningen omgång 2, A3 och FS4).
//
// Positionerna 0 till 5: 0 till 4 visas, 5 är luckan. För varje dimension
// prövas alla regelhypoteser mot de fem visade värdena, oberoende av vad
// generatorn avsåg:
//
//   andra-diff  differenserna växer lika mycket varje gång: konstant (inga
//               steg), `steg k` (alla k, båda riktningar) och `vaxande`
//               (steget växer, offset 0, 1, 3, 6, 10, 15 med start och
//               riktning). För rot räknat mod 8, för ord utan omstart.
//   vaxelvis    0, 2, 4 tar lika stora steg; 1, 3 följer en egen regel och
//               luckan (5) hör till den. För kat: 0, 2, 4 lika och 1, 3 lika.
//   udda-lika   1 och 3 är lika: luckan är samma (en läsning en kandidat kan
//               göra av vilken rad som helst där varannan figur är lika).
//   cykel p     värdena upprepas med period p = 1 till 4 (p = 1 är konstant).
//
// En hypotes som passar men inte förutsäger något (kat-växelvis där 1 och 3
// skiljer sig) gör dimensionen tvetydig. FS4 `entydig`: varje dimension har
// exakt en förutsägelse, och exakt ett alternativ är den figuren.
//
// Reglerna generatorn använder (frågans `regler`) har samma namn: konstant,
// steg, vaxande, cykel, vaxelvis. `sekvens` räknar en regels värde på
// position i, så att perioden (FS2) och takten (FS3) räknas på regeln.
// =============================================================================

import { PRIM, lasCell, dimDef, giltigt, mod, stable } from './celler-serie.mjs';

export const VISADE = 5;

const lika = (a, b) => a === b;

/** Alla hypoteser som passar fem värden i en dimension. */
export function hypoteser(dim, s) {
  const ut = [];
  const n = dim.n;
  const sub = (a, b) => (dim.typ === 'rot' ? mod(a - b, n) : a - b);
  const add = (a, b) => (dim.typ === 'rot' ? mod(a + b, n) : a + b);
  const ok = (x) => dim.typ === 'kat' || giltigt(dim, x);
  if (dim.typ !== 'kat') {
    // andra differenser
    const d = [0, 1, 2, 3].map((i) => sub(s[i + 1], s[i]));
    const dd = [0, 1, 2].map((i) => sub(d[i + 1], d[i]));
    if (dd.every((x) => x === dd[0])) {
      const pred = add(add(s[4], d[3]), dd[0]);
      const regel = dd[0] === 0 ? (d[0] === 0 ? 'konstant' : 'steg') : 'vaxande';
      if (ok(pred)) ut.push({ regel, info: { k: d[0], dd: dd[0] }, pred });
      else ut.push({ regel, info: { k: d[0], dd: dd[0] }, pred: null, utanfor: true });
    }
    // växelvis: 0, 2, 4 aritmetiska, 1, 3 egen serie
    if (sub(s[2], s[0]) === sub(s[4], s[2])) {
      const ko = sub(s[3], s[1]);
      const pred = add(s[3], ko);
      if (ok(pred)) ut.push({ regel: 'vaxelvis', info: { ke: sub(s[2], s[0]), ko }, pred });
      else ut.push({ regel: 'vaxelvis', info: {}, pred: null, utanfor: true });
    }
  } else {
    if (lika(s[0], s[2]) && lika(s[2], s[4])) {
      ut.push({ regel: 'vaxelvis', info: {}, pred: lika(s[1], s[3]) ? s[3] : null });
    }
  }
  if (lika(s[1], s[3])) ut.push({ regel: 'udda-lika', info: {}, pred: s[3] });
  for (let p = 1; p <= 4; p++) {
    let passar = true;
    for (let i = p; i < VISADE; i++) if (!lika(s[i], s[i - p])) passar = false;
    if (passar) ut.push({ regel: p === 1 ? 'konstant' : 'cykel', info: { p }, pred: s[VISADE - p] });
  }
  return ut;
}

/**
 * Tolkar raden. Returnerar { ok, prim, per: { dim: { s, hyp, preds, pred,
 * entydig } }, pred (cellens värden), orsak }.
 */
export function tolkaRad(rad) {
  const l = rad.map(lasCell);
  if (l.some((x) => !x)) return { ok: false, orsak: 'en figur i raden går inte att läsa' };
  const prim = l[0].prim;
  if (l.some((x) => x.prim !== prim)) return { ok: false, orsak: 'raden blandar primitiver' };
  const per = {};
  const pred = {};
  let entydig = true;
  for (const d of PRIM[prim].dims) {
    const s = l.map((x) => x.v[d.id]);
    const hyp = hypoteser(d, s).filter((h) => !h.utanfor);
    const obestamd = hyp.some((h) => h.pred === null);
    const preds = [...new Set(hyp.filter((h) => h.pred !== null).map((h) => stable(h.pred)))];
    const e = hyp.length > 0 && !obestamd && preds.length === 1;
    if (!e) entydig = false;
    per[d.id] = { s, hyp, preds, entydig: e, pred: e ? hyp.find((h) => h.pred !== null).pred : undefined };
    pred[d.id] = per[d.id].pred;
  }
  return { ok: true, prim, per, pred, entydig };
}

// ---------------------------------------------------------------- reglerna
/**
 * Värdet på position i för en regel i en dimension.
 *   konstant { v }        steg { s0, k }         vaxande { s0, d0, dd }
 *   cykel { varden }      vaxelvis { s0, ke, s1, ko }
 */
export function sekvens(dim, r, i) {
  const wrap = (x) => (dim.typ === 'rot' ? mod(x, dim.n) : x);
  switch (r.regel) {
    case 'konstant': return r.v;
    case 'steg': return wrap(r.s0 + i * r.k);
    case 'vaxande': return wrap(r.s0 + i * r.d0 + (r.dd * i * (i - 1)) / 2);
    case 'cykel': return r.varden[i % r.varden.length];
    case 'vaxelvis': return i % 2 === 0 ? wrap(r.s0 + (i / 2) * r.ke) : wrap(r.s1 + ((i - 1) / 2) * r.ko);
    default: throw new Error(`okänd regel ${r.regel}`);
  }
}

/** Regeln växer utan att återkomma (ord med steg skilt från noll). */
const oandlig = (dim, r) =>
  dim.typ === 'ord' && ((r.regel === 'steg' && r.k !== 0) || r.regel === 'vaxande' || (r.regel === 'vaxelvis' && (r.ke !== 0 || r.ko !== 0)));

/**
 * Hela figurens period (FS2): minsta P så att figuren på i + P är figuren på
 * i för alla i. Oändlig när någon dimension räknar utan omstart.
 */
export function period(prim, regler) {
  const dims = PRIM[prim].dims;
  if (dims.some((d) => oandlig(d, regler[d.id]))) return Infinity;
  const L = 240;
  const nyckel = (i) => dims.map((d) => stable(sekvens(d, regler[d.id], i))).join('|');
  const k = Array.from({ length: L }, (_, i) => nyckel(i));
  for (let P = 1; P <= L / 2; P++) {
    let ok = true;
    for (let i = 0; i + P < L; i++) if (k[i] !== k[i + P]) { ok = false; break; }
    if (ok) return P;
  }
  return Infinity;
}

/** Dimensionernas värden på position 0 till 5 enligt reglerna. */
export function radVarden(prim, regler, antal = 6) {
  return Array.from({ length: antal }, (_, i) => Object.fromEntries(PRIM[prim].dims.map((d) => [d.id, sekvens(d, regler[d.id], i)])));
}

/**
 * Takten (FS3): par av rörliga dimensioner där läget i A bestämmer läget i B
 * och tvärtom över de fem visade (en bijektion). Returnerar paren.
 */
export function iTakt(rad) {
  const l = rad.slice(0, VISADE).map(lasCell);
  if (l.some((x) => !x)) return [];
  const dims = PRIM[l[0].prim].dims.map((d) => d.id);
  const rorliga = dims.filter((id) => new Set(l.map((x) => stable(x.v[id]))).size > 1);
  const ut = [];
  for (let i = 0; i < rorliga.length; i++) for (let j = i + 1; j < rorliga.length; j++) {
    const A = rorliga[i], B = rorliga[j];
    const ab = new Map(), ba = new Map();
    let bij = true;
    for (const x of l) {
      const a = stable(x.v[A]), b = stable(x.v[B]);
      if ((ab.has(a) && ab.get(a) !== b) || (ba.has(b) && ba.get(b) !== a)) bij = false;
      ab.set(a, b); ba.set(b, a);
    }
    if (bij) ut.push([A, B]);
  }
  return ut;
}

/**
 * Den enklaste hypotesen som passar en dimension (för regeltexten och
 * kontrollen att frågans `regler` är den läsning en kandidat gör först):
 * konstant, steg, cykel, vaxelvis, vaxande.
 */
const ORDNING = ['konstant', 'steg', 'cykel', 'udda-lika', 'vaxelvis', 'vaxande'];
export function enklaste(hyp) {
  return [...hyp].sort((a, b) => ORDNING.indexOf(a.regel) - ORDNING.indexOf(b.regel) || (a.info.p ?? 0) - (b.info.p ?? 0))[0] ?? null;
}

export { dimDef };
