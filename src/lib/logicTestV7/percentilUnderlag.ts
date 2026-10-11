// src/lib/logicTestV7/percentilUnderlag.ts
// =============================================================================
// Vilka sessioner en percentil för matrislogik får jämföras mot (spec-rummen
// 12.4 och 15). Samma regel som /api/logicTestV4/percentile, på ett ställe
// för Bli upptäckt (getCandidateSummary) och rekryterarvyn (candidateData):
//
// - Bara sessioner med meta.alternativ_blandade jämförs, i täljare och
//   nämnare. En oblandad session får ingen percentil alls.
// - Jämförelsen görs per bankversion (meta.bank_version): version 2 bara mot
//   version 2, version 3 bara mot version 3, sessioner utan fältet bara mot
//   varandra. Percentilen börjar om vid 25 sessioner på varje version.
// - Golvet på 25 sessioner (MIN_PERCENTILE_SAMPLE) ligger hos anroparen.
//
// Verbalt och numeriskt blandas inte och har ingen bankversion; deras
// underlag är oförändrat.
//
// Filen är ren (ingen frågebank, inga nätverksanrop).
// =============================================================================

import { arBlandad } from './blanda';

/** De klassiska matristesten, de enda med blandning och bankversion. */
export const MATRIS_TEST_TYPER = ['matrislogik', 'matrislogik-avancerad', 'matrislogik-expert'] as const;

export function arMatrisTyp(testType: string | null | undefined): boolean {
  return !!testType && (MATRIS_TEST_TYPER as readonly string[]).includes(testType);
}

/** Bankversionen ur meta, som bankVersion i selectQuestions.v7 (utan att dra in bankerna). */
export function underlagsVersion(meta: unknown): 1 | 2 | 3 {
  const v = !!meta && typeof meta === 'object' ? (meta as Record<string, unknown>).bank_version : undefined;
  return v === 3 ? 3 : v === 2 ? 2 : 1;
}

/**
 * Underlaget en session jämförs mot, eller null när den inte får jämföras
 * (oblandad matrissession). `nyckel` skiljer cacheposter åt.
 */
export type Underlag =
  | { matris: false; nyckel: string }
  | { matris: true; version: 1 | 2 | 3; nyckel: string };

export function percentilUnderlag(testType: string, meta: unknown): Underlag | null {
  if (!arMatrisTyp(testType)) return { matris: false, nyckel: testType };
  if (!arBlandad(meta)) return null;
  const version = underlagsVersion(meta);
  return { matris: true, version, nyckel: `${testType}:v${version}` };
}

/** Lägger underlagets filter på en count-fråga mot logic_test_v4_sessions. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function begransaTillUnderlag<Q extends { eq: any; is: any }>(fraga: Q, underlag: Underlag): Q {
  if (!underlag.matris) return fraga;
  const blandad = fraga.eq('meta->>alternativ_blandade', 'true') as Q;
  return underlag.version === 1
    ? (blandad.is('meta->>bank_version', null) as Q)
    : (blandad.eq('meta->>bank_version', String(underlag.version)) as Q);
}
