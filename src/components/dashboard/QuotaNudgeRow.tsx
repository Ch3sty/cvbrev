'use client'

/**
 * Diskret rad i tillstånd C när gratiskvoten börjar ta slut
 * (t.ex. "1 av 1 brev använt idag"). Visas bara för gratisanvändare och
 * bara när kvoten faktiskt är slut, så den aldrig blir bakgrundsbrus.
 *
 * Medvetet lågmäld: en rad med border, ingen orange yta, ingen illustration.
 * Den som slår i taket möter betalväggen i själva flödet. Det här är bara
 * en påminnelse om var gränsen går, med en väg vidare för den som vill.
 */

import Link from 'next/link'
import { PREMIUM_HREF } from '@/lib/premium/premiumEntry'
import { DAILY_LIMIT_LETTERS } from '@/lib/quota/quotaService'

interface QuotaNudgeRowProps {
  isPremium: boolean
  /** Antal brev skapade idag. Fältet heter weekly_* men räknar per dygn. */
  lettersToday: number
  className?: string
}

export default function QuotaNudgeRow({
  isPremium,
  lettersToday,
  className,
}: QuotaNudgeRowProps) {
  if (isPremium) return null
  if (lettersToday < DAILY_LIMIT_LETTERS) return null

  return (
    <div
      className={`h-10 rounded-lg border border-neutral-200 bg-white px-3 flex items-center justify-between gap-3 ${className ?? ''}`}
    >
      <span className="text-sm text-neutral-600 truncate">
        <span className="tabular-nums font-medium text-neutral-900">
          {lettersToday} av {DAILY_LIMIT_LETTERS}
        </span>{' '}
        {DAILY_LIMIT_LETTERS === 1 ? 'brev' : 'brev'} använt idag. Ny kvot i morgon.
      </span>
      <Link
        href={PREMIUM_HREF}
        className="text-sm font-medium text-neutral-600 hover:text-neutral-900 underline-offset-4 hover:underline shrink-0"
      >
        Skriv fler
      </Link>
    </div>
  )
}
