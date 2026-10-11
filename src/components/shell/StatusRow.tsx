'use client'

/**
 * StatusRow: status är en rad, innehåll är ett kort
 * (docs/designsystem.md, "Komponenter"; Rummen: konceptets .status).
 *
 * Alltid papper, ingen fyllning, radie 12, 12 px luft, 14/20. Tonen byter
 * punkt och text, inte ytan:
 *   neutral   punkt i ink-3, text i ink-1
 *   warm      kopparpunkt, text i koppar-ink
 *   positive  punkt i positiv
 * På väggen (pa="vagg") står raden i glas: vitt 5 procent och väggens kant,
 * text i vagg-ink (koppar-ljus för warm, aldrig ren koppar som text).
 *
 * Handlingen till höger är alltid en textlänk eller ikonknapp, aldrig en
 * fylld knapp.
 */

import type { ReactNode } from 'react'

export type StatusTone = 'neutral' | 'warm' | 'positive'

const TONE: Record<StatusTone, { text: string; dot: string }> = {
  neutral: { text: 'text-ink-1', dot: 'bg-ink-3' },
  warm: { text: 'text-koppar-ink', dot: 'bg-koppar' },
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
  /**
   * Låt texten gå i två rader i stället för att kapas. Standard är kapning,
   * som håller raden på en höjd. Sätts där slutet av meningen bär innebörden
   * och inte får försvinna, t.ex. priset under provperioden.
   */
  wrap?: boolean
  /** Raden står på väggen. */
  pa?: 'golv' | 'vagg'
  className?: string
}

export default function StatusRow({
  children,
  tone = 'neutral',
  showDot,
  action,
  label,
  wrap,
  pa = 'golv',
  className,
}: StatusRowProps) {
  const t = TONE[tone]
  const yta =
    pa === 'vagg'
      ? `border-vagg-kant bg-white/5 ${tone === 'warm' ? 'text-koppar-ljus' : 'text-vagg-ink'}`
      : `border-kant bg-papper ${t.text}`

  return (
    <div
      className={`flex min-h-11 items-center justify-between gap-3 rounded-xl border px-4 py-2.5 ${yta} ${className ?? ''}`}
      aria-label={label}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        {showDot ? (
          <span className={`h-2 w-2 shrink-0 rounded-full ${t.dot}`} aria-hidden="true" />
        ) : null}
        <span className={`text-sm leading-5 ${wrap ? '' : 'truncate'}`}>{children}</span>
      </span>

      {action ? <span className="shrink-0">{action}</span> : null}
    </div>
  )
}
