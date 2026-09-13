'use client'

/**
 * Kvotraden i tillstånd C: status är en rad, aldrig ett kort.
 *
 * Visar brev, analys, chatt, tester och sparade brev för gratiskonton, så att
 * taket är begripligt innan det tar slut. Full kvot markeras med vikt på
 * siffran, aldrig med färgad bakgrund. Siffrorna kommer från
 * /api/quota/status som återanvänder quotaService.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PREMIUM_HREF } from '@/lib/premium/premiumEntry'

interface QuotaItem {
  key: string
  label: string
  used: number
  limit: number | null
  nextResetAt: string | null
}

interface QuotaStatus {
  isPremium: boolean
  items: QuotaItem[]
}

interface QuotaNudgeRowProps {
  isPremium: boolean
  className?: string
}

export default function QuotaNudgeRow({ isPremium, className }: QuotaNudgeRowProps) {
  const [status, setStatus] = useState<QuotaStatus | null>(null)

  useEffect(() => {
    if (isPremium) return
    let cancelled = false

    const load = async () => {
      try {
        const res = await fetch('/api/quota/status')
        if (!res.ok) return
        const data = (await res.json()) as QuotaStatus
        if (!cancelled) setStatus(data)
      } catch {
        // Kvotraden är information, inte funktion. Fel tystas.
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [isPremium])

  if (isPremium) return null
  if (!status || status.isPremium || status.items.length === 0) return null

  const anyFull = status.items.some((i) => i.limit !== null && i.used >= i.limit)

  return (
    <section
      className={`flex min-h-11 flex-col gap-2 rounded-lg border border-kant bg-panel px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 ${className ?? ''}`}
      aria-label="Din kvot idag"
    >
      <dl className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1">
        <span className={`h-2 w-2 shrink-0 rounded-full ${anyFull ? 'bg-ink-1' : 'bg-ink-3'}`} aria-hidden="true" />
        {status.items.map((item) => {
          const isFull = item.limit !== null && item.used >= item.limit
          return (
            <div key={item.key} className="flex items-baseline gap-1.5">
              <dt className="text-sm text-ink-2">{item.label}</dt>
              <dd className={`text-sm tabular-nums ${isFull ? 'font-medium text-ink-1' : 'text-ink-2'}`}>
                {item.limit === null ? item.used : `${item.used}/${item.limit}`}
              </dd>
            </div>
          )
        })}
      </dl>

      <Link
        href={PREMIUM_HREF}
        className="shrink-0 text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1"
      >
        Se Premium
      </Link>
    </section>
  )
}
