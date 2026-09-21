// Provperioden, delad mellan statusraden på hemskärmen och raden som visas
// ovanför varje premiumhandling (docs/plan-konvertering.md, docs/rapporter/
// analys-effekt-2026-09-21.md).
//
// Bakgrund: med reverse trial har 19 av 20 nya konton aktiv Premium, och
// betalväggarna renderar null för premium. Ingen såg alltså ett pris innan
// provperioden tog slut. Dagräkningen och prisformuleringen bor här så att
// de två ytorna aldrig kan säga olika saker om samma konto.

/** premium_source för de två reverse trial-vägarna. */
export const TRIAL_SOURCES = ['signup_trial', 'oauth_signup_trial'] as const

/**
 * Billigaste vägen vidare i prisstegen: dagspasset (docs/plan-konvertering.md,
 * "Prisstege"). Skrivs alltid som "från", aldrig som hela priset.
 */
export const TRIAL_PRICE_FROM = 'från 49 kr'

export function isTrialSource(premiumSource: string | null | undefined): boolean {
  return TRIAL_SOURCES.includes((premiumSource ?? '') as (typeof TRIAL_SOURCES)[number])
}

/**
 * Hela dygn kvar. Sista dygnet ger 0, utgången ger -1.
 * Samma räkning som TrialStatusRow har använt sedan dashboardomgången.
 */
export function daysLeft(until: Date, now: Date = new Date()): number {
  const ms = until.getTime() - now.getTime()
  if (ms <= 0) return -1
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)) - 1)
}

/**
 * "3 dagar kvar", "En dag kvar", "sista dagen". Vi skriver ut ettan i ord
 * eftersom siffran annars läses som en kvot, och håller resten som siffra
 * (tonprincip 4: siffror bara när koden backar dem, och den här gör det).
 */
export function daysLeftPhrase(left: number): string {
  if (left <= 0) return 'sista dagen'
  if (left === 1) return 'en dag kvar'
  return `${left} dagar kvar`
}
