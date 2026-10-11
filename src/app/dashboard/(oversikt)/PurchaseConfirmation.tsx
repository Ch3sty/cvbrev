'use client'

/**
 * Kvitto efter lyckat köp, på shell/Confirmation: tråden når 100 procent
 * och stannar som panelens överkant. Stripe skickar tillbaka till
 * /dashboard?premium_activated=true&plan=<key>, och användaren ska se exakt
 * vad hon köpt och när nästa dragning sker (copy-premium avsnitt 3):
 *
 *   Tack. Du har Jobbcoach Premium.
 *   Nästa dragning 11 november, 149 kr. Säg upp när du vill i ditt konto.
 *
 * Datumet läses ur prenumerationen (current_period_end), beloppet ur PLANS.
 * Avfärdas av användaren, och försvinner av sig själv från URL:en så en
 * omladdning inte visar den igen.
 */

import { KNAPP_SEKUNDAR_SMAL } from '@/components/shell/knappar'
import { PAKETRADER } from '@/components/paywall/paywall-copy'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PLAN_BY_KEY, isPlanKey } from '@/lib/plans/plans'
import { PREMIUM_HREF } from '@/lib/premium/premiumEntry'
import Confirmation from '@/components/shell/Confirmation'
import { KOPBEKRAFTELSE, kopDatum } from '@/components/pricing/paket-copy'

interface PurchaseConfirmationProps {
  /** plan-parametern från Stripe-returen. */
  plan: string | null
  /** profiles.premium_until, för engångsköp. */
  premiumUntil?: string | null
  /** profiles.current_period_end, för prenumerationer. */
  currentPeriodEnd?: string | null
  onDismiss: () => void
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
  const isRecurring = selected?.mode === 'subscription'

  // Engångsköp tar slut vid premium_until, prenumerationer förnyas vid
  // current_period_end. Saknas datumet säger vi inget om det.
  const dateIso = isRecurring ? currentPeriodEnd ?? premiumUntil : premiumUntil ?? currentPeriodEnd
  const dateText = dateIso ? kopDatum(dateIso) : null

  const body = !selected
    ? PAKETRADER.tackOkant(dateText)
    : isRecurring
      ? KOPBEKRAFTELSE.lopande(selected.key, dateText)
      : KOPBEKRAFTELSE.engangs(selected.name, dateText)

  return (
    <Confirmation
      title={PAKETRADER.tackTitel(selected?.name ?? null)}
      description={body}
      action={
        <Link href="/dashboard/skapa-brev" className={KNAPP_SEKUNDAR_SMAL}>
          {KOPBEKRAFTELSE.skrivBrev}
        </Link>
      }
      secondaryAction={
        <Link href={PREMIUM_HREF} className={LINK}>
          {KOPBEKRAFTELSE.sePrenumeration}
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
        {KOPBEKRAFTELSE.stang}
      </button>
    </Confirmation>
  )
}
