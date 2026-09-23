'use client'

/**
 * DashboardHero i Tråden (docs/design/koncept-2026-09-13.md, ram 7).
 *
 * Tillståndet härleds ur cvCount och totalLetters:
 *   A  inget CV          → 240-scenen "arket lyfter ur mappen", h1, uppladdning
 *   B  CV men inget brev → panel med marginalplatta, vägen till första brevet
 *   C  aktiv             → ingen hero, jobbsöksöversikten är vyns startpunkt
 *
 * Scenen står ovanför texten på mobil och i egen kolumn till höger från lg.
 * Aldrig ovanpå text. En primär handling per vy, i ink.
 */

import { useState } from 'react'
import Link from 'next/link'
import InlineCVUpload from '@/components/cv/InlineCVUpload'
import QuickScoreReveal from '@/components/cv/QuickScoreReveal'
import { IlluArketLyfter } from '@/components/illustrations/TradenScener'
import { IlluScenBrev } from '@/components/illustrations/PriserScener'

export type DashboardState = 'A' | 'B' | 'C'

export function deriveDashboardState(cvCount: number, totalLetters: number): DashboardState {
  if (cvCount === 0) return 'A'
  if (totalLetters === 0) return 'B'
  return 'C'
}

const BTN = 'inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-hover sm:w-auto'
const LINK = 'inline-flex min-h-11 items-center text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 transition-colors hover:text-ink-1'

interface DashboardHeroProps {
  state: DashboardState
  userId?: string
  firstName?: string
  /** Anropas när ett CV laddats upp, så dashboarden kan hämta om sin data. */
  onCvUploaded?: () => void
}

export default function DashboardHero({ state, userId, firstName, onCvUploaded }: DashboardHeroProps) {
  const [uploadedCvId, setUploadedCvId] = useState<string | null>(null)

  if (state === 'C') return null

  if (state === 'B') {
    return (
      <section className="rounded-xl border border-kant bg-panel p-4 sm:p-6" aria-label="Nästa steg">
        {/* Display-h1 och scen i egen kolumn i stället för marginalplatta
            (analysen 22 september, avsnitt 3: tillstånd B). */}
        <div className="flex items-center gap-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-h1 text-ink-1">Nästa steg: brevet</h1>
            <p className="mt-1.5 text-sm leading-[22px] text-ink-2">
              Ditt CV ligger inne. Klistra in en annons så skriver vi utkastet utifrån det.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
              <Link href="/dashboard/skapa-brev" className={BTN}>
                Skapa ditt första brev
              </Link>
              <Link href="/dashboard/cv-analys" className={LINK}>
                Se hela CV-analysen
              </Link>
            </div>
          </div>
          <div className="hidden w-[240px] shrink-0 text-ink-1 lg:block" aria-hidden="true">
            <IlluScenBrev className="h-auto w-full" />
          </div>
        </div>
      </section>
    )
  }

  // Tillstånd A: allt handlar om att få in CV:t.
  return (
    <section className="space-y-4 sm:space-y-6" aria-label="Börja med ditt CV">
      {uploadedCvId ? (
        <QuickScoreReveal
          cvId={uploadedCvId}
          userId={userId}
          nextHref="/dashboard/skapa-brev"
          nextLabel="Skapa ditt första brev"
        />
      ) : (
        <div className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-8">
            <span className="mx-auto block w-fit text-ink-1 lg:order-2 lg:mx-0 lg:justify-self-end" aria-hidden="true">
              <IlluArketLyfter size={220} className="lg:h-[240px] lg:w-[240px]" />
            </span>

            <div className="min-w-0 lg:order-1">
              <h1 className="text-h1 text-ink-1">
                {firstName ? `Börja med ditt CV, ${firstName}` : 'Börja med ditt CV'}
              </h1>
              <p className="mt-1.5 text-sm leading-[22px] text-ink-2">
                Rekryterare letar först efter senaste rollen och vad du uppnådde. Vi läser ditt CV
                likadant, på 30 sekunder.
              </p>

              <div className="mt-4">
                <InlineCVUpload
                  showCancel={false}
                  hideHeader
                  onComplete={(cv) => {
                    setUploadedCvId(cv.id)
                    onCvUploaded?.()
                  }}
                />
              </div>

              {/* Förtroenderaden står där filen lämnar användaren. Sann enligt
                  src/lib/privacy/pii.ts, som maskar personuppgifter före varje
                  AI-anrop. */}
              <p className="mt-2 text-meta text-ink-3">
                Namn, telefon och adress maskas innan texten går vidare till någon AI.
              </p>

              <Link href="/dashboard/skapa-cv" className={`${LINK} mt-2`}>
                Har du inget CV? Bygg ett här
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Inget annat konkurrerar i tillstånd A, bara två textlänkar. */}
      <div className="flex flex-wrap items-center gap-x-6">
        <Link href="/dashboard/tester" className={LINK}>
          Träna på tester
        </Link>
        <Link href="/dashboard/sokta-tjanster" className={LINK}>
          Följ dina ansökningar
        </Link>
      </div>
    </section>
  )
}
