// src/app/api/quota/summary/route.ts
// ===================================
// Alla fyra dygnskvoter i ett svar (punkt 1 och 7 i
// docs/plan-inloggat-saljflode.md).
//
// Dashboardens kvotrad och prenumerationssidans UsageStats läser samma
// siffror härifrån. Räknas de på två ställen glider de isär, och då är
// siffran värre än ingen siffra alls.

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
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

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 })
    }

    const isPremium = await userHasPremiumAccess(supabase, user.id)
    const nextResetAt = nextMidnightStockholm().toISOString()
    const sinceToday = startOfTodayStockholm().toISOString()

    // Premium har inga tak. Vi visar ändå vad som använts, men utan gräns.
    const limitOf = (n: number) => (isPremium ? null : n)

    const [{ data: profile }, chatRes, analysisRes, testRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('weekly_letter_count, weekly_letter_first_used_at')
        .eq('id', user.id)
        .single(),
      supabase
        .from('ai_messages')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('role', 'user')
        .gte('created_at', sinceToday),
      supabase
        .from('cv_analysis_jobs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('usage_counted', true)
        .gte('created_at', new Date(Date.now() - CV_ANALYSIS_WINDOW_HOURS * 3600_000).toISOString()),
      supabase
        .from('logic_test_v4_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)
        .gte('completed_at', sinceToday),
    ])

    const { effectiveCount: lettersUsed } = resolveDailyLetterCounter(
      (profile as { weekly_letter_count?: number } | null)?.weekly_letter_count ?? 0,
      (profile as { weekly_letter_first_used_at?: string } | null)?.weekly_letter_first_used_at ?? null
    )

    const summary: QuotaSummary = {
      isPremium,
      nextResetAt,
      items: [
        { key: 'letters', label: 'Brev', used: lettersUsed, limit: limitOf(DAILY_LIMIT_LETTERS) },
        { key: 'analysis', label: 'Analys', used: analysisRes.count ?? 0, limit: limitOf(CV_ANALYSIS_LIMIT) },
        { key: 'chat', label: 'Chatt', used: chatRes.count ?? 0, limit: limitOf(DAILY_LIMIT_CHAT_MESSAGES) },
        { key: 'tests', label: 'Tester', used: testRes.count ?? 0, limit: limitOf(DAILY_LIMIT_TEST_SESSIONS) },
      ],
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error('[quota/summary] Error:', error)
    return NextResponse.json({ error: 'Kunde inte hämta kvoter' }, { status: 500 })
  }
}
