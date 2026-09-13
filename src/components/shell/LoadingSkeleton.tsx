'use client'

/**
 * LoadingSkeleton: laddning i sidmallens former
 * (docs/designsystem.md, "Tillstånd").
 *
 * Skelettet står stilla i insunken. Bara tråden rör sig, 2 px längs
 * panelens överkant i 1200 ms (globals.css, .loading-thread). Samma
 * laddningsmönster överallt är en riktig röd tråd; ingen puls, ingen
 * shimmer.
 *
 * Ett skelett får aldrig ligga kvar. Har anropet misslyckats visas ett fel,
 * har det gett noll rader visas EmptyState.
 *
 * Varianten writing är den långa väntan: rubriken säger vad som skrivs,
 * tre rader fylls i tur och ordning, meta säger hur länge.
 */

export type SkeletonVariant = 'row' | 'card' | 'list' | 'text' | 'statusRow' | 'writing'

export interface LoadingSkeletonProps {
  variant?: SkeletonVariant
  /** Antal upprepningar för list och text. */
  count?: number
  /** Tillgänglig text medan innehållet laddas. Rubrik i variant writing. */
  label?: string
  /** Variant writing: en rad om varför det tar tid, till exempel tidsåtgång. */
  meta?: string
  className?: string
}

const BLOCK = 'rounded bg-insunken'

export default function LoadingSkeleton({
  variant = 'row',
  count = 3,
  label = 'Laddar',
  meta,
  className,
}: LoadingSkeletonProps) {
  if (variant === 'writing') {
    return (
      <section
        role="status"
        aria-busy="true"
        aria-live="polite"
        className={`loading-thread rounded-xl border border-kant bg-panel p-4 ${className ?? ''}`}
      >
        <p className="text-sm font-medium text-ink-1">{label}</p>
        <div className="writing-lines mt-3" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        {meta ? <p className="mt-3 text-meta text-ink-3">{meta}</p> : null}
      </section>
    )
  }

  return (
    <div role="status" aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      {render(variant, count)}
    </div>
  )
}

function render(variant: SkeletonVariant, count: number) {
  switch (variant) {
    case 'statusRow':
      return <div className={`${BLOCK} h-11 rounded-lg`} />

    case 'text':
      return (
        <div className="space-y-2">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className={`${BLOCK} h-4`}
              style={{ width: i === count - 1 ? '60%' : '100%' }}
            />
          ))}
        </div>
      )

    case 'card':
      return <SkeletonCard />

    case 'list':
      return (
        <div className="space-y-2">
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonRow key={i} thread={i === 0} />
          ))}
        </div>
      )

    case 'row':
    default:
      return <SkeletonRow thread />
  }
}

function SkeletonRow({ thread }: { thread?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-kant bg-panel p-4 ${
        thread ? 'loading-thread' : ''
      }`}
    >
      <div className={`${BLOCK} h-10 w-10 shrink-0 rounded-lg`} />
      <div className="min-w-0 flex-1 space-y-2">
        <div className={`${BLOCK} h-4 w-1/3`} />
        <div className={`${BLOCK} h-3 w-1/2`} />
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="loading-thread rounded-xl border border-kant bg-panel p-4 sm:p-5">
      <div className={`${BLOCK} h-4 w-1/3`} />
      <div className={`${BLOCK} mt-3 h-3 w-full`} />
      <div className={`${BLOCK} mt-2 h-3 w-4/5`} />
      <div className={`${BLOCK} mt-5 h-11 w-40 rounded-lg`} />
    </div>
  )
}
