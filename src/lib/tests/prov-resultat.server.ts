/**
 * Provets resultat före kontot (skissen docs/design/skiss-prov-konto-2026-11-09.html,
 * ägarens beslut 2026-11-09). Kontosteget efter provet visar antal rätt, fem
 * brickor och vilken fråga som blev fel. Det här serveranropet ger exakt det
 * och inget mer:
 *
 *   { ratt, totalt, fel }   fel = positionerna 0 till 4 som blev fel
 *
 * Anropet görs av /register på servern när adressen har ?test=<token>, så
 * panelen står i första bilden (ingen laddning, inget layoutskifte) och det
 * finns ingen öppen API-route att fråga.
 *
 * Säkerhet:
 *  - Token-bundet. Token är en slumpad uuid (arProvToken) som bara finns i
 *    besökarens adress och flik.
 *  - Inga andras prov: ett prov som hämtats till ett konto, gått ut eller
 *    saknar svar ger null, och sidan visar då panelen utan resultat. Fallen
 *    går inte att skilja på utifrån.
 *  - Facit, valda alternativ, rätt alternativ, frågorna och reglerna lämnar
 *    aldrig servern här.
 *  - Rate limit per IP-hash och dygn, som övriga publika anrop
 *    (checkIpRateLimit, egen räknare). Över gränsen blir det null.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { checkIpRateLimit } from '@/lib/rate-limit/ip'
import { felIndex, getAnonSession, provSeed, questionsForToken } from '@/lib/tests/anon-session'
import { arProvToken } from '@/lib/tests/prov-rad'
import { bankVersion } from '@/lib/logicTestV7/selectQuestions.v7'
import { arNyProvTyp, type ProvTyp } from '@/lib/tests/prov-typer'
import { felPositioner, lasRefs, lasSvar } from '@/lib/tests/prov-typer.server'

/** Kontosteget laddas om några gånger per prov; 30 per dygn räcker gott. */
export const PROV_RESULTAT_IP_LIMIT = 30
export const PROV_RESULTAT_SCOPE = 'anon_test_resultat'

export interface ProvResultat {
  ratt: number
  totalt: number
  fel: number[]
  /** Provets typ (matris som förut, eller en av de nya typerna). */
  typ?: ProvTyp
}

export async function hamtaProvResultat(
  admin: SupabaseClient<any>,
  token: unknown,
  ip: string
): Promise<ProvResultat | null> {
  if (!arProvToken(token)) return null
  try {
    // Räknaren och provet läses samtidigt (sidans svarstid), men provet
    // används bara om räknaren släpper igenom.
    const [rate, session] = await Promise.all([
      checkIpRateLimit(admin, ip, PROV_RESULTAT_SCOPE, PROV_RESULTAT_IP_LIMIT),
      getAnonSession(admin, token),
    ])
    if (!rate.allowed) return null

    if (!session || session.claimed_by || !Array.isArray(session.answers) || session.score === null) {
      return null
    }

    const testKind = (session as { test_kind?: unknown }).test_kind
    if (arNyProvTyp(testKind)) {
      const refs = lasRefs(session.questions)
      if (!refs) return null
      const fel = felPositioner(lasSvar(session.answers), refs.length)
      return { ratt: refs.length - fel.length, totalt: refs.length, fel, typ: testKind }
    }

    const fragor = questionsForToken(provSeed(session), bankVersion(session.meta))
    const fel = felIndex(fragor, session.answers)
    return { ratt: fragor.length - fel.length, totalt: fragor.length, fel }
  } catch (err) {
    console.error('[prov-resultat] Kunde inte läsa provet:', err)
    return null
  }
}
