/**
 * Testernas tal för de publika sidorna, lästa ur testConfig.ts (spec-publikt-v2
 * del A avsnitt 6). Sidorna och FAQ-svaren skriver aldrig frågor eller
 * minuter som fasta tal, så gamla tal kan inte komma tillbaka.
 */

import { getTestConfig } from '@/app/dashboard/tester/testConfig'
import { ANTAL_PASTAENDEN } from '@/lib/personlighet/smakprov-pastaenden'

function tal(slug: string): { fragor: number; minuter: number; provMinuter: number } {
  const c = getTestConfig(slug)
  if (!c) throw new Error(`testConfig saknar ${slug}`)
  return { fragor: c.totalQuestions, minuter: c.minutes, provMinuter: c.examMinutes ?? c.minutes }
}

export const TESTTAL = {
  matrisGrund: tal('matrislogik-grund'),
  matrisAvancerad: tal('matrislogik-avancerad'),
  matrisExpert: tal('matrislogik-expert'),
  matrisProv: tal('matrislogik-prov'),
  verbalGrund: tal('verbal-resonemang'),
  verbalAvancerad: tal('verbal-resonemang-v2'),
  verbalProv: tal('verbal-resonemang-prov'),
  numeriskGrund: tal('numeriskt-test'),
  numeriskAvancerad: tal('numeriskt-test-v2'),
  numeriskProv: tal('numeriskt-test-prov'),
  personlighetGrund: tal('personlighet-grund'),
  personlighetFordjupad: tal('personlighet-avancerad'),
  /** Personlighetsprovet utan konto. */
  personlighetProv: ANTAL_PASTAENDEN,
} as const

/** Övningsprovens kortaste och längsta tid, "25 till 40 minuter". */
export const PROV_MINUTER = (() => {
  const m = [TESTTAL.matrisProv.provMinuter, TESTTAL.verbalProv.provMinuter, TESTTAL.numeriskProv.provMinuter]
  return { min: Math.min(...m), max: Math.max(...m) }
})()
