// src/lib/logicTestV7/selectProv.v7.ts
// =============================================================================
// PROV-urval för logik: drar lika många frågor från grund-, avancerad- och
// expertpoolen och blandar dem till ett prov. Seedat på sessionId precis som
// träningsurvalet, så samma session ger samma prov (stabilt mellan test- och
// resultatsida) och omspel ger nytt prov. Frågornas id är unika tvärs poolerna,
// så svar-API:t kan slå upp facit oavsett vilken nivå frågan kom från.
//
// Urvalet returnerar frågorna i bankens form. Alternativens ordning blandas
// i fragor.server.ts (blanda.ts), inte här.
// =============================================================================

import { GRUND_POOL, AVANCERAD_POOL, EXPERT_POOL } from './selectQuestions.v7';
import type { LayeredQuestion } from './layered.v7';
import { hashString, mulberry32 } from './blanda';
import { PROV_PER_LEVEL, PROV_TOTAL_QUESTIONS } from './konstanter';

export { PROV_PER_LEVEL, PROV_TOTAL_QUESTIONS };

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Drar PROV_PER_LEVEL frågor ur varje nivåpool och blandar ihop dem till ett
 * prov. Två oberoende seeds (urval resp. slutordning) härleds ur sessionId.
 */
export function selectProvQuestionsForSession(sessionId: string): LayeredQuestion[] {
  const pickRng = mulberry32(hashString(sessionId));
  const pick = (pool: LayeredQuestion[]) =>
    shuffle(pool, pickRng).slice(0, Math.min(PROV_PER_LEVEL, pool.length));

  const selected = [
    ...pick(GRUND_POOL),
    ...pick(AVANCERAD_POOL),
    ...pick(EXPERT_POOL),
  ];

  // Blanda så nivåerna inte kommer i klump. Egen seed-variant för stabil ordning.
  const orderRng = mulberry32(hashString(sessionId + ':order'));
  return shuffle(selected, orderRng);
}
