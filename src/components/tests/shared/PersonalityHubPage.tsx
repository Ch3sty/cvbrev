'use client'

/**
 * Startsidan för ett personlighetstest.
 *
 * Personlighetstesten har en annan struktur än de kognitiva: ingen poäng,
 * ingen percentil, ingen rätt eller fel, utan en Big Five-profil. De ligger
 * därför kvar på egna routes, men på samma sidmall som allt annat, och läser
 * sitt namn, sin beskrivning och sitt premiumkrav ur testConfig.
 *
 * Våg 1 punkt 6: kortet på hubben leder hit även för den som saknar Premium,
 * så hon ser vad testet är innan hon möter betalväggen.
 */

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PageHeader from '@/components/shell/PageHeader'
import LoadingSkeleton from '@/components/shell/LoadingSkeleton'
import PaywallCard from '@/components/paywall/PaywallCard'
import { PREMIUM_HREF } from '@/lib/premium/premiumEntry'
import { useProfile } from '@/hooks/use-profile'
import { useDashboardData } from '@/contexts/DashboardDataContext'
import { scopeHasFeature } from '@/lib/access/features'
import PersonalityProfileCard from './PersonalityProfileCard'
import { testPaths, type TestConfig } from '@/app/dashboard/tester/testConfig'
import TestLevelBadge from './TestLevelBadge'
import type { BigFiveScores } from '@/lib/personalityTest/types'

interface Session {
  id: string
  test_type: string
  scores: BigFiveScores | null
  time_spent: number | null
  completed_at: string | null
  started_at: string
}

export default function PersonalityHubPage({ config }: { config: TestConfig }) {
  const router = useRouter()
  const { subscriptionTier, loading: profileLoading } = useProfile()
  const { summary } = useDashboardData()
  const [sessions, setSessions] = useState<Session[]>([])
  const [isStarting, setIsStarting] = useState(false)
  const [startError, setStartError] = useState<string | null>(null)

  const isPremium = subscriptionTier === 'premium'

  // Paketet och spåret kommer ur hemskärmens data, som redan hämtats en
  // gång. Utan paket är scope null, och då ritar PaywallCard den vanliga
  // betalväggen; med fel spår ritar den FelSpar i stället.
  const scope = summary?.week?.scope ?? null
  const track = summary?.week?.track ?? null
  const requiredFeature = config.requiresFeature ?? null
  const hasFeature = scopeHasFeature(scope, requiredFeature ?? 'tests_above_base')
  const isLocked = requiredFeature !== null && !hasFeature && !profileLoading

  useEffect(() => {
    if (isLocked || profileLoading) return
    let cancelled = false
    fetch(`${config.api}/session?${config.sessionQuery}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data || !Array.isArray(data.sessions)) return
        const completed = (data.sessions as Session[])
          .filter((s) => s.completed_at)
          .sort(
            (a, b) =>
              new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime()
          )
        setSessions(completed)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [config.api, config.sessionQuery, isLocked, profileLoading])

  const handleStart = useCallback(async () => {
    setIsStarting(true)
    setStartError(null)
    try {
      const res = await fetch(`${config.api}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config.startBody ?? {}),
      })

      // Premiumkravet avgörs serverside, precis som kvoterna.
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

  const latest = sessions[0] ?? null

  if (profileLoading) {
    return (
      <div className="mx-auto max-w-3xl py-6">
        <LoadingSkeleton variant="card" label="Testet laddas" />
      </div>
    )
  }

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
                Ta Testveckan
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleStart}
                disabled={isStarting}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover disabled:opacity-40"
              >
                {isStarting
                  ? 'Startar testet'
                  : latest
                    ? 'Gör om testet'
                    : 'Starta testet'}
              </button>
            )
          }
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <TestLevelBadge kind="personlighet" level={config.level} />
            <span className="text-xs tabular-nums text-ink-3">
              {config.totalQuestions} påståenden
            </span>
            <span className="text-xs tabular-nums text-ink-3">
              ca {config.minutes} min
            </span>
          </div>
        </PageHeader>

        {startError ? (
          <p className="text-sm text-fel" role="alert">
            {startError}
          </p>
        ) : null}

        <section className="rounded-xl border border-kant bg-panel p-4 sm:p-6">
          <h2 className="text-kort text-ink-1">
            Så läser du din profil
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            {config.levelBlurb}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-2">
            Det finns inga rätt svar och ingen poäng. Du får en profil på fem
            dimensioner och en beskrivning av hur en rekryterare brukar läsa den.
          </p>
        </section>

        {isLocked ? (
          <>
            <PaywallCard
            variant="testniva"
            feature={requiredFeature ?? undefined}
            scope={scope}
            track={track}
          />
            <p className="text-sm text-ink-2">
              Du kan börja med{' '}
              <Link
                href={testPaths.hub('personlighet-grund')}
                className="font-medium text-ink-1 underline underline-offset-4"
              >
                grundtestet
              </Link>{' '}
              gratis.
            </p>
          </>
        ) : latest?.scores && latest.completed_at ? (
          <PersonalityProfileCard
            scores={latest.scores}
            lastCompletedAt={latest.completed_at}
            attempts={sessions.length}
            resultsHref={testPaths.results(config.slug, latest.id)}
          />
        ) : null}
      </div>
    </div>
  )
}
