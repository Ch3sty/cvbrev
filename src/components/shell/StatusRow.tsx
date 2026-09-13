'use client'

/**
 * StatusRow: status är en rad, innehåll är ett kort
 * (docs/designsystem.md, "Komponenter").
 *
 * Alltid panel, ingen fyllning. Tonen byter punkt och text, inte ytan:
 *   neutral   punkt i ink-3, text i ink-1
 *   warm      accentpunkt, text i accent-ink (orange som bläck, räknas)
 *   positive  punkt i positiv
 *
 * Handlingen till höger är alltid en textlänk eller ikonknapp, aldrig en
 * fylld knapp. Raden glider in 4 px uppifrån.
 */

import type { ReactNode } from 'react'

export type StatusTone = 'neutral' | 'warm' | 'positive'

const TONE: Record<StatusTone, { text: string; dot: string }> = {
  neutral: { text: 'text-ink-1', dot: 'bg-ink-3' },
  warm: { text: 'text-accent-ink', dot: 'bg-accent' },
  positive: { text: 'text-ink-1', dot: 'bg-positiv' },
}

export interface StatusRowProps {
  /** Radens text. Håll den kort nog att rymmas på 375 px. */
  children: ReactNode
  tone?: StatusTone
  /** Visa punkt till vänster. Utelämnas när raden inte är ett tillstånd. */
  showDot?: boolean
  /** Handling till höger. Alltid textlänk eller ikonknapp, aldrig fylld knapp. */
  action?: ReactNode
  /** Tillgängligt namn när raden läses av skärmläsare. */
  label?: string
  className?: string
}

export default function StatusRow({
  children,
  tone = 'neutral',
  showDot,
  action,
  label,
  className,
}: StatusRowProps) {
  const t = TONE[tone]

  return (
    <div
      className={`flex min-h-11 items-center justify-between gap-3 rounded-lg border border-kant bg-panel px-3 ${t.text} ${className ?? ''}`}
      aria-label={label}
    >
      <span className="flex min-w-0 items-center gap-2">
        {showDot ? (
          <span className={`h-2 w-2 shrink-0 rounded-full ${t.dot}`} aria-hidden="true" />
        ) : null}
        <span className="truncate text-sm font-medium">{children}</span>
      </span>

      {action ? <span className="shrink-0">{action}</span> : null}
    </div>
  )
}
