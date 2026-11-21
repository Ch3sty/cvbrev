/**
 * Jobbsökets serverladdare (omgång 1). Vyerna anropar dem i
 * serverkomponenter; allt läses parallellt i ett varv mot databasen så långt
 * det går, och ingenting hämtas efter mount.
 *
 * Läsningarna går med användarens session (RLS: ägaren läser sina rader).
 * Saknas migreringen 20261121180000 (tabellerna eller kolumnerna) blir
 * Ska sökas och uppföljningarna tomma och `migreringSaknas` sant; resten av
 * sidan fungerar som förut.
 *
 * Bara server.
 */
import 'server-only'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { userHasPremiumAccess } from '@/lib/supabase/premiumAccess'
import { hamtaSummaryForRequest } from '@/lib/dashboard/summaryForRequest'
import type { DashboardSummaryData } from '@/lib/dashboard/getSummary'
import { hamtaProv } from '@/lib/intervju/data'
import type { ProvSammanfattning } from '@/lib/intervju/nasta'
import { compareCvPerformance, type CvComparison } from '@/lib/applications/cvComparison'
import { nextAfReportDeadline, type AfReportDeadline } from '@/lib/applications/afReport'
import { hamtaAfRapport, rapportManad, type AfRapport } from '@/lib/applications/afRapportData'
import { kravForBrev } from '@/lib/letters/lage'
import { arPlatshallareNamn } from '@/lib/profile/dokumentKontakt'
import { toJobPreferences } from '@/types/user.types'
import { buildMatchReasons } from '@/app/dashboard/jobbmatchning/data/match-reasons'
import { hamtaBasta } from '@/lib/jobmatching/sammanfattning.server'
import { publicerade as publiceradeTider } from '@/lib/jobmatching/basta'
import { nyaBlandBasta } from '@/lib/rum/nyaTraffar'
import type { ActiveCVData } from '@/app/dashboard/jobbmatchning/getJobbmatchningData'
import { FREE_TIER_JOB_LIMIT } from '@/lib/jobmatching/freeLimit'
import { idagSv, tidpunkt } from './datum'
import { arSchemaFel } from './schema'
import { tjanstLage } from './lage'
import { bana, skaSokasLista, tjanstensSteg } from './bana'
import { veckansMal } from './veckansMal'
import { attGoraNu } from './attGora'
import { forberedelse, intervjuerPaGang, type IntervjuPaGang } from './intervju'
import { handelselista } from './handelser'
import { kanaler, manadsstaplar, tratt, veckostaplar } from './statistik'
import { avslutadeText, soktaLista, soktaVagg } from './lista'
import { coachForslag } from './coach'
import { nastaPaminnelse } from './lage'
import { uppfoljningSparr, type SparrSvar } from './uppfoljning'
import { sistaAnsokningsdag } from './matchning'
import type {
  AttGoraNu,
  Bana,
  CoachForslagLista,
  Forberedelse,
  HandelseListRad,
  Handelse,
  JobApplication,
  KanalRad,
  ManadsStapel,
  SkaSokasRad,
  SoktaLista,
  SparadAnnons,
  TjanstLage,
  TjanstMedHistorik,
  TjanstensSteg,
  Tratt,
  Uppfoljning,
  VeckansMal,
  VeckoStapel,
} from './typer'

export type Klient = SupabaseClient<any, any, any>

export { arSchemaFel }

export async function sessionsKlient(): Promise<Klient> {
  return createServerClient({ cookies: await cookies() }) as Klient
}

/* ------------------------------------------------------------- läsningar */

export interface Lasning<T> {
  rader: T
  /** Läsningen gick fel av annat skäl än schemat. */
  fel: boolean
  /** Tabellen eller kolumnen finns inte (migreringen ej körd). */
  saknas: boolean
}

/** Sökta tjänster med händelserna inbäddade, nyast sökt först. */
export async function lasAnsokningar(supabase: Klient, userId: string): Promise<Lasning<Array<JobApplication & { job_application_events?: Handelse[] }>>> {
  const { data, error } = await supabase
    .from('job_applications')
    .select('*, job_application_events(*)')
    .eq('user_id', userId)
    .order('applied_at', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) console.error('[jobbsok] Kunde inte läsa sökta tjänster:', error.message)
  return { rader: (data ?? []) as any[], fel: !!error, saknas: false }
}

export async function lasUppfoljningar(supabase: Klient, userId: string, applicationId?: string): Promise<Lasning<Uppfoljning[]>> {
  let q = supabase.from('job_application_followups').select('*').eq('user_id', userId)
  if (applicationId) q = q.eq('application_id', applicationId)
  const { data, error } = await q.order('created_at', { ascending: true })
  if (error && !arSchemaFel(error)) console.error('[jobbsok] Kunde inte läsa uppföljningar:', error.message)
  return { rader: (data ?? []) as Uppfoljning[], fel: !!error && !arSchemaFel(error), saknas: arSchemaFel(error) }
}

export async function lasSparade(supabase: Klient, userId: string): Promise<Lasning<SparadAnnons[]>> {
  const { data, error } = await supabase
    .from('job_saved_ads')
    .select('*')
    .eq('user_id', userId)
    .is('application_id', null)
    .order('created_at', { ascending: false })
  if (error && !arSchemaFel(error)) console.error('[jobbsok] Kunde inte läsa Ska sökas:', error.message)
  return { rader: (data ?? []) as SparadAnnons[], fel: !!error && !arSchemaFel(error), saknas: arSchemaFel(error) }
}

/** profiles.weekly_application_goal; null när kolumnen saknas eller är tom. */
export async function lasVeckansMal(supabase: Klient, userId: string): Promise<Lasning<number | null>> {
  const { data, error } = await supabase.from('profiles').select('weekly_application_goal').eq('id', userId).maybeSingle()
  if (error && !arSchemaFel(error)) console.error('[jobbsok] Kunde inte läsa veckans mål:', error.message)
  const v = (data as { weekly_application_goal?: number | null } | null)?.weekly_application_goal
  return { rader: typeof v === 'number' ? v : null, fel: !!error && !arSchemaFel(error), saknas: arSchemaFel(error) }
}

/** Sätter ihop tjänsterna med sina händelser och uppföljningar. */
export function sattIhopHistorik(
  ansokningar: ReadonlyArray<JobApplication & { job_application_events?: Handelse[] }>,
  uppfoljningar: readonly Uppfoljning[]
): TjanstMedHistorik[] {
  const perTjanst = new Map<string, Uppfoljning[]>()
  for (const u of uppfoljningar) {
    const lista = perTjanst.get(u.application_id) ?? []
    lista.push(u)
    perTjanst.set(u.application_id, lista)
  }
  return ansokningar.map(({ job_application_events, ...ansokan }) => ({
    ansokan: ansokan as JobApplication,
    handelser: (job_application_events ?? []).map((h) => ({
      ...h,
      interview_at: h.interview_at ?? null,
      interview_place: h.interview_place ?? null,
    })),
    uppfoljningar: perTjanst.get(ansokan.id) ?? [],
  }))
}

/** Antal sökta tjänster förra kalendermånaden, svensk tid (rapportens villkor). */
export function sokteForraManaden(lagen: readonly TjanstLage[], nu: Date = new Date()): number {
  const idag = idagSv(nu)
  const [y, m] = idag.slice(0, 7).split('-').map(Number)
  const forra = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`
  return lagen.filter((l) => l.appliedAt.startsWith(forra)).length
}

async function lasProv(userId: string): Promise<ProvSammanfattning[]> {
  try {
    return await hamtaProv(getSupabaseAdmin() as any, userId, 20)
  } catch (err) {
    console.error('[jobbsok] Kunde inte läsa intervjuproven:', err)
    return []
  }
}

function intervjuprovKort(prov: readonly ProvSammanfattning[]): { ovade: number; lagst: { kort: string; betyg: number } | null } {
  const f = forberedelse(prov, null)
  const lagst = f.fragor.find((x) => x.betyg !== null)
  return { ovade: f.ovade, lagst: lagst ? { kort: lagst.kort, betyg: lagst.betyg as number } : null }
}

function fornamnUr(fullName: unknown): string | null {
  if (typeof fullName !== 'string' || arPlatshallareNamn(fullName)) return null
  const forsta = fullName.trim().split(/\s+/)[0]
  return forsta || null
}

/* ------------------------------------------------------------- Översikt */

export interface JobbsokOversikt {
  idag: string
  harCv: boolean
  fornamn: string | null
  harBetalt: boolean
  /** Alla sökta tjänster, nyast sökt först. */
  tjanster: TjanstLage[]
  /** Listan "Sökta tjänster" på Översikt: öppna först (samma ordning som Sökta tjänster), högst fyra. */
  tjansterKort: TjanstLage[]
  bana: Bana
  attGora: AttGoraNu
  veckansMal: VeckansMal
  skaSokas: SkaSokasRad[]
  intervjuerPaGang: IntervjuPaGang[]
  /** Nya träffar sedan Matchade jobb senast visades; null när det inte går att veta. */
  nyaTraffar: number | null
  /** Bli upptäckt-raden i "Mer i Jobbsöket". */
  bliUpptacktSynlig: boolean
  /** Bli upptäckt-raden: antal visningar och obesvarade förfrågningar, aldrig vilka. */
  bliUpptacktTal: BliUpptacktTal
  /** Summeringen (skalet delar den via cache()), för det vyerna redan läser därifrån. */
  summering: DashboardSummaryData | null
  /** Migreringen 20261121180000 är inte körd. */
  migreringSaknas: boolean
  /** Sökta tjänster gick inte att läsa: visa felraden, inte ett tomt läge. */
  lasfel: boolean
}

export interface BliUpptacktTal {
  /** Visningar av profilen (candidate_profile_views, en per rekryterare och dygn); null vid fel. */
  sett: number | null
  /** Förfrågningar från rekryterare som väntar på svar (candidate_interests, status pending); null vid fel. */
  vantar: number | null
}

/**
 * Talen på Bli upptäckt-raden, räknade i databasen (head, inga rader). Samma
 * källor som sidan Bli upptäckt (getProfileViewStats, total) och sidomenyns
 * märke (useCandidateInterests, pending). Båda läses med användarens
 * session: RLS släpper bara igenom kandidatens egna rader, och inget om vem
 * rekryteraren är lämnar databasen.
 */
export async function lasBliUpptacktTal(supabase: Klient, userId: string): Promise<BliUpptacktTal> {
  const [settRes, vantarRes] = await Promise.all([
    supabase.from('candidate_profile_views').select('id', { count: 'exact', head: true }).eq('candidate_user_id', userId),
    supabase.from('candidate_interests').select('id', { count: 'exact', head: true }).eq('candidate_user_id', userId).eq('status', 'pending'),
  ])
  if (settRes.error && !arSchemaFel(settRes.error)) console.error('[jobbsok] Kunde inte räkna profilvisningar:', settRes.error.message)
  if (vantarRes.error && !arSchemaFel(vantarRes.error)) console.error('[jobbsok] Kunde inte räkna förfrågningar:', vantarRes.error.message)
  return {
    sett: settRes.error ? null : settRes.count ?? 0,
    vantar: vantarRes.error ? null : vantarRes.count ?? 0,
  }
}

export async function hamtaJobbsokOversikt(userId: string, opt: { nu?: Date; avfardade?: ReadonlySet<string> } = {}): Promise<JobbsokOversikt> {
  const nu = opt.nu ?? new Date()
  const supabase = await sessionsKlient()
  const [summering, ansokningar, uppfoljningar, sparade, mal, prov, bliUpptacktTal] = await Promise.all([
    hamtaSummaryForRequest(userId).catch((err) => {
      console.error('[jobbsok] Summeringen gick fel:', err)
      return null
    }),
    lasAnsokningar(supabase, userId),
    lasUppfoljningar(supabase, userId),
    lasSparade(supabase, userId),
    lasVeckansMal(supabase, userId),
    lasProv(userId),
    lasBliUpptacktTal(supabase, userId).catch((err): BliUpptacktTal => {
      console.error('[jobbsok] Bli upptäckt-talen gick fel:', err)
      return { sett: null, vantar: null }
    }),
  ])

  const historik = sattIhopHistorik(ansokningar.rader, uppfoljningar.rader)
  const tjanster = historik.map((t) => tjanstLage(t, nu))
  const skaSokas = skaSokasLista(sparade.rader, idagSv(nu))
  const vm = veckansMal(historik.map((t) => t.ansokan), mal.rader, nu)
  const harCv = (summering?.cv.count ?? 0) > 0
  const fornamn = fornamnUr(summering?.profile?.full_name)
  const lista = soktaLista(tjanster, skaSokas)

  return {
    idag: idagSv(nu),
    harCv,
    fornamn,
    harBetalt: !!summering?.paket.scope,
    tjanster,
    tjansterKort: [...lista.folj_upp, ...lista.intervju, ...lista.erbjudande, ...lista.vantar_svar].slice(0, 4),
    bana: bana(tjanster, skaSokas),
    attGora: attGoraNu({
      tjanster,
      skaSokas,
      veckansMal: vm,
      harCv,
      sokteForraManaden: sokteForraManaden(tjanster, nu),
      intervjuprov: intervjuprovKort(prov),
      fornamn,
      avfardade: opt.avfardade,
      nu,
    }),
    veckansMal: vm,
    skaSokas,
    intervjuerPaGang: intervjuerPaGang(tjanster, nu),
    nyaTraffar: summering?.jobbsok?.matchningarNya ?? null,
    bliUpptacktSynlig: summering?.jobbsok?.bliUpptacktSynlig ?? false,
    bliUpptacktTal,
    summering,
    migreringSaknas: uppfoljningar.saknas || sparade.saknas || mal.saknas,
    lasfel: ansokningar.fel,
  }
}

/* ------------------------------------------------- Toppträffarna (Översikt) */

export interface ToppTraff {
  id: string
  jobTitle: string
  company: string
  ort: string | null
  distans: boolean
  score: number
  /** Skälen som listan visar ("Din roll matchar", "6 av 7 kompetenser i kravprofilen"). */
  skal: string[]
  sistaDag: string | null
  sistaDagText: string | null
  /** Publicerad efter att Matchade jobb senast visades. */
  ny: boolean
}

export interface ToppTraffar {
  traffar: ToppTraff[]
  /** Annonser i senaste körningen. */
  lasta: number
  /** När körningen gjordes (ISO), null utan körning. */
  kordAt: string | null
  /** De bästa träffarna i körningen (högst 25), som listan visar. */
  basta: number
  /** Nya bland de bästa sedan Matchade jobb senast visades; null = säg inte "nya" (första gången eller alla nya). */
  nya: number | null
  /** När Matchade jobb senast visades (profiles.matchningar_sedda_at), för "Sedan du tittade i tisdags". */
  seddaAt: string | null
}

/**
 * De bästa träffarna ur sammanfattningen av senaste matchningskörningen
 * (job_matching_summaries), poängsatta som Matchade jobb gör det. Läser
 * aldrig hela körningen (läget 'liten', rättningen efter slutkontrollen
 * 2026-11-21): utan sammanfattning blir det samma tomma läge som förut.
 * Vyn hämtar den ändå i en egen Suspense-gräns. Gratisnivån får aldrig
 * fler än de tre som visas i klartext.
 */
export async function hamtaToppTraffar(userId: string, antal = 3, opt: { nu?: Date } = {}): Promise<ToppTraffar> {
  const supabase = await sessionsKlient()
  const [cvRes, profilRes, harBetalt] = await Promise.all([
    supabase.from('active_cv_for_matching').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('profiles').select('job_preferences, matchningar_sedda_at').eq('id', userId).maybeSingle(),
    userHasPremiumAccess(supabase, userId).catch(() => false),
  ])
  const cv = (cvRes.data ?? null) as ActiveCVData | null
  const profil = profilRes.data as { job_preferences?: unknown; matchningar_sedda_at?: string | null } | null
  const prefs = toJobPreferences(profil?.job_preferences)
  // De bästa träffarna ur sammanfattningen (samma kedja och samma 25 som
  // Matchade jobb), aldrig ur hela körningen.
  const basta = await hamtaBasta(supabase, userId, cv, prefs, 'liten')
  const seddaAt = profil?.matchningar_sedda_at ?? null
  if (!basta || basta.ranked.length === 0) return { traffar: [], lasta: basta?.adsRead ?? 0, kordAt: basta ? new Date(basta.korningAt).toISOString() : null, basta: 0, nya: null, seddaAt }

  const orter = prefs.locations
  const sedda = seddaAt ? Date.parse(seddaAt) : null
  const tak = harBetalt ? antal : Math.min(antal, FREE_TIER_JOB_LIMIT)
  const nyaLage = nyaBlandBasta(publiceradeTider(basta.ranked), seddaAt)
  const nu = opt.nu ?? new Date()
  return {
    lasta: basta.adsRead,
    kordAt: new Date(basta.korningAt).toISOString(),
    basta: nyaLage.basta,
    nya: nyaLage.nya,
    seddaAt,
    traffar: basta.ranked.slice(0, tak).map(({ job, score }) => {
      const sista = sistaAnsokningsdag(job, nu)
      // Tid utan zon tolkas som svensk tid, som i webbläsaren (datum.ts).
      const publ = tidpunkt(typeof job.publication_date === 'string' ? job.publication_date : null) ?? NaN
      return {
        id: String(job.id ?? ''),
        jobTitle: String(job.headline ?? ''),
        company: String(job.employer?.name ?? ''),
        ort: score.locationLabel,
        distans: score.isRemote,
        score: score.score,
        skal: buildMatchReasons(job, cv, orter, score).reasons,
        sistaDag: sista?.dag ?? null,
        sistaDagText: sista?.text ?? null,
        ny: sedda !== null && Number.isFinite(publ) && publ > sedda,
      }
    }),
  }
}

/* -------------------------------------------------------- Sökta tjänster */

export interface SoktaStatistik {
  tratt: Tratt
  veckostaplar: VeckoStapel[]
  manadsstaplar: ManadsStapel[]
  kanaler: KanalRad[]
  cvJamforelse: CvComparison
  /** Första sökta tjänstens dag, null utan tjänster. */
  forstaSokt: string | null
}

export interface SoktaRapport {
  deadline: Omit<AfReportDeadline, 'dueDate'> & { dueDate: string }
  /** Rapporten för månaden adressen anger, annars nästa rapporttillfälles månad. */
  manad: string
  locked: boolean
  data: AfRapport | null
}

export interface SoktaTjansterData {
  idag: string
  harBetalt: boolean
  tjanster: TjanstLage[]
  lista: SoktaLista
  vagg: { rubrik: string; text: string }
  avslutadeText: string | null
  bana: Bana
  veckansMal: VeckansMal
  statistik: SoktaStatistik
  rapport: SoktaRapport
  /** Som i dag: sparade brev som inte kopplats till en sökt tjänst. */
  backfill: Array<{ id: string; title: string | null; company: string | null; job_title: string | null; created_at: string }>
  /** Raderna som dagens klientkomponenter tar emot (SoktaTjansterClient, ShareTab). */
  ansokningar: JobApplication[]
  migreringSaknas: boolean
  lasfel: boolean
}

export async function hamtaSoktaTjanster(userId: string, opt: { nu?: Date; manad?: string | null } = {}): Promise<SoktaTjansterData> {
  const nu = opt.nu ?? new Date()
  const supabase = await sessionsKlient()
  const deadline = nextAfReportDeadline(nu)
  const manad = rapportManad(opt.manad ?? deadline.reportMonth, nu)
  const [ansokningar, uppfoljningar, sparade, mal, brevRes, cvRes, harBetalt] = await Promise.all([
    lasAnsokningar(supabase, userId),
    lasUppfoljningar(supabase, userId),
    lasSparade(supabase, userId),
    lasVeckansMal(supabase, userId),
    supabase
      .from('letters')
      .select('id, title, company, job_title, created_at')
      .eq('user_id', userId)
      .eq('is_saved', true)
      .order('created_at', { ascending: false }),
    supabase.from('cv_texts').select('id, file_name').eq('user_id', userId),
    userHasPremiumAccess(supabase, userId).catch(() => false),
  ])
  const rapport = await hamtaAfRapport(supabase, userId, manad, harBetalt).catch((err) => {
    console.error('[jobbsok] Rapporten kunde inte läsas:', err)
    return null
  })

  const historik = sattIhopHistorik(ansokningar.rader, uppfoljningar.rader)
  const tjanster = historik.map((t) => tjanstLage(t, nu))
  const idag = idagSv(nu)
  const skaSokas = skaSokasLista(sparade.rader, idag)
  const lista = soktaLista(tjanster, skaSokas)
  const rena = historik.map((t) => t.ansokan)
  const kopplade = new Set(rena.map((a) => a.letter_id).filter(Boolean))
  const cvNamn: Record<string, string> = {}
  for (const c of (cvRes.data ?? []) as Array<{ id: string; file_name: string | null }>) cvNamn[c.id] = c.file_name ?? 'CV'
  const forstaSokt = tjanster.reduce<string | null>((m, t) => (!m || t.appliedAt < m ? t.appliedAt : m), null)

  return {
    idag,
    harBetalt,
    tjanster,
    lista,
    vagg: soktaVagg(tjanster),
    avslutadeText: avslutadeText(lista.avslutade),
    bana: bana(tjanster, skaSokas),
    veckansMal: veckansMal(rena, mal.rader, nu),
    statistik: {
      tratt: tratt(historik, tjanster),
      veckostaplar: veckostaplar(tjanster, nu),
      manadsstaplar: manadsstaplar(tjanster, nu),
      kanaler: kanaler(tjanster),
      cvJamforelse: compareCvPerformance(rena, cvNamn),
      forstaSokt,
    },
    rapport: {
      deadline: { ...deadline, dueDate: deadline.dueDate.toISOString() },
      manad: `${manad.year}-${String(manad.month).padStart(2, '0')}`,
      locked: rapport?.locked ?? !harBetalt,
      data: rapport?.data ?? null,
    },
    backfill: ((brevRes.data ?? []) as SoktaTjansterData['backfill']).filter((b) => !kopplade.has(b.id)),
    ansokningar: rena,
    migreringSaknas: uppfoljningar.saknas || sparade.saknas || mal.saknas,
    lasfel: ansokningar.fel,
  }
}

/* --------------------------------------------------------- En sökt tjänst */

export interface UppfoljningLage {
  /** Oskickat utkast, eller null. Skrivs aldrig om när sidan öppnas igen. */
  utkast: Uppfoljning | null
  /** Senaste skickade uppföljning, eller null. */
  senastSkickad: Uppfoljning | null
  /** Dagen påminnelsen kommer tillbaka om det fortfarande är tyst. */
  nastaPaminnelse: string | null
  /** Spärren för ett nytt utkast (F5). Ett befintligt utkast går alltid att öppna. */
  sparr: SparrSvar
  /** Omskrivningar kvar på utkastet (högst tre). */
  omskrivningarKvar: number
}

export interface SoktTjanstData {
  tjanst: TjanstLage
  ansokan: JobApplication
  handelser: Handelse[]
  handelselista: HandelseListRad[]
  steg: TjanstensSteg
  forberedelse: Forberedelse
  uppfoljning: UppfoljningLage
  brev: { id: string; title: string | null; language: 'sv' | 'en' } | null
  cv: { id: string; file_name: string } | null
  /** Ska sökas-raden tjänsten skapades från, om någon. */
  franSkaSokas: { id: string; afAdId: string | null; matchScore: number | null } | null
  harBetalt: boolean
  migreringSaknas: boolean
}

/** En sökt tjänst med allt sidan visar. Null när tjänsten inte finns eller inte är användarens. */
export async function hamtaSoktTjanst(userId: string, id: string, opt: { nu?: Date } = {}): Promise<SoktTjanstData | null> {
  const nu = opt.nu ?? new Date()
  const supabase = await sessionsKlient()
  const { data: ansokan, error } = await supabase
    .from('job_applications')
    .select('*, job_application_events(*)')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()
  if (error || !ansokan) {
    if (error) console.error('[jobbsok] Kunde inte läsa den sökta tjänsten:', error.message)
    return null
  }
  const a = ansokan as JobApplication & { job_application_events?: Handelse[] }

  const [uppfoljningar, kontotsUtkast, brevRes, cvRes, sparadRes, prov, harBetalt] = await Promise.all([
    lasUppfoljningar(supabase, userId, id),
    supabase.from('job_application_followups').select('application_id, created_at').eq('user_id', userId).not('body', 'is', null),
    a.letter_id
      ? supabase.from('letters').select('id, title, language, krav, body_stycken, content').eq('id', a.letter_id).eq('user_id', userId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    a.cv_id
      ? supabase.from('cv_texts').select('id, file_name').eq('id', a.cv_id).eq('user_id', userId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase.from('job_saved_ads').select('id, af_ad_id, match_score').eq('user_id', userId).eq('application_id', id).maybeSingle(),
    lasProv(userId),
    userHasPremiumAccess(supabase, userId).catch(() => false),
  ])

  const [historik] = sattIhopHistorik([a], uppfoljningar.rader)
  const tjanst = tjanstLage(historik, nu)
  const brevRad = brevRes.data as { id: string; title: string | null; language?: string | null; krav?: unknown; body_stycken?: unknown; content?: string | null } | null
  const krav = brevRad ? kravForBrev(brevRad) : null

  const utkast = [...historik.uppfoljningar].reverse().find((u) => !u.sent_at) ?? null
  const skickade = historik.uppfoljningar.filter((u) => u.sent_at).sort((x, y) => (x.sent_at as string).localeCompare(y.sent_at as string))
  const senastSkickad = skickade[skickade.length - 1] ?? null
  const sparr = uppfoljningSparr({
    harBetalt,
    utkast: ((kontotsUtkast as { data?: unknown }).data ?? []) as Array<{ application_id: string; created_at: string }>,
    applicationId: id,
    nu,
  })
  const sparad = sparadRes.data as { id: string; af_ad_id: string | null; match_score: number | null } | null

  return {
    tjanst,
    ansokan: historik.ansokan,
    handelser: historik.handelser,
    handelselista: handelselista(historik, tjanst, nu),
    steg: tjanstensSteg(historik, tjanst),
    forberedelse: forberedelse(prov, krav),
    uppfoljning: {
      utkast,
      senastSkickad,
      nastaPaminnelse: senastSkickad?.sent_at ? nastaPaminnelse(senastSkickad.sent_at) : null,
      sparr,
      omskrivningarKvar: utkast ? Math.max(0, 3 - (utkast.rewrites ?? 0)) : 3,
    },
    brev: brevRad ? { id: brevRad.id, title: brevRad.title, language: brevRad.language === 'en' ? 'en' : 'sv' } : null,
    cv: (cvRes.data as { id: string; file_name: string } | null) ?? null,
    franSkaSokas: sparad ? { id: sparad.id, afAdId: sparad.af_ad_id, matchScore: sparad.match_score } : null,
    harBetalt,
    migreringSaknas: uppfoljningar.saknas,
  }
}

/* ---------------------------------------------- Inför intervjun, Jobbcoachen */

/** "Intervjuer på gång" för Inför intervjun. Bygger på getInforIntervjunData, ersätter den inte. */
export async function hamtaIntervjuerPaGang(userId: string, opt: { nu?: Date } = {}): Promise<IntervjuPaGang[]> {
  const nu = opt.nu ?? new Date()
  const supabase = await sessionsKlient()
  const ansokningar = await lasAnsokningar(supabase, userId)
  // Uppföljningar behövs inte: intervjusteget räknar inte tystnad på bokade.
  const tjanster = sattIhopHistorik(ansokningar.rader, []).map((t) => tjanstLage(t, nu))
  return intervjuerPaGang(tjanster, nu)
}

/** "Frågor utifrån ditt läge" för Jobbcoachen (F9), utan AI. */
export async function hamtaCoachForslag(userId: string, opt: { nu?: Date } = {}): Promise<CoachForslagLista> {
  const nu = opt.nu ?? new Date()
  const supabase = await sessionsKlient()
  const [ansokningar, uppfoljningar] = await Promise.all([lasAnsokningar(supabase, userId), lasUppfoljningar(supabase, userId)])
  if (ansokningar.fel) return coachForslag([], nu)
  const tjanster = sattIhopHistorik(ansokningar.rader, uppfoljningar.rader).map((t) => tjanstLage(t, nu))
  return coachForslag(tjanster, nu)
}
