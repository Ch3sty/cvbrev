// src/lib/quota/quotaService.ts
// =============================================================================
// Gemensam kvottjänst för gratisnivåns dagsrytm (se docs/plan-kvotmodell.md).
//
// Designprincip: räkna befintliga tabeller i stället för att hålla separata
// räknare. Fönstren är självrensande (rullande eller "sedan midnatt svensk
// tid"), så inga reset-jobb behövs och ingen räknare kan hamna i osynk.
//
// Räknarkällor per funktion:
// - Tester/prov:  logic_test_v4_sessions (slutförda sessioner per test_type)
// - Chatt:        ai_messages (användarens egna meddelanden, role='user')
// - CV-analys:    cv_analysis_jobs (usage_counted=true inom 72h-fönstret)
// - Brev:         profiles-kolumnerna weekly_letter_* med dagsfönster
//                 (generering skapar inte alltid en letters-rad, därför räknare)
//
// Premium (inkl. manuell premium_until och admin) passerar alltid.
// =============================================================================

import type { SupabaseClient } from '@supabase/supabase-js';
import { userHasPremiumAccess } from '@/lib/supabase/premiumAccess';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = SupabaseClient<any, any, any>;

export const DAILY_LIMIT_LETTERS = 2;
export const DAILY_LIMIT_CHAT_MESSAGES = 10;
export const DAILY_LIMIT_TEST_SESSIONS = 1; // per test_type (nivå räknas som egen typ)
export const CV_ANALYSIS_WINDOW_HOURS = 72;
export const CV_ANALYSIS_LIMIT = 1;

export interface QuotaResult {
  allowed: boolean;
  isPremium: boolean;
  used: number;
  limit: number;
  /** När kvoten öppnar igen (ISO). För premium: nu. */
  nextResetAt: string;
}

/* ------------------------- Tidsfönster (svensk tid) ------------------------ */

function stockholmOffsetISO(date: Date): string {
  const tzPart = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Stockholm',
    timeZoneName: 'shortOffset',
  })
    .formatToParts(date)
    .find((p) => p.type === 'timeZoneName')?.value; // t.ex. "GMT+2"
  return tzPart === 'GMT+1' ? '+01:00' : '+02:00';
}

/** Midnatt idag i Europe/Stockholm, som Date (UTC-korrekt). */
export function startOfTodayStockholm(now: Date = new Date()): Date {
  const day = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(now); // "2026-07-05"
  return new Date(`${day}T00:00:00${stockholmOffsetISO(now)}`);
}

/** Nästa midnatt i Europe/Stockholm (= när dagskvoter nollställs). */
export function nextMidnightStockholm(now: Date = new Date()): Date {
  // Räkna fram ett klockslag som säkert är "imorgon" i Stockholm och ta den
  // dagens midnatt. Hanterar DST-skiften korrekt nog för kvotsyften.
  const tomorrow = new Date(startOfTodayStockholm(now).getTime() + 26 * 60 * 60 * 1000);
  return startOfTodayStockholm(tomorrow);
}

/* ------------------------------- Kontroller ------------------------------- */

function premiumResult(limit: number): QuotaResult {
  return {
    allowed: true,
    isPremium: true,
    used: 0,
    limit,
    nextResetAt: new Date().toISOString(),
  };
}

/**
 * Dagskvot för test-/provsessioner: max 1 SLUTFÖRD session per test_type och
 * dag. Påbörjade men oavslutade sessioner bränner ingen kvot (samma semantik
 * som gamla prov-spärren). Alla kognitiva tester och prov lagras i
 * logic_test_v4_sessions med distinkta test_type-värden.
 */
export async function checkDailyTestQuota(
  supabase: AnySupabase,
  userId: string,
  testType: string
): Promise<QuotaResult> {
  if (await userHasPremiumAccess(supabase, userId)) {
    return premiumResult(DAILY_LIMIT_TEST_SESSIONS);
  }

  const since = startOfTodayStockholm().toISOString();
  const { count } = await supabase
    .from('logic_test_v4_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('test_type', testType)
    .not('completed_at', 'is', null)
    .gte('completed_at', since);

  const used = count ?? 0;
  return {
    allowed: used < DAILY_LIMIT_TEST_SESSIONS,
    isPremium: false,
    used,
    limit: DAILY_LIMIT_TEST_SESSIONS,
    nextResetAt: nextMidnightStockholm().toISOString(),
  };
}

/** Dagskvot för jobbcoach-chatten: max N användarmeddelanden per dag. */
export async function checkChatQuota(
  supabase: AnySupabase,
  userId: string
): Promise<QuotaResult> {
  if (await userHasPremiumAccess(supabase, userId)) {
    return premiumResult(DAILY_LIMIT_CHAT_MESSAGES);
  }

  const since = startOfTodayStockholm().toISOString();
  const { count } = await supabase
    .from('ai_messages')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('role', 'user')
    .gte('created_at', since);

  const used = count ?? 0;
  return {
    allowed: used < DAILY_LIMIT_CHAT_MESSAGES,
    isPremium: false,
    used,
    limit: DAILY_LIMIT_CHAT_MESSAGES,
    nextResetAt: nextMidnightStockholm().toISOString(),
  };
}

/**
 * CV-analys: 1 per rullande 72 timmar. Räknar jobb som faktiskt räknats som
 * förbrukning (usage_counted=true, sätts vid completion och rullas tillbaka
 * vid failure av jobs-routen — den logiken bevaras orörd).
 */
export async function checkCvAnalysisQuota(
  supabase: AnySupabase,
  userId: string
): Promise<QuotaResult> {
  if (await userHasPremiumAccess(supabase, userId)) {
    return premiumResult(CV_ANALYSIS_LIMIT);
  }

  const windowMs = CV_ANALYSIS_WINDOW_HOURS * 60 * 60 * 1000;
  const since = new Date(Date.now() - windowMs).toISOString();
  const { data } = await supabase
    .from('cv_analysis_jobs')
    .select('created_at')
    .eq('user_id', userId)
    .eq('usage_counted', true)
    .gte('created_at', since)
    .order('created_at', { ascending: true });

  const jobs = Array.isArray(data) ? data : [];
  const used = jobs.length;
  const nextResetAt =
    used > 0 && jobs[0]?.created_at
      ? new Date(new Date(jobs[0].created_at).getTime() + windowMs)
      : new Date();

  return {
    allowed: used < CV_ANALYSIS_LIMIT,
    isPremium: false,
    used,
    limit: CV_ANALYSIS_LIMIT,
    nextResetAt: nextResetAt.toISOString(),
  };
}

/**
 * Brev-räknaren: dagsfönster ovanpå befintliga profiles-kolumner
 * (weekly_letter_count + weekly_letter_first_used_at). Om senaste
 * fönsterstarten ligger före dagens midnatt är räknaren logiskt 0 och
 * anroparen ska nollställa kolumnerna vid nästa förbrukning.
 */
export function resolveDailyLetterCounter(
  count: number | null,
  firstUsedAt: string | Date | null,
  now: Date = new Date()
): { effectiveCount: number; windowIsStale: boolean } {
  const todayStart = startOfTodayStockholm(now);
  const first = firstUsedAt ? new Date(firstUsedAt) : null;
  if (!first || first.getTime() < todayStart.getTime()) {
    return { effectiveCount: 0, windowIsStale: true };
  }
  return { effectiveCount: count ?? 0, windowIsStale: false };
}

/* ------------------------- Standardiserat 429-svar ------------------------- */

/**
 * Enhetlig payload när en kvot är slut, så alla spärrvyer kan visa exakt
 * återkomsttid och "påminn mig"-knapp (POST /api/quota/remind).
 */
export function quotaExceededBody(
  feature: string,
  result: QuotaResult,
  message: string
) {
  return {
    error: 'quota_exceeded',
    code: 'quota_exceeded',
    feature,
    used: result.used,
    limit: result.limit,
    nextResetAt: result.nextResetAt,
    // Bakåtkompatibelt fältnamn som befintliga klienter redan läser:
    nextResetDate: result.nextResetAt,
    limitReached: true,
    message,
  };
}
