'use client'

/**
 * "Pågår nu": de mest tidskänsliga ansökningarna som rader direkt på mark
 * (regel 4 och 6 i docs/design/analys-visuell-linje-2026-09-22.html).
 *
 * Varje rad säger vad som hänt i användarens ord och erbjuder nästa steg:
 * "BAUHAUS · Butikssäljare / Sökt för 54 dagar sedan, inget svar än /
 * Följ upp". Sorteringen sker i summeringen: tysta först, sedan intervjuer,
 * sedan äldst.
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

const INTERVJU = new Set(['interview_invited', 'interview_completed', 'trial_work_completed'])

function dagar(n: number): string {
  if (n === 0) return 'i dag'
  if (n === 1) return 'i går'
  return `för ${n} dagar sedan`
}

/** Raden under företaget: vad som hänt, i användarens ord. */
function lage(item: PipelineItem): { text: string; ton: string } {
  if (item.status && INTERVJU.has(item.status)) {
    return { text: STATUS_META[item.status]?.label ?? 'Intervju', ton: 'text-positiv' }
  }
  if (item.needsFollowUp) return { text: `Sökt ${dagar(item.days)}, inget svar än`, ton: 'text-ink-2' }
  const meta = item.status ? STATUS_META[item.status] : null
  if (meta && item.status !== 'applied') return { text: meta.label, ton: 'text-ink-2' }
  return { text: `Sökt ${dagar(item.days)}`, ton: 'text-ink-3' }
}

const BTN =
  'inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover'

export default function PagarNu({ items, total, letterCount = 0 }: PagarNuProps) {
  if (items.length === 0) {
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
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium text-ink-3">Pågår nu</h2>
        {total > items.length ? (
          <Link
            href="/dashboard/sokta-tjanster"
            className="text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
          >
            Alla {total}
          </Link>
        ) : null}
      </div>

      <ul className="mt-2 divide-y divide-kant border-y border-kant">
        {items.map((item) => {
          const l = lage(item)
          return (
            <li key={item.id} className="flex min-h-14 items-center gap-3 py-3">
              <Link href={`/dashboard/sokta-tjanster/${item.id}`} className="group min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-ink-1 group-hover:underline group-hover:decoration-kant-stark group-hover:underline-offset-4">
                  {item.company} · {item.jobTitle}
                </span>
                <span className={`block truncate text-meta ${l.ton}`}>{l.text}</span>
              </Link>
              {item.needsFollowUp ? (
                <Link
                  href={`/dashboard/sokta-tjanster/${item.id}`}
                  className="inline-flex min-h-11 shrink-0 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
                >
                  Följ upp
                </Link>
              ) : null}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
