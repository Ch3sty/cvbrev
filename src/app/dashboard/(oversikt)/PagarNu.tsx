'use client'

/**
 * "Pågår nu": de tre mest tidskänsliga ansökningarna
 * (docs/design/koncept-2026-09-13.md, ram 1).
 *
 * Sektionsetikett 14/500 i ink-3 med "Alla N" till höger, sedan rader i en
 * panel. Intervju i positiv, tyst i ink-1. Sorteringen sker i
 * useApplicationsSummary: tysta först, sedan intervjuer, sedan äldst.
 */

import Link from 'next/link'
import { STATUS_META } from '@/lib/applications/status'
import type { PipelineItem } from '@/hooks/useApplicationsSummary'
import EmptyState from '@/components/shell/EmptyState'
import { IlluTomMapp } from '@/components/illustrations/TradenScener'

interface PagarNuProps {
  items: PipelineItem[]
  total: number
  /** Antal sparade brev, avgör om importvägen visas i tomt tillstånd. */
  letterCount?: number
}

const INTERVIEW = new Set(['interview_invited', 'interview_completed', 'trial_work_completed'])

/** Kort lägesbeskrivning under raden. */
function statusLine(item: PipelineItem): { text: string; tone: string } {
  if (item.needsFollowUp) return { text: `Tyst ${item.days} dagar`, tone: 'text-ink-1' }
  const meta = item.status ? STATUS_META[item.status] : null
  if (meta) {
    return {
      text: meta.label,
      tone: item.status && INTERVIEW.has(item.status) ? 'text-positiv' : 'text-ink-3',
    }
  }
  return {
    text: item.days === 0 ? 'Sökt idag' : `Sökt ${item.days} dagar sedan`,
    tone: 'text-ink-3',
  }
}

const BTN = 'inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-hover'

export default function PagarNu({ items, total, letterCount = 0 }: PagarNuProps) {
  if (items.length === 0) {
    // Merparten av befintliga konton har brev men inga loggade ansökningar.
    // Då är importvägen den primära handlingen, inte det generiska tomma läget.
    const hasLetters = letterCount > 0
    return (
      <EmptyState
        illustration={IlluTomMapp}
        title={hasLetters ? `Vi hittade ${letterCount} brev` : 'Inga ansökningar än'}
        description={
          hasLetters
            ? 'Lägg in dem som ansökningar så håller vi koll på svaren åt dig.'
            : 'Logga den första så håller vi koll på svaren.'
        }
        action={
          <Link
            href={hasLetters ? '/dashboard/sokta-tjanster?import=1' : '/dashboard/sokta-tjanster?ny=1'}
            className={BTN}
          >
            {hasLetters ? 'Lägg in dem' : 'Logga en ansökan'}
          </Link>
        }
      />
    )
  }

  return (
    <section aria-label="Pågående ansökningar">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium text-ink-3">Pågår nu</h2>
        {total > items.length ? (
          <Link
            href="/dashboard/sokta-tjanster"
            className="text-meta font-medium text-ink-3 underline decoration-kant-stark underline-offset-4 hover:text-ink-1"
          >
            Alla {total}
          </Link>
        ) : null}
      </div>

      <ul className="rounded-xl border border-kant bg-panel">
        {items.map((item) => {
          const line = statusLine(item)
          return (
            <li key={item.id} className="border-b border-kant last:border-b-0">
              <Link
                href={`/dashboard/sokta-tjanster/${item.id}`}
                className="flex min-h-11 items-center gap-3 px-4 py-3 transition-colors hover:bg-insunken/60"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink-1">
                    {item.company} · {item.jobTitle}
                  </span>
                  <span className={`block truncate text-meta ${line.tone}`}>{line.text}</span>
                </span>

                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  className="shrink-0 text-ink-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
