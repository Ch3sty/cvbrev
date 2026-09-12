'use client'

/**
 * Fel i ett flöde (docs/plan-inloggat-omdesign.md, avsnitt 6).
 *
 * Fel visas i flödet, aldrig som toast: en toast hinner försvinna innan
 * användaren läst den, och då står hon kvar utan att veta vad som hände.
 * Enligt designsystemet är fel röd text, aldrig rött kort.
 *
 * Meddelandet säger vad som gick fel och hur man går vidare, och "Försök
 * igen" finns alltid när handlingen går att köra om.
 */

import { type ReactNode } from 'react'

export interface FlowErrorProps {
  /** Vad som gick fel, i klartext. */
  message: string
  /** Kör om handlingen. Utelämnas när omförsök inte är möjligt. */
  onRetry?: () => void
  retryLabel?: string
  /** Extra väg framåt, till exempel en länk till supporten. */
  secondaryAction?: ReactNode
}

export default function FlowError({
  message,
  onRetry,
  retryLabel = 'Försök igen',
  secondaryAction,
}: FlowErrorProps) {
  return (
    <section
      role="alert"
      className="rounded-xl border border-neutral-200 bg-white p-4"
    >
      <h2 className="text-base font-semibold text-red-700">Det gick inte</h2>
      <p className="mt-1 text-sm leading-relaxed text-neutral-600">{message}</p>

      {onRetry || secondaryAction ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-orange-600 px-4 text-sm font-medium text-white transition-colors hover:bg-orange-700"
            >
              {retryLabel}
            </button>
          ) : null}
          {secondaryAction}
        </div>
      ) : null}
    </section>
  )
}
