'use client'

/**
 * "Ditt jobbsök": hemskärmens huvudsektion i tillstånd C
 * (docs/design/koncept-2026-09-13.md, ram 1).
 *
 * Fyra beskrivande antal i 40/500, fyra i bredd redan på 375 px. Aldrig
 * svarsfrekvens: den bor på ansökningssidan dit man går för att analysera.
 * Vyns enda primära knapp, i ink.
 */

import Link from 'next/link'
import type { ApplicationsSummary } from '@/hooks/useApplicationsSummary'

interface JobbsokOversiktProps {
  summary: ApplicationsSummary
}

/** Rubriken namnger månaden, så siffrorna har ett tidsfönster. */
function monthLabel(now: Date): string {
  return new Intl.DateTimeFormat('sv-SE', { month: 'long', timeZone: 'Europe/Stockholm' }).format(now)
}

export default function JobbsokOversikt({ summary }: JobbsokOversiktProps) {
  const stats = [
    { label: 'sökta', value: summary.total },
    { label: 'väntar svar', value: summary.waitingCount },
    { label: 'intervju', value: summary.interviewCount },
    { label: 'svar', value: summary.replyCount },
  ]

  return (
    <section className="rounded-xl border border-kant bg-panel p-4 sm:p-5" aria-label="Ditt jobbsök">
      <h2 className="text-kort text-ink-1">Ditt jobbsök i {monthLabel(new Date())}</h2>

      <dl className="mt-4 grid grid-cols-4 gap-2 sm:gap-6">
        {stats.map((s) => (
          <div key={s.label} className="min-w-0">
            <dd className="text-tal text-ink-1">{s.value}</dd>
            <dt className="mt-1 truncate text-meta text-ink-3">{s.label}</dt>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-sm leading-[22px] text-ink-2">
        {summary.weekCount > 0
          ? `${summary.weekCount} ${summary.weekCount === 1 ? 'ansökan' : 'ansökningar'} den här veckan.`
          : 'Du har inte sökt något jobb den här veckan än.'}
      </p>

      <div className="mt-4">
        <Link
          href="/dashboard/sokta-tjanster?ny=1"
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-hover sm:w-auto"
        >
          Logga ansökan
        </Link>
      </div>
    </section>
  )
}
