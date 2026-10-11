/**
 * Platsen ett köp startade på (spec-rummen avsnitt 7, våg 5), ur
 * metadata.source på Stripe-sessionen eller prenumerationen.
 *
 * Köpsteget skickar source "betalvagg:<plats>" när köpet kom från en
 * betalvägg ("betalvagg:matning"), och då är platsen delen efter kolonet.
 * Annars är source själva platsen ("priser", "registrering",
 * "onboarding_paket"). Saknas source finns ingen plats.
 *
 * Webhooken lägger värdet som egenskapen plats på subscription_paid, så att
 * köp kan räknas per betalväggsexponering (betalvagg_visad).
 */
export function platsUrSource(source: unknown): string | undefined {
  if (typeof source !== 'string' || !source) return undefined
  if (!source.startsWith('betalvagg:')) return source
  return source.slice('betalvagg:'.length) || undefined
}
