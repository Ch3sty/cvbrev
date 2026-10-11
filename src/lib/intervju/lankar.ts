/**
 * Adresserna i tråden kring intervjuprovet och personlighetsprovet
 * (docs/design/rod-trad-prov-spec-2026-09-24.md). Klientsäker.
 */

import { kopstegHref } from '@/lib/onboarding/steps'
import { SALD_PLAN } from '@/lib/plans/plans'

/** Hubben Inför intervjun. */
export const INFOR_INTERVJUN_HREF = '/dashboard/intervju'

/** Nytt intervjuprov, valfritt med förvald fråga. */
export function nyttProvHref(fraga?: string): string {
  return fraga ? `/dashboard/intervju/ny?fraga=${encodeURIComponent(fraga)}` : '/dashboard/intervju/ny'
}

/** Resultatsidan för ett intervjuprov. */
export const provHref = (token: string) => `/dashboard/intervju/${token}`

/** Tolkningssidan för personlighetsprovet. */
export const profilHref = (token: string) => `/dashboard/intervju/profil/${token}`

/**
 * Köpsteget för paketet som säljs, Jobbcoach Premium (spec-rummen 17.3).
 * Namnet står kvar från Träningspaketets tid; adressen byggs av kopstegHref
 * så att den följer SALD_PLAN. Platsen intervjuprov följer med till kassans
 * metadata, så att köpet räknas mot väggen (betalvagg_visad i Intervjuprov).
 */
export const TRANINGSPAKET_HREF = kopstegHref(SALD_PLAN, 'intervjuprov')

/** Grundtestet och det fördjupade testet. */
export const GRUNDTEST_HREF = '/dashboard/tester/personlighet-grund'
export const FORDJUPAT_HREF = '/dashboard/tester/personlighet-avancerad'
