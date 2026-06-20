// src/lib/prov/allowance.ts
// =============================================================================
// Rate-limit för prov: gratisanvändare får 1 slutfört prov per testtyp och
// rullande 7-dygnsperiod. Premium är obegränsat. Ingen separat tabell behövs —
// vi räknar slutförda prov-sessioner i logic_test_v4_sessions direkt, vilket är
// självrensande (rullande fönster) och konsekvent med var sessionerna lagras.
// =============================================================================

import type { SupabaseClient } from '@supabase/supabase-js';

export const PROV_TEST_TYPES = {
  logik: 'matrislogik-prov',
  verbal: 'verbal-resonemang-prov',
  numerisk: 'numerical-reasoning-prov',
} as const;

export type ProvTestType = (typeof PROV_TEST_TYPES)[keyof typeof PROV_TEST_TYPES];

/** Antal tillåtna prov per testtyp och 7-dygnsfönster för gratisanvändare. */
export const FREE_PROV_PER_WEEK = 1;
const WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export interface AllowanceResult {
  allowed: boolean;
  isPremium: boolean;
  /** Antal slutförda prov i fönstret (för gratisanvändare). */
  usedInWindow: number;
  /** När nästa prov blir tillgängligt (ISO) om spärrat, annars null. */
  nextAvailableAt: string | null;
}

/**
 * Avgör om användaren får starta ett nytt prov av angiven typ just nu.
 * Premium: alltid. Gratis: max FREE_PROV_PER_WEEK slutförda prov per rullande vecka.
 */
export async function checkProvAllowance(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
  userId: string,
  testType: ProvTestType
): Promise<AllowanceResult> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single();

  const isPremium = profile?.subscription_tier === 'premium';
  if (isPremium) {
    return { allowed: true, isPremium: true, usedInWindow: 0, nextAvailableAt: null };
  }

  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { data: recent } = await supabase
    .from('logic_test_v4_sessions')
    .select('completed_at')
    .eq('user_id', userId)
    .eq('test_type', testType)
    .not('completed_at', 'is', null)
    .gte('completed_at', since)
    .order('completed_at', { ascending: true });

  const completed = Array.isArray(recent) ? recent : [];
  const usedInWindow = completed.length;
  const allowed = usedInWindow < FREE_PROV_PER_WEEK;

  // Nästa tillgängliga = äldsta slutförda i fönstret + 7 dygn.
  let nextAvailableAt: string | null = null;
  if (!allowed && completed[0]?.completed_at) {
    nextAvailableAt = new Date(
      new Date(completed[0].completed_at).getTime() + WINDOW_MS
    ).toISOString();
  }

  return { allowed, isPremium: false, usedInWindow, nextAvailableAt };
}
