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
import { underlagsVersion, type UnderlagVersion } from '@/lib/tester/underlagVersion'

// Grund och avancerad tar sessionens underlagsversion (src/lib/tester/underlagVersion.ts).
const SELECTORS: Record<string, (id: string, version: UnderlagVersion) => unknown[]> = {
  'numeriskt-test': (id, v) => selectGrund(id, undefined, v),
  'numeriskt-test-v2': (id, v) => selectAvancerad(id, undefined, v),
  'numeriskt-test-expert': (id) => selectExpert(id),
  'numeriskt-test-prov': (id, v) => selectProvPassagesForSession(id, v),
}

export default function NumericalReview({
  slug,
  sessionId,
  answers,
  meta,
}: {
  slug: string
  sessionId: string
  answers: TestAnswer[]
  /** Sessionens meta, för underlagsversionen. */
  meta?: unknown
}) {
  const passages = useMemo(() => {
    const select = SELECTORS[slug]
    return select ? (select(sessionId, underlagsVersion(meta)) as Passage[]) : []
  }, [slug, sessionId, meta])

  if (passages.length === 0) return null

  return (
    <NumericalResultsBody
      passages={passages}
      answers={answers}
      byDifficulty={getScoreByDifficulty(answers)}
      byType={getScoreByType(answers)}
      showExplanations={slug !== 'numeriskt-test-prov'}
      utanRubrik
    />
  )
}
