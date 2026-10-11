/**
 * Byggstenarna som korten i Din utveckling delar: kortet, eyebrow-raden med
 * i-knappen och legendens rutor. Kortet är relative, så att HjalpKnappens
 * popover hamnar i kortet.
 */

import type { ReactNode } from 'react'
import { HjalpKnapp } from '@/components/hjalp'
import type { HjalpId } from '@/lib/traning/hjalp-copy'

export function UKort({
  label,
  lyft,
  className,
  children,
  data,
}: {
  label: string
  /** Lyft: skugga och kant som LyftKort. Överlappet mot väggen styrs med className. */
  lyft?: boolean
  className?: string
  children: ReactNode
  data?: string
}) {
  return (
    <section
      aria-label={label}
      data-utv-kort={data}
      className={`relative min-w-0 rounded-2xl border bg-papper p-4 ${
        lyft ? 'z-[2] border-[color:var(--lyft-kant)] shadow-lyft' : 'border-kant'
      } ${className ?? ''}`}
    >
      {children}
    </section>
  )
}

export function Eyebrow({ children, hjalp, hjalpEtikett, koppar }: { children: ReactNode; hjalp?: HjalpId; hjalpEtikett?: string; koppar?: boolean }) {
  return (
    <p className={`flex items-center gap-2 text-ey ${koppar ? 'text-koppar-ink' : 'text-ink-3'}`}>
      <span>{children}</span>
      {hjalp ? <HjalpKnapp id={hjalp} etikett={hjalpEtikett} /> : null}
    </p>
  )
}

export function T2({ children, as = 'h3' }: { children: ReactNode; as?: 'h2' | 'h3' }) {
  const Tag = as
  return <Tag className="mt-1 font-display text-[18px] font-bold leading-[23px] tracking-[-0.015em] text-ink-1">{children}</Tag>
}

export function Brodtext({ children }: { children: ReactNode }) {
  return <p data-lopt className="mt-1.5 text-sm leading-[21px] text-ink-2">{children}</p>
}

/** En rad i en legend: en ritad ruta och ordet. */
export function Legend({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs leading-4 text-ink-3 ${className ?? ''}`}>{children}</div>
}

export function LegendPost({ ruta, children }: { ruta: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true" className="shrink-0">
        {ruta}
      </svg>
      {children}
    </span>
  )
}

/** Ett display-tal med kort etikett under. */
export function Tal({ varde, enhet, etikett, ton = 'ink' }: { varde: string; enhet?: string; etikett: string; ton?: 'ink' | 'koppar' }) {
  return (
    <div className="min-w-0">
      <p className={`font-display text-[28px] font-bold leading-[30px] tracking-[-0.02em] tabular-nums ${ton === 'koppar' ? 'text-koppar-ink' : 'text-ink-1'}`}>
        {varde}
        {enhet ? <span className="ml-0.5 text-[18px] font-semibold text-ink-2">{enhet}</span> : null}
      </p>
      <p className="mt-0.5 text-meta text-ink-3">{etikett}</p>
    </div>
  )
}
