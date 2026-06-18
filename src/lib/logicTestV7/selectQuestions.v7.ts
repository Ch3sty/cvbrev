// src/lib/logicTestV7/selectQuestions.v7.ts
// =============================================================================
// Deterministiskt urval av N frågor ur grundpoolen, seedat på sessionId.
// Samma sessionId → samma frågor (stabilt under hela sessionen och identiskt
// mellan test-sidan, resultat-sidan och svar-API:t). Olika sessionId → olika
// uppsättning, så att "gör om testet" ger nya frågor.
// =============================================================================

import grundBank from './questionBankGrund.v7.json';
import expertBank from './questionBankExpert.v7.json';
import type { LayeredQuestion } from './layered.v7';

export const GRUND_POOL = grundBank as unknown as LayeredQuestion[];
export const EXPERT_POOL = expertBank as unknown as LayeredQuestion[];
export const QUESTIONS_PER_SESSION = 15;

// Enkel deterministisk hash (FNV-1a) av en sträng → 32-bitars heltal.
function hashString(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// Mulberry32 — liten deterministisk PRNG från ett frö.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

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

// Expert-testet: N frågor ur expertpoolen.
export function selectExpertQuestionsForSession(
  sessionId: string,
  count: number = QUESTIONS_PER_SESSION
): LayeredQuestion[] {
  return selectFromPool(EXPERT_POOL, sessionId, count);
}
