/**
 * Serverhämtningen bakom en pågående testsession, samma mönster som
 * getHubData.ts i hubben.
 *
 * Förut gjorde provsidan hela sitt arbete efter hydrering: testvyn monterade,
 * visade en spinner bakom `isHydrating`, och fetchade
 * `GET <api>/session?id=<sessionId>`. Den routen gjorde `auth.getUser()`, en
 * rundtur över nätet till Supabase auth, och först därefter sin egen fråga
 * efter raden. Ingenting av provet kunde målas förrän den kedjan var klar, så
 * LCP låg efter HTML plus JS plus fetch plus auth plus query. Mätningen landade
 * på 16 rundturer och 2920 ms.
 *
 * Nu läses raden här, på servern, i samma svar som HTML. `getSession()` läser
 * cookien lokalt i stället för att fråga auth-servern, och RLS plus ett
 * explicit `.eq('user_id', ...)` skyddar raden precis som routens ägarkontroll
 * gjorde.
 *
 * Frågorna byggs också här för matrislogiken: urvalet seedat på sessionId som
 * förut, alternativen i sessionens visade ordning (meta.alternativ_blandade,
 * src/lib/logicTestV7/blanda.ts) och utan facit. Klienten får aldrig
 * frågebanken. Rättningen ligger kvar i answer- och complete-routerna.
 */
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import type { TestConfig } from '../testConfig'
import { matrisInnehall } from '@/lib/logicTestV7/fragor.server'
import type { VisadFraga } from '@/lib/logicTestV7/layered.v7'
import { serieInnehall } from '@/lib/figurserierV1/fragor.server'
import type { VisadSerie } from '@/lib/figurserierV1/types'
import { deduktivInnehall } from '@/lib/deduktivV1/fragor.server'
import type { VisadDeduktiv } from '@/lib/deduktivV1/types'

/**
 * Sessionsrader för matrislogik och proven ligger i logic_test_v4_sessions.
 * Verbala och numeriska test har egna tabeller bakom sitt session-API och kan
 * därför inte läsas direkt här. De faller tillbaka på klientens hämtning,
 * exakt som i dag, tills deras tabeller läggs till.
 */
const TABLE_BY_API: Record<string, string> = {
  '/api/logicTestV4': 'logic_test_v4_sessions',
  '/api/logicTestV6': 'logic_test_v4_sessions',
  '/api/logicTestProv': 'logic_test_v4_sessions',
  '/api/figurserier': 'logic_test_v4_sessions',
  '/api/deduktiv': 'logic_test_v4_sessions',
}

export interface SavedAnswer {
  q_id: string
  /** Originalindex i banken. */
  selected: number
  /** Visat index. Saknas i sessioner från före blandningen (då = selected). */
  visat?: number
}

export interface RunSession {
  id: string
  /** Sparade svar, i samma form som session-routen svarade med. */
  answers: SavedAnswer[]
  /** Satt när provet redan är rättat. Vyn skickar då vidare till resultatet. */
  completedAt: string | null
  score: number | null
  timeSpent: number | null
  /** Matrislogikens frågor i visad ordning, utan facit. */
  fragor?: VisadFraga[]
  /** Figurseriernas uppgifter i visad ordning, utan facit. */
  serie?: VisadSerie[]
  /** Deduktivens uppgifter i visad ordning, utan facit. */
  deduktiv?: VisadDeduktiv[]
}

export interface RunData {
  /**
   * Sessionen, eller null när den inte gick att läsa på servern. null betyder
   * "vet inte", inte "finns inte": testvyn hämtar då själv som förut.
   */
  session: RunSession | null
  /** true när servern faktiskt läst klart, så vyn slipper hämta om. */
  resolved: boolean
}

const UNRESOLVED: RunData = { session: null, resolved: false }

/**
 * Läser sessionsraden för ett pågående test.
 *
 * Går något fel returneras `resolved: false`, och testvyn hämtar som förut.
 * Ett prov får aldrig falla bara för att den här optimeringen missar.
 */
export async function getRunData(
  config: TestConfig,
  sessionId: string
): Promise<RunData> {
  const table = TABLE_BY_API[config.api]
  if (!table) return UNRESOLVED

  try {
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })

    // getSession() läser cookien lokalt. Ingen rundtur till auth-servern.
    const {
      data: { session: authSession },
    } = await supabase.auth.getSession()

    const userId = authSession?.user?.id
    if (!userId) return UNRESOLVED

    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .maybeSingle()

    if (error || !data) return UNRESOLVED

    const row = data as {
      id: string
      answers: unknown
      completed_at: string | null
      score: number | null
      time_spent: number | null
      test_type: string | null
      meta?: unknown
    }

    return {
      session: {
        id: row.id,
        answers: Array.isArray(row.answers) ? (row.answers as SavedAnswer[]) : [],
        completedAt: row.completed_at,
        score: row.score,
        timeSpent: row.time_spent,
        ...(config.kind === 'matris' ? { fragor: matrisInnehall(row).fragor } : {}),
        ...(config.kind === 'figurserie' ? { serie: serieInnehall(row).fragor } : {}),
        ...(config.kind === 'deduktiv' ? { deduktiv: deduktivInnehall(row).fragor } : {}),
      },
      resolved: true,
    }
  } catch (error) {
    console.error('Testkörningen: kunde inte läsa sessionen på servern', error)
    return UNRESOLVED
  }
}
