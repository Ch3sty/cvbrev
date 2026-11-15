/**
 * Klustrets färg, etikett och hjälteknapp på artiklarna (spec-publikt-v2
 * del B avsnitt 1 och 3.1). Rumsfärgen följer ämnet: tester indigo, CV teal,
 * brev plommon, intervju, lön och karriär grön, övrigt grafit.
 *
 * Knappen läser inline-kortets mål ur reklam-copy.ts, så att hjälten och
 * provkortet pekar på samma verktyg. Testklustret går direkt till provet
 * utan konto. Karriär (räknare eller länkrad) får "Fråga Jobbcoachen" (2026-11-15).
 */

import type { CtaCluster, InlineVerktyg } from '@/lib/cta/clusters'
import { INLINE } from '@/components/artiklar/reklam/reklam-copy'
import type { RumNamn } from '../telefon/Telefon'

export const PROVA_HREF = '/verktyg/rekryteringstester/prova'

export const KLUSTER_RUM: Record<CtaCluster, RumNamn> = {
  test: 'tran',
  cv: 'cv',
  letter: 'brev',
  interview: 'jobb',
  career: 'jobb',
  generic: 'neu',
}

export const KLUSTER_ETIKETT: Record<CtaCluster, string> = {
  test: 'Rekryteringstester',
  cv: 'CV',
  letter: 'Personligt brev',
  interview: 'Jobbintervju',
  career: 'Karriär',
  generic: 'Jobbsökning',
}

/**
 * Karriärartiklarna har inget eget verktyg i hjälten, men artikelbilden visar
 * Jobbcoachen ("På bordet", docs/design/koncept-artikelbilder-2026-11-14.md,
 * avsnitt 8 punkt 1; saas-leads förslag). Knappen gör att bilden och sidan
 * säger samma sak. Räknarna står kvar i inline-kortet.
 */
export const FRAGA_COACHEN = { text: 'Fråga Jobbcoachen', href: '/verktyg/jobbcoachen' } as const

export function hjalteKnapp(cluster: CtaCluster, verktyg: InlineVerktyg): { text: string; href: string } | null {
  if (cluster === 'test') return { text: 'Prova fem frågor gratis', href: PROVA_HREF }
  if (verktyg === 'raknare' || verktyg === 'lankrad') return { ...FRAGA_COACHEN }
  const c = INLINE[verktyg]
  return { text: c.knapp, href: c.href }
}
