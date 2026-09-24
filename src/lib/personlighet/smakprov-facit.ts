/**
 * Personlighetsprovets facit: vilken faktor varje påstående mäter och vilka
 * som är omvända (docs/design/rod-trad-prov-2026-09-24.html, "De tjugo
 * påståendena").
 *
 * SERVER ONLY. Importeras aldrig av klientkod: omvändningen är en del av
 * det låsta och lämnar aldrig servern före kontot. Paketet server-only finns
 * inte i beroendena (och vitest kan inte lösa det), så regeln bärs av den
 * här kommentaren och av testet i __tests__/smakprov.test.ts som kontrollerar
 * att ingen fil med 'use client' importerar facit.
 *
 * Typen är motorns PersonalityItem, så computeScores tar posterna direkt.
 * Särbarhet mäts som i motorn (neuroticism) och visas som Stabilitet
 * (100 minus särbarhet) i allt nytt, ägarens beslut 3.
 */

import type { PersonalityItem } from '@/lib/personalityTest/types'
import { computeScores } from '@/lib/personalityTest/scoring'
import type { BigFiveScores } from '@/lib/personalityTest/types'
import { SMAKPROV_PASTAENDEN, type SkalVarde, type SmakprovId } from './smakprov-pastaenden'
import { faktorKonsekvent } from './smakprov-tolkning'

type Facit = Pick<PersonalityItem, 'dimension' | 'reverse'>

const FACIT: Record<SmakprovId, Facit> = {
  's-01': { dimension: 'conscientiousness', reverse: false },
  's-02': { dimension: 'conscientiousness', reverse: true },
  's-03': { dimension: 'conscientiousness', reverse: false },
  's-04': { dimension: 'conscientiousness', reverse: true },
  's-05': { dimension: 'extraversion', reverse: false },
  's-06': { dimension: 'extraversion', reverse: true },
  's-07': { dimension: 'extraversion', reverse: false },
  's-08': { dimension: 'extraversion', reverse: true },
  's-09': { dimension: 'openness', reverse: false },
  's-10': { dimension: 'openness', reverse: true },
  's-11': { dimension: 'openness', reverse: false },
  's-12': { dimension: 'openness', reverse: true },
  's-13': { dimension: 'agreeableness', reverse: false },
  's-14': { dimension: 'agreeableness', reverse: true },
  's-15': { dimension: 'agreeableness', reverse: false },
  's-16': { dimension: 'agreeableness', reverse: true },
  's-17': { dimension: 'neuroticism', reverse: true },
  's-18': { dimension: 'neuroticism', reverse: false },
  's-19': { dimension: 'neuroticism', reverse: false },
  's-20': { dimension: 'neuroticism', reverse: true },
}

export const SMAKPROV_ITEMS: PersonalityItem[] = SMAKPROV_PASTAENDEN.map((p) => ({
  id: p.id,
  text: p.text,
  ...FACIT[p.id],
}))

export interface SmakprovSvar {
  id: SmakprovId
  value: SkalVarde
}

/** Motorns poäng, 0 till 100 per faktor, med omvändningen gjord. */
export function poangForSmakprov(answers: readonly SmakprovSvar[]): BigFiveScores {
  return computeScores(
    SMAKPROV_ITEMS,
    answers.map((a) => ({ questionId: a.id, value: a.value }))
  ).scores
}

/** De tio omvända påståendena, i idordning. Bara för tolkningssidan efter claim. */
export function omvandaIds(): SmakprovId[] {
  return SMAKPROV_ITEMS.filter((i) => i.reverse).map((i) => i.id as SmakprovId)
}

/** Faktorns fyra id: två raka och två omvända. För konsekvensmåttet. */
export function idsForDimension(dimension: PersonalityItem['dimension']): { raka: SmakprovId[]; omvanda: SmakprovId[] } {
  const items = SMAKPROV_ITEMS.filter((i) => i.dimension === dimension)
  return {
    raka: items.filter((i) => !i.reverse).map((i) => i.id as SmakprovId),
    omvanda: items.filter((i) => i.reverse).map((i) => i.id as SmakprovId),
  }
}

/**
 * Konsekvensen, 0 till 5: i hur många faktorer de två raka och de två
 * omvända svaren pekar åt samma håll efter vändningen, med ett stegs
 * tolerans (smakprov-tolkning.ts, faktorKonsekvent).
 */
export function konsekvens(answers: readonly SmakprovSvar[]): number {
  const varde = new Map(answers.map((a) => [a.id, a.value]))
  const dims: PersonalityItem['dimension'][] = [
    'conscientiousness',
    'extraversion',
    'openness',
    'agreeableness',
    'neuroticism',
  ]
  let n = 0
  for (const d of dims) {
    const { raka, omvanda } = idsForDimension(d)
    const r = raka.map((id) => varde.get(id)).filter((v): v is SkalVarde => v !== undefined)
    const o = omvanda.map((id) => varde.get(id)).filter((v): v is SkalVarde => v !== undefined)
    if (faktorKonsekvent(r, o)) n++
  }
  return n
}
