// src/lib/quota/getQuotaSummary.ts
//
// Kvoterna hämtade en gång, delade mellan två anropare: prenumerations-
// sidan som server component, och GET /api/quota/summary som dashboardens
// kvotrad läser. Sidan kan därmed rendera siffrorna direkt i stället för att
// fetcha vår egen HTTP-route efter hydrering, vilket var en hel extra
// rundtur och dessutom sidans layoutförskjutning när skelettet byttes ut.
//
// Efter paketomgången summeras raderna per scope, inte per flagga
// (docs/plan-paket-och-onboarding.md avsnitt 5). En Testveckan-kund har inte
// obegränsade brev, och en CV-veckan-kund har inte obegränsad chatt, så
// varje rad frågar efter sin egen feature.
//
// Frågorna och limiterna är identiska med routens. Ändras de ena ska de
// andra ändras också.

import type { SupabaseClient } from '@supabase/supabase-js'
import { getUserScope } from '@/lib/supabase/premiumAccess'
import { scopeHasFeature, type Feature, type Scope } from '@/lib/access/features'
import {
  DAILY_LIMIT_LETTERS,
  FREE_CHAT_MESSAGES_PER_ACCOUNT,
  DAILY_LIMIT_TEST_SESSIONS,
  CV_ANALYSIS_LIMIT,
  startOfTodayStockholm,
  nextMidnightStockholm,
  nextLetterResetAt,
  resolveWeeklyLetterCounter,
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
  /** Featuren som öppnar raden. Driver vilket paket betalväggen föreslår. */
  feature: Feature
  /** Sann när kvoten inte återkommer av sig själv, alltså analys och chatt. */
  perAccount?: boolean
}

export interface QuotaSummary {
  /** Sann så snart något paket är aktivt. Behålls för befintliga vyer. */
  isPremium: boolean
  /** Paketet som gäller just nu, eller null för gratisnivån. */
  scope: Scope | null
  nextResetAt: string
  items: QuotaSummaryItem[]
}

export async function getQuotaSummary(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
  userId: string
): Promise<QuotaSummary> {
  const scope = await getUserScope(supabase, userId)
  const nextResetAt = nextMidnightStockholm().toISOString()
  const sinceToday = startOfTodayStockholm().toISOString()

  /** Raden är utan tak bara om scopet faktiskt ger just den funktionen. */
  const limitOf = (feature: Feature, n: number) =>
    scopeHasFeature(scope, feature) ? null : n

  const [{ data: profile }, chatRes, analysisRes, testRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('weekly_letter_count, weekly_letter_first_used_at')
      .eq('id', userId)
      .maybeSingle(),
    // Chatt och analys räknas över hela kontots historik, inte per dygn.
    supabase
      .from('ai_messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('role', 'user'),
    supabase
      .from('cv_analysis_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('usage_counted', true),
    supabase
      .from('logic_test_v4_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .gte('completed_at', sinceToday),
  ])

  const profilRad = profile as {
    weekly_letter_count?: number
    weekly_letter_first_used_at?: string
  } | null

  const { effectiveCount: lettersUsed } = resolveWeeklyLetterCounter(
    profilRad?.weekly_letter_count ?? 0,
    profilRad?.weekly_letter_first_used_at ?? null
  )

  return {
    isPremium: scope !== null,
    scope,
    nextResetAt,
    items: [
      {
        key: 'letters',
        label: 'Brev',
        used: lettersUsed,
        limit: limitOf('letter_download', DAILY_LIMIT_LETTERS),
        feature: 'letter_download',
      },
      {
        key: 'analysis',
        label: 'Analys',
        used: analysisRes.count ?? 0,
        limit: limitOf('cv_analysis_full', CV_ANALYSIS_LIMIT),
        feature: 'cv_analysis_full',
        perAccount: !scopeHasFeature(scope, 'cv_analysis_full'),
      },
      {
        key: 'chat',
        label: 'Chatt',
        used: chatRes.count ?? 0,
        limit: limitOf('chat_unlimited', FREE_CHAT_MESSAGES_PER_ACCOUNT),
        feature: 'chat_unlimited',
        perAccount: !scopeHasFeature(scope, 'chat_unlimited'),
      },
      {
        key: 'tests',
        label: 'Tester',
        used: testRes.count ?? 0,
        limit: limitOf('tests_above_base', DAILY_LIMIT_TEST_SESSIONS),
        feature: 'tests_above_base',
      },
    ],
  }
}

/** När brevraden öppnar igen. Exporteras så kvotraden slipper räkna själv. */
export { nextLetterResetAt }
