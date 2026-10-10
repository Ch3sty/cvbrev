// src/lib/logicTestV7/selectQuestions.v7.ts
// =============================================================================
// Deterministiskt urval av N frågor ur grundpoolen, seedat på sessionId.
// Samma sessionId → samma frågor (stabilt under hela sessionen och identiskt
// mellan test-sidan, resultat-sidan och svar-API:t). Olika sessionId → olika
// uppsättning, så att "gör om testet" ger nya frågor.
//
// Urvalet returnerar frågorna i bankens form, med facit. Det får bara köras
// på servern: klienten får frågorna via fragor.server.ts, med blandade
// alternativ och utan correctAnswer.
// =============================================================================

import grundBank from './questionBankGrund.v7.json';
import avanceradBank from './questionBank.v7.json';
import expertBank from './questionBankExpert.v7.json';
import type { LayeredQuestion } from './layered.v7';
import { hashString, mulberry32 } from './blanda';
import { QUESTIONS_PER_SESSION } from './konstanter';

export const GRUND_POOL = grundBank as unknown as LayeredQuestion[];
export const AVANCERAD_POOL = avanceradBank as unknown as LayeredQuestion[];
export const EXPERT_POOL = expertBank as unknown as LayeredQuestion[];
export { QUESTIONS_PER_SESSION };

// Deterministiskt urval ur en given pool, seedat på sessionId.
function selectFromPool(
  pool: LayeredQuestion[],
  sessionId: string,
  count: number
): LayeredQuestion[] {
  const shuffled = [...pool];
  const rng = mulberry32(hashString(sessionId));
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Grund-testet: N frågor ur grundpoolen.
export function selectQuestionsForSession(
  sessionId: string,
  count: number = QUESTIONS_PER_SESSION
): LayeredQuestion[] {
  return selectFromPool(GRUND_POOL, sessionId, count);
}

// Avancerad-testet: N frågor ur avancerad-poolen.
export function selectAvanceradQuestionsForSession(
  sessionId: string,
  count: number = QUESTIONS_PER_SESSION
): LayeredQuestion[] {
  return selectFromPool(AVANCERAD_POOL, sessionId, count);
}

// Expert-testet: N frågor ur expertpoolen.
export function selectExpertQuestionsForSession(
  sessionId: string,
  count: number = QUESTIONS_PER_SESSION
): LayeredQuestion[] {
  return selectFromPool(EXPERT_POOL, sessionId, count);
}
