'use client'

/**
 * Tidigare resultat för ett test. Rader, inte kort, enligt sidmallen.
 * Varje rad går till sin egen resultatsida, så progressionen per nivå syns.
 */

import Link from 'next/link'
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
    <section className="rounded-xl border border-neutral-200 bg-white">
      <h2 className="border-b border-neutral-200 px-4 py-3 text-base font-semibold text-neutral-900 sm:px-6">
        Dina resultat
      </h2>
      <ul className="divide-y divide-neutral-200">
        {sessions.slice(0, 10).map((s) => {
          const score = s.score ?? 0
          const pct = Math.min(100, Math.round((score / totalQuestions) * 100))
          const isBest = score === bestScore && bestScore > 0
          return (
            <li key={s.id}>
              <Link
                href={testPaths.results(slug, s.id)}
                className="flex min-h-11 items-center justify-between gap-3 px-4 py-3 hover:bg-neutral-50 sm:px-6"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium tabular-nums text-neutral-900">
                    {score} av {totalQuestions}
                    <span className="ml-2 font-normal text-neutral-600">
                      {pct} procent
                    </span>
                    {isBest ? (
                      <span className="ml-2 font-normal text-emerald-700">Bäst</span>
                    ) : null}
                  </span>
                  <span className="mt-1 block text-xs tabular-nums text-neutral-500">
                    {s.completed_at ? formatDate(s.completed_at) : ''}
                    {s.time_spent ? ` · ${formatDuration(s.time_spent)}` : ''}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-medium text-neutral-600">
                  Genomgång
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
