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

export type DashboardState = 'A' | 'B' | 'C'

export function deriveDashboardState(cvCount: number, totalLetters: number): DashboardState {
  if (cvCount === 0) return 'A'
  if (totalLetters === 0) return 'B'
  return 'C'
}

const LINK = 'inline-flex min-h-11 items-center text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 transition-colors hover:text-ink-1'

interface DashboardHeroProps {
  state: DashboardState
  userId?: string
  firstName?: string
  /** Anropas när ett CV laddats upp, så dashboarden kan hämta om sin data. */
  onCvUploaded?: () => void
}

export default function DashboardHero({ state, userId, onCvUploaded }: DashboardHeroProps) {
  const [uploadedCvId, setUploadedCvId] = useState<string | null>(null)

  // Rummen våg 1b: tillstånd B:s rubrik, rad och knappar står på väggen
  // (DashboardHem), så heron har inget eget att visa där.
  if (state === 'C' || state === 'B') return null

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
        <div className="rounded-2xl border border-kant bg-papper p-4 sm:p-5">
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-8">
            <span className="mx-auto block w-fit text-ink-1 lg:order-2 lg:mx-0 lg:justify-self-end" aria-hidden="true">
              <IlluArketLyfter size={220} className="lg:h-[240px] lg:w-[240px]" />
            </span>

            <div className="min-w-0 lg:order-1">
              {/* Rubriken och raden står på väggen (DashboardHem). */}
              <div>
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
