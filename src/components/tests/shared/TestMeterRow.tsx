'use client'

/**
 * Mätraden i provskalets toppdel: klocka, fråga X av Y, besvarade.
 *
 * En platt rad, inga piller, ingen egen kantlinje. Skalet äger ramen.
 * Klockan kan räkna både upp (övningstest) och ner (prov med tidsgräns).
 * Tonen byter en gång: ink tills tiden håller på att ta slut, då varning,
 * och fel den sista biten.
 */

export interface TestMeterRowProps {
  /** Formaterad tid, till exempel "02:41". */
  time: string
  /** Sista minuten eller liknande: klockan blir fel-röd. */
  critical?: boolean
  /** Snart slut: klockan blir varning. */
  low?: boolean
  /** Etikett för räknaren i mitten, "Fråga" eller "Passage". */
  counterLabel?: string
  /** Ettbaserat nummer. */
  current: number
  total: number
  /** Antal besvarade. Utelämnas när testet inte räknar det. */
  answered?: number
}

export default function TestMeterRow({
  time,
  critical,
  low,
  counterLabel = 'Fråga',
  current,
  total,
  answered,
}: TestMeterRowProps) {
  const timeTone = critical ? 'text-fel' : low ? 'text-varning' : 'text-ink-1'

  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span
        className={`inline-flex min-w-[52px] items-center gap-1.5 font-medium tabular-nums ${timeTone}`}
        aria-live={critical ? 'assertive' : 'off'}
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" />
        </svg>
        {time}
      </span>

      <p className="tabular-nums text-ink-3">
        <span className="text-meta">{counterLabel} </span>
        <span className="font-medium text-ink-1">{current}</span>
        <span> / {total}</span>
      </p>

      {typeof answered === 'number' ? (
        <span className="inline-flex min-w-[52px] items-center justify-end gap-1.5 font-medium tabular-nums text-positiv">
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
          {answered}
          <span className="hidden sm:inline"> / {total}</span>
        </span>
      ) : (
        <span className="w-[52px]" aria-hidden="true" />
      )}
    </div>
  )
}
