/**
 * PageHeader: sidhuvudet i sidmallen (docs/designsystem.md avsnitt 6).
 *
 * Sidans enda h1, i display-snittet (text-h1: 32/35 mobil, 44/46 desktop,
 * Schibsted Grotesk 800). Rubriken säger vad användaren får, underraden vad
 * sidan gör (avsnitt 13). En valfri eyebrow ovanför rubriken säger var man
 * är: "Rekryteringstester".
 *
 * Scenen (240 × 200 ur PriserScener-familjen) står i egen kolumn till höger
 * från lg. På mobil faller den bort: en scen ovanför rubriken skulle trycka
 * vyns primära handling under första skärmhöjden, och det väger tyngre
 * (docs/bygg-noter-paket.md, "Visuell linje: avgjort").
 *
 * Den primära handlingen ligger till höger på desktop och full bredd på
 * mobil. Med scen hamnar handlingen under texten, eftersom scenkolumnen tar
 * högerplatsen.
 *
 * Inga hooks och ingen 'use client': används i både server- och
 * klientkomponenter.
 */

import type { ReactNode } from 'react'

export interface PageHeaderProps {
  /** Sidans h1. Exakt ett per sida. */
  title: string
  /** En rad som säger vad sidan gör, inte vad den heter. */
  description?: ReactNode
  /** Etikett ovanför rubriken, versaler i ink-3. */
  eyebrow?: string
  /**
   * Vyns enda primära handling. Rendera en knapp eller Link med h-11.
   * Utelämnas när sidan inte har någon.
   */
  action?: ReactNode
  /** Scen i 240 × 200, i egen kolumn från lg. */
  scene?: ReactNode
  /** Valfri rad under rubriken, till exempel filterpiller eller flikar. */
  children?: ReactNode
  className?: string
}

export default function PageHeader({
  title,
  description,
  eyebrow,
  action,
  scene,
  children,
  className,
}: PageHeaderProps) {
  const texten = (
    <>
      {eyebrow ? <p className="mb-2 text-steg uppercase text-ink-3">{eyebrow}</p> : null}
      <h1 className="text-h1 text-ink-1">{title}</h1>
      {description ? (
        <p className="mt-2 max-w-[60ch] text-sm leading-[22px] text-ink-2 sm:text-base sm:leading-6">
          {description}
        </p>
      ) : null}
    </>
  )

  const handling = action ? (
    <div className="shrink-0 [&_a]:w-full [&_button]:w-full sm:[&_a]:w-auto sm:[&_button]:w-auto">
      {action}
    </div>
  ) : null

  if (scene) {
    return (
      <header className={className}>
        <div className="flex items-center gap-8">
          <div className="min-w-0 flex-1">
            {texten}
            {handling ? <div className="mt-4">{handling}</div> : null}
          </div>
          <div className="hidden w-[240px] shrink-0 text-ink-1 lg:block" aria-hidden="true">
            {scene}
          </div>
        </div>
        {children ? <div className="mt-4">{children}</div> : null}
      </header>
    )
  }

  return (
    <header className={className}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">{texten}</div>
        {handling}
      </div>

      {children ? <div className="mt-4">{children}</div> : null}
    </header>
  )
}
