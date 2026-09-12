'use client'

/**
 * "Ditt jobbsök": hemskärmens huvudsektion i tillstånd C
 * (docs/plan-inloggat-omdesign.md, avsnitt 4).
 *
 * Fyra beskrivande antal, aldrig svarsfrekvens. En arbetslös med noll svar på
 * tjugo ansökningar ska inte mötas av ett underkänt betyg varje morgon.
 * Svarsfrekvensen bor på ansökningssidan, dit man går aktivt för att analysera.
 *
 * Vid noll aktivitet den här veckan renderas en mening i stället för en rad
 * nollor.
 */

import Link from 'next/link'
import type { ApplicationsSummary } from '@/hooks/useApplicationsSummary'

interface JobbsokOversiktProps {
  summary: ApplicationsSummary
}

/** Rubriken namnger månaden, så siffrorna har ett tidsfönster. */
function monthLabel(now: Date): string {
  const label = new Intl.DateTimeFormat('sv-SE', {
    month: 'long',
    timeZone: 'Europe/Stockholm',
  }).format(now)
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export default function JobbsokOversikt({ summary }: JobbsokOversiktProps) {
  const stats = [
    { label: 'sökta', value: summary.total },
    { label: 'väntar svar', value: summary.waitingCount },
    { label: 'intervju', value: summary.interviewCount },
    { label: 'svar', value: summary.replyCount },
  ]

  return (
    <section
      className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5"
      aria-label="Ditt jobbsök"
    >
      <h2 className="text-base font-semibold tracking-tight text-neutral-900">
        Ditt jobbsök i {monthLabel(new Date()).toLowerCase()}
      </h2>

      {/* Två rader om två på mobil: fyra siffror i rad ger 70 px per kolumn
          och trunkerade etiketter på 375 px. */}
      <dl className="mt-4 grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:items-baseline sm:gap-x-8">
        {stats.map((s) => (
          <div key={s.label} className="min-w-0">
            <dd className="text-2xl font-semibold leading-none tabular-nums text-neutral-900">
              {s.value}
            </dd>
            <dt className="mt-1 truncate text-sm text-neutral-600">{s.label}</dt>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-sm text-neutral-600">
        {summary.weekCount > 0
          ? `${summary.weekCount} ${summary.weekCount === 1 ? 'ansökan' : 'ansökningar'} den här veckan.`
          : 'Du har inte sökt något jobb den här veckan än.'}
      </p>

      <div className="mt-4">
        <Link
          href="/dashboard/sokta-tjanster?ny=1"
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-orange-600 px-4 text-sm font-medium text-white transition-colors hover:bg-orange-700 sm:w-auto"
        >
          Logga ansökan
        </Link>
      </div>
    </section>
  )
}
