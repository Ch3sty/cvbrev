/**
 * Exempelprofilen som personlighetsskärmarna visar: hög samvetsgrannhet och
 * låg utåtriktning. Tolkningen (band, profilmening, kravprofiler, intervjusvar)
 * räknas av samma funktioner som provets resultat i
 * src/lib/personlighet/smakprov-tolkning.ts, så skärmen säger det produkten säger.
 */

import type { BigFiveScores } from '@/lib/personalityTest/types'

export const EXEMPELPROFIL: BigFiveScores = {
  openness: 52,
  conscientiousness: 88,
  extraversion: 26,
  agreeableness: 58,
  neuroticism: 28,
}
