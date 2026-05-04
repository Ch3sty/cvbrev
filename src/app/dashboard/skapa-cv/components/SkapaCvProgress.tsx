'use client'

import type { ReactElement } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import {
  StepKontaktIcon,
  StepOmDigIcon,
  StepErfarenhetIcon,
  StepUtbildningIcon,
  StepKompetenserIcon,
  StepSprakIcon,
  StepGranskaIcon,
} from './illustrations/SkapaCvIcons'

export interface SkapaCvStep {
  id: number
  label: string
  shortLabel: string
  icon: ({ className }: { className?: string }) => ReactElement
}

export const SKAPA_CV_STEPS: SkapaCvStep[] = [
  { id: 0, label: 'Kontaktuppgifter', shortLabel: 'Kontakt', icon: StepKontaktIcon },
  { id: 1, label: 'Om dig', shortLabel: 'Om dig', icon: StepOmDigIcon },
  { id: 2, label: 'Erfarenhet', shortLabel: 'Erfarenhet', icon: StepErfarenhetIcon },
  { id: 3, label: 'Utbildning', shortLabel: 'Utbildning', icon: StepUtbildningIcon },
  { id: 4, label: 'Kompetenser', shortLabel: 'Skills', icon: StepKompetenserIcon },
  { id: 5, label: 'Språk', shortLabel: 'Språk', icon: StepSprakIcon },
  { id: 6, label: 'Granska & spara', shortLabel: 'Granska', icon: StepGranskaIcon },
]

interface Props {
  currentStep: number
  completedSteps: number[]
  onStepClick?: (stepId: number) => void
}

export default function SkapaCvProgress({
  currentStep,
  completedSteps,
  onStepClick,
}: Props) {
  const completedCount = completedSteps.length
  const totalSteps = SKAPA_CV_STEPS.length
  const progressPercent = Math.round(
    ((currentStep + (completedSteps.includes(currentStep) ? 1 : 0)) /
      totalSteps) *
      100
  )

  return (
    <>
      {/* Desktop: sticky top */}
      <div className="hidden md:block sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-3 pb-4 bg-gradient-to-b from-white via-white to-white/85 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-3xl mx-auto">
          <div
            className="grid items-start gap-2"
            style={{
              gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))`,
            }}
          >
            {SKAPA_CV_STEPS.map((step) => {
              const isDone = completedSteps.includes(step.id)
              const isActive = step.id === currentStep
              const canClick = isDone || step.id <= currentStep
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
                    {isActive && !isDone && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background:
                            'linear-gradient(135deg, #F97316, #DC2626)',
                        }}
                        animate={{
                          scale: [1, 1.45, 1],
                          opacity: [0.4, 0, 0.4],
                        }}
                        transition={{
                          duration: 1.8,
                          repeat: Infinity,
                          ease: 'easeOut',
                        }}
                      />
                    )}
                    <div
                      className="relative w-9 h-9 rounded-full flex items-center justify-center transition-all"
                      style={
                        isDone
                          ? {
                              background:
                                'linear-gradient(135deg, #10B981, #059669)',
                            }
                          : isActive
                          ? {
                              background:
                                'linear-gradient(135deg, #F97316, #DC2626)',
                              boxShadow:
                                '0 4px 12px -2px rgba(220, 38, 38, 0.45)',
                            }
                          : { background: '#F1F5F9' }
                      }
                    >
                      {isDone ? (
                        <Check
                          className="w-4 h-4 text-white"
                          strokeWidth={2.75}
                        />
                      ) : (
                        <Icon
                          className={`w-4 h-4 ${
                            isActive ? 'text-white' : 'text-slate-400'
                          }`}
                        />
                      )}
                    </div>
                  </div>
                  <span
                    className={`mt-1.5 text-[11px] font-medium leading-tight ${
                      isActive
                        ? 'text-slate-900'
                        : isDone
                        ? 'text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.shortLabel}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #F97316, #DC2626)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile: fixed bottom */}
      <div
        className="md:hidden fixed left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 64px)',
          boxShadow: '0 -4px 12px -4px rgba(15, 23, 42, 0.08)',
        }}
      >
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #F97316, #DC2626)',
                boxShadow: '0 2px 6px -2px rgba(220, 38, 38, 0.45)',
              }}
            >
              <span className="text-[11px] font-bold text-white">
                {currentStep + 1}
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-600 leading-none">
                Steg {currentStep + 1} av {totalSteps}
              </div>
              <div className="text-[13px] font-bold text-slate-900 leading-tight mt-0.5 truncate">
                {SKAPA_CV_STEPS[currentStep]?.label}
              </div>
            </div>
          </div>
          <div className="text-[11px] font-semibold text-slate-500 tabular-nums flex-shrink-0">
            {completedCount}/{totalSteps} klara
          </div>
        </div>

        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #F97316, #DC2626)',
            }}
          />
        </div>
      </div>
    </>
  )
}
