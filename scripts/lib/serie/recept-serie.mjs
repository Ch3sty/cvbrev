// scripts/lib/serie/recept-serie.mjs
// =============================================================================
// Mallarna F1 till F7 (beställningen omgång 2, A3) med antal, p_prior och
// varianter. En variant ger en frågas regler ur slumpen: { prim, dims }, där
// varje dimension har en regel (tolka-serie.mjs, sekvens):
//   konstant { v }      steg { s0, k }      vaxande { s0, d0, dd }
//   cykel { varden }    vaxelvis { s0, ke, s1, ko }
//
// Primitiverna följer figurserier-spec.md 3.1 och 3.2, som beställningen
// lämnar det visuella till: räknestreck, ringar och 2×2 förekommer inte i
// serien. Där beställningens primitivlista nämner dem används specens
// primitiver i stället (F2: strålar, sektorhjul, 3×3-block, månghörning och
// duo med kantprickar; F5 och F6: duo i stället för 2×2; F7: duo med
// orbital och form i stället för grundform, som saknar en dimension som kan
// gå växelvis). Månghörningens vridning används inte (triangelns 45-graders-
// lägen är för lika); den räknar hörn.
//
// p_prior står per mall, aldrig per fråga. Validatorn felar utan p_prior
// eller utanför spannet (grund minst 0,60, expert högst 0,45).
// =============================================================================

const valj = (r, a) => a[Math.floor(r() * a.length)];
const r8 = (r) => Math.floor(r() * 8);
function blanda(r, arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

const konst = (v) => ({ regel: 'konstant', v });
const steg = (s0, k) => ({ regel: 'steg', s0, k });
const cykel = (varden) => ({ regel: 'cykel', varden });

const UDDA = [1, 3, 5, 7];
const KVART = [2, 6];
/** Växande steg: steget börjar på 1 eller 2 och växer med 1, medurs eller moturs. */
function vaxande(r) {
  const tecken = valj(r, [1, -1]);
  return { regel: 'vaxande', s0: r8(r), d0: tecken * valj(r, [1, 2]), dd: tecken };
}
/** Växelvis: 0, 2, 4 tar ke, 1, 3, 5 tar ko; olika steg, inget av dem noll. */
function vaxelvis(r, steg = [1, 2, 3, -1, -2, -3]) {
  const ke = valj(r, steg);
  const ko = valj(r, steg.filter((x) => x !== ke));
  return { regel: 'vaxelvis', s0: r8(r), ke, s1: r8(r), ko };
}
/** Antal ±1 genom sex positioner inom [min, max]. */
function antalSteg(r, min, max) {
  const upp = r() < 0.5;
  const s0 = upp ? min + Math.floor(r() * (max - 5 - min + 1)) : max - Math.floor(r() * (max - 5 - min + 1));
  return steg(s0, upp ? 1 : -1);
}
/** En cykel med p olika värden ur listan. */
const cykelOlika = (r, L, p) => cykel(blanda(r, L).slice(0, p));
/** En cykel med period p över två värden, som inte är ren växling (p 3: x, y, y; p 4: x, x, y, y). */
function cykelTva(r, L) {
  const [x, y] = blanda(r, L);
  return valj(r, [cykel([x, y, y]), cykel([x, x, y, y])]);
}

const PIL_KONST = (r) => ({ langd: konst(valj(r, ['long', 'short'])), spets: konst(valj(r, ['open', 'filled'])) });
const KARNA_KONST = (r, k) =>
  k === 'pil' ? { kvinkel: konst(r8(r)) } : k === 'form' ? { kform: konst(valj(r, ['circle', 'square', 'diamond'])), kfyll: konst(valj(r, ['none', 'black'])) } : { ksymbol: konst(valj(r, ['plus', 'minus', 'cross', 'dot', 'ring'])) };

// =============================================================================
// Mallarna
// =============================================================================
export const MALLAR = [
  {
    id: 'F1', namn: 'Ett steg', niva: 'grund', antal: 16, p_prior: 0.78, difficulty: 1,
    varianter: [
      { namn: 'pil-steg', family: 'vridning', regler: (r) => ({ prim: 'pil', dims: { vinkel: steg(r8(r), valj(r, UDDA)), ...PIL_KONST(r) } }) },
      { namn: 'orbital-steg', family: 'vandring', regler: (r) => ({ prim: 'orbital', dims: { satellit: steg(r8(r), valj(r, UDDA)), mitt: konst(valj(r, ['filled', 'open'])) } }) },
      { namn: 'stralar-steg', family: 'vridning', regler: (r) => ({ prim: 'stralar', dims: { start: steg(r8(r), valj(r, UDDA)), antal: konst(valj(r, [1, 2, 3])) } }) },
      { namn: 'sektor-steg', family: 'vridning', regler: (r) => ({ prim: 'sektor', dims: { start: steg(r8(r), valj(r, UDDA)), antal: konst(valj(r, [1, 2, 3, 4])) } }) },
      { namn: 'block-steg', family: 'vandring', regler: (r) => ({ prim: 'block', dims: { start: steg(r8(r), valj(r, UDDA)), antal: konst(valj(r, [1, 2, 3])) } }) },
    ],
  },
  {
    id: 'F2', namn: 'Antal', niva: 'grund', antal: 12, p_prior: 0.72, difficulty: 1,
    varianter: [
      { namn: 'stralar-antal', family: 'antal', regler: (r) => ({ prim: 'stralar', dims: { start: konst(r8(r)), antal: antalSteg(r, 1, 7) } }) },
      { namn: 'sektor-antal', family: 'antal', regler: (r) => ({ prim: 'sektor', dims: { start: konst(r8(r)), antal: antalSteg(r, 1, 7) } }) },
      { namn: 'block-antal', family: 'antal', regler: (r) => ({ prim: 'block', dims: { start: konst(r8(r)), antal: antalSteg(r, 1, 7) } }) },
      // Månghörningen (3 till 8 hörn) och duons kantprickar (1 till 6) har
      // exakt sex värden: varje distraktor som bara bryter antalet blir då en
      // kopia av en visad figur, och kravet "minst en bryter bara regeln" går
      // inte att uppfylla. De står därför inte i F2.
    ],
  },
  {
    id: 'F3', namn: 'Växande steg', niva: 'grund', antal: 8, p_prior: 0.65, difficulty: 2,
    varianter: [
      { namn: 'pil-vaxande', family: 'vaxande', regler: (r) => ({ prim: 'pil', dims: { vinkel: vaxande(r), ...PIL_KONST(r) } }) },
      { namn: 'orbital-vaxande', family: 'vaxande', regler: (r) => ({ prim: 'orbital', dims: { satellit: vaxande(r), mitt: konst(valj(r, ['filled', 'open'])) } }) },
      { namn: 'stralar-vaxande', family: 'vaxande', regler: (r) => ({ prim: 'stralar', dims: { start: vaxande(r), antal: konst(valj(r, [2, 3])) } }) },
    ],
  },
  {
    id: 'F4', namn: 'Två regler', niva: 'avancerad', antal: 20, p_prior: 0.55, difficulty: 2,
    varianter: [
      { namn: 'pil-steg-langd', family: 'vridning', regler: (r) => ({ prim: 'pil', dims: { vinkel: steg(r8(r), valj(r, UDDA)), langd: cykelOlika(r, ['long', 'short'], 2), spets: konst(valj(r, ['open', 'filled'])) } }) },
      { namn: 'pil-steg-spets', family: 'vridning', regler: (r) => ({ prim: 'pil', dims: { vinkel: steg(r8(r), valj(r, UDDA)), langd: konst(valj(r, ['long', 'short'])), spets: cykelOlika(r, ['open', 'filled'], 2) } }) },
      { namn: 'orbital-steg-mitt', family: 'vandring', regler: (r) => ({ prim: 'orbital', dims: { satellit: steg(r8(r), valj(r, UDDA)), mitt: cykelOlika(r, ['filled', 'open'], 2) } }) },
      { namn: 'stralar-kvart-antal', family: 'antal', regler: (r) => ({ prim: 'stralar', dims: { start: steg(r8(r), valj(r, KVART)), antal: antalSteg(r, 1, 7) } }) },
      { namn: 'sektor-kvart-antal', family: 'antal', regler: (r) => ({ prim: 'sektor', dims: { start: steg(r8(r), valj(r, KVART)), antal: antalSteg(r, 1, 7) } }) },
      { namn: 'sektor-steg-antalcykel', family: 'antal', regler: (r) => ({ prim: 'sektor', dims: { start: steg(r8(r), valj(r, UDDA)), antal: cykelOlika(r, [1, 2, 3, 4], valj(r, [2, 3])) } }) },
      {
        namn: 'grundform-form-fyllning', family: 'fyllning',
        regler: (r) => {
          const p = valj(r, [[3, 2], [4, 3]]);
          return { prim: 'grundform', dims: { bas: cykelOlika(r, ['circle', 'square', 'triangle', 'diamond'], p[0]), symbol: konst(valj(r, ['plus', 'minus', 'dot', 'ring', 'cross'])), fyllning: cykelOlika(r, ['none', 'gray', 'black'], p[1]) } };
        },
      },
      { namn: 'duo-kant-pil', family: 'flera', regler: (r) => ({ prim: 'duo-kant-pil', dims: { ylage: steg(r8(r), valj(r, UDDA)), yantal: konst(1), kvinkel: steg(r8(r), valj(r, KVART)) } }) },
      { namn: 'duo-orbital-form', family: 'flera', regler: (r) => ({ prim: 'duo-orbital-form', dims: { ylage: steg(r8(r), valj(r, UDDA)), kform: cykelOlika(r, ['circle', 'square', 'diamond'], 3), kfyll: konst(valj(r, ['none', 'black'])) } }) },
      { namn: 'pil-vaxande-spets', family: 'vaxande', regler: (r) => ({ prim: 'pil', dims: { vinkel: vaxande(r), langd: konst(valj(r, ['long', 'short'])), spets: cykelOlika(r, ['open', 'filled'], 2) } }) },
      { namn: 'orbital-vaxande-mitt', family: 'vaxande', regler: (r) => ({ prim: 'orbital', dims: { satellit: vaxande(r), mitt: cykelOlika(r, ['filled', 'open'], 2) } }) },
    ],
  },
  {
    id: 'F5', namn: 'Växelvis', niva: 'avancerad', antal: 10, p_prior: 0.5, difficulty: 3,
    varianter: [
      { namn: 'pil-vaxelvis', family: 'vaxelvis', regler: (r) => ({ prim: 'pil', dims: { vinkel: vaxelvis(r), ...PIL_KONST(r) } }) },
      { namn: 'orbital-vaxelvis', family: 'vaxelvis', regler: (r) => ({ prim: 'orbital', dims: { satellit: vaxelvis(r), mitt: konst(valj(r, ['filled', 'open'])) } }) },
      { namn: 'duo-kant-pil-vaxelvis', family: 'vaxelvis', regler: (r) => ({ prim: 'duo-kant-pil', dims: { ylage: vaxelvis(r), yantal: konst(1), kvinkel: valj(r, [konst(r8(r)), steg(r8(r), valj(r, KVART))]) } }) },
      { namn: 'sektor-vaxelvis', family: 'vaxelvis', regler: (r) => ({ prim: 'sektor', dims: { start: vaxelvis(r), antal: konst(valj(r, [2, 3])) } }) },
    ],
  },
  {
    id: 'F6', namn: 'Tre regler', niva: 'expert', antal: 20, p_prior: 0.4, difficulty: 4,
    varianter: [
      {
        namn: 'pil-tre', family: 'vridning',
        regler: (r) => {
          const [a, b] = valj(r, [['langd', 'spets'], ['spets', 'langd']]);
          const L = { langd: ['long', 'short'], spets: ['open', 'filled'] };
          return { prim: 'pil', dims: { vinkel: valj(r, [vaxande(r), vaxelvis(r)]), [a]: cykelOlika(r, L[a], 2), [b]: cykelTva(r, L[b]) } };
        },
      },
      { namn: 'pil-vaxande-tre', family: 'vaxande', regler: (r) => ({ prim: 'pil', dims: { vinkel: vaxande(r), langd: cykelOlika(r, ['long', 'short'], 2), spets: cykelTva(r, ['open', 'filled']) } }) },
      { namn: 'duo-kant-pil-tre', family: 'vandring', regler: (r) => ({ prim: 'duo-kant-pil', dims: { ylage: valj(r, [vaxande(r), vaxelvis(r)]), yantal: cykelOlika(r, [1, 2, 3], valj(r, [2, 3])), kvinkel: steg(r8(r), valj(r, KVART)) } }) },
      { namn: 'duo-orbital-form-tre', family: 'fyllning', regler: (r) => ({ prim: 'duo-orbital-form', dims: { ylage: valj(r, [vaxande(r), vaxelvis(r)]), kform: cykelOlika(r, ['circle', 'square', 'diamond'], 3), kfyll: cykelOlika(r, ['none', 'black'], 2) } }) },
      { namn: 'duo-kant-symbol-tre', family: 'flera', regler: (r) => ({ prim: 'duo-kant-symbol', dims: { ylage: valj(r, [vaxande(r), vaxelvis(r)]), yantal: cykelOlika(r, [1, 2], 2), ksymbol: cykelOlika(r, ['plus', 'minus', 'cross', 'dot', 'ring'], 3) } }) },
      { namn: 'duo-kant-antal-tre', family: 'antal', regler: (r) => ({ prim: 'duo-kant-pil', dims: { ylage: cykelOlika(r, [0, 1, 2, 3, 4, 5, 6, 7], 3), yantal: antalSteg(r, 1, 6), kvinkel: vaxelvis(r, [4, 1, 3, -1, -3]) } }) },
    ],
  },
  {
    id: 'F7', namn: 'Två serier i otakt', niva: 'expert', antal: 10, p_prior: 0.35, difficulty: 4,
    varianter: [
      { namn: 'pil-vaxelvis-tretakt', family: 'vaxelvis', regler: (r) => { const [a, b] = valj(r, [['langd', 'spets'], ['spets', 'langd']]); const L = { langd: ['long', 'short'], spets: ['open', 'filled'] }; return { prim: 'pil', dims: { vinkel: vaxelvis(r), [a]: cykel(((x, y) => [x, y, y])(...blanda(r, L[a]))), [b]: konst(valj(r, L[b])) } }; } },
      { namn: 'orbital-vaxelvis-tretakt', family: 'vaxelvis', regler: (r) => ({ prim: 'orbital', dims: { satellit: vaxelvis(r), mitt: cykel(((x, y) => [x, y, y])(...blanda(r, ['filled', 'open']))) } }) },
      { namn: 'duo-orbital-form-tretakt', family: 'vaxelvis', regler: (r) => ({ prim: 'duo-orbital-form', dims: { ylage: vaxelvis(r), kform: cykelOlika(r, ['circle', 'square', 'diamond'], 3), kfyll: konst(valj(r, ['none', 'black'])) } }) },
      { namn: 'duo-kant-symbol-tretakt', family: 'vaxelvis', regler: (r) => ({ prim: 'duo-kant-symbol', dims: { ylage: vaxelvis(r), yantal: konst(1), ksymbol: cykelOlika(r, ['plus', 'minus', 'cross', 'dot', 'ring'], 3) } }) },
    ],
  },
];

/** Spannet för p_prior per nivå (A3). */
export const P_PRIOR_SPANN = { grund: [0.6, 0.95], avancerad: [0.05, 0.95], expert: [0.05, 0.45] };

/** Familjerna med egna namn (A3): alla sju på avancerad och expert, minst fyra på grund. */
export const FAMILJER = ['vridning', 'vandring', 'antal', 'fyllning', 'vaxande', 'vaxelvis', 'flera'];

/** Den avsedda regeltypen per variant och dimension som måste vara den enklaste läsningen. */
export const NIVA_KOD = { grund: 'g', avancerad: 'a', expert: 'e' };
