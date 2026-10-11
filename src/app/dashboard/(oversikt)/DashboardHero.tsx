'use client'

/**
 * DashboardHero i Tråden (docs/design/koncept-2026-09-13.md, ram 7).
 *
 * Tillståndet härleds ur cvCount och totalLetters:
 *   A  inget CV          → uppladdningen som lyft kort "Börja här" (spec 18.3
 *                          punkt 2; scenen är borttagen, scenerna är slut i inloggat)
 *   B  CV men inget brev → panel med marginalplatta, vägen till första brevet
 *   C  aktiv             → ingen hero, jobbsöksöversikten är vyns startpunkt
 *
 * En primär handling per vy.
 */


import { useState } from 'react'
import Link from 'next/link'
import InlineCVUpload from '@/components/cv/InlineCVUpload'
import QuickScoreReveal from '@/components/cv/QuickScoreReveal'
import LyftKort from '@/components/rum/LyftKort'
import { LYFT } from '@/lib/rum/copy'

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
  /** Kortet överlappar inte väggen (kvittot efter köp står först). */
  utanOverlapp?: boolean
}

export default function DashboardHero({ state, userId, onCvUploaded, utanOverlapp }: DashboardHeroProps) {
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
        <LyftKort
          label={LYFT.jobbForstaCv.titel}
          eyebrow={LYFT.jobbForstaCv.eyebrow}
          titel={LYFT.jobbForstaCv.titel}
          text={LYFT.jobbForstaCv.text}
          utanOverlapp={utanOverlapp}
        >
          {/* Rubriken och raden står på väggen (DashboardHem). Förtroenderaden
              är kortets text, sann enligt src/lib/privacy/pii.ts. */}
          <div className="mt-3.5">
            <InlineCVUpload
              showCancel={false}
              hideHeader
              onComplete={(cv) => {
                setUploadedCvId(cv.id)
                onCvUploaded?.()
              }}
            />
          </div>
          <Link href="/dashboard/skapa-cv" className={`${LINK} mt-2`}>
            {LYFT.jobbForstaCv.byggLank}
          </Link>
        </LyftKort>
      )}

      {/* Inget annat konkurrerar i tillstånd A, bara två textlänkar. */}
      <div className="flex flex-wrap items-center gap-x-6">
        <Link href="/dashboard/tester" className={LINK}>
          Träna på tester
        </Link>
        <Link href="/dashboard/sokta-tjanster" className={LINK}>
          Dina sökta tjänster
        </Link>
      </div>
    </section>
  )
}
