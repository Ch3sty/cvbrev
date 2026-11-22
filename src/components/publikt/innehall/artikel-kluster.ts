/**
 * Klustrets färg, etikett och hjälteknapp på artiklarna (spec-publikt-v2
 * del B avsnitt 1 och 3.1). Rumsfärgen följer ämnet: tester indigo, CV teal,
 * brev plommon, intervju, lön, karriär och allmän jobbsökning grön.
 *
 * Knappen läser inline-kortets mål ur reklam-copy.ts, så att hjälten och
 * provkortet pekar på samma verktyg. Testklustret går direkt till provet
 * utan konto. Karriär (räknare eller länkrad) får "Fråga Jobbcoachen" (2026-11-15).
 */

import type { CtaCluster, InlineVerktyg } from '@/lib/cta/clusters'
import { INLINE } from '@/components/artiklar/reklam/reklam-copy'
import { arProvTyp, provAntal } from '@/lib/tests/prov-typer'
import type { RumNamn } from '../telefon/Telefon'

export const PROVA_HREF = '/verktyg/rekryteringstester/prova'

export const KLUSTER_RUM: Record<CtaCluster, RumNamn> = {
  test: 'tran',
  cv: 'cv',
  letter: 'brev',
  interview: 'jobb',
  career: 'jobb',
  // Etiketten är Jobbsökning: skog, som Jobbsöket. Grafiten finns inte publikt längre.
  generic: 'jobb',
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

const ANTAL_ORD: Readonly<Record<number, string>> = { 5: 'fem', 6: 'sex' }

/**
 * Hjältens prov i testklustret (saas-lead och SEO 2026-11-22,
 * docs/artiklar-2026-11/brief-spatial-formaga.md 10.4 och 11.2): provet i
 * artikelns egen typ, läst ur första <ArtikelProv typ>. Matris och artiklar
 * utan prov behåller exakt adressen utan parameter. I-provet har sex uppgifter.
 */
export function provHjalte(provTyp: string | null | undefined): { text: string; href: string } {
  if (!provTyp || !arProvTyp(provTyp) || provTyp === 'matris') {
    return { text: 'Prova fem uppgifter gratis', href: PROVA_HREF }
  }
  return {
    text: `Prova ${ANTAL_ORD[provAntal(provTyp)]} uppgifter gratis`,
    href: `${PROVA_HREF}?typ=${provTyp}`,
  }
}

/** Typen i artikelns första <ArtikelProv typ="...">, eller null. */
export function artikelProvTyp(mdx: string): string | null {
  return mdx.match(/<ArtikelProv\b[^>]*?\btyp="([a-z-]+)"/)?.[1] ?? null
}

export function hjalteKnapp(
  cluster: CtaCluster,
  verktyg: InlineVerktyg,
  provTyp?: string | null
): { text: string; href: string } | null {
  if (cluster === 'test') return provHjalte(provTyp)
  if (verktyg === 'raknare' || verktyg === 'lankrad') return { ...FRAGA_COACHEN }
  // Intervjuklustrets inline-kort är provkortet sedan S6 (2026-11-15), men
  // hjälteknappen står kvar på Jobbcoachen: en ändring i taget.
  const c = INLINE[verktyg === 'test' ? 'coach' : verktyg]
  return { text: c.knapp, href: c.href }
}
