// src/lib/prov/allowance.ts
// =============================================================================
// Rate-limit för prov: gratisanvändare får 1 slutfört prov per testtyp och dag,
// samma dagsrytm som övriga tester (se docs/plan-kvotmodell.md). Premium är
// obegränsat. Räkningen delegeras till checkDailyTestQuota, som räknar
// slutförda sessioner i logic_test_v4_sessions sedan midnatt svensk tid —
// prov-typerna bor i samma tabell som testerna.
//
// AllowanceResult-formen behålls så prov-routes och UI som läser
// usedInWindow/nextAvailableAt fortsätter fungera oförändrat.
// =============================================================================

import type { SupabaseClient } from '@supabase/supabase-js';
import { checkDailyTestQuota } from '@/lib/quota/quotaService';

export const PROV_TEST_TYPES = {
  logik: 'matrislogik-prov',
  verbal: 'verbal-resonemang-prov',
  numerisk: 'numerical-reasoning-prov',
} as const;

export type ProvTestType = (typeof PROV_TEST_TYPES)[keyof typeof PROV_TEST_TYPES];

/** Antal tillåtna prov per testtyp och dag för gratisanvändare. */
export const FREE_PROV_PER_DAY = 1;

export interface AllowanceResult {
  allowed: boolean;
  isPremium: boolean;
  /** Antal slutförda prov i dagens fönster (för gratisanvändare). */
  usedInWindow: number;
  /** När nästa prov blir tillgängligt (ISO) om spärrat, annars null. */
  nextAvailableAt: string | null;
}

/**
 * Avgör om användaren får starta ett nytt prov av angiven typ just nu.
 * Premium: alltid. Gratis: max FREE_PROV_PER_DAY slutförda prov per dag,
 * med nollställning vid midnatt svensk tid.
 */
export async function checkProvAllowance(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
  userId: string,
  testType: ProvTestType
): Promise<AllowanceResult> {
  const quota = await checkDailyTestQuota(supabase, userId, testType);
  return {
    allowed: quota.allowed,
    isPremium: quota.isPremium,
    usedInWindow: quota.used,
    nextAvailableAt: quota.allowed ? null : quota.nextResetAt,
  };
}
