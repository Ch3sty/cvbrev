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
// Kör: node scripts/deduktiv-verifiera.mjs [fil ...]   (standard: bankfilerna)
// Exit 1 vid fel.
// =============================================================================

import { readFileSync } from 'node:fs';

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

/* ---------------------------------- körning --------------------------------- */

let antal = 0;
const fel = [];
const perFil = [];
for (const fil of filer) {
  const lista = JSON.parse(readFileSync(fil, 'utf8'));
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
if (fel.length) {
  for (const x of fel) console.error('FEL', x);
  console.error(`${fel.length} fel`);
  process.exit(1);
}
console.log(`Verifieringen: alla ${antal} uppgifter har exakt ett svar som följer av villkoren.`);
