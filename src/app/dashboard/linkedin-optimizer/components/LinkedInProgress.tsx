'use client'

import { motion } from 'framer-motion'
import { Check, Settings, Linkedin, BarChart3, PartyPopper, type LucideIcon } from 'lucide-react'

export interface LinkedInStep {
  id: number
  label: string
  shortLabel: string
  icon: LucideIcon
}

export const LINKEDIN_STEPS: LinkedInStep[] = [
  { id: 0, label: 'Välj läge', shortLabel: 'Läge', icon: Settings },
  { id: 1, label: 'Din profil', shortLabel: 'Profil', icon: Linkedin },
  { id: 2, label: 'Resultat', shortLabel: 'Resultat', icon: BarChart3 },
  { id: 3, label: 'Klar', shortLabel: 'Klar', icon: PartyPopper },
]

interface Props {
  currentStep: number
  completedSteps: number[]
  onStepClick?: (stepId: number) => void
}

export default function LinkedInProgress({
  currentStep,
  completedSteps,
  onStepClick,
}: Props) {
  const totalSteps = LINKEDIN_STEPS.length
  const progressPercent = Math.round(
    ((currentStep + (completedSteps.includes(currentStep) ? 1 : 0)) / totalSteps) *
      100
  )

  return (
    <>
      {/* Desktop progress */}
      <div className="hidden md:block sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-3 pb-4 bg-white border-b border-orange-50">
        <div className="max-w-3xl mx-auto">
          <div
            className="grid items-start gap-2"
            style={{
              gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))`,
            }}
          >
            {LINKEDIN_STEPS.map((step) => {
              const isDone = completedSteps.includes(step.id)
              const isActive = step.id === currentStep
              const canClick = isDone || step.id < currentStep
              const Icon = step.icon
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => canClick && onStepClick?.(step.id)}
                  disabled={!canClick}
                  className="relative flex flex-col items-center text-center group disabled:cursor-not-allowed"
                  aria-label={`Gå till ${step.label}`}
                >
                  <div className="relative">
                    {/* Pulse ring på aktiv steg */}
                    {isActive && !isDone && (
                      <motion.div
                        animate={{ scale: [1, 1.45, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{
                          duration: 1.8,
                          repeat: Infinity,
                          ease: 'easeOut',
                        }}
                        className="absolute inset-0 rounded-full bg-orange-600"
                        aria-hidden="true"
                      />
                    )}
                    <div
                      className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isDone
                          ? 'bg-emerald-600'
                          : isActive
                          ? 'bg-orange-600'
                          : 'bg-neutral-100'
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      ) : (
                        <Icon
                          className={`w-4 h-4 ${
                            isActive ? 'text-white' : 'text-neutral-400'
                          }`}
                          strokeWidth={2.4}
                        />
                      )}
                    </div>
                  </div>
                  <span
                    className={`mt-1.5 text-xs font-bold leading-none truncate w-full ${
                      isDone
                        ? 'text-emerald-700'
                        : isActive
                        ? 'text-orange-700'
                        : 'text-neutral-400'
                    }`}
                  >
                    {step.shortLabel}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Progress bar under */}
          <div className="mt-3 h-1 rounded-full bg-neutral-100 overflow-hidden">
            <motion.div
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full rounded-full bg-orange-600"
            />
          </div>
        </div>
      </div>

      {/* Mobile progress */}
      <div className="md:hidden sticky top-0 z-30 -mx-4 px-4 py-3 bg-white/95 backdrop-blur-md border-b border-orange-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-orange-600">
            <span className="text-sm font-semibold text-white">
              {currentStep + 1}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-orange-700 leading-none">
              Steg {currentStep + 1} av {totalSteps}
            </div>
            <div className="text-sm font-semibold text-neutral-900 truncate mt-0.5">
              {LINKEDIN_STEPS[currentStep]?.label}
            </div>
          </div>
        </div>
        <div className="mt-2.5 h-1 rounded-full bg-neutral-100 overflow-hidden">
          <motion.div
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full rounded-full bg-orange-600"
          />
        </div>
      </div>
    </>
  )
}
