#!/usr/bin/env node
// scripts/gen-figurserier-parti5.mjs
// =============================================================================
// Parti 5 av figurseriernas härnäst-uppgifter (omgång 3 av frågebanken
// 2026-11-19): nya kandidater med fran_version 5. De går in i appen först
// efter testansvarigs granskning (befordran till bankfiler och SERIE_VERSION
// 5); den här generatorn skriver bara kandidatfiler. Kopia av
// gen-figurserier-parti4.mjs med samma spärrar.
//
// Omgångens problem: avancerad är nästan uttömd för pilen och orbitalen i F4,
// och grund för lägesföljderna i F1 och F3 (följdspärren). Därför:
//   ny primitiv  klockan (kind 'klocka', renderers.v7.tsx): urtavla med en lång
//                och en kort visare, två delar som rör sig var för sig
//   ny mall F10  "Två visare" (avancerad): den ena visaren 45 eller 135 grader
//                per steg, den andra kvartsvarv eller pendel
//   ny mall F9   "Två visare i otakt" (expert): växande steg och två serier,
//                eller två serier på båda visarna
//   klockan i    F1 (en visare går, den andra står still), F3, F5 (två serier,
//                den andra visaren stilla eller i kvartsvarv), F7 (två serier
//                och en trecykel) och F8 (växande steg och kvartsvarv eller
//                trecykel)
//   övriga       mallarnas egna varianter och parti 4:s, så långt spärrarna
//                räcker
//
// Spärrarna från granskningarna gäller fullt ut:
//   följdspärren   ingen lägesföljd, vriden växelvis följd eller antalsföljd som
//                  redan finns inom nivå och familj (struktur.mjs, foljdNycklar)
//   regelnyckeln   samma regelnyckel som någon fråga i någon bank, på vilken
//                  nivå som helst, avvisas (struktur.mjs, regelNyckel). För
//                  klockan räknas inga lägen alls, så en klockserie som bara är
//                  vriden som helhet är samma nyckel (klockNyckel).
//   rörelsen       två nya frågor på samma nivå får inte dela rörelse
//                  (regelnyckeln utan konstanterna; granskningen av parti 4,
//                  punkt 3)
//   F2-nyckeln, raden, lägesraden, kvoterna per primitivgrupp och struktur
//   Hellre färre uppgifter än kopior: tar spärrarna slut stannar mallen.
//
// Kör (en mall per process går parallellt, sedan sammanfogning):
//   node node_modules/tsx/dist/cli.mjs scripts/gen-figurserier-parti5.mjs --mall=F10
//   node node_modules/tsx/dist/cli.mjs scripts/gen-figurserier-parti5.mjs --sammanfoga
//   node node_modules/tsx/dist/cli.mjs scripts/gen-figurserier-parti5.mjs --ersatt   (efter granskningen, STRYK nedan)
// Skriver: src/lib/figurserierV1/kandidater/parti5/F*.json och
//          src/lib/figurserierV1/kandidater/parti5-{grund,avancerad,expert}.json
// Kontroll: node node_modules/tsx/dist/cli.mjs scripts/figurserier-verifiera.ts <bankerna och kandidatfilerna>
// =============================================================================

import { writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { MALLAR, NIVA_KOD } from './lib/serie/recept-serie.mjs';
import { bygg } from './lib/serie/generera-serie.mjs';
import { PRIM } from './lib/serie/celler-serie.mjs';
import { strukturNyckel, radNyckel, lagesNyckel, foljdNycklar, regelNyckel, stelaVisare } from './lib/serie/struktur.mjs';
import { mulberry32, hashString } from './lib/serie/slump.mjs';
import { putsa } from './figurserier-copy-omgang3.mjs';

// V11 (noder och bytes per fråga) mäts på renderarens utdata, som är TSX: kör med tsx.
let matSerieFraga, serieGranser;
try {
  ({ matSerieFraga, serieGranser } = await import('../src/lib/logicTestV7/svgMatt.tsx'));
} catch {
  throw new Error('Kör med tsx: node node_modules/tsx/dist/cli.mjs scripts/gen-figurserier-parti5.mjs');
}

const B = 'src/lib/figurserierV1';
const K = `${B}/kandidater`;
const SEED = 'figurserier-v1-parti5';
const VERSION = 5;
const FAM_KOD = { vridning: 'vrid', vandring: 'vand', antal: 'antal', fyllning: 'fyll', vaxande: 'vax', vaxelvis: 'vaxl', flera: 'flera' };

// ---------------------------------------------------------------- regelbyggare (som recept-serie.mjs)
const valj = (r, a) => a[Math.floor(r() * a.length)];
const r8 = (r) => Math.floor(r() * 8);
function blanda(r, arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const konst = (v) => ({ regel: 'konstant', v });
const steg = (s0, k) => ({ regel: 'steg', s0, k });
const cykel = (varden) => ({ regel: 'cykel', varden });
const UDDA = [1, 3, 5, 7];
const KVART = [2, 6];
function vaxande(r) { const t = valj(r, [1, -1]); return { regel: 'vaxande', s0: r8(r), d0: t * valj(r, [1, 2]), dd: t }; }
function vaxelvis(r, L = [1, 2, 3, -1, -2, -3]) { const ke = valj(r, L); const ko = valj(r, L.filter((x) => x !== ke)); return { regel: 'vaxelvis', s0: r8(r), ke, s1: r8(r), ko }; }
function antalSteg(r, min, max) {
  const upp = r() < 0.5;
  const s0 = upp ? min + Math.floor(r() * (max - 5 - min + 1)) : max - Math.floor(r() * (max - 5 - min + 1));
  return steg(s0, upp ? 1 : -1);
}
const cykelOlika = (r, L, p) => cykel(blanda(r, L).slice(0, p));
const SYMB = ['plus', 'minus', 'cross', 'ring'];
const KFORM = ['circle', 'square', 'diamond'];
/** Tre olika riktningar i tur och ordning (klockans trecykel). */
const trecykel = (r) => cykel(blanda(r, [0, 1, 2, 3, 4, 5, 6, 7]).slice(0, 3));
/** Klockan med en regel på den ena visaren och den andra visaren `andra`. */
const klocka = (r, rorlig, andra, vem = valj(r, ['lang', 'kort'])) => ({ prim: 'klocka', dims: vem === 'lang' ? { lang: rorlig, kort: andra } : { lang: andra, kort: rorlig } });

// ---------------------------------------------------------------- varianter per mall
// Klockan först i varje mall, sedan parti 4:s nya varianter och mallens egna.
const NYA = {
  F1: [
    { namn: 'klocka-steg', family: 'vridning', regler: (r) => klocka(r, steg(r8(r), valj(r, UDDA)), konst(r8(r))) },
    { namn: 'prickar-steg', family: 'vandring', regler: (r) => ({ prim: 'prickar', dims: { start: steg(r8(r), valj(r, UDDA)), antal: konst(2 + Math.floor(r() * 3)) } }) },
    { namn: 'duo-kant-symbol-steg', family: 'vandring', regler: (r) => ({ prim: 'duo-kant-symbol', dims: { ylage: steg(r8(r), valj(r, UDDA)), ksymbol: konst(valj(r, SYMB)) } }) },
    { namn: 'duo-kant-form-steg', family: 'vandring', regler: (r) => ({ prim: 'duo-kant-form', dims: { ylage: steg(r8(r), valj(r, UDDA)), kform: konst(valj(r, KFORM)), kfyll: konst(valj(r, ['none', 'black'])) } }) },
    { namn: 'duo-orbital-symbol-steg', family: 'vandring', regler: (r) => ({ prim: 'duo-orbital-symbol', dims: { ylage: steg(r8(r), valj(r, UDDA)), ksymbol: konst(valj(r, SYMB)) } }) },
    { namn: 'duo-kant-pil-vrid', family: 'vridning', regler: (r) => ({ prim: 'duo-kant-pil', dims: { ylage: konst(r8(r)), kvinkel: steg(r8(r), valj(r, UDDA)) } }) },
  ],
  F2: [
    { namn: 'prickar-antal', family: 'antal', regler: (r) => ({ prim: 'prickar', dims: { start: konst(r8(r)), antal: antalSteg(r, 2, 7) } }) },
  ],
  F3: [
    { namn: 'klocka-vaxande', family: 'vaxande', regler: (r) => klocka(r, vaxande(r), konst(r8(r))) },
    { namn: 'prickar-vaxande', family: 'vaxande', regler: (r) => ({ prim: 'prickar', dims: { start: vaxande(r), antal: konst(2 + Math.floor(r() * 2)) } }) },
    { namn: 'duo-kant-symbol-vaxande', family: 'vaxande', regler: (r) => ({ prim: 'duo-kant-symbol', dims: { ylage: vaxande(r), ksymbol: konst(valj(r, SYMB)) } }) },
    { namn: 'duo-orbital-form-vaxande', family: 'vaxande', regler: (r) => ({ prim: 'duo-orbital-form', dims: { ylage: vaxande(r), kform: konst(valj(r, KFORM)), kfyll: konst(valj(r, ['none', 'black'])) } }) },
  ],
  F5: [
    { namn: 'klocka-vaxelvis', family: 'vaxelvis', regler: (r) => klocka(r, vaxelvis(r), konst(r8(r))) },
    { namn: 'klocka-vaxelvis-kvart', family: 'vaxelvis', regler: (r) => klocka(r, vaxelvis(r), steg(r8(r), valj(r, KVART))) },
    { namn: 'prickar-vaxelvis', family: 'vaxelvis', regler: (r) => ({ prim: 'prickar', dims: { start: vaxelvis(r), antal: konst(2 + Math.floor(r() * 2)) } }) },
    { namn: 'duo-kant-symbol-vaxelvis', family: 'vaxelvis', regler: (r) => ({ prim: 'duo-kant-symbol', dims: { ylage: vaxelvis(r), ksymbol: konst(valj(r, SYMB)) } }) },
    { namn: 'duo-orbital-form-vaxelvis', family: 'vaxelvis', regler: (r) => ({ prim: 'duo-orbital-form', dims: { ylage: vaxelvis(r), kform: konst(valj(r, KFORM)), kfyll: konst(valj(r, ['none', 'black'])) } }) },
    { namn: 'duo-orbital-pil-vaxelvis', family: 'vaxelvis', regler: (r) => ({ prim: 'duo-orbital-pil', dims: { ylage: vaxelvis(r), kvinkel: valj(r, [konst(r8(r)), steg(r8(r), valj(r, KVART))]) } }) },
    { namn: 'stralar-vaxelvis', family: 'vaxelvis', regler: (r) => ({ prim: 'stralar', dims: { start: vaxelvis(r), antal: konst(valj(r, [2, 3])) } }) },
    { namn: 'block-vaxelvis', family: 'vaxelvis', regler: (r) => ({ prim: 'block', dims: { start: vaxelvis(r), antal: konst(valj(r, [1, 2])) } }) },
  ],
  F7: [
    { namn: 'klocka-vaxelvis-trecykel', family: 'vaxelvis', regler: (r) => klocka(r, vaxelvis(r), trecykel(r)) },
    { namn: 'prickar-vaxelvis-antalsteg', family: 'antal', regler: (r) => ({ prim: 'prickar', dims: { start: vaxelvis(r, [4, 1, 2, 3, -1, -2, -3]), antal: antalSteg(r, 2, 7) } }) },
    { namn: 'block-vaxelvis-antalsteg', family: 'antal', regler: (r) => ({ prim: 'block', dims: { start: vaxelvis(r, [4, 1, 2, 3, -1, -2, -3]), antal: antalSteg(r, 1, 7) } }) },
    { namn: 'duo-orbital-symbol-tretakt', family: 'vaxelvis', regler: (r) => ({ prim: 'duo-orbital-symbol', dims: { ylage: vaxelvis(r), ksymbol: cykelOlika(r, SYMB, 3) } }) },
    { namn: 'duo-kant-form-tretakt', family: 'vaxelvis', regler: (r) => ({ prim: 'duo-kant-form', dims: { ylage: vaxelvis(r), kform: cykelOlika(r, KFORM, 3), kfyll: konst(valj(r, ['none', 'black'])) } }) },
  ],
  F8: [
    { namn: 'klocka-vaxande-kvart', family: 'vaxande', regler: (r) => klocka(r, vaxande(r), steg(r8(r), valj(r, KVART))) },
    { namn: 'klocka-vaxande-trecykel', family: 'flera', regler: (r) => klocka(r, vaxande(r), trecykel(r)) },
  ],
};
// Pilen och orbitalen i tretakt står utanför expert (granskningen av parti 3,
// punkt 7), blocket som vandrar i F1 läses som en figur som byter form
// (granskningen av parti 4, punkt 5), och F8 tar bara trecykeln utöver
// klockan (granskningen av parti 4, punkt 1).
const UTAN = new Set(['pil-vaxelvis-tretakt', 'orbital-vaxelvis-tretakt', 'block-steg', 'duo-kant-pil-vaxande', 'duo-orbital-pil-vaxande', 'duo-kant-pil-pilvaxer', 'duo-orbital-pil-pilvaxer']);

/** Högsta antal per mall i parti 5; spärrarna kan ge färre. */
const ANTAL = { F1: 12, F2: 2, F3: 4, F5: 16, F7: 12, F8: 10, F9: 25, F10: 38 };

// ---------------------------------------------------------------- ersättarna (--ersatt)
// Efter granskningen: id som testansvarig fäller står här. --ersatt stryker dem
// ur parti5-*.json och genererar lika många nya med alla spärrar, mot bankerna
// och de kvarvarande i parti 5. Godkända uppgifter rörs inte.
const ERSATT = process.argv.includes('--ersatt');
// Granskningen av parti 5 (docs/fragebank/figurserier-2026-11-19-omg3-granskning.md).
// Strykningarna ersätts inte; listan håller id:na borta om --ersatt körs.
const STRYK = new Set(['fs-e-flera-19', 'fs-a-flera-35', 'fs-g-vrid-42']);

/** Rörelsen: regelnyckeln utan konstanterna. Två nya frågor på samma nivå får inte dela den. */
const rorelse = (q) => `${q.niva}|${regelNyckel(q).split('|').filter((d) => !d.includes('=')).join('|')}`;
const rorelser = new Set();

// ---------------------------------------------------------------- det som redan finns
const filer = [
  ...readdirSync(B).filter((f) => /^bank(?!Bryter).*\.json$/.test(f)).map((f) => `${B}/${f}`),
  ...['', 'omgang1/', 'omgang2/', 'generator/'].flatMap((d) => ['grund', 'avancerad', 'expert'].map((n) => `${K}/${d}${n}.json`)),
  `${K}/parti2-grund.json`, `${K}/parti2-avancerad.json`,
  ...['grund', 'avancerad', 'expert'].map((n) => `${K}/parti4-${n}.json`),
  ...(existsSync(`${K}/parti3`) ? readdirSync(`${K}/parti3`).map((f) => `${K}/parti3/${f}`) : []),
  ...(ERSATT ? ['grund', 'avancerad', 'expert'].map((n) => `${K}/parti5-${n}.json`) : []),
].filter((f) => existsSync(f));
const radNycklar = new Set();
const lagesrader = new Set();
const foljder = new Set();
// F2-nyckeln (validate-figurserier.mjs): primitiv, riktning och startantal en gång per nivå.
const f2 = (q) => (q.recept === 'F2' && q.regler.dims.antal?.regel === 'steg' ? `${q.niva}|${q.regler.prim}|${q.regler.dims.antal.k}|${q.regler.dims.antal.s0}` : null);
const f2Nycklar = new Set();
const regelNycklar = new Map();
const kvar = {};
const nummer = {};
for (const f of filer) for (const q of JSON.parse(readFileSync(f, 'utf8'))) {
  const iParti5 = /parti5-/.test(f);
  // Skarpa banker (och med --ersatt de kvarvarande i parti 5) räknas för alla
  // spärrar; kandidaterna bara för raderna och numreringen.
  if (iParti5 && STRYK.has(q.id)) { /* strukna: bara numreringen */ }
  else if (f.startsWith(`${B}/bank`) || iParti5) {
    if (iParti5) (kvar[q.recept] ??= []).push(q);
    const rn = regelNyckel(q);
    if (rn && !regelNycklar.has(rn)) regelNycklar.set(rn, q.id);
    radNycklar.add(radNyckel(q));
    const l = lagesNyckel(q);
    if (l) lagesrader.add(`${q.niva}|${l}`);
    for (const k of foljdNycklar(q)) foljder.add(k);
    if (f2(q)) f2Nycklar.add(f2(q));
    if (iParti5) rorelser.add(rorelse(q));
  } else radNycklar.add(radNyckel(q));
  const m = /^fs-([gae])-([a-z]+)-(\d+)$/.exec(q.id);
  if (m) nummer[`${m[1]}-${m[2]}`] = Math.max(nummer[`${m[1]}-${m[2]}`] ?? 0, Number(m[3]));
}
// Strukna id används aldrig igen.
for (const id of STRYK) {
  const m = /^fs-([gae])-([a-z]+)-(\d+)$/.exec(id);
  nummer[`${m[1]}-${m[2]}`] = Math.max(nummer[`${m[1]}-${m[2]}`] ?? 0, Number(m[3]));
}

// ---------------------------------------------------------------- generering
const DEL = `${K}/parti5`;
const ARG_MALL = process.argv.find((a) => a.startsWith('--mall='))?.slice('--mall='.length);

if (process.argv.includes('--sammanfoga') && !ERSATT) {
  const perNiva = { grund: [], avancerad: [], expert: [] };
  const rk = new Map(), lk = new Map(), idn = new Set(), nk = new Map(), rr = new Map(), fk = new Map();
  for (const m of Object.keys(ANTAL)) {
    if (!existsSync(`${DEL}/${m}.json`)) continue;
    for (const q of JSON.parse(readFileSync(`${DEL}/${m}.json`, 'utf8'))) {
      const r = radNyckel(q), l = lagesNyckel(q), n = regelNyckel(q), ro = rorelse(q);
      if (rk.has(r)) throw new Error(`${q.id}: samma rad som ${rk.get(r)}`);
      if (l && lk.has(`${q.niva}|${l}`)) throw new Error(`${q.id}: samma lägesrad som ${lk.get(`${q.niva}|${l}`)}`);
      if (idn.has(q.id)) throw new Error(`${q.id}: dubbelt id`);
      if (nk.has(n)) throw new Error(`${q.id}: samma regelnyckel som ${nk.get(n)}`);
      if (rr.has(ro)) throw new Error(`${q.id}: samma rörelse som ${rr.get(ro)}`);
      for (const k of foljdNycklar(q)) { if (fk.has(k)) throw new Error(`${q.id}: samma följd som ${fk.get(k)}`); fk.set(k, q.id); }
      rk.set(r, q.id); if (l) lk.set(`${q.niva}|${l}`, q.id); idn.add(q.id); nk.set(n, q.id); rr.set(ro, q.id);
      perNiva[q.niva].push(q);
    }
  }
  for (const [niva, fragor] of Object.entries(perNiva)) {
    const f = `${K}/parti5-${niva}.json`;
    writeFileSync(f, JSON.stringify(fragor, null, 1) + '\n');
    console.log(`${f}: ${fragor.length} frågor`);
  }
  process.exit(0);
}
mkdirSync(DEL, { recursive: true });
const start = Date.now();
const perNiva = { grund: [], avancerad: [], expert: [] };
for (const bas of MALLAR) {
  const antal = ERSATT ? (kvar[bas.id] ?? []).filter((q) => STRYK.has(q.id)).length : ANTAL[bas.id];
  if (!antal || (ARG_MALL && ARG_MALL !== bas.id)) continue;
  // Mallar ur parti 5 har sina egna varianter; de äldre får klockan och parti 4:s först.
  const varianter = bas.parti === 5 ? bas.varianter : [...(NYA[bas.id] ?? []), ...bas.varianter.filter((v) => !UTAN.has(v.namn) && !(NYA[bas.id] ?? []).some((n) => n.namn === v.namn))];
  const mall = { ...bas, antal };
  const r = mulberry32(hashString(`${SEED}:${ERSATT ? 'ersatt:' : ''}${mall.id}`));
  // Kvoterna räknas som validatorn gör: på mallens antal i recept-serie.mjs.
  const tak = bas.grupptak ?? Math.ceil(bas.antal / 3);
  const strukturTak = Math.ceil(bas.antal / 2);
  const perGrupp = {};
  const perStruktur = {};
  for (const q of ERSATT ? (kvar[bas.id] ?? []).filter((x) => !STRYK.has(x.id)) : []) {
    perGrupp[PRIM[q.regler.prim].grupp] = (perGrupp[PRIM[q.regler.prim].grupp] ?? 0) + 1;
    perStruktur[strukturNyckel(q)] = (perStruktur[strukturNyckel(q)] ?? 0) + 1;
  }
  const platser = [];
  while (platser.length < antal) platser.push(0, 1, 2, 3, 4, 5);
  for (let i = platser.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [platser[i], platser[j]] = [platser[j], platser[i]]; }
  let gjorda = 0, forsok = 0, v = 0, variant = null, perVariant = 0;
  const perVariantGjorda = {};
  const skal = {};
  const raknaSkal = (k) => { skal[`${variant.namn}:${k}`] = (skal[`${variant.namn}:${k}`] ?? 0) + 1; };
  while (gjorda < antal) {
    // Hellre färre än kopior (granskningen av parti 4, punkt 2).
    if (++forsok > 60000) { console.log(`${mall.id}: ${gjorda} av ${antal}, spärrarna tar slut; skäl ${JSON.stringify(skal)}`); break; }
    if (forsok % 5000 === 0) console.log(`${mall.id}: ${forsok} försök, ${gjorda} klara, ${((Date.now() - start) / 1000).toFixed(0)} s`);
    if (!variant || perVariant >= 60) { variant = varianter[v++ % varianter.length]; perVariant = 0; }
    perVariant++;
    if ((perGrupp[PRIM[variant.regler(mulberry32(1)).prim].grupp] ?? 0) >= tak) { perVariant = 60; continue; }
    const kod = NIVA_KOD[mall.niva];
    const nyckelNr = `${kod}-${FAM_KOD[variant.family]}`;
    const id = `fs-${kod}-${FAM_KOD[variant.family]}-${String((nummer[nyckelNr] ?? 0) + 1).padStart(2, '0')}`;
    // Regelnyckeln och rörelsen prövas före bygget, som är det dyra steget.
    const regler = variant.regler(r);
    if (regelNycklar.has(regelNyckel({ regler }))) { raknaSkal('regel'); continue; }
    if (rorelser.has(rorelse({ niva: mall.niva, regler }))) { raknaSkal('rorelse'); continue; }
    // Granskningen av parti 5, punkt 1: båda visarna med samma steg i båda serierna.
    if (stelaVisare({ regler })) { raknaSkal('stel'); continue; }
    const q = bygg(r, mall, { ...variant, regler: () => regler }, { id, pos: platser[gjorda] });
    if (!q) { raknaSkal('bygg'); continue; }
    const grupp = PRIM[q.regler.prim].grupp;
    if ((perGrupp[grupp] ?? 0) >= tak) continue;
    const sk = strukturNyckel(q);
    if ((perStruktur[sk] ?? 0) >= strukturTak) { raknaSkal('struktur'); continue; }
    const rk = radNyckel(q);
    if (radNycklar.has(rk)) continue;
    const lk = lagesNyckel(q);
    if (lk && lagesrader.has(`${q.niva}|${lk}`)) { raknaSkal('lagesrad'); continue; }
    if (foljdNycklar(q).some((k) => foljder.has(k))) { raknaSkal('foljd'); continue; }
    if (f2(q) && f2Nycklar.has(f2(q))) { raknaSkal('f2'); continue; }
    const rn = regelNyckel(q);
    if (regelNycklar.has(rn)) continue;
    const matt = matSerieFraga(q), grans = serieGranser(q);
    if (matt.noder > grans.noder || matt.bytes > grans.bytes) { raknaSkal('v11'); continue; }
    radNycklar.add(rk);
    if (lk) lagesrader.add(`${q.niva}|${lk}`);
    for (const k of foljdNycklar(q)) foljder.add(k);
    if (f2(q)) f2Nycklar.add(f2(q));
    regelNycklar.set(rn, q.id);
    rorelser.add(rorelse(q));
    q.fran_version = VERSION;
    q.misstag = q.misstag.map((m) => (m ? putsa(m) : m));
    texter(q);
    perGrupp[grupp] = (perGrupp[grupp] ?? 0) + 1;
    perStruktur[sk] = (perStruktur[sk] ?? 0) + 1;
    perVariantGjorda[variant.namn] = (perVariantGjorda[variant.namn] ?? 0) + 1;
    nummer[nyckelNr] = (nummer[nyckelNr] ?? 0) + 1;
    perNiva[mall.niva].push(q);
    gjorda++;
    variant = null;
  }
  console.log(`${mall.id} ${mall.namn}: ${gjorda} (${forsok} försök) ${JSON.stringify(perVariantGjorda)}`);
  const nya = perNiva[mall.niva].filter((q) => q.recept === mall.id);
  if (!ERSATT) writeFileSync(`${DEL}/${mall.id}.json`, JSON.stringify(nya, null, 1) + '\n');
}
if (ERSATT) {
  for (const niva of ['grund', 'avancerad', 'expert']) {
    const f = `${K}/parti5-${niva}.json`;
    const fore = JSON.parse(readFileSync(f, 'utf8'));
    const ut = [...fore.filter((q) => !STRYK.has(q.id)), ...perNiva[niva]];
    writeFileSync(f, JSON.stringify(ut, null, 1) + '\n');
    console.log(`${f}: ${fore.length} före, ${ut.length} efter (${perNiva[niva].length} ersättare)`);
  }
}
console.log(`Klart på ${((Date.now() - start) / 1000).toFixed(1)} s.${ERSATT ? '' : ' Sedan: --sammanfoga'}`);

/**
 * Texterna som mallarna i misstag-serie.mjs inte täcker: rubriken när bara
 * kärnan i en duo rör sig, antalsmeningen i F7, månghörningens fyllning och,
 * för klockan, en enda inledning när båda visarna går i två serier.
 */
function texter(q) {
  const { prim, dims } = q.regler;
  if (prim.startsWith('duo-') && dims.ylage?.regel === 'konstant') {
    const karna = prim.split('-')[2];
    const namn = { pil: 'Pilen i mitten', form: 'Formen i mitten', symbol: 'Symbolen i mitten' }[karna];
    q.title = q.title.replace(/^[^,]+,/, `${namn},`);
  }
  if (['sektor', 'stralar', 'prickar', 'block'].includes(prim) && dims.start?.regel === 'vaxelvis' && dims.antal?.regel === 'steg') {
    const T = {
      'sektor+': ['En sektor till blir svart medurs i varje steg.', 'Antalet svarta sektorer ökar med en i varje figur, oavsett serie. De sitter ihop medurs från den första svarta.'],
      'sektor-': ['Den sista svarta sektorn medurs blir vit i varje steg.', 'Antalet svarta sektorer minskar med en i varje figur, oavsett serie. De sitter ihop medurs från den första svarta.'],
      'stralar+': ['Ett streck till läggs till medurs i varje steg.', 'Antalet streck ökar med ett i varje figur, oavsett serie. Strecken sitter ihop medurs från det första.'],
      'stralar-': ['Det sista strecket medurs försvinner i varje steg.', 'Antalet streck minskar med ett i varje figur, oavsett serie. Strecken sitter ihop medurs från det första.'],
      'prickar+': ['En prick till läggs till medurs i varje steg.', 'Antalet prickar ökar med en i varje figur, oavsett serie. Prickarna sitter ihop medurs från den första.'],
      'prickar-': ['Den sista pricken medurs försvinner i varje steg.', 'Antalet prickar minskar med en i varje figur, oavsett serie. Prickarna sitter ihop medurs från den första.'],
      'block+': ['En ruta till blir svart medurs längs kanten i varje steg.', 'Antalet svarta rutor ökar med en i varje figur, oavsett serie. De sitter ihop medurs längs kanten från den första svarta.'],
      'block-': ['Den sista svarta rutan medurs blir vit i varje steg.', 'Antalet svarta rutor minskar med en i varje figur, oavsett serie. De sitter ihop medurs längs kanten från den första svarta.'],
    }[`${prim}${dims.antal.k > 0 ? '+' : '-'}`];
    if (!q.rule.includes(T[0])) throw new Error(`${q.id}: väntad antalsmening saknas`);
    q.rule = q.rule.replace(T[0], T[1]);
  }
  if (prim === 'poly' && dims.fyllning?.regel === 'cykel') {
    q.rule = q.rule.replace('Figuren följer ordningen', 'Fyllningen följer ordningen').replace('Figuren växlar mellan', 'Fyllningen växlar mellan');
  }
  if (prim === 'klocka' && dims.lang.regel === 'vaxelvis' && dims.kort.regel === 'vaxelvis') {
    // Två meningar som båda börjar med "Varannan figur hör till samma serie." och
    // slutar med "Luckan hör till den andra serien." blir en inledning och ett slut.
    const INTRO = 'Varannan figur hör till samma serie. ';
    const SLUT = ' Luckan hör till den andra serien.';
    if (q.rule.split(INTRO).length !== 3 || q.rule.split(SLUT).length !== 3) throw new Error(`${q.id}: väntade två växelvisa meningar`);
    q.rule = `Varannan figur hör till samma serie, för båda visarna. ${q.rule.replaceAll(INTRO, '').replaceAll(SLUT, '')} Luckan hör till den andra serien för båda.`;
  }
}
