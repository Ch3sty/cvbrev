'use client'

/**
 * Kvitto efter lyckat köp. Stripe skickar tillbaka till
 * /dashboard?premium_activated=true&plan=<key>, och då ska användaren se
 * exakt vad hon köpt och till när det gäller, inte bara en toast som
 * försvinner.
 *
 * Avfärdas av användaren, och försvinner av sig själv från URL:en så en
 * omladdning inte visar den igen.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PLAN_BY_KEY, isPlanKey } from '@/lib/plans/plans'
import { PREMIUM_HREF } from '@/lib/premium/premiumEntry'

interface PurchaseConfirmationProps {
  /** plan-parametern från Stripe-returen. */
  plan: string | null
  /** profiles.premium_until, för engångsköp. */
  premiumUntil?: string | null
  /** profiles.current_period_end, för prenumerationer. */
  currentPeriodEnd?: string | null
  onDismiss: () => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function PurchaseConfirmation({
  plan,
  premiumUntil,
  currentPeriodEnd,
  onDismiss,
}: PurchaseConfirmationProps) {
  const [visible, setVisible] = useState(true)

  // Städa bort parametrarna direkt, så en omladdning inte upprepar kvittot.
  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.delete('premium_activated')
    url.searchParams.delete('plan')
    window.history.replaceState({}, '', url.toString())
  }, [])

  if (!visible) return null

  const selected = isPlanKey(plan) ? PLAN_BY_KEY[plan] : null
  const isRecurring = selected?.kind === 'recurring'

  // Engångsköp tar slut vid premium_until, prenumerationer förnyas vid
  // current_period_end. Saknas datumet säger vi inget om det.
  const dateIso = isRecurring ? currentPeriodEnd ?? premiumUntil : premiumUntil ?? currentPeriodEnd
  const dateText = dateIso ? formatDate(dateIso) : null

  const body = (() => {
    if (!selected) {
      return dateText
        ? `Premium är aktivt till och med ${dateText}.`
        : 'Premium är aktivt. Allt är upplåst.'
    }
    if (isRecurring) {
      return dateText
        ? `${selected.name} är aktiv. Nästa debitering ${dateText}. Du kan avsluta när du vill.`
        : `${selected.name} är aktiv. Du kan avsluta när du vill.`
    }
    return dateText
      ? `${selected.name} gäller till och med ${dateText}. Inget dras automatiskt efter det.`
      : `${selected.name} är aktiverat. Inget dras automatiskt.`
  })()

  return (
    <section
      className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5"
      aria-label="Köpet är klart"
    >
      <div className="flex items-start gap-4">
        <span
          className="shrink-0 h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="#EA580C"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12.5l5 5 11-11" />
          </svg>
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-neutral-900 tracking-tight">
            Tack. Premium är aktiverat.
          </h3>
          <p className="text-sm text-neutral-600 mt-1 leading-relaxed">{body}</p>
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
            <Link
              href="/dashboard/skapa-brev"
              className="inline-flex items-center justify-center h-11 px-4 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors w-full sm:w-auto"
            >
              Skriv ett brev
            </Link>
            <Link
              href={PREMIUM_HREF}
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 underline-offset-4 hover:underline"
            >
              Se din prenumeration
            </Link>
            <button
              type="button"
              onClick={() => {
                setVisible(false)
                onDismiss()
              }}
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 underline-offset-4 hover:underline sm:ml-auto"
            >
              Stäng
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
