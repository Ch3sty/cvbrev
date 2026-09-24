// src/lib/onboarding/steps.ts
// Ett enda obligatoriskt onboarding-steg (docs/plan-konvertering.md, B5).
// Enda sanningskällan: OnboardingContext och claim-reward-routen läser härifrån.
//
// Med paketen (docs/plan-paket-och-onboarding.md, avsnitt 6) är "kommit igång"
// definierat per spår, i tre steg. Den spårlösa listan nedan står kvar som
// gratisnivåns definition och som fallback när spåret är okänt.

import type { Track } from './program'

export const REQUIRED_STEPS = ['upload_cv'] as const

export type RequiredStep = (typeof REQUIRED_STEPS)[number]

/**
 * Stripes success_url landar här, aldrig på hemskärmen (Fas 2A flöde 2).
 * B1 sätter success_url, B3 äger vyn. Konstanten är gränssnittet mellan dem.
 */
export const VECKA_START_PATH = '/dashboard/vecka/start'

/**
 * Spårvalet. Nytt konto landar här direkt efter registreringen, aldrig på
 * hemskärmen först (Fas 2A flöde 1, "Placering, och skälet").
 */
export const TRACK_CHOICE_PATH = '/dashboard/valj-spar'

/**
 * Köpsteget för ett paket (QA 2026-09-24, iakttagelse 1). En köpknapp som
 * redan namngett paket och pris går hit direkt, aldrig via produktvalet eller
 * spårvalet. Samtycket och Till betalning står på köpsteget.
 */
export function kopstegHref(plan: string): string {
  return `${TRACK_CHOICE_PATH}?paket=${encodeURIComponent(plan)}&steg=kop`
}

/**
 * Enda landningen efter ett nytt konto, för lösenord och för Google
 * (docs/design/profil-registrering-spec-2026-09-24.md, Del B). Sidan kör
 * hämtkedjan för smakproven och skickar vidare: redirect, paket, förslaget
 * i steg 3 eller spårvalet.
 */
export const VALKOMMEN_PATH = '/dashboard/valkommen'

/**
 * "Kommit igång" per spår, avsnitt 6. Tre steg, alla tre krävs, mätt inom
 * 24 timmar från köp (12 timmar för Dagspasset).
 */
export const REQUIRED_STEPS_BY_TRACK: Record<Track, readonly string[]> = {
  cv: ['upload_cv', 'analyze_cv', 'download_cv_template'],
  tester: ['test_diagnosis', 'test_plan', 'test_day_one'],
  // Allt: ett av spårens tre steg räcker, plus en handling ur det andra.
  // Listan är CV-spårets, och korsningen mäts som download_cv_template eller
  // test_diagnosis beroende på vilket spår användaren körde.
  allt: ['upload_cv', 'analyze_cv', 'download_cv_template'],
} as const

/** Stegen för ett spår, med fallback till den spårlösa listan. */
export function requiredStepsForTrack(track: Track | null | undefined): readonly string[] {
  if (!track) return REQUIRED_STEPS
  return REQUIRED_STEPS_BY_TRACK[track]
}

/** Hur många av spårets steg som är klara. */
export function countTrackStepsCompleted(
  track: Track | null | undefined,
  completedSteps: readonly string[]
): number {
  return requiredStepsForTrack(track).filter((step) => completedSteps.includes(step)).length
}

/** Är spårets onboarding klar? */
export function isTrackOnboardingComplete(
  track: Track | null | undefined,
  completedSteps: readonly string[]
): boolean {
  const steps = requiredStepsForTrack(track)
  return steps.every((step) => completedSteps.includes(step))
}

/** Alla steg vi spårar, även de som inte krävs för belöningen. */
export const TRACKED_STEPS = [
  'upload_cv',
  'create_letter',
  'analyze_cv',
  'optimize_linkedin',
  'download_cv_template',
  'match_jobs',
] as const

/**
 * Utrullningsdatum för ett-stegs-onboardingen. Auto-claim gäller bara konton
 * som skapats efter detta, annars delas belöningen ut till alla befintliga
 * konton på en gång första gången de laddar dashboarden.
 */
export const AUTO_CLAIM_CUTOFF = new Date('2026-09-11T00:00:00Z')

/** Hur många av de obligatoriska stegen som är klara. */
export function countRequiredCompleted(completedSteps: readonly string[]): number {
  return REQUIRED_STEPS.filter((step) => completedSteps.includes(step)).length
}

/** Är onboardingen klar? */
export function isOnboardingComplete(completedSteps: readonly string[]): boolean {
  return countRequiredCompleted(completedSteps) >= REQUIRED_STEPS.length
}

/** Får kontot auto-hämta belöningen? */
export function isEligibleForAutoClaim(createdAt: string | null | undefined): boolean {
  if (!createdAt) return false
  const created = new Date(createdAt)
  if (Number.isNaN(created.getTime())) return false
  return created >= AUTO_CLAIM_CUTOFF
}
