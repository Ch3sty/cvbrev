'use client'

/**
 * Väntläget under ett AI-anrop (docs/designsystem.md, "Lång väntan").
 *
 * Rubriken säger vad som görs just nu, tre rader fylls i tur och ordning
 * från vänster, meta säger hur länge. Framstegslinjen är tråden i 2 px
 * längs panelens överkant. Etapperna är text, inte dekoration: de gör
 * väntan begriplig i stället för att bara vara lång.
 *
 * Avbryt finns alltid när anropet går att avbryta, och ett avbrutet anrop
 * återställer till föregående steg med datan kvar.
 */

import { useEffect, useState } from 'react'

export interface FlowStage {
  /** Procent då etappen tar vid. */
  threshold: number
  /** Kort rubrik, vad som görs just nu. */
  text: string
  /** En mening om varför det tar tid. */
  body?: string
}

export interface FlowProgressProps {
  /** 0 till 100. */
  progress: number
  /** Sekunder kvar. 0 eller mindre visar "Klart strax". */
  estimatedTimeRemaining?: number
  stages: FlowStage[]
  /** Avbryter anropet och går tillbaka med datan kvar. */
  onCancel?: () => void
  cancelLabel?: string
}

export default function FlowProgress({
  progress,
  estimatedTimeRemaining = 0,
  stages,
  onCancel,
  cancelLabel = 'Avbryt',
}: FlowProgressProps) {
  const [stageIndex, setStageIndex] = useState(0)

  useEffect(() => {
    let idx = 0
    for (let i = stages.length - 1; i >= 0; i -= 1) {
      if (progress >= stages[i].threshold) {
        idx = i
        break
      }
    }
    setStageIndex(idx)
  }, [progress, stages])

  const stage = stages[stageIndex] ?? stages[0]
  const pct = Math.min(Math.max(progress, 0), 100)

  return (
    <section
      aria-live="polite"
      aria-busy="true"
      className="relative overflow-hidden rounded-xl border border-kant bg-panel p-4 sm:p-5"
    >
      {/* Tråden längs överkanten: här är vi i arbetet. */}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-label={stage?.text}
        className="absolute inset-x-0 top-0 h-0.5 bg-kant"
      >
        <div
          className="h-full bg-accent transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>

      <h2 className="text-sm font-medium text-ink-1">{stage?.text}</h2>

      <div className="writing-lines mt-3" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <p className="mt-3 text-meta text-ink-3">
        {stage?.body ? `${stage.body} ` : ''}
        {estimatedTimeRemaining > 0
          ? `Cirka ${estimatedTimeRemaining} sekunder kvar.`
          : 'Klart strax.'}
      </p>

      {onCancel ? (
        <div className="mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-11 items-center text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1"
          >
            {cancelLabel}
          </button>
        </div>
      ) : null}
    </section>
  )
}
