'use client'

/**
 * DashboardHero (docs/plan-konvertering.md, B4). Ersätter OnboardingHero.
 *
 * Tillståndet härleds ur cvCount och totalLetters:
 *   A  inget CV      → ladda upp, direkt i heron
 *   B  CV men inget brev → poängen och vägen till första brevet
 *   C  aktiv         → heron står tillbaka, DashboardStatusRow tar över
 *
 * En primär handling per vy. Border i stället för skugga, rounded-xl,
 * font-semibold som tyngst, inga gradientcirklar.
 */

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import InlineCVUpload from '@/components/cv/InlineCVUpload'
import QuickScoreReveal from '@/components/cv/QuickScoreReveal'
import { IlluLaddaUppCv, IlluCvPoang } from '@/components/illustrations/DashboardIllustrations'

export type DashboardState = 'A' | 'B' | 'C'

export function deriveDashboardState(cvCount: number, totalLetters: number): DashboardState {
  if (cvCount === 0) return 'A'
  if (totalLetters === 0) return 'B'
  return 'C'
}

interface DashboardHeroProps {
  state: DashboardState
  userId?: string
  firstName?: string
  /** Anropas när ett CV laddats upp, så dashboarden kan hämta om sin data. */
  onCvUploaded?: () => void
}

export default function DashboardHero({
  state,
  userId,
  firstName,
  onCvUploaded,
}: DashboardHeroProps) {
  const [uploadedCvId, setUploadedCvId] = useState<string | null>(null)

  // Tillstånd C har ingen hero. DashboardStatusRow är vyns startpunkt.
  if (state === 'C') return null

  if (state === 'B') {
    return (
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6"
      >
        <div className="flex items-start gap-5">
          <span className="hidden sm:block shrink-0 text-neutral-900" aria-hidden="true">
            <IlluCvPoang size={96} />
          </span>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
              Nästa steg: brevet
            </h1>
            <p className="text-sm text-neutral-600 mt-1 leading-relaxed">
              Ditt CV ligger inne. Klistra in en annons så skriver vi utkastet utifrån det.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
              <Link
                href="/dashboard/skapa-brev"
                className="inline-flex items-center justify-center h-11 px-4 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors w-full sm:w-auto"
              >
                Skapa ditt första brev
              </Link>
              <Link
                href="/dashboard/cv-analys"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 underline-offset-4 hover:underline"
              >
                Se hela CV-analysen
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    )
  }

  // Tillstånd A: allt handlar om att få in CV:t.
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="space-y-5"
    >
      {uploadedCvId ? (
        // Samma yta byter innehåll: poängen ersätter uppladdningen.
        <QuickScoreReveal
          cvId={uploadedCvId}
          userId={userId}
          nextHref="/dashboard/skapa-brev"
          nextLabel="Skapa ditt första brev"
        />
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-start">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
                {firstName ? `Börja med ditt CV, ${firstName}` : 'Börja med ditt CV'}
              </h1>
              <p className="text-sm text-neutral-600 mt-1 leading-relaxed">
                Vi läser det och visar vad en rekryterare ser. Tar 30 sekunder.
              </p>

              <div className="mt-5">
                <InlineCVUpload
                  showCancel={false}
                  hideHeader
                  onComplete={(cv) => {
                    setUploadedCvId(cv.id)
                    onCvUploaded?.()
                  }}
                />
              </div>

              <Link
                href="/dashboard/skapa-cv"
                className="mt-4 inline-block text-sm font-medium text-neutral-600 hover:text-neutral-900 underline-offset-4 hover:underline"
              >
                Har du inget CV? Bygg ett här
              </Link>
            </div>

            <span
              className="hidden lg:block shrink-0 text-neutral-900 justify-self-end"
              aria-hidden="true"
            >
              <IlluLaddaUppCv size={240} />
            </span>
          </div>
        </div>
      )}

      {/* Inget annat konkurrerar i tillstånd A, bara två textlänkar. */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <Link
          href="/dashboard/tester"
          className="text-sm font-medium text-neutral-600 hover:text-neutral-900 underline-offset-4 hover:underline"
        >
          Träna på tester
        </Link>
        <Link
          href="/dashboard/sokta-tjanster"
          className="text-sm font-medium text-neutral-600 hover:text-neutral-900 underline-offset-4 hover:underline"
        >
          Logga sökta tjänster
        </Link>
      </div>
    </motion.section>
  )
}
