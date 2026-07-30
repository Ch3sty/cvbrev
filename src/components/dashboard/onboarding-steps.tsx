// Delad definition av onboarding-stegen. EN sanning för titlar, copy,
// tidsestimat och CTA:er; konsumeras av både OnboardingHero (dashboarden)
// och /dashboard/kom-igang. Håll i synk med OnboardingContext:s stegnamn.

import type { ReactNode } from 'react'
import {
  OnboardingStep1Cv,
  OnboardingStep2Brev,
  OnboardingStep3Analys,
} from './illustrations/OnboardingIcons'

export interface OnboardingStepDef {
  name: string
  number: number
  title: string
  description: string
  why: string
  timeEstimate: string
  ctaLabel: string
  ctaHref: string
  illustration: ReactNode
}

export const ONBOARDING_STEPS: OnboardingStepDef[] = [
  {
    name: 'upload_cv',
    number: 1,
    title: 'Ladda upp ditt CV',
    description: 'Vi läser ditt CV och låser upp resten.',
    why: 'Utan CV kan vi inte matcha dig mot jobb, skapa anpassade brev eller analysera dina styrkor.',
    timeEstimate: '~30 sek',
    ctaLabel: 'Ladda upp CV',
    ctaHref: '/dashboard/profil/cv',
    illustration: <OnboardingStep1Cv className="w-32 h-32" />,
  },
  {
    name: 'create_letter',
    number: 2,
    title: 'Skapa ditt första personliga brev',
    description: 'Klistra in en jobbannons och få ett färdigt brev anpassat efter ditt CV.',
    why: 'Personliga brev är ofta avgörande. Vi gör det på 30 sekunder istället för en timme.',
    timeEstimate: '~2 min',
    ctaLabel: 'Skapa brev',
    ctaHref: '/dashboard/skapa-brev',
    illustration: <OnboardingStep2Brev className="w-32 h-32" />,
  },
  {
    name: 'analyze_cv',
    number: 3,
    title: 'Analysera ditt CV',
    description: 'Få konkret feedback på vad rekryterare ser och vad du kan förbättra.',
    why: 'Vår CV-analys visar vilka nyckelord som saknas, vad ATS-system fångar upp och hur du sticker ut.',
    timeEstimate: '~1 min',
    ctaLabel: 'Kör analys',
    ctaHref: '/dashboard/cv-analys',
    illustration: <OnboardingStep3Analys className="w-32 h-32" />,
  },
]
