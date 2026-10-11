/**
 * Blockeringar per feature de senaste sju dygnen
 * (docs/plan-paket-och-onboarding.md, Fas 2D avsnitt 3).
 *
 * Dirigentens beslut: D28 och blockeringslistan räknas ur samma källa, och
 * panelens tal är summan av listan. Därför en enda funktion som båda läser,
 * i stället för två räkningar som kan säga emot varandra.
 *
 * Källan är user_activities med activity_type 'quota_wall_hit', som
 * signalQuotaWall skriver direkt före varje 429. Den ligger redan i
 * databasen, går att läsa på servern och har samma sjudygnsfönster som
 * planen ber om. PostHogs feature_blocked är samma händelse men bara i
 * PostHog, och en prenumerationssida får inte hämta sin lista över ett
 * analysbibliotek: den vore både långsam och borta när skriptet blockeras.
 *
 * Fotnot om namnen: kvotrutterna skickar sina egna strängar ('cv_analysis',
 * 'letter_generation', 'test:...'), inte featurenamnen i features.ts. Kartan
 * nedan översätter dem. Skriver B2 om anropen till featurenamn faller
 * översättningen bort av sig själv, eftersom kartan släpper igenom ett
 * featurenamn oförändrat.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

import { ALLA_FEATURES, FEATURES, type Feature, type Scope } from '@/lib/access/features'
import { SALD_PLAN, type PlanKey } from '@/lib/plans/plans'

/** Kvotrutternas strängar till featurenamn. */
const GAMLA_NAMN: Record<string, Feature> = {
  cv_analysis: 'cv_analysis_full',
  cv_export: 'cv_export',
  letter_generation: 'letter_download',
  letter_download: 'letter_download',
  chat_message: 'chat_unlimited',
  job_match: 'job_matches_all',
}

function tillFeature(ratt: unknown): Feature | null {
  if (typeof ratt !== 'string') return null
  if ((ALLA_FEATURES as readonly string[]).includes(ratt)) return ratt as Feature
  if (ratt.startsWith('test:')) return 'tests_above_base'
  return GAMLA_NAMN[ratt] ?? null
}

export interface Blockering {
  feature: Feature
  antal: number
}

export interface Blockeringar {
  /** Mest frekvent först. Anroparen skär listan till tre rader. */
  rader: Blockering[]
  /** Summan av listan. Panelens tal, aldrig en egen räkning. */
  totalt: number
  /** Spänner blockeringarna båda spåren? Styr förslagets skäl (forslagSkal). */
  badaSparen: boolean
}

const TOM: Blockeringar = { rader: [], totalt: 0, badaSparen: false }

/** Sju dygn bakåt, samma fönster som recordQuotaWall räknar i. */
const SJU_DYGN = 7 * 24 * 60 * 60 * 1000

/**
 * Läser blockeringarna för en användare. Kastar aldrig: en tom lista är ett
 * giltigt svar, och sidan ska rita rätt även när tabellen inte svarar.
 *
 * @param bara Begränsa till features utanför det här scopet. Används i
 *   tillstånd spår, där bara det hon inte kommer åt är intressant.
 */
export async function lasBlockeringar(
  supabase: SupabaseClient<any, any, any>,
  userId: string,
  bara?: { utanforScope: Scope }
): Promise<Blockeringar> {
  try {
    const fran = new Date(Date.now() - SJU_DYGN).toISOString()

    const { data, error } = await supabase
      .from('user_activities')
      .select('metadata')
      .eq('user_id', userId)
      .eq('activity_type', 'quota_wall_hit')
      .gte('created_at', fran)
      .limit(500)

    if (error || !data) return TOM

    const rakning = new Map<Feature, number>()

    for (const rad of data as { metadata?: { feature?: unknown } | null }[]) {
      const feature = tillFeature(rad?.metadata?.feature)
      if (!feature) continue

      // I tillstånd spår räknas bara det hon faktiskt saknar. En blockering
      // på något hon redan betalat för är en kvot, inte ett paketproblem.
      if (bara && FEATURES[feature].includes(bara.utanforScope)) continue

      rakning.set(feature, (rakning.get(feature) ?? 0) + 1)
    }

    const rader = [...rakning.entries()]
      .map(([feature, antal]) => ({ feature, antal }))
      .sort((a, b) => b.antal - a.antal || a.feature.localeCompare(b.feature))

    const totalt = rader.reduce((summa, rad) => summa + rad.antal, 0)

    const harCv = rader.some((r) => FEATURES[r.feature].includes('cv'))
    const harTester = rader.some((r) => FEATURES[r.feature].includes('tester'))

    return { rader, totalt, badaSparen: harCv && harTester }
  } catch {
    return TOM
  }
}

/**
 * Paketet sidan föreslår (D28). Bara Jobbcoach Premium säljs (spec-rummen
 * 17.3), så förslaget är alltid all_month. Blockeringarna och spåret styr
 * inte längre vilket paket som föreslås, bara vad förslagets skäl säger
 * (forslagSkal i paket-copy.ts: "Du har stoppats både på CV-sidan och i
 * testerna. Premium öppnar båda.").
 *
 * Signaturen står kvar så att anroparna inte behöver ändras. Ren funktion.
 */
export function foreslaPaket(
  _blockeringar?: Blockeringar,
  _track?: Scope | null
): PlanKey {
  return SALD_PLAN
}
