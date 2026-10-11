// scripts/lib/matris/kor-generator.mjs
// =============================================================================
// Kör recepten för en nivå och skriver nivåns 3c-bank.
//
// - Ursprungsbankerna (28 per nivå) rörs aldrig: sessioner härleder sitt urval
//   ur dem. Nya frågor ligger i egna filer (questionBank*3c.v7.json).
// - Id-lås: finns filen redan måste varje incheckat id få exakt samma
//   innehåll, annars avbryts körningen. Nya recept läggs till sist.
// - Inget rutnät får förekomma två gånger i någon bank.
//
// Kandidatläget (genereraKandidater) skriver en kandidatfil under
// src/lib/logicTestV7/kandidater/ som testansvarig granskar. Inget id-lås
// (filen får skrivas om tills den är godkänd), men inget rutnät får finnas
// i de sex bankerna eller i någon annan kandidatfil, och inom partiet får
// två frågor inte ha samma mönster med andra former (mjukNyckel).
// =============================================================================

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { bygg, key, mjukNyckel, strukturNyckel } from './generera.mjs';
import { NIVAER } from './recept.mjs';

const las = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null);

export function genereraNiva(niva) {
  const { recept, ut } = NIVAER[niva];
  const upptagna = new Set();
  for (const n of Object.values(NIVAER)) {
    for (const q of las(n.original) ?? []) upptagna.add(key(q.grid));
    if (n.ut !== ut) for (const q of las(n.ut) ?? []) upptagna.add(key(q.grid));
  }
  const tidigare = new Map((las(ut) ?? []).map((q) => [q.id, q]));
  const ny = [];
  const fel = [];
  for (const rc of recept) {
    try {
      const q = bygg(rc, upptagna, { kandidatKrav: !tidigare.has(rc.id) });
      const gammal = tidigare.get(q.id);
      if (gammal && key(gammal) !== key(q)) {
        fel.push(`${q.id}: innehållet skulle ändras. Ett incheckat id får inte byta fråga; lägg nya recept sist.`);
        continue;
      }
      ny.push(q);
    } catch (e) {
      fel.push(e.message);
    }
  }
  for (const [id, q] of tidigare) if (!ny.some((x) => x.id === id)) { fel.push(`${id}: finns i banken men inte bland recepten`); ny.push(q); }
  if (fel.length) {
    console.error(`✗ ${niva}: ${fel.length} problem\n` + fel.map((x) => '  - ' + x).join('\n'));
    process.exitCode = 1;
    return null;
  }
  writeFileSync(ut, JSON.stringify(ny, null, 2) + '\n');
  const perFamilj = {};
  ny.forEach((q) => { perFamilj[q.family] = (perFamilj[q.family] ?? 0) + 1; });
  console.log(`✓ ${niva}: skrev ${ny.length} frågor till ${ut}`);
  console.log('  ' + Object.entries(perFamilj).map(([f, n]) => `${f} ${n}`).join(', '));
  return ny;
}

export const KANDIDATER = 'src/lib/logicTestV7/kandidater';

/** Alla rutnät i de sex bankerna och i kandidatfilerna utom `ut`. */
export function upptagnaRutnat(ut) {
  const upptagna = new Set();
  for (const n of Object.values(NIVAER)) for (const f of [n.original, n.ut]) for (const q of las(f) ?? []) upptagna.add(key(q.grid));
  if (existsSync(KANDIDATER)) {
    for (const f of readdirSync(KANDIDATER).filter((x) => x.endsWith('.json'))) {
      const fil = path.posix.join(KANDIDATER, f);
      if (path.resolve(fil) === path.resolve(ut)) continue;
      for (const q of las(fil) ?? []) upptagna.add(key(q.grid));
    }
  }
  return upptagna;
}

/**
 * Strukturvariation (granskningen av parti 01, 2.6 punkt 4): inom en
 * mekanism med fler än en fråga ska minst två olika strukturnycklar finnas
 * (förskjutning, schackfas, spetsens läge), annars varieras bara startläget.
 * `undantag` är mekanismer som godkänts med en enda struktur. Gäller de
 * latinska mekanismerna; i överlagring varieras regeln i receptet
 * (operation, axel, vridning).
 */
export function strukturFel(fragor, undantag = {}) {
  const per = {};
  for (const q of fragor) if (q.mekanism && q.family === 'latin-flera') (per[q.mekanism] ??= []).push(strukturNyckel(q));
  return Object.entries(per)
    .filter(([m, n]) => n.length > 1 && new Set(n).size < 2 && !undantag[m])
    .map(([m, n]) => `${m}: alla ${n.length} frågor har samma struktur, minst två olika krävs`);
}

export function genereraKandidater(recept, ut, { upptagna = upptagnaRutnat(ut), undantag = {} } = {}) {
  const mjuka = new Set();
  const ny = [];
  const fel = [];
  const forsok = {};
  for (const rc of recept) {
    try {
      const q = bygg(rc, upptagna, { mjuka });
      forsok[q.id] = q.forsok;
      ny.push(q);
    } catch (e) {
      fel.push(e.message);
    }
  }
  if (!fel.length) fel.push(...strukturFel(ny, undantag));
  if (fel.length) {
    console.error(`✗ kandidater: ${fel.length} problem\n` + fel.map((x) => '  - ' + x).join('\n'));
    process.exitCode = 1;
    return null;
  }
  mkdirSync(path.dirname(ut), { recursive: true });
  writeFileSync(ut, JSON.stringify(ny, null, 2) + '\n');
  return { fragor: ny, forsok };
}

export { mjukNyckel };
