/**
 * Serverhämtningen bakom en resultatsida, samma mönster som getHubData.ts.
 *
 * Förut gjorde resultatsidan fyra oberoende klientkedjor efter hydrering:
 *
 *   1. TestResultsPage: sessionsraden, antingen direkt mot Supabase eller via
 *      <api>/session, som gjorde auth.getUser() före sin fråga.
 *   2. PercentileCard: fetch mot /api/logicTestV4/percentile, som gjorde
 *      auth.getUser(), sedan ägarkontrollen, sedan två count-frågor.
 *   3. TestResultBridgeContainer: auth.getUser() över nätet, sedan tre
 *      parallella frågor (cv_texts, profiles, <api>/session).
 *   4. Den sista av dem fetchade session-routen en gång till, med ännu ett
 *      auth.getUser().
 *
 * Ingenting av det gick att börja förrän JS laddat och hydrerat, och varje
 * auth.getUser() var en egen rundtur innan den egentliga frågan fick ställas.
 * Mätningen landade på 11 rundturer och 1688 ms.
 *
 * Nu hämtas allt här, i EN parallell omgång, i samma svar som HTML. Sessionen
 * läses med getSession() (cookien lokalt, ingen rundtur till auth) och raderna
 * skyddas av RLS plus explicit user_id-filter, precis som routernas
 * ägarkontroller gjorde.
 *
 * VIKTIGT: ingen rättning och ingen percentillogik ändras. Poängen läses som
 * den står i raden, skriven av complete-routen. Percentilen räknas med exakt
 * samma två count-frågor och samma avrundning som
 * /api/logicTestV4/percentile, mot samma test_type. Frågegenomgången väljer
 * fortfarande sina frågor med samma seed på sessionId som testvyn använde.
 */
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import type { TestConfig } from '../testConfig'

/**
 * Matrislogik och proven lagras i logic_test_v4_sessions och kan läsas direkt.
 * Samma avgränsning som READS_SUPABASE gjorde i TestResultsPage.
 */
const TABLE_BY_API: Record<string, string> = {
  '/api/logicTestV4': 'logic_test_v4_sessions',
  '/api/logicTestV6': 'logic_test_v4_sessions',
  '/api/logicTestProv': 'logic_test_v4_sessions',
}

/** Samma tröskel som PercentileCard använde. Under den visas ingen siffra. */
const MIN_SAMPLE_SIZE = 25

export interface ResultsSession {
  id: string
  score: number | null
  timeSpent: number | null
  completedAt: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  answers: any[]
}

export interface PercentileData {
  percentile: number
  sampleSize: number
}

export interface BridgeData {
  hasCv: boolean
  isPremium: boolean
  sessionsToday?: number
  userId?: string
  trialEndsAt?: string | null
}

export interface ResultsData {
  /** null betyder "kunde inte läsas på servern", klienten hämtar då som förut. */
  session: ResultsSession | null
  /** true när servern läst klart, så klienten slipper hämta om. */
  resolved: boolean
  /** null när underlaget är för litet eller percentilen inte gäller. */
  percentile: PercentileData | null
  /** null när bryggans underlag inte kunde läsas. Bryggan visas då inte. */
  bridge: BridgeData | null
}

const UNRESOLVED: ResultsData = {
  session: null,
  resolved: false,
  percentile: null,
  bridge: null,
}

/**
 * Räknar percentilen exakt som GET /api/logicTestV4/percentile.
 *
 * Admin-klienten används av samma skäl som i routen: RLS hindrar en användare
 * från att se andras rader, och bara aggregat (två antal) lämnar servern.
 */
async function readPercentile(
  score: number,
  testType: string
): Promise<PercentileData | null> {
  try {
    const admin = getSupabaseAdmin()

    const [{ count: total }, { count: below }] = await Promise.all([
      admin
        .from('logic_test_v4_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('test_type', testType)
        .not('completed_at', 'is', null)
        .not('score', 'is', null),
      admin
        .from('logic_test_v4_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('test_type', testType)
        .not('completed_at', 'is', null)
        .lt('score', score),
    ])

    if (!total || total < MIN_SAMPLE_SIZE) return null

    return {
      percentile: Math.round((100 * (below ?? 0)) / total),
      sampleSize: total,
    }
  } catch (error) {
    // Percentilen är ett tillägg. Fel här får aldrig störa resultatet.
    console.error('Resultatsidan: kunde inte räkna percentilen', error)
    return null
  }
}

/**
 * Allt resultatsidan behöver, i en parallell omgång.
 *
 * Ingen kvot räknas och ingen premiumgate fattas här. `isPremium` läses bara
 * för att bryggan ska välja rätt variant, precis som den gjorde på klienten.
 */
export async function getResultsData(
  config: TestConfig,
  sessionId: string
): Promise<ResultsData> {
  const table = TABLE_BY_API[config.api]
  if (!table) return UNRESOLVED

  try {
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })

    // Cookien läses lokalt. Ingen rundtur till auth-servern.
    const {
      data: { session: authSession },
    } = await supabase.auth.getSession()

    const userId = authSession?.user?.id
    if (!userId) return UNRESOLVED

    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    // Sessionsraden, CV-antalet, profilen och dagens sessioner i en omgång.
    // Bryggans fjärde anrop (<api>/session) blir samma fråga som "dagens
    // sessioner" nedan, så det försvinner helt.
    const [sessionRes, cvRes, profileRes, todayRes] = await Promise.all([
      supabase
        .from(table)
        .select('id, score, time_spent, completed_at, answers, test_type')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('cv_texts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('profiles')
        .select('subscription_tier, premium_until, premium_source')
        .eq('id', userId)
        .maybeSingle(),
      supabase
        .from(table)
        .select('completed_at')
        .eq('user_id', userId)
        .gte('completed_at', startOfDay.toISOString()),
    ])

    if (sessionRes.error || !sessionRes.data) return UNRESOLVED

    const row = sessionRes.data as {
      id: string
      score: number | null
      time_spent: number | null
      completed_at: string | null
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      answers: any
      test_type: string | null
    }

    const session: ResultsSession = {
      id: row.id,
      score: row.score,
      timeSpent: row.time_spent,
      completedAt: row.completed_at,
      answers: Array.isArray(row.answers) ? row.answers : [],
    }

    // Samma premiumvalidering som TestResultBridgeContainer gjorde.
    const profile = profileRes.data as {
      subscription_tier?: string | null
      premium_until?: string | null
      premium_source?: string | null
    } | null

    const isPremium = !!(
      profile?.subscription_tier === 'premium' ||
      (profile?.premium_until && new Date(profile.premium_until) > new Date())
    )

    const isTrial =
      profile?.premium_source === 'signup_trial' ||
      profile?.premium_source === 'oauth_signup_trial'

    const bridge: BridgeData = {
      hasCv: (cvRes.count ?? 0) > 0,
      isPremium,
      sessionsToday: (todayRes.data ?? []).length,
      userId,
      trialEndsAt: isTrial ? profile?.premium_until ?? null : null,
    }

    // Percentilen gäller bara slutförda test med poäng, och aldrig prov.
    const showPercentile =
      config.level !== 'prov' && row.completed_at !== null && row.score !== null

    const percentile = showPercentile
      ? await readPercentile(row.score as number, row.test_type ?? 'matrislogik')
      : null

    return { session, resolved: true, percentile, bridge }
  } catch (error) {
    console.error('Resultatsidan: kunde inte hämta resultatet på servern', error)
    return UNRESOLVED
  }
}
