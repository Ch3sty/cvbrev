'use client'

/**
 * OnboardingHero
 * --------------
 * Dashboard-widget som alltid syns tills onboarding-belogningen ar hamtad.
 * Visar nuvarande steg med stor CTA + 3-stegs progress + varfor-text.
 *
 * 4 olika states beroende pa rewardClaimed + onboardingCompleted:
 *  - in_progress: visar nuvarande steg
 *  - ready_to_claim: visar OnboardingReward
 *  - claimed: visar OnboardingDag2
 *  - dismissed: visar inget
 */

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import {
  OnboardingHeroIllustration,
  OnboardingStep1Cv,
  OnboardingStep2Brev,
  OnboardingStep3Analys,
} from './illustrations/OnboardingIcons'
import OnboardingReward from './OnboardingReward'

const STEPS = [
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

export default function OnboardingHero() {
  const {
    completedSteps,
    requiredCompletedCount,
    onboardingCompleted,
    rewardClaimed,
    isLoading,
  } = useOnboarding()

  if (isLoading || rewardClaimed) {
    return null
  }

  const isReadyToClaim = onboardingCompleted && !rewardClaimed
  const currentStep = STEPS.find((s) => !completedSteps.includes(s.name))

  // Klar att hamta belogning
  if (isReadyToClaim) {
    return <OnboardingReward />
  }

  if (!currentStep) {
    return null
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl bg-white border border-orange-100 p-5 sm:p-6 lg:p-7"
      style={{
        boxShadow: '0 12px 40px -16px rgba(249, 115, 22, 0.22)',
      }}
    >
      {/* Bakgrunds-illustration */}
      <div
        aria-hidden="true"
        className="absolute -right-8 -top-8 opacity-15 pointer-events-none hidden lg:block"
      >
        <OnboardingHeroIllustration className="w-56 h-56" />
      </div>

      <div className="relative">
        {/* Header med eyebrow + progress */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-orange-700 mb-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #F97316, #DC2626)',
                }}
                aria-hidden="true"
              />
              Onboarding
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              Tre steg till{' '}
              <span
                style={{
                  background:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                din första ansökan
              </span>
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              5-10 minuter och du är igång på riktigt.
            </p>
          </div>

          <ProgressDots
            completed={requiredCompletedCount}
            total={STEPS.length}
          />
        </div>

        {/* Aktuellt steg-kort */}
        <CurrentStepCard
          number={currentStep.number}
          total={STEPS.length}
          title={currentStep.title}
          description={currentStep.description}
          why={currentStep.why}
          timeEstimate={currentStep.timeEstimate}
          ctaLabel={currentStep.ctaLabel}
          ctaHref={currentStep.ctaHref}
          illustration={currentStep.illustration}
        />

        {/* Lank till hela onboarding-sidan */}
        <div className="mt-4 text-center sm:text-right">
          <Link
            href="/dashboard/kom-igang"
            className="inline-flex items-center gap-1 text-xs font-bold text-orange-700 hover:text-orange-800"
          >
            Se alla steg
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </motion.section>
  )
}

function ProgressDots({
  completed,
  total,
}: {
  completed: number
  total: number
}) {
  return (
    <div className="flex items-center gap-2 sm:gap-2.5">
      {Array.from({ length: total }).map((_, i) => {
        const isCompleted = i < completed
        const isCurrent = i === completed
        return (
          <div
            key={i}
            className={`flex items-center justify-center rounded-full transition-all ${
              isCompleted
                ? 'w-7 h-7 text-white'
                : isCurrent
                ? 'w-7 h-7 border-2 border-orange-300 text-orange-700'
                : 'w-6 h-6 border-2 border-slate-200 text-slate-300'
            }`}
            style={
              isCompleted
                ? {
                    background:
                      'linear-gradient(135deg, #F97316, #DC2626)',
                  }
                : undefined
            }
          >
            {isCompleted ? (
              <Check className="w-3.5 h-3.5" strokeWidth={3.5} />
            ) : (
              <span className="text-xs font-black">{i + 1}</span>
            )}
          </div>
        )
      })}
      <span className="ml-2 text-xs font-bold text-slate-500 tabular-nums">
        {completed}/{total}
      </span>
    </div>
  )
}

function CurrentStepCard({
  number,
  total,
  title,
  description,
  why,
  timeEstimate,
  ctaLabel,
  ctaHref,
  illustration,
}: {
  number: number
  total: number
  title: string
  description: string
  why: string
  timeEstimate: string
  ctaLabel: string
  ctaHref: string
  illustration: React.ReactNode
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl text-white p-5 sm:p-6"
      style={{
        background:
          'linear-gradient(135deg, #F97316 0%, #DC2626 60%, #BE185D 100%)',
        boxShadow: '0 12px 32px -10px rgba(220, 38, 38, 0.4)',
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-5 lg:gap-7 items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-[10px] font-black uppercase tracking-[0.14em]">
              Nuvarande · Steg {number} av {total}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 text-[10px] font-bold">
              {timeEstimate}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl lg:text-2xl font-black leading-tight mb-1.5">
            {title}
          </h3>
          <p className="text-sm sm:text-base text-white/95 leading-relaxed mb-2.5">
            {description}
          </p>
          <div className="text-[11px] sm:text-xs text-white/85 leading-relaxed mb-4 sm:mb-5 border-l-2 border-white/30 pl-3 italic">
            {why}
          </div>

          <Link
            href={ctaHref}
            className="group inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white font-black text-sm sm:text-base min-h-[52px] hover:bg-orange-50 active:scale-[0.98] transition-all"
            style={{
              color: '#DC2626',
              boxShadow: '0 8px 24px -10px rgba(0, 0, 0, 0.3)',
            }}
          >
            {ctaLabel}
            <ArrowRight
              className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform"
              strokeWidth={2.8}
            />
          </Link>
        </div>

        <div className="hidden lg:flex items-center justify-center">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 border border-white/25">
            {illustration}
          </div>
        </div>
      </div>
    </div>
  )
}
