// src/lib/logicTestV7/selectProv.v7.ts
// =============================================================================
// PROV-urval för logik: drar lika många frågor från grund-, avancerad- och
// expertpoolen och blandar dem till ett prov. Seedat på sessionId precis som
// träningsurvalet, så samma session ger samma prov (stabilt mellan test- och
// resultatsida) och omspel ger nytt prov. Frågornas id är unika tvärs poolerna,
// så svar-API:t kan slå upp facit oavsett vilken nivå frågan kom från.
// =============================================================================

import { GRUND_POOL, AVANCERAD_POOL, EXPERT_POOL } from './selectQuestions.v7';
import type { LayeredQuestion } from './layered.v7';

/** Antal frågor per nivå i provet (6 × 3 nivåer = 18). */
export const PROV_PER_LEVEL = 6;
export const PROV_TOTAL_QUESTIONS = PROV_PER_LEVEL * 3;

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
