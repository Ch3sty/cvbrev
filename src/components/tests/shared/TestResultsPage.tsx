'use client'

/**
 * TestResultsPage: hämtar sessionen och renderar resultatet.
 *
 * Skalet runt omkring är gemensamt (TestResultsShell). Det som skiljer testen
 * åt är genomgången per fråga, och den väljs här utifrån testtyp. Frågeurvalet
 * seedas på sessionId, precis som testvyn gjorde, så genomgången visar exakt
 * de frågor användaren fick.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase/client-manager'
import type { TestConfig } from '@/app/dashboard/tester/testConfig'
import TestResultsShell from './TestResultsShell'
import MatrixQuestionReview from './reviews/MatrixQuestionReview'
import NumericalReview from './reviews/NumericalReview'
import VerbalReview from './reviews/VerbalReview'

interface SessionData {
  id: string
  score: number | null
  time_spent: number | null
  completed_at: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  answers?: any[]
}

/**
 * Matrislogik och proven lagras i logic_test_v4_sessions och läses direkt
 * ur Supabase. Övriga test har sina egna tabeller bakom sitt session-API.
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
}: {
  config: TestConfig
  sessionId: string
}) {
  const [session, setSession] = useState<SessionData | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        if (READS_SUPABASE.has(config.slug)) {
          const supabase = getSupabaseClient()
          const { data, error } = await supabase
            .from('logic_test_v4_sessions')
            .select('*')
            .eq('id', sessionId)
            .single()
          if (error || !data) throw error ?? new Error('missing')
          if (!cancelled) {
            setSession(data as SessionData)
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
  }, [config.api, config.sessionQuery, config.slug, sessionId])

  if (state === 'loading') {
    return (
      <div className="mx-auto max-w-3xl py-6">
        <div className="space-y-6">
          <div className="h-8 w-2/3 animate-pulse rounded-lg bg-neutral-100" />
          <div className="h-40 animate-pulse rounded-xl border border-neutral-200 bg-neutral-50" />
          <div className="h-64 animate-pulse rounded-xl border border-neutral-200 bg-neutral-50" />
        </div>
      </div>
    )
  }

  if (state === 'missing' || !session) {
    return (
      <div className="mx-auto max-w-3xl py-6">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Resultatet gick inte att hämta
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-neutral-600">
          Sessionen finns inte kvar, eller så hör den till ett annat konto. Kör
          testet igen så sparas ett nytt resultat.
        </p>
        <Link
          href={`/dashboard/tester/${config.slug}`}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-orange-600 px-4 text-sm font-medium text-white hover:bg-orange-700"
        >
          Till {config.title.toLowerCase()}
        </Link>
      </div>
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
    >
      {config.kind === 'matris' ? (
        <MatrixQuestionReview
          slug={config.slug}
          sessionId={sessionId}
          answers={answers}
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
