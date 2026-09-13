'use client'

/**
 * Tidigare resultat för ett test. Sektionsetikett och en panel med rader,
 * enligt sidmallen. Varje rad går till sin egen resultatsida, så
 * progressionen per nivå syns.
 */

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import EmptyState from '@/components/shell/EmptyState'
import { IlluPercentil } from '@/components/illustrations/TestIllustrations'
import { testPaths } from '@/app/dashboard/tester/testConfig'

export interface TestSessionRow {
  id: string
  score: number | null
  time_spent: number | null
  completed_at: string | null
}

interface Props {
  slug: string
  sessions: TestSessionRow[]
  totalQuestions: number
  bestScore: number
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
  })
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return ''
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins} min ${secs} sek`
}

export default function TestPreviousResults({
  slug,
  sessions,
  totalQuestions,
  bestScore,
}: Props) {
  if (sessions.length === 0) {
    return (
      <EmptyState
        illustration={IlluPercentil}
        title="Inga resultat än"
        description="Kör testet en gång, så visar vi utvecklingen här och jämför mot alla andra som gjort det."
      />
    )
  }

  return (
    <section className="space-y-2" aria-labelledby="tidigare-resultat">
      <h2 id="tidigare-resultat" className="text-sm font-medium text-ink-3">
        Dina resultat
      </h2>
      <ul className="divide-y divide-kant rounded-xl border border-kant bg-panel">
        {sessions.slice(0, 10).map((s) => {
          const score = s.score ?? 0
          const pct = Math.min(100, Math.round((score / totalQuestions) * 100))
          const isBest = score === bestScore && bestScore > 0
          return (
            <li key={s.id}>
              <Link
                href={testPaths.results(slug, s.id)}
                className="flex min-h-14 items-center gap-3 px-4 py-3 transition-colors duration-[120ms] hover:bg-insunken"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium tabular-nums text-ink-1">
                    {score} av {totalQuestions}
                    <span className="ml-2 font-normal text-ink-2">{pct} procent</span>
                    {isBest ? <span className="ml-2 font-normal text-positiv">Bäst</span> : null}
                  </span>
                  <span className="mt-0.5 block text-meta tabular-nums text-ink-3">
                    {s.completed_at ? formatDate(s.completed_at) : ''}
                    {s.time_spent ? ` · ${formatDuration(s.time_spent)}` : ''}
                  </span>
                </span>
                <span className="shrink-0 text-meta text-ink-3">Genomgång</span>
                <ChevronRight
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-ink-3"
                  strokeWidth={1.75}
                />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
