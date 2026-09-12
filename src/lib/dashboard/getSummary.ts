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
  }
}
