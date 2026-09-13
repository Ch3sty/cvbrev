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
 *
 * Sidmallen (docs/design/designsystem-v2-utkast.md): PageHeader med vyns enda
 * primärknapp, poängpanelen med stora tal i text-tal, percentilen som panel
 * med en 2 px mätare, bryggan som panel, nästa nivå som rad, genomgången i
 * paneler och sist en sekundär kant-knapp.
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
    <div className="mx-auto max-w-3xl py-6 animate-thread-enter">
      <div className="space-y-4 sm:space-y-6">
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
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-hover sm:w-auto"
            >
              Gör om testet
            </Link>
          }
        >
          <TestLevelBadge kind={config.kind} level={config.level} />
        </PageHeader>

        {/* Poängen. En panel, siffrorna bär vikten. */}
        <section
          className="rounded-xl border border-kant bg-panel p-4 sm:p-5"
          aria-label="Din poäng"
        >
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-tal tabular-nums text-ink-1">{score}</span>
            <span className="text-meta text-ink-3">av {total}</span>
            <span className="ml-2 text-tal tabular-nums text-ink-1">{percentage}</span>
            <span className="text-meta text-ink-3">procent</span>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-kant pt-4">
            <div>
              <dt className="text-meta text-ink-3">Tid</dt>
              <dd className="mt-1 text-sm font-medium tabular-nums text-ink-1">
                {formatDuration(timeSpent)}
              </dd>
            </div>
            <div>
              <dt className="text-meta text-ink-3">Per fråga</dt>
              <dd className="mt-1 text-sm font-medium tabular-nums text-ink-1">
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
            href="/dashboard/tester"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-kant bg-panel px-4 text-sm font-medium text-ink-1 hover:border-kant-stark sm:w-auto"
          >
            Alla tester
          </Link>
        </div>
      </div>
    </div>
  )
}
