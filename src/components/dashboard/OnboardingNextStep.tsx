'use client'

/**
 * OnboardingNextStep
 * ------------------
 * Kontextuell prompt som visas pa feature-sidor under onboarding.
 * Pekar till nasta steg i onboarding-sekvensen.
 *
 * Anvands pa:
 *  - /dashboard/profil/cv (efter steg 1 klart)
 *  - /dashboard/skapa-brev (efter steg 2 klart)
 *  - /dashboard/cv-analys (efter steg 3 klart - hamta belogning)
 */

import { PAKETRADER } from '@/components/paywall/paywall-copy'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { useOnboarding } from '@/contexts/OnboardingContext'

interface OnboardingNextStepProps {
  /** Vilket steg som precis ar klart (sa vi vet om vi ska visa). */
  stepCompleted: 'upload_cv' | 'create_letter' | 'analyze_cv'
}

const NEXT_STEP_CONFIG = {
  upload_cv: {
    completedLabel: 'CV uppladdat',
    nextTitle: 'Skapa ditt första personliga brev',
    nextDescription: 'Vi anpassar brevet efter ditt CV och jobbannonsen.',
    ctaLabel: 'Skapa brev',
    ctaHref: '/dashboard/skapa-brev',
  },
  create_letter: {
    completedLabel: 'Brev skapat',
    nextTitle: 'Analysera ditt CV',
    nextDescription: 'Få konkret feedback på vad du kan förbättra.',
    ctaLabel: 'Kör analys',
    ctaHref: '/dashboard/cv-analys',
  },
  analyze_cv: {
    completedLabel: 'CV analyserat',
    nextTitle: 'Alla tre steg klara!',
    nextDescription: PAKETRADER.belonningEnDag,
    ctaLabel: 'Till översikten',
    ctaHref: '/dashboard',
  },
}

// Mappar varje steg till nasta steg i onboarding-sekvensen.
// Anvands for att dolja prompten nar nasta steg redan ar klart.
const NEXT_STEP_MAP: Record<string, string | null> = {
  upload_cv: 'create_letter',
  create_letter: 'analyze_cv',
  analyze_cv: null, // sista steget - visas tills reward claimat
}

export default function OnboardingNextStep({ stepCompleted }: OnboardingNextStepProps) {
  const { completedSteps, rewardClaimed, isLoading } = useOnboarding()

  // Visa inget om laddar, om belogning redan hamtats, eller om steget INTE ar slutfort
  // Under laddning vet vi ännu inte om kortet ska visas. Att returnera null
  // och sedan montera ett kort ovanför sidans innehåll sköt ner allt, vilket
  // mätte 0,056 i CLS på cv-analys. Ytan reserveras i stället tills svaret är
  // känt, och faller ihop först när vi vet att kortet inte behövs.
  if (isLoading) return <div className="h-[92px]" aria-hidden="true" />
  if (rewardClaimed) return null
  if (!completedSteps.includes(stepCompleted)) return null

  // Visa inget om nasta steg redan ar klart - prompten ar redundant
  const nextStep = NEXT_STEP_MAP[stepCompleted]
  if (nextStep && completedSteps.includes(nextStep)) return null

  const config = NEXT_STEP_CONFIG[stepCompleted]

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-kant bg-panel p-4 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Check className="h-6 w-6 flex-shrink-0 text-positiv" strokeWidth={1.75} />
        <div className="min-w-0 flex-1">
          <p className="text-steg uppercase text-ink-3">{config.completedLabel}</p>
          <p className="text-kort text-ink-1">Nästa: {config.nextTitle}</p>
          <p className="mt-0.5 text-meta text-ink-3">{config.nextDescription}</p>
        </div>
      </div>

      <Link
        href={config.ctaHref}
        className="inline-flex h-11 w-full flex-shrink-0 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white hover:bg-ink-hover sm:w-auto"
      >
        {config.ctaLabel}
      </Link>
    </section>
  )
}
