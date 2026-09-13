'use client'

/**
 * Kvitto efter lyckat köp, på shell/Confirmation: tråden når 100 procent
 * och stannar som panelens överkant. Stripe skickar tillbaka till
 * /dashboard?premium_activated=true&plan=<key>, och användaren ska se exakt
 * vad hon köpt och till när det gäller.
 *
 * Avfärdas av användaren, och försvinner av sig själv från URL:en så en
 * omladdning inte visar den igen.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PLAN_BY_KEY, isPlanKey } from '@/lib/plans/plans'
import { PREMIUM_HREF } from '@/lib/premium/premiumEntry'
import Confirmation from '@/components/shell/Confirmation'

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
  return new Date(iso).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })
}

const LINK = 'inline-flex min-h-11 items-center text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1'

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
      return dateText ? `Premium är aktivt till och med ${dateText}.` : 'Premium är aktivt. Allt är upplåst.'
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
    <Confirmation
      title="Tack. Premium är aktiverat."
      description={body}
      action={
        <Link
          href="/dashboard/skapa-brev"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-hover"
        >
          Skriv ett brev
        </Link>
      }
      secondaryAction={
        <Link href={PREMIUM_HREF} className={LINK}>
          Se din prenumeration
        </Link>
      }
    >
      <button
        type="button"
        onClick={() => {
          setVisible(false)
          onDismiss()
        }}
        className={LINK}
      >
        Stäng
      </button>
    </Confirmation>
  )
}
