/**
 * Vad ett paketbyte på en löpande prenumeration ska bli
 * (docs/qa/qa-kop-testlage-2026-09-24.md, "Kvar": sidledes byte).
 *
 * create-upgrade-session frågar den här funktionen innan den rör Stripe.
 * Sedan 2026-10-11 avvisar rutten ett osålt mål med 400 innan den frågar
 * (spec-rummen 17.3), så i praktiken når bara uppgraderingen till Premium
 * per månad hit. Regeln står kvar oförändrad för befintliga prenumerationer.
 * Fyra utfall:
 *
 *   uppgradering  CV-paketet eller Träningspaketet till Jobbcoach Premium. Priset
 *                 byts direkt och mellanskillnaden faktureras (always_invoice).
 *   sidbyte       CV-paketet och Träningspaketet sinsemellan. Samma belopp och
 *                 samma längd, så priset byts direkt utan proration och utan
 *                 faktura. Nästa dragning står kvar på samma datum.
 *   vidFornyelse  Från Jobbcoach Premium till ett av spåren, eller en annan längd på
 *                 Jobbcoach Premium. Går inte direkt: kunden har betalat för
 *                 perioden hon är i. Det finns inget schemalagt byte i appen,
 *                 så svaret är ett besked och en länk till kundportalen.
 *   dubblett      Samma paket en gång till, eller ett pris vi inte känner
 *                 igen. Samma 409 som förut.
 *
 * Planen (docs/plan-paket-och-onboarding.md, PR11) beskrev spårbytet som
 * "säg upp och köp det andra", men dubblettspärren stoppar ett nytt köp så
 * länge den gamla perioden löper. Sidbytet här ersätter den vägen.
 */
import { PLAN_BY_KEY, type PlanKey } from '@/lib/plans/plans'

export type BytVal =
  | { typ: 'uppgradering' }
  | { typ: 'sidbyte' }
  | { typ: 'vidFornyelse'; skal: 'nedgradering' | 'langd' }
  | { typ: 'dubblett' }

export function valjByte(nu: PlanKey | null, onskat: PlanKey | null): BytVal {
  if (!nu || !onskat || nu === onskat) return { typ: 'dubblett' }

  const fran = PLAN_BY_KEY[nu]
  const till = PLAN_BY_KEY[onskat]
  if (fran.mode !== 'subscription' || till.mode !== 'subscription') return { typ: 'dubblett' }

  const franSpar = fran.scope !== 'allt'
  const tillSpar = till.scope !== 'allt'

  if (franSpar && !tillSpar) return { typ: 'uppgradering' }

  if (franSpar && tillSpar) {
    // Ett sidbyte kräver samma belopp och samma längd. Annars är det en
    // prisändring mitt i en betald period, och den gör vi inte tyst.
    return fran.amount === till.amount && fran.length === till.length
      ? { typ: 'sidbyte' }
      : { typ: 'vidFornyelse', skal: 'nedgradering' }
  }

  if (!franSpar && tillSpar) return { typ: 'vidFornyelse', skal: 'nedgradering' }

  // Jobbcoach Premium till Jobbcoach Premium i en annan längd.
  return { typ: 'vidFornyelse', skal: 'langd' }
}
