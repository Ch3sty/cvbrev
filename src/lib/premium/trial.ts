// Avvecklad provperiod, kvar bara för att läsa befintliga konton.
//
// Reverse trial är borta (docs/plan-paket-och-onboarding.md, ägarens beslut
// 3). Inga nya trials delas ut: post-signup ger ingen premium längre och
// /api/trial/auto-activate är raderad. Konton som redan bär premium_source
// 'signup_trial' eller 'oauth_signup_trial' löper ut av sig själva via
// nedgraderingen i pricing-sync, och tills dess måste gränssnittet kunna
// räkna ut hur länge de har kvar. Det är allt den här filen gör.
//
// När det sista trialkontot löpt ut kan filen raderas.

/** premium_source för de två reverse trial-vägarna. */
export const TRIAL_SOURCES = ['signup_trial', 'oauth_signup_trial'] as const

/**
 * Billigaste vägen vidare, alltså Allt-dagen. Skrivs alltid som "från",
 * aldrig som hela priset. Står kvar tills B3 tagit bort TrialStatusRow och
 * TrialRow, som är de enda två ytor som läser den.
 */
export const TRIAL_PRICE_FROM = 'från 49 kr'

export function isTrialSource(premiumSource: string | null | undefined): boolean {
  return TRIAL_SOURCES.includes((premiumSource ?? '') as (typeof TRIAL_SOURCES)[number])
}

/**
 * Hela dygn kvar. Sista dygnet ger 0, utgången ger -1.
 */
export function daysLeft(until: Date, now: Date = new Date()): number {
  const ms = until.getTime() - now.getTime()
  if (ms <= 0) return -1
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)) - 1)
}

/**
 * "3 dagar kvar", "en dag kvar", "sista dagen". Vi skriver ut ettan i ord
 * eftersom siffran annars läses som en kvot.
 */
export function daysLeftPhrase(left: number): string {
  if (left <= 0) return 'sista dagen'
  if (left === 1) return 'en dag kvar'
  return `${left} dagar kvar`
}
