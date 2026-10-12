'use client'

/**
 * Genomgången per text i verbalt resonemang och verbalprovet.
 *
 * Själva genomgången bor sedan tidigare i VerbalResultsBody. Här väljs bara
 * rätt frågeurval för slugen, seedat på sessionId så genomgången visar exakt
 * de texter användaren fick.
 */

import { useMemo } from 'react'
import VerbalResultsBody, {
  type SavedAnswer,
  type ResultsPassage,
} from '@/components/tests/verbal-shared/VerbalResultsBody'
import { selectPassagesForSession as selectGrund } from '@/lib/verbalTestV1/selectPassages.v1'
import { selectPassagesForSession as selectAvancerad } from '@/lib/verbalTestV2/selectPassages.v2'
import { selectProvPassagesForSession } from '@/lib/verbalTestProv/selectProv'
import { selectPassagesForSession as selectExpert } from '@/lib/verbalTestExpert/selectPassages'
import { testPaths } from '@/app/dashboard/tester/testConfig'
import { underlagsVersion, type UnderlagVersion } from '@/lib/tester/underlagVersion'

// Grund och avancerad tar sessionens underlagsversion (src/lib/tester/underlagVersion.ts).
const SELECTORS: Record<string, (id: string, version: UnderlagVersion) => unknown[]> = {
  'verbal-resonemang': (id, v) => selectGrund(id, undefined, v),
  'verbal-resonemang-v2': (id, v) => selectAvancerad(id, undefined, v),
  'verbal-resonemang-prov': (id, v) => selectProvPassagesForSession(id, v),
  'verbal-resonemang-expert': (id, v) => selectExpert(id, undefined, v),
}

export default function VerbalReview({
  slug,
  sessionId,
  answers,
  score,
  timeSpent,
  totalStatements,
  meta,
}: {
  slug: string
  sessionId: string
  /** Sessionens meta, för underlagsversionen. */
  meta?: unknown
  answers: SavedAnswer[]
  score: number
  timeSpent: number
  totalStatements: number
}) {
  const passages = useMemo(() => {
    const select = SELECTORS[slug]
    return select ? (select(sessionId, underlagsVersion(meta)) as ResultsPassage[]) : []
  }, [slug, sessionId, meta])

  if (passages.length === 0) return null

  return (
    <VerbalResultsBody
      bare
      isProv={slug === 'verbal-resonemang-prov'}
      score={score}
      totalStatements={totalStatements}
      timeSpent={timeSpent}
      answers={answers}
      passages={passages}
      restartPath={testPaths.hub(slug)}
    />
  )
}
