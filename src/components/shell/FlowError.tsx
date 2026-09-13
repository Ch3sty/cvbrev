'use client'

/**
 * Fel i ett flöde (docs/designsystem.md, "Tillstånd").
 *
 * Fel visas i flödet, aldrig som toast: en toast hinner försvinna innan
 * användaren läst den, och då står hon kvar utan att veta vad som hände.
 *
 * Felraden: fel-mjuk, ikon 20, fet rubrik, en mening, textlänk. Ingen
 * rörelse. Rött aldrig på hela kortet. Meddelandet säger vad som gick fel
 * och hur man går vidare, och "Försök igen" finns alltid när handlingen går
 * att köra om.
 */

import { type ReactNode } from 'react'
import { IkonFel } from '@/components/illustrations/Ikoner'

export interface FlowErrorProps {
  /** Vad som gick fel, i klartext. */
  message: string
  /** Rubrik. Standard "Det gick inte". */
  title?: string
  /** Kör om handlingen. Utelämnas när omförsök inte är möjligt. */
  onRetry?: () => void
  retryLabel?: string
  /** Extra väg framåt, till exempel en länk till supporten. */
  secondaryAction?: ReactNode
  className?: string
}

export default function FlowError({
  message,
  title = 'Det gick inte',
  onRetry,
  retryLabel = 'Försök igen',
  secondaryAction,
  className,
}: FlowErrorProps) {
  return (
    <section
      role="alert"
      className={`flex items-start gap-2.5 rounded-lg border border-fel-kant bg-fel-mjuk p-3 text-fel ${className ?? ''}`}
    >
      <IkonFel size={20} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-sm leading-[22px] text-fel-morker">{message}</p>

        {onRetry || secondaryAction ? (
          <div className="mt-1 flex flex-wrap items-center gap-x-5">
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex min-h-11 items-center text-sm font-medium text-fel-morker underline decoration-fel-kant underline-offset-4 hover:decoration-fel-morker"
              >
                {retryLabel}
              </button>
            ) : null}
            {secondaryAction}
          </div>
        ) : null}
      </div>
    </section>
  )
}
