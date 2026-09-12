'use client'

/**
 * Genomgången per underlag i numeriskt test och numeriskt prov.
 *
 * Genomgången bor sedan tidigare i NumericalResultsBody. Här väljs rätt
 * frågeurval för slugen, seedat på sessionId, och nedbrytningen per svårighet
 * och frågetyp räknas ur svaren.
 */

import { useMemo } from 'react'
import NumericalResultsBody from '@/components/tests/numerical-shared/NumericalResultsBody'
import {
  getScoreByDifficulty,
  getScoreByType,
} from '@/lib/numericalTest/validator'
import type { Passage, TestAnswer } from '@/lib/numericalTest/types'
import { selectPassagesForSession as selectGrund } from '@/lib/numericalTest/selectPassages'
import { selectPassagesForSession as selectAvancerad } from '@/lib/numericalTestV2/selectPassages'
import { selectPassagesForSession as selectExpert } from '@/lib/numericalTestExpert/selectPassages'
import { selectProvPassagesForSession } from '@/lib/numericalTestProv/selectProv'

const SELECTORS: Record<string, (id: string) => unknown[]> = {
  'numeriskt-test': selectGrund,
  'numeriskt-test-v2': selectAvancerad,
  'numeriskt-test-expert': selectExpert,
  'numeriskt-test-prov': selectProvPassagesForSession,
}

export default function NumericalReview({
  slug,
  sessionId,
  answers,
}: {
  slug: string
  sessionId: string
  answers: TestAnswer[]
}) {
  const passages = useMemo(() => {
    const select = SELECTORS[slug]
    return select ? (select(sessionId) as Passage[]) : []
  }, [slug, sessionId])

  if (passages.length === 0) return null

  return (
    <NumericalResultsBody
      passages={passages}
      answers={answers}
      byDifficulty={getScoreByDifficulty(answers)}
      byType={getScoreByType(answers)}
      showExplanations={slug !== 'numeriskt-test-prov'}
    />
  )
}
