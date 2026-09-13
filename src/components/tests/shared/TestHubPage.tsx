'use client'

/**
 * TestHubPage: startsidan för ett enskilt test
 * (docs/plan-inloggat-omdesign.md, avsnitt 5 "Tester", våg 3 punkt 22).
 *
 * En komponent för alla tolv kognitiva test och prov. Vad som skiljer dem åt
 * kommer ur testConfig, aldrig ur koden: namn, nivå, beskrivning, frågekälla,
 * kvotnyckel och premiumkrav.
 *
 * Kvoten räknas serverside i quotaService. Sidan startar alltid testet och
 * visar betalväggen först när API:t svarar 429, enligt våg 1 punkt 6. Den
 * gissar aldrig själv om kvoten är slut.
 */

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PageHeader from '@/components/shell/PageHeader'
import StatusRow from '@/components/shell/StatusRow'
import PaywallCard from '@/components/paywall/PaywallCard'
import { PREMIUM_HREF } from '@/lib/premium/premiumEntry'
import { useProfile } from '@/hooks/use-profile'
import {
  KIND_LABEL,
  LEVEL_LABEL,
  testPaths,
  type TestConfig,
} from '@/app/dashboard/tester/testConfig'
import TestLevelBadge from './TestLevelBadge'
import TestPreviousResults, { type TestSessionRow } from './TestPreviousResults'

interface QuotaLock {
  feature: string
  nextResetAt: string
}

/** Kvoterna nollställs vid midnatt svensk tid. Fallback när API:t tiger. */
function nextMidnightISO(): string {
  const d = new Date()
  d.setHours(24, 0, 0, 0)
  return d.toISOString()
}

export default function TestHubPage({ config }: { config: TestConfig }) {
  const router = useRouter()
  const { subscriptionTier, loading: profileLoading } = useProfile()
  const [sessions, setSessions] = useState<TestSessionRow[]>([])
  /**
   * Tidigare resultat hämtas efter första målningen. Raden "Ditt bästa" står
   * ovanför nivåtexten, så när den dök upp knuffades allt under den 68 px
   * nedåt (44 px rad plus 24 px radavstånd). Det mätte 0,0219 i CLS.
   * Vi håller reda på om hämtningen är klar och reserverar ytan tills dess.
   */
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [isStarting, setIsStarting] = useState(false)
  const [quotaLock, setQuotaLock] = useState<QuotaLock | null>(null)
  const [startError, setStartError] = useState<string | null>(null)

  const isPremium = subscriptionTier === 'premium'
  const isLocked = config.requiresPremium && !isPremium && !profileLoading

  useEffect(() => {
    if (isLocked) {
      setSessionsLoading(false)
      return
    }
    let cancelled = false
    const url = config.sessionQuery
      ? `${config.api}/session?${config.sessionQuery}`
      : `${config.api}/session`

    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return
        if (!data || !Array.isArray(data.sessions)) return
        const completed = (data.sessions as TestSessionRow[])
          .filter((s) => s.completed_at)
          .sort(
            (a, b) =>
              new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime()
          )
        setSessions(completed)
      })
      .catch(() => {
        /* Tidigare resultat är ett tillägg. Fel här får inte blockera start. */
      })
      .finally(() => {
        if (!cancelled) setSessionsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [config.api, config.sessionQuery, isLocked])

  const handleStart = useCallback(async () => {
    setIsStarting(true)
    setStartError(null)
    try {
      const res = await fetch(`${config.api}/session`, {
        method: 'POST',
        ...(config.startBody
          ? {
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(config.startBody),
            }
          : {}),
      })

      // Dagskvoten är slut. Betalväggen visas här, inte vid klicket på hubben.
      if (res.status === 429) {
        const data = await res.json().catch(() => null)
        setQuotaLock({
          feature: data?.feature ?? config.quotaFeature,
          nextResetAt: data?.nextResetAt ?? data?.nextAvailableAt ?? nextMidnightISO(),
        })
        setIsStarting(false)
        return
      }

      if (res.status === 402 || res.status === 403) {
        router.push(PREMIUM_HREF)
        return
      }

      const data = await res.json().catch(() => null)
      if (data?.session?.id) {
        router.push(testPaths.run(config.slug, data.session.id))
        return
      }

      setStartError('Testet kunde inte startas. Försök igen om en stund.')
      setIsStarting(false)
    } catch {
      setStartError('Vi nådde inte servern. Kontrollera uppkopplingen och försök igen.')
      setIsStarting(false)
    }
  }, [config, router])

  const bestScore = sessions.length
    ? Math.max(...sessions.map((s) => s.score ?? 0))
    : 0
  const bestPercentage = bestScore
    ? Math.min(100, Math.round((bestScore / config.totalQuestions) * 100))
    : 0

  const levelName = LEVEL_LABEL[config.level]
  const kindName = KIND_LABEL[config.kind]

  return (
    <div className="mx-auto max-w-3xl py-6">
      <div className="space-y-6">
        <PageHeader
          title={config.title}
          description={config.description}
          action={
            isLocked ? (
              <Link
                href={PREMIUM_HREF}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover"
              >
                Lås upp med Premium
              </Link>
            ) : quotaLock ? undefined : (
              <button
                type="button"
                onClick={handleStart}
                disabled={isStarting}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover disabled:opacity-40"
              >
                {isStarting
                  ? 'Startar testet'
                  : sessions.length > 0
                    ? 'Gör om testet'
                    : 'Starta testet'}
              </button>
            )
          }
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <TestLevelBadge kind={config.kind} level={config.level} />
            <span className="text-xs tabular-nums text-ink-3">
              {config.totalQuestions} frågor
            </span>
            <span className="text-xs tabular-nums text-ink-3">
              ca {config.minutes} min
            </span>
            {!isPremium && !profileLoading ? (
              <span className="text-xs text-ink-3">En omgång per dag</span>
            ) : null}
          </div>
        </PageHeader>

        {sessionsLoading && !quotaLock ? (
          // Platshållare i exakt radens mått medan tidigare resultat hämtas.
          // Utan den knuffas nivåtexten nedåt när raden dyker upp.
          <div className="min-h-11" aria-hidden="true" />
        ) : bestPercentage > 0 && !quotaLock ? (
          <StatusRow
            tone="positive"
            showDot
            action={
              <Link
                href="/dashboard/tester"
                className="text-sm font-medium text-ink-2 underline-offset-4 hover:text-ink-1 hover:underline"
              >
                Alla tester
              </Link>
            }
          >
            <span className="tabular-nums">
              Ditt bästa: {bestScore} av {config.totalQuestions}, {bestPercentage} procent
            </span>
          </StatusRow>
        ) : null}

        {startError ? (
          <p className="text-sm text-fel" role="alert">
            {startError}
          </p>
        ) : null}

        {/* Vad nivån kräver. Egen text per test, hämtad ur konfigurationen. */}
        <section className="rounded-xl border border-kant bg-panel p-4 sm:p-6">
          <h2 className="text-kort text-ink-1">
            {levelName === 'Prov' ? 'Så fungerar provet' : `${levelName}nivån i ${kindName.toLowerCase()}`}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            {config.levelBlurb}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-ink-2">
            <li className="flex gap-2">
              <span aria-hidden="true" className="text-ink-3">
                &middot;
              </span>
              Du kan pausa. Svaren sparas medan du gör testet.
            </li>
            <li className="flex gap-2">
              <span aria-hidden="true" className="text-ink-3">
                &middot;
              </span>
              {config.level === 'prov'
                ? 'Genomgången kommer efter provet, aldrig under.'
                : 'Efter testet går vi igenom varje fråga och vad som avgjorde svaret.'}
            </li>
          </ul>
        </section>

        {/* Betalväggen kommer när kvoten faktiskt är slut, aldrig före. */}
        {quotaLock ? (
          <PaywallCard
            variant="test-tak"
            isPremium={isPremium}
            quota={{ feature: quotaLock.feature, nextResetAt: quotaLock.nextResetAt }}
          />
        ) : null}

        {isLocked ? (
          <PaywallCard variant="test-tak" isPremium={isPremium} />
        ) : (
          <TestPreviousResults
            slug={config.slug}
            sessions={sessions}
            totalQuestions={config.totalQuestions}
            bestScore={bestScore}
          />
        )}
      </div>
    </div>
  )
}
