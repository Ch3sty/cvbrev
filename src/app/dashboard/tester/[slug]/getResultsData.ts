/**
 * Serverhämtningen bakom en resultatsida, samma mönster som getHubData.ts.
 *
 * Alla kognitiva test och prov lagras i logic_test_v4_sessions och skiljer
 * sig bara på test_type, så alla läses här i en parallell omgång, i samma
 * svar som HTML: sessionsraden och användarens bästa poäng på samma test.
 * Sessionen läses med getSession() (cookien lokalt, ingen rundtur till
 * auth) och raderna skyddas av RLS plus explicit user_id-filter.
 *
 * Tester-lyftet (skiss Provbladet, avsnitt 3): resultatsidan visar resultat,
 * inte jämförelse. Percentilen bor i Din utveckling och läses inte här, och
 * bryggan till CV:t är borta ur resultatet. I stället räknas genomgångens
 * missar, "Var du tappade" och tempot här (src/lib/tester/resultat.ts), så
 * frågebankerna aldrig behöver ligga i klientpaketet för första vyn.
 *
 * VIKTIGT: ingen rättning ändras. Poängen läses som den står i raden,
 * skriven av complete-routen, och rätt eller fel per fråga läses ur svaren.
 * Matrislogikens genomgång byggs med samma urval och samma visade ordning
 * som testvyn fick, plus var rätt svar stod.
 */
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import type { TestConfig } from '../testConfig'
import { matrisInnehall } from '@/lib/logicTestV7/fragor.server'
import type { GenomgangsFraga } from '@/lib/logicTestV7/layered.v7'
import { familjNamn } from '@/lib/logicTestV7/familjer'
import { analysera, budgetPerFraga, fragorMatris, svarslista, type ResultatAnalys } from '@/lib/tester/resultat'
import { fragorForUnderlag } from '@/lib/tester/underlag.server'
import { testTypeForSlug } from '@/lib/tester/testTyp'
import { serieInnehall } from '@/lib/figurserierV1/fragor.server'
import { serieFamiljNamn } from '@/lib/figurserierV1/familjer'
import type { GenomgangSerie } from '@/lib/figurserierV1/types'
import { deduktivInnehall } from '@/lib/deduktivV1/fragor.server'
import { deduktivFamiljNamn } from '@/lib/deduktivV1/familjer'
import type { GenomgangDeduktiv } from '@/lib/deduktivV1/types'

export interface ResultsSession {
  id: string
  score: number | null
  timeSpent: number | null
  completedAt: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  answers: any[]
  /**
   * Matrislogikens genomgång: frågorna i den ordning hon såg dem och var
   * rätt svar stod. Null för andra testtyper och för ej avslutade sessioner.
   */
  genomgang?: GenomgangsFraga[] | null
  /** Figurseriernas genomgång: uppgifterna i visad ordning, rätt svar, regel och misstag. */
  serie?: GenomgangSerie[] | null
  /** Deduktivens genomgång: uppgifterna i visad ordning, rätt svar, lösningsgång och misstag. */
  deduktiv?: GenomgangDeduktiv[] | null
  /** Sessionens meta (antal, underlagsversion, bankversion). */
  meta?: unknown
}

export interface ResultsData {
  /** null betyder "kunde inte läsas på servern", klienten hämtar då som förut. */
  session: ResultsSession | null
  /** true när servern läst klart, så klienten slipper hämta om. */
  resolved: boolean
  /** Missar, grupper och tempo. null när sessionen inte gick att läsa. */
  analys: ResultatAnalys | null
  /** Direkt efter testet (tio minuter): resultatet tonar in i fyra steg. */
  nyss: boolean
  /** Användarens bästa poäng på samma test, den här sessionen inräknad. */
  bastaPoang: number | null
  /** För loggningen test_completed. null när sessionen inte gick att läsa. */
  userId: string | null
  /** Har hon ett CV? Styr statusradens steg vidare. null när okänt. */
  hasCv: boolean | null
}

const UNRESOLVED: ResultsData = {
  session: null,
  resolved: false,
  analys: null,
  bastaPoang: null,
  nyss: false,
  userId: null,
  hasCv: null,
}

/** Provets tid per fråga för testet: provtiden om den finns. */
export function budgetFor(config: TestConfig): number {
  return budgetPerFraga(config.examMinutes ?? config.minutes, config.totalQuestions)
}

/**
 * Bygger analysen ur en sessionsrad för matrislogiken.
 */
export function analysForMatris(
  config: TestConfig,
  genomgang: GenomgangsFraga[] | null | undefined,
  answers: unknown
): ResultatAnalys {
  return analysera(fragorMatris(genomgang ?? [], answers, familjNamn), budgetFor(config))
}

/** Bara missarna behöver sin text i klienten; övriga skickas utan. */
function bantad(a: ResultatAnalys): ResultatAnalys {
  const miss = new Set(a.missar)
  return {
    ...a,
    fragor: a.fragor.map((f) => (miss.has(f.nr) ? f : { ...f, text: undefined, kalla: undefined })),
  }
}

/**
 * Allt resultatsidan behöver, i en parallell omgång. Ingen kvot räknas och
 * ingen premiumgate fattas här.
 */
export async function getResultsData(
  config: TestConfig,
  sessionId: string
): Promise<ResultsData> {
  if (config.kind === 'personlighet') return UNRESOLVED

  try {
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })

    // Cookien läses lokalt. Ingen rundtur till auth-servern.
    const {
      data: { session: authSession },
    } = await supabase.auth.getSession()

    const userId = authSession?.user?.id
    if (!userId) return UNRESOLVED

    const testType = testTypeForSlug(config)

    const [sessionRes, bastRes, cvRes] = await Promise.all([
      supabase
        .from('logic_test_v4_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .maybeSingle(),
      testType
        ? supabase
            .from('logic_test_v4_sessions')
            .select('score')
            .eq('user_id', userId)
            .eq('test_type', testType)
            .not('completed_at', 'is', null)
            .not('score', 'is', null)
            .order('score', { ascending: false })
            .limit(1)
        : Promise.resolve({ data: null }),
      // Statusradens steg vidare till CV:t (art-director 2026-10-11, beslut 1).
      Promise.resolve(supabase.from('cv_texts').select('id', { count: 'exact', head: true }).eq('user_id', userId)).catch(
        () => ({ count: null, error: true })
      ),
    ])

    if (sessionRes.error || !sessionRes.data) return UNRESOLVED

    const row = sessionRes.data as {
      id: string
      score: number | null
      time_spent: number | null
      completed_at: string | null
      answers: unknown
      test_type: string | null
      meta?: unknown
    }

    const genomgang = config.kind === 'matris' ? matrisInnehall(row).genomgang : null
    const serie = config.kind === 'figurserie' ? serieInnehall(row).genomgang : null
    const deduktiv = config.kind === 'deduktiv' ? deduktivInnehall(row).genomgang : null

    const session: ResultsSession = {
      id: row.id,
      score: row.score,
      timeSpent: row.time_spent,
      completedAt: row.completed_at,
      // Äldre testdata kan ha answers som objekt ({"_mock": true}).
      answers: svarslista(row.answers),
      genomgang,
      serie,
      deduktiv,
      meta: row.meta,
    }

    const analys =
      config.kind === 'matris'
        ? analysForMatris(config, genomgang, row.answers)
        : config.kind === 'figurserie'
        ? analysera(fragorMatris(serie ?? [], row.answers, serieFamiljNamn), budgetFor(config))
        : config.kind === 'deduktiv'
        ? analysera(fragorMatris(deduktiv ?? [], row.answers, deduktivFamiljNamn), budgetFor(config))
        : analysera(fragorForUnderlag(config.slug, row.id, row.answers, row.meta), budgetFor(config))

    const bastRad = (bastRes.data as { score: number | null }[] | null)?.[0]
    const bastaPoang = Math.max(bastRad?.score ?? 0, row.score ?? 0) || null

    const nyss = !!row.completed_at && Date.now() - new Date(row.completed_at).getTime() < 10 * 60_000

    const cv = cvRes as { count: number | null; error: unknown }
    const hasCv = cv.error || cv.count === null ? null : cv.count > 0

    return { session, resolved: true, analys: bantad(analys), bastaPoang, nyss, userId, hasCv }
  } catch (error) {
    console.error('Resultatsidan: kunde inte hämta resultatet på servern', error)
    return UNRESOLVED
  }
}
