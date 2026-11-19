#!/usr/bin/env node
// scripts/gen-deduktiv-omg3.mjs
// =============================================================================
// Deduktiv, omgång 3 (frågebanken 2026-11-19, bankversion 5): bygger D4, de
// nya familjerna, och lägger dem sist i bankfilerna med fran_version 5.
// Gamla uppgifter med fran_version 5 tas bort först, så skriptet kan köras om.
//
//   om_sa, kvantor   ur d4-innehall.mjs (skrivna för hand)
//   sanning, tabell, kan_inte   genererade, seedade, med lösarens förklaring
//
// Varje uppgift klarar spärrarna E1 till E7 (d4.mjs). Dubbletter sållas med
// verifierarens nycklar (exakt och lös) mot alla uppgifter i banken och mot
// de nya. Kör: node scripts/gen-deduktiv-omg3.mjs [--torr]
//
// Efter granskningen av omgång 3 är bankerna rättade direkt: sju uppgifter
// strukna och sjutton lösningstexter omskrivna med de rättade förklaringarna i
// d4.mjs. En ny körning ger inte samma bank, så skriptet vägrar skriva över
// fran_version 5 utan --ersatt.
// =============================================================================

import { readFileSync, writeFileSync } from 'node:fs';
import * as D4 from './lib/deduktiv/d4.mjs';
import { OMSA, KVANTOR, KVANTOR_INTRO } from './lib/deduktiv/d4-innehall.mjs';
import { TEMAN, villkorText, valjNamn, valjFarger, etikett, NAMN } from './lib/deduktiv/tema.mjs';
import { losningar, uppfyllt, allaTilldelningar, villkorNyckel } from './lib/deduktiv/losare.mjs';
import { allaVillkor as allaSchemaVillkor } from './lib/deduktiv/generera.mjs';
import { d4Nycklar, premissNyckel, pusselNyckel } from './deduktiv-verifiera.mjs';

const TORR = process.argv.includes('--torr');
const ERSATT = process.argv.includes('--ersatt');
const FILER = { grund: 'src/lib/deduktivV1/bankGrund.json', avancerad: 'src/lib/deduktivV1/bankAvancerad.json', expert: 'src/lib/deduktivV1/bankExpert.json' };
const VERSION = 5;
const KOD = { grund: 'g', avancerad: 'a', expert: 'e' };

/** Antal per nivå och familj. */
const PLAN = {
  grund: { om_sa: 7, kvantor: 5, sanning: 7, kan_inte: 11 },
  avancerad: { om_sa: 4, kvantor: 3, sanning: 10, tabell: 10, kan_inte: 9 },
  expert: { om_sa: 2, sanning: 10, tabell: 12, kan_inte: 10 },
};

function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const blanda = (r, a) => {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
};
const valj = (r, a) => a[Math.floor(r() * a.length)];

/* ------------------------------- gemensamt ---------------------------------- */

const ETIKETT_ROLL = { nodvandig: D4.ETIKETT4.nodvandig, obestamd: D4.ETIKETT4.obestamd, omojlig: D4.ETIKETT4.omojlig };

/** Lägger facit på plats `plats` och resten i given ordning. */
function placera(facit, ovriga, plats) {
  const ut = [...ovriga];
  ut.splice(plats, 0, facit);
  return ut;
}

function uppgift({ niva, family, intro, f, alternativ, facitPlats, misstag, etiketter, losningSteg }) {
  const q = {
    id: null,
    niva,
    typ: 'D4',
    family,
    difficulty: D4.D4_DIFFICULTY[niva],
    p_prior: D4.D4_P_PRIOR[niva],
    intro,
    villkor: null,
    fraga: null,
    options: null,
    correctAnswer: facitPlats,
    etiketter,
    misstag,
    losning: { steg: losningSteg, schema: null },
    formell: { ...f, alternativ },
    fran_version: VERSION,
  };
  return q;
}

/** Texterna ur formell (mallarna i d4.mjs). */
function texter(q) {
  const f = q.formell;
  q.villkor = f.villkor.map((c) => D4.d4Text(f, c));
  q.options = f.alternativ.map((x) => D4.d4Text(f, x, 'alternativ'));
  return q;
}

const rollerFor = (f) => f.alternativ.map((x) => D4.status(f, x));

/**
 * Kombinationer av fyra distraktorer där inget alternativ medför ett annat
 * utan villkoren (E4), med facit. kand: [{ x, p }] (p = vikt). Djupet först i
 * viktordning med slump, högst `max` kombinationer.
 */
function sokKombinationer(r, f0, facit, kand, max = 300) {
  const alla = [facit, ...kand.map((c) => c.x)];
  const fx = { ...f0, alternativ: alla };
  const N = alla.length;
  const ok = Array.from({ length: N }, () => new Array(N).fill(true));
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++)
      if (i !== j && ok[i][j] && D4.medfor(fx, i, j)) {
        ok[i][j] = false;
        ok[j][i] = false;
      }
  const ordning = blanda(r, Array.from({ length: N - 1 }, (_, i) => i + 1))
    .map((i) => ({ i, v: kand[i - 1].p + r() * 2 }))
    .sort((a, b) => b.v - a.v)
    .map((x) => x.i)
    .filter((i) => ok[0][i]);
  const ut = [];
  const valda = [];
  const dfs = (start) => {
    if (ut.length >= max) return;
    if (valda.length === 4) {
      ut.push(valda.map((i) => kand[i - 1]));
      return;
    }
    for (let k = start; k < ordning.length && ut.length < max; k++) {
      const i = ordning[k];
      if (valda.some((j) => !ok[i][j])) continue;
      valda.push(i);
      dfs(k + 1);
      valda.pop();
    }
  };
  dfs(0);
  return blanda(r, ut);
}

/* --------------------------------- om_sa ------------------------------------ */

const ATOM = { p: 0, q: 1, r: 2, s: 3, t: 4 };
function litAv(s) {
  const neg = s.startsWith('-');
  return { a: ATOM[neg ? s[1] : s[0]], neg };
}
function formelAv(s) {
  if (s.includes('>')) {
    const [p, q] = s.split('>');
    return { typ: 'om', p: litAv(p), q: litAv(q) };
  }
  if (s.includes('&')) {
    const [p, q] = s.split('&');
    return { typ: 'och', p: litAv(p), q: litAv(q) };
  }
  const l = litAv(s);
  return { typ: 'lit', a: l.a, neg: l.neg };
}

function omsaPool(f, medOch) {
  const n = f.atomer.length;
  const L = [];
  for (let a = 0; a < n; a++) for (const neg of [false, true]) L.push({ a, neg });
  const ut = L.map((l) => ({ typ: 'lit', a: l.a, neg: l.neg }));
  for (const p of L) for (const q of L) if (p.a !== q.a) ut.push({ typ: 'om', p, q });
  if (medOch) for (const p of L) for (const q of L) if (p.a < q.a) ut.push({ typ: 'och', p, q });
  return ut;
}

const FELSTAT = new Map();
const SKAL = new Map();
const skal = (x) => SKAL.set(x, (SKAL.get(x) ?? 0) + 1);
function byggOmsa(spec, r, facitPlats) {
  FELSTAT.clear();
  const f0 = { slag: 'om_sa', atomer: spec.atomer, villkor: spec.prem.map(formelAv), fraga: { form: spec.fraga } };
  const facit = formelAv(spec.facit);
  const premText = new Set(f0.villkor.map((c) => D4.omsaText(f0, c)));
  const pool = omsaPool(f0, true).filter((x) => !premText.has(D4.omsaText(f0, x)) && D4.omsaText(f0, x) !== D4.omsaText(f0, facit));
  const st = pool.map((x) => D4.status(f0, x));
  const form = spec.fraga;
  // Poäng: fällor (misstag med villkorsnummer) först.
  const kand = pool
    .map((x, i) => ({ x, s: st[i] }))
    .filter(({ s }) => (form === 'maste' ? s !== 'nodvandig' : s !== 'omojlig'))
    .map(({ x, s }) => {
      const m = D4.omsaMisstag(f0, x, s, form);
      let p = /villkor \d/.test(m) ? 4 : 1;
      if (x.typ === facit.typ) p += 2;
      if (s === 'omojlig' || s === 'nodvandig') p += 1;
      return { x, s, p };
    });
  let bast = null;
  for (const urval of sokKombinationer(r, f0, facit, kand, 400)) {
    const alternativ = placera(facit, urval.map((c) => c.x), facitPlats);
    const f = { ...f0, alternativ };
    const q = texter(uppgift({ niva: spec.niva, family: 'om_sa', intro: null, f, alternativ, facitPlats, misstag: [], etiketter: [], losningSteg: [] }));
    q.formell.roller = rollerFor(q.formell);
    q.misstag = alternativ.map((x, i) => (i === facitPlats ? '' : D4.omsaMisstag(f, x, q.formell.roller[i], form)));
    const fel = [...D4.e1(q), ...D4.e2(q), ...D4.e3(q), ...D4.e4(q), ...D4.e5(q)];
    if (fel.length) {
      for (const x of fel) FELSTAT.set(x.slice(0, 40), (FELSTAT.get(x.slice(0, 40)) ?? 0) + 1);
      continue;
    }
    // Högst en distraktor av varje slag av misstag.
    const ms = urval.map((c) => D4.omsaMisstag(f0, c.x, c.s, form));
    if (new Set(ms).size < 4) continue;
    const poang = urval.reduce((s, c) => s + c.p, 0) + (new Set(urval.map((c) => c.x.typ)).size > 1 ? 1 : 0);
    if (!bast || poang > bast.poang) bast = { q, poang };
  }
  if (!bast) throw new Error(`om_sa: inga alternativ för ${spec.gang} ${JSON.stringify([...FELSTAT])}`);
  const q = bast.q;
  q.fraga = D4.FRAGA4[spec.fraga];
  q.etiketter = q.formell.roller.map((s) => ETIKETT_ROLL[s]);
  q.misstag = q.formell.alternativ.map((x, i) => (i === facitPlats ? '' : D4.omsaMisstag(q.formell, x, q.formell.roller[i], form)));
  q.losning.steg = D4.forklaraD4(q.formell, facitPlats);
  if (!q.losning.steg) throw new Error(`om_sa: ingen förklaring för ${spec.gang}`);
  return q;
}

/* -------------------------------- kvantor ----------------------------------- */

function byggKvantor(spec, facitPlats) {
  const facitIdx = spec.alternativ.findIndex((a) => !a.misstag);
  const facit = spec.alternativ[facitIdx];
  const ovriga = spec.alternativ.filter((_, i) => i !== facitIdx);
  const lista = placera(facit, ovriga, facitPlats);
  const f = {
    slag: 'kvantor',
    termer: spec.termer,
    individer: spec.individer,
    villkor: spec.premisser.map((p) => p.formell),
    fraga: { form: spec.fraga },
    alternativ: lista.map((a) => a.formell),
  };
  f.roller = f.alternativ.map((x) => D4.status(f, x));
  return {
    id: null,
    niva: spec.niva,
    typ: 'D4',
    family: 'kvantor',
    difficulty: D4.D4_DIFFICULTY[spec.niva],
    p_prior: D4.D4_P_PRIOR[spec.niva],
    intro: KVANTOR_INTRO,
    villkor: spec.premisser.map((p) => p.text),
    fraga: D4.FRAGA4[spec.fraga],
    options: lista.map((a) => a.text),
    correctAnswer: facitPlats,
    etiketter: f.roller.map((s) => ETIKETT_ROLL[s]),
    misstag: lista.map((a, i) => (i === facitPlats ? '' : a.misstag)),
    losning: { steg: spec.steg.map((g) => ({ markor: g.premisser, villkor: [], foljd: g.text })), schema: null },
    formell: f,
    fran_version: VERSION,
  };
}

/* -------------------------------- sanning ----------------------------------- */

const SANNING_SLAG = {
  grund: ['logn', 'sann', 'bada_logn', 'minst_en_logn', 'antal_logn'],
  avancerad: ['logn', 'sann', 'bada_logn', 'bada_sann', 'minst_en_logn', 'exakt_en_logn', 'antal_logn'],
  expert: ['logn', 'bada_logn', 'bada_sann', 'minst_en_logn', 'exakt_en_logn', 'antal_logn', 'minst_logn'],
};

function slumpaPastaende(r, n, talare, slag, sjalv) {
  const typ = valj(r, slag);
  const andra = Array.from({ length: n }, (_, i) => i).filter((i) => i !== talare);
  const alla = Array.from({ length: n }, (_, i) => i);
  if (typ === 'logn' || typ === 'sann') return { typ, x: valj(r, andra) };
  if (typ === 'antal_logn') return { typ, k: Math.floor(r() * n) };
  if (typ === 'minst_logn') return { typ, k: 1 + Math.floor(r() * (n - 1)) };
  const pool = sjalv ? alla : andra;
  const a = blanda(r, pool);
  const [x, y] = a[0] < a[1] ? [a[0], a[1]] : [a[1], a[0]];
  return { typ, x, y };
}

function sanningAlternativ(f, form, r) {
  const n = f.namn.length;
  const ut = [];
  for (let i = 0; i < n; i++) ut.push({ typ: 'logn', x: i }, { typ: 'sann', x: i });
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) ut.push({ typ: 'bada_logn', x: i, y: j }, { typ: 'bada_sann', x: i, y: j }, { typ: 'minst_en_logn', x: i, y: j }, { typ: 'exakt_en_logn', x: i, y: j });
  for (let k = 0; k <= n; k++) ut.push({ typ: 'antal_logn', k });
  return ut;
}

function beskrivModell(namn, m) {
  const l = namn.filter((_, i) => ((m >> i) & 1) === 1);
  if (!l.length) return 'ingen av dem är lögnare';
  if (l.length === namn.length) return 'alla är lögnare';
  return l.length === 1 ? `${l[0]} är den enda lögnaren` : `lögnarna är ${D4.lista(l)}`;
}

function sanningMisstag(f, x, roll, form) {
  const n = f.namn.length;
  const M = D4.modeller(f);
  const N = f.namn;
  if (form === 'vilka' || roll === 'omojlig') {
    // Ett fall där alternativet gäller: vilket villkor bryts?
    const U = Array.from({ length: 1 << n }, (_, m) => m).filter((m) => D4.galler(f, x, m));
    if (form === 'vilka' && U.length === 1) {
      const m = U[0];
      const c = f.villkor.find((v) => !D4.galler(f, v, m));
      const t = N[c.talare];
      const lognare = ((m >> c.talare) & 1) === 1;
      return lognare ? `I det fallet är ${t} lögnare, men det ${t} säger stämmer.` : `I det fallet är ${t} sanningssägare, men det ${t} säger är falskt.`;
    }
    if (M.length === 1) return `Lösningen är att ${beskrivModell(N, M[0])}. Där är det falskt.`;
    return 'Det går inte ihop med villkoren, hur man än fördelar lögnarna.';
  }
  if (roll === 'nodvandig') return 'Det är sant i varje fall som går ihop med villkoren.';
  // obestamd
  const ja = M.find((m) => D4.galler(f, x, m));
  const nej = M.find((m) => !D4.galler(f, x, m));
  if (form === 'kan_inte') return `Det kan stämma, till exempel om ${beskrivModell(N, ja)}.`;
  return `Det kan stämma, men det måste inte. Villkoren går också ihop med att ${beskrivModell(N, nej)}.`;
}

function forsokSanning(r, niva, form) {
  const n = niva === 'grund' ? 3 : niva === 'avancerad' ? (r() < 0.5 ? 3 : 4) : 4;
  const namn = valjNamn(r, n, 6).filter(() => true);
  if (new Set(namn).size !== n) return null;
  const sjalv = niva !== 'grund';
  const villkor = Array.from({ length: n }, (_, t) => ({ talare: t, sager: slumpaPastaende(r, n, t, SANNING_SLAG[niva], sjalv) }));
  const f = { slag: 'sanning', namn, villkor, fraga: { form: form === 'vilka' ? 'maste' : form } };
  const M = D4.modeller(f);
  if (form === 'vilka' && M.length !== 1) return null;
  if (form === 'maste' && (M.length < 1 || M.length > 2)) return null;
  if (form === 'kan_inte' && (M.length < 1 || M.length > 4)) return null;
  // Varje villkor behövs för läget (vilka) eller prövas av E2 senare.
  let facit;
  let distr;
  if (form === 'vilka') {
    const s = Array.from({ length: n }, (_, i) => i).filter((i) => ((M[0] >> i) & 1) === 1);
    facit = { typ: 'mangd', s };
    const alla = [];
    for (let m = 0; m < 1 << n; m++) if (m !== M[0]) alla.push({ typ: 'mangd', s: Array.from({ length: n }, (_, i) => i).filter((i) => ((m >> i) & 1) === 1) });
    // Närmast först: skiljer sig i en person.
    const avst = (y) => Array.from({ length: n }, (_, i) => (y.s.includes(i) !== s.includes(i) ? 1 : 0)).reduce((a, b) => a + b, 0);
    distr = blanda(r, alla).sort((a, b) => avst(a) - avst(b)).slice(0, 6);
    distr = blanda(r, distr).slice(0, 4);
    return { f, par: [{ facit, distr }], form };
  } else {
    const pool = blanda(r, sanningAlternativ(f, form, r));
    const st = pool.map((x) => D4.status(f, x));
    const malRoll = form === 'maste' ? 'nodvandig' : 'omojlig';
    const alla = f.villkor.map((_, i) => i);
    // Facit ska kräva varje villkor (E2) och inte följa ur ett ensamt (E3).
    const fac = pool.filter((x, i) => st[i] === malRoll && alla.every((j) => D4.status(f, x, alla.filter((k) => k !== j)) !== malRoll) && alla.every((j) => D4.status(f, x, [j]) !== malRoll));
    if (!fac.length) return null;
    // Föredra obestämda distraktorer (de kräver att man prövar).
    const ovr = pool.map((x, i) => ({ x, s: st[i] })).filter(({ s }) => (form === 'maste' ? s !== 'nodvandig' : s !== 'omojlig'));
    const kand = ovr.map(({ x, s }) => ({ x, p: s === 'obestamd' ? 3 : 1 }));
    const par = [];
    for (const fa of blanda(r, fac).slice(0, 3)) for (const urval of sokKombinationer(r, f, fa, kand, 12)) par.push({ facit: fa, distr: urval.map((c) => c.x) });
    return par.length ? { f, par, form } : null;
  }
}

function byggSanning(r, niva, form, facitPlats) {
  SKAL.clear();
  for (let i = 0; i < 4000; i++) {
    const k = forsokSanning(r, niva, form);
    if (!k) {
      skal('forsok');
      continue;
    }
    for (const { facit: kf, distr: kd } of k.par) {
    const alternativ = placera(kf, kd, facitPlats);
    const f = { ...k.f, fraga: { form: form === 'vilka' ? 'vilka' : form }, alternativ };
    const q = uppgift({ niva, family: 'sanning', intro: D4.sanningIntro(f.namn), f, alternativ, facitPlats, misstag: [], etiketter: [], losningSteg: [] });
    q.villkor = f.villkor.map((c) => D4.sanningVillkorText(f.namn, c));
    q.options = alternativ.map((x) => D4.sanningPastaende(f.namn, x, null));
    q.fraga = D4.FRAGA4[form];
    q.formell.roller = rollerFor(q.formell);
    const fel = [...D4.e1(q), ...D4.e2(q), ...D4.e3(q), ...D4.e4(q), ...D4.e5(q)];
    if (fel.length) {
      fel.forEach((x) => skal(x.slice(0, 30)));
      continue;
    }
    const steg = D4.forklaraD4(q.formell, facitPlats);
    const tak = { grund: 8, avancerad: 9, expert: 11 }[niva];
    const golv = { grund: 2, avancerad: 3, expert: 3 }[niva];
    if (!steg || steg.length > tak || steg.length < golv) {
      skal(steg ? `steg ${steg.length}` : 'ingen förklaring');
      continue;
    }
    // Expert ska kräva ett antagande (fall), grund ska klara sig utan.
    const harAntagande = steg.some((s) => /^Anta att/.test(s.foljd));
    if (niva === 'expert' && form !== 'kan_inte' && !harAntagande) continue;
    q.losning.steg = steg;
    q.etiketter = form === 'vilka' ? q.formell.roller.map((s) => (s === 'nodvandig' ? 'Stämmer med villkoren.' : 'Strider mot villkoren.')) : q.formell.roller.map((s) => ETIKETT_ROLL[s]);
    q.misstag = alternativ.map((x, j) => (j === facitPlats ? '' : sanningMisstag(q.formell, x, q.formell.roller[j], form)));
    if (!sjalvOk(q)) continue;
    return q;
    }
  }
  return null;
}
/** Påståenden om sig själv: högst ett per uppgift, och aldrig "jag är lögnare". */
function sjalvOk(q) {
  return q.villkor.filter((v) => /\b(jag|mig)\b/i.test(v.split('”')[1] ?? '')).length <= 1;
}

/* --------------------------------- tabell ----------------------------------- */

const TEMAN_TABELL = [
  { A: 'roll', B: 'stad' },
  { A: 'kurs', B: 'dag' },
  { A: 'avd', B: 'bil' },
  { A: 'roll', B: 'lunch' },
  { A: 'avd', B: 'dag' },
  { A: 'kurs', B: 'stad' },
  { A: 'roll', B: 'bil' },
  { A: 'avd', B: 'lunch' },
];
const VARDEN = {
  roll: ['analytiker', 'designer', 'projektledare', 'testare', 'utvecklare'],
  stad: ['Gävle', 'Lund', 'Malmö', 'Umeå', 'Ystad'],
  kurs: ['Excel', 'arbetsrätt', 'första hjälpen', 'presentationsteknik', 'svenska'],
  dag: ['måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag'],
  bil: ['blå', 'grön', 'röd', 'svart', 'vit'],
  avd: ['på ekonomi', 'i kundtjänst', 'på lagret', 'i receptionen', 'på HR'],
  lunch: ['11', '11.30', '12', '12.30', '13'],
};
const ORDNADE = new Set(['dag', 'lunch']);

function tabellPool(n) {
  const ut = [];
  for (const kat of ['A', 'B'])
    for (let p = 0; p < n; p++)
      for (let v = 0; v < n; v++) {
        ut.push({ typ: 'har', p, kat, v }, { typ: 'inte', p, kat, v });
        for (let w = v + 1; w < n; w++) ut.push({ typ: 'varken', p, kat, v, w });
        for (let q2 = p + 1; q2 < n; q2++) ut.push({ typ: 'ingen_av', p, q: q2, kat, v });
      }
  for (let a = 0; a < n; a++)
    for (let b = 0; b < n; b++) for (const fran of ['A', 'B']) ut.push({ typ: 'lank', a, b, fran }, { typ: 'inte_lank', a, b, fran });
  return ut;
}
const VIKT_TABELL = { har: 1, inte: 3, varken: 3, ingen_av: 3, lank: 4, inte_lank: 3 };

function forsokTabell(r, niva, form) {
  const n = niva === 'expert' && form !== 'kan_inte' ? 5 : 4;
  const tema = valj(r, TEMAN_TABELL);
  const vA = blanda(r, VARDEN[tema.A]).slice(0, n);
  const vB = blanda(r, VARDEN[tema.B]).slice(0, n);
  const sortera = (k, V) => (ORDNADE.has(k) ? VARDEN[k].filter((x) => V.includes(x)) : [...V].sort((x, y) => x.localeCompare(y, 'sv')));
  const kategorier = { A: { mall: tema.A, varden: sortera(tema.A, vA) }, B: { mall: tema.B, varden: sortera(tema.B, vB) } };
  const namn = valjNamn(r, n, 6);
  const perm = () => blanda(r, Array.from({ length: n }, (_, i) => i));
  const losning = { A: perm(), B: perm() };
  const f0 = { slag: 'tabell', namn, kategorier, villkor: [], fraga: { form } };
  const sanna = tabellPool(n).filter((c) => D4.tabellGaller(c, losning));
  const mal = form === 'kan_inte' ? [2, 5] : [1, 1];
  let villkor = [];
  const antal = (vs) => D4.modeller({ ...f0, villkor: vs }).length;
  for (let i = 0; i < 20; i++) {
    // Två villkor om samma person i samma kategori, eller samma värde, upprepar varandra.
    const sig = (c) => (c.typ === 'ingen_av' ? `v:${c.kat}:${c.v}` : c.typ === 'lank' || c.typ === 'inte_lank' ? `l:${c.a}:${c.b}` : `p:${c.p}:${c.kat}`);
    const kand = sanna.filter((c) => !villkor.some((v) => sig(v) === sig(c)));
    if (!kand.length) break;
    const sum = kand.reduce((s, c) => s + VIKT_TABELL[c.typ], 0);
    let x = r() * sum;
    let val = kand[kand.length - 1];
    for (const c of kand) {
      x -= VIKT_TABELL[c.typ];
      if (x <= 0) {
        val = c;
        break;
      }
    }
    villkor.push(val);
    const a = antal(villkor);
    if (a <= mal[1]) break;
  }
  const a0 = antal(villkor);
  if (a0 < mal[0] || a0 > mal[1]) {
    skal(`antal ${a0}`);
    return null;
  }
  // Stryk villkor som inte ändrar antalet lösningar.
  for (const c of blanda(r, villkor)) {
    const utan = villkor.filter((v) => v !== c);
    if (antal(utan) === a0) villkor = utan;
  }
  villkor = blanda(r, villkor);
  const harAntal = villkor.filter((c) => c.typ === 'har').length;
  if (harAntal > (niva === 'expert' ? 1 : 2)) return skal('har'), null;
  if (!villkor.some((c) => c.typ === 'lank' || c.typ === 'inte_lank')) return skal('lank'), null;
  if (villkor.length < (niva === 'expert' && form !== 'kan_inte' ? 6 : 5) || villkor.length > (niva === 'expert' ? 11 : 9)) return skal(`langd ${villkor.length}`), null;
  return { f: { ...f0, villkor }, losning, n };
}

function tabellMisstag(f, x, roll, form) {
  const M = D4.modeller(f);
  const N = f.namn;
  const beskriv = (m) => N.map((p, i) => `${p} ${D4.katF(f, 'A').pos(m.A[i])} och ${D4.katF(f, 'B').pos(m.B[i])}`).join(', ');
  if (form === 'vem') {
    const m = M[0];
    return `Lösningen ger att ${N[x.p]} ${D4.katF(f, x.kat).pos(m[x.kat][x.p])}.`;
  }
  if (roll === 'omojlig' && M.length === 1) {
    const m = M[0];
    if (x.p != null) return `Lösningen ger att ${N[x.p]} ${D4.katF(f, x.kat ?? 'A').pos(m[x.kat ?? 'A'][x.p])}.`;
    return 'Det går inte ihop med lösningen.';
  }
  if (roll === 'nodvandig') return 'Det är sant i varje fördelning som går ihop med villkoren.';
  if (roll === 'omojlig') return 'Det går inte ihop med villkoren.';
  const ja = M.find((m) => D4.tabellGaller(x, m));
  return `Det kan stämma, till exempel om ${beskriv(ja)}.`;
}

function byggTabell(r, niva, form, facitPlats) {
  SKAL.clear();
  for (let i = 0; i < 3000; i++) {
    const k = forsokTabell(r, niva, form);
    if (!k) continue;
    const { f, n } = k;
    const M = D4.modeller(f);
    let facit;
    let distr;
    if (form === 'vem') {
      const kat = valj(r, ['A', 'B']);
      const v = Math.floor(r() * n);
      const p = M[0][kat].indexOf(v);
      facit = { typ: 'har', p, kat, v };
      distr = blanda(r, Array.from({ length: n }, (_, j) => j).filter((j) => j !== p)).map((j) => ({ typ: 'har', p: j, kat, v }));
    } else {
      const pool = blanda(r, tabellPool(n).filter((c) => c.typ === 'har'));
      const st = pool.map((x) => D4.status(f, x));
      const malRoll = form === 'maste' ? 'nodvandig' : 'omojlig';
      const alla = f.villkor.map((_, j) => j);
      // Facit ska kräva varje villkor (E2) och inte följa ur ett ensamt (E3).
      const fac = pool.filter((x, j) => st[j] === malRoll && alla.every((k) => D4.status(f, x, alla.filter((m) => m !== k)) !== malRoll) && alla.every((k) => D4.status(f, x, [k]) !== malRoll));
      if (!fac.length) { skal("ingen facit"); continue; }
      facit = valj(r, fac);
      const ovr = pool.filter((x, j) => x !== facit && st[j] !== malRoll);
      if (form === 'kan_inte') {
        const ob = ovr.filter((x) => D4.status(f, x) === 'obestamd');
        if (ob.length < 3) { skal("ob"); continue; }
        distr = [...blanda(r, ob).slice(0, 4)];
        if (distr.length < 4) distr.push(...ovr.filter((x) => !distr.includes(x)).slice(0, 4 - distr.length));
      } else {
        // Nära missar: samma person eller samma värde som facit.
        const nara = ovr.filter((x) => x.p === facit.p || (x.kat === facit.kat && x.v === facit.v));
        distr = [...blanda(r, nara).slice(0, 2), ...blanda(r, ovr.filter((x) => !nara.includes(x))).slice(0, 2)];
      }
    }
    if (distr.length !== 4) continue;
    const alternativ = placera(facit, distr, facitPlats);
    const fq = { ...f, fraga: { form }, alternativ };
    const q = uppgift({ niva, family: 'tabell', intro: D4.tabellIntro(fq), f: fq, alternativ, facitPlats, misstag: [], etiketter: [], losningSteg: [] });
    texter(q);
    q.fraga = form === 'vem' ? `Vem ${D4.katF(fq, facit.kat).pos(facit.v)}?` : D4.FRAGA4[form];
    q.formell.roller = rollerFor(q.formell);
    const fel = [...D4.e1(q), ...D4.e2(q), ...D4.e3(q), ...D4.e4(q), ...D4.e5(q)];
    if (fel.length) { fel.forEach((x) => skal(x.slice(0, 25))); continue; }
    const steg = D4.forklaraD4(q.formell, facitPlats);
    const tak = { avancerad: 8, expert: 10 }[niva];
    if (!steg || steg.length > tak || steg.length < (form === 'kan_inte' ? 3 : 3)) {
      skal(steg ? `steg ${steg.length}` : 'ingen förklaring');
      continue;
    }
    q.losning.steg = steg;
    q.etiketter = form === 'vem' ? q.formell.roller.map((s) => (s === 'nodvandig' ? 'Stämmer med villkoren.' : 'Strider mot villkoren.')) : q.formell.roller.map((s) => ETIKETT_ROLL[s]);
    q.misstag = alternativ.map((x, j) => (j === facitPlats ? '' : tabellMisstag(q.formell, x, q.formell.roller[j], form)));
    return q;
  }
  return null;
}

/* -------------------------------- kan_inte ---------------------------------- */

const PASTAENDE_TYPER = ['plats', 'granne', 'inte_granne', 'vanster_om', 'direkt_vanster_om', 'ordning', 'samma_grupp'];

function forsokKanInte(r, niva) {
  const temaVal = niva === 'grund' ? ['personer', 'saker'] : niva === 'avancerad' ? ['personer', 'saker'] : ['personer', 'saker', 'turordning'];
  const tema = valj(r, temaVal);
  const T = TEMAN[tema];
  const n = tema === 'turordning' ? 6 : niva === 'grund' ? 4 : niva === 'avancerad' ? 5 : valj(r, [5, 6]);
  const g = T.grupper ?? null;
  const namn = T.element === 'farger' ? valjFarger(r, n) : valjNamn(r, n, { 4: 6, 5: 6, 6: 5 }[n]);
  const losning = valj(r, allaTilldelningar(n));
  const sanna = allaSchemaVillkor(tema, n, T.tillatna).filter((c) => uppfyllt(c, losning, g));
  const [lo, hi] = niva === 'grund' ? [2, 4] : niva === 'avancerad' ? [2, 6] : [3, 10];
  const vikt = { plats: 1, inte_plats: 2, granne: 4, inte_granne: 3, vanster_om: 4, direkt_vanster_om: 4, ordning: 5, samma_grupp: 4 };
  let villkor = [];
  for (let i = 0; i < 10; i++) {
    const kand = sanna.filter((c) => !villkor.some((v) => villkorNyckel(v) === villkorNyckel(c)));
    const sum = kand.reduce((s, c) => s + vikt[c.typ], 0);
    let x = r() * sum;
    let val = kand[kand.length - 1];
    for (const c of kand) {
      x -= vikt[c.typ];
      if (x <= 0) {
        val = c;
        break;
      }
    }
    villkor.push(val);
    if (losningar(n, villkor, g).length <= hi) break;
  }
  const S = losningar(n, villkor, g);
  if (S.length < lo || S.length > hi) return null;
  if (villkor.filter((c) => c.typ === 'plats').length > 1) return null;
  // Facit: ett påstående som är falskt i alla lösningar och kräver varje villkor.
  const pastaenden = allaSchemaVillkor(tema, n, T.tillatna.filter((t) => PASTAENDE_TYPER.includes(t)));
  const kand = blanda(r, pastaenden).filter((x) => !villkor.some((v) => villkorNyckel(v) === villkorNyckel(x)));
  for (const facit of kand) {
    if (S.some((p) => uppfyllt(facit, p, g))) continue;
    // Varje villkor behövs för att facit ska vara omöjligt.
    const behovs = villkor.every((_, i) => losningar(n, villkor.filter((__, j) => j !== i), g).some((p) => uppfyllt(facit, p, g)));
    if (!behovs) continue;
    // Facit får inte vara omöjligt i sig.
    if (!allaTilldelningar(n).some((p) => uppfyllt(facit, p, g))) continue;
    // Distraktorer: möjliga, helst i få lösningar, samma former som facit förekommer.
    const mojliga = kand.filter((x) => x !== facit && S.some((p) => uppfyllt(x, p, g)));
    const sallsynt = mojliga.filter((x) => S.filter((p) => uppfyllt(x, p, g)).length <= Math.max(1, Math.floor(S.length / 2)));
    if (sallsynt.length < 3) continue;
    const distr = [...blanda(r, sallsynt).slice(0, 3), ...blanda(r, mojliga.filter((x) => !sallsynt.includes(x))).slice(0, 1)];
    if (distr.length < 4) distr.push(...sallsynt.slice(3, 3 + 4 - distr.length));
    if (distr.length !== 4) continue;
    return { tema, namn, villkor: blanda(r, villkor), facit, distr, S };
  }
  return null;
}

function byggKanInte(r, niva, facitPlats) {
  for (let i = 0; i < 8000; i++) {
    const k = forsokKanInte(r, niva);
    if (!k) continue;
    const alternativ = placera(k.facit, k.distr, facitPlats);
    const f = { slag: 'kan_inte', tema: k.tema, namn: k.namn, villkor: k.villkor, fraga: { form: 'kan_inte' }, alternativ };
    const q = uppgift({ niva, family: 'kan_inte', intro: TEMAN[k.tema].intro(k.namn.length), f, alternativ, facitPlats, misstag: [], etiketter: [], losningSteg: [] });
    texter(q);
    q.fraga = D4.FRAGA4.kan_inte;
    q.formell.roller = rollerFor(q.formell);
    const fel = [...D4.e1(q), ...D4.e2(q), ...D4.e3(q), ...D4.e4(q), ...D4.e5(q)];
    if (fel.length) continue;
    const steg = D4.forklaraD4(q.formell, facitPlats);
    const [golv, tak] = { grund: [2, 5], avancerad: [3, 6], expert: [3, 8] }[niva];
    if (!steg || steg.length < golv || steg.length > tak) continue;
    q.losning.steg = steg;
    q.etiketter = q.formell.roller.map((s) => ETIKETT_ROLL[s]);
    q.misstag = alternativ.map((x, j) => {
      if (j === facitPlats) return '';
      if (q.formell.roller[j] === 'nodvandig') return 'Det är sant i varje ordning som går ihop med villkoren.';
      const ex = D4.exempelKanInte(q.formell, x).map((y) => etikett(k.tema, y));
      return `Det kan stämma, till exempel med ordningen ${D4.lista(ex)}, från plats 1.`;
    });
    return q;
  }
  return null;
}

/* ------------------------------ dubbletter ---------------------------------- */

const bank = Object.fromEntries(Object.entries(FILER).map(([n, fil]) => [n, JSON.parse(readFileSync(fil, 'utf8')).filter((q) => q.fran_version !== VERSION)]));
const aldre = Object.values(bank).flat();
const exakta = new Set();
const losa = new Set();
for (const q of aldre) {
  if (q.typ === 'D1') {
    exakta.add(premissNyckel(q));
    losa.add(`sym:${premissNyckel(q, true)}`);
  }
  if (q.typ === 'D2' || q.typ === 'D3') {
    try {
      const k = q.typ === 'D3' ? pusselNyckel({ ...q, typ: 'D2', fraga: 'Vilket måste vara sant?', options: [] }) : pusselNyckel(q);
      exakta.add(k);
    } catch {
      // Äldre texter som verifieraren tolkar för sig.
    }
  }
}
function ny(q) {
  const k = d4Nycklar(q);
  if (exakta.has(k.exakt) || losa.has(k.los)) return false;
  exakta.add(k.exakt);
  losa.add(k.los);
  return true;
}

/* --------------------------------- körning ---------------------------------- */

const ut = { grund: [], avancerad: [], expert: [] };
const facitRakn = { grund: 0, avancerad: 0, expert: 0 };
const nastaPlats = (niva) => facitRakn[niva]++ % 5;

for (const spec of OMSA) {
  const q = byggOmsa(spec, mulberry32(7000 + ut[spec.niva].length), nastaPlats(spec.niva));
  if (!ny(q)) throw new Error(`om_sa: dubblett (${spec.gang})`);
  ut[spec.niva].push(q);
}
for (const spec of KVANTOR) {
  const q = byggKvantor(spec, nastaPlats(spec.niva));
  if (!ny(q)) throw new Error(`kvantor: dubblett (${spec.gang})`);
  ut[spec.niva].push(q);
}
const FORMER = {
  sanning: { grund: ['vilka', 'vilka', 'maste'], avancerad: ['vilka', 'maste', 'kan_inte'], expert: ['vilka', 'maste', 'kan_inte'] },
  tabell: { avancerad: ['maste', 'kan_inte'], expert: ['vem', 'vem', 'kan_inte'] },
};
for (const niva of ['grund', 'avancerad', 'expert']) {
  const r = mulberry32({ grund: 11, avancerad: 22, expert: 33 }[niva]);
  for (const fam of ['sanning', 'tabell', 'kan_inte']) {
    const mal = PLAN[niva][fam] ?? 0;
    let gjorda = 0;
    let missar = 0;
    while (gjorda < mal) {
      const form = fam === 'kan_inte' ? 'kan_inte' : FORMER[fam][niva][gjorda % FORMER[fam][niva].length];
      const plats = facitRakn[niva] % 5;
      const q = fam === 'sanning' ? byggSanning(r, niva, form, plats) : fam === 'tabell' ? byggTabell(r, niva, form, plats) : byggKanInte(r, niva, plats);
      if (!q) throw new Error(`${fam} ${niva} ${form}: ingen uppgift ${JSON.stringify([...SKAL])}`);
      if (!ny(q)) {
        if (++missar > 400) throw new Error(`${fam} ${niva}: för många dubbletter`);
        continue;
      }
      facitRakn[niva]++;
      ut[niva].push(q);
      gjorda++;
    }
  }
}

// Id, spärrar och skrivning.
let fel = 0;
for (const niva of Object.keys(ut)) {
  ut[niva].forEach((q, i) => {
    q.id = `dd-${KOD[niva]}-d4-${String(i + 1).padStart(2, '0')}`;
    const f = D4.sparrFelD4(q);
    if (f.length) {
      fel++;
      console.error(q.id, q.family, f);
    }
  });
  const per = {};
  for (const q of ut[niva]) per[q.family] = (per[q.family] ?? 0) + 1;
  console.log(niva, ut[niva].length, JSON.stringify(per));
}
if (fel) {
  console.error(`${fel} uppgifter fälls av spärrarna`);
  process.exit(1);
}
if (process.env.VISA) writeFileSync(process.env.VISA, Object.values(ut).flat().map((q) => JSON.stringify({ id: q.id, family: q.family, intro: q.intro, villkor: q.villkor, fraga: q.fraga, options: q.options, facit: q.correctAnswer, misstag: q.misstag, steg: q.losning.steg.map((x) => `[${x.markor.join(',')}] ${x.foljd}`) }, null, 1)).join('\n'));
if (!TORR && !ERSATT && Object.values(FILER).some((fil) => JSON.parse(readFileSync(fil, 'utf8')).some((q) => q.fran_version === VERSION))) {
  console.error('Bankerna har redan fran_version 5 (granskad och rättad). Kör med --torr, eller --ersatt för att skriva över.');
  process.exit(1);
}
if (!TORR) {
  // Bankfilerna har CRLF i arbetskopian (core.autocrlf).
  for (const [niva, fil] of Object.entries(FILER)) writeFileSync(fil, `${JSON.stringify([...bank[niva], ...ut[niva]], null, 1)}\n`.replace(/\n/g, '\r\n'));
  console.log('Skrivet till bankfilerna.');
}
