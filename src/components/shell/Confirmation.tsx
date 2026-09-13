/**
 * Confirmation: bekräftelsen (docs/designsystem.md, "Tillstånd").
 *
 * Det enda tillfället då tempot skiljer sig från allt annat, och det är
 * kontrollerat: panelen glider upp 8 px, linjen går till 100 procent och
 * blir kvar som panelens 3 px överkant (tråden har nått sitt mål), bocken
 * ritar sin kontur i 480 ms, rubriken glider upp från 560 ms. Rubriken säger
 * vad som skapades: "Ditt brev till Klarna är klart".
 *
 * Allt är CSS-animation (globals.css, confirm-*). Ingen konfetti, ingen
 * maskot, ingen JS för dekoration. prefers-reduced-motion visar slutläget.
 */

import type { ComponentType, ReactNode } from 'react'
import { IlluBrevBekraftat } from '@/components/illustrations/TradenScener'

export interface ConfirmationProps {
  /** Vad som skapades och var det finns. */
  title: string
  /** En mening, till exempel var det sparades. */
  description?: string
  /** Primär handling, en ink-knapp. */
  action?: ReactNode
  /** Sekundär handling som textlänk, aldrig en andra knapp. */
  secondaryAction?: ReactNode
  /** Scen i 96. Standard: brevet med bocken som ritar sig. */
  illustration?: ComponentType<{ size?: number; className?: string }>
  /** Extra innehåll under handlingarna. */
  children?: ReactNode
  className?: string
}

export default function Confirmation({
  title,
  description,
  action,
  secondaryAction,
  illustration: Illu = IlluBrevBekraftat,
  children,
  className,
}: ConfirmationProps) {
  return (
    <section
      role="status"
      aria-live="polite"
      className={`confirm-panel rounded-xl border border-kant bg-panel px-4 pb-5 pt-7 text-center ${className ?? ''}`}
    >
      <span className="mx-auto mb-3 block w-fit text-ink-1" aria-hidden="true">
        <Illu size={96} />
      </span>

      <h2 className="confirm-rise text-fraga text-ink-1">{title}</h2>

      {description ? (
        <p className="confirm-rise confirm-rise-2 mx-auto mt-1.5 max-w-sm text-sm leading-[22px] text-ink-2">
          {description}
        </p>
      ) : null}

      {action || secondaryAction ? (
        <div className="confirm-rise confirm-rise-2 mt-5 flex flex-col items-center gap-1">
          {action}
          {secondaryAction}
        </div>
      ) : null}

      {children ? <div className="confirm-rise confirm-rise-2 mt-4">{children}</div> : null}
    </section>
  )
}
