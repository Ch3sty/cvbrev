'use client'

/**
 * TestRunner: väljer rätt testvy i sessionsramen för en slug, matad ur
 * testConfig (plan-testflode-2026-11-20). Alla typer och nivåer går i ramen;
 * uppgifterna byggs på servern utan facit, så bankerna aldrig följer med i
 * klientpaketet. Vyerna importeras statiskt: en dynamisk import la uppgiften
 * bakom en Suspense-gräns och flyttade LCP efter JS-chunken.
 */

import MatrisNivatest from '@/components/session/matris/MatrisNivatest'
import DeduktivNivatest from '@/components/session/deduktiv/DeduktivNivatest'
import FigurserieNivatest from '@/components/session/figurserie/FigurserieNivatest'
import Steg2Nivatest from '@/components/session/steg2/Steg2Nivatest'
import VnNivatest from '@/components/session/vn/VnNivatest'

import { arSteg2Kind, testPaths, type TestConfig } from '@/app/dashboard/tester/testConfig'
import type { RunData } from '@/app/dashboard/tester/[slug]/getRunData'

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

  // De gamla proven (*-prov) skickas till övningsproven av sidan.
  if (config.level === 'prov') return null

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
      <MatrisNivatest
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

  // Talserier, spatial förmåga, ordförråd.
  if (arSteg2Kind(config.kind)) {
    return (
      <Steg2Nivatest
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

  if (config.kind === 'deduktiv') {
    return (
      <DeduktivNivatest
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

  return null
}
