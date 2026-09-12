'use client'

/**
 * DashboardStatusRow (docs/plan-konvertering.md, B4, tillstånd C).
 *
 * En rad med de fyra siffror som säger något om hur sökandet går, plus vyns
 * enda primära handling. Två rader på mobil, en på desktop.
 */

import Link from 'next/link'

interface DashboardStatusRowProps {
  letters: number
  applications: number
  replies: number
  streakDays: number
  ctaHref?: string
  ctaLabel?: string
}

export default function DashboardStatusRow({
  letters,
  applications,
  replies,
  streakDays,
  ctaHref = '/dashboard/skapa-brev',
  ctaLabel = 'Skapa nytt brev',
}: DashboardStatusRowProps) {
  const stats = [
    { label: 'Brev', value: String(letters) },
    { label: 'Ansökningar', value: String(applications) },
    { label: 'Svar', value: String(replies) },
    { label: 'Streak', value: `${streakDays} d` },
  ]

  return (
    <section
      className="bg-white rounded-xl border border-neutral-200 p-4 motion-safe:animate-[slideUp_200ms_ease-out_both]"
      aria-label="Din översikt"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <dl className="flex items-center gap-5 sm:gap-7 flex-1 min-w-0">
          {stats.map((stat) => (
            <div key={stat.label} className="min-w-0">
              <dd className="text-lg font-semibold text-neutral-900 tabular-nums leading-tight">
                {stat.value}
              </dd>
              <dt className="text-sm text-neutral-600 truncate">{stat.label}</dt>
            </div>
          ))}
        </dl>

        <Link
          href={ctaHref}
          className="inline-flex items-center justify-center h-11 px-4 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors w-full sm:w-auto shrink-0"
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  )
}
