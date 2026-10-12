// scripts/lib/serie/bryter-regler.mjs
// =============================================================================
// "Vilken figur bryter mönstret?" i regelform (beställning omgång 3, A1;
// figurserier-spec.md 7). Sex figurer, ingen lucka: fem delar en regel, en
// bryter den, ordningen spelar ingen roll. Figurerna är alternativen, så
// `options` är tom och `correctAnswer` (0 till 5) pekar i `rad`.
//
// Mallarna:
//   B1 Antal         grund      samma antal i olika vridning; brytaren har ett
//                               mer eller ett mindre (strålar, sektorhjul,
//                               3×3-blockets kant, duo med kantprickar)
//   B2 Samband       grund      formen bestämmer fyllningen; brytaren har rätt
//                               form men fel fyllning (grundform, duo kärna)
//   B3 Relation      avancerad  pilen i mitten pekar mot pricken; brytarens pil
//                               pekar 90 eller 180 grader fel (duo kant + pil,
//                               duo orbital + pil)
//   B4 Vridet        avancerad  samma osymmetriska mönster, bara vridet;
//                               brytaren är spegelbilden (sektorhjul, strålar)
//
// Den här filen har cellmodellen (egenskaper per figur), regelbiblioteket som
// BM1 prövar mot, mallarna och bygget. Spärrarna BM1 till BM5 står i
// sparrar-bryter.mjs; generatorn kör dem i byggBryter(), och
// scripts/v7-facit-check.mjs --bryter kör dem på kandidaterna och bankerna.
//
// 3×3-blocket står inte i B4: blocket har bara fyra äkta vridningar (90
// grader), och fem olika figurer kräver fem. Att flytta mönstret ett steg
// längs kanten är ingen vridning man ser.
// =============================================================================

import { mod, stable, TILE_KANT } from './celler-serie.mjs';

// ---------------------------------------------------------------- mängder på åtta lägen
const sortera = (a) => [...a].sort((x, y) => x - y);
export const rotera = (P, r) => sortera(P.map((p) => mod(p + r, 8)));
/** Spegling i den lodräta axeln genom klockan 12. */
export const spegla = (P) => sortera(P.map((p) => mod(-p, 8)));
const jamfor = (a, b) => {
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i] - b[i];
  return a.length - b.length;
};
const lika = (a, b) => jamfor(a, b) === 0;

/** Kanonisk representant för vridningsklassen och vridningen till P. */
export function vridKlass(P) {
  let kanon = null;
  for (let r = 0; r < 8; r++) {
    const k = rotera(P, -r);
    if (!kanon || jamfor(k, kanon) < 0) kanon = k;
  }
  let vrid = 0;
  while (!lika(rotera(kanon, vrid), sortera(P))) vrid++;
  return { kanon, vrid };
}
/** Klassen under vridning och spegling. */
export function kiralKlass(P) {
  const a = vridKlass(P).kanon;
  const b = vridKlass(spegla(P)).kanon;
  return jamfor(a, b) <= 0 ? a : b;
}
/** Mönstret saknar vridningssymmetri och dess spegelbild är ingen vridning av det. */
export function arKiralt(P) {
  for (let r = 1; r < 8; r++) if (lika(rotera(P, r), sortera(P))) return false;
  return !lika(vridKlass(P).kanon, vridKlass(spegla(P)).kanon);
}
export const bage = (start, antal) => sortera(Array.from({ length: antal }, (_, i) => mod(start + i, 8)));

// ---------------------------------------------------------------- cellmodellen
/** Egenskapernas slag: rot (åtta lägen runt), ord (antal), kat (kategori). */
export const SLAG = {
  antal: 'ord', vrid: 'rot', klass: 'kat', kiral: 'kat', ksymbol: 'kat',
  bas: 'kat', symbol: 'kat', fyllning: 'kat', ylage: 'rot', kform: 'kat', kfyll: 'kat', kvinkel: 'rot',
};
/** Det man ser i figuren, per primitiv (BM3 och BM4 räknar på de här). */
export const PRIMAR = {
  stralar: ['antal', 'vrid'],
  sektor: ['antal', 'vrid'],
  block: ['antal', 'vrid'],
  'duo-kant-symbol': ['antal', 'vrid', 'ksymbol'],
  grundform: ['bas', 'symbol', 'fyllning'],
  'duo-kant-form': ['ylage', 'kform', 'kfyll'],
  'duo-orbital-form': ['ylage', 'kform', 'kfyll'],
  'duo-kant-pil': ['ylage', 'kvinkel'],
  'duo-orbital-pil': ['ylage', 'kvinkel'],
};
export const MANGD = new Set(['stralar', 'sektor', 'block', 'duo-kant-symbol']);

function mangdEgenskaper(P) {
  const { kanon, vrid } = vridKlass(P);
  return { antal: P.length, vrid, klass: kanon.join(','), kiral: kiralKlass(P).join(','), lagen: sortera(P) };
}

/** Figurens egenskaper, { prim, v }, eller null när figuren inte hör till bryter mönstret. */
export function lasBryter(c) {
  if (!c || Array.isArray(c)) return null;
  switch (c.kind) {
    case 'ray': return { prim: 'stralar', v: mangdEgenskaper(c.rays) };
    case 'sectorwheel': return { prim: 'sektor', v: mangdEgenskaper(c.filled) };
    case 'tile': {
      if ((c.pattern >> 4) & 1) return null;
      const P = TILE_KANT.map((bit, p) => ((c.pattern >> bit) & 1 ? p : -1)).filter((p) => p >= 0);
      return { prim: 'block', v: mangdEgenskaper(P) };
    }
    case 'stack': return { prim: 'grundform', v: { bas: c.base, symbol: c.symbol, fyllning: c.baseFill } };
    case 'duo': {
      const y = c.ytter.typ;
      const k = c.karna.typ;
      if (y === 'kant' && k === 'symbol') return { prim: 'duo-kant-symbol', v: { ...mangdEgenskaper(bage(c.ytter.lage, c.ytter.antal ?? 1)), ksymbol: c.karna.symbol } };
      if ((c.ytter.antal ?? 1) !== 1) return null;
      if (k === 'form') return { prim: `duo-${y}-form`, v: { ylage: mod(c.ytter.lage, 8), kform: c.karna.form, kfyll: c.karna.fyllning } };
      if (k === 'pil') return { prim: `duo-${y}-pil`, v: { ylage: mod(c.ytter.lage, 8), kvinkel: mod(c.karna.vinkel / 45, 8) } };
      return null;
    }
    default: return null;
  }
}

/** Nyckeln per figur (BM2): primitiven och det som syns. */
export function bryterNyckel(c) {
  const l = lasBryter(c);
  if (!l) return `okand:${stable(c)}`;
  if (MANGD.has(l.prim)) return `${l.prim}|${l.v.lagen.join(',')}|${l.v.ksymbol ?? ''}`;
  return `${l.prim}|${PRIMAR[l.prim].map((id) => `${id}=${l.v[id]}`).join('|')}`;
}

// ---------------------------------------------------------------- bygg celler
export function byggMangd(prim, P, extra = {}) {
  const S = sortera(P);
  switch (prim) {
    case 'stralar': return { kind: 'ray', rays: S };
    case 'sektor': return { kind: 'sectorwheel', filled: S };
    case 'block': return { kind: 'tile', pattern: S.reduce((m, p) => m | (1 << TILE_KANT[p]), 0) };
    case 'duo-kant-symbol': {
      // Kantprickarna ritas i följd från lage: mängden måste vara en båge.
      const n = S.length;
      const start = S.find((s) => bage(s, n).every((x, i) => x === S[i]));
      if (start === undefined) throw new Error('kantprickarna är ingen båge');
      return { kind: 'duo', ytter: { typ: 'kant', lage: start, antal: n }, karna: { typ: 'symbol', symbol: extra.ksymbol } };
    }
    default: throw new Error(`okänd mängdprimitiv ${prim}`);
  }
}
export const byggStack = (bas, symbol, fyllning) => ({ kind: 'stack', base: bas, symbol, baseFill: fyllning });
export const byggDuoForm = (y, ylage, kform, kfyll) => ({ kind: 'duo', ytter: { typ: y, lage: ylage }, karna: { typ: 'form', form: kform, fyllning: kfyll } });
export const byggDuoPil = (y, ylage, kvinkel) => ({ kind: 'duo', ytter: { typ: y, lage: ylage }, karna: { typ: 'pil', vinkel: mod(kvinkel, 8) * 45 } });

// ---------------------------------------------------------------- regelbiblioteket (BM1)
const raknaVarden = (V, id) => {
  const m = new Map();
  for (const v of V) m.set(stable(v[id]), (m.get(stable(v[id])) ?? 0) + 1);
  return m;
};

/**
 * Reglerna en kandidat kan läsa ut ur en grupp figurer, givet primitivens
 * egenskaper. Varje regel är { namn, galler(V) } där V är egenskaperna för
 * fem eller sex figurer:
 *   lika(e)        alla har samma värde på egenskapen (samma antal, samma
 *                  mönster upp till vridning, samma fyllning ...)
 *   samband(a, b)  a bestämmer b: samma a ger alltid samma b, a har minst två
 *                  värden och något värde återkommer, b har minst två värden
 *   relation(a, b) två lägen har samma vinkel mellan sig i alla (pilen pekar
 *                  mot pricken, rakt bort från den, ett kvarts varv förbi)
 */
export function regelBibliotek(prim) {
  const egen = [...PRIMAR[prim], ...(MANGD.has(prim) ? ['klass', 'kiral'] : [])];
  const regler = [];
  for (const e of egen) regler.push({ namn: `lika(${e})`, galler: (V) => raknaVarden(V, e).size === 1 });
  for (const a of egen) for (const b of egen) {
    if (a === b) continue;
    regler.push({
      namn: `samband(${a}→${b})`,
      galler: (V) => {
        const ka = raknaVarden(V, a);
        if (ka.size < 2 || ![...ka.values()].some((n) => n >= 2) || raknaVarden(V, b).size < 2) return false;
        const f = new Map();
        for (const v of V) {
          const x = stable(v[a]);
          const y = stable(v[b]);
          if (f.has(x) && f.get(x) !== y) return false;
          f.set(x, y);
        }
        return true;
      },
    });
  }
  const rot = egen.filter((e) => SLAG[e] === 'rot');
  for (let i = 0; i < rot.length; i++) for (let j = i + 1; j < rot.length; j++) {
    const [a, b] = [rot[i], rot[j]];
    regler.push({ namn: `relation(${a},${b})`, galler: (V) => new Set(V.map((v) => mod(v[b] - v[a], 8))).size === 1 });
  }
  return regler;
}

/** Frågans avsedda regel som predikat på en grupp figurer. */
export function avseddRegel(regel) {
  switch (regel.typ) {
    case 'lika': return (V) => regel.egenskaper.every((e) => raknaVarden(V, e).size === 1);
    case 'samband': return regelBibliotek(regel.prim).find((r) => r.namn === `samband(${regel.fran}→${regel.till})`).galler;
    case 'relation': return (V) => V.every((v) => mod(v[regel.b] - v[regel.a], 8) === regel.vinkel);
    default: return () => false;
  }
}

// ---------------------------------------------------------------- texterna
const ORD_EN = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta'];
const ORD_ETT = ['noll', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta'];
const ELEM = {
  stralar: { en: 'streck', flera: 'streck', ord: ORD_ETT },
  sektor: { en: 'svart sektor', flera: 'svarta sektorer', ord: ORD_EN },
  block: { en: 'svart ruta', flera: 'svarta rutor', ord: ORD_EN },
  'duo-kant-symbol': { en: 'kantprick', flera: 'kantprickar', ord: ORD_EN },
};
const antalText = (prim, n) => `${ELEM[prim].ord[n]} ${n === 1 ? ELEM[prim].en : ELEM[prim].flera}`;
const FORM = { circle: 'cirkel', square: 'kvadrat', triangle: 'triangel', diamond: 'romb' };
const FORM_BEST = { circle: 'cirkeln', square: 'kvadraten', triangle: 'triangeln', diamond: 'romben' };
const FYLL = { none: 'tom', black: 'svart' };
const versal = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Regeln, titeln och misstaget för varje figur som följer regeln. Texterna är
 * copywriterns (copy-omgang3.md 1.2 och 1.3): två meningar i regeln, vad de
 * fem delar och vad den som bryter gör.
 */
export function bryterTexter(mall, prim, V, brytare) {
  const b = V[brytare];
  const folj = V.find((_, i) => i !== brytare);
  switch (mall) {
    case 'B1': {
      const n = folj.antal;
      return {
        title: `Samma antal ${ELEM[prim].flera}`,
        rule: `Fem av figurerna har ${antalText(prim, n)}, bara olika vridna. Den som bryter har ${ELEM[prim].ord[b.antal]}.`,
        misstag: V.map((v, i) => (i === brytare ? '' : `Den här följer regeln: ${antalText(prim, v.antal)}, bara vriden.`)),
      };
    }
    case 'B2': {
      const duo = prim !== 'grundform';
      const fe = duo ? 'kform' : 'bas';
      const fy = duo ? 'kfyll' : 'fyllning';
      const par = new Map();
      V.forEach((v, i) => { if (i !== brytare) par.set(v[fe], v[fy]); });
      const [[fa, ya], [fb, yb]] = [...par.entries()];
      return {
        title: 'Formen bestämmer fyllningen',
        rule: `I fem av figurerna är ${FORM_BEST[fa]} alltid ${FYLL[ya]} och ${FORM_BEST[fb]} alltid ${FYLL[yb]}. Den som bryter är en ${FYLL[b[fy]]} ${FORM[b[fe]]}.`,
        misstag: V.map((v, k) => (k === brytare ? '' : `Den här följer regeln: ${FYLL[v[fy]]} ${FORM[v[fe]]}.`)),
      };
    }
    case 'B3': {
      const mal = prim === 'duo-kant-pil' ? 'kantpricken' : 'satelliten';
      return {
        title: 'Pilen pekar mot pricken',
        rule: `I fem av figurerna pekar pilen i mitten mot ${mal}. I den som bryter pekar den åt ett annat håll.`,
        misstag: V.map((_, k) => (k === brytare ? '' : `Den här följer regeln: pilen pekar mot ${mal}.`)),
      };
    }
    case 'B4':
      return {
        title: 'Samma mönster, vridet',
        rule: 'Fem av figurerna är samma mönster, bara vridet. Den som bryter är spegelvänd.',
        misstag: V.map((_, k) => (k === brytare ? '' : 'Den här följer regeln: samma mönster, vridet.')),
      };
    default: throw new Error(`okänd mall ${mall}`);
  }
}
void versal;

// ---------------------------------------------------------------- mallarna
const valj = (r, a) => a[Math.floor(r() * a.length)];
function blanda(r, arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const LAGEN = [0, 1, 2, 3, 4, 5, 6, 7];
const SYMBOLER_DUO = ['plus', 'minus', 'cross', 'ring'];
const SYMBOLER_STACK = ['plus', 'minus', 'dot', 'ring', 'cross'];

/** Fem fria värden ur listan med minst tre olika. */
function femFria(r, lista) {
  for (;;) {
    const v = Array.from({ length: 5 }, () => valj(r, lista));
    if (new Set(v).size >= 3) return v;
  }
}

/** Osymmetriska mönster med tre och fyra lägen för B4 (kontrolleras med arKiralt). */
export const KIRALA = [[0, 1, 3], [0, 1, 4], [0, 2, 3], [0, 1, 2, 4], [0, 1, 3, 4], [0, 1, 2, 5], [0, 2, 3, 4], [0, 1, 3, 6]].filter(arKiralt);

/**
 * En variant ger { prim, celler (fem som följer regeln och brytaren sist),
 * regel } ur slumpen. Brytarens plats bestäms av generatorn.
 */
const B1 = (prim, [lo, hi], [min, max]) => ({
  namn: `${prim}-antal`,
  prim,
  bygg: (r) => {
    const n = lo + Math.floor(r() * (hi - lo + 1));
    const nb = valj(r, [n - 1, n + 1].filter((x) => x >= min && x <= max));
    const starter = blanda(r, LAGEN).slice(0, 5);
    const sym = prim === 'duo-kant-symbol' ? femFria(r, SYMBOLER_DUO) : null;
    const celler = starter.map((s, i) => byggMangd(prim, bage(s, n), { ksymbol: sym?.[i] }));
    celler.push(byggMangd(prim, bage(valj(r, starter), nb), { ksymbol: sym ? valj(r, sym) : undefined }));
    return { prim, celler, regel: { typ: 'lika', egenskaper: ['antal'], prim } };
  },
});

const B2 = (prim) => ({
  namn: `${prim}-samband`,
  prim,
  bygg: (r) => {
    const stack = prim === 'grundform';
    const former = blanda(r, stack ? ['circle', 'square', 'triangle', 'diamond'] : ['circle', 'square', 'diamond']).slice(0, 2);
    const fyll = blanda(r, ['none', 'black']);
    const tre = valj(r, [0, 1]);
    const formLista = blanda(r, [former[tre], former[tre], former[tre], former[1 - tre], former[1 - tre]]);
    const fria = stack ? femFria(r, SYMBOLER_STACK) : blanda(r, LAGEN).slice(0, 5);
    const cell = (f, y, fri) => (stack ? byggStack(f, fri, y) : byggDuoForm(prim === 'duo-kant-form' ? 'kant' : 'orbital', fri, f, y));
    const celler = formLista.map((f, i) => cell(f, fyll[former.indexOf(f)], fria[i]));
    const bf = valj(r, [0, 1]);
    celler.push(cell(former[bf], fyll[1 - bf], valj(r, fria)));
    return { prim, celler, regel: { typ: 'samband', fran: stack ? 'bas' : 'kform', till: stack ? 'fyllning' : 'kfyll', prim } };
  },
});

const B3 = (prim) => ({
  namn: `${prim}-relation`,
  prim,
  bygg: (r) => {
    const y = prim === 'duo-kant-pil' ? 'kant' : 'orbital';
    const lagen = blanda(r, LAGEN).slice(0, 5);
    const celler = lagen.map((l) => byggDuoPil(y, l, l));
    const fel = valj(r, [2, 4, 6]);
    const mojliga = lagen.filter((l) => lagen.includes(mod(l + fel, 8)));
    if (!mojliga.length) return null;
    const l = valj(r, mojliga);
    celler.push(byggDuoPil(y, l, l + fel));
    return { prim, celler, regel: { typ: 'relation', a: 'ylage', b: 'kvinkel', vinkel: 0, prim } };
  },
});

const B4 = (prim) => ({
  namn: `${prim}-spegel`,
  prim,
  bygg: (r) => {
    const P = valj(r, KIRALA);
    const vrid = blanda(r, LAGEN).slice(0, 5);
    const celler = vrid.map((v) => byggMangd(prim, rotera(P, v)));
    celler.push(byggMangd(prim, rotera(spegla(P), Math.floor(r() * 8))));
    return { prim, celler, regel: { typ: 'lika', egenskaper: ['klass'], prim } };
  },
});

export const BRYTER_MALLAR = [
  {
    id: 'B1', namn: 'Antal', niva: 'grund', antal: 8, p_prior: 0.75, difficulty: 1, family: 'antal',
    varianter: [B1('stralar', [2, 4], [2, 5]), B1('sektor', [2, 4], [1, 5]), B1('block', [2, 4], [1, 5]), B1('duo-kant-symbol', [2, 4], [1, 5])],
  },
  {
    id: 'B2', namn: 'Samband', niva: 'grund', antal: 8, p_prior: 0.72, difficulty: 2, family: 'fyllning',
    varianter: [B2('grundform'), B2('duo-kant-form'), B2('duo-orbital-form')],
  },
  {
    id: 'B3', namn: 'Relation i duo', niva: 'avancerad', antal: 10, p_prior: 0.5, difficulty: 2, family: 'flera',
    varianter: [B3('duo-kant-pil'), B3('duo-orbital-pil')],
  },
  {
    id: 'B4', namn: 'Vridet mönster', niva: 'avancerad', antal: 6, p_prior: 0.48, difficulty: 3, family: 'vridning',
    varianter: [B4('sektor'), B4('stralar')],
  },
];

/** Grupp för kvoten: duo med kant och duo med orbital är var sin grupp. */
export const grupp = (prim) => (prim.startsWith('duo-kant') ? 'duo-kant' : prim.startsWith('duo-orbital') ? 'duo-orbital' : prim);

export const SERIE_FRAGA_BRYTER = 'Vilken figur bryter mönstret?';
