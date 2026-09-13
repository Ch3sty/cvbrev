'use client'

/**
 * TestRunner: väljer rätt testvy för en slug.
 *
 * Själva testkörningen bor redan i delade komponenter per testtyp
 * (MatrixTestSession, NumericalTestSession, VerbalTestSession). Det som
 * saknades var en enda plats som vet vilken vy en slug ska ha, och vilka
 * endpoints och frågeurval den ska få. Den platsen är den här filen, matad
 * ur testConfig.
 *
 * De testvyer som inte passar mallen (proven och verbal expert har egna
 * format) laddas dynamiskt, så deras kod inte följer med i paketet för de
 * test som inte behöver den.
 */

import dynamic from 'next/dynamic'
import { MatrixTestSession } from '@/components/tests/matrix/MatrixTestSession'
import { NumericalTestSession } from '@/components/tests/numerical/NumericalTestSession'
import { VerbalTestSession } from '@/components/tests/verbal/VerbalTestSession'
import type { VerbalSessionPassage } from '@/components/tests/verbal/VerbalTestSession'
import type { Passage as NumericalPassage } from '@/lib/numericalTest/types'
import type { LayeredQuestion } from '@/lib/logicTestV7/layered.v7'

import {
  selectQuestionsForSession,
  selectAvanceradQuestionsForSession,
  selectExpertQuestionsForSession,
} from '@/lib/logicTestV7/selectQuestions.v7'
import { selectPassagesForSession as selectNumericalGrund } from '@/lib/numericalTest/selectPassages'
import { selectPassagesForSession as selectNumericalAvancerad } from '@/lib/numericalTestV2/selectPassages'
import { selectPassagesForSession as selectNumericalExpert } from '@/lib/numericalTestExpert/selectPassages'
import { selectPassagesForSession as selectVerbalGrund } from '@/lib/verbalTestV1/selectPassages.v1'
import { selectPassagesForSession as selectVerbalAvancerad } from '@/lib/verbalTestV2/selectPassages.v2'

import { testPaths, type TestConfig } from '@/app/dashboard/tester/testConfig'
import type { RunData } from '@/app/dashboard/tester/[slug]/getRunData'

const TestLoading = () => (
  <div className="flex min-h-[50dvh] items-center justify-center">
    <p className="text-sm text-ink-2">Testet laddas</p>
  </div>
)

/* De egna testvyerna. Laddas bara när sin slug faktiskt körs. */
const MatrisProvSession = dynamic(
  () => import('@/components/tests/prov/MatrisProvSession'),
  { loading: TestLoading }
)
const NumeriskProvSession = dynamic(
  () => import('@/components/tests/prov/NumeriskProvSession'),
  { loading: TestLoading }
)
const VerbalProvSession = dynamic(
  () => import('@/components/tests/prov/VerbalProvSession'),
  { loading: TestLoading }
)
const VerbalExpertSession = dynamic(
  () => import('@/components/tests/verbal/VerbalExpertSession'),
  { loading: TestLoading }
)

/* Modulskopade urvalsfunktioner: stabil referens för vyernas memo. */
const MATRIX_SELECT: Record<string, (id: string) => LayeredQuestion[]> = {
  'matrislogik-grund': selectQuestionsForSession,
  'matrislogik-avancerad': selectAvanceradQuestionsForSession,
  'matrislogik-expert': selectExpertQuestionsForSession,
}

// V2- och expertpassager har samma fältstruktur som V1, så casten är säker.
const numericalAvancerad = (id: string) =>
  selectNumericalAvancerad(id) as unknown as NumericalPassage[]
const numericalExpert = (id: string) =>
  selectNumericalExpert(id) as unknown as NumericalPassage[]

const NUMERICAL_SELECT: Record<string, (id: string) => NumericalPassage[]> = {
  'numeriskt-test': selectNumericalGrund,
  'numeriskt-test-v2': numericalAvancerad,
  'numeriskt-test-expert': numericalExpert,
}

const verbalGrund = (id: string) =>
  selectVerbalGrund(id) as unknown as VerbalSessionPassage[]
const verbalAvancerad = (id: string) =>
  selectVerbalAvancerad(id) as unknown as VerbalSessionPassage[]

const VERBAL_SELECT: Record<string, (id: string) => VerbalSessionPassage[]> = {
  'verbal-resonemang': verbalGrund,
  'verbal-resonemang-v2': verbalAvancerad,
}

export default function TestRunner({
  config,
  sessionId,
  runData,
}: {
  config: TestConfig
  sessionId: string
  /**
   * Sessionsraden, redan läst på servern. `resolved: false` betyder att
   * servern inte kunde läsa den, och då hämtar testvyn själv precis som förut.
   * Skickas bara vidare till de vyer som kan ta emot den. Övriga vyer beter
   * sig exakt som i dag.
   */
  runData?: RunData
}) {
  const resultsPath = (id: string) => testPaths.results(config.slug, id)
  const endpoints = {
    answerEndpoint: `${config.api}/answer`,
    completeEndpoint: `${config.api}/complete`,
    sessionEndpoint: `${config.api}/session`,
  }

  // Proven har egna format och egna vyer.
  if (config.level === 'prov') {
    if (config.kind === 'matris') {
      return <MatrisProvSession sessionId={sessionId} />
    }
    if (config.kind === 'numerisk') {
      return <NumeriskProvSession sessionId={sessionId} />
    }
    return <VerbalProvSession sessionId={sessionId} />
  }

  // Verbal expert prövar argument, inte påståenden, och har en egen vy.
  if (config.slug === 'verbal-resonemang-expert') {
    return <VerbalExpertSession sessionId={sessionId} />
  }

  if (config.kind === 'matris') {
    return (
      <MatrixTestSession
        sessionId={sessionId}
        level={config.level as 'grund' | 'avancerad' | 'expert'}
        selectQuestions={MATRIX_SELECT[config.slug]}
        resultsPath={resultsPath}
        initialRun={runData}
        {...endpoints}
      />
    )
  }

  if (config.kind === 'numerisk') {
    return (
      <NumericalTestSession
        sessionId={sessionId}
        level={config.level as 'grund' | 'avancerad' | 'expert'}
        selectPassages={NUMERICAL_SELECT[config.slug]}
        resultsPath={resultsPath}
        {...endpoints}
      />
    )
  }

  return (
    <VerbalTestSession
      sessionId={sessionId}
      level={config.level as 'grund' | 'avancerad'}
      selectPassages={VERBAL_SELECT[config.slug]}
      resultsPath={resultsPath}
      {...endpoints}
    />
  )
}
