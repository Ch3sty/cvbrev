'use client'

/**
 * TestResultsPage: renderar resultatet för en session.
 *
 * Skalet runt omkring är gemensamt (TestResultsShell). Det som skiljer testen
 * åt är genomgången per fråga, och den väljs här utifrån testtyp. För
 * matrislogiken byggs genomgången på servern (getResultsData eller
 * session-API:t) med samma urval och samma visade ordning som testvyn, så
 * bokstaven och rutan hon ser är dem hon såg i testet, och facit aldrig ligger
 * i klientpaketet.
 *
 * Sessionen, percentilen och bryggans underlag kommer numera färdiga från
 * servern (getResultsData.ts). Gick den läsningen inte igenom faller sidan
 * tillbaka på den gamla klienthämtningen, så resultatet alltid går att visa.
 */

import { KNAPP_PRIMAR } from '@/components/shell/knappar'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { TestConfig } from '@/app/dashboard/tester/testConfig'
import type { ResultsData } from '@/app/dashboard/tester/[slug]/getResultsData'
import RumHuvud from '@/components/rum/RumHuvud'
import Golv from '@/components/rum/Golv'
import TestResultsShell from './TestResultsShell'
import MatrixQuestionReview from './reviews/MatrixQuestionReview'
import { requestInstallPrompt } from '@/lib/pwa/installPrompt'
import type { GenomgangsFraga } from '@/lib/logicTestV7/layered.v7'

/*
  Genomgången per fråga ligger långt under första vyn: poängkortet,
  percentilen och bryggan kommer före den. Den laddas därför först när den
  behövs, i stället för att ligga i paketet som målar toppen av sidan.
  Varje genomgång reserverar sin höjd medan den laddar, så ingenting under
  den hoppar när den landar.
*/
const ReviewFallback = () => (
  <div className="h-64 rounded-xl border border-kant bg-panel" aria-hidden="true" />
)

const NumericalReview = dynamic(() => import('./reviews/NumericalReview'), {
  loading: ReviewFallback,
})
const VerbalReview = dynamic(() => import('./reviews/VerbalReview'), {
  loading: ReviewFallback,
})

interface SessionData {
  id: string
  score: number | null
  time_spent: number | null
  completed_at: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  answers?: any[]
  /** Matrislogikens genomgång, byggd på servern. */
  genomgang?: GenomgangsFraga[] | null
}

/**
 * Matrislogik och proven lagras i logic_test_v4_sessions. Deras session-API
 * svarar på ?id= med raden och genomgången. Övriga test listar sina sessioner
 * bakom sitt session-API.
 */
const READS_SUPABASE = new Set([
  'matrislogik-grund',
  'matrislogik-avancerad',
  'matrislogik-expert',
  'matrislogik-prov',
])

export default function TestResultsPage({
  config,
  sessionId,
  resultsData,
}: {
  config: TestConfig
  sessionId: string
  /** Serverhämtat resultat. Saknas det hämtar sidan själv, som förut. */
  resultsData?: ResultsData
}) {
  const fromServer = resultsData?.resolved ? resultsData : null

  const [session, setSession] = useState<SessionData | null>(() =>
    fromServer?.session
      ? {
          id: fromServer.session.id,
          score: fromServer.session.score,
          time_spent: fromServer.session.timeSpent,
          completed_at: fromServer.session.completedAt,
          answers: fromServer.session.answers,
          genomgang: fromServer.session.genomgang ?? null,
        }
      : null
  )
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>(() =>
    fromServer?.session ? 'ready' : 'loading'
  )

  useEffect(() => {
    // Servern har redan läst sessionen. Ingen hämtning behövs.
    if (fromServer?.session) return

    let cancelled = false

    const load = async () => {
      try {
        if (READS_SUPABASE.has(config.slug)) {
          // Session-API:t ger raden plus genomgången (frågorna i visad
          // ordning och var rätt svar stod), byggd på servern.
          const res = await fetch(`${config.api}/session?id=${sessionId}`)
          if (!res.ok) throw new Error('missing')
          const data = await res.json()
          if (!data?.session) throw new Error('missing')
          if (!cancelled) {
            setSession({ ...(data.session as SessionData), genomgang: data.genomgang ?? null })
            setState('ready')
          }
          return
        }

        const url = config.sessionQuery
          ? `${config.api}/session?${config.sessionQuery}`
          : `${config.api}/session`
        const res = await fetch(url)
        if (!res.ok) throw new Error('missing')
        const data = await res.json()
        const found = (data.sessions as SessionData[] | undefined)?.find(
          (s) => s.id === sessionId
        )
        if (!cancelled) {
          setSession(found ?? null)
          setState(found ? 'ready' : 'missing')
        }
      } catch {
        if (!cancelled) setState('missing')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [config.api, config.sessionQuery, config.slug, sessionId, fromServer])

  /**
   * Frågan om hemskärmen (docs/plan-pwa.md), efter ett slutfört logiktest.
   *
   * Bara matrislogiken, alltså config.kind === 'matris'. Verbala, numeriska
   * och personlighetstesten har sina egna resultatsidor i samma skal, men
   * planen pekar ut logiktestet och inget annat.
   *
   * Villkoret är att resultatet faktiskt står på skärmen: ett skelett eller
   * ett "gick inte att hämta" är inte ett slutfört test. Alla nivåer räknas,
   * inklusive provet. Reglerna för om frågan får visas ligger i storen.
   */
  useEffect(() => {
    if (config.kind !== 'matris') return
    if (state !== 'ready' || !session) return
    requestInstallPrompt('logic_test_completed')
  }, [config.kind, state, session])

  if (state === 'loading') {
    // Samma vägg som resultatet (TestResultsShell), med knappens plats
    // reserverad, så golvet inte hoppar när sessionen landat.
    return (
      <>
        <RumHuvud
          title={`${config.title}: ditt resultat`}
          description="Här är genomgången fråga för fråga."
          action={<span aria-hidden="true" className="skelett-vagg block h-12 w-full sm:w-40" />}
        />
        <Golv>
          <div
            className="w-full max-w-3xl space-y-4 sm:space-y-6"
            role="status"
            aria-busy="true"
            aria-label="Laddar resultat"
          >
            <div className="h-7 w-24 rounded-lg bg-insunken" aria-hidden="true" />
            <div className="loading-thread h-40 rounded-xl border border-kant bg-papper" aria-hidden="true" />
            <div className="h-64 rounded-xl border border-kant bg-papper" aria-hidden="true" />
          </div>
        </Golv>
      </>
    )
  }

  if (state === 'missing' || !session) {
    return (
      <>
        <RumHuvud
          title="Resultatet gick inte att hämta"
          description="Sessionen finns inte kvar, eller så hör den till ett annat konto. Kör testet igen så sparas ett nytt resultat."
          action={
            <Link
              href={`/dashboard/tester/${config.slug}`}
              className={KNAPP_PRIMAR}
            >
              Till {config.title.toLowerCase()}
            </Link>
          }
        />
        <Golv>{null}</Golv>
      </>
    )
  }

  const answers = session.answers ?? []

  return (
    <TestResultsShell
      config={config}
      sessionId={sessionId}
      score={session.score ?? 0}
      timeSpent={session.time_spent ?? 0}
      completedAt={session.completed_at}
      // Percentilen jämför mot samma testtyp. Proven har eget underlag.
      showPercentile={config.level !== 'prov'}
      percentile={fromServer?.percentile ?? null}
      bridge={fromServer?.bridge ?? null}
      serverResolved={!!fromServer}
    >
      {config.kind === 'matris' ? (
        <MatrixQuestionReview
          slug={config.slug}
          answers={answers}
          fragor={session.genomgang ?? []}
        />
      ) : config.kind === 'numerisk' ? (
        <NumericalReview slug={config.slug} sessionId={sessionId} answers={answers} />
      ) : (
        <VerbalReview
          slug={config.slug}
          sessionId={sessionId}
          answers={answers}
          score={session.score ?? 0}
          timeSpent={session.time_spent ?? 0}
          totalStatements={config.totalQuestions}
        />
      )}
    </TestResultsShell>
  )
}
