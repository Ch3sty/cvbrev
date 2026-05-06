'use client'

/**
 * /dashboard/kom-igang
 * --------------------
 * Linjar onboarding-sekvens. Visar tre steg som dynamiska states:
 * - completed (gron check, kompakt)
 * - current (stort kort med illustration + CTA)
 * - locked (graytone med la-ikon)
 *
 * Belogning visas alltid (informativt) och blir aktiv nar 3/3 ar klara.
 */

import { motion } from 'framer-motion'
import { useOnboarding } from '@/contexts/OnboardingContext'
import OnboardingStep from '@/components/dashboard/OnboardingStep'
import OnboardingReward from '@/components/dashboard/OnboardingReward'
import OnboardingDag2 from '@/components/dashboard/OnboardingDag2'
import {
  OnboardingHeroIllustration,
  OnboardingStep1Cv,
  OnboardingStep2Brev,
  OnboardingStep3Analys,
  OnboardingTrofe,
} from '@/components/dashboard/illustrations/OnboardingIcons'
import { Check } from 'lucide-react'

const STEPS = [
  {
    name: 'upload_cv',
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
    title: 'Analysera ditt CV',
    description: 'Få konkret feedback på vad rekryterare ser och vad du kan förbättra.',
    why: 'Vår CV-analys visar vilka nyckelord som saknas, vad ATS-system fångar upp och hur du sticker ut.',
    timeEstimate: '~1 min',
    ctaLabel: 'Kör analys',
    ctaHref: '/dashboard/cv-analys',
    illustration: <OnboardingStep3Analys className="w-32 h-32" />,
  },
]

export default function KomIgangPage() {
  const {
    completedSteps,
    requiredCompletedCount,
    onboardingCompleted,
    rewardClaimed,
    isLoading,
  } = useOnboarding()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Hitta vilket steg som ar nuvarande (forsta som inte ar klart)
  const currentStepIndex = STEPS.findIndex((s) => !completedSteps.includes(s.name))

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Bakgrunds-glow */}
      <div
        className="fixed inset-x-0 top-0 h-[40vh] pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(249, 115, 22, 0.1) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="space-y-6 sm:space-y-7 relative z-10"
      >
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-white border border-orange-100 p-6 sm:p-8 lg:p-10">
          <div
            aria-hidden="true"
            className="absolute -right-8 -top-8 opacity-15 pointer-events-none hidden lg:block"
          >
            <OnboardingHeroIllustration className="w-64 h-64" />
          </div>

          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-orange-700 mb-2.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #F97316, #DC2626)',
                }}
                aria-hidden="true"
              />
              Onboarding
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-3">
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
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-5">
              5-10 minuter och du är igång på riktigt. Vi visar konkret hur varje
              steg hjälper dig som söker jobb.
            </p>

            <ProgressBar
              completed={requiredCompletedCount}
              total={STEPS.length}
            />
          </div>
        </section>

        {/* Stegen */}
        <section className="space-y-3 sm:space-y-4">
          {STEPS.map((step, idx) => {
            const isCompleted = completedSteps.includes(step.name)
            const isCurrent = idx === currentStepIndex
            const state = isCompleted ? 'completed' : isCurrent ? 'current' : 'locked'

            return (
              <OnboardingStep
                key={step.name}
                number={idx + 1}
                total={STEPS.length}
                state={state}
                title={step.title}
                description={step.description}
                why={step.why}
                timeEstimate={step.timeEstimate}
                ctaLabel={step.ctaLabel}
                ctaHref={step.ctaHref}
                illustration={step.illustration}
              />
            )
          })}
        </section>

        {/* Belogning - alltid synlig */}
        {onboardingCompleted && !rewardClaimed ? (
          <OnboardingReward />
        ) : !rewardClaimed ? (
          <RewardPreview />
        ) : null}

        {/* Dag-2 nar belogning ar hamtat */}
        {rewardClaimed && <OnboardingDag2 />}
      </motion.div>
    </div>
  )
}

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = (completed / total) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-2.5">
          {Array.from({ length: total }).map((_, i) => {
            const isCompleted = i < completed
            const isCurrent = i === completed
            return (
              <div
                key={i}
                className={`flex items-center justify-center rounded-full transition-all ${
                  isCompleted
                    ? 'w-8 h-8 text-white'
                    : isCurrent
                    ? 'w-8 h-8 border-2 border-orange-300 text-orange-700'
                    : 'w-7 h-7 border-2 border-slate-200 text-slate-300'
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
                  <Check className="w-4 h-4" strokeWidth={3.5} />
                ) : (
                  <span className="text-sm font-black">{i + 1}</span>
                )}
              </div>
            )
          })}
        </div>
        <span className="text-sm font-black text-slate-700 tabular-nums">
          {completed}/{total} klara
        </span>
      </div>

      <div className="h-2 rounded-full bg-orange-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{
            background:
              'linear-gradient(90deg, #F97316, #DC2626, #BE185D)',
          }}
        />
      </div>
    </div>
  )
}

function RewardPreview() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-orange-50/40 border border-orange-200 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5"
    >
      <OnboardingTrofe className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-700 mb-1">
          Belöning väntar
        </div>
        <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1.5 leading-tight">
          När du klarat alla tre steg får du 1 dag Premium gratis
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Det betyder obegränsade brev, obegränsade CV-analyser och
          LinkedIn-optimering under 24 timmar. Inget kort krävs.
        </p>
      </div>
    </motion.section>
  )
}
