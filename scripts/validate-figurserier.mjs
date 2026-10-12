#!/usr/bin/env node
// scripts/validate-figurserier.mjs
// =============================================================================
// Struktur och kvoter för figurseriernas banker (beställningen omgång 2, A2,
// A3 och A6). Kör efter scripts/gen-figurserier.mjs, före de andra
// kontrollerna i kedjan (se filhuvudet där).
//
// Kör: node scripts/validate-figurserier.mjs            (kandidaterna och bankerna)
//      node scripts/validate-figurserier.mjs <fil ...>   (bara de filerna)
//
// Per fråga: fälten (id fs-<g|a|e>-<familj>-<nn>, niva, family, recept,
// difficulty, p_prior, title, rule, rad 5, options 6, correctAnswer, misstag
// 6 med tomt för facit, regler, fran_version 1), p_prior lika mallens och
// inom nivåns spann (grund minst 0,60, expert högst 0,45), inga tankstreck,
// inget "lätt", reglerna återger raden, och spärrarna FS1 till FS6, S5, S6,
// S11 till S13 utan fel.
// Per mall (en fil med en hel nivå): antalet enligt mallen, varje
// primitivgrupp högst ⌈n/3⌉, ingen strukturnyckel fler än ⌈n/2⌉.
// Per nivå: familjerna (alla sju på avancerad och expert, minst fyra på
// grund). Över allt: unika id och ingen rad två gånger.
// Exit 1 vid fel.
// =============================================================================

import { MALLAR, P_PRIOR_SPANN, FAMILJER } from './lib/serie/recept-serie.mjs';
import { PRIM } from './lib/serie/celler-serie.mjs';
import { sparrFelSerie } from './lib/serie/sparrar.mjs';
import { strukturNyckel, radNyckel, lagesNyckel } from './lib/serie/struktur.mjs';
import { lasFiler, reglerFel } from './lib/serie/kontroll.mjs';

const fel = [];
const info = [];
const ID = /^fs-[gae]-[a-z]+-\d{2}$/;
const TANKSTRECK = /[–—]/;
const MALL = Object.fromEntries(MALLAR.map((m) => [m.id, m]));

const filer = lasFiler(process.argv.slice(2));
const allaId = new Map();
const allaRader = new Map();
// Lägesraden per nivå (granskning 02, F7): samma fem lägen i samma ordning bara en gång.
const lagesrader = new Map();

for (const { fil, fragor } of filer) {
  if (!Array.isArray(fragor)) { fel.push(`${fil}: inte en lista`); continue; }
  if (fragor.length === 0) { info.push(`${fil}: tom (väntar på befordran)`); continue; }
  const perNiva = {};
  for (const q of fragor) {
    const m = MALL[q.recept];
    const f = (x) => fel.push(`${q.id ?? '?'}: ${x}`);
    if (!ID.test(q.id ?? '')) f('id ska vara fs-<g|a|e>-<familj>-<nn>');
    if (allaId.has(q.id)) f(`id finns redan i ${allaId.get(q.id)}`);
    allaId.set(q.id, fil);
    if (!m) { f(`okänt recept ${q.recept}`); continue; }
    if (q.niva !== m.niva) f(`nivån ${q.niva} stämmer inte med ${m.id} (${m.niva})`);
    if (!FAMILJER.includes(q.family)) f(`okänd familj ${q.family}`);
    if (typeof q.p_prior !== 'number') f('p_prior saknas');
    else {
      const [lo, hi] = P_PRIOR_SPANN[q.niva];
      if (q.p_prior < lo || q.p_prior > hi) f(`p_prior ${q.p_prior} utanför spannet för ${q.niva} [${lo}, ${hi}]`);
      if (q.p_prior !== m.p_prior) f(`p_prior ${q.p_prior}, mallen ${m.id} säger ${m.p_prior} (p_prior står per mall)`);
    }
    if (q.difficulty !== m.difficulty) f(`difficulty ${q.difficulty}, mallen säger ${m.difficulty}`);
    if (q.fran_version !== 1 && q.fran_version !== 2) f('fran_version ska vara 1 eller 2 (parti 2)');
    if (!Array.isArray(q.rad) || q.rad.length !== 5) f('raden ska ha fem figurer');
    if (!Array.isArray(q.options) || q.options.length !== 6) f('sex alternativ krävs');
    if (!Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer > 5) f('correctAnswer utanför 0 till 5');
    if (!Array.isArray(q.misstag) || q.misstag.length !== 6) f('misstag ska ha sex poster');
    else q.misstag.forEach((x, i) => {
      if (i === q.correctAnswer && x) f('misstag för facit ska vara tomt');
      if (i !== q.correctAnswer && !x) f(`misstag saknas för alternativ ${'ABCDEF'[i]}`);
    });
    for (const [namn, text] of [['rule', q.rule], ['title', q.title], ...(q.misstag ?? []).map((x, i) => [`misstag ${'ABCDEF'[i]}`, x])]) {
      if (typeof text !== 'string') continue;
      if (TANKSTRECK.test(text)) f(`tankstreck i ${namn}`);
      if (/\blätt/i.test(text)) f(`"lätt" i ${namn}`);
    }
    if (!q.rule) f('rule saknas');
    if (!q.title) f('title saknas');
    fel.push(...reglerFel(q));
    fel.push(...sparrFelSerie(q).fel);
    const rk = radNyckel(q);
    if (allaRader.has(rk)) f(`samma rad som ${allaRader.get(rk)}`);
    allaRader.set(rk, q.id);
    const lk = lagesNyckel(q);
    if (lk) {
      const k = `${q.niva}|${lk}`;
      if (lagesrader.has(k)) f(`samma lägesrad som ${lagesrader.get(k)} (granskning 02, F7)`);
      lagesrader.set(k, q.id);
    }
    (perNiva[q.niva] ??= []).push(q);
  }
  // Per mall och nivå, när filen bär en hel nivå.
  for (const [niva, qs] of Object.entries(perNiva)) {
    const mallar = MALLAR.filter((m) => m.niva === niva);
    const hel = mallar.every((m) => qs.filter((q) => q.recept === m.id).length === m.antal);
    for (const m of mallar) {
      const mq = qs.filter((q) => q.recept === m.id);
      if (mq.length !== m.antal) info.push(`${fil}: ${m.id} har ${mq.length} frågor, mallen ${m.antal}`);
      const tak = Math.ceil(m.antal / 3);
      const sTak = Math.ceil(m.antal / 2);
      const g = {}, s = {};
      for (const q of mq) {
        const gr = PRIM[q.regler.prim].grupp;
        g[gr] = (g[gr] ?? 0) + 1;
        const sk = strukturNyckel(q);
        s[sk] = (s[sk] ?? 0) + 1;
      }
      for (const [gr, n] of Object.entries(g)) if (n > tak) fel.push(`${m.id}: primitivgruppen ${gr} i ${n} frågor, högst ${tak}`);
      for (const [sk, n] of Object.entries(s)) if (n > sTak) fel.push(`${m.id}: strukturnyckeln ${sk} i ${n} frågor, högst ${sTak}`);
    }
    if (hel) {
      const fam = new Set(qs.map((q) => q.family));
      const krav = niva === 'grund' ? 4 : 7;
      if (fam.size < krav) fel.push(`${niva}: ${fam.size} familjer (${[...fam].join(', ')}), minst ${krav}`);
      const total = mallar.reduce((s, m) => s + m.antal, 0);
      console.log(`${fil}: ${niva}, ${qs.length} av ${total}, familjer ${[...fam].sort().join(', ')}`);
    } else console.log(`${fil}: ${qs.length} frågor`);
  }
}

if (info.length) {
  console.log(`\nUpplysningar (${info.length}):`);
  info.forEach((x) => console.log('  ' + x));
}
if (fel.length) {
  console.log(`\n${fel.length} fel:`);
  fel.forEach((x) => console.log('  ' + x));
  process.exit(1);
}
console.log(`\n${allaId.size} frågor utan fel.`);
