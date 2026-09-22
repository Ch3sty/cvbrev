// Avvecklad provperiod. Kvar bara för att känna igen befintliga konton.
//
// Reverse trial är borta (docs/plan-paket-och-onboarding.md, ägarens beslut
// 3). Inga nya trials delas ut: post-signup ger ingen premium längre och
// /api/trial/auto-activate är raderad. Konton som redan bär premium_source
// 'signup_trial' eller 'oauth_signup_trial' löper ut av sig själva via
// nedgraderingen i pricing-sync, och tills dess måste två vyer kunna känna
// igen dem för att visa rätt sak efter utgången.
//
// TRIAL_PRICE_FROM, daysLeft och daysLeftPhrase låg här tidigare. De lästes
// bara av TrialStatusRow, TrialRow och TrialRowConnected, som alla är
// raderade i paketomgången, så de är borta. Kvar står listan över
// premium_source-värden och ingenting mer.
//
// När det sista trialkontot löpt ut kan filen raderas, och med den de två
// villkoren i DowngradedNotice och ProfilKomplettering.

/** premium_source för de två reverse trial-vägarna. */
export const TRIAL_SOURCES = ['signup_trial', 'oauth_signup_trial'] as const

export function isTrialSource(premiumSource: string | null | undefined): boolean {
  return TRIAL_SOURCES.includes((premiumSource ?? '') as (typeof TRIAL_SOURCES)[number])
}
