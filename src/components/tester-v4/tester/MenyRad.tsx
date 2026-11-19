'use client'

/**
 * En rad i typens meny (skissens .rad): titel, en rad text och till höger
 * ett chip eller en pil. Öppen rad är en länk till handlingen, låst rad
 * öppnar betalväggen, en rad utan adress står som text.
 */

import Link from 'next/link'
import type { ReactNode } from 'react'
import type { Handling } from '@/lib/tester/v4/typer'
import { useOppnaLas } from './LasKontext'
import { LasIkon } from './TesttypKort'
import { TESTER } from './copy'

const RAD =
  'flex min-h-[60px] w-full items-center gap-3 border-t border-kant px-4 py-2.5 text-left first:border-t-0 text-ink-1'

export function MenyChip({ ton, children, las }: { ton: 'las' | 'fri' | 'gjord'; children: ReactNode; las?: boolean }) {
  const farg =
    ton === 'las'
      ? 'bg-papper-2 text-ink-3'
      : 'bg-positiv-mjuk text-positiv'
  return (
    <span className={`inline-flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 text-xs font-semibold ${farg}`}>
      {las ? <LasIkon /> : null}
      {ton === 'gjord' ? <Bock /> : null}
      {children}
    </span>
  )
}

function Bock() {
  return (
    <svg viewBox="0 0 24 24" width={12} height={12} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}

export function Chev() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true" className="shrink-0 text-ink-3" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

/** Högersidan ur handlingen: lås, meta ("1 kvar i dag", "Gratis en gång") eller pil. */
export function hogerFor(h: Handling, gjord?: ReactNode): ReactNode {
  if (h.las) return <MenyChip ton="las" las>{h.las.chip}</MenyChip>
  if (gjord) return gjord
  if (h.meta) return <MenyChip ton="fri">{h.meta}</MenyChip>
  return h.href ? <Chev /> : null
}

export default function MenyRad({
  h,
  rubrik,
  text,
  hoger,
}: {
  h: Handling
  rubrik: string
  text: string
  hoger?: ReactNode
}) {
  const oppnaLas = useOppnaLas()
  const inre = (
    <>
      <span className="min-w-0 flex-1">
        <b className="block text-[15px] font-semibold leading-5">{rubrik}</b>
        <span className="mt-px block text-meta text-ink-3">{text}</span>
      </span>
      {hoger ?? hogerFor(h)}
    </>
  )
  if (h.las) {
    return (
      <button
        type="button"
        className={`${RAD} hover:bg-papper-2`}
        onClick={() => oppnaLas(h)}
        aria-label={TESTER.meny.lasEtikett(rubrik, h.las.chip)}
        data-las={h.las.skal}
      >
        {inre}
      </button>
    )
  }
  if (!h.href) return <div className={RAD}>{inre}</div>
  return (
    <Link href={h.href} className={`${RAD} hover:bg-papper-2`} data-handling={h.slag}>
      {inre}
    </Link>
  )
}
