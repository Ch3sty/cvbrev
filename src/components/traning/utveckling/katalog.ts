/**
 * De klassiska testerna i Din utveckling: nio nivåer i tre testtyper. Slug,
 * test_type och frågeantal kommer ur samma källor som hubben
 * (getHubData.COGNITIVE_TEST_TYPE och testConfig), så att talen aldrig
 * spretar mellan flikarna.
 *
 * Ren fil: får importeras från både server och klient.
 */

import type { TestSlug } from '@/hooks/use-all-test-stats'
import { COGNITIVE_TEST_TYPE } from '@/app/dashboard/tester/getHubData'
import { getTestConfig } from '@/app/dashboard/tester/testConfig'

export type Testtyp = 'logik' | 'verbalt' | 'numeriskt'
export type Niva = 'grund' | 'avancerad' | 'expert'

export interface KlassisktTest {
  slug: TestSlug
  typ: Testtyp
  niva: Niva
  /** test_type i logic_test_v4_sessions. */
  testType: string
  /** "Logik, grund" */
  namn: string
  /** Frågor i testet (poängens tak). */
  maxPoang: number
  minuter: number
}

const TYPNAMN: Record<Testtyp, string> = { logik: 'Logik', verbalt: 'Verbalt', numeriskt: 'Numeriskt' }
export const TYPRUBRIK: Record<Testtyp, string> = {
  logik: 'Logiktest',
  verbalt: 'Verbalt test',
  numeriskt: 'Numeriskt test',
}

const RADER: [TestSlug, Testtyp, Niva][] = [
  ['matrislogik-grund', 'logik', 'grund'],
  ['matrislogik-avancerad', 'logik', 'avancerad'],
  ['matrislogik-expert', 'logik', 'expert'],
  ['verbal-resonemang', 'verbalt', 'grund'],
  ['verbal-resonemang-v2', 'verbalt', 'avancerad'],
  ['verbal-resonemang-expert', 'verbalt', 'expert'],
  ['numeriskt-test', 'numeriskt', 'grund'],
  ['numeriskt-test-v2', 'numeriskt', 'avancerad'],
  ['numeriskt-test-expert', 'numeriskt', 'expert'],
]

export const KLASSISKA: readonly KlassisktTest[] = RADER.map(([slug, typ, niva]) => {
  const c = getTestConfig(slug)
  return {
    slug,
    typ,
    niva,
    testType: COGNITIVE_TEST_TYPE[slug],
    namn: `${TYPNAMN[typ]}, ${niva}`,
    maxPoang: c?.totalQuestions ?? 0,
    minuter: c?.minutes ?? 0,
  }
})

export const TESTTYPER: readonly Testtyp[] = ['logik', 'verbalt', 'numeriskt']

export function klassiskt(slug: TestSlug): KlassisktTest {
  return KLASSISKA.find((k) => k.slug === slug)!
}
