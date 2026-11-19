/**
 * Den tonade gruppen för planens delar (ägaren omgång 7): egen bakgrund och
 * rubriken "Ingår i I-provet · 3 delar", så att det inte går att missa varför
 * vissa kort är orange, utan att de andra blir tråkiga.
 */

import type { ReactNode } from 'react'
import { TESTER } from './copy'

export const RUTNAT = 'grid grid-cols-1 gap-3 sm:grid-cols-2'

export default function ProvGrupp({
  namn,
  delar,
  rutnat,
  children,
}: {
  namn: string
  delar: number
  /** Rutnätets klasser, som följer panelens läge. */
  rutnat: string
  children: ReactNode
}) {
  const rubrik = TESTER.grupp(namn, delar)
  return (
    <section
      aria-label={rubrik}
      data-provgrupp
      className="grid gap-3 rounded-[18px] border border-[color-mix(in_srgb,var(--koppar)_35%,transparent)] bg-[color-mix(in_srgb,var(--koppar-mjuk)_55%,var(--papper))] p-3.5"
    >
      <h2 className="text-ey text-koppar-ink">{rubrik}</h2>
      <div className={rutnat}>{children}</div>
    </section>
  )
}
