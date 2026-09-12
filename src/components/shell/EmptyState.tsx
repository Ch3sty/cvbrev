'use client'

/**
 * EmptyState: tomt tillstånd, samma överallt
 * (docs/plan-inloggat-omdesign.md, avsnitt 3).
 *
 * Illustration 96, rubrik, en mening, en knapp. Aldrig en tom yta med bara
 * text, och aldrig ett skelett som ligger kvar.
 *
 * Illustrationen skickas in som komponent ur EmptyStateIllustrations, så att
 * varje yta har sitt eget motiv utan att EmptyState känner till dem.
 */

import type { ComponentType, ReactNode } from 'react'

export interface EmptyStateProps {
  /** Illustration ur src/components/illustrations/EmptyStateIllustrations. */
  illustration?: ComponentType<{ size?: number; className?: string }>
  /** Kort rubrik, till exempel "Inga ansökningar än". */
  title: string
  /** En mening om vad nästa steg ger. */
  description?: string
  /** Primär handling. En knapp eller Link med h-11. */
  action?: ReactNode
  /** Sekundär handling som textlänk, aldrig en andra knapp. */
  secondaryAction?: ReactNode
  /**
   * Utan ram när tillståndet redan ligger inuti ett kort, till exempel i en
   * lista som har egen border.
   */
  bare?: boolean
  className?: string
}

export default function EmptyState({
  illustration: Illu,
  title,
  description,
  action,
  secondaryAction,
  bare,
  className,
}: EmptyStateProps) {
  const frame = bare
    ? ''
    : 'bg-white rounded-xl border border-neutral-200'

  return (
    <section
      className={`${frame} px-4 py-10 sm:px-6 sm:py-12 text-center ${className ?? ''}`}
      aria-label={title}
    >
      {Illu ? (
        <span
          className="mx-auto mb-4 block w-fit text-neutral-900"
          aria-hidden="true"
        >
          <Illu size={96} />
        </span>
      ) : null}

      <h2 className="text-base font-semibold tracking-tight text-neutral-900">
        {title}
      </h2>

      {description ? (
        <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-neutral-600">
          {description}
        </p>
      ) : null}

      {action || secondaryAction ? (
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-5">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </section>
  )
}
