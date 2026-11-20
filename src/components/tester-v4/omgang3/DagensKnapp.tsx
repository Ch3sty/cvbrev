'use client'

/**
 * Den stora knappen på väggen (omgång 3): "Starta dagens träning", "Gör
 * Nivåkollen" eller "Starta dagens test". En riktig länk till en befintlig
 * adress. Kräver handlingen Premium står låset i knappen och länken går till
 * typens meny, som visar låset och betalväggen (samma regel som Nästa steg
 * på förra Hem). Kommer knappen ur en hint skickas hint_klickad som förut.
 */

import Link from 'next/link'
import type { DagensTraning, TestTypId } from '@/lib/tester/v4/typer'
import { hintKlickad, type HintKontext } from '@/components/tester-v4/hem/HintSparning'

export function LasIkon3({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={2.2}>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </svg>
  )
}

export function PilIkon3({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export default function DagensKnapp({
  knapp,
  hint,
  kontext,
  typ,
  bred,
}: {
  knapp: DagensTraning['knapp']
  hint: DagensTraning['hint']
  kontext: HintKontext
  typ: TestTypId
  bred?: boolean
}) {
  const las = knapp.las
  return (
    <Link
      href={knapp.href}
      className={`t3-stor ${bred ? 't3-stor-bred' : ''}`}
      data-dagens-knapp
      data-slag={knapp.slag}
      data-typ={typ}
      data-las={las ? las.skal : undefined}
      onClick={() => {
        if (hint) hintKlickad(hint, kontext, 0)
      }}
    >
      {las ? <LasIkon3 /> : null}
      {knapp.etikett}
      {las ? null : <PilIkon3 />}
    </Link>
  )
}
