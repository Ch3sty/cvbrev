'use client'

/**
 * PageHeader: sidhuvudet i sidmallen
 * (docs/plan-inloggat-omdesign.md, avsnitt 3).
 *
 * Alla dashboardsidor börjar med den här. Inga egna hjältar, ingen gradient,
 * ingen illustration i sidhuvudet. Exakt ett h1 per sida.
 *
 * Den primära handlingen ligger till höger på desktop och full bredd överst
 * på mobil, eftersom en knapp under en tvåradig ingress hamnar under vecket
 * på 375 px.
 */

import type { ReactNode } from 'react'

export interface PageHeaderProps {
  /** Sidans h1. Exakt ett per sida. */
  title: string
  /** En rad som säger vad sidan gör, inte vad den heter. */
  description?: string
  /**
   * Vyns enda primära handling. Rendera en knapp eller Link med h-11.
   * Utelämnas när sidan inte har någon.
   */
  action?: ReactNode
  /** Valfri rad under rubriken, till exempel filterpiller eller flikar. */
  children?: ReactNode
  className?: string
}

export default function PageHeader({
  title,
  description,
  action,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header className={className}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-sm leading-relaxed text-neutral-600">
              {description}
            </p>
          ) : null}
        </div>

        {action ? (
          <div className="shrink-0 [&_a]:w-full [&_button]:w-full sm:[&_a]:w-auto sm:[&_button]:w-auto">
            {action}
          </div>
        ) : null}
      </div>

      {children ? <div className="mt-4">{children}</div> : null}
    </header>
  )
}
