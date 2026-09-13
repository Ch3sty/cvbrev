'use client'

/**
 * EmptyState: tomt tillstånd, samma överallt
 * (docs/designsystem.md, "Tillstånd").
 *
 * Scen 96, kortrubrik, en mening, ink-knapp. Aldrig en tom yta med bara
 * text, och aldrig ett skelett som ligger kvar.
 *
 * Illustrationen skickas in som komponent, så att varje yta har sitt eget
 * motiv utan att EmptyState känner till dem. Utan angiven illustration visas
 * den öppna mappen som väntar på sitt första ark.
 */

import type { ComponentType, ReactNode } from 'react'
import { IlluTomMapp } from '@/components/illustrations/TradenScener'

export interface EmptyStateProps {
  /** Scen i 96, till exempel ur TradenScener eller EmptyStateIllustrations. */
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
  illustration: Illu = IlluTomMapp,
  title,
  description,
  action,
  secondaryAction,
  bare,
  className,
}: EmptyStateProps) {
  const frame = bare ? '' : 'rounded-xl border border-kant bg-panel'

  return (
    <section className={`${frame} px-4 py-8 text-center sm:px-6 ${className ?? ''}`} aria-label={title}>
      <span className="mx-auto mb-3 block w-fit text-ink-1" aria-hidden="true">
        <Illu size={96} />
      </span>

      <h2 className="text-kort text-ink-1">{title}</h2>

      {description ? (
        <p className="mx-auto mt-1 max-w-[280px] text-sm leading-[22px] text-ink-2">{description}</p>
      ) : null}

      {action || secondaryAction ? (
        <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-5">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </section>
  )
}
