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

const ORD = (q) => new Set(q.villkor.join(' ').toLowerCase().replace(/[^a-zåäö0-9 ]/g, ' ').split(/s+/).filter((w) => w.length >= 4));
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
  const x = lista.filter((q) => q.typ !== 'D1').map((q) => ({ q, ...losaNycklar(q), p: pusselNyckel(q) }));
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
  const schema = lista.filter((q) => q.typ !== 'D1').map((q) => ({ q, k: pusselNyckel(q) }));
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
      f = q.typ === 'D1' ? verifieraD1(q) : verifieraSchema(q);
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
  const varn = lika(alla.filter((q) => !q.pensionerad_fran));
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
