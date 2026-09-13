'use client'

interface Props {
  scoreBefore: number
  scoreAfter: number
}

/**
 * Poängpanelen: två stora tal i text-tal, etiketter i meta, skillnaden i
 * positiv, och en 2 px mätare. Mätaren är vyns enda orange linje.
 */
export default function ScoreHero({ scoreBefore, scoreAfter }: Props) {
  const delta = scoreAfter - scoreBefore
  const clampedAfter = Math.max(0, Math.min(100, scoreAfter))

  return (
    <div className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-tal tabular-nums text-ink-3">{scoreBefore}</p>
          <p className="mt-1 text-meta text-ink-3">Före</p>
        </div>
        <div>
          <p className="text-tal tabular-nums text-ink-1">{scoreAfter}</p>
          <p className="mt-1 text-meta text-ink-3">Efter</p>
        </div>
        <div>
          <p className={`text-tal tabular-nums ${delta >= 0 ? 'text-positiv' : 'text-varning'}`}>
            {delta >= 0 ? '+' : ''}
            {delta}
          </p>
          <p className="mt-1 text-meta text-ink-3">Skillnad</p>
        </div>
      </div>

      <div
        className="mt-4 h-0.5 w-full bg-kant"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clampedAfter}
        aria-label={`Profilpoäng ${scoreAfter} av 100`}
      >
        <div
          className="h-full bg-accent transition-[width] duration-[240ms] ease-out motion-reduce:transition-none"
          style={{ width: `${clampedAfter}%` }}
        />
      </div>
    </div>
  )
}
