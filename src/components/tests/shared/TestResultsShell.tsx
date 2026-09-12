'use client'

/**
 * TestResultsShell: det gemensamma skalet runt varje testresultat
 * (docs/plan-inloggat-omdesign.md, våg 3 punkt 22).
 *
 * Tre resultatsidor på 670 rader styck blir en. Det som skiljer testen åt är
 * genomgången per fråga, och den skickas in som children. Allt runt omkring
 * (poängen, tiden, percentilen, bryggan till CV, nästa nivå, handlingarna) är
 * samma sak oavsett test och bor här.
 *
 * Resultatet är fortfarande testets eget: rubriken bär testets namn och nivå,
 * och nästa nivå kommer ur testConfig.
 */

import type { ReactNode } from 'react'
import Link from 'next/link'
import PageHeader from '@/components/shell/PageHeader'
import PercentileCard from '@/app/dashboard/tester/components/PercentileCard'
import TestResultBridgeContainer from '@/components/tests/TestResultBridgeContainer'
import { getTestConfig, testPaths, type TestConfig } from '@/app/dashboard/tester/testConfig'
import type {
  BridgeData,
  PercentileData,
} from '@/app/dashboard/tester/[slug]/getResultsData'
import TestLevelBadge from './TestLevelBadge'
import TestNextLevelRow from './TestNextLevelRow'

interface Props {
  config: TestConfig
  sessionId: string
  score: number
  /** Total tid i sekunder. */
  timeSpent: number
  completedAt: string | null
  /** Genomgång per fråga. Testspecifik, skickas in av sidan. */
  children?: ReactNode
  /** Extra kort mellan poängen och genomgången, till exempel styrkor. */
  insights?: ReactNode
  /** Visa percentilen. Prov och personlighet har inget jämförbart underlag. */
  showPercentile?: boolean
  /** Serverräknad percentil. null betyder för litet underlag eller ej aktuell. */
  percentile?: PercentileData | null
  /** Serverläst underlag till bryggan. null betyder att det inte gick att läsa. */
  bridge?: BridgeData | null
  /**
   * true när servern läst klart. Då vet vi att null betyder "ska inte visas"
   * och inte "har inte hämtats än", så de korten kan hoppas över helt i
   * stället för att monteras och hämta själva.
   */
  serverResolved?: boolean
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins} min ${secs} sek`
}

export default function TestResultsShell({
  config,
  sessionId,
  score,
  timeSpent,
  completedAt,
  children,
  insights,
  showPercentile = true,
  percentile = null,
  bridge = null,
  serverResolved = false,
}: Props) {
  const total = config.totalQuestions
  const percentage = Math.min(100, Math.round((score / total) * 100))
  const avgPerQuestion = total > 0 ? Math.round(timeSpent / total) : 0
  const next = config.nextSlug ? getTestConfig(config.nextSlug) : undefined

  const completedDate = completedAt
    ? new Date(completedAt).toLocaleDateString('sv-SE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''

  return (
    <div className="mx-auto max-w-3xl py-6">
      <div className="space-y-6">
        <PageHeader
          title={`${config.title}: ditt resultat`}
          description={
            completedDate
              ? `Genomfört ${completedDate}.`
              : 'Här är genomgången fråga för fråga.'
          }
          action={
            <Link
              href={testPaths.hub(config.slug)}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-orange-600 px-4 text-sm font-medium text-white hover:bg-orange-700"
            >
              Gör om testet
            </Link>
          }
        >
          <TestLevelBadge kind={config.kind} level={config.level} />
        </PageHeader>

        {/* Poängen. Ett kort, inga gradienter, siffrorna bär vikten. */}
        <section className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-4xl font-semibold tabular-nums leading-none text-neutral-900">
              {score}
            </span>
            <span className="text-lg tabular-nums text-neutral-600">av {total}</span>
            <span className="text-lg font-semibold tabular-nums text-orange-700">
              {percentage} procent
            </span>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-neutral-200 pt-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-neutral-500">Rätt svar</dt>
              <dd className="mt-1 text-sm font-medium tabular-nums text-neutral-900">
                {score} av {total}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">Tid</dt>
              <dd className="mt-1 text-sm font-medium tabular-nums text-neutral-900">
                {formatDuration(timeSpent)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">Per fråga</dt>
              <dd className="mt-1 text-sm font-medium tabular-nums text-neutral-900">
                {avgPerQuestion} sek
              </dd>
            </div>
          </dl>
        </section>

        {/*
          Percentilen och bryggan kommer färdiga från servern. Är läsningen
          `serverResolved` monteras korten med sitt data direkt, utan egen
          hämtning, och ett null betyder att kortet inte ska visas alls. Utan
          serverdata faller de tillbaka på att hämta själva, som förut.
        */}
        {showPercentile ? (
          serverResolved ? (
            percentile ? (
              <PercentileCard sessionId={sessionId} data={percentile} />
            ) : null
          ) : (
            <PercentileCard sessionId={sessionId} />
          )
        ) : null}

        {serverResolved ? (
          bridge ? (
            <TestResultBridgeContainer
              testSlug={config.slug}
              quotaFeature={config.quotaFeature}
              sessionEndpoint={`${config.api}/session`}
              data={bridge}
            />
          ) : null
        ) : (
          <TestResultBridgeContainer
            testSlug={config.slug}
            quotaFeature={config.quotaFeature}
            sessionEndpoint={`${config.api}/session`}
          />
        )}

        {insights}

        {children}

        {next ? (
          <TestNextLevelRow percentage={percentage} next={next} />
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={testPaths.hub(config.slug)}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 hover:border-neutral-300"
          >
            Gör om testet
          </Link>
          <Link
            href="/dashboard/tester"
            className="inline-flex h-11 flex-1 items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 hover:border-neutral-300"
          >
            Alla tester
          </Link>
        </div>
      </div>
    </div>
  )
}
