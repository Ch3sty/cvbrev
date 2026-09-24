/**
 * Vad ett paketbyte på en löpande prenumeration ska bli
 * (docs/qa/qa-kop-testlage-2026-09-24.md, "Kvar": sidledes byte).
 *
 * create-upgrade-session frågar den här funktionen innan den rör Stripe.
 * Fyra utfall:
 *
 *   uppgradering  CV-paketet eller Träningspaketet till Hela paketet. Priset
 *                 byts direkt och mellanskillnaden faktureras (always_invoice).
 *   sidbyte       CV-paketet och Träningspaketet sinsemellan. Samma belopp och
 *                 samma längd, så priset byts direkt utan proration och utan
 *                 faktura. Nästa dragning står kvar på samma datum.
 *   vidFornyelse  Från Hela paketet till ett av spåren, eller en annan längd på
 *                 Hela paketet. Går inte direkt: kunden har betalat för
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

  // Hela paketet till Hela paketet i en annan längd.
  return { typ: 'vidFornyelse', skal: 'langd' }
}
