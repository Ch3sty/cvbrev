// scripts/lib/deduktiv/losare.mjs
// =============================================================================
// Den uttömmande lösaren för schemapusslen (D2, D3). En tilldelning är en
// lista pos där pos[i] är platsen (1 till n) för element i; varje plats har
// exakt ett element. Med högst sex element är det högst 720 tilldelningar,
// så lösaren prövar alla.
//
// Villkorsspråket (JSON):
//   { typ: 'plats', a, k }              a står på plats k
//   { typ: 'inte_plats', a, k }         a står inte på plats k
//   { typ: 'granne', a, b }             a och b står bredvid varandra
//   { typ: 'inte_granne', a, b }        a och b står inte bredvid varandra
//   { typ: 'vanster_om', a, b }         a står någonstans till vänster om b
//   { typ: 'direkt_vanster_om', a, b }  a står direkt till vänster om b
//   { typ: 'ordning', a, b }            a går före b (turordningen)
//   { typ: 'samma_grupp', a, b }        a och b hör till samma grupp av platser
// a, b är elementens index, k platsen (1-indexerad).
// =============================================================================

/** Elementen ett villkor handlar om. */
export function elementI(c) {
  return c.b != null ? [c.a, c.b] : [c.a];
}

/** Är villkoret uppfyllt i tilldelningen? `grupper` behövs bara för samma_grupp. */
export function uppfyllt(c, pos, grupper) {
  const pa = pos[c.a];
  const pb = c.b != null ? pos[c.b] : null;
  switch (c.typ) {
    case 'plats':
      return pa === c.k;
    case 'inte_plats':
      return pa !== c.k;
    case 'granne':
      return Math.abs(pa - pb) === 1;
    case 'inte_granne':
      return Math.abs(pa - pb) !== 1;
    case 'vanster_om':
    case 'ordning':
      return pa < pb;
    case 'direkt_vanster_om':
      return pb - pa === 1;
    case 'samma_grupp': {
      if (!grupper) throw new Error('samma_grupp utan grupper');
      const g = (p) => grupper.findIndex((x) => x.includes(p));
      return g(pa) === g(pb);
    }
    default:
      throw new Error(`okänt villkor ${c.typ}`);
  }
}

/** Alla permutationer av 1..n som listor pos (deterministisk ordning). */
const PERM_CACHE = new Map();
export function allaTilldelningar(n) {
  if (PERM_CACHE.has(n)) return PERM_CACHE.get(n);
  const ut = [];
  const pos = new Array(n);
  const tagen = new Array(n + 1).fill(false);
  const rek = (i) => {
    if (i === n) {
      ut.push(pos.slice());
      return;
    }
    for (let p = 1; p <= n; p++) {
      if (tagen[p]) continue;
      tagen[p] = true;
      pos[i] = p;
      rek(i + 1);
      tagen[p] = false;
    }
  };
  rek(0);
  PERM_CACHE.set(n, ut);
  return ut;
}

/** Alla lösningar: tilldelningar som uppfyller alla villkor. */
export function losningar(n, villkor, grupper) {
  return allaTilldelningar(n).filter((pos) => villkor.every((c) => uppfyllt(c, pos, grupper)));
}

/** Index för de villkor tilldelningen bryter. */
export function brutna(pos, villkor, grupper) {
  const ut = [];
  villkor.forEach((c, i) => {
    if (!uppfyllt(c, pos, grupper)) ut.push(i);
  });
  return ut;
}

/** Schemat som rad: elementets index per plats (plats 1 först). */
export function schemaRad(pos) {
  const rad = new Array(pos.length);
  pos.forEach((p, i) => (rad[p - 1] = i));
  return rad;
}

/** Två villkor är samma om typ, element och plats är lika (granne och inte_granne är symmetriska). */
export function villkorNyckel(c) {
  const sym = c.typ === 'granne' || c.typ === 'inte_granne' || c.typ === 'samma_grupp';
  const [x, y] = sym && c.b != null ? [Math.min(c.a, c.b), Math.max(c.a, c.b)] : [c.a, c.b];
  return `${c.typ}:${x}:${y ?? ''}:${c.k ?? ''}`;
}
