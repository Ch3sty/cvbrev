'use client'

/**
 * Kvotraden i tillstånd C (docs/plan-inloggat-saljflode.md, punkt 7).
 *
 * Tidigare visade den bara brevkvoten och bara när den var slut. Nu visar den
 * brev, analys, chatt, tester och sparade brev, alltid när användaren är
 * gratis. Poängen är att taket ska vara begripligt innan det tar slut, så att
 * köpimpulsen flyttar från frustration till planering.
 *
 * Fyra siffror får inte bli fyra kort. En rad på desktop, en lista på mobil.
 * Siffrorna hämtas från /api/quota/status som återanvänder quotaService, så
 * raden och spärrarna aldrig kan visa olika värden.
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

  return (
    <section
      className={`bg-white rounded-xl border border-neutral-200 px-4 py-3 ${className ?? ''}`}
      aria-label="Din kvot idag"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <dl className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-2 sm:gap-6">
          {status.items.map((item) => (
            <QuotaCell key={item.key} item={item} />
          ))}
        </dl>

        <Link
          href={PREMIUM_HREF}
          className="text-sm font-medium text-neutral-600 hover:text-neutral-900 underline-offset-4 hover:underline shrink-0"
        >
          Se vad Premium ger
        </Link>
      </div>
    </section>
  )
}

/**
 * En kvot. Full kvot markeras med vikt och färg på siffran, aldrig med
 * orange bakgrund: vi markerar, vi larmar inte.
 */
function QuotaCell({ item }: { item: QuotaItem }) {
  const isFull = item.limit !== null && item.used >= item.limit

  return (
    <div className="flex items-baseline justify-between sm:justify-start gap-2 min-w-0">
      <dt className="text-sm text-neutral-600 truncate">{item.label}</dt>
      <dd
        className={`text-sm tabular-nums whitespace-nowrap ${
          isFull ? 'font-semibold text-neutral-900' : 'text-neutral-700'
        }`}
      >
        {item.limit === null ? item.used : `${item.used}/${item.limit}`}
      </dd>
    </div>
  )
}
