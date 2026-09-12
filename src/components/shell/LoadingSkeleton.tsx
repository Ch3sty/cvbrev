'use client'

/**
 * LoadingSkeleton: laddningstillstånd i sidmallens former
 * (docs/plan-inloggat-omdesign.md, avsnitt 6).
 *
 * Skelettet ska ha samma form som det som kommer, annars hoppar layouten när
 * datan landar. Neutrala toner, aldrig orange: ett skelett är inte en accent.
 *
 * Ett skelett får aldrig ligga kvar. Har anropet misslyckats visas ett fel,
 * har det gett noll rader visas EmptyState.
 */

export type SkeletonVariant = 'row' | 'card' | 'list' | 'text' | 'statusRow'

export interface LoadingSkeletonProps {
  variant?: SkeletonVariant
  /** Antal upprepningar för list och text. */
  count?: number
  /** Tillgänglig text medan innehållet laddas. */
  label?: string
  className?: string
}

const BASE = 'animate-pulse rounded bg-neutral-100'

export default function LoadingSkeleton({
  variant = 'row',
  count = 3,
  label = 'Laddar',
  className,
}: LoadingSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={className}
    >
      <span className="sr-only">{label}</span>
      {render(variant, count)}
    </div>
  )
}

function render(variant: SkeletonVariant, count: number) {
  switch (variant) {
    case 'statusRow':
      return <div className={`${BASE} h-11 rounded-lg`} />

    case 'text':
      return (
        <div className="space-y-2">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className={`${BASE} h-4`}
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
            <SkeletonRow key={i} />
          ))}
        </div>
      )

    case 'row':
    default:
      return <SkeletonRow />
  }
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4">
      <div className={`${BASE} h-10 w-10 shrink-0 rounded-lg`} />
      <div className="min-w-0 flex-1 space-y-2">
        <div className={`${BASE} h-4 w-1/3`} />
        <div className={`${BASE} h-3 w-1/2`} />
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
      <div className={`${BASE} h-4 w-1/3`} />
      <div className={`${BASE} mt-3 h-3 w-full`} />
      <div className={`${BASE} mt-2 h-3 w-4/5`} />
      <div className={`${BASE} mt-5 h-11 w-40 rounded-lg`} />
    </div>
  )
}
