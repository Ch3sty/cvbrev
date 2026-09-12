'use client'

/**
 * Väntläget under ett AI-anrop (docs/plan-inloggat-omdesign.md, avsnitt 6).
 *
 * Bygger på mönstret från cv-analysens AnalysisProgressStep: en etappvis text
 * som säger vad som händer just nu, procent och en tidsuppskattning. Två
 * saker är nya och gäller alla flöden.
 *
 *  1. Avbryt. Ett AI-anrop ska alltid gå att avbryta, och ett avbrutet anrop
 *     återställer till föregående steg med datan kvar. Utan det sitter den
 *     som tryckte fel fast i trettio sekunders väntan.
 *  2. Orange accent i stället för den röd-rosa gradienten.
 *
 * Etapperna är text, inte dekoration: de gör väntan begriplig i stället för
 * att bara vara lång.
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
      className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6"
    >
      <h2 className="text-base font-semibold text-neutral-900">{stage?.text}</h2>
      {stage?.body ? (
        <p className="mt-1 text-sm leading-relaxed text-neutral-600">
          {stage.body}
        </p>
      ) : null}

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100"
      >
        <div
          className="h-full rounded-full bg-orange-600 transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="font-medium tabular-nums text-neutral-700">
          {Math.round(pct)}%
        </span>
        <span className="text-neutral-500">
          {estimatedTimeRemaining > 0
            ? `Cirka ${estimatedTimeRemaining} sekunder kvar`
            : 'Klart strax'}
        </span>
      </div>

      {onCancel ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-11 items-center justify-center px-2 text-sm font-medium text-neutral-600 underline-offset-4 transition-colors hover:text-neutral-900 hover:underline"
          >
            {cancelLabel}
          </button>
        </div>
      ) : null}
    </section>
  )
}
