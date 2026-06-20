// src/lib/numericalTest/selectPassages.ts
// Deterministiskt urval av passager ur banken, seedat på sessionId.
// Speglar logicTestV7/selectQuestions.v7.ts. Antalet passager per session hålls
// konstant (6 × 4 frågor = 24) så maxpoäng inte varierar med bankens storlek.

import { getAllPassages } from './validator';
import type { Passage } from './types';

export const PASSAGES_PER_SESSION = 8;
export const QUESTIONS_PER_PASSAGE = 4;
export const TOTAL_QUESTIONS = PASSAGES_PER_SESSION * QUESTIONS_PER_PASSAGE;

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

export function selectPassagesForSession(
  sessionId: string,
  count: number = PASSAGES_PER_SESSION
): Passage[] {
  const shuffled = [...getAllPassages()];
  const rng = mulberry32(hashString(sessionId));
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
