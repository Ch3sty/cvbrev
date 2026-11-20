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
// Statisk import, som matrisen: en dynamisk import la uppgiften bakom en
// Suspense-gräns och flyttade LCP efter JS-chunken (perf-inloggat 2026-10-12).
import FigurserieNivatest from '@/components/session/figurserie/FigurserieNivatest'
import { DeduktivTestSession } from '@/components/tests/deduktiv/DeduktivTestSession'
import { Steg2TestSession } from '@/components/tests/steg2/Steg2TestSession'
// Sessionsramen (plan-testflode-2026-11-20, etapp 2): ord och text, siffror
// och tabeller får uppgifterna från servern, så bankerna och urvalet lämnar
// klientpaketet. VerbalTestSession, VerbalExpertSession och
// NumericalTestSession står kvar oanvända till etapp 5.
import VnNivatest from '@/components/session/vn/VnNivatest'

import { arSteg2Kind, testPaths, type TestConfig } from '@/app/dashboard/tester/testConfig'
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

/*
  Modulskopade urvalsfunktioner: stabil referens för vyernas memo.

  Matrislogiken har inget urval här: frågorna byggs på servern (getRunData,
  session-API:t) med blandade alternativ och utan facit, så frågebanken aldrig
  följer med i klientpaketet.
*/

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

  // Ord och text, siffror och tabeller, alla nivåer (expert inräknad) i ramen.
  if (config.kind === 'verbal' || config.kind === 'numerisk') {
    return (
      <VnNivatest
        kind={config.kind}
        sessionId={sessionId}
        slug={config.slug}
        level={config.level as 'grund' | 'avancerad' | 'expert'}
        minuter={config.examMinutes ?? config.minutes}
        resultsPath={resultsPath}
        initialRun={runData}
        {...endpoints}
      />
    )
  }

  if (config.kind === 'matris') {
    return (
      <MatrixTestSession
        sessionId={sessionId}
        level={config.level as 'grund' | 'avancerad' | 'expert'}
        resultsPath={resultsPath}
        initialRun={runData}
        {...endpoints}
      />
    )
  }

  // Figurserier (beställningen omgång 2, A6 punkt 5): egen vy, egna pooler.
  // Sessionsramen (plan-testflode-2026-11-20, etapp 1). FigurserieTestSession
  // står kvar oanvänd till etapp 5, så att en revert aldrig saknar kod.
  if (config.kind === 'figurserie') {
    return (
      <FigurserieNivatest
        sessionId={sessionId}
        slug={config.slug}
        level={config.level as 'grund' | 'avancerad' | 'expert'}
        minuter={config.examMinutes ?? config.minutes}
        resultsPath={resultsPath}
        initialRun={runData}
        {...endpoints}
      />
    )
  }

  // Deduktiv slutledning (beställningen omgång 3, B1): text, två spalter på dator.
  // Testplanens steg 2: talserier, spatial förmåga, ordförråd.
  if (arSteg2Kind(config.kind)) {
    return (
      <Steg2TestSession
        kind={config.kind}
        sessionId={sessionId}
        level={config.level as 'grund' | 'avancerad' | 'expert'}
        resultsPath={resultsPath}
        initialRun={runData}
        {...endpoints}
      />
    )
  }

  if (config.kind === 'deduktiv') {
    return (
      <DeduktivTestSession
        sessionId={sessionId}
        level={config.level as 'grund' | 'avancerad' | 'expert'}
        resultsPath={resultsPath}
        initialRun={runData}
        {...endpoints}
      />
    )
  }

  // Hit kommer ingen typ längre: ord och text, siffror och tabeller går i ramen ovan.
  return null
}
