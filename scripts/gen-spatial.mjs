// scripts/gen-spatial.mjs
// =============================================================================
// Bygger bankerna för Spatial förmåga (brief-tester-steg2-2026-11-09.md
// avsnitt 2): form A (brickfigur), B (pappersvikning) och C (tärningar).
//
// Kör: node scripts/gen-spatial.mjs              (alla former)
//      node scripts/gen-spatial.mjs --form A     (bara form A, övriga former i
//                                                 bankfilen lämnas orörda)
//      node scripts/gen-spatial.mjs --torr       (skriver inget)
//
// Deterministiskt (fröet per form, nivå och nummer). Varje uppgift klarar
// formens spärrar (SP-A, SP-B, SP-C) innan den tas med. Geometrin i riktig SVG
// mäts efteråt av scripts/spatial-geometri-check.mjs.
// =============================================================================

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { byggUppgiftA, sparrarA, nyckel as brickNyckel } from './lib/spatial/brick.mjs';

const PER_FORM = 24;
const FRO = 'spatial-v1-2026-11-09';
const NIVAER = ['grund', 'avancerad', 'expert'];
const KORT = { grund: 'g', avancerad: 'a', expert: 'e' };
const P_PRIOR = { grund: 0.8, avancerad: 0.6, expert: 0.42 };
const SVARIGHET = { grund: 1, avancerad: 2, expert: 3 };

const arg = process.argv;
const torr = arg.includes('--torr');
const formArg = arg.includes('--form') ? arg[arg.indexOf('--form') + 1] : null;

/** Formerna: byggare, spärrar och en nyckel som stoppar dubbletter. */
export const FORMER = {
  A: { bygg: byggUppgiftA, sparrar: sparrarA, nyckel: (q) => `${brickNyckel(q.referens)}|${brickNyckel(q.options[q.correctAnswer])}` },
};

export async function laddaFormer() {
  // B och C läggs till av sina delar (vikning.mjs, kub.mjs) när de finns.
  if (existsSync('scripts/lib/spatial/vikning.mjs')) {
    const B = await import('./lib/spatial/vikning.mjs');
    FORMER.B = { bygg: B.byggUppgiftB, sparrar: B.sparrarB, nyckel: B.nyckelB };
  }
  if (existsSync('scripts/lib/spatial/kub.mjs')) {
    const C = await import('./lib/spatial/kub.mjs');
    FORMER.C = { bygg: C.byggUppgiftC, sparrar: C.sparrarC, nyckel: C.nyckelC };
  }
}

function formBank(form, niva) {
  const F = FORMER[form];
  const ut = [];
  const sedda = new Set();
  const avvisade = {};
  for (let i = 0; ut.length < PER_FORM && i < 20000; i++) {
    const id = `sp-${KORT[niva]}-${form.toLowerCase()}-${String(ut.length + 1).padStart(2, '0')}`;
    const q = F.bygg({ niva, id, fro: `${FRO}:${form}:${niva}:${i}` });
    if (!q) {
      avvisade.bygg = (avvisade.bygg ?? 0) + 1;
      continue;
    }
    const fel = F.sparrar(q);
    if (fel.length) {
      const k = fel[0].split(': ')[1].split(' ')[0];
      avvisade[k] = (avvisade[k] ?? 0) + 1;
      continue;
    }
    const n = F.nyckel(q);
    if (sedda.has(n)) continue;
    sedda.add(n);
    ut.push({ ...q, difficulty: SVARIGHET[niva] + (form === 'A' ? 0 : 1), p_prior: P_PRIOR[niva], fran_version: 1 });
  }
  return { ut, avvisade };
}

const fil = (niva) => `src/lib/spatialV1/bank${niva[0].toUpperCase()}${niva.slice(1)}.json`;

if (process.argv[1]?.endsWith('gen-spatial.mjs')) {
  await laddaFormer();
  const former = formArg ? [formArg] : Object.keys(FORMER);
  let fel = 0;
  for (const niva of NIVAER) {
    const gammal = existsSync(fil(niva)) ? JSON.parse(readFileSync(fil(niva), 'utf8')) : [];
    let bank = gammal.filter((q) => !former.includes(q.form));
    for (const form of former) {
      const { ut, avvisade } = formBank(form, niva);
      console.log(`${niva} ${form}: ${ut.length}`, avvisade);
      if (ut.length < PER_FORM) fel++;
      bank = [...bank, ...ut];
    }
    bank.sort((a, b) => a.form.localeCompare(b.form) || a.id.localeCompare(b.id));
    if (!torr) writeFileSync(fil(niva), JSON.stringify(bank, null, 1) + '\n');
  }
  process.exit(fel ? 1 : 0);
}
