// src/lib/onboarding/forsta-handling.server.ts
//
// Arbete som följer med in i kontot från de publika flödena ska räknas som
// om det gjorts i kontot (klicktestet på live 2026-11-22, punkt 4: Kom igång
// stod på 0 av 6 efter brevet från startflödet). Samma tre saker som
// kontots egna rutter gör när ett brev eller ett CV kommer till:
//
//   1. aktiveringens milstolpe i profiles (first_letter_created_at,
//      first_cv_uploaded_at), coalesce, aldrig överskriven;
//   2. det gamla onboardingsteget (update_onboarding_progress), som
//      hemskärmens hybridvalidering läser;
//   3. Kom igångs bricka (markeraBricka), som också skickar
//      onboarding_step_completed till mätningen.
//
// Gäller från och med nu: historiska rader ändras inte. Allt är tyst vid
// fel, så att ett hämtat brev eller CV aldrig fälls av räkningen.

import { logActivityServer, markFirstMilestone } from '@/lib/activation-tracking'
import { markeraBricka } from './komigang-server'

async function onboardingSteg(supabase: any, userId: string, steg: 'create_letter' | 'upload_cv'): Promise<void> {
  try {
    const { error } = await supabase.rpc('update_onboarding_progress', { user_id: userId, step_name: steg })
    if (error) console.error(`[forsta-handling] ${steg}:`, error.message)
  } catch (error: any) {
    console.error(`[forsta-handling] ${steg} kastade:`, error?.message)
  }
}

/** Ett brev har kommit in i kontot från det publika startflödet. */
export async function kvitteraBrevFranPublikt(
  supabase: any,
  userId: string,
  letterId: string,
  kalla: string = 'publikt_startflode'
): Promise<void> {
  await Promise.all([
    markFirstMilestone(userId, 'first_letter_created_at'),
    onboardingSteg(supabase, userId, 'create_letter'),
    markeraBricka(userId, 'brev'),
    logActivityServer(userId, 'letter_created', 'Brevet från startflödet hämtades till kontot', { letter_id: letterId, kalla }),
  ])
}

/**
 * Ett nytt CV har kommit in i kontot utan uppladdning: från provsidorna
 * (/cv-mallar, jobbmatchningen) eller byggarens första sparning.
 */
export async function kvitteraNyttCv(supabase: any, userId: string): Promise<void> {
  await Promise.all([
    markFirstMilestone(userId, 'first_cv_uploaded_at'),
    onboardingSteg(supabase, userId, 'upload_cv'),
    markeraBricka(userId, 'cv_upp'),
  ])
}
