// scripts/lib/matris/kor-generator.mjs
// =============================================================================
// Kör recepten för en nivå och skriver nivåns 3c-bank.
//
// - Ursprungsbankerna (28 per nivå) rörs aldrig: sessioner härleder sitt urval
//   ur dem. Nya frågor ligger i egna filer (questionBank*3c.v7.json).
// - Id-lås: finns filen redan måste varje incheckat id få exakt samma
//   innehåll, annars avbryts körningen. Nya recept läggs till sist.
// - Inget rutnät får förekomma två gånger i någon bank.
// =============================================================================

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { bygg, key } from './generera.mjs';
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
      const q = bygg(rc, upptagna);
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
