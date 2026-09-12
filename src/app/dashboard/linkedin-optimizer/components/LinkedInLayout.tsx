'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import LinkedInProgress from './LinkedInProgress'

interface Props {
  currentStep: number
  completedSteps: number[]
  onStepClick?: (stepId: number) => void
  children: ReactNode
}

export default function LinkedInLayout({
  currentStep,
  completedSteps,
  onStepClick,
  children,
}: Props) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div className="relative px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Topbar med tillbaka-länk */}
          <div className="flex items-center justify-between pt-4 pb-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-600 hover:text-orange-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={2.4} />
              <span className="hidden sm:inline">Tillbaka till Dashboard</span>
              <span className="sm:hidden">Tillbaka</span>
            </Link>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
              <span className="w-1 h-3 rounded-sm bg-orange-600" aria-hidden="true" />
              Förbättra LinkedIn-profil
            </div>
          </div>

          {/* Progress */}
          <LinkedInProgress
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={onStepClick}
          />

          {/* Innehåll */}
          <div className="pt-6 sm:pt-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
