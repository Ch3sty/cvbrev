'use client'

/**
 * Återkomstvalet (docs/plan-inloggat-omdesign.md, avsnitt 6).
 *
 * Kollisionsregeln i klartext: har användaren ett halvfärdigt utkast och
 * startar flödet igen får hon välja. Utan valet skriver den nya sessionen
 * tyst över den gamla, och vi har bytt ett tappat flöde mot ett raderat.
 *
 * "Börja om" är destruktivt och kräver bekräftelse, därför ConfirmDialog.
 */

import { useState } from 'react'
import ConfirmDialog from './ConfirmDialog'
import { describeAge } from '@/lib/flow/draft'

export interface FlowResumeBannerProps {
  /** Tidsstämpeln från utkastet. */
  savedAt: number
  /** Steget utkastet stod på, för att kunna säga var hon var. */
  step: number
  totalSteps: number
  onResume: () => void
  onRestart: () => void
}

export default function FlowResumeBanner({
  savedAt,
  step,
  totalSteps,
  onResume,
  onRestart,
}: FlowResumeBannerProps) {
  const [confirming, setConfirming] = useState(false)

  return (
    <>
      <section
        aria-label="Påbörjat utkast"
        className="rounded-xl border border-kant-stark bg-panel p-4"
      >
        <h2 className="text-kort text-ink-1">Du har ett påbörjat utkast</h2>
        <p className="mt-1 text-sm leading-[22px] text-ink-2">
          Du kom till steg {Math.min(step, totalSteps)} av {totalSteps},{' '}
          {describeAge(savedAt)}. Vill du fortsätta där du slutade?
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
          <button
            type="button"
            onClick={onResume}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-hover"
          >
            Fortsätt
          </button>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="inline-flex h-11 items-center justify-center text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 transition-colors hover:text-ink-1"
          >
            Börja om
          </button>
        </div>
      </section>

      <ConfirmDialog
        open={confirming}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false)
          onRestart()
        }}
        title="Börja om från början?"
        description="Ditt påbörjade utkast tas bort och går inte att få tillbaka."
        confirmLabel="Börja om"
        cancelLabel="Avbryt"
        destructive
      />
    </>
  )
}
