'use client'

/**
 * StatusRow: status är en rad, innehåll är ett kort
 * (docs/designsystem.md, docs/plan-inloggat-omdesign.md avsnitt 3).
 *
 * En rad, aldrig ett kort. Används för kvoter, premiumstatus, uppföljningar
 * och andra lägen som ska läsas i förbifarten.
 *
 * Tonen byter en gång, inte gradvis: neutral tills något faktiskt kräver
 * uppmärksamhet, då warm. Ingen färgskala, ingen progressbar.
 */

import type { ReactNode } from 'react'

export type StatusTone = 'neutral' | 'warm' | 'positive'

const TONE: Record<StatusTone, { frame: string; dot: string }> = {
  neutral: { frame: 'bg-white border-neutral-200 text-neutral-900', dot: 'bg-neutral-400' },
  warm: { frame: 'bg-orange-50 border-orange-200 text-orange-900', dot: 'bg-orange-600' },
  positive: { frame: 'bg-white border-neutral-200 text-neutral-900', dot: 'bg-emerald-600' },
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
      className={`flex min-h-11 items-center justify-between gap-3 rounded-lg border px-3 ${t.frame} ${className ?? ''}`}
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
