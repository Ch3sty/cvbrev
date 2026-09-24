/**
 * Fält som flyttade i Stripes API-version basil (2025-03-31 och framåt).
 *
 * Webhookens payload renderas i endpointens API-version, inte i den version
 * SDK:n är låst till. Live-endpointen står på 2025-08-27.basil sedan den
 * skapades, medan src/lib/stripe/server.ts ber om 2025-02-24.acacia för egna
 * anrop. Rutten får alltså fakturor i det nya formatet men prenumerationer i
 * det gamla när den själv hämtar dem. Helparna här läser båda.
 *
 * Det som flyttade och som webhooken behöver:
 *
 *   invoice.subscription          invoice.parent.subscription_details.subscription
 *   invoice.subscription_details  invoice.parent.subscription_details (metadata)
 *   invoice.payment_intent        invoice.payments.data[].payment.payment_intent
 *   invoice.charge                invoice.payments.data[].payment.charge
 *   line.price                    line.pricing.price_details.price
 *   subscription.current_period_* subscription.items.data[].current_period_*
 *
 * payments finns bara i payloaden när den är expanderad; saknas den blir
 * svaret null, aldrig ett fel.
 */

type Obj = Record<string, unknown>

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null

/** Ett id som kan komma som sträng eller som expanderat objekt. */
function idOf(v: unknown): string | null {
  if (typeof v === 'string' && v) return v
  if (isObj(v) && typeof v.id === 'string' && v.id) return v.id
  return null
}

/** Prenumerationens id ur en faktura, gamla och nya formatet. */
export function invoiceSubscriptionId(invoice: unknown): string | null {
  if (!isObj(invoice)) return null
  const gammal = idOf(invoice.subscription)
  if (gammal) return gammal
  const parent = invoice.parent
  if (isObj(parent) && isObj(parent.subscription_details)) {
    return idOf(parent.subscription_details.subscription)
  }
  return null
}

/** Prenumerationens metadata som den stod när fakturan skapades. */
export function invoiceSubscriptionMetadata(invoice: unknown): Record<string, string> | null {
  if (!isObj(invoice)) return null
  const parent = invoice.parent
  const ny = isObj(parent) && isObj(parent.subscription_details) ? parent.subscription_details.metadata : null
  const gammal = isObj(invoice.subscription_details) ? invoice.subscription_details.metadata : null
  const m = ny ?? gammal
  return isObj(m) ? (m as Record<string, string>) : null
}

/** Första betalningen på fakturan (basil), eller null när payments inte är expanderad. */
function forstaBetalning(invoice: Obj): Obj | null {
  const payments = invoice.payments
  if (!isObj(payments) || !Array.isArray(payments.data)) return null
  const rad = payments.data.find((p) => isObj(p) && isObj(p.payment)) as Obj | undefined
  return rad && isObj(rad.payment) ? rad.payment : null
}

/** PaymentIntent-id ur en faktura, gamla och nya formatet. */
export function invoicePaymentIntentId(invoice: unknown): string | null {
  if (!isObj(invoice)) return null
  const gammal = idOf(invoice.payment_intent)
  if (gammal) return gammal
  const betalning = forstaBetalning(invoice)
  return betalning ? idOf(betalning.payment_intent) : null
}

/** Charge-id ur en faktura, gamla och nya formatet. */
export function invoiceChargeId(invoice: unknown): string | null {
  if (!isObj(invoice)) return null
  const gammal = idOf(invoice.charge)
  if (gammal) return gammal
  const betalning = forstaBetalning(invoice)
  return betalning ? idOf(betalning.charge) : null
}

/** Första radens pris-id, gamla och nya formatet. */
export function invoiceLinePriceId(invoice: unknown): string | null {
  if (!isObj(invoice) || !isObj(invoice.lines) || !Array.isArray(invoice.lines.data)) return null
  const rad = invoice.lines.data[invoice.lines.data.length - 1]
  if (!isObj(rad)) return null
  const gammal = idOf(rad.price)
  if (gammal) return gammal
  const pricing = rad.pricing
  if (isObj(pricing) && isObj(pricing.price_details)) return idOf(pricing.price_details.price)
  return null
}

/**
 * Perioden fakturan betalar för, som ISO-datum. Radens period finns i båda
 * formaten; fakturans egen period_start/period_end är föregående period för
 * prenumerationer och duger inte till ett kvitto.
 */
export function invoicePeriod(invoice: unknown): { start: string | null; end: string | null } {
  const tom = { start: null, end: null }
  if (!isObj(invoice) || !isObj(invoice.lines) || !Array.isArray(invoice.lines.data)) return tom
  const rad = invoice.lines.data[invoice.lines.data.length - 1]
  if (!isObj(rad) || !isObj(rad.period)) return tom
  const iso = (s: unknown) => (typeof s === 'number' && s > 0 ? new Date(s * 1000).toISOString() : null)
  return { start: iso(rad.period.start), end: iso(rad.period.end) }
}

/** Periodens slut på en prenumeration, i sekunder. acacia på roten, basil på raden. */
export function subscriptionPeriodEnd(subscription: unknown): number | null {
  if (!isObj(subscription)) return null
  if (typeof subscription.current_period_end === 'number') return subscription.current_period_end
  const items = subscription.items
  if (isObj(items) && Array.isArray(items.data)) {
    const slut = items.data
      .map((i) => (isObj(i) && typeof i.current_period_end === 'number' ? i.current_period_end : null))
      .filter((v): v is number => v !== null)
    if (slut.length) return Math.min(...slut)
  }
  return null
}
