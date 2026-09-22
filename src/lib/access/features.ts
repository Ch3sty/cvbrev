/**
 * Featuretabellen (docs/plan-paket-och-onboarding.md avsnitt 5).
 *
 * En feature är en sak användaren kan göra. Ett scope är paketet hon köpt.
 * Tabellen nedan är den enda platsen där de två möts: rutter och komponenter
 * frågar efter en feature, aldrig efter ett scope direkt. Då går det att
 * flytta en funktion mellan paket utan att leta rätt på tio villkor.
 *
 * Klientsäker: ren data och rena funktioner, inga env-variabler och ingen
 * Supabase-klient. Behörighetskontrollen mot databasen bor i
 * src/lib/supabase/premiumAccess.ts.
 */

/** Paketen. Null är gratisnivån och finns därför inte här. */
export type Scope = 'cv' | 'tester' | 'allt'

/** Allt användaren kan ta i som kostar pengar. */
export type Feature =
  | 'cv_templates_all'
  | 'cv_export'
  | 'cv_analysis_full'
  | 'letter_download'
  | 'tests_above_base'
  | 'test_exam_mode'
  | 'test_history'
  | 'chat_unlimited'
  | 'job_matches_all'
  | 'bli_upptackt'
  | 'linkedin'

/**
 * Feature till de scope som ger den.
 *
 * Brevet ligger i CV-spåret, inte i Allt: den som laddar ned en mall ska
 * kunna skicka in hela ansökan samma kväll, och en ansökan är CV plus brev
 * (avsnitt 3). Testspåret får inget brev.
 */
export const FEATURES: Record<Feature, readonly Scope[]> = {
  cv_templates_all: ['cv', 'allt'],
  cv_export: ['cv', 'allt'],
  cv_analysis_full: ['cv', 'allt'],
  letter_download: ['cv', 'allt'],
  tests_above_base: ['tester', 'allt'],
  test_exam_mode: ['tester', 'allt'],
  test_history: ['tester', 'allt'],
  chat_unlimited: ['allt'],
  job_matches_all: ['allt'],
  bli_upptackt: ['allt'],
  // LinkedIn-profilen följer CV-spåret (spec-onboarding sektion 3 och 5).
  linkedin: ['cv', 'allt'],
} as const

/** Alla featurenamn, för tester och för att rita listor. */
export const ALLA_FEATURES = Object.keys(FEATURES) as readonly Feature[]

/** Ger scopet den här funktionen? */
export function scopeHasFeature(scope: Scope | null | undefined, feature: Feature): boolean {
  if (!scope) return false
  const scopes = FEATURES[feature]
  if (!scopes) return false
  return scopes.includes(scope)
}

/**
 * Paketnycklarna. Sex nycklar, men bara tre val i gränssnittet: spåret först,
 * längden efteråt. Namnen står i bestämd form (ägarens beslut 6).
 *
 * Typen speglar PlanKey i src/lib/plans/plans.ts, som B1b skriver om. Den
 * står som en egen strängunion här så att features.ts inte drar in
 * prisstegen, och så att den här filen går att testa utan Stripe.
 */
export type PlanKeyNamn =
  | 'cv_week'
  | 'test_week'
  | 'all_day'
  | 'all_week'
  | 'all_month'
  | 'all_quarter'

/**
 * Vilket paket betalväggen ska föreslå när en feature tar i taket.
 *
 * Två regler, i den ordningen. Har hon valt spåret Allt föreslår vi alltid
 * Allt-veckan: en Allt-köpare ska aldrig skickas tillbaka till ett spår.
 * Annars föreslår vi det spår som faktiskt innehåller funktionen, alltså
 * CV-veckan för CV-funktioner och Testveckan för testfunktioner. Funktioner
 * som bara Allt ger föreslår Allt-veckan.
 *
 * Ren funktion med flit: den anropas i renderingen av varje betalvägg, och
 * förslaget ska gå att testa utan en databas.
 */
export function suggestPlan(
  feature: Feature,
  onboardingTrack?: Scope | null
): PlanKeyNamn {
  if (onboardingTrack === 'allt') return 'all_week'

  const scopes = FEATURES[feature]
  if (scopes.includes('cv')) return 'cv_week'
  if (scopes.includes('tester')) return 'test_week'
  return 'all_week'
}
