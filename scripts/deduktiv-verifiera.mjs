#!/usr/bin/env node
// scripts/deduktiv-verifiera.mjs
// =============================================================================
// Oberoende verifiering av deduktivbanken (frågebanken 2026-11-19). Delar
// ingen kod med generatorn eller spärrarna i scripts/lib/deduktiv/, så ett fel
// där fångas här i stället för att bekräfta sig självt.
//
// D2 och D3 (schemapussel): läser TEXTEN som kandidaten ser (inledningen,
// villkoren, frågan och alternativen), tolkar den till villkor och prövar
// alla tilldelningar av elementen på platserna (högst 6! = 720). Kräver:
//   - exakt en lösning med alla villkor (i D3 med antagandet i frågan),
//   - i D3 minst två lösningar utan antagandet,
//   - inget villkor överflödigt,
//   - exakt ett alternativ är svaret, och det är facit:
//       vem      eleméntet på den frågade platsen i lösningen,
//       måste    sant i varje lösning (alla andra falska i lösningen),
//       omöjligt falskt i varje lösning med antagandet, de andra möjliga,
//   - tolkningen av texten stämmer med den formella formen (samma lösning).
// D1 (premisskedja): egen mängdmodell över termernas Venn-områden och de
// namngivna individerna. Alla modeller prövas, både med och utan krav på att
// mängderna i "alla" och "inga" har medlemmar. Facit ska vara nödvändigt i
// båda läsningarna, varje distraktor inte nödvändig i någon.
//
// Nästan-dubbletter (omgång 2, 2026-11-19): två schemapussel är samma när
// villkoren (och antagandet) blir lika efter att elementen döpts om och/eller
// raden speglats (plats k blir n+1-k, vänster blir höger). Temat räknas inte:
// kollegor i rad och pärmar på hylla är samma pussel. Frågan räknas inte
// heller: samma pussel med en annan fråga är en nästan-dubblett. Två
// premisskedjor är nästan-dubbletter när premissernas ord överlappar till
// minst hälften (Jaccard). Uppgifter från version 4 och senare får inte ha
// någon nästan-dubblett bland alla andra (pensionerade inräknade). Par där
// båda är äldre skrivs ut som kända: kontrollen kom efter version 3, och de
// paren får testansvarig ta ställning till (inget byter innehåll under sitt id).
//
// Kör: node scripts/deduktiv-verifiera.mjs [fil ...]   (standard: bankfilerna)
// Exit 1 vid fel.
// =============================================================================

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const STANDARD = ['src/lib/deduktivV1/bankGrund.json', 'src/lib/deduktivV1/bankAvancerad.json', 'src/lib/deduktivV1/bankExpert.json'];
const filer = process.argv.slice(2).length ? process.argv.slice(2) : STANDARD;

/* ------------------------------- permutationer ------------------------------ */

function permutationer(n) {
  const ut = [];
  const p = [];
  const tagen = new Array(n + 1).fill(false);
  (function rek() {
    if (p.length === n) return void ut.push(p.slice());
    for (let k = 1; k <= n; k++) {
      if (tagen[k]) continue;
      tagen[k] = true;
      p.push(k);
      rek();
      p.pop();
      tagen[k] = false;
    }
  })();
  return ut;
}

/* ------------------------------ tolka texten -------------------------------- */

const ORDTAL = { fyra: 4, fem: 5, sex: 6 };

/** Elementets nyckel ur en fras: "Den röda bilen" -> "röd:bilen", "Anna" -> "anna". */
function elementNyckel(fras) {
  const s = fras.trim();
  const m = /^[Dd]en (\S+) (\S+)$/.exec(s);
  if (m) return `${m[1].toLowerCase()}:${m[2].toLowerCase()}`;
  if (/^[A-ZÅÄÖ][a-zåäö]+$/.test(s)) return s.toLowerCase();
  return null;
}

const VERB = '(?:står|ligger|sitter)';
const EL = '((?:[Dd]en [^\\s.,]+ [^\\s.,]+)|(?:[A-ZÅÄÖ][a-zåäö]+))';
const MONSTER = [
  [new RegExp(`^${EL} ${VERB} inte på plats (\\d)\\.?$`), (m) => ({ typ: 'inte_plats', a: m[1], k: +m[2] })],
  [new RegExp(`^${EL} ${VERB} på plats (\\d)\\.?$`), (m) => ({ typ: 'plats', a: m[1], k: +m[2] })],
  [new RegExp(`^${EL} ${VERB} inte bredvid ${EL}\\.?$`), (m) => ({ typ: 'inte_granne', a: m[1], b: m[2] })],
  [new RegExp(`^${EL} ${VERB} bredvid ${EL}\\.?$`), (m) => ({ typ: 'granne', a: m[1], b: m[2] })],
  [new RegExp(`^${EL} ${VERB} någonstans till vänster om ${EL}\\.?$`), (m) => ({ typ: 'fore', a: m[1], b: m[2] })],
  [new RegExp(`^${EL} ${VERB} direkt till vänster om ${EL}\\.?$`), (m) => ({ typ: 'direkt', a: m[1], b: m[2] })],
  [new RegExp(`^${EL} (?:går|intervjuas) före ${EL}\\.?$`), (m) => ({ typ: 'fore', a: m[1], b: m[2] })],
  [new RegExp(`^${EL} och ${EL} (?:går|intervjuas) samma dag\\.?$`), (m) => ({ typ: 'grupp', a: m[1], b: m[2] })],
];

function tolkaPastaende(text, element) {
  for (const [re, bygg] of MONSTER) {
    const m = re.exec(text.trim());
    if (!m) continue;
    const c = bygg(m);
    const idx = (fras) => {
      const k = elementNyckel(fras);
      if (k == null) throw new Error(`okänt element "${fras}" i "${text}"`);
      if (!element.has(k)) element.set(k, element.size);
      return element.get(k);
    };
    return { ...c, a: idx(c.a), ...(c.b != null ? { b: idx(c.b) } : {}) };
  }
  throw new Error(`texten går inte att tolka: "${text}"`);
}

function tolkaSchema(q) {
  const intro = q.intro ?? '';
  const nm = /^(Fyra|Fem|Sex)\b/i.exec(intro);
  const n = nm ? ORDTAL[nm[1].toLowerCase()] : null;
  if (!n) throw new Error(`antalet går inte att läsa ur inledningen: "${intro}"`);
  if (!new RegExp(`plats 1 till ${n}`).test(intro)) throw new Error('inledningen nämner inte plats 1 till n');
  let grupper = null;
  const gm = /Plats 1 till (\d) [^.]* och plats (\d) till (\d)/.exec(intro);
  if (gm) {
    const a = +gm[1];
    grupper = [Array.from({ length: a }, (_, i) => i + 1), Array.from({ length: +gm[3] - +gm[2] + 1 }, (_, i) => +gm[2] + i)];
  }
  const element = new Map();
  const villkor = q.villkor.map((t) => tolkaPastaende(t, element));
  let fraga;
  let antagande = null;
  const fv = /på plats (\d)(?: i turordningen)?\?$/.exec(q.fraga);
  const fo = /^Om (.+), vilket är då omöjligt\?$/.exec(q.fraga);
  if (fo) {
    antagande = tolkaPastaende(fo[1].replace(/^den /, 'Den ').replace(/^./, (x) => x.toUpperCase()), element);
    if (antagande.typ !== 'plats') throw new Error('antagandet är inte en plats');
    fraga = { form: 'omojlig' };
  } else if (/^Vilket måste vara sant\?$/.test(q.fraga)) fraga = { form: 'maste' };
  else if (q.typ === 'D4' && /^Vilket kan inte vara sant\?$/.test(q.fraga)) fraga = { form: 'kan_inte' };
  else if (fv && /^(Vem|Vilken)/.test(q.fraga)) fraga = { form: 'vem', k: +fv[1] };
  else throw new Error(`frågan går inte att tolka: "${q.fraga}"`);
  const alternativ = q.options.map((o) => {
    if (fraga.form !== 'vem') return tolkaPastaende(o, element);
    const k = elementNyckel(o);
    if (k == null) throw new Error(`alternativet "${o}" är inget element`);
    if (!element.has(k)) element.set(k, element.size);
    return element.get(k);
  });
  if (element.size > n) throw new Error(`${element.size} element nämns, inledningen säger ${n}`);
  return { n, grupper, villkor, antagande, fraga, alternativ, element };
}

function galler(c, pos, grupper) {
  const pa = pos[c.a];
  const pb = c.b != null ? pos[c.b] : null;
  switch (c.typ) {
    case 'plats': return pa === c.k;
    case 'inte_plats': return pa !== c.k;
    case 'granne': return Math.abs(pa - pb) === 1;
    case 'inte_granne': return Math.abs(pa - pb) !== 1;
    case 'fore': return pa < pb;
    case 'direkt': return pb === pa + 1;
    case 'grupp': {
      if (!grupper) throw new Error('"samma dag" utan dagar i inledningen');
      return grupper.findIndex((g) => g.includes(pa)) === grupper.findIndex((g) => g.includes(pb));
    }
    default: throw new Error(`okänt villkor ${c.typ}`);
  }
}

function verifieraSchema(q) {
  const fel = [];
  const t = tolkaSchema(q);
  const P = permutationer(t.n);
  const losn = (vs) => P.filter((p) => vs.every((c) => galler(c, p, t.grupper)));
  const alla = t.antagande ? [...t.villkor, t.antagande] : t.villkor;
  const S = losn(alla);
  if (S.length !== 1) return [`${S.length} lösningar, ska vara exakt en`];
  const [pos] = S;
  if (q.typ === 'D3') {
    if (!t.antagande) fel.push('D3 utan antagande');
    else if (losn(t.villkor).length < 2) fel.push('antagandet behövs inte: grundpusslet har redan en lösning');
  }
  alla.forEach((_, i) => {
    if (losn(alla.filter((__, j) => j !== i)).length === 1) fel.push(i < t.villkor.length ? `villkor ${i + 1} är överflödigt` : 'antagandet är överflödigt');
  });
  const svar = t.alternativ.map((x) => {
    if (t.fraga.form === 'vem') return pos[x] === t.fraga.k;
    if (t.fraga.form === 'maste') return galler(x, pos, t.grupper);
    return !galler(x, pos, t.grupper);
  });
  const ratt = svar.map((s, i) => (s ? i : -1)).filter((i) => i >= 0);
  if (ratt.length !== 1) fel.push(`${ratt.length} alternativ stämmer, ska vara exakt ett`);
  else if (ratt[0] !== q.correctAnswer) fel.push(`alternativ ${ratt[0] + 1} stämmer, facit säger ${q.correctAnswer + 1}`);
  // Den formella formen ska ge samma lösning som texten.
  const f = q.formell;
  if (f?.namn) {
    if (f.namn.length !== t.n) fel.push('formell: antalet element skiljer sig från texten');
    const elNyckel = (x) => (f.tema === 'personer' || f.tema === 'turordning' || f.tema === 'bord' || f.tema === 'intervjuer' ? x.toLowerCase() : null);
    f.namn.forEach((x, i) => {
      // Färgerna står i bestämd form i texten ("den gröna pärmen"): grundformen är början på nyckeln.
      const nyckel = elNyckel(x) ?? [...t.element.keys()].find((k) => k.split(':')[0].startsWith(x));
      if (nyckel && t.element.has(nyckel)) {
        const ti = t.element.get(nyckel);
        if (pos[ti] !== schemaPlats(q, i)) fel.push(`formell: ${x} står på plats ${schemaPlats(q, i)} i remsan, texten ger plats ${pos[ti]}`);
      }
    });
  }
  return fel;
}

/** Elementets plats i remsan (losning.schema.namn), 1-indexerad. */
function schemaPlats(q, i) {
  const namn = q.formell.namn[i].toLowerCase();
  const rad = q.losning?.schema?.namn ?? [];
  const k = rad.findIndex((r) => r.some((x) => x.toLowerCase() === namn));
  return k + 1;
}

/* ----------------------------------- D1 ------------------------------------- */

function sats(s, finns, har, indTyp, iidx) {
  switch (s.typ) {
    case 'alla': return finns.every((f, t) => !f || !har(t, s.x) || har(t, s.y));
    case 'inga': return finns.every((f, t) => !f || !har(t, s.x) || !har(t, s.y));
    case 'nagra': return finns.some((f, t) => f && har(t, s.x) && har(t, s.y));
    case 'nagra_inte': return finns.some((f, t) => f && har(t, s.x) && !har(t, s.y));
    case 'ar': return har(indTyp[iidx[s.i]], s.x);
    case 'ar_inte': return !har(indTyp[iidx[s.i]], s.x);
    default: throw new Error(`okänd sats ${s.typ}`);
  }
}

/** 'nodvandig' | 'omojlig' | 'obestamd' | 'motsagelse' över alla modeller. */
function d1Status(f, pastaende, existens) {
  const m = f.termer.length;
  const typer = 1 << m;
  const ti = Object.fromEntries(f.termer.map((x, i) => [x, i]));
  const iidx = Object.fromEntries(f.individer.map((x, i) => [x, i]));
  const har = (t, x) => {
    if (!(x in ti)) throw new Error(`okänd term ${x}`);
    return ((t >> ti[x]) & 1) === 1;
  };
  const prem = f.premisser.flat();
  const krav = existens ? prem.filter((s) => s.typ === 'alla' || s.typ === 'inga').map((s) => s.x) : [];
  let sant = false;
  let falskt = false;
  for (let mask = 1; mask < 2 ** typer; mask++) {
    const finns = Array.from({ length: typer }, (_, t) => ((mask >> t) & 1) === 1);
    if (krav.some((x) => !finns.some((ff, t) => ff && har(t, x)))) continue;
    const bef = finns.flatMap((ff, t) => (ff ? [t] : []));
    const k = f.individer.length;
    const ind = new Array(k).fill(0);
    const rek = (j) => {
      if (j === k) {
        if (!prem.every((s) => sats(s, finns, har, ind, iidx))) return;
        if (sats(pastaende, finns, har, ind, iidx)) sant = true;
        else falskt = true;
        return;
      }
      for (const t of bef) {
        ind[j] = t;
        rek(j + 1);
      }
    };
    rek(0);
    if (sant && falskt) return 'obestamd';
  }
  if (!sant && !falskt) return 'motsagelse';
  return sant ? 'nodvandig' : 'omojlig';
}

function verifieraD1(q) {
  const f = q.formell;
  const fel = [];
  if (f.premisser.length !== q.villkor.length) fel.push('formell: antalet premisser skiljer sig från texten');
  if (f.alternativ.length !== q.options.length) fel.push('formell: antalet alternativ skiljer sig från texten');
  const nodv = [];
  f.alternativ.forEach((a, i) => {
    const s0 = d1Status(f, a, false);
    const s1 = d1Status(f, a, true);
    if (s0 === 'motsagelse' || s1 === 'motsagelse') fel.push('premisserna motsäger varandra');
    if (s0 !== s1) fel.push(`alternativ ${i + 1}: ${s0} utan existens, ${s1} med`);
    if (s0 === 'nodvandig' || s1 === 'nodvandig') nodv.push(i);
  });
  if (nodv.length !== 1) fel.push(`${nodv.length} alternativ måste gälla, ska vara exakt ett`);
  else if (nodv[0] !== q.correctAnswer) fel.push(`alternativ ${nodv[0] + 1} måste gälla, facit säger ${q.correctAnswer + 1}`);
  return fel;
}

/* ----------------------------- nästan-dubbletter ----------------------------- */

/** Från den här bankversionen fäller en nästan-dubblett uppgiften. */
export const DUBBLETTKONTROLL_FRAN = 4;

/** Pusslets nyckel oberoende av namn, spegling, tema och fråga. */
export function pusselNyckel(q) {
  const t = tolkaSchema(q);
  const n = t.n;
  const vs = t.antagande ? [...t.villkor, { ...t.antagande, typ: 'om_plats' }] : t.villkor;
  const SYM = new Set(['granne', 'inte_granne', 'grupp']);
  const RIKTAD = new Set(['fore', 'direkt']);
  let bast = null;
  for (const perm of permutationer(n)) {
    for (const spegel of [false, true]) {
      const rad = vs.map((c) => {
        let a = perm[c.a];
        let b = c.b != null ? perm[c.b] : null;
        let k = c.k ?? null;
        if (spegel) {
          if (k != null) k = n + 1 - k;
          if (RIKTAD.has(c.typ)) [a, b] = [b, a];
        }
        if (SYM.has(c.typ) && b < a) [a, b] = [b, a];
        return `${c.typ}:${a}:${b ?? ''}:${k ?? ''}`;
      }).sort().join('|');
      if (bast == null || rad < bast) bast = rad;
    }
  }
  return `${t.grupper ? 'dag' : 'rad'}:${n}:${bast}`;
}

const ORD = (q) => new Set(q.villkor.join(' ').toLowerCase().replace(/[^a-zåäö0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length >= 4));
function jaccard(a, b) {
  let s = 0;
  for (const x of a) if (b.has(x)) s++;
  return s / (a.size + b.size - s);
}

/**
 * Lös nyckel (granskning omgång 2, 2026-11-19): villkorstyperna och hur
 * villkoren knyter ihop elementen, utan de exakta platserna, plus
 * lösningsgången som följd av villkorstyper per steg. Fångar pussel där bara
 * en fast plats eller ett "inte på plats" har flyttats. Två nycklar, och lika
 * på någon av dem ger en varning (fäller inte):
 *   graf    villkoren utan platser, med namnbyte och spegling,
 *   gang    villkorstyperna som mängd plus lösningsgången,
 *   monster villkorstyperna plus vilka slags steg gången har (lås, kedja,
 *           kvar, fall, antagande, övrigt), oavsett ordning och gruppering
 *           (omgranskningen 2026-11-19: dd-a-d2-79 och 101),
 *   kedja   bara satt när gången är "lås platser, en kedja fyller resten"
 *           (omgranskningen: 110 och 114, 06, 64 och 116); två sådana i
 *           samma tema och storlek varnas även med olika villkorstyper.
 */
export function losaNycklar(q) {
  const t = tolkaSchema(q);
  const n = t.n;
  const vs = t.antagande ? [...t.villkor, { ...t.antagande, typ: 'om_plats' }] : t.villkor;
  const SYM = new Set(['granne', 'inte_granne', 'grupp']);
  const RIKTAD = new Set(['fore', 'direkt']);
  let bast = null;
  for (const perm of permutationer(n)) {
    for (const spegel of [false, true]) {
      const rad = vs.map((c) => {
        let a = perm[c.a];
        let b = c.b != null ? perm[c.b] : null;
        if (spegel && RIKTAD.has(c.typ)) [a, b] = [b, a];
        if (SYM.has(c.typ) && b < a) [a, b] = [b, a];
        return `${c.typ}:${a}:${b ?? ''}`;
      }).sort().join('|');
      if (bast == null || rad < bast) bast = rad;
    }
  }
  const typ = (m) => (m === 'Om' ? 'om' : m === 'Kvar' ? 'kvar' : t.villkor[m - 1]?.typ ?? '?');
  const gang = (q.losning?.steg ?? []).map((st) => st.markor.map(typ).sort().join('+')).join('>');
  const typer = vs.map((c) => c.typ).sort().join(',');
  const tema = `${t.grupper ? 'dag' : 'rad'}:${n}`;
  const ORDNA = new Set(['fore', 'direkt']);
  const slag = (q.losning?.steg ?? []).map((st) => {
    if (st.markor.includes('Om')) return 'om';
    if (/^Kvar för/.test(st.foljd)) return 'kvar';
    if (/^Med .* inte ihop/.test(st.foljd)) return 'fall';
    const ty = st.markor.map(typ);
    if (ty.every((x) => x === 'plats')) return 'las';
    if (ty.every((x) => ORDNA.has(x))) return 'kedja';
    return 'ovrigt';
  });
  const mangd = [...new Set(slag)].sort().join(',');
  const barKedja = slag.length && slag.every((x) => x === 'las' || x === 'kedja' || x === 'om') && slag.includes('kedja');
  return { graf: `${tema}:${bast}`, gang: `${tema}:${typer}#${gang}`, monster: `${tema}:${typer}#${mangd}`, kedja: barKedja ? tema : null };
}

/** Par med samma lösa nyckel (graf, gång, mönster eller ren kedja) som inte redan är nästan-dubbletter: [a, b]. */
export function lika(lista) {
  const x = lista.filter((q) => q.typ === 'D2' || q.typ === 'D3').map((q) => ({ q, ...losaNycklar(q), p: pusselNyckel(q) }));
  const ut = [];
  for (let i = 0; i < x.length; i++)
    for (let j = i + 1; j < x.length; j++)
      if (
        x[i].p !== x[j].p &&
        (x[i].graf === x[j].graf || x[i].gang === x[j].gang || x[i].monster === x[j].monster || (x[i].kedja && x[i].kedja === x[j].kedja))
      )
        ut.push([x[i].q, x[j].q]);
  return ut;
}

/** Par av nästan-dubbletter i listan: [a, b, skäl]. */
export function nastanDubbletter(lista) {
  const ut = [];
  const schema = lista.filter((q) => q.typ === 'D2' || q.typ === 'D3').map((q) => ({ q, k: pusselNyckel(q) }));
  const perNyckel = new Map();
  for (const x of schema) {
    if (!perNyckel.has(x.k)) perNyckel.set(x.k, []);
    perNyckel.get(x.k).push(x.q);
  }
  for (const grupp of perNyckel.values())
    for (let i = 0; i < grupp.length; i++) for (let j = i + 1; j < grupp.length; j++) ut.push([grupp[i], grupp[j], 'samma pussel med andra namn, spegling eller fråga']);
  const d1 = lista.filter((q) => q.typ === 'D1').map((q) => ({ q, o: ORD(q) }));
  for (let i = 0; i < d1.length; i++)
    for (let j = i + 1; j < d1.length; j++) {
      const v = jaccard(d1[i].o, d1[j].o);
      if (v >= 0.5) ut.push([d1[i].q, d1[j].q, `premissernas ord överlappar till ${Math.round(v * 100)} procent`]);
    }
  ut.push(...d4Dubbletter(lista));
  return ut;
}

/* ------------------------------------ D4 ------------------------------------ */
// Omgång 3 (bankversion 5): nya familjer med egna lösningsgångar. Varje familj
// tolkas ur TEXTEN med egna mallar här (ingen kod från scripts/lib/deduktiv/),
// och svaret prövas mot alla modeller. Frågeformerna:
//   "Vad måste gälla?"                          exakt ett alternativ gäller i alla modeller
//   "Vilket kan inte vara sant?"                exakt ett gäller i ingen modell
//   "Vilken slutsats följer inte av villkoren?" exakt ett gäller inte i alla modeller
//   "Exakt vilka av dem är lögnare?"            exakt en lösning, alternativen är mängder
//   "Vem ...?"                                  exakt en lösning, alternativen är namn
// Dessutom: inget villkor är överflödigt (tas ett bort är facit inte längre ensamt svar).

const FRAGA_D4 = {
  'Vad måste gälla?': 'maste',
  'Vilket kan inte vara sant?': 'kan_inte',
  'Vilken slutsats följer inte av villkoren?': 'foljer_inte',
  'Exakt vilka av dem är lögnare?': 'maste',
};

/** Svaren (index) givet en statusfunktion över alternativen. */
function svarD4(form, st) {
  const ar = (s) => (form === 'maste' ? s === 'n' : form === 'kan_inte' ? s === 'o' : s !== 'n');
  return st.map((s, i) => (ar(s) ? i : -1)).filter((i) => i >= 0);
}

/** Status 'n' (alla), 'o' (ingen), 'b' (några) för påståendet över modellerna. */
function st3(M, galler) {
  const s = M.filter(galler).length;
  return s === M.length ? 'n' : s === 0 ? 'o' : 'b';
}

/** Gemensam prövning: modeller(med) ger modellerna med villkoren i `med`. */
function provaD4(q, form, antal, modellerMed, alt) {
  const fel = [];
  const alla = Array.from({ length: antal }, (_, i) => i);
  const M = modellerMed(alla);
  if (!M.length) return ['villkoren motsäger varandra'];
  const st = alt.map((g) => st3(M, g));
  const svar = svarD4(form, st);
  if (svar.length !== 1) fel.push(`${svar.length} alternativ är svar, ska vara exakt ett`);
  else if (svar[0] !== q.correctAnswer) fel.push(`alternativ ${svar[0] + 1} är svaret, facit säger ${q.correctAnswer + 1}`);
  alla.forEach((i) => {
    // Ett lockvillkor i om_sa bär en fälla som en distraktors misstag pekar på.
    const lock = new RegExp(`(^|[^0-9])[Vv]illkor ${i + 1}([^0-9]|$)`);
    if (q.family === 'om_sa' && (q.misstag ?? []).some((m, j) => j !== q.correctAnswer && lock.test(m) && /säger inget om vad som gäller om|visar inte att/.test(m))) return;
    const M2 = modellerMed(alla.filter((j) => j !== i));
    const s2 = svarD4(form, alt.map((g) => st3(M2, g)));
    if (s2.length === 1 && s2[0] === q.correctAnswer) fel.push(`villkor ${i + 1} är överflödigt`);
  });
  return { fel, M };
}

/* om_sa: atomerna (s, v, r) ur formell, texterna byggs här och slås upp. */
function omsaTexter(atomer) {
  const st = (s) => s[0].toUpperCase() + s.slice(1);
  const F = atomer.map((x) => {
    const r = x.r ? ` ${x.r}` : '';
    return { h: [`${st(x.s)} ${x.v}${r}`, `${st(x.s)} ${x.v} inte${r}`], hl: [`${x.s} ${x.v}${r}`, `${x.s} ${x.v} inte${r}`], b: [`${x.s} ${x.v}${r}`, `${x.s} inte ${x.v}${r}`], i: [`${x.v} ${x.s}${r}`, `${x.v} ${x.s} inte${r}`] };
  });
  const karta = new Map();
  const lit = [];
  F.forEach((_, a) => [0, 1].forEach((ng) => lit.push({ a, ng })));
  for (const l of lit) karta.set(`${F[l.a].h[l.ng]}.`, { t: 'lit', l });
  for (const p of lit)
    for (const r of lit) {
      if (p.a === r.a) continue;
      karta.set(`Om ${F[p.a].b[p.ng]}, ${F[r.a].i[r.ng]}.`, { t: 'om', p, r });
      karta.set(`${F[p.a].h[p.ng]} och ${F[r.a].hl[r.ng]}.`, { t: 'och', p, r });
    }
  return karta;
}
function omsaVarde(x, m) {
  const l = (y) => (((m >> y.a) & 1) === 1) !== (y.ng === 1);
  if (x.t === 'lit') return l(x.l);
  if (x.t === 'om') return !l(x.p) || l(x.r);
  return l(x.p) && l(x.r);
}
function tolkaOmsa(q) {
  const atomer = q.formell?.atomer;
  if (!Array.isArray(atomer) || atomer.length < 2 || atomer.length > 5) throw new Error('om_sa: atomerna saknas');
  const karta = omsaTexter(atomer);
  const las = (t) => {
    const x = karta.get(t);
    if (!x) throw new Error(`texten går inte att tolka: "${t}"`);
    return x;
  };
  return { n: atomer.length, villkor: q.villkor.map(las), alternativ: q.options.map(las) };
}
function verifieraOmsa(q, form) {
  const t = tolkaOmsa(q);
  const U = Array.from({ length: 1 << t.n }, (_, m) => m);
  const med = (idx) => U.filter((m) => idx.every((i) => omsaVarde(t.villkor[i], m)));
  return provaD4(q, form, t.villkor.length, med, t.alternativ.map((x) => (m) => omsaVarde(x, m))).fel;
}

/* kvantor: formell som D1 (mängdmodellen), frågeformen ur texten. */
function verifieraKvantor(q, form) {
  const f = q.formell;
  const fel = [];
  if (!/några betyder här minst en, kanske alla/.test(q.intro ?? '')) fel.push('kvantor: inledningen definierar inte några');
  if (f.villkor.length !== q.villkor.length) fel.push('formell: antalet villkor skiljer sig från texten');
  const g = { termer: f.termer, individer: f.individer ?? [] };
  const status = (prem, a) => {
    const s0 = d1Status({ ...g, premisser: prem }, a, false);
    const s1 = d1Status({ ...g, premisser: prem }, a, true);
    if (s0 !== s1 || s0 === 'motsagelse') return null;
    return s0 === 'nodvandig' ? 'n' : s0 === 'omojlig' ? 'o' : 'b';
  };
  const st = f.alternativ.map((a) => status(f.villkor, a));
  if (st.some((s) => s == null)) return [...fel, 'ett alternativ har olika status med och utan existens'];
  const svar = svarD4(form, st);
  if (svar.length !== 1) fel.push(`${svar.length} alternativ är svar, ska vara exakt ett`);
  else if (svar[0] !== q.correctAnswer) fel.push(`alternativ ${svar[0] + 1} är svaret, facit säger ${q.correctAnswer + 1}`);
  f.villkor.forEach((_, i) => {
    const prem = f.villkor.filter((__, j) => j !== i);
    const s2 = f.alternativ.map((a) => status(prem, a));
    if (s2.some((s) => s == null)) return;
    const sv = svarD4(form, s2);
    if (sv.length === 1 && sv[0] === q.correctAnswer) fel.push(`villkor ${i + 1} är överflödigt`);
  });
  return fel;
}

/* sanning: namnen ur inledningen, påståendena ur citaten. */
const TAL_D4 = { en: 1, två: 2, tre: 3, fyra: 4 };
function tolkaSanning(q) {
  const m = /^(Tre|Fyra) kollegor, (.+), säger en sak var\. Var och en är antingen sanningssägare eller lögnare\. En sanningssägare säger alltid något sant, och en lögnare säger alltid något falskt\.$/.exec(q.intro ?? '');
  if (!m) throw new Error('sanning: inledningen går inte att tolka');
  const n = TAL_D4[m[1].toLowerCase()];
  const namn = m[2].split(/, | och /);
  if (namn.length !== n) throw new Error('sanning: antalet namn stämmer inte');
  const idx = (x, talare) => {
    if (/^(jag|Jag|mig)$/.test(x)) {
      if (talare == null) throw new Error('jag utan talare');
      return talare;
    }
    const i = namn.indexOf(x);
    if (i < 0) throw new Error(`okänt namn ${x}`);
    return i;
  };
  const pastaende = (t, talare) => {
    const oss = talare == null ? 'dem' : `oss ${['', 'en', 'två', 'tre', 'fyra'][n]}`;
    let r;
    if ((r = /^(\S+) är lögnare\.$/.exec(t))) return (mm) => ((mm >> idx(r[1], talare)) & 1) === 1;
    if ((r = /^(\S+) är sanningssägare\.$/.exec(t))) return (mm) => ((mm >> idx(r[1], talare)) & 1) === 0;
    if ((r = /^(\S+) och (\S+) är båda lögnare\.$/.exec(t))) { const a = idx(r[1], talare), b = idx(r[2], talare); return (mm) => ((mm >> a) & 1) === 1 && ((mm >> b) & 1) === 1; }
    if ((r = /^(\S+) och (\S+) är båda sanningssägare\.$/.exec(t))) { const a = idx(r[1], talare), b = idx(r[2], talare); return (mm) => ((mm >> a) & 1) === 0 && ((mm >> b) & 1) === 0; }
    if ((r = /^Minst en av (\S+) och (\S+) är lögnare\.$/.exec(t))) { const a = idx(r[1], talare), b = idx(r[2], talare); return (mm) => ((mm >> a) & 1) === 1 || ((mm >> b) & 1) === 1; }
    if ((r = /^Exakt en av (\S+) och (\S+) är lögnare\.$/.exec(t))) { const a = idx(r[1], talare), b = idx(r[2], talare); return (mm) => ((mm >> a) & 1) !== ((mm >> b) & 1); }
    const antal = (mm) => Array.from({ length: n }, (_, i) => (mm >> i) & 1).reduce((s, x) => s + x, 0);
    if (t === `Ingen av ${oss} är lögnare.`) return (mm) => antal(mm) === 0;
    if ((r = new RegExp(`^Exakt (en|två|tre) av ${oss} är lögnare\\.$`).exec(t))) { const k = TAL_D4[r[1]]; return (mm) => antal(mm) === k; }
    if ((r = new RegExp(`^Minst (en|två|tre) av ${oss} är lögnare\\.$`).exec(t))) { const k = TAL_D4[r[1]]; return (mm) => antal(mm) >= k; }
    if (talare == null) {
      // Mängder: exakt de uppräknade är lögnare.
      let s = null;
      if (t === 'Ingen av dem') s = [];
      else if (t === `Alla ${['', '', '', 'tre', 'fyra'][n]}`) s = namn.map((_, i) => i);
      else if (/^[A-ZÅÄÖ][a-zåäö]+((, [A-ZÅÄÖ][a-zåäö]+)* och [A-ZÅÄÖ][a-zåäö]+)?$/.test(t)) s = t.split(/, | och /).map((x) => idx(x, null));
      if (s) return (mm) => namn.every((_, i) => (((mm >> i) & 1) === 1) === s.includes(i));
    }
    throw new Error(`påståendet går inte att tolka: "${t}"`);
  };
  const villkor = q.villkor.map((v) => {
    const r = /^(\S+) säger: ”(.+)”$/.exec(v);
    if (!r) throw new Error(`villkoret går inte att tolka: "${v}"`);
    const tal = idx(r[1], null);
    const p = pastaende(r[2], tal);
    return { tal, p, text: r[2] };
  });
  return { n, namn, villkor, alternativ: q.options.map((o) => pastaende(o, null)) };
}
function verifieraSanning(q, form) {
  const t = tolkaSanning(q);
  const U = Array.from({ length: 1 << t.n }, (_, m) => m);
  const med = (idx) => U.filter((m) => idx.every((i) => t.villkor[i].p(m) === (((m >> t.villkor[i].tal) & 1) === 0)));
  const { fel, M } = provaD4(q, form, t.villkor.length, med, t.alternativ);
  if (q.fraga === 'Exakt vilka av dem är lögnare?' && M.length !== 1) fel.push(`${M.length} lösningar, vilka-frågan kräver exakt en`);
  return fel;
}

/* tabell: kategoriernas fraser byggs här ur formell.kategorier (mall och värden). */
const BIL_D4 = { röd: 'röda', blå: 'blå', grön: 'gröna', vit: 'vita', svart: 'svarta', gul: 'gula' };
const MALL_D4 = {
  roll: { pos: (v) => `är ${v}`, neg: (v) => `är inte ${v}`, vk: (v, w) => `är varken ${v} eller ${w}` },
  stad: { pos: (v) => `bor i ${v}`, neg: (v) => `bor inte i ${v}`, vk: (v, w) => `bor varken i ${v} eller i ${w}` },
  kurs: { pos: (v) => `går kursen i ${v}`, neg: (v) => `går inte kursen i ${v}`, vk: (v, w) => `går varken kursen i ${v} eller kursen i ${w}` },
  dag: { pos: (v) => `är ledig på ${v}`, neg: (v) => `är inte ledig på ${v}`, vk: (v, w) => `är varken ledig på ${v} eller på ${w}` },
  bil: { pos: (v) => `kör den ${BIL_D4[v]} bilen`, neg: (v) => `kör inte den ${BIL_D4[v]} bilen`, vk: (v, w) => `kör varken den ${BIL_D4[v]} eller den ${BIL_D4[w]} bilen` },
  avd: { pos: (v) => `arbetar ${v}`, neg: (v) => `arbetar inte ${v}`, vk: (v, w) => `arbetar varken ${v} eller ${w}` },
  lunch: { pos: (v) => `äter lunch klockan ${v}`, neg: (v) => `äter inte lunch klockan ${v}`, vk: (v, w) => `äter lunch varken klockan ${v} eller klockan ${w}` },
};
function tolkaTabell(q) {
  const f = q.formell;
  const namn = f?.namn;
  const K = f?.kategorier;
  if (!namn || !K?.A || !K?.B) throw new Error('tabell: namn eller kategorier saknas');
  const n = namn.length;
  if (!(q.intro ?? '').startsWith(`${['', '', '', 'Tre', 'Fyra', 'Fem'][n]} kollegor, `)) throw new Error('tabell: inledningen stämmer inte med antalet');
  for (const k of ['A', 'B']) {
    if (K[k].varden.length !== n) throw new Error('tabell: antalet värden stämmer inte');
    // Avdelningarna står utan preposition i inledningen ("på lagret" blir "lagret").
    for (const v of K[k].varden) if (!q.intro.includes(K[k].mall === 'avd' ? v.replace(/^(på|i) /, '') : v)) throw new Error(`tabell: värdet ${v} saknas i inledningen`);
  }
  const fr = (k, typ, v, w) => MALL_D4[K[k].mall][typ](K[k].varden[v], w != null ? K[k].varden[w] : undefined);
  const karta = new Map();
  const vardeAv = (m, k, p) => m[k][p];
  const lagg = (text, g) => {
    if (karta.has(text)) throw new Error(`tabell: två tolkningar av "${text}"`);
    karta.set(text, g);
  };
  for (const k of ['A', 'B'])
    for (let v = 0; v < n; v++) {
      for (let p = 0; p < n; p++) {
        lagg(`${namn[p]} ${fr(k, 'pos', v)}.`, (m) => vardeAv(m, k, p) === v);
        lagg(`${namn[p]} ${fr(k, 'neg', v)}.`, (m) => vardeAv(m, k, p) !== v);
        for (let w = 0; w < n; w++) if (w !== v) lagg(`${namn[p]} ${fr(k, 'vk', v, w)}.`, (m) => vardeAv(m, k, p) !== v && vardeAv(m, k, p) !== w);
        for (let p2 = 0; p2 < n; p2++) if (p2 !== p) lagg(`Varken ${namn[p]} eller ${namn[p2]} ${fr(k, 'pos', v)}.`, (m) => vardeAv(m, k, p) !== v && vardeAv(m, k, p2) !== v);
      }
    }
  for (let a = 0; a < n; a++)
    for (let b = 0; b < n; b++) {
      const lank = (m) => m.B[m.A.indexOf(a)] === b;
      lagg(`Den som ${fr('A', 'pos', a)} ${fr('B', 'pos', b)}.`, lank);
      lagg(`Den som ${fr('B', 'pos', b)} ${fr('A', 'pos', a)}.`, lank);
      lagg(`Den som ${fr('A', 'pos', a)} ${fr('B', 'neg', b)}.`, (m) => !lank(m));
      lagg(`Den som ${fr('B', 'pos', b)} ${fr('A', 'neg', a)}.`, (m) => !lank(m));
    }
  const las = (t) => {
    const g = karta.get(t);
    if (!g) throw new Error(`texten går inte att tolka: "${t}"`);
    return g;
  };
  let vem = null;
  const vm = /^Vem (.+)\?$/.exec(q.fraga);
  if (vm) {
    for (const k of ['A', 'B']) for (let v = 0; v < n; v++) if (fr(k, 'pos', v) === vm[1]) vem = { k, v };
    if (!vem) throw new Error(`frågan går inte att tolka: "${q.fraga}"`);
  }
  const alternativ = q.options.map((o) => {
    if (!vem) return las(o);
    const p = namn.indexOf(o);
    if (p < 0) throw new Error(`alternativet "${o}" är inget namn`);
    return (m) => m[vem.k][p] === vem.v;
  });
  return { n, namn, villkor: q.villkor.map(las), alternativ, vem };
}
function verifieraTabell(q, form) {
  const t = tolkaTabell(q);
  const P = permutationer(t.n).map((p) => p.map((x) => x - 1));
  const U = [];
  for (const A of P) for (const B of P) U.push({ A, B });
  const med = (idx) => U.filter((m) => idx.every((i) => t.villkor[i](m)));
  const { fel, M } = provaD4(q, t.vem ? 'maste' : form, t.villkor.length, med, t.alternativ);
  if (t.vem && M.length !== 1) fel.push(`${M.length} lösningar, vem-frågan kräver exakt en`);
  return fel;
}

/* kan_inte: schemapusslet ur texten (tolkaSchema), flera lösningar. */
function verifieraKanInte(q) {
  const t = tolkaSchema(q);
  if (t.fraga.form !== 'kan_inte' || t.antagande) return ['kan_inte: frågan ska vara "Vilket kan inte vara sant?" utan antagande'];
  const P = permutationer(t.n);
  const med = (idx) => P.filter((p) => idx.every((i) => galler(t.villkor[i], p, t.grupper)));
  const { fel, M } = provaD4(q, 'kan_inte', t.villkor.length, med, t.alternativ.map((x) => (p) => galler(x, p, t.grupper)));
  if (M.length < 2) fel.push(`${M.length} lösning, kan_inte ska ha minst två`);
  return fel;
}

function verifieraD4(q) {
  const form = FRAGA_D4[q.fraga] ?? (/^Vem .+\?$/.test(q.fraga) ? 'maste' : null);
  if (!form) return [`frågan går inte att tolka: "${q.fraga}"`];
  if (q.losning?.schema != null) return ['D4 har ingen remsa'];
  switch (q.family) {
    case 'om_sa': return verifieraOmsa(q, form);
    case 'kvantor': return verifieraKvantor(q, form);
    case 'sanning': return verifieraSanning(q, form);
    case 'tabell': return verifieraTabell(q, form);
    case 'kan_inte': return verifieraKanInte(q);
    default: return [`okänd D4-familj ${q.family}`];
  }
}

/* ------------------------- D4: nycklar för dubbletter ------------------------ */
// Exakt nyckel (fäller): samma villkor efter namnbyte (och för om_sa negation av
// en atom, för kan_inte spegling). Frågan räknas inte. Lös nyckel (varnar):
//   om_sa    lösningsgången som följd av regler (framåt, bakåt, fall, motsägelse),
//   kvantor  villkorens former, för D1 och kvantor gemensamt,
//   sanning  antalet personer och påståendenas slag (med jag eller utan),
//   tabell   antalet personer och villkorens slag,
//   kan_inte villkoren utan platser (graf) plus påståendet som ska falla.

function omsaRegler(t) {
  // Framåt (MP) och bakåt (MT) ur fakta; utan fakta antas förledet i facit eller ett alternativ.
  const fakta = t.villkor.filter((x) => x.t === 'lit').map((x) => x.l);
  const imp = t.villkor.filter((x) => x.t === 'om');
  const nyck = (l) => `${l.a}:${l.ng}`;
  const kor = (start) => {
    const k = new Set(start.map(nyck));
    const regler = [];
    for (let v = 0; v < 12; v++) {
      let gjort = false;
      for (const c of imp) {
        const pk = nyck(c.p);
        const nq = nyck({ a: c.r.a, ng: 1 - c.r.ng });
        if (k.has(pk) && !k.has(nyck(c.r))) {
          k.add(nyck(c.r));
          regler.push(`fram${c.p.ng ? '-' : ''}${c.r.ng ? '-' : ''}`);
          gjort = true;
          break;
        }
        if (k.has(nq) && !k.has(nyck({ a: c.p.a, ng: 1 - c.p.ng }))) {
          k.add(nyck({ a: c.p.a, ng: 1 - c.p.ng }));
          regler.push(`bak${c.p.ng ? '-' : ''}${c.r.ng ? '-' : ''}`);
          gjort = true;
          break;
        }
      }
      if (!gjort) break;
    }
    const mots = [...k].some((x) => k.has(x.replace(/:(\d)$/, (_, d) => `:${1 - d}`)));
    return { regler, mots };
  };
  if (fakta.length) {
    const r = kor(fakta);
    if (r.regler.length >= 2 || r.mots) return r.regler.join('>');
  }
  // Inga eller för få steg: pröva antagande om varje literal; fall och motsägelse.
  const ut = [];
  for (let a = 0; a < 5; a++)
    for (const ng of [0, 1]) {
      const r = kor([...fakta, { a, ng }]);
      if (r.regler.length) ut.push(`${r.mots ? 'mots' : 'anta'}(${r.regler.join('>')})`);
    }
  return ut.sort().join('|');
}

function omsaExakt(t) {
  let bast = null;
  for (const perm of permutationer(t.n)) {
    for (let flip = 0; flip < 1 << t.n; flip++) {
      const L = (l) => `${perm[l.a]}${((flip >> l.a) & 1) ^ l.ng}`;
      const rad = t.villkor.map((x) => (x.t === 'lit' ? `l${L(x.l)}` : `${x.t}${L(x.p)}${L(x.r)}`)).sort().join(',');
      if (bast == null || rad < bast) bast = rad;
    }
  }
  return `om_sa:${t.n}:${bast}`;
}

/**
 * Kvantor och D1: premisserna efter namnbyte på termer och individer. Med
 * sym (den lösa nyckeln) räknas "inga x är y" och "några x är y" lika åt
 * båda hållen, som de är logiskt.
 */
export function premissNyckel(q, sym = false) {
  const f = q.formell;
  const prem = q.typ === 'D4' ? f.villkor : f.premisser;
  const T = f.termer;
  const I = f.individer ?? [];
  let bast = null;
  for (const pt of permutationer(T.length)) {
    for (const pi of permutationer(Math.max(I.length, 1))) {
      const tm = (x) => pt[T.indexOf(x)];
      const im = (x) => pi[I.indexOf(x)];
      const par = (s) => {
        const a = tm(s.x);
        const b = tm(s.y);
        return sym && (s.typ === 'inga' || s.typ === 'nagra') && b < a ? `${b}:${a}` : `${a}:${b}`;
      };
      const rad = prem.map((p) => p.map((s) => (s.i != null ? `${s.typ}:i${im(s.i)}:${tm(s.x)}` : `${s.typ}:${par(s)}`)).sort().join('+')).sort().join(',');
      if (bast == null || rad < bast) bast = rad;
    }
  }
  return `premiss:${T.length}:${I.length}:${bast}`;
}

function sanningExakt(q) {
  const t = tolkaSanning(q);
  // Påståendets struktur ur texten med namnen bytta mot index.
  const kod = q.villkor.map((v) => {
    const r = /^(\S+) säger: ”(.+)”$/.exec(v);
    return { tal: t.namn.indexOf(r[1]), text: r[2] };
  });
  let bast = null;
  for (const perm of permutationer(t.n)) {
    const rad = kod
      .map(({ tal, text }) => {
        let s = text;
        // \b räknar inte å, ä och ö som bokstäver, så gränserna skrivs ut.
        t.namn.forEach((x, i) => (s = s.replace(new RegExp(`(?<![A-Za-zÅÄÖåäö])${x}(?![A-Za-zÅÄÖåäö])`, 'g'), `#${perm[i]}`)));
        s = s.replace(/^(#\d) och (jag)/, '$2 och $1').replace(/^(#\d) och (#\d)/, (m0, a, b) => (a < b ? m0 : `${b} och ${a}`)).replace(/av (#\d|mig) och (#\d|mig)/, (m0, a, b) => (a < b ? m0 : `av ${b} och ${a}`));
        return `${perm[tal]}:${s}`;
      })
      .sort()
      .join('|');
    if (bast == null || rad < bast) bast = rad;
  }
  return `sanning:${t.n}:${bast}`;
}
function sanningLos(q) {
  const t = tolkaSanning(q);
  const slag = q.villkor.map((v) => {
    const r = /^(\S+) säger: ”(.+)”$/.exec(v);
    const s = r[2].replace(/(?<![A-Za-zÅÄÖåäö])[A-ZÅÄÖ][a-zåäö]+(?![A-Za-zÅÄÖåäö])/g, (x) => (t.namn.includes(x) ? 'X' : x)).replace(/\b(jag|Jag|mig)\b/g, 'J');
    return s;
  });
  return `sanning:${t.n}:${slag.sort().join('|')}`;
}

/** Tabell: Weisfeiler-Lehman-hash över personer, värden och villkor (isomorfa pussel får samma hash). */
function tabellExakt(q) {
  const f = q.formell;
  const n = f.namn.length;
  const noder = [];
  const kant = [];
  const P = (p) => p;
  const V = (k, v) => n + (k === 'A' ? 0 : n) + v;
  for (let i = 0; i < 3 * n; i++) noder.push(i < n ? 'P' : 'V');
  for (const c of f.villkor) {
    const id = noder.length;
    noder.push(c.typ);
    const e = (x, lbl) => kant.push([id, x, lbl]);
    if (c.p != null) e(P(c.p), 'p');
    if (c.q != null) e(P(c.q), 'p');
    if (c.v != null && c.kat) e(V(c.kat, c.v), 'v');
    if (c.w != null && c.kat) e(V(c.kat, c.w), 'v');
    if (c.typ === 'lank' || c.typ === 'inte_lank') {
      e(V('A', c.a), 'a');
      e(V('B', c.b), 'b');
    }
  }
  // Kategorierna kan bytas: A- och B-värden har samma etikett, kanterna a/b likaså.
  let lab = noder.slice();
  for (let r = 0; r < 4; r++) {
    const fore = lab;
    lab = fore.map((l, i) => {
      const gr = kant.filter(([a, b]) => a === i || b === i).map(([a, b, x]) => `${x === 'a' || x === 'b' ? 'ab' : x}:${fore[a === i ? b : a]}`).sort().join(',');
      return hash(`${l}(${gr})`);
    });
  }
  return `tabell:${n}:${f.villkor.length}:${hash(lab.slice().sort().join('|'))}`;
}
function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  return h.toString(16);
}
function tabellLos(q) {
  const f = q.formell;
  return `tabell:${f.namn.length}:${f.villkor.map((c) => c.typ).sort().join(',')}`;
}

/** kan_inte: exakt som schemapusslen (villkoren), lös som grafen plus påståendet. */
function kanInteExakt(q) {
  return pusselNyckel({ ...q, fraga: 'Vilket kan inte vara sant?' });
}
function kanInteLos(q) {
  const t = tolkaSchema(q);
  const facit = t.alternativ[q.correctAnswer];
  // Villkorstyperna som mängd med antal och påståendets typ, utan vilka element
  // de knyter ihop: fångar pussel där bara ett "inte på plats" har flyttats till
  // en annan person (granskning omgång 2, punkt 5 till 12).
  const typer = t.villkor.map((c) => c.typ).sort().join(',');
  return `kan_inte:${t.grupper ? 'dag' : 'rad'}:${t.n}:${typer}#${facit.typ}`;
}

/** Nycklarna för en D4-uppgift. */
export function d4Nycklar(q) {
  switch (q.family) {
    case 'om_sa': {
      const t = tolkaOmsa(q);
      return { exakt: omsaExakt(t), los: `om_sa:${omsaRegler(t)}` };
    }
    case 'kvantor': return { exakt: premissNyckel(q), los: `sym:${premissNyckel(q, true)}` };
    case 'sanning': return { exakt: sanningExakt(q), los: sanningLos(q) };
    case 'tabell': return { exakt: tabellExakt(q), los: tabellLos(q) };
    case 'kan_inte': return { exakt: kanInteExakt(q), los: kanInteLos(q) };
    default: throw new Error(`okänd D4-familj ${q.family}`);
  }
}

/** Den exakta nyckeln för schemapusslen utan antagande (D3:s grundpussel), för jämförelsen med kan_inte. */
function grundNyckel(q) {
  if (q.typ !== 'D3') return pusselNyckel(q);
  const x = { ...q, fraga: 'Vilket måste vara sant?', options: [] };
  return pusselNyckel({ ...x, typ: 'D2' });
}

/** Par av nästan-dubbletter bland D4 och mellan D4 och äldre familjer: [a, b, skäl]. */
export function d4Dubbletter(lista) {
  const ut = [];
  const d4 = lista.filter((q) => q.typ === 'D4').map((q) => ({ q, ...d4Nycklar(q) }));
  for (let i = 0; i < d4.length; i++)
    for (let j = i + 1; j < d4.length; j++) if (d4[i].exakt === d4[j].exakt) ut.push([d4[i].q, d4[j].q, 'samma villkor med andra namn']);
  // kvantor mot D1 (premisskedjorna): samma premisser.
  const d1 = lista.filter((q) => q.typ === 'D1').map((q) => ({ q, k: premissNyckel(q) }));
  for (const x of d4.filter((y) => y.q.family === 'kvantor')) for (const y of d1) if (x.exakt === y.k) ut.push([x.q, y.q, 'samma premisser som en premisskedja']);
  // kan_inte mot D2 och D3: samma villkor (frågan räknas inte).
  const schema = lista.filter((q) => q.typ === 'D2' || q.typ === 'D3').map((q) => ({ q, k: grundNyckel(q) }));
  for (const x of d4.filter((y) => y.q.family === 'kan_inte')) for (const y of schema) if (x.exakt === y.k) ut.push([x.q, y.q, 'samma villkor som ett schemapussel']);
  return ut;
}

/** D4-par med samma lösa nyckel (varnar). */
export function d4Lika(lista) {
  const d4 = lista.filter((q) => q.typ === 'D4').map((q) => ({ q, ...d4Nycklar(q) }));
  const ut = [];
  for (let i = 0; i < d4.length; i++)
    for (let j = i + 1; j < d4.length; j++) if (d4[i].exakt !== d4[j].exakt && d4[i].los === d4[j].los) ut.push([d4[i].q, d4[j].q]);
  // kvantor mot D1 med samma premissformer.
  const d1 = lista.filter((q) => q.typ === 'D1');
  for (const x of d4.filter((y) => y.q.family === 'kvantor'))
    for (const y of d1) if (x.exakt !== premissNyckel(y) && x.los === `sym:${premissNyckel(y, true)}`) ut.push([x.q, y]);
  return ut;
}

/* ---------------------------------- körning --------------------------------- */

function kor() {
let antal = 0;
const fel = [];
const perFil = [];
const alla = [];
for (const fil of filer) {
  const lista = JSON.parse(readFileSync(fil, 'utf8'));
  alla.push(...lista);
  let ok = 0;
  for (const q of lista) {
    antal++;
    let f;
    try {
      f = q.typ === 'D1' ? verifieraD1(q) : q.typ === 'D4' ? verifieraD4(q) : verifieraSchema(q);
    } catch (e) {
      f = [String(e.message ?? e)];
    }
    if (f.length) fel.push(...f.map((x) => `${fil} ${q.id}: ${x}`));
    else ok++;
  }
  perFil.push(`${fil}: ${ok} av ${lista.length} bevisade`);
}
for (const x of perFil) console.log(x);
let kanda = 0;
const kandaPar = [];
let dubbletter = 0;
try {
  for (const [a, b, skal] of nastanDubbletter(alla)) {
    if (a.ersatter === b.id || b.ersatter === a.id) continue;
    const ny = [a, b].some((q) => (q.fran_version ?? 1) >= DUBBLETTKONTROLL_FRAN && !q.pensionerad_fran);
    // Ett äldre par där den ena är pensionerad är löst.
    if (!ny && (a.pensionerad_fran || b.pensionerad_fran)) continue;
    if (ny) {
      dubbletter++;
      fel.push(`nästan-dubblett: ${a.id} och ${b.id}, ${skal}`);
    } else {
      kanda++;
      kandaPar.push(`${a.id}/${b.id}`);
    }
  }
} catch (e) {
  fel.push(`nästan-dubbletter: ${e.message ?? e}`);
}
console.log(`Nästan-dubbletter: ${dubbletter} med version ${DUBBLETTKONTROLL_FRAN} eller senare. Kända par mellan äldre versioner (${kanda}): ${kandaPar.join(', ') || 'inga'}.`);
// Varningar: samma villkorstyper och samma lösningsgång med flyttade platser, bland uppgifter som inte är pensionerade.
try {
  const aktiva = alla.filter((q) => !q.pensionerad_fran);
  const varn = [...lika(aktiva), ...d4Lika(aktiva)];
  const nya = varn.filter(([a, b]) => [a, b].some((q) => (q.fran_version ?? 1) >= DUBBLETTKONTROLL_FRAN));
  console.log(`Varning, samma lösningsgång med flyttade platser: ${varn.length} par, varav ${nya.length} med version ${DUBBLETTKONTROLL_FRAN} eller senare.`);
  for (const [a, b] of nya) console.log(`  VARNING ${a.id} och ${b.id}`);
} catch (e) {
  fel.push(`lös nyckel: ${e.message ?? e}`);
}
if (fel.length) {
  for (const x of fel) console.error('FEL', x);
  console.error(`${fel.length} fel`);
  process.exit(1);
}
console.log(`Verifieringen: alla ${antal} uppgifter har exakt ett svar som följer av villkoren.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) kor();
