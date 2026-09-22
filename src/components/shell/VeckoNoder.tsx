'use client'

/**
 * VeckoNoder: veckans sju positioner på en tråd
 * (docs/plan-paket-och-onboarding.md, Fas 2A flöde 3, "Formen").
 *
 * Tråden betyder position överallt i systemet, och sju dagar är sju
 * positioner. Alltså blir veckan en tråd, inte sju kort. Linjen är accent
 * till och med aktuell nod och kant-stark efter.
 *
 * Tre tillstånd, och färgen är aldrig ensam bärare:
 *   avklarad  fylld ink-1 med vit bock
 *   aktuell   ring ink-1 med fylld accentprick
 *   kommande  ring kant-stark, tom
 *
 * Noderna är 32 px med 44 px träffyta. På 320 px krymper de till 28 och
 * siffran flyttar in i noden. Rörelsen mellan noder är omedelbar under
 * prefers-reduced-motion.
 */

export interface VeckoNoderProps {
  /** Sju dagar. Titeln läses upp i nodens aria-label. */
  days: ReadonlyArray<{ dag: number; titel: string }>
  /** Dagen användaren står på, ettbaserad. */
  current: number
  /** Dagar som är avklarade. Behöver inte vara sammanhängande. */
  completed: readonly number[]
  /** Gör noderna tryckbara, till exempel för att hoppa till en dag. */
  onSelect?: (dag: number) => void
  className?: string
}

export default function VeckoNoder({
  days,
  current,
  completed,
  onSelect,
  className,
}: VeckoNoderProps) {
  return (
    <ol role="list" className={`flex items-start justify-between gap-1 ${className ?? ''}`}>
      {days.map((d, i) => {
        const klar = completed.includes(d.dag)
        const aktuell = d.dag === current && !klar
        const tillstand = klar ? 'avklarad' : aktuell ? 'pågår' : 'kommande'
        // Linjen fram till och med aktuell nod är accent, resten kant-stark.
        const linjeFore = i > 0 && d.dag <= current ? 'bg-accent' : 'bg-kant-stark'

        const nod = (
          <span
            aria-hidden="true"
            className={`inline-flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors duration-[160ms] motion-reduce:transition-none sm:h-8 sm:w-8 ${
              klar
                ? 'border-ink-1 bg-ink-1 text-white'
                : aktuell
                  ? 'border-ink-1 bg-panel'
                  : 'border-kant-stark bg-panel'
            }`}
          >
            {klar ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 10.5l4 4 8-9" />
              </svg>
            ) : aktuell ? (
              <span className="h-2 w-2 rounded-full bg-accent" />
            ) : null}
          </span>
        )

        const innehall = (
          <>
            {nod}
            <span className="mt-1 text-meta tabular-nums text-ink-3">{d.dag}</span>
          </>
        )

        return (
          <li
            key={d.dag}
            role="listitem"
            aria-current={aktuell ? 'step' : undefined}
            aria-label={`Dag ${d.dag} av ${days.length}, ${d.titel}, ${tillstand}`}
            className="relative flex min-w-0 flex-1 flex-col items-center"
          >
            {/* Tråden mellan noderna. Ligger bakom noden, ritas från
                föregående nods mitt till den här. */}
            {i > 0 ? (
              <span
                aria-hidden="true"
                className={`absolute right-1/2 top-[13px] h-0.5 w-full sm:top-[15px] ${linjeFore}`}
              />
            ) : null}

            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(d.dag)}
                className="relative z-[1] flex min-h-11 w-full flex-col items-center justify-start rounded-lg py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {innehall}
              </button>
            ) : (
              <span className="relative z-[1] flex min-h-11 flex-col items-center justify-start py-1">
                {innehall}
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
