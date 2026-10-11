// scripts/snapshot-bank-v2.ts
// =============================================================================
// Ögonblicksbilden av urvalet för bank_version 1 och 2 (plan-facit-genvag A2
// punkt i): de första fem fråge-id:na för 20 fasta sessions-id per nivå och
// i provet. Tagen före ändringen till version 3 och incheckad som fixtur i
// src/lib/logicTestV7/__tests__/fixtures/urval-v2.json. Testet
// bankversion3.test.ts jämför dagens urval mot den.
//
// Kör (bara när en ny ögonblicksbild beslutats): npx tsx scripts/snapshot-bank-v2.ts
// =============================================================================

import { writeFileSync, mkdirSync } from 'node:fs';
import {
  selectQuestionsForSession,
  selectAvanceradQuestionsForSession,
  selectExpertQuestionsForSession,
} from '../src/lib/logicTestV7/selectQuestions.v7';
import { selectProvQuestionsForSession } from '../src/lib/logicTestV7/selectProv.v7';

export const SESSIONER = Array.from({ length: 20 }, (_, i) => `00000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`);

const ut: Record<string, Record<string, string[]>> = {};
for (const version of [1, 2] as const) {
  for (const [namn, f] of [
    ['grund', (s: string) => selectQuestionsForSession(s, 15, version)],
    ['avancerad', (s: string) => selectAvanceradQuestionsForSession(s, 15, version)],
    ['expert', (s: string) => selectExpertQuestionsForSession(s, 15, version)],
    ['prov', (s: string) => selectProvQuestionsForSession(s, version)],
  ] as const) {
    const nyckel = `v${version}:${namn}`;
    ut[nyckel] = {};
    for (const s of SESSIONER) ut[nyckel][s] = f(s).slice(0, 5).map((q) => q.id);
  }
}
mkdirSync('src/lib/logicTestV7/__tests__/fixtures', { recursive: true });
writeFileSync('src/lib/logicTestV7/__tests__/fixtures/urval-v2.json', JSON.stringify(ut, null, 2) + '\n');
console.log('skrev src/lib/logicTestV7/__tests__/fixtures/urval-v2.json');
