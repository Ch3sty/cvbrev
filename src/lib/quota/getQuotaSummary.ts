// src/lib/quota/getQuotaSummary.ts
//
// Dygnskvoterna hämtade en gång, delade mellan två anropare: prenumerations-
// sidan som server component, och GET /api/quota/summary som dashboardens
// kvotrad läser. Sidan kan därmed rendera siffrorna direkt i stället för att
// fetcha vår egen HTTP-route efter hydrering, vilket var en hel extra
// rundtur och dessutom sidans layoutförskjutning när skelettet byttes ut.
//
// Frågorna och limiterna är identiska med routens. Ändras de ena ska de andra
// ändras också.

import type { SupabaseClient } from '@supabase/supabase-js'
import { userHasPremiumAccess } from '@/lib/supabase/premiumAccess'
import {
  DAILY_LIMIT_LETTERS,
  DAILY_LIMIT_CHAT_MESSAGES,
  DAILY_LIMIT_TEST_SESSIONS,
  CV_ANALYSIS_LIMIT,
  CV_ANALYSIS_WINDOW_HOURS,
  startOfTodayStockholm,
  nextMidnightStockholm,
  resolveDailyLetterCounter,
} from '@/lib/quota/quotaService'

/**
 * Samma form som svaret från GET /api/quota/summary. Definierad här i stället
 * för importerad från routen, så en server component slipper dra in en hel
 * route-modul för en typ.
 */
export interface QuotaSummaryItem {
  key: 'letters' | 'analysis' | 'chat' | 'tests'
  label: string
  used: number
  /** null betyder obegränsat. Ordet "obegränsat" får bara stå där det är sant. */
  limit: number | null
}

export interface QuotaSummary {
  isPremium: boolean
  nextResetAt: string
  items: QuotaSummaryItem[]
}

export async function getQuotaSummary(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
  userId: string
): Promise<QuotaSummary> {
  const isPremium = await userHasPremiumAccess(supabase, userId)
  const nextResetAt = nextMidnightStockholm().toISOString()
  const sinceToday = startOfTodayStockholm().toISOString()

  // Premium har inga tak. Vi visar ändå vad som använts, men utan gräns.
  const limitOf = (n: number) => (isPremium ? null : n)

  const [{ data: profile }, chatRes, analysisRes, testRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('weekly_letter_count, weekly_letter_first_used_at')
      .eq('id', userId)
      .maybeSingle(),
    supabase
      .from('ai_messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('role', 'user')
      .gte('created_at', sinceToday),
    supabase
      .from('cv_analysis_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('usage_counted', true)
      .gte('created_at', new Date(Date.now() - CV_ANALYSIS_WINDOW_HOURS * 3600_000).toISOString()),
    supabase
      .from('logic_test_v4_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .gte('completed_at', sinceToday),
  ])

  const { effectiveCount: lettersUsed } = resolveDailyLetterCounter(
    (profile as { weekly_letter_count?: number } | null)?.weekly_letter_count ?? 0,
    (profile as { weekly_letter_first_used_at?: string } | null)?.weekly_letter_first_used_at ?? null
  )

  return {
    isPremium,
    nextResetAt,
    items: [
      { key: 'letters', label: 'Brev', used: lettersUsed, limit: limitOf(DAILY_LIMIT_LETTERS) },
      { key: 'analysis', label: 'Analys', used: analysisRes.count ?? 0, limit: limitOf(CV_ANALYSIS_LIMIT) },
      { key: 'chat', label: 'Chatt', used: chatRes.count ?? 0, limit: limitOf(DAILY_LIMIT_CHAT_MESSAGES) },
      { key: 'tests', label: 'Tester', used: testRes.count ?? 0, limit: limitOf(DAILY_LIMIT_TEST_SESSIONS) },
    ],
  }
}
