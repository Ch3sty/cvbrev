/**
 * Delad summary-logik för det inloggade läget.
 *
 * Exakt samma aggregering som tidigare låg inne i GET /api/dashboard/summary.
 * Den ligger här för att dashboard-layouten ska kunna köra den direkt på
 * servern, utan omvägen via en egen HTTP-route (det hade blivit en extra
 * rundtur per sidladdning). Routen importerar samma funktion, så det finns
 * fortfarande bara en beskrivning av sanningen.
 *
 * Räkningen av ansökningar är avsiktligt identisk med useApplicationsSummary.ts.
 * statusIsClosed, statusHasResponse och NO_RESPONSE_NUDGE_DAYS importeras från
 * samma delade modul som hooken använder. INTERVIEW_STATUSES,
 * startOfWeekStockholm och daysSince är lokala i hook-filen och speglas här
 * rad för rad:
 *   - INTERVIEW_STATUSES     speglar useApplicationsSummary.ts rad 76
 *   - startOfWeekStockholm   speglar useApplicationsSummary.ts rad 78 till 86
 *   - daysSince              speglar useApplicationsSummary.ts rad 88 till 94
 *   - själva loopen          speglar useApplicationsSummary.ts rad 111 till 166
 * Ändras logiken i hooken ska den ändras här också.
 */
import {
  statusIsClosed,
  statusHasResponse,
  NO_RESPONSE_NUDGE_DAYS,
  type JobApplication,
} from '@/lib/applications/status'
import type { Scope } from '@/lib/access/features'
import { scopeHasFeature } from '@/lib/access/features'
import type { PlanKey } from '@/lib/plans/plans'
import { harPaket } from '@/lib/plans/harPaket'
import {
  DAILY_LIMIT_LETTERS,
  FREE_CHAT_MESSAGES_PER_ACCOUNT,
  resolveWeeklyLetterCounter,
} from '@/lib/quota/quotaService'
import type { BrickaFakta, BrickaKey } from '@/lib/onboarding/komigang'
import { harledProvade, sparadeNycklar } from '@/lib/onboarding/komigang-server'
import { getTestConfig } from '@/app/dashboard/tester/testConfig'

export interface DashboardSummaryPipelineItem {
  id: string
  jobTitle: string
  company: string
  status: JobApplication['current_status']
  /** Dagar sedan senaste händelse. */
  days: number
  /** true när ansökan är tyst över gränsen och bör följas upp. */
  needsFollowUp: boolean
}

export interface DashboardSummaryData {
  profile: Record<string, unknown> | null
  letters: {
    total: number
    monthly: number
    recent: Array<{
      id: string
      title: string | null
      company: string | null
      job_title: string | null
      created_at: string
    }>
  }
  cv: { count: number; activeName: string | null }
  applications: {
    waitingCount: number
    interviewCount: number
    followUpCount: number
    prevMonthCount: number
    weekCount: number
    replyCount: number
    pipeline: DashboardSummaryPipelineItem[]
  }
  onboarding: {
    completedSteps: string[]
    rewardClaimed: boolean
    createdAt: string | null
  }
  /**
   * Paketet och dess gränser, för menyhuvudet och underraderna
   * (docs/design/spec-onboarding-2026-09-22.html, sektion 3 och 5).
   *
   * Ligger här och inte i ett eget klientanrop: menyn och hjälpredan
   * renderas i skalet på varje sida, och en rad som hämtar sig själv efter
   * mount ger CLS och bryter LCP-budgeten på hemskärmen (under 1,0 s).
   * Talen kommer ur samma källor som kvottjänsten, aldrig hårdkodade.
   */
  paket: {
    /** Betalt spår. Null = gratisnivån. */
    scope: Scope | null
    /** Spåret användaren valde i onboardingen. */
    track: Scope | null
    /** Paketnyckeln, härledd ur scope och sluttid. Null på gratisnivån. */
    planKey: PlanKey | null
    /** Nästa dragning (ISO), eller dygnets slut för Allt-dagen. */
    fornyasAt: string | null
    /** Allt-dagen: behörigheten kommer bara ur ett engångsköp. */
    dayPassOnly: boolean
    /** Jobbcoachen: använda och tak på gratisnivån, null-tak = utan tak. */
    chatUsed: number
    chatLimit: number | null
    /** Brev: använda i fönstret och tak, null-tak = utan tak. */
    lettersUsed: number
    lettersLimit: number | null
  }
  /**
   * Hjälpredan "Kom igång" (sektion 2). Provade brickor räknas ur både
   * profiles.onboarding_steps och tabellerna, så den som redan hade ett CV
   * eller en testsession innan hjälpredan fanns inte börjar på noll.
   */
  komIgang: {
    provade: BrickaKey[]
    fakta: BrickaFakta
  }
}

/** Speglar INTERVIEW_STATUSES i useApplicationsSummary.ts. */
const INTERVIEW_STATUSES = ['interview_invited', 'interview_completed', 'trial_work_completed']

/** Måndag 00:00 i innevarande vecka, svensk tid. */
function startOfWeekStockholm(now: Date): Date {
  const sv = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(now)
  const midnight = new Date(`${sv}T00:00:00`)
  // getDay: 0 = söndag. Vi vill ha måndag som första dag.
  const weekday = (midnight.getDay() + 6) % 7
  midnight.setDate(midnight.getDate() - weekday)
  return midnight
}

/** Hur många dygn sedan senaste händelse. */
function daysSince(iso: string | null, now: Date): number {
  if (!iso) return 0
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return 0
  return Math.max(0, Math.floor((now.getTime() - t) / 86400000))
}

/**
 * Hämtar och aggregerar allt hemskärmen behöver i en omgång parallella queries.
 * Anropas både av API-routen och av dashboard-layouten.
 *
 * supabase: en klient skapad med createServerClient, redan bunden till
 * användarens cookies. Anroparen ansvarar för autentiseringen och skickar in
 * userId, den här funktionen gör ingen egen auth-kontroll.
 */
export async function getDashboardSummary(
  supabase: any,
  userId: string
): Promise<DashboardSummaryData> {
  // Fyra parallella queries. Ingen count-fråga: vi hämtar ändå raderna för
  // brev och CV, så vi räknar på radernas längd i stället.
  const [
    lettersRes,
    cvRes,
    profileRes,
    applicationsRes,
    analysisRes,
    linkedinRes,
    downloadRes,
    matchRes,
    grantsRes,
    candidateRes,
    convRes,
    chatRes,
    testRes,
    personalityRes,
    senasteAnalysRes,
  ] = await Promise.all([
    supabase
      .from('letters')
      .select('id, title, company, job_title, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('cv_texts')
      .select('file_name, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false, nullsFirst: false }),
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(),
    supabase
      .from('job_applications')
      .select('*')
      .eq('user_id', userId)
      .order('applied_at', { ascending: false })
      .order('created_at', { ascending: false }),
    // Onboarding-stegen validerades tidigare av OnboardingContext med sex
    // egna count-frågor på klienten, efter sitt eget auth.getUser() och en
    // egen profilhämtning. Tre av de sex räkningarna finns redan ovan
    // (cv_texts, letters, profiles), så bara dessa fyra tillkommer, och de
    // körs i samma parallella omgång.
    supabase
      .from('cv_analysis_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed'),
    supabase
      .from('linkedin_optimizations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('formatted_cv_downloads')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('job_matchings_cache')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    // Veckopanelen behöver det betalda scopet, och det får inte kosta en
    // egen rundtur efter mount (flöde 3:s LCP-krav). Engångsköpen bär sitt
    // scope i premium_grants, så raden läses i samma omgång som resten.
    supabase
      .from('premium_grants')
      .select('scope, premium_until_after')
      .eq('user_id', userId)
      .gt('premium_until_after', new Date().toISOString()),
    // Hjälpredan "Kom igång" och menyns underrader. Sex frågor till i samma
    // parallella omgång, ingen efter mount (sektion 2 och 5).
    supabase.from('candidate_profiles').select('visibility').eq('user_id', userId).maybeSingle(),
    supabase.from('ai_conversations').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase
      .from('ai_messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('role', 'user'),
    supabase
      .from('logic_test_v4_sessions')
      .select('test_type, score')
      .eq('user_id', userId)
      .not('completed_at', 'is', null),
    supabase
      .from('personality_test_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('completed_at', 'is', null),
    supabase
      .from('cv_analysis_jobs')
      .select('result->atsFriendliness->>score')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle(),
  ])

  const now = new Date()

  // Brev: totalt, denna månad och de tre senaste.
  const letters = lettersRes.data || []
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthly = letters.filter(
    (letter: { created_at: string }) => new Date(letter.created_at) >= startOfMonth
  ).length

  // CV: antal rader och namnet på det senast uppdaterade.
  const cvRows = cvRes.data || []
  const activeName = cvRows[0]?.file_name ?? null

  // Ansökningar: samma räkning som hooken gjorde på klienten.
  const apps = (applicationsRes.data || []) as JobApplication[]
  const nudgeMs = NO_RESPONSE_NUDGE_DAYS * 24 * 60 * 60 * 1000

  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthKey = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`

  let waitingCount = 0
  let interviewCount = 0
  let followUpCount = 0
  let prevMonthCount = 0
  let weekCount = 0
  let replyCount = 0

  const weekStart = startOfWeekStockholm(now).getTime()
  const open: DashboardSummaryPipelineItem[] = []

  for (const app of apps) {
    const closed = statusIsClosed(app.current_status)
    if (!closed && !statusHasResponse(app.current_status)) waitingCount++
    if (INTERVIEW_STATUSES.includes(app.current_status ?? '')) interviewCount++
    if (statusHasResponse(app.current_status)) replyCount++

    const lastIso = app.status_updated_at ?? app.created_at
    const last = new Date(lastIso).getTime()
    const silent =
      !closed &&
      app.current_status !== 'offer_received' &&
      !Number.isNaN(last) &&
      now.getTime() - last >= nudgeMs
    if (silent) followUpCount++

    if (app.applied_at?.startsWith(prevMonthKey)) prevMonthCount++

    const appliedAt = new Date(app.applied_at ?? app.created_at).getTime()
    if (!Number.isNaN(appliedAt) && appliedAt >= weekStart) weekCount++

    // Pågår nu: bara öppna ärenden, de avslutade har ingen handling kvar.
    if (!closed) {
      open.push({
        id: app.id,
        jobTitle: app.job_title,
        company: app.company,
        status: app.current_status,
        days: daysSince(lastIso, now),
        needsFollowUp: silent,
      })
    }
  }

  // Mest tidskänsligt först: tysta, sedan intervjuer, sedan äldst.
  open.sort((a, b) => {
    if (a.needsFollowUp !== b.needsFollowUp) return a.needsFollowUp ? -1 : 1
    const ai = INTERVIEW_STATUSES.includes(a.status ?? '')
    const bi = INTERVIEW_STATUSES.includes(b.status ?? '')
    if (ai !== bi) return ai ? -1 : 1
    return b.days - a.days
  })

  // Onboarding: samma hybridvalidering som OnboardingContext gjorde på
  // klienten. Ett steg räknas som klart antingen om det står i profilens
  // onboarding_steps_completed eller om funktionen faktiskt har använts.
  // Logiken är oförändrad, bara flyttad hit så den inte kostar sex extra
  // rundturer vid varje sidladdning.
  const profileRow = profileRes.data as Record<string, unknown> | null
  const storedSteps = (profileRow?.onboarding_steps_completed as string[] | null) ?? []
  const usageCounts: Array<[string, number]> = [
    ['upload_cv', cvRows.length],
    ['create_letter', letters.length],
    ['analyze_cv', analysisRes.count ?? 0],
    ['optimize_linkedin', linkedinRes.count ?? 0],
    ['download_cv_template', downloadRes.count ?? 0],
    ['match_jobs', matchRes.count ?? 0],
  ]
  const validatedSteps = usageCounts
    .filter(([step, count]) => storedSteps.includes(step) || count > 0)
    .map(([step]) => step)

  // Veckans tillstånd. Scopet räknas ur samma källor som premiumAccess
  // (profiles plus giltiga grants), fast utan extra rundturer: profilraden
  // är redan hämtad ovan och grants ligger i samma parallella omgång.
  // Ändras reglerna i src/lib/supabase/premiumAccess.ts ska de ändras här.
  const giltigtScope = (v: unknown): v is 'cv' | 'tester' | 'allt' =>
    v === 'cv' || v === 'tester' || v === 'allt'

  const harPremium =
    (!!profileRow?.premium_until && new Date(profileRow.premium_until as string) > now) ||
    profileRow?.subscription_tier === 'premium'
  const profilScope = harPremium
    ? giltigtScope(profileRow?.premium_scope)
      ? (profileRow.premium_scope as 'cv' | 'tester' | 'allt')
      : 'allt'
    : null
  const grants = (grantsRes.data ?? []) as Array<{
    scope?: string | null
    premium_until_after?: string | null
  }>
  const harAllaDagen = grants.some((rad) => (rad?.scope ?? 'allt') === 'allt')
  const smalareGrant = grants.map((rad) => rad?.scope).find(giltigtScope) ?? null
  const scope = harAllaDagen ? 'allt' : (profilScope ?? smalareGrant)

  // Allt-dagen: behörigheten kommer ur ett engångsköp och inte ur en
  // prenumeration. Menyhuvudet säger då när dygnet tar slut i stället för
  // när paketet förnyas. Villkoret är precis det: ett giltigt grant och
  // ingen prenumeration bakom det.
  const grantSlutar = grants
    .map((rad) => rad?.premium_until_after)
    .filter((v): v is string => typeof v === 'string' && v.length > 0)
    .sort()
    .pop() ?? null
  const endastDagpass = profilScope === null && grantSlutar !== null

  // Paketet, för menyhuvudet "Du har CV-veckan, förnyas 29 september, 79 kr".
  const premiumUntil = profileRow?.premium_until ? new Date(profileRow.premium_until as string) : null
  const planKey = endastDagpass ? ('all_day' as PlanKey) : harPaket(scope, premiumUntil, now)
  const fornyasAt = endastDagpass
    ? grantSlutar
    : ((profileRow?.current_period_end as string | undefined) ??
      (profileRow?.premium_until as string | undefined) ??
      null)

  // Kvoterna som menyn skriver ut ("7 av 10 meddelanden kvar"). Samma
  // källor och tak som src/lib/quota/getQuotaSummary.ts.
  const { effectiveCount: lettersUsed } = resolveWeeklyLetterCounter(
    Number(profileRow?.weekly_letter_count ?? 0) || 0,
    (profileRow?.weekly_letter_first_used_at as string | null | undefined) ?? null
  )
  const chatUsed = chatRes.count ?? 0

  // Hjälpredan: provade brickor ur kolumnen och tabellerna.
  const testRader = (testRes.data ?? []) as Array<{ test_type: string | null; score: number | null }>
  const provade = harledProvade({
    sparade: sparadeNycklar(profileRow?.onboarding_steps),
    goalRole: (profileRow?.goal_role as string | null | undefined) ?? null,
    location: (profileRow?.location as string | null | undefined) ?? null,
    cvCount: cvRows.length,
    analysisCompleted: analysisRes.count ?? 0,
    matchCount: matchRes.count ?? 0,
    templateDownloads: downloadRes.count ?? 0,
    letterCount: letters.length,
    linkedinCount: linkedinRes.count ?? 0,
    visibility: (candidateRes?.data?.visibility as string | null | undefined) ?? null,
    conversationCount: convRes.count ?? 0,
    testTypes: testRader.map((r) => r.test_type),
    personalityCompleted: personalityRes.count ?? 0,
  })

  const matrisBasta = testRader
    .filter((r) => (r.test_type ?? 'matrislogik') === 'matrislogik')
    .reduce<number | null>((b, r) => (typeof r.score === 'number' && (b === null || r.score > b) ? r.score : b), null)
  const poangRaw = (senasteAnalysRes?.data as Record<string, unknown> | null)?.score
  const poang = poangRaw === null || poangRaw === undefined ? null : Number(poangRaw)
  const fakta: BrickaFakta = {
    cvNamn: activeName,
    poang: poang !== null && Number.isFinite(poang) ? Math.round(poang) : null,
    matrisRatt: matrisBasta,
    matrisAv: getTestConfig('matrislogik-grund')?.totalQuestions ?? null,
  }

  return {
    profile: profileRes.data ?? null,
    letters: {
      total: letters.length,
      monthly,
      recent: letters.slice(0, 3),
    },
    cv: {
      count: cvRows.length,
      activeName,
    },
    applications: {
      waitingCount,
      interviewCount,
      followUpCount,
      prevMonthCount,
      weekCount,
      replyCount,
      pipeline: open.slice(0, 5),
    },
    onboarding: {
      completedSteps: validatedSteps,
      rewardClaimed: Boolean(profileRow?.onboarding_reward_claimed),
      createdAt: (profileRow?.created_at as string | undefined) ?? null,
    },
    paket: {
      scope,
      track: giltigtScope(profileRow?.onboarding_track)
        ? (profileRow!.onboarding_track as Scope)
        : null,
      planKey,
      fornyasAt,
      dayPassOnly: endastDagpass,
      chatUsed,
      chatLimit: scopeHasFeature(scope, 'chat_unlimited') ? null : FREE_CHAT_MESSAGES_PER_ACCOUNT,
      lettersUsed,
      lettersLimit: scopeHasFeature(scope, 'letter_download') ? null : DAILY_LIMIT_LETTERS,
    },
    komIgang: {
      provade,
      fakta,
    },
  }
}
