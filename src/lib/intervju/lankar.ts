/**
 * Adresserna i tråden kring intervjuprovet och personlighetsprovet
 * (docs/design/rod-trad-prov-spec-2026-09-24.md). Klientsäker.
 */

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
 * Köpsteget med Träningspaketet förvalt (ägarens beslut 7, 2026-09-24).
 * Köpvägen läser ?paket=<planKey> i /dashboard/valj-spar, samma parameter
 * som prissidan och betalväggarna använder (docs/bygg-noter-paket.md).
 */
export const TRANINGSPAKET_HREF = '/dashboard/valj-spar?paket=test_week'

/** Grundtestet och det fördjupade testet. */
export const GRUNDTEST_HREF = '/dashboard/tester/personlighet-grund'
export const FORDJUPAT_HREF = '/dashboard/tester/personlighet-avancerad'
