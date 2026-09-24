/**
 * Återupptag av ett pågående personlighetstest: servern har svaren i
 * personality_test_sessions.answers ({ questionId, value }[]), vyn håller dem
 * som en array i påståendenas ordning.
 */

import type { LikertValue, PersonalityAnswer, PersonalityItem } from './types';

/** Serverns svar i påståendenas ordning, null där svar saknas. Okända id ignoreras. */
export function svarIOrdning(
  items: PersonalityItem[],
  sparade: PersonalityAnswer[] | null | undefined
): (LikertValue | null)[] {
  const perId = new Map<string, LikertValue>();
  for (const a of sparade ?? []) {
    if (a && typeof a.questionId === 'string' && Number.isInteger(a.value) && a.value >= 1 && a.value <= 5) {
      perId.set(a.questionId, a.value);
    }
  }
  return items.map((i) => perId.get(i.id) ?? null);
}

/** Första obesvarade påståendet, eller det sista när alla är besvarade. */
export function forstaObesvarade(svar: (LikertValue | null)[]): number {
  const idx = svar.findIndex((a) => a === null);
  return idx === -1 ? Math.max(0, svar.length - 1) : idx;
}

/** Nästa obesvarade efter fran, annars nästa påstående, annars kvar på fran. */
export function nastaIndex(svar: (LikertValue | null)[], fran: number): number {
  const nasta = svar.findIndex((a, i) => i > fran && a === null);
  if (nasta !== -1) return nasta;
  return fran < svar.length - 1 ? fran + 1 : fran;
}
