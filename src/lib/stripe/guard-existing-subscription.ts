// src/lib/stripe/guard-existing-subscription.ts
// =============================================
// Spärr mot dubbla prenumerationer.
//
// Bakgrund: ingen av checkout-rutterna kontrollerade om användaren redan
// prenumererade. Klickade någon två gånger, eller kom tillbaka till
// prissidan senare, skapades ett abonnemang till på samma Stripe-kund.
// Det hände på riktigt: en kund fick två aktiva prenumerationer och
// debiterades 298 kr i månaden för en tjänst som kostar 149 kr.
//
// Vi frågar alltid Stripe, aldrig bara databasen. profiles.subscription_id
// rymmer en enda rad, så en andra prenumeration är osynlig där.

import { stripe } from '@/lib/stripe/server'

// Statusar som innebär att kunden redan har ett åtagande vi inte får dubblera.
// 'past_due' och 'unpaid' räknas med: prenumerationen lever och Stripe
// fortsätter försöka dra pengar, så ett nytt köp skulle bli en dubblett.
const LIVE_STATUSES = ['active', 'trialing', 'past_due', 'unpaid'] as const

export interface ExistingSubscription {
  id: string
  status: string
  cancelAtPeriodEnd: boolean
}

/**
 * Returnerar kundens levande prenumeration om en sådan finns, annars null.
 *
 * Vid fel mot Stripe returneras null, alltså släpps köpet igenom. Det är ett
 * medvetet val: ett tillfälligt API-fel ska inte hindra en betalande kund
 * från att teckna abonnemang. Dubbletter är sällsynta och åtgärdbara,
 * uteblivna intäkter är det inte.
 */
export async function findLiveSubscription(
  customerId: string
): Promise<ExistingSubscription | null> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 100,
    })

    const live = subscriptions.data.find((s) =>
      (LIVE_STATUSES as readonly string[]).includes(s.status)
    )

    if (!live) return null

    return {
      id: live.id,
      status: live.status,
      cancelAtPeriodEnd: live.cancel_at_period_end,
    }
  } catch (error: any) {
    console.error(
      `[SUBSCRIPTION GUARD] Kunde inte hämta prenumerationer för ${customerId}:`,
      error.message
    )
    return null
  }
}

/**
 * Felsvaret som checkout-rutterna returnerar när kunden redan prenumererar.
 * Klienten får en tydlig text plus en flagga så att den kan länka vidare
 * till Stripe-portalen i stället för att visa ett rått fel.
 */
export function alreadySubscribedResponse(existing: ExistingSubscription) {
  const message = existing.cancelAtPeriodEnd
    ? 'Du har redan en prenumeration som löper ut vid periodens slut. Vill du fortsätta som Premium kan du återaktivera den i prenumerationsportalen.'
    : 'Du har redan en aktiv prenumeration. Hantera den i prenumerationsportalen.'

  return {
    error: message,
    alreadySubscribed: true,
    subscriptionStatus: existing.status,
    manageUrl: '/api/stripe/create-portal-session',
  }
}
