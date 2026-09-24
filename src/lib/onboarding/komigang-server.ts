// src/lib/onboarding/komigang-server.ts
//
// Serversidan av hjälpredan "Kom igång" (docs/design/spec-onboarding-2026-09-22.html).
//
// Två saker bor här:
//
//   1. markeraBricka: kvitteringen. Anropas från de rutter som redan loggar
//      att handlingen skett (CV in, analys klar, mall nedladdad, brev
//      sparat, LinkedIn körd, test slutfört, coachen frågad). Skriver via
//      service role till profiles.onboarding_steps genom komigang_markera,
//      som är idempotent. Får aldrig fälla anropande rutt.
//
//   2. harledProvade: sanningen om vad som är provat, räknad ur både den
//      sparade jsonb-kolumnen och tabellerna. Den som redan hade ett CV,
//      ett brev eller tre testsessioner innan hjälpredan fanns ska inte
//      börja på noll, och en missad kvittering i en rutt ska inte heller
//      synas. Kolumnen är därför ett komplement, inte enda källan.
//
// Ingen klientkod importerar den här filen: getSupabaseAdmin drar in
// service-nyckeln.

import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { captureServer, timmarSedan } from '@/lib/analytics/server'
import { listaFor, type BrickaKey, type Paket } from './komigang'

/** Sant för de tre paketen, falskt för null och skräp. */
function arPaket(v: unknown): v is Exclude<Paket, null> {
  return v === 'cv' || v === 'tester' || v === 'allt'
}

/**
 * Kvittera en bricka. Tyst vid fel: hjälpredan får aldrig fälla en rutt.
 *
 * Mätningen sitter här och ingen annanstans (docs/plan-paket-och-onboarding.md
 * avsnitt 6): onboarding_step_completed när brickan kvitteras första gången,
 * och onboarding_completed när listan för paketet är fylld. Profilen läses
 * före kvitteringen så att en bricka som redan var provad inte mäts igen,
 * vilket är samma idempotens som komigang_markera har i databasen.
 * hours_since_purchase räknas på paket_started_at, som webhooken skriver.
 */
export async function markeraBricka(userId: string, key: BrickaKey): Promise<void> {
  try {
    const admin = getSupabaseAdmin() as any

    const { data: profil } = await admin
      .from('profiles')
      .select('onboarding_steps, premium_scope, paket_started_at')
      .eq('id', userId)
      .maybeSingle()

    const redan = new Set(sparadeNycklar(profil?.onboarding_steps))
    if (redan.has(key)) return

    const { error } = await admin.rpc('komigang_markera', { p_user: userId, p_key: key })
    if (error) {
      console.error(`[komigang] kunde inte markera ${key}:`, error.message)
      return
    }

    // Mätningen. Paketet är det köpta scopet, null på gratisnivån; listan
    // per paket ger brickans index och avgör när allt är provat.
    const paket: Paket = arPaket(profil?.premium_scope) ? profil.premium_scope : null
    const lista = listaFor(paket)
    const index = lista.indexOf(key)
    const timmar = timmarSedan(profil?.paket_started_at ?? null)
    const gemensamt = {
      paket,
      ...(timmar !== null ? { hours_since_purchase: timmar } : {}),
    }

    captureServer('onboarding_step_completed', userId, {
      ...gemensamt,
      step: key,
      index: index >= 0 ? index : lista.length,
    })

    redan.add(key)
    if (lista.every((k) => redan.has(k))) {
      captureServer('onboarding_completed', userId, gemensamt)
    }
  } catch (error: any) {
    console.error(`[komigang] markera ${key} kastade:`, error?.message)
  }
}

/**
 * Testsessionens test_type till brickor. Grundnivån i verbalt och numeriskt
 * bär varsin delnyckel, och brickan "Verbalt och numeriskt, grundnivå"
 * räknas som provad när båda finns (harledProvade).
 */
export function brickorForTestType(testType: string | null | undefined): Array<BrickaKey | 'verbalt_grund' | 'numeriskt_grund'> {
  const t = testType ?? 'matrislogik'
  if (t.endsWith('-prov')) return ['provlage']
  if (t === 'matrislogik') return ['matris_grund']
  if (t === 'matrislogik-avancerad' || t === 'matrislogik-expert') return ['matris_avancerad']
  if (t === 'verbal-resonemang') return ['verbalt_grund']
  if (t === 'numerical-reasoning') return ['numeriskt_grund']
  if (t.startsWith('personlighet')) return ['personlighet']
  // Avancerad och expert i verbalt och numeriskt är inte egna brickor.
  return []
}

/** Kvittera ett slutfört test. Anropas från complete-rutterna. */
export async function markeraTestBricka(userId: string, testType: string | null | undefined): Promise<void> {
  for (const key of brickorForTestType(testType)) {
    await markeraBricka(userId, key as BrickaKey)
  }
}

/** Underlaget harledProvade räknar på. Allt är antal eller flaggor. */
export interface ProvadeUnderlag {
  /** Nycklarna i profiles.onboarding_steps. */
  sparade: readonly string[]
  goalRole: string | null | undefined
  location: string | null | undefined
  cvCount: number
  analysisCompleted: number
  matchCount: number
  templateDownloads: number
  letterCount: number
  linkedinCount: number
  /** candidate_profiles.visibility, null utan rad. */
  visibility: string | null
  conversationCount: number
  /** test_type för slutförda sessioner i logic_test_v4_sessions. */
  testTypes: readonly (string | null)[]
  personalityCompleted: number
  /** Intervjuprov skrivna inloggad (anon_interview_samples.user_id). Valfritt för äldre anropare. */
  intervjuprovCount?: number
}

/** Vilka brickor som är provade, oavsett paket. Listan filtreras sedan per paket. */
export function harledProvade(u: ProvadeUnderlag): BrickaKey[] {
  const provade = new Set<string>(u.sparade)

  if ((u.goalRole ?? '').trim() && (u.location ?? '').trim()) provade.add('profil')
  if (u.cvCount > 0) provade.add('cv_upp')
  if (u.analysisCompleted > 0) {
    provade.add('analys')
    provade.add('analys_gratis')
  }
  if (u.analysisCompleted >= 2) provade.add('uppdatera_cv')
  if (u.matchCount > 0) provade.add('jobbmatchning')
  if (u.templateDownloads > 0) provade.add('mall')
  if (u.letterCount > 0) provade.add('brev')
  if (u.linkedinCount > 0) provade.add('linkedin')
  if (u.visibility && u.visibility !== 'off') provade.add('bli_upptackt')
  if (u.conversationCount > 0) provade.add('coach')
  if (u.personalityCompleted > 0) provade.add('personlighet')
  if ((u.intervjuprovCount ?? 0) > 0) provade.add('intervjuprov')

  for (const t of u.testTypes) {
    for (const key of brickorForTestType(t)) provade.add(key)
  }
  if (provade.has('verbalt_grund') && provade.has('numeriskt_grund')) {
    provade.add('verbalt_numeriskt_grund')
  }

  const KEYS: readonly BrickaKey[] = [
    'profil',
    'cv_upp',
    'analys',
    'analys_gratis',
    'uppdatera_cv',
    'jobbmatchning',
    'mall',
    'brev',
    'linkedin',
    'bli_upptackt',
    'coach',
    'matris_grund',
    'matris_avancerad',
    'verbalt_numeriskt_grund',
    'provlage',
    'personlighet',
    'intervjuprov',
    'kurva',
  ]
  return KEYS.filter((k) => provade.has(k))
}

/** Nycklarna i en onboarding_steps-kolumn, tålig mot null och skräp. */
export function sparadeNycklar(raw: unknown): string[] {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return []
  return Object.keys(raw as Record<string, unknown>)
}

/**
 * Hela underlaget ur databasen, för mejlen och andra ställen som inte har
 * hemskärmens summering till hands. Nio frågor parallellt via service role.
 */
export async function hamtaProvadeUnderlag(admin: any, userId: string): Promise<ProvadeUnderlag> {
  const [
    profileRes,
    cvRes,
    analysisRes,
    matchRes,
    downloadRes,
    letterRes,
    linkedinRes,
    candidateRes,
    convRes,
    testRes,
    personalityRes,
    intervjuRes,
  ] = await Promise.all([
    admin.from('profiles').select('onboarding_steps, goal_role, location').eq('id', userId).maybeSingle(),
    admin.from('cv_texts').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    admin
      .from('cv_analysis_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed'),
    admin.from('job_matchings_cache').select('user_id', { count: 'exact', head: true }).eq('user_id', userId),
    admin.from('formatted_cv_downloads').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    admin.from('letters').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    admin.from('linkedin_optimizations').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    admin.from('candidate_profiles').select('visibility').eq('user_id', userId).maybeSingle(),
    admin.from('ai_conversations').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    admin
      .from('logic_test_v4_sessions')
      .select('test_type')
      .eq('user_id', userId)
      .not('completed_at', 'is', null),
    admin
      .from('personality_test_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('completed_at', 'is', null),
    admin.from('anon_interview_samples').select('token', { count: 'exact', head: true }).eq('user_id', userId),
  ])

  const profil = (profileRes?.data ?? null) as Record<string, unknown> | null

  return {
    sparade: sparadeNycklar(profil?.onboarding_steps),
    goalRole: (profil?.goal_role as string | null) ?? null,
    location: (profil?.location as string | null) ?? null,
    cvCount: cvRes?.count ?? 0,
    analysisCompleted: analysisRes?.count ?? 0,
    matchCount: matchRes?.count ?? 0,
    templateDownloads: downloadRes?.count ?? 0,
    letterCount: letterRes?.count ?? 0,
    linkedinCount: linkedinRes?.count ?? 0,
    visibility: (candidateRes?.data?.visibility as string | null) ?? null,
    conversationCount: convRes?.count ?? 0,
    testTypes: ((testRes?.data ?? []) as Array<{ test_type: string | null }>).map((r) => r.test_type),
    personalityCompleted: personalityRes?.count ?? 0,
    intervjuprovCount: intervjuRes?.count ?? 0,
  }
}
