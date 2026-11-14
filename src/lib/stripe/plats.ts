import { arMittTest } from '@/lib/traning/mittTest'

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

const KALLA_FORMAT = /^(smakprov|artikel):[a-z0-9-]{1,100}$|^hubb$/

/**
 * Källan och valet ur kassans metadata (kopKalla.server.ts), som egenskaper
 * på subscription_paid (H1, 2026-11-14). Samma namn som på betalvagg_visad
 * och paywall_cta_clicked, så att köpet går att läsa per källa och val i
 * PostHog utan Supabase. Allt som inte ser ut som en källa eller ett val
 * faller bort.
 */
export function kopKallaUrMetadata(
  metadata: Record<string, string | undefined | null> | null | undefined,
): { konto_kalla?: string; mitt_test?: string } {
  if (!metadata) return {}
  const kalla = metadata.konto_kalla
  const val = metadata.mitt_test
  return {
    ...(typeof kalla === 'string' && KALLA_FORMAT.test(kalla) ? { konto_kalla: kalla } : {}),
    ...(arMittTest(val) ? { mitt_test: val } : {}),
  }
}
