'use client'

/**
 * TestHubPage: startsidan för ett enskilt test (tester-lyftet, Provbladet).
 *
 *   väggen      testets rubrik och provbladets bild (illu-vagg)
 *   lyftkortet  nivån, testets fråga, faktaraden (frågor, minuter, nivå) som
 *               tal över etiketter, och vyns enda kopparknapp: starta eller
 *               gör om
 *   golvet      Ditt bästa (ett tal och en ruta per fråga) och Dina försök
 *               (antalet och en prickserie, listan i detaljvyn), sist
 *               hjälpraden med vad nivån betyder (hjälprutorna C5 och B)
 *
 * Ägarens regel: ett tal bär ytan, aldrig tal i löptext med mittpunkter.
 *
 * Försöken läses på servern (getForsok.ts). Saknas de (null) hämtar sidan
 * själv via testets session-API och reserverar kortens plats under tiden.
 *
 * Kvoten räknas serverside i quotaService. Sidan startar alltid testet och
 * visar betalväggen först när API:t svarar 429. Den gissar aldrig själv om
 * kvoten är slut.
 */

import { KNAPP_PRIMAR } from '@/components/shell/knappar'
import RumHuvud from '@/components/rum/RumHuvud'
import Golv from '@/components/rum/Golv'
import { useCallback, useEffect, useState, type ComponentType } from 'react'
import { useRouter } from 'next/navigation'
import PaywallCard from '@/components/paywall/PaywallCard'
import { PREMIUM_HREF } from '@/lib/premium/premiumEntry'
import { useProfile } from '@/hooks/use-profile'
import { useDashboardData } from '@/contexts/DashboardDataContext'
import { scopeHasFeature } from '@/lib/access/features'
import { testPaths, type TestConfig, type TestKind } from '@/app/dashboard/tester/testConfig'
import { IlluMatris, IlluNumeriskt, IlluProvlage, IlluVerbalt, type IlluProvbladProps } from '@/components/traning/illu'
import { HjalpKnapp, HjalpProvider, HjalpRad } from '@/components/hjalp'
import type { HjalpId } from '@/lib/traning/hjalp-copy'
import { NIVA_NAMN, NIVA_TAL, PROVETS_FRAGA, TESTETS_FRAGA, TESTSIDA, sakord } from '@/lib/tester/copy'
import BastaKort from '@/components/tests/testsida/BastaKort'
import ForsokKort, { type ForsokRad } from '@/components/tests/testsida/ForsokKort'

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

const BILD: Record<Exclude<TestKind, 'personlighet'>, ComponentType<IlluProvbladProps>> = {
  matris: IlluMatris,
  verbal: IlluVerbalt,
  numerisk: IlluNumeriskt,
}

/** Hjälprutorna om nivån och testtypen. Rutor som väntar på verifiering hoppas över. */
const HJALP: Record<Exclude<TestKind, 'personlighet'>, HjalpId[]> = {
  matris: ['C5', 'B1', 'B2'],
  verbal: ['C5', 'B3', 'B4'],
  numerisk: ['C5', 'B5', 'B6'],
}

/** Testtypens i-knapp på lyftkortet: vad testet mäter. */
const MATER: Record<Exclude<TestKind, 'personlighet'>, HjalpId> = {
  matris: 'B1',
  verbal: 'B3',
  numerisk: 'B5',
}

const HJALP_RUBRIK = {
  grund: 'Vad betyder grundnivån?',
  avancerad: 'Vad betyder avancerad nivå?',
  expert: 'Vad betyder expertnivån?',
  prov: TESTSIDA.hjalpRubrikProv,
} as const

function Fakta({ tal, etikett }: { tal: string | number; etikett: string }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="mt-px whitespace-nowrap text-[11px] leading-[14px] text-ink-3">{etikett}</dt>
      <dd className="whitespace-nowrap font-display text-lg font-bold leading-[22px] tracking-[-0.02em] tabular-nums text-ink-1">{tal}</dd>
    </div>
  )
}

export default function TestHubPage({ config, forsok }: { config: TestConfig; forsok?: ForsokRad[] | null }) {
  const router = useRouter()
  const { loading: profileLoading } = useProfile()
  const { summary } = useDashboardData()
  const franServern = Array.isArray(forsok)
  const [sessions, setSessions] = useState<ForsokRad[]>(() => (franServern ? (forsok as ForsokRad[]) : []))
  /** Bara när servern inte kunde läsa försöken: korten reserverar sin plats. */
  const [sessionsLoading, setSessionsLoading] = useState(!franServern)
  const [isStarting, setIsStarting] = useState(false)
  const [quotaLock, setQuotaLock] = useState<QuotaLock | null>(null)
  const [startError, setStartError] = useState<string | null>(null)

  // Paketet och spåret kommer ur hemskärmens data. PaywallCard ritar samma
  // betalvägg med eller utan paket (spec-rummen 17.5).
  const scope = summary?.paket?.scope ?? null
  const track = summary?.paket?.track ?? null
  const requiredFeature = config.requiresFeature ?? null
  const hasFeature = scopeHasFeature(scope, requiredFeature ?? 'tests_above_base')
  const isLocked = requiredFeature !== null && !hasFeature && !profileLoading

  useEffect(() => {
    if (franServern) return
    if (isLocked) {
      setSessionsLoading(false)
      return
    }
    let cancelled = false
    const url = config.sessionQuery ? `${config.api}/session?${config.sessionQuery}` : `${config.api}/session`
    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data || !Array.isArray(data.sessions)) return
        const completed = (data.sessions as ForsokRad[])
          .filter((s) => s.completed_at)
          .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
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
  }, [config.api, config.sessionQuery, isLocked, franServern])

  const handleStart = useCallback(async () => {
    setIsStarting(true)
    setStartError(null)
    try {
      const res = await fetch(`${config.api}/session`, {
        method: 'POST',
        ...(config.startBody
          ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config.startBody) }
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

      setStartError(TESTSIDA.fel.start)
      setIsStarting(false)
    } catch {
      setStartError(TESTSIDA.fel.natet)
      setIsStarting(false)
    }
  }, [config, router])

  const kind = config.kind as Exclude<TestKind, 'personlighet'>
  const arProv = config.level === 'prov'
  const Bild = arProv ? IlluProvlage : BILD[kind]
  const sak = sakord(config.kind, config.slug)
  const minuter = config.examMinutes ?? config.minutes

  const bast = sessions.reduce<ForsokRad | null>((b, s) => (!b || (s.score ?? 0) > (b.score ?? 0) ? s : b), null)
  const bastPoang = bast?.score ?? 0
  const harForsok = sessions.length > 0

  const startText = isStarting
    ? TESTSIDA.startar
    : harForsok
      ? arProv
        ? TESTSIDA.gorOmProv
        : TESTSIDA.gorOm
      : arProv
        ? TESTSIDA.startProv
        : TESTSIDA.start

  return (
    <HjalpProvider dold={null} forsta={!harForsok && !sessionsLoading}>
      <RumHuvud
        title={config.title}
        description={config.description}
        tat={false}
        instrument={
          <div className="illu-vagg">
            <Bild className="h-24 w-auto max-w-[160px] lg:ml-auto lg:h-auto lg:w-60 lg:max-w-none" />
          </div>
        }
      />
      <Golv lyft>
        <section
          aria-label={config.title}
          className="relative z-[2] -mt-[30px] w-full max-w-3xl rounded-2xl border border-[color:var(--lyft-kant)] bg-papper p-4 shadow-lyft sm:p-5"
        >
          <p className="flex items-center gap-1 text-ey text-koppar-ink">
            {NIVA_NAMN[config.level]}
            <HjalpKnapp id={arProv ? 'B8' : MATER[kind]} />
          </p>
          <h2 className="mt-1 text-kort-t text-ink-1">{arProv ? PROVETS_FRAGA : TESTETS_FRAGA[kind]}</h2>
          <p className="mt-1.5 text-sm leading-[21px] text-ink-2">{config.levelBlurb}</p>
          <dl className="mt-3.5 flex flex-wrap gap-x-6 gap-y-2" data-fakta>
            <Fakta tal={config.totalQuestions} etikett={sak.flera} />
            <Fakta tal={minuter} etikett={TESTSIDA.fakta.minuter} />
            <Fakta tal={NIVA_TAL[config.level]} etikett={arProv ? TESTSIDA.fakta.nivaer : TESTSIDA.fakta.niva} />
          </dl>
          {/* Låst eller kvoten slut: betalväggen nedan bär sin egen knapp. */}
          {isLocked || quotaLock ? null : (
            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
              <button type="button" onClick={handleStart} disabled={isStarting} className={`${KNAPP_PRIMAR} sm:w-auto`}>
                {startText}
              </button>
            </div>
          )}
          {startError ? (
            <p className="mt-3 text-sm text-ink-1" role="alert">
              {startError}
            </p>
          ) : null}
        </section>

        <div className="w-full max-w-3xl space-y-4">
          {quotaLock ? (
            <PaywallCard
              variant="test-tak"
              scope={scope}
              track={track}
              quota={{ feature: quotaLock.feature, nextResetAt: quotaLock.nextResetAt }}
            />
          ) : null}

          {isLocked ? (
            <PaywallCard
              variant="testniva"
              feature={requiredFeature ?? undefined}
              scope={scope}
              track={track}
              plats={arProv ? 'provlage' : 'testniva'}
            />
          ) : sessionsLoading ? (
            // Platshållare i kortens mått medan försöken hämtas (reservvägen).
            <div className="grid gap-4 sm:grid-cols-2" aria-hidden="true">
              <div className="h-[172px] rounded-2xl border border-kant bg-papper" />
              <div className="h-[172px] rounded-2xl border border-kant bg-papper" />
            </div>
          ) : harForsok && bast ? (
            <div className="grid items-start gap-4 sm:grid-cols-2" data-testsida-resultat>
              <BastaKort ratt={bastPoang} totalt={config.totalQuestions} href={testPaths.results(config.slug, bast.id)} />
              <ForsokKort slug={config.slug} forsok={sessions} totalt={config.totalQuestions} />
            </div>
          ) : null}

          <HjalpRad ids={arProv ? ['B8', 'B9'] : HJALP[kind]} rubrik={HJALP_RUBRIK[config.level]} />
        </div>
      </Golv>
    </HjalpProvider>
  )
}
