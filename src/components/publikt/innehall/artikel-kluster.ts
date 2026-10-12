/**
 * Klustrets färg, etikett och hjälteknapp på artiklarna (spec-publikt-v2
 * del B avsnitt 1 och 3.1). Rumsfärgen följer ämnet: tester indigo, CV teal,
 * brev plommon, intervju, lön och karriär grön, övrigt grafit.
 *
 * Knappen läser inline-kortets mål ur reklam-copy.ts, så att hjälten och
 * provkortet pekar på samma verktyg. Testklustret går direkt till provet
 * utan konto. Karriär utan produkt får ingen knapp, bara "Läs guiden".
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

export function hjalteKnapp(cluster: CtaCluster, verktyg: InlineVerktyg): { text: string; href: string } | null {
  if (cluster === 'test') return { text: 'Prova fem frågor gratis', href: PROVA_HREF }
  if (verktyg === 'raknare' || verktyg === 'lankrad') return null
  const c = INLINE[verktyg]
  return { text: c.knapp, href: c.href }
}
