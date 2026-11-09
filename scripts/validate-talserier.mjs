// scripts/validate-talserier.mjs
// =============================================================================
// Kontrollerar talseriernas banker mot TS1 till TS10
// (scripts/lib/talserie/sparrar.mjs). Körs också av vitest
// (src/lib/talserierV1/__tests__/sparrar.test.ts), så att den går i varje
// testkörning.
//
// Kör: node scripts/validate-talserier.mjs
// Exit 1 vid fel.
// =============================================================================

import { readFileSync } from 'node:fs';
import { sparrFel, nivaFel } from './lib/talserie/sparrar.mjs';

export const TALSERIE_BANKER = ['bankGrund', 'bankAvancerad', 'bankExpert'].map((b) => `src/lib/talserierV1/${b}.json`);

export function valideraTalserier(filer = TALSERIE_BANKER) {
  const fel = [];
  const ids = new Set();
  for (const fil of filer) {
    const bank = JSON.parse(readFileSync(fil, 'utf8'));
    if (bank.length < 60) fel.push(`${fil}: ${bank.length} uppgifter, minst 60`);
    for (const q of bank) {
      if (ids.has(q.id)) fel.push(`${q.id}: id finns två gånger`);
      ids.add(q.id);
      fel.push(...sparrFel(q));
    }
    fel.push(...nivaFel(bank).map((f) => `${fil}: ${f}`));
  }
  return fel;
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` || process.argv[1]?.endsWith('validate-talserier.mjs')) {
  const fel = valideraTalserier();
  for (const f of fel) console.log(f);
  console.log(fel.length ? `${fel.length} fel` : 'Talserierna klarar TS1 till TS10.');
  process.exit(fel.length ? 1 : 0);
}
