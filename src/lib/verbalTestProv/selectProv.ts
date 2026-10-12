// src/lib/verbalTestProv/selectProv.ts
// =============================================================================
// PROV-urval för verbal: drar lika många passager från v1- och v2-poolen och
// blandar dem. Seedat på sessionId (samma mönster som träningsurvalet). Passage-id
// är unika tvärs v1/v2, så facit kan slås upp i en merged bank.
// =============================================================================

import bankV1 from '@/lib/verbalTestV1/questionBank.json';
import bankV2 from '@/lib/verbalTestV2/questionBank.json';
import { POOL_V3 as GRUND_V3, POOL_V4 as GRUND_V4 } from '@/lib/verbalTestV1/selectPassages.v1';
import { POOL_V3 as AVANCERAD_V3, POOL_V4 as AVANCERAD_V4 } from '@/lib/verbalTestV2/selectPassages.v2';
import type { UnderlagVersion } from '@/lib/tester/underlagVersion';
import type { Question } from '@/lib/verbalTestV1/types.v1';

/** De frysta bankerna: provets pool i version 1 och 2 (sessioner utan meta.underlag_version). */
export const POOL_V1 = bankV1 as Question[];
export const POOL_V2 = bankV2 as Question[];

/**
 * Provets pool per nivå och underlagsversion (src/lib/tester/underlagVersion.ts).
 * Provet läste bara de frysta bankerna i version 1 och 2; version 3 drar ur
 * bankerna plus parti 02 och parti 03.
 */
export function poolFor(niva: 'grund' | 'avancerad', version: UnderlagVersion = 1): Question[] {
  if (version === 4) return niva === 'grund' ? GRUND_V4 : (AVANCERAD_V4 as unknown as Question[]);
  if (version === 3) return niva === 'grund' ? GRUND_V3 : (AVANCERAD_V3 as unknown as Question[]);
  return niva === 'grund' ? POOL_V1 : POOL_V2;
}

/** Alla texter i alla versioner, för uppslag av facit och förklaring per passage-id. */
export const PROV_MERGED_BANK: Question[] = [...GRUND_V4, ...(AVANCERAD_V4 as unknown as Question[])];

export const PROV_PER_LEVEL = 6;
export const STATEMENTS_PER_PASSAGE = 4;
export const PROV_PASSAGES = PROV_PER_LEVEL * 2;
export const PROV_TOTAL_STATEMENTS = PROV_PASSAGES * STATEMENTS_PER_PASSAGE;

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

export function selectProvPassagesForSession(sessionId: string, version: UnderlagVersion = 1): Question[] {
  const pickRng = mulberry32(hashString(sessionId));
  const pick = (pool: Question[]) =>
    shuffle(pool, pickRng).slice(0, Math.min(PROV_PER_LEVEL, pool.length));

  const selected = [...pick(poolFor('grund', version)), ...pick(poolFor('avancerad', version))];
  const orderRng = mulberry32(hashString(sessionId + ':order'));
  return shuffle(selected, orderRng);
}
