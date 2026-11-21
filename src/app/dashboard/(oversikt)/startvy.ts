/**
 * Vilken startvy Översikt (/dashboard) visar. Reglerna är dagens, flyttade ur
 * DashboardHem när Jobbsöket ritades om (omgång 1, etapp 2A); bara utseendet
 * är nytt.
 *
 *   A  inget CV          B  CV men inget brev          C  aktiv
 *
 * Träningsfokus (ägarens beslut 2026-09-24): i A, med Träningspaketet
 * (scope tester), eller på gratisnivån när valet i registreringen var
 * testerna eller intervjun, visas träningens nästa steg i stället för
 * CV-uppladdningen. ?cv=1 (textlänken) visar A som vanligt.
 *
 * Valet i registreringen läses bara här (villkor.test.tsx, kriterium 14).
 * Klientsäker och ren.
 */
import type { SignupIntent } from '@/components/registrering/intent'

export type DashboardState = 'A' | 'B' | 'C'

export function deriveDashboardState(cvCount: number, totalLetters: number): DashboardState {
  if (cvCount === 0) return 'A'
  if (totalLetters === 0) return 'B'
  return 'C'
}

export interface StartvyIndata {
  cvCount: number
  totalLetters: number
  /** Betalt spår, null på gratisnivån. */
  scope: string | null | undefined
  /** Valet i registreringen. */
  intent: SignupIntent | null | undefined
  /** ?cv=1 i adressen. */
  visaCv: boolean
}

export interface Startvy {
  state: DashboardState
  /** Valet i registreringen när inget spår är betalt (hemskärmens ordning). */
  valtVidStart: SignupIntent | null
  traningsFokus: boolean
  /** Testet först i träningens nästa steg (valet var testerna). */
  testForst: boolean
}

export function startvy(i: StartvyIndata): Startvy {
  const state = deriveDashboardState(i.cvCount, i.totalLetters)
  const valtVidStart = i.scope ? null : (i.intent ?? null)
  const valtTraning = valtVidStart === 'tester' || valtVidStart === 'intervju'
  const traningsFokus = state === 'A' && (i.scope === 'tester' || (!i.scope && valtTraning)) && !i.visaCv
  return { state, valtVidStart, traningsFokus, testForst: valtVidStart === 'tester' }
}
