// scripts/lib/deduktiv/d4.mjs
// =============================================================================
// D4, nya familjer (frågebanken 2026-11-19, omgång 3, bankversion 5). Fem
// familjer med egna lösningsgångar, inga varianter av turordning, utesluten
// plats eller samma grupp:
//
//   om_sa     villkorskedjor med om och så, kontraposition, fallanalys
//   kvantor   syllogismer med alla, några och ingen där en fel slutsats lockar
//   sanning   sanningssägare och lögnare
//   tabell    tabellpussel, person gånger två egenskaper
//   kan_inte  schemapussel med flera lösningar: vad kan inte vara sant?
//
// Alla frågeformer är påståenden som prövas mot alla modeller av villkoren:
//   maste        exakt ett alternativ gäller i varje modell (facit),
//   kan_inte     exakt ett alternativ gäller i ingen modell (facit),
//   foljer_inte  exakt ett alternativ gäller inte i varje modell (facit).
// "Vem bor i Umeå?" och "Exakt vilka är lögnare?" är maste-frågor där
// alternativen visas som namn.
//
// Spärrarna (validate-deduktiv.mjs, gen-deduktiv-omg3.mjs):
//   E1 exakt ett svar, och det är facit; rollerna stämmer,
//   E2 inget villkor överflödigt: tas ett bort håller inte facit längre,
//   E3 facit följer inte ur ett enda villkor och står inte bland villkoren,
//   E4 inget alternativ medför ett annat utan villkoren (som DD7),
//   E5 facit är inte ensamt om sin form (som DD9),
//   E6 lösningstexten är lösarens (inte kvantor, som skrivs för hand),
//   E7 texten är mallens (inte kvantor).
// Ren logik och text; ingen fil läses här.
// =============================================================================

import { allaTilldelningar, losningar, uppfyllt } from './losare.mjs';
import { TEMAN, villkorText, elementForm } from './tema.mjs';
import { stabilStatus } from './mangdmodell.mjs';

export const D4_FAMILJER = ['om_sa', 'kvantor', 'sanning', 'tabell', 'kan_inte'];
export const D4_P_PRIOR = { grund: 0.7, avancerad: 0.55, expert: 0.4 };
export const D4_DIFFICULTY = { grund: 1, avancerad: 2, expert: 3 };

export const ETIKETT4 = {
  nodvandig: 'Måste gälla.',
  obestamd: 'Kan stämma, men villkoren kräver det inte.',
  omojlig: 'Strider mot villkoren.',
};

export const FRAGA4 = {
  maste: 'Vad måste gälla?',
  kan_inte: 'Vilket kan inte vara sant?',
  foljer_inte: 'Vilken slutsats följer inte av villkoren?',
  vilka: 'Exakt vilka av dem är lögnare?',
};

export const stor = (s) => s[0].toUpperCase() + s.slice(1);
/** Liten bokstav först, men inte i ett namn (bara ord som Den, Det, Exakt, Minst, Ingen, Varken, Alla). */
const liten = (s) => (/^(Den|Det|Exakt|Minst|Ingen|Varken|Alla|Om) /.test(s) ? s[0].toLowerCase() + s.slice(1) : s);
const utanPunkt = (s) => s.replace(/\.$/, '');

/** "A, B och C". */
export function lista(xs) {
  if (xs.length === 1) return xs[0];
  return `${xs.slice(0, -1).join(', ')} och ${xs[xs.length - 1]}`;
}

/* ================================== om_sa ================================== */
// Atomer: { s, v, r } (subjekt, finit verb, resten). Formler:
//   { typ: 'lit', a, neg }            atomen gäller (neg: gäller inte)
//   { typ: 'om', p: {a, neg}, q: {a, neg} }
//   { typ: 'och', p, q }              båda literalerna gäller

export function atomFormer(x) {
  const r = x.r ? ` ${x.r}` : '';
  return {
    huvud: `${stor(x.s)} ${x.v}${r}`,
    huvudInte: `${stor(x.s)} ${x.v} inte${r}`,
    bi: `${x.s} ${x.v}${r}`,
    biInte: `${x.s} inte ${x.v}${r}`,
    inv: `${x.v} ${x.s}${r}`,
    invInte: `${x.v} ${x.s} inte${r}`,
  };
}

const H = (f, l) => (l.neg ? atomFormer(f.atomer[l.a]).huvudInte : atomFormer(f.atomer[l.a]).huvud);
const BI = (f, l) => (l.neg ? atomFormer(f.atomer[l.a]).biInte : atomFormer(f.atomer[l.a]).bi);
const INV = (f, l) => (l.neg ? atomFormer(f.atomer[l.a]).invInte : atomFormer(f.atomer[l.a]).inv);
/** Huvudsats med subjektet som det står (namn med stor bokstav, annars liten), efter "och". */
const HL = (f, l) => {
  const x = f.atomer[l.a];
  const r = x.r ? ` ${x.r}` : '';
  return l.neg ? `${x.s} ${x.v} inte${r}` : `${x.s} ${x.v}${r}`;
};
const neg = (l) => ({ a: l.a, neg: !l.neg });
const litLika = (x, y) => x.a === y.a && !!x.neg === !!y.neg;

export function omsaText(f, x) {
  if (x.typ === 'lit') return `${H(f, x)}.`;
  if (x.typ === 'om') return `Om ${BI(f, x.p)}, ${INV(f, x.q)}.`;
  if (x.typ === 'och') return `${H(f, x.p)} och ${HL(f, x.q)}.`;
  throw new Error(`okänd formel ${x.typ}`);
}

const litVarde = (l, m) => (((m >> l.a) & 1) === 1) !== !!l.neg;
export function omsaGaller(x, m) {
  if (x.typ === 'lit') return litVarde(x, m);
  if (x.typ === 'om') return !litVarde(x.p, m) || litVarde(x.q, m);
  if (x.typ === 'och') return litVarde(x.p, m) && litVarde(x.q, m);
  throw new Error(`okänd formel ${x.typ}`);
}

/* ================================= sanning ================================= */
// Personer 0..n-1; modellen är en bitmask där bit i betyder att i är lögnare.
// Påståenden (det någon säger, eller ett alternativ):
//   { typ: 'logn', x } | { typ: 'sann', x } | { typ: 'bada_logn', x, y } |
//   { typ: 'bada_sann', x, y } | { typ: 'minst_en_logn', x, y } |
//   { typ: 'exakt_en_logn', x, y } | { typ: 'antal_logn', k } |
//   { typ: 'minst_logn', k } | { typ: 'mangd', s: [index] } (exakt de är lögnare)
// Villkor: { talare, sager: Påstående }.

const arL = (m, i) => ((m >> i) & 1) === 1;
const antalL = (m, n) => Array.from({ length: n }, (_, i) => arL(m, i)).filter(Boolean).length;

export function sanningGaller(p, m, n) {
  switch (p.typ) {
    case 'logn': return arL(m, p.x);
    case 'sann': return !arL(m, p.x);
    case 'bada_logn': return arL(m, p.x) && arL(m, p.y);
    case 'bada_sann': return !arL(m, p.x) && !arL(m, p.y);
    case 'minst_en_logn': return arL(m, p.x) || arL(m, p.y);
    case 'exakt_en_logn': return arL(m, p.x) !== arL(m, p.y);
    case 'antal_logn': return antalL(m, n) === p.k;
    case 'minst_logn': return antalL(m, n) >= p.k;
    case 'mangd': return Array.from({ length: n }, (_, i) => arL(m, i) === p.s.includes(i)).every(Boolean);
    default: throw new Error(`okänt påstående ${p.typ}`);
  }
}
/** Villkoret "talare säger p" gäller när påståendet är sant precis då talaren är sanningssägare. */
export const sanningVillkor = (c, m, n) => sanningGaller(c.sager, m, n) === !arL(m, c.talare);

const TAL = { 0: 'Ingen', 1: 'En', 2: 'Två', 3: 'Tre', 4: 'Fyra' };
const TAL_LITEN = { 1: 'en', 2: 'två', 3: 'tre', 4: 'fyra' };

/** Påståendet som det låter i talarens mun (talare: index eller null för ett alternativ). */
export function sanningPastaende(namn, p, talare) {
  const n = namn.length;
  const subj = (i) => (i === talare ? 'jag' : namn[i]);
  const obj = (i) => (i === talare ? 'mig' : namn[i]);
  // "Bo och jag" med jag sist.
  const par = (x, y, f) => (x === talare ? `${f(y)} och ${f(x)}` : `${f(x)} och ${f(y)}`);
  const ar = (i) => (i === talare ? 'är' : 'är');
  switch (p.typ) {
    case 'logn': return `${stor(subj(p.x))} ${ar(p.x)} lögnare.`;
    case 'sann': return `${stor(subj(p.x))} ${ar(p.x)} sanningssägare.`;
    case 'bada_logn': return `${stor(par(p.x, p.y, subj))} är båda lögnare.`;
    case 'bada_sann': return `${stor(par(p.x, p.y, subj))} är båda sanningssägare.`;
    case 'minst_en_logn': return `Minst en av ${par(p.x, p.y, obj)} är lögnare.`;
    case 'exakt_en_logn': return `Exakt en av ${par(p.x, p.y, obj)} är lögnare.`;
    case 'antal_logn':
      if (talare == null) return p.k === 0 ? 'Ingen av dem är lögnare.' : `Exakt ${TAL_LITEN[p.k]} av dem är lögnare.`;
      return p.k === 0 ? `Ingen av oss ${TAL_LITEN[n]} är lögnare.` : `Exakt ${TAL_LITEN[p.k]} av oss ${TAL_LITEN[n]} är lögnare.`;
    case 'minst_logn':
      return talare == null ? `Minst ${TAL_LITEN[p.k]} av dem är lögnare.` : `Minst ${TAL_LITEN[p.k]} av oss ${TAL_LITEN[n]} är lögnare.`;
    case 'mangd':
      if (!p.s.length) return 'Ingen av dem';
      if (p.s.length === n) return `Alla ${TAL_LITEN[n]}`;
      return lista(p.s.map((i) => namn[i]));
    default: throw new Error(`okänt påstående ${p.typ}`);
  }
}

export function sanningVillkorText(namn, c) {
  return `${namn[c.talare]} säger: ”${sanningPastaende(namn, c.sager, c.talare)}”`;
}

export function sanningIntro(namn) {
  const n = namn.length;
  return `${stor(TAL_LITEN[n])} kollegor, ${lista(namn)}, säger en sak var. Var och en är antingen sanningssägare eller lögnare. En sanningssägare säger alltid något sant, och en lögnare säger alltid något falskt.`;
}

/* ================================== tabell ================================= */
// Två kategorier (A och B) med n värden var; modellen { A: perm, B: perm } där
// A[p] är personens värde i A. Villkor och alternativ:
//   { typ: 'har', p, kat, v } | { typ: 'inte', p, kat, v } |
//   { typ: 'varken', p, kat, v, w } | { typ: 'ingen_av', p, q, kat, v } |
//   { typ: 'lank', a, b, fran } (den med A=a har B=b; fran 'A' eller 'B' styr ordföljden) |
//   { typ: 'inte_lank', a, b, fran }

export function tabellGaller(c, m) {
  switch (c.typ) {
    case 'har': return m[c.kat][c.p] === c.v;
    case 'inte': return m[c.kat][c.p] !== c.v;
    case 'varken': return m[c.kat][c.p] !== c.v && m[c.kat][c.p] !== c.w;
    case 'ingen_av': return m[c.kat][c.p] !== c.v && m[c.kat][c.q] !== c.v;
    case 'lank': {
      const p = m.A.indexOf(c.a);
      return m.B[p] === c.b;
    }
    case 'inte_lank': {
      const p = m.A.indexOf(c.a);
      return m.B[p] !== c.b;
    }
    default: throw new Error(`okänt tabellvillkor ${c.typ}`);
  }
}

/** Bestämd form av färgerna för bilarna. */
const BIL = { röd: 'röda', blå: 'blå', grön: 'gröna', vit: 'vita', svart: 'svarta', gul: 'gula' };

/**
 * Kategoriernas fraser. Värdena står som de skrivs i texten. pos och neg är
 * predikatet efter namnet ("bor i Lund"), inf efter "kan", alltsa med
 * "alltså" efter det finita verbet, intro efter "Fyra kollegor, ...,".
 */
export const KATEGORI = {
  roll: {
    pos: (v) => `är ${v}`, neg: (v) => `är inte ${v}`, varken: (v, w) => `är varken ${v} eller ${w}`,
    alltsa: (v) => `är alltså ${v}`, inf: (v) => `vara ${v}`, intro: (V) => `har var sin roll: ${lista(V)}`,
  },
  stad: {
    pos: (v) => `bor i ${v}`, neg: (v) => `bor inte i ${v}`, varken: (v, w) => `bor varken i ${v} eller i ${w}`,
    alltsa: (v) => `bor alltså i ${v}`, inf: (v) => `bo i ${v}`, intro: (V) => `bor i var sin stad: ${lista(V)}`,
  },
  kurs: {
    pos: (v) => `går kursen i ${v}`, neg: (v) => `går inte kursen i ${v}`, varken: (v, w) => `går varken kursen i ${v} eller kursen i ${w}`,
    alltsa: (v) => `går alltså kursen i ${v}`, inf: (v) => `gå kursen i ${v}`, intro: (V) => `går var sin kurs: ${lista(V)}`,
  },
  dag: {
    pos: (v) => `är ledig på ${v}`, neg: (v) => `är inte ledig på ${v}`, varken: (v, w) => `är varken ledig på ${v} eller på ${w}`,
    alltsa: (v) => `är alltså ledig på ${v}`, inf: (v) => `vara ledig på ${v}`, intro: (V) => `är lediga var sin dag: ${lista(V)}`,
  },
  bil: {
    pos: (v) => `kör den ${BIL[v]} bilen`, neg: (v) => `kör inte den ${BIL[v]} bilen`, varken: (v, w) => `kör varken den ${BIL[v]} eller den ${BIL[w]} bilen`,
    alltsa: (v) => `kör alltså den ${BIL[v]} bilen`, inf: (v) => `köra den ${BIL[v]} bilen`, intro: (V) => `kör var sin tjänstebil, och bilarna är ${lista(V)}`,
  },
  avd: {
    pos: (v) => `arbetar ${v}`, neg: (v) => `arbetar inte ${v}`, varken: (v, w) => `arbetar varken ${v} eller ${w}`,
    alltsa: (v) => `arbetar alltså ${v}`, inf: (v) => `arbeta ${v}`, intro: (V) => `arbetar på var sitt ställe: ${lista(V.map((v) => v.replace(/^(på|i) /, '')))}`,
  },
  lunch: {
    pos: (v) => `äter lunch klockan ${v}`, neg: (v) => `äter inte lunch klockan ${v}`, varken: (v, w) => `äter lunch varken klockan ${v} eller klockan ${w}`,
    alltsa: (v) => `äter alltså lunch klockan ${v}`, inf: (v) => `äta lunch klockan ${v}`, intro: (V) => `äter lunch vid var sin tid: klockan ${lista(V)}`,
  },
};

/** Kategorin k ('A' eller 'B') i uppgiften: mallen med värdenas text. */
export function katF(f, k) {
  const { mall, varden } = f.kategorier[k];
  const M = KATEGORI[mall];
  const t = (v) => varden[v];
  return {
    pos: (v) => M.pos(t(v)), neg: (v) => M.neg(t(v)), varken: (v, w) => M.varken(t(v), t(w)),
    alltsa: (v) => M.alltsa(t(v)), inf: (v) => M.inf(t(v)), intro: () => M.intro(varden),
  };
}

const ANTAL_STOR = { 3: 'Tre', 4: 'Fyra', 5: 'Fem', 6: 'Sex' };
export function tabellIntro(f) {
  return `${ANTAL_STOR[f.namn.length]} kollegor, ${lista(f.namn)}, ${katF(f, 'A').intro()}. De ${katF(f, 'B').intro()}.`;
}

export function tabellText(f, c) {
  const P = f.namn;
  const K = (k) => katF(f, k);
  switch (c.typ) {
    case 'har': return `${P[c.p]} ${K(c.kat).pos(c.v)}.`;
    case 'inte': return `${P[c.p]} ${K(c.kat).neg(c.v)}.`;
    case 'varken': return `${P[c.p]} ${K(c.kat).varken(c.v, c.w)}.`;
    case 'ingen_av': return `Varken ${P[c.p]} eller ${P[c.q]} ${K(c.kat).pos(c.v)}.`;
    case 'lank': return c.fran === 'B' ? `Den som ${K('B').pos(c.b)} ${K('A').pos(c.a)}.` : `Den som ${K('A').pos(c.a)} ${K('B').pos(c.b)}.`;
    case 'inte_lank': return c.fran === 'B' ? `Den som ${K('B').pos(c.b)} ${K('A').neg(c.a)}.` : `Den som ${K('A').pos(c.a)} ${K('B').neg(c.b)}.`;
    default: throw new Error(`okänt tabellvillkor ${c.typ}`);
  }
}

/* ================================ kan_inte ================================= */
// formell: { tema, namn, villkor: Villkor[] } som D2 (losare.mjs), alternativ som påståenden.

const grupperFor = (tema) => TEMAN[tema]?.grupper ?? null;

/* ============================ modeller och status ========================== */

/** Alla modeller (utan villkor) för slaget. */
function universum(f) {
  switch (f.slag) {
    case 'om_sa': return Array.from({ length: 1 << f.atomer.length }, (_, m) => m);
    case 'sanning': return Array.from({ length: 1 << f.namn.length }, (_, m) => m);
    case 'tabell': {
      const P = allaTilldelningar(f.namn.length).map((p) => p.map((x) => x - 1));
      const ut = [];
      for (const A of P) for (const B of P) ut.push({ A, B });
      return ut;
    }
    case 'kan_inte': return allaTilldelningar(f.namn.length);
    default: throw new Error(`slaget ${f.slag} har inget universum`);
  }
}
const UNIV = new WeakMap();
function univ(f) {
  if (!UNIV.has(f)) UNIV.set(f, universum(f));
  return UNIV.get(f);
}

/** Gäller påståendet/villkoret x i modellen m? */
export function galler(f, x, m) {
  switch (f.slag) {
    case 'om_sa': return omsaGaller(x, m);
    case 'sanning': return x.talare != null ? sanningVillkor(x, m, f.namn.length) : sanningGaller(x, m, f.namn.length);
    case 'tabell': return tabellGaller(x, m);
    case 'kan_inte': return uppfyllt(x, m, grupperFor(f.tema));
    default: throw new Error(`okänt slag ${f.slag}`);
  }
}

/** Modellerna som uppfyller villkoren med index i `med` (alla när null). */
export function modeller(f, med = null) {
  const V = med == null ? f.villkor : med.map((i) => f.villkor[i]);
  return univ(f).filter((m) => V.every((c) => galler(f, c, m)));
}

/** Status för påståendet: 'nodvandig' | 'omojlig' | 'obestamd' | 'motsagelse' | null (kvantor: läsningarna skiljer sig). */
export function status(f, x, med = null) {
  if (f.slag === 'kvantor') {
    const prem = (med == null ? f.villkor : med.map((i) => f.villkor[i])).flat();
    return stabilStatus(f.termer, f.individer ?? [], prem, x);
  }
  const M = modeller(f, med);
  if (!M.length) return 'motsagelse';
  const s = M.filter((m) => galler(f, x, m)).length;
  return s === M.length ? 'nodvandig' : s === 0 ? 'omojlig' : 'obestamd';
}

/** Är alternativ i rätt svar givet statusen? */
function arSvar(form, s) {
  if (form === 'maste' || form === 'vilka' || form === 'vem') return s === 'nodvandig';
  if (form === 'kan_inte') return s === 'omojlig';
  if (form === 'foljer_inte') return s !== 'nodvandig';
  throw new Error(`okänd frågeform ${form}`);
}

/** Indexen för alternativen som är svar med villkoren `med`. Null när någon status saknas. */
export function svarMed(f, med = null) {
  const st = f.alternativ.map((x) => status(f, x, med));
  if (st.some((s) => s == null || s === 'motsagelse')) return null;
  return st.map((s, i) => (arSvar(f.fraga.form, s) ? i : -1)).filter((i) => i >= 0);
}

/* ================================= spärrarna =============================== */

export function e1(q) {
  const f = q.formell;
  const fel = [];
  const st = f.alternativ.map((x) => status(f, x));
  st.forEach((s, i) => {
    if (s == null) fel.push(`E1: alternativ ${i + 1} beror på om det finns några alls`);
    if (s === 'motsagelse') fel.push('E1: villkoren motsäger varandra');
  });
  if (fel.length) return fel;
  const svar = st.map((s, i) => (arSvar(f.fraga.form, s) ? i : -1)).filter((i) => i >= 0);
  if (svar.length !== 1) fel.push(`E1: ${svar.length} alternativ är svar, ska vara exakt ett`);
  else if (svar[0] !== q.correctAnswer) fel.push(`E1: alternativ ${svar[0] + 1} är svaret, facit säger ${q.correctAnswer + 1}`);
  if (f.roller && JSON.stringify(f.roller) !== JSON.stringify(st)) fel.push(`E1: rollerna ${f.roller.join(',')} stämmer inte med ${st.join(',')}`);
  // Frågor där alternativen är namn kräver en enda lösning (kvantor och kan_inte har flera modeller).
  if ((f.fraga.form === 'vilka' || f.fraga.form === 'vem') && modeller(f).length !== 1) fel.push('E1: vem- och vilka-frågor kräver exakt en lösning');
  return fel;
}

/**
 * Ett lockvillkor (om_sa) behövs inte för facit men bär en fälla: en
 * distraktors misstag pekar på det ("Villkor 2 säger vad som gäller om ...").
 * Det räknas inte som överflödigt.
 */
export function arLockvillkor(q, i) {
  if (q.formell.slag !== 'om_sa') return false;
  const re = new RegExp(`(^|[^0-9])[Vv]illkor ${i + 1}([^0-9]|$)`);
  // Misstaget ska namnge en felslutning (granskningen av omgång 3): neka förledet eller bekräfta efterledet.
  const FELSLUT = /säger inget om vad som gäller om|visar inte att/;
  return (q.misstag ?? []).some((m, j) => j !== q.correctAnswer && re.test(m) && FELSLUT.test(m));
}

/** Lockvillkoren i en uppgift (index). Högst tre uppgifter med lockvillkor per nivå (validate-deduktiv.mjs). */
export function lockvillkor(q) {
  const f = q.formell;
  if (f.slag !== 'om_sa') return [];
  return f.villkor.map((_, i) => i).filter((i) => {
    if (!arLockvillkor(q, i)) return false;
    const s = svarMed(f, f.villkor.map((__, j) => j).filter((j) => j !== i));
    return s && s.length === 1 && s[0] === q.correctAnswer;
  });
}

/** Högst så många steg i en D4-lösning (granskningen av omgång 3). */
export const D4_STEGTAK = 12;
/** Högst så många om_sa-uppgifter med lockvillkor per nivå. */
export const D4_LOCKTAK = 3;

export function e2(q) {
  const f = q.formell;
  const fel = [];
  f.villkor.forEach((_, i) => {
    if (arLockvillkor(q, i)) return;
    const med = f.villkor.map((__, j) => j).filter((j) => j !== i);
    const s = svarMed(f, med);
    if (s && s.length === 1 && s[0] === q.correctAnswer) fel.push(`E2: villkor ${i + 1} är överflödigt`);
  });
  return fel;
}

const sorterad = (x) => (Array.isArray(x) ? x.map(sorterad) : x && typeof x === 'object' ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, sorterad(x[k])])) : x);
const nyckel = (x) => JSON.stringify(sorterad(x));

export function e3(q) {
  const f = q.formell;
  const fel = [];
  const facit = f.alternativ[q.correctAnswer];
  if (f.fraga.form !== 'foljer_inte') {
    f.villkor.forEach((_, i) => {
      const s = status(f, facit, [i]);
      if (arSvar(f.fraga.form, s)) fel.push(`E3: facit följer ur villkor ${i + 1} ensamt`);
    });
  }
  if (q.options && q.villkor.some((v) => v === q.options[q.correctAnswer])) fel.push('E3: facit står ordagrant bland villkoren');
  if (f.slag !== 'kvantor' && f.slag !== 'sanning' && f.villkor.some((c) => nyckel(c) === nyckel(facit))) fel.push('E3: facit är ett av villkoren');
  return fel;
}

/** Medför alternativ i alternativ j utan villkoren? Kvantor: i båda läsningarna. */
export function medfor(f, i, j) {
  const xi = f.alternativ[i];
  const xj = f.alternativ[j];
  if (f.slag === 'kvantor') {
    // xi medför xj om "xi och inte xj" saknar modell; prövas som status för xj givet xi.
    const s = stabilStatus(f.termer, f.individer ?? [], [xi], xj);
    return s === 'nodvandig';
  }
  const dar = univ(f).filter((m) => galler(f, xi, m));
  return dar.length > 0 && dar.every((m) => galler(f, xj, m));
}

export function e4(q) {
  const f = q.formell;
  const fel = [];
  f.alternativ.forEach((_, i) =>
    f.alternativ.forEach((__, j) => {
      if (i !== j && medfor(f, i, j)) fel.push(`E4: alternativ ${'ABCDE'[i]} medför alternativ ${'ABCDE'[j]}`);
    })
  );
  return fel;
}

/** Formen på ett alternativ, för E5. */
function form(f, x) {
  if (f.slag === 'om_sa') return x.typ === 'lit' ? (x.neg ? 'lit-' : 'lit+') : x.typ;
  return x.typ;
}

export function e5(q) {
  const f = q.formell;
  if (f.fraga.form === 'vilka' || f.fraga.form === 'vem') return [];
  const facit = form(f, f.alternativ[q.correctAnswer]);
  const distr = f.alternativ.filter((_, i) => i !== q.correctAnswer).map((x) => form(f, x));
  if (distr.every((d) => d === distr[0]) && facit !== distr[0]) return [`E5: alla distraktorer har formen ${distr[0]}, facit ${facit}`];
  if (distr.every((d) => d !== facit) && new Set(distr).size <= 2) return [`E5: facit är ensamt om formen ${facit}`];
  return [];
}

/** Texten för ett villkor eller alternativ i slaget. */
export function d4Text(f, x, roll = 'villkor') {
  switch (f.slag) {
    case 'om_sa': return omsaText(f, x);
    case 'sanning':
      if (roll === 'villkor') return sanningVillkorText(f.namn, x);
      return sanningPastaende(f.namn, x, null);
    case 'tabell':
      if (roll === 'alternativ' && f.fraga.form === 'vem') return f.namn[x.p];
      return tabellText(f, x);
    case 'kan_inte': return villkorText(f.tema, f.namn, x);
    default: return null;
  }
}

export function e7(q) {
  const f = q.formell;
  if (f.slag === 'kvantor') return [];
  const fel = [];
  f.villkor.forEach((c, i) => {
    if (d4Text(f, c) !== q.villkor[i]) fel.push(`E7: villkor ${i + 1} är inte mallens`);
  });
  f.alternativ.forEach((x, i) => {
    if (d4Text(f, x, 'alternativ') !== q.options[i]) fel.push(`E7: alternativ ${i + 1} är inte mallens`);
  });
  return fel;
}

export function e6(q) {
  const f = q.formell;
  if ((q.losning?.steg?.length ?? 0) > D4_STEGTAK) return [`E6: ${q.losning.steg.length} steg, högst ${D4_STEGTAK}`];
  if (f.slag === 'kvantor') {
    const fel = [];
    for (const x of q.losning?.steg ?? []) for (const m of x.markor ?? []) if (!(Number.isInteger(m) && m >= 1 && m <= q.villkor.length)) fel.push(`E6: steget pekar på ${m}`);
    if (!q.losning?.steg?.length) fel.push('E6: lösningen saknas');
    return fel;
  }
  const steg = forklaraD4(f, q.correctAnswer);
  if (!steg) return ['E6: lösaren kan inte förklara uppgiften'];
  if (JSON.stringify(steg) !== JSON.stringify(q.losning?.steg)) return ['E6: lösningstexten är inte lösarens'];
  return [];
}

export function sparrFelD4(q) {
  if (q.typ !== 'D4') return [];
  if (q.losning?.schema != null) return ['E6: D4 har ingen remsa'];
  return [...e1(q), ...e2(q), ...e3(q), ...e4(q), ...e5(q), ...e6(q), ...e7(q)];
}

/* ================================ förklaringar ============================== */

export function forklaraD4(f, facitIdx) {
  switch (f.slag) {
    case 'om_sa': return forklaraOmsa(f, facitIdx);
    case 'sanning': return forklaraSanning(f, facitIdx);
    case 'tabell': return forklaraTabell(f, facitIdx);
    case 'kan_inte': return forklaraKanInte(f, facitIdx);
    default: return null;
  }
}

const steg = (markor, foljd) => ({ markor, villkor: [], foljd });

/* ---------------------------------- om_sa ---------------------------------- */

/**
 * Slutleder literaler ur kända (med källa) och implikationerna med modus
 * ponens och modus tollens. Returnerar stegen i ordning och de kända.
 * kanda: Map(nyckel -> { l, kalla: villkorsindex | null }).
 */
function omsaSlut(f, start, mal, maxSteg = 12) {
  const kand = new Map(start.map((x) => [`${x.l.a}:${!!x.l.neg}`, x]));
  const har = (l) => kand.has(`${l.a}:${!!l.neg}`);
  const ut = [];
  for (let varv = 0; varv < maxSteg; varv++) {
    if (mal && mal(kand)) break;
    if ([...kand.values()].some((x) => kand.has(`${x.l.a}:${!x.l.neg}`))) break;
    let gjort = false;
    for (let i = 0; i < f.villkor.length && !gjort; i++) {
      const c = f.villkor[i];
      if (c.typ !== 'om') continue;
      if (har(c.p) && !har(c.q)) {
        const fran = kand.get(`${c.p.a}:${!!c.p.neg}`);
        ut.push({ regel: 'MP', i, fran, ny: c.q });
        kand.set(`${c.q.a}:${!!c.q.neg}`, { l: c.q, kalla: null });
        gjort = true;
      } else if (har(neg(c.q)) && !har(neg(c.p))) {
        const fran = kand.get(`${c.q.a}:${!c.q.neg}`);
        ut.push({ regel: 'MT', i, fran, ny: neg(c.p) });
        kand.set(`${c.p.a}:${!c.p.neg}`, { l: neg(c.p), kalla: null });
        gjort = true;
      }
    }
    if (!gjort) break;
  }
  const motsagelse = [...kand.values()].find((x) => kand.has(`${x.l.a}:${!x.l.neg}`));
  return { ut, kand, motsagelse };
}

/** Behåll bara de steg som behövs för målliteralerna. */
function behovs(ut, mal) {
  const behov = new Set(mal.map((l) => `${l.a}:${!!l.neg}`));
  const beh = [];
  for (let k = ut.length - 1; k >= 0; k--) {
    const s = ut[k];
    if (behov.has(`${s.ny.a}:${!!s.ny.neg}`)) {
      beh.unshift(s);
      behov.add(`${s.fran.l.a}:${!!s.fran.l.neg}`);
    }
  }
  return beh;
}

function omsaStegText(f, s, anvanda) {
  const c = f.villkor[s.i];
  const markor = [];
  if (s.fran.kalla != null && !anvanda.has(s.fran.kalla)) {
    markor.push(s.fran.kalla + 1);
    anvanda.add(s.fran.kalla);
  }
  markor.push(s.i + 1);
  if (s.regel === 'MP') return steg(markor, `${H(f, c.p)}, så enligt villkor ${s.i + 1} ${INV(f, c.q)}.`);
  return steg(markor, `${H(f, neg(c.q))}. Villkor ${s.i + 1} säger att ${BI(f, c.q)} om ${BI(f, c.p)}, alltså ${INV(f, neg(c.p))}.`);
}

function fakta(f) {
  return f.villkor.map((c, i) => (c.typ === 'lit' ? { l: { a: c.a, neg: !!c.neg }, kalla: i } : null)).filter(Boolean);
}

/** Försöker härleda literalen ur fakta (plus antaganden), returnerar stegen eller null. */
function harled(f, start, mal) {
  const { ut, kand, motsagelse } = omsaSlut(f, start, (k) => k.has(`${mal.a}:${!!mal.neg}`));
  if (motsagelse || !kand.has(`${mal.a}:${!!mal.neg}`)) return null;
  return behovs(ut, [mal]);
}

/** Försöker hitta en motsägelse ur fakta plus antaganden. */
function motsag(f, start) {
  const { ut, kand, motsagelse } = omsaSlut(f, start, null, 20);
  if (!motsagelse) return null;
  const l = motsagelse.l;
  return { steg: behovs(ut, [l, neg(l)]), l, kand };
}

function forklaraOmsa(f, facitIdx) {
  const facit = f.alternativ[facitIdx];
  const form = f.fraga.form;
  const F = fakta(f);
  const anv = new Set();
  const ut = [];
  const text = (lista) => lista.map((s) => omsaStegText(f, s, anv));
  const malLit = form === 'kan_inte' && facit.typ === 'lit' ? neg(facit) : facit.typ === 'lit' ? facit : null;
  if (malLit) {
    // Direkt ur fakta.
    const d = harled(f, F, malLit);
    if (d && d.length) {
      ut.push(...text(d));
      if (form === 'kan_inte') ut.push(steg([], `Alltså kan det inte stämma att ${BI(f, facit)}.`));
      return ut;
    }
    // Fallanalys på en atom.
    for (let a = 0; a < f.atomer.length; a++) {
      if (a === malLit.a) continue;
      const pos = harled(f, [...F, { l: { a, neg: false }, kalla: null }], malLit);
      const ng = harled(f, [...F, { l: { a, neg: true }, kalla: null }], malLit);
      if (pos && ng && pos.length && ng.length) {
        ut.push(steg([], `Anta först att ${BI(f, { a, neg: false })}.`));
        ut.push(...text(pos));
        ut.push(steg([], `Anta i stället att ${BI(f, { a, neg: true })}.`));
        const anv2 = new Set(anv);
        ut.push(...ng.map((s) => omsaStegText(f, s, anv2)));
        ut.push(steg([], `Alltså ${INV(f, malLit)} i båda fallen.`));
        if (form === 'kan_inte') ut.push(steg([], `Det kan alltså inte stämma att ${BI(f, facit)}.`));
        return ut;
      }
    }
    // Motsägelse: anta motsatsen.
    const anta = neg(malLit);
    const m = motsag(f, [...F, { l: anta, kalla: null }]);
    if (m && m.steg.length) {
      ut.push(steg([], `Anta att ${BI(f, anta)}.`));
      ut.push(...text(m.steg));
      ut.push(steg([], `Det går inte ihop. Alltså ${INV(f, malLit)}.`));
      if (form === 'kan_inte') ut.push(steg([], `Det kan alltså inte stämma att ${BI(f, facit)}.`));
      return ut;
    }
    return null;
  }
  if (form === 'maste' && facit.typ === 'om') {
    const d = harled(f, [...F, { l: facit.p, kalla: null }], facit.q);
    if (!d || !d.length) return null;
    ut.push(steg([], `Anta att ${BI(f, facit.p)}.`));
    ut.push(...text(d));
    ut.push(steg([], `Alltså gäller: om ${BI(f, facit.p)}, ${INV(f, facit.q)}.`));
    return ut;
  }
  if (form === 'kan_inte' && facit.typ === 'och') {
    const m = motsag(f, [...F, { l: facit.p, kalla: null }, { l: facit.q, kalla: null }]);
    if (!m || !m.steg.length) return null;
    ut.push(steg([], `Anta att ${BI(f, facit.p)} och att ${BI(f, facit.q)}.`));
    ut.push(...text(m.steg));
    ut.push(steg([], 'Det går inte ihop, så båda kan inte stämma.'));
    return ut;
  }
  return null;
}

/** Misstagstexten för ett alternativ i om_sa. */
export function omsaMisstag(f, x, roll, form) {
  const V = f.villkor;
  if (x.typ === 'lit') {
    if (roll === 'omojlig') return `Av villkoren följer tvärtom att ${BI(f, neg(x))}.`;
    if (roll === 'nodvandig') return `Av villkoren följer att ${BI(f, x)}, så det är sant.`;
    // Bekräfta efterledet: x är förledet i ett villkor vars efterled är känt.
    for (let i = 0; i < V.length; i++) {
      const c = V[i];
      if (c.typ === 'om' && litLika(c.p, x) && status(f, { typ: 'lit', ...c.q }) === 'nodvandig')
        return `Villkor ${i + 1} säger att ${BI(f, c.q)} om ${BI(f, c.p)}. Att ${BI(f, c.q)} visar inte att ${BI(f, c.p)}.`;
      if (c.typ === 'om' && litLika(neg(c.q), x) && status(f, { typ: 'lit', ...neg(c.p) }) === 'nodvandig')
        return `Villkor ${i + 1} säger vad som gäller om ${BI(f, c.p)}. Det säger inget om vad som gäller om ${BI(f, neg(c.p))}.`;
    }
    // "avgör inte om" med jakande bisats (granskningen, dd-g-d4-07).
    const pos = { a: x.a, neg: false };
    return form === 'kan_inte' ? `Det kan stämma. Villkoren avgör inte om ${BI(f, pos)}.` : `Villkoren avgör inte om ${BI(f, pos)}. Det kan stämma, men det måste inte.`;
  }
  const lit = (l) => ({ typ: 'lit', a: l.a, neg: l.neg });
  if (x.typ === 'om') {
    if (roll === 'omojlig') return `Av villkoren följer att ${BI(f, x.p)} och att ${BI(f, neg(x.q))}. Då stämmer det inte.`;
    if (roll === 'nodvandig') return 'Det följer av villkoren, så det är sant. Svaret är det som inte kan stämma.';
    for (let i = 0; i < V.length; i++) {
      const c = V[i];
      if (c.typ === 'om' && litLika(c.q, x.p) && litLika(c.p, x.q)) return `Det vänder på villkor ${i + 1}. Det kan stämma, men det måste inte.`;
      if (c.typ === 'om' && litLika(neg(c.p), x.p) && litLika(neg(c.q), x.q))
        return `Villkor ${i + 1} säger inget om vad som gäller om ${BI(f, neg(c.p))}. Det kan stämma, men det måste inte.`;
    }
    if (status(f, { typ: 'om', p: x.q, q: x.p }) === 'nodvandig')
      return `Det vänder på det som följer av villkoren, att ${BI(f, x.p)} om ${BI(f, x.q)}. Det kan stämma, men det måste inte.`;
    if (status(f, { typ: 'om', p: neg(x.p), q: neg(x.q) }) === 'nodvandig')
      return `Villkoren säger vad som gäller om ${BI(f, neg(x.p))}. De säger inget om vad som gäller om ${BI(f, x.p)}.`;
    return `Villkoren avgör inte vad som gäller om ${BI(f, x.p)}. Det kan stämma, men det måste inte.`;
  }
  if (x.typ === 'och') {
    if (roll === 'nodvandig') return 'Båda delarna följer av villkoren, så det är sant.';
    if (roll === 'omojlig') {
      const falska = [x.p, x.q].filter((l) => status(f, lit(l)) === 'omojlig');
      if (falska.length === 2) return `Av villkoren följer att ${BI(f, neg(x.p))} och att ${BI(f, neg(x.q))}.`;
      if (falska.length === 1) {
        const sann = [x.p, x.q].find((l) => l !== falska[0]);
        if (status(f, lit(sann)) === 'nodvandig') return `${H(f, sann)}, men av villkoren följer att ${BI(f, neg(falska[0]))}.`;
        return `Av villkoren följer att ${BI(f, neg(falska[0]))}, så båda kan inte gälla.`;
      }
      return 'Båda delarna kan inte gälla samtidigt med villkoren.';
    }
    if (form === 'kan_inte') return `Det kan stämma. Villkoren utesluter inte att ${BI(f, x.p)} och att ${BI(f, x.q)}.`;
    return `Villkoren avgör inte om ${BI(f, x.p)} och om ${BI(f, x.q)}. Det kan stämma, men det måste inte.`;
  }
  return '';
}

/* --------------------------------- sanning --------------------------------- */

const SORT = (v) => (v ? 'lögnare' : 'sanningssägare');
const gen = (x) => (/[sxz]$/.test(x) ? x : `${x}s`);

/** Tvingade personer ur ett villkor givet läget (null = okänd). */
function tvingat(f, c, lage) {
  const n = f.namn.length;
  const okanda = Array.from({ length: n }, (_, i) => i).filter((i) => lage[i] == null);
  const fall = [];
  for (let k = 0; k < 1 << okanda.length; k++) {
    let m = 0;
    for (let i = 0; i < n; i++) if (lage[i] === true) m |= 1 << i;
    okanda.forEach((p, j) => {
      if ((k >> j) & 1) m |= 1 << p;
    });
    if (sanningVillkor(c, m, n)) fall.push(m);
  }
  if (!fall.length) return { motsagelse: true, tvingade: [] };
  const tv = okanda.filter((p) => fall.every((m) => arL(m, p) === arL(fall[0], p))).map((p) => [p, arL(fall[0], p)]);
  return { motsagelse: false, tvingade: tv };
}

/** Propagerar läget; varje steg ett villkor. Returnerar { steg, lage, motsagelse }. */
function propagera(f, lage0) {
  const lage = lage0.slice();
  const ut = [];
  for (let varv = 0; varv < 20; varv++) {
    let gjort = false;
    for (let i = 0; i < f.villkor.length; i++) {
      const c = f.villkor[i];
      const r = tvingat(f, c, lage);
      if (r.motsagelse) {
        ut.push({ i, motsagelse: true, lageFore: lage.slice() });
        return { steg: ut, lage, motsagelse: true };
      }
      if (r.tvingade.length) {
        ut.push({ i, tvingade: r.tvingade, lageFore: lage.slice() });
        for (const [p, v] of r.tvingade) lage[p] = v;
        gjort = true;
        break;
      }
    }
    if (!gjort) break;
  }
  return { steg: ut, lage, motsagelse: false };
}

function sanningStegText(f, s) {
  const c = f.villkor[s.i];
  const N = f.namn;
  const t = N[c.talare];
  if (s.motsagelse) return steg([s.i + 1], `Det går inte ihop med det ${t} säger.`);
  const talareKand = s.lageFore[c.talare] != null;
  const andra = s.tvingade.filter(([p]) => p !== c.talare);
  const sjalv = s.tvingade.find(([p]) => p === c.talare);
  const lst = (xs) => {
    const l = xs.filter(([, v]) => v).map(([p]) => N[p]);
    const s2 = xs.filter(([, v]) => !v).map(([p]) => N[p]);
    const del = [];
    if (l.length) del.push(l.length === 1 ? `${l[0]} är lögnare` : `${lista(l)} är lögnare`);
    if (s2.length) del.push(s2.length === 1 ? `${s2[0]} är sanningssägare` : `${lista(s2)} är sanningssägare`);
    return del.join(' och ');
  };
  if (talareKand && !sjalv) {
    if (s.lageFore[c.talare]) return steg([s.i + 1], `${t} är lögnare, så det ${t} säger är falskt. Alltså gäller att ${lst(andra)}.`);
    return steg([s.i + 1], `${t} är sanningssägare, så det ${t} säger stämmer. Alltså gäller att ${lst(andra)}.`);
  }
  if (sjalv && !andra.length) {
    // Innehållet avgjort av de andra.
    return sjalv[1]
      ? steg([s.i + 1], `Då är det ${t} säger falskt, så ${t} är lögnare.`)
      : steg([s.i + 1], `Då stämmer det ${t} säger, så ${t} är sanningssägare.`);
  }
  return steg([s.i + 1], `Det enda som går ihop med det ${t} säger är att ${lst(s.tvingade)}.`);
}

function sanningLost(f, lage) {
  return lage.every((v) => v != null);
}

function forklaraSanning(f, facitIdx) {
  const n = f.namn.length;
  const facit = f.alternativ[facitIdx];
  const form = f.fraga.form;
  const ut = [];
  let lage = new Array(n).fill(null);
  if (form === 'kan_inte') {
    // Anta påståendet i facit och visa att det inte går ihop.
    const M = universum(f).filter((m) => sanningGaller(facit, m, n));
    // Facit som tvingar personer: logn, sann, bada_*, mangd.
    const tv = Array.from({ length: n }, (_, i) => i).filter((i) => M.every((m) => arL(m, i) === arL(M[0], i)));
    if (!tv.length) return null;
    tv.forEach((i) => (lage[i] = arL(M[0], i)));
    ut.push(steg([], `Anta att ${liten(utanPunkt(sanningPastaende(f.namn, facit, null)))}.`));
    const p = propagera(f, lage);
    if (!p.motsagelse) return null;
    ut.push(...p.steg.map((s) => sanningStegText(f, s)));
    ut.push(steg([], 'Antagandet håller inte, så alternativet kan inte vara sant.'));
    return ut;
  }
  // maste och vilka: lös hela läget, med antagande när propageringen står still.
  for (let varv = 0; varv < n + 1; varv++) {
    const p = propagera(f, lage);
    if (p.motsagelse) return null;
    ut.push(...p.steg.map((s) => sanningStegText(f, s)));
    lage = p.lage;
    if (sanningLost(f, lage) || (form === 'maste' && avgjort(f, facit, lage))) break;
    // Hitta en person och ett värde som leder till motsägelse.
    let bast = null;
    for (let i = 0; i < n; i++) {
      if (lage[i] != null) continue;
      for (const v of [false, true]) {
        const l2 = lage.slice();
        l2[i] = v;
        const q = propagera(f, l2);
        if (q.motsagelse && (!bast || q.steg.length < bast.q.steg.length)) bast = { i, v, q };
      }
    }
    if (!bast) return null;
    ut.push(steg([], `Anta att ${f.namn[bast.i]} är ${SORT(bast.v)}.`));
    ut.push(...bast.q.steg.map((s) => sanningStegText(f, s)));
    ut.push(steg([], `Antagandet håller inte. Alltså är ${f.namn[bast.i]} ${SORT(!bast.v)}.`));
    lage[bast.i] = !bast.v;
  }
  if (!(sanningLost(f, lage) || avgjort(f, facit, lage))) return null;
  if (form === 'vilka') {
    const l = lage.map((v, i) => (v ? f.namn[i] : null)).filter(Boolean);
    ut.push(steg([], l.length > 1 ? `Lögnarna är alltså ${lista(l)}.` : l.length ? `Lögnaren är alltså ${l[0]}.` : 'Ingen av dem är alltså lögnare.'));
  }
  return ut;
}

function avgjort(f, x, lage) {
  const n = f.namn.length;
  const M = universum(f).filter((m) => lage.every((v, i) => v == null || arL(m, i) === v));
  return M.every((m) => sanningGaller(x, m, n));
}

/* ---------------------------------- tabell --------------------------------- */

/**
 * Propagering med kandidatmängder: R[p] (värden i A) och S[p] (värden i B).
 * Varje borttagning har ett skäl: villkorets index eller 'kvar' (någon annan
 * har värdet). Ett steg skrivs när en person får ett värde låst.
 */
/**
 * Tabellpusslets lösning (granskningen av omgång 3): varje låsning fram till
 * facit står som ett eget steg, i den ordning den följer. Följderna dras en i
 * taget, och så fort en person får ett enda värde kvar skrivs det ut innan
 * något annat dras ur det. Inget sammanfattas.
 */
function forklaraTabell(f, facitIdx) {
  if (f.fraga.form === 'kan_inte') return forklaraTabellKanInte(f, facitIdx);
  const n = f.namn.length;
  const facit = f.alternativ[facitIdx];
  const form = f.fraga.form;
  const KAT = ['A', 'B'];
  const D = { A: Array.from({ length: n }, () => new Set(Array.from({ length: n }, (_, v) => v))), B: Array.from({ length: n }, () => new Set(Array.from({ length: n }, (_, v) => v))) };
  // Skälet till att värdet v togs bort hos person p: villkorets index eller null (någon annan har det).
  const skal = { A: Array.from({ length: n }, () => new Map()), B: Array.from({ length: n }, () => new Map()) };
  const skriven = { A: new Array(n).fill(false), B: new Array(n).fill(false) };
  const ut = [];
  const V = form === 'kan_inte' ? [...f.villkor, facit] : [...f.villkor];
  const ANT = form === 'kan_inte' ? V.length - 1 : -1;
  // Skälen kan vara kedjor: ett "Den som ..."-villkor tar med skälen till det som utlöste det (slutkontrollen av omgång 3).
  const nr = (xs) => [...new Set(xs.flat(Infinity))].filter((x) => typeof x === 'number' && x !== ANT).map((x) => x + 1).sort((a, b) => a - b);
  const alltsa = (k, p, v) => `${f.namn[p]} ${katF(f, k).alltsa(v)}`;
  /** Skälen till att person p har ett enda värde kvar i kategori k. */
  // Ett utskrivet lås har redan sina märken; då räcker villkoret självt.
  const lasSkal = (k, p) => (skriven[k][p] ? [] : [...skal[k][p].values()]);
  /** Skälet till att värdet v saknas hos p, om det inte redan står i ett utskrivet steg. */
  const borta = (k, p, v) => (skriven[k][p] ? null : skal[k][p].get(v));
  const ta = (k, p, v, varfor) => {
    if (!D[k][p].has(v)) return false;
    D[k][p].delete(v);
    skal[k][p].set(v, varfor);
    return true;
  };
  const tom = () => {
    for (const k of KAT) {
      for (let p = 0; p < n; p++) if (!D[k][p].size) return { k, p };
      for (let v = 0; v < n; v++) if (!Array.from({ length: n }, (_, p) => p).some((p) => D[k][p].has(v))) return { k, v };
    }
    return null;
  };
  /** En person med ett enda värde kvar som inte är utskriven. */
  const nyttLas = () => {
    for (const k of KAT) for (let p = 0; p < n; p++) if (D[k][p].size === 1 && !skriven[k][p]) return { k, p };
    return null;
  };
  // Enställiga villkor.
  V.forEach((c, i) => {
    if (c.typ === 'har') for (let v = 0; v < n; v++) if (v !== c.v) ta(c.kat, c.p, v, i);
    if (c.typ === 'inte') ta(c.kat, c.p, c.v, i);
    if (c.typ === 'varken') {
      ta(c.kat, c.p, c.v, i);
      ta(c.kat, c.p, c.w, i);
    }
    if (c.typ === 'ingen_av') {
      ta(c.kat, c.p, c.v, i);
      ta(c.kat, c.q, c.v, i);
    }
  });
  if (form === 'kan_inte') {
    ut.push(steg([], `Anta att ${liten(utanPunkt(tabellText(f, facit)))}.`));
    if (facit.typ === 'har') skriven[facit.kat][facit.p] = true;
  }
  /** Drar en följd i taget och stannar när en ny låsning eller en motsägelse uppstår. */
  const folj = () => {
    for (let varv = 0; varv < 200; varv++) {
      if (tom() || nyttLas()) return;
      let gjort = false;
      // Den som har ett utskrivet värde tar det från de andra.
      for (const k of KAT)
        for (let p = 0; p < n && !gjort; p++)
          if (D[k][p].size === 1 && skriven[k][p]) {
            const v = [...D[k][p]][0];
            for (let q = 0; q < n; q++) if (q !== p && ta(k, q, v, null)) gjort = true;
          }
      if (gjort) continue;
      // Länkarna, en i taget.
      for (let i = 0; i < V.length && !gjort; i++) {
        const c = V[i];
        if (c.typ !== 'lank' && c.typ !== 'inte_lank') continue;
        for (let p = 0; p < n && !gjort; p++) {
          if (c.typ === 'lank') {
            if (D.A[p].size === 1 && D.A[p].has(c.a)) for (let v = 0; v < n; v++) if (v !== c.b && ta('B', p, v, [i, lasSkal('A', p)])) gjort = true;
            if (!gjort && D.B[p].size === 1 && D.B[p].has(c.b)) for (let v = 0; v < n; v++) if (v !== c.a && ta('A', p, v, [i, lasSkal('B', p)])) gjort = true;
            if (!gjort && !D.B[p].has(c.b) && ta('A', p, c.a, [i, borta('B', p, c.b)])) gjort = true;
            if (!gjort && !D.A[p].has(c.a) && ta('B', p, c.b, [i, borta('A', p, c.a)])) gjort = true;
          } else {
            if (D.A[p].size === 1 && D.A[p].has(c.a) && ta('B', p, c.b, [i, lasSkal('A', p)])) gjort = true;
            if (!gjort && D.B[p].size === 1 && D.B[p].has(c.b) && ta('A', p, c.a, [i, lasSkal('B', p)])) gjort = true;
          }
        }
      }
      if (!gjort) return;
    }
  };
  const klart = () => facit.typ === 'har' && skriven[facit.kat][facit.p] && D[facit.kat][facit.p].size === 1 && D[facit.kat][facit.p].has(facit.v);
  for (let varv = 0; varv < 60; varv++) {
    if (form !== 'kan_inte' && klart()) return ut;
    folj();
    const t = tom();
    if (t) {
      if (form !== 'kan_inte') return null;
      if (t.p != null) {
        const sk = [...skal[t.k][t.p].values()];
        ut.push(steg(nr(sk), `Då finns inget kvar för ${f.namn[t.p]}. Det går inte ihop, så alternativet kan inte vara sant.`));
      } else {
        const sk = Array.from({ length: n }, (_, p) => skal[t.k][p].get(t.v));
        ut.push(steg(nr(sk), `Då kan ingen ${katF(f, t.k).inf(t.v)}. Det går inte ihop, så alternativet kan inte vara sant.`));
      }
      return ut;
    }
    const las = nyttLas();
    if (las) {
      const { k, p } = las;
      const v = [...D[k][p]][0];
      skriven[k][p] = true;
      const sk = [...skal[k][p].entries()].filter(([w]) => w !== v).map(([, x]) => x);
      ut.push(steg(nr(sk), `${alltsa(k, p, v)}.`));
      continue;
    }
    // Ett värde som bara en person kan ha.
    let gjort = false;
    for (const k of KAT) {
      for (let v = 0; v < n && !gjort; v++) {
        const kan = Array.from({ length: n }, (_, p) => p).filter((p) => D[k][p].has(v));
        if (kan.length !== 1 || D[k][kan[0]].size === 1) continue;
        const p = kan[0];
        const sk = Array.from({ length: n }, (_, q) => q).filter((q) => q !== p).map((q) => skal[k][q].get(v));
        for (const w of [...D[k][p]]) if (w !== v) ta(k, p, w, null);
        skriven[k][p] = true;
        ut.push(steg(nr(sk), `Ingen annan kan ${katF(f, k).inf(v)}. ${alltsa(k, p, v)}.`));
        gjort = true;
      }
      if (gjort) break;
    }
    if (!gjort) break;
  }
  if (form === 'kan_inte' || !klart()) return null;
  return ut;
}

/**
 * Tabellpusslets kan_inte-förklaring (godkänd i granskningen av omgång 3):
 * antagandet, låsningarna och motsägelsen.
 */
function forklaraTabellKanInte(f, facitIdx) {
  const n = f.namn.length;
  const facit = f.alternativ[facitIdx];
  const form = f.fraga.form;
  const KAT = ['A', 'B'];
  const D = { A: Array.from({ length: n }, () => new Set(Array.from({ length: n }, (_, v) => v))), B: Array.from({ length: n }, () => new Set(Array.from({ length: n }, (_, v) => v))) };
  // Skälet till att värdet v togs bort hos person p: villkorets index, 'ant' (antagandet) eller null (någon annan har det).
  const skal = { A: Array.from({ length: n }, () => new Map()), B: Array.from({ length: n }, () => new Map()) };
  const skriven = { A: new Array(n).fill(false), B: new Array(n).fill(false) };
  const ut = [];
  const V = form === 'kan_inte' ? [...f.villkor, facit] : [...f.villkor];
  const ANT = form === 'kan_inte' ? V.length - 1 : -1;
  const nr = (xs) => [...new Set(xs)].filter((x) => typeof x === 'number' && x !== ANT).map((x) => x + 1).sort((a, b) => a - b);
  const alltsa = (k, p, v) => `${f.namn[p]} ${katF(f, k).alltsa(v)}`;
  const ta = (k, p, v, varfor) => {
    if (!D[k][p].has(v)) return false;
    D[k][p].delete(v);
    skal[k][p].set(v, varfor);
    return true;
  };
  const tom = () => {
    for (const k of KAT) {
      for (let p = 0; p < n; p++) if (!D[k][p].size) return { k, p };
      for (let v = 0; v < n; v++) if (!Array.from({ length: n }, (_, p) => p).some((p) => D[k][p].has(v))) return { k, v };
    }
    return null;
  };
  // Enställiga villkor.
  V.forEach((c, i) => {
    if (c.typ === 'har') for (let v = 0; v < n; v++) if (v !== c.v) ta(c.kat, c.p, v, i);
    if (c.typ === 'inte') ta(c.kat, c.p, c.v, i);
    if (c.typ === 'varken') {
      ta(c.kat, c.p, c.v, i);
      ta(c.kat, c.p, c.w, i);
    }
    if (c.typ === 'ingen_av') {
      ta(c.kat, c.p, c.v, i);
      ta(c.kat, c.q, c.v, i);
    }
  });
  if (form === 'kan_inte') {
    ut.push(steg([], `Anta att ${liten(utanPunkt(tabellText(f, facit)))}.`));
    if (facit.typ === 'har') skriven[facit.kat][facit.p] = true;
  }
  // Tysta följder: den som har ett värde låst tar det från de andra, och länkarna.
  const tyst = () => {
    let gjort = true;
    while (gjort) {
      gjort = false;
      for (const k of KAT)
        for (let p = 0; p < n; p++)
          if (D[k][p].size === 1) {
            const v = [...D[k][p]][0];
            for (let q = 0; q < n; q++) if (q !== p && ta(k, q, v, null)) gjort = true;
          }
      V.forEach((c, i) => {
        if (c.typ !== 'lank' && c.typ !== 'inte_lank') return;
        for (let p = 0; p < n; p++) {
          if (c.typ === 'lank') {
            if (D.A[p].size === 1 && D.A[p].has(c.a)) for (let v = 0; v < n; v++) if (v !== c.b && ta('B', p, v, i)) gjort = true;
            if (D.B[p].size === 1 && D.B[p].has(c.b)) for (let v = 0; v < n; v++) if (v !== c.a && ta('A', p, v, i)) gjort = true;
            if (!D.B[p].has(c.b) && ta('A', p, c.a, i)) gjort = true;
            if (!D.A[p].has(c.a) && ta('B', p, c.b, i)) gjort = true;
          } else {
            if (D.A[p].size === 1 && D.A[p].has(c.a) && ta('B', p, c.b, i)) gjort = true;
            if (D.B[p].size === 1 && D.B[p].has(c.b) && ta('A', p, c.a, i)) gjort = true;
          }
        }
      });
      if (tom()) return;
    }
  };
  // Facit som sista steg, om det inte redan står som ett lås.
  const slutTabell = () => {
    if (facit.typ === 'har' && !(skriven[facit.kat][facit.p] && D[facit.kat][facit.p].size === 1)) ut.push(steg([], `Det som återstår ger att ${f.namn[facit.p]} ${katF(f, facit.kat).pos(facit.v)}.`));
    return ut;
  };
  for (let varv = 0; varv < 40; varv++) {
    tyst();
    const t = tom();
    if (t) {
      if (form !== 'kan_inte') return null;
      if (t.p != null) {
        const sk = [...skal[t.k][t.p].values()];
        ut.push(steg(nr(sk), `Då finns inget kvar för ${f.namn[t.p]}. Det går inte ihop, så alternativet kan inte vara sant.`));
      } else {
        const sk = Array.from({ length: n }, (_, p) => skal[t.k][p].get(t.v));
        ut.push(steg(nr(sk), `Då kan ingen ${katF(f, t.k).inf(t.v)}. Det går inte ihop, så alternativet kan inte vara sant.`));
      }
      return ut;
    }
    if (form !== 'kan_inte' && avgjortTabell(f, facit, D)) return slutTabell();
    // Nästa lås: först en person med ett enda värde kvar, sedan ett värde som bara en person kan ha.
    let gjort = false;
    for (const k of KAT) {
      for (let p = 0; p < n && !gjort; p++) {
        if (D[k][p].size !== 1 || skriven[k][p]) continue;
        const v = [...D[k][p]][0];
        skriven[k][p] = true;
        const sk = [...skal[k][p].entries()].filter(([w]) => w !== v).map(([, x]) => x);
        ut.push(steg(nr(sk), `${alltsa(k, p, v)}.`));
        gjort = true;
      }
      if (gjort) break;
    }
    if (!gjort)
      for (const k of KAT) {
        for (let v = 0; v < n && !gjort; v++) {
          const kan = Array.from({ length: n }, (_, p) => p).filter((p) => D[k][p].has(v));
          if (kan.length !== 1 || D[k][kan[0]].size === 1) continue;
          const p = kan[0];
          const sk = Array.from({ length: n }, (_, q) => q).filter((q) => q !== p).map((q) => skal[k][q].get(v));
          for (const w of [...D[k][p]]) if (w !== v) ta(k, p, w, null);
          skriven[k][p] = true;
          ut.push(steg(nr(sk), `Ingen annan kan ${katF(f, k).inf(v)}. ${alltsa(k, p, v)}.`));
          gjort = true;
        }
        if (gjort) break;
      }
    if (!gjort) break;
  }
  if (form === 'kan_inte' || !avgjortTabell(f, facit, D)) return null;
  return slutTabell();
}

function avgjortTabell(f, x, D) {
  // Facit är avgjort när varje modell som passar kandidaterna har det.
  const M = universum(f).filter((m) => ['A', 'B'].every((k) => m[k].every((v, p) => D[k][p].has(v))));
  return M.length > 0 && M.every((m) => tabellGaller(x, m));
}

/* --------------------------------- kan_inte -------------------------------- */

const INF = { står: 'stå', ligger: 'ligga', sitter: 'sitta' };

function forklaraKanInte(f, facitIdx) {
  const n = f.namn.length;
  const g = grupperFor(f.tema);
  const facit = f.alternativ[facitIdx];
  const V = [...f.villkor, facit];
  const ANT = V.length - 1;
  const T = TEMAN[f.tema];
  const fo = elementForm(f.tema, f.namn);
  const D = Array.from({ length: n }, () => new Set(Array.from({ length: n }, (_, k) => k + 1)));
  // Skälet till att plats k togs bort för element e: villkorets index (ANT för antagandet) eller null (platsen är tagen).
  const skal = Array.from({ length: n }, () => new Map());
  const skriven = new Array(n).fill(false);
  // Elementet som antagandet placerar pekas aldrig ut som det som inte får plats (granskningen, dd-g-d4-30).
  const placerad = facit.typ === 'plats' ? facit.a : -1;
  if (placerad >= 0) skriven[placerad] = true;
  const nr = (xs) => [...new Set(xs)].filter((x) => typeof x === 'number' && x !== ANT).map((x) => x + 1).sort((a, b) => a - b);
  const ta = (e, k, varfor) => {
    if (!D[e].has(k)) return false;
    D[e].delete(k);
    skal[e].set(k, varfor);
    return true;
  };
  const tom = () => {
    for (let e = 0; e < n; e++) if (!D[e].size && e !== placerad) return { e };
    for (let k = 1; k <= n; k++) if (!D.some((d) => d.has(k))) return { k };
    return null;
  };
  // Bisats efter "Anta att": inte före verbet ("Anta att Anna inte står bredvid Rasmus").
  const anta = liten(utanPunkt(villkorText(f.tema, f.namn, facit))).replace(/ (står|ligger|sitter) inte /, ' inte $1 ');
  const ut = [steg([], `Anta att ${anta}.`)];
  /** Skälen till att e saknar plats: villkoren, och för en plats som någon annan har tagit, skälen till att den står där. */
  const skalFor = (e) => {
    const ut2 = [];
    for (const [k, x] of skal[e]) {
      if (x != null) ut2.push(x);
      else {
        const o = D.findIndex((d, j) => j !== e && d.size === 1 && d.has(k));
        if (o >= 0) ut2.push(...[...skal[o].values()].filter((y) => y != null));
      }
    }
    return ut2;
  };
  const tyst = () => {
    let gjort = true;
    while (gjort && !tom()) {
      gjort = false;
      V.forEach((c, i) => {
        if (c.typ === 'plats') for (let k = 1; k <= n; k++) if (k !== c.k && ta(c.a, k, i)) gjort = true;
        if (c.typ === 'inte_plats' && ta(c.a, c.k, i)) gjort = true;
        if (c.b != null) {
          for (const [x, y, fram] of [[c.a, c.b, true], [c.b, c.a, false]]) {
            for (const k of [...D[x]]) {
              const stod = [...D[y]].some((l) => l !== k && uppfyllt(c, fram ? posPar(n, c.a, k, c.b, l) : posPar(n, c.a, l, c.b, k), g));
              if (!stod && ta(x, k, i)) gjort = true;
            }
          }
        }
      });
      for (let e = 0; e < n; e++)
        if (D[e].size === 1) {
          const k = [...D[e]][0];
          for (let o = 0; o < n; o++) if (o !== e && ta(o, k, null)) gjort = true;
        }
    }
  };
  for (let varv = 0; varv < 30; varv++) {
    tyst();
    const t = tom();
    if (t) {
      // Skälen ur platser som andra har tagit läggs bara till när villkoren annars saknas (dd-g-d4-29).
      if (t.e != null) ut.push(steg(nr([...skal[t.e].values()]).length ? nr([...skal[t.e].values()]) : nr(skalFor(t.e)), `Då finns ingen plats kvar för ${fo[t.e].mitt}. Det går inte ihop, så alternativet kan inte vara sant.`));
      else ut.push(steg(nr(D.map((_, e) => skal[e].get(t.k))), `Då kan ingen ${INF[T.verb]} på plats ${t.k}. Det går inte ihop, så alternativet kan inte vara sant.`));
      return ut;
    }
    let gjort = false;
    for (let e = 0; e < n && !gjort; e++) {
      if (D[e].size !== 1 || skriven[e]) continue;
      const k = [...D[e]][0];
      skriven[e] = true;
      ut.push(steg(nr([...skal[e].entries()].filter(([l]) => l !== k).map(([, x]) => x)), `Då ${verbForst(f.tema, f.namn, e, k)}.`));
      gjort = true;
    }
    for (let k = 1; k <= n && !gjort; k++) {
      const kan = Array.from({ length: n }, (_, e) => e).filter((e) => D[e].has(k));
      if (kan.length !== 1 || D[kan[0]].size === 1) continue;
      const e = kan[0];
      const sk = Array.from({ length: n }, (_, o) => o).filter((o) => o !== e).map((o) => skal[o].get(k));
      for (const l of [...D[e]]) if (l !== k) ta(e, l, null);
      skriven[e] = true;
      ut.push(steg(nr(sk), `Ingen annan kan ${INF[T.verb]} på plats ${k}. Där ${T.verb} alltså ${fo[e].mitt}.`));
      gjort = true;
    }
    if (!gjort) break;
  }
  return null;
}

/** "står Bo på plats 3" (efter "Då"). */
function verbForst(tema, namn, e, k) {
  const fo = elementForm(tema, namn)[e];
  return `${TEMAN[tema].verb} ${fo.mitt} på plats ${k}`;
}

/** En tilldelning där bara a och b har platser (för bågkonsistensen). */
function posPar(n, a, ka, b, kb) {
  const pos = new Array(n).fill(0);
  pos[a] = ka;
  pos[b] = kb;
  return pos;
}

/** Ett exempel på en lösning där påståendet x gäller, som namn i platsordning. */
export function exempelKanInte(f, x) {
  const g = grupperFor(f.tema);
  const S = losningar(f.namn.length, f.villkor, g).filter((p) => uppfyllt(x, p, g));
  if (!S.length) return null;
  const pos = S[0];
  const rad = new Array(pos.length);
  pos.forEach((p, i) => (rad[p - 1] = i));
  const T = TEMAN[f.tema];
  return rad.map((i) => (T.element === 'farger' ? `${f.namn[i]}` : f.namn[i]));
}
