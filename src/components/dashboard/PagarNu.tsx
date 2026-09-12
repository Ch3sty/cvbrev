'use client'

/**
 * "Pågår nu": de tre mest tidskänsliga ansökningarna
 * (docs/plan-inloggat-omdesign.md, avsnitt 4).
 *
 * Rader, inte kort. Den enda listan på hemskärmen som är tidskänslig, därför
 * är den också den enda som får plats.
 *
 * Sorteringen sker i useApplicationsSummary: tysta först, sedan intervjuer,
 * sedan äldst.
 */

import Link from 'next/link'
import { STATUS_META } from '@/lib/applications/status'
import type { PipelineItem } from '@/hooks/useApplicationsSummary'
import EmptyState from '@/components/shell/EmptyState'
import { IlluTomAnsokningar } from '@/components/illustrations/EmptyStateIllustrations'

interface PagarNuProps {
  items: PipelineItem[]
  total: number
  /** Antal sparade brev, avgör om importvägen visas i tomt tillstånd. */
  letterCount?: number
}

/** Kort lägesbeskrivning till höger på raden. */
function statusLine(item: PipelineItem): string {
  if (item.needsFollowUp) return `Tyst ${item.days} dagar`
  const meta = item.status ? STATUS_META[item.status] : null
  if (meta) return meta.label
  return item.days === 0 ? 'Sökt idag' : `Sökt ${item.days} dagar sedan`
}

export default function PagarNu({ items, total, letterCount = 0 }: PagarNuProps) {
  if (items.length === 0) {
    // Merparten av befintliga konton har brev men inga loggade ansökningar.
    // Då är importvägen den primära handlingen, inte det generiska tomma läget.
    const hasLetters = letterCount > 0
    return (
      <EmptyState
        illustration={IlluTomAnsokningar}
        title={hasLetters ? `Vi hittade ${letterCount} brev` : 'Inga ansökningar än'}
        description={
          hasLetters
            ? 'Lägg in dem som ansökningar så håller vi koll på svaren åt dig.'
            : 'Logga den första så håller vi koll på svaren.'
        }
        action={
          <Link
            href={hasLetters ? '/dashboard/sokta-tjanster?import=1' : '/dashboard/sokta-tjanster?ny=1'}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-orange-600 px-4 text-sm font-medium text-white transition-colors hover:bg-orange-700"
          >
            {hasLetters ? 'Lägg in dem' : 'Logga en ansökan'}
          </Link>
        }
      />
    )
  }

  return (
    <section
      className="rounded-xl border border-neutral-200 bg-white"
      aria-label="Pågående ansökningar"
    >
      <h2 className="border-b border-neutral-200 px-4 py-3 text-base font-semibold tracking-tight text-neutral-900">
        Pågår nu
      </h2>

      <ul>
        {items.map((item) => (
          <li key={item.id} className="border-b border-neutral-200 last:border-b-0">
            <Link
              href={`/dashboard/sokta-tjanster/${item.id}`}
              className="flex min-h-11 items-center gap-3 px-4 py-3 transition-colors hover:bg-neutral-50"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-neutral-900">
                  {item.jobTitle}
                </span>
                <span className="block truncate text-sm text-neutral-600">
                  {item.company}
                </span>
              </span>

              <span
                className={`shrink-0 text-sm tabular-nums ${
                  item.needsFollowUp ? 'font-medium text-neutral-900' : 'text-neutral-600'
                }`}
              >
                {statusLine(item)}
              </span>

              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                className="shrink-0 text-neutral-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>

      {total > items.length ? (
        <div className="px-4 py-3">
          <Link
            href="/dashboard/sokta-tjanster"
            className="text-sm font-medium text-neutral-600 underline-offset-4 transition-colors hover:text-neutral-900 hover:underline"
          >
            Se alla ({total})
          </Link>
        </div>
      ) : null}
    </section>
  )
}
