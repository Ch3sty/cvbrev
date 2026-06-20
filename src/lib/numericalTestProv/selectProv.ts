// src/lib/numericalTestProv/selectProv.ts
// PROV-urval för numerisk: drar lika många passager från v1- och v2-poolen och
// blandar dem. Seedat på sessionId. Passage- och fråge-id är unika tvärs v1/v2,
// så facit slås upp i en merged bank.

import bankV1 from '@/lib/numericalTest/questionBank.json';
import bankV2 from '@/lib/numericalTestV2/questionBank.json';
import bankExpert from '@/lib/numericalTestExpert/questionBank.json';
import type { Passage } from '@/lib/numericalTest/types';

export const POOL_V1 = bankV1 as unknown as Passage[];
export const POOL_V2 = bankV2 as unknown as Passage[];
export const POOL_EXPERT = bankExpert as unknown as Passage[];
export const PROV_MERGED_BANK: Passage[] = [...POOL_V1, ...POOL_V2, ...POOL_EXPERT];

// Provet mixar alla tre nivåer: 3 grund + 3 avancerad + 3 expert = 9 passager (36 frågor).
export const PROV_PER_LEVEL = 3;
export const QUESTIONS_PER_PASSAGE = 4;
export const PROV_PASSAGES = PROV_PER_LEVEL * 3;
export const PROV_TOTAL_QUESTIONS = PROV_PASSAGES * QUESTIONS_PER_PASSAGE;

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

export function selectProvPassagesForSession(sessionId: string): Passage[] {
  const pickRng = mulberry32(hashString(sessionId));
  const pick = (pool: Passage[]) =>
    shuffle(pool, pickRng).slice(0, Math.min(PROV_PER_LEVEL, pool.length));

  const selected = [...pick(POOL_V1), ...pick(POOL_V2), ...pick(POOL_EXPERT)];
  const orderRng = mulberry32(hashString(sessionId + ':order'));
  return shuffle(selected, orderRng);
}
