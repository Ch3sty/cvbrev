// src/lib/onboarding/steps.ts
// Ett enda obligatoriskt onboarding-steg (docs/plan-konvertering.md, B5).
// Enda sanningskällan: OnboardingContext och claim-reward-routen läser härifrån.

export const REQUIRED_STEPS = ['upload_cv'] as const

export type RequiredStep = (typeof REQUIRED_STEPS)[number]

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
