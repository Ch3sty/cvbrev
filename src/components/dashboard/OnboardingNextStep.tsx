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

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
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
    nextTitle: 'Hämta din belöning',
    nextDescription: 'Du har klarat alla tre steg. Lås upp 1 dag Premium.',
    ctaLabel: 'Hämta belöning',
    ctaHref: '/dashboard/kom-igang',
  },
}

export default function OnboardingNextStep({ stepCompleted }: OnboardingNextStepProps) {
  const { completedSteps, rewardClaimed, isLoading } = useOnboarding()

  // Visa inget om laddar, om belogning redan hamtats, eller om steget INTE ar slutfort
  if (isLoading || rewardClaimed) return null
  if (!completedSteps.includes(stepCompleted)) return null

  const config = NEXT_STEP_CONFIG[stepCompleted]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
      style={{
        background:
          'linear-gradient(135deg, rgba(255, 237, 213, 0.7) 0%, rgba(254, 215, 170, 0.5) 100%)',
        border: '1px solid #FED7AA',
      }}
    >
      {/* Klar-bock */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <Check className="w-5 h-5 text-emerald-700" strokeWidth={3} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-black uppercase tracking-[0.14em] text-emerald-700 mb-0.5">
            {config.completedLabel} · Onboarding
          </div>
          <div className="text-sm sm:text-base font-black text-slate-900 leading-tight">
            Nästa: {config.nextTitle}
          </div>
          <div className="text-xs text-slate-600 mt-0.5">
            {config.nextDescription}
          </div>
        </div>
      </div>

      <Link
        href={config.ctaHref}
        className="group inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-5 py-2.5 rounded-xl text-white font-bold text-sm min-h-[44px] flex-shrink-0"
        style={{
          background:
            'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
          boxShadow: '0 6px 16px -4px rgba(220, 38, 38, 0.35)',
        }}
      >
        {config.ctaLabel}
        <ArrowRight
          className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
          strokeWidth={2.5}
        />
      </Link>
    </motion.div>
  )
}
