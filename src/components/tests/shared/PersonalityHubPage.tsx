'use client'

/**
 * Startskärmen för ett personlighetstest i sessionsramens mall
 * (plan-testflode-2026-11-20 avsnitt 4.1, etapp 5): eyebrow, rubrik, scenen,
 * tre regler och det lyfta kortet med en kopparknapp, i rummet som
 * nivåtestens startsida. Läget (försöken, en påbörjad session och om nivån
 * är låst) läses på servern, så att skärmen målas rätt ur första HTML.
 *
 * Personlighetstesten har ingen poäng och inget rätt eller fel, utan en Big
 * Five-profil. Den senaste profilen står under kortet. Kortet på hubben
 * leder hit även för den som saknar Premium, så hon ser vad testet är innan
 * hon möter betalväggen.
 */

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Topprad from '@/components/rum/Topprad'
import PaywallCard from '@/components/paywall/PaywallCard'
import Startskarm from '@/components/session/Startskarm'
import { SESSION } from '@/components/session/copy'
import { PREMIUM_HREF } from '@/lib/premium/premiumEntry'
import { useDashboardData } from '@/contexts/DashboardDataContext'
import { scopeHasFeature } from '@/lib/access/features'
import type { PersonlighetStartlage } from '@/lib/personalityTest/sparade.server'
import PersonalityProfileCard from './PersonalityProfileCard'
import { testPaths, type TestConfig } from '@/app/dashboard/tester/testConfig'

export default function PersonalityHubPage({ config, startlage }: { config: TestConfig; startlage: PersonlighetStartlage | null }) {
  const router = useRouter()
  const { summary } = useDashboardData()
  const [startar, setStartar] = useState(false)
  const [fel, setFel] = useState<string | null>(null)

  // Betalväggen: serverns läge först; utan det paketet ur hemskärmens data.
  const scope = summary?.paket?.scope ?? null
  const track = summary?.paket?.track ?? null
  const kravs = config.requiresFeature ?? null
  const last = startlage ? startlage.last : kravs !== null && !scopeHasFeature(scope, kravs)
  const forsok = startlage?.forsok ?? []
  const senaste = forsok[0] ?? null
  const pagaende = last ? null : startlage?.pagaende ?? null

  const starta = useCallback(async () => {
    if (pagaende) {
      setStartar(true)
      router.push(testPaths.run(config.slug, pagaende.id))
      return
    }
    setStartar(true)
    setFel(null)
    try {
      const res = await fetch(`${config.api}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config.startBody ?? {}),
      })
      // Premiumkravet avgörs på servern, precis som kvoterna.
      if (res.status === 402 || res.status === 403) {
        router.push(PREMIUM_HREF)
        return
      }
      const data = await res.json().catch(() => null)
      if (data?.session?.id) {
        router.push(testPaths.run(config.slug, data.session.id))
        return
      }
      setFel(SESSION.fel.start)
      setStartar(false)
    } catch {
      setFel(SESSION.fel.natet)
      setStartar(false)
    }
  }, [config, pagaende, router])

  const sparrad = last ? 'premium' : 'none'
  const knappText = pagaende ? SESSION.start.fortsatt.personlighet : senaste ? SESSION.start.gorOm : SESSION.start.starta.personlighet
  const kvarRad = pagaende
    ? pagaende.kvar === 1
      ? 'Du har ett påstående kvar.'
      : `Du har ${pagaende.kvar} påståenden kvar.`
    : null

  return (
    <Startskarm
      inline
      topprad={<Topprad />}
      bas={{ test_kind: 'personlighet', lage: 'personlighet', niva: config.level, format: null }}
      eyebrow="Personlighet"
      rubrik={config.title}
      scen="personlighet"
      rita={!pagaende && !last}
      regler={[
        { titel: `${config.totalQuestions} påståenden, cirka ${config.minutes} minuter.`, text: 'Ett tryck per påstående. Du kan gå tillbaka och ändra.' },
        { titel: 'Inget rätt eller fel.', text: 'Gå på första känslan. Ingen klocka, men tänk inte för länge.' },
        { titel: 'Din profil sparas.', text: 'Du ser den direkt efteråt, med hur en rekryterare brukar läsa den.' },
      ]}
      sparrad={sparrad}
      fortsattTillganglig={Boolean(pagaende)}
      sparr={
        last ? (
          <PaywallCard variant="testniva" testTyp="personlighet" feature={kravs ?? undefined} scope={scope} track={track} plats="testniva" matning={{ test_kind: 'personlighet', lage: 'personlighet' }} />
        ) : null
      }
      knapp={last ? null : { text: knappText, onClick: () => void starta(), laddar: startar }}
      kortRad={
        fel ? (
          <span role="alert" className="text-ink-1">
            {fel}
          </span>
        ) : (
          kvarRad
        )
      }
      fotnot={last ? null : 'Avbryter du sparas svaren, och du fortsätter här.'}
      efter={
        <div className="w-full max-w-3xl space-y-4 pb-8">
          {last ? (
            <p className="text-sm text-ink-2">
              Du kan börja med{' '}
              <Link href={testPaths.hub('personlighet-grund')} className="font-medium text-ink-1 underline underline-offset-4">
                grundtestet
              </Link>{' '}
              gratis.
            </p>
          ) : null}
          {!last && senaste?.scores ? (
            <PersonalityProfileCard
              scores={senaste.scores}
              lastCompletedAt={senaste.completed_at}
              attempts={forsok.length}
              resultsHref={testPaths.results(config.slug, senaste.id)}
            />
          ) : null}
          <section className="rounded-xl border border-kant bg-papper p-4 sm:p-5">
            <h2 className="text-kort text-ink-1">Så läser du din profil</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">{config.levelBlurb}</p>
            <p className="mt-3 text-sm leading-relaxed text-ink-2">
              Det finns inga rätt svar och ingen poäng. Du får en profil på fem dimensioner och en beskrivning av hur en rekryterare brukar
              läsa den.
            </p>
          </section>
        </div>
      }
    />
  )
}
