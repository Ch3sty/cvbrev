// src/lib/verbalTestV1/selectPassages.v1.ts
// =============================================================================
// Deterministiskt urval av passager ur banken, seedat på sessionId. Samma
// sessionId → samma passager i samma ordning (stabilt mellan test-sidan,
// resultat-sidan och scoring). Olika sessionId → ny uppsättning, så "gör om
// testet" ger andra passager. Speglar logicTestV7/selectQuestions.v7.ts.
// =============================================================================

import questionBank from './questionBank.json';
import type { Question } from './types.v1';

export const POOL = questionBank as Question[];

// Antal passager som dras per session. Hålls konstant så maxpoäng inte
// varierar med bankens storlek (4 påståenden × PASSAGES_PER_SESSION).
export const PASSAGES_PER_SESSION = 15;
export const STATEMENTS_PER_PASSAGE = 4;
export const TOTAL_STATEMENTS = PASSAGES_PER_SESSION * STATEMENTS_PER_PASSAGE;

function hashString(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Drar PASSAGES_PER_SESSION passager ur banken, seedat på sessionId.
 * Faller tillbaka på hela banken om den är mindre än så.
 */
export function selectPassagesForSession(
  sessionId: string,
  count: number = PASSAGES_PER_SESSION
): Question[] {
  const shuffled = [...POOL];
  const rng = mulberry32(hashString(sessionId));
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
