'use client'

/**
 * Lägesraden på väggen i Rekryteringstester (art-director, beslut-hemvy
 * 2026-10-11 punkt 1): rummets två sätt att träna, planen och Alla tester,
 * som två textlägen direkt under Toppraden. Samma rad på hemvyn, Alla tester
 * och Din utveckling, så den står stilla när man växlar.
 *
 * 15/600 display. Aktivt läge i vagg-ink med en 2 px kopparlinje under
 * texten, inaktivt i vagg-mjuk. 44 px träffyta, 24 px mellan lägena.
 * `aktiv` sätts av sidan som ritar raden, aldrig ur sökvägen.
 *
 * Klient bara för mätningen: ett tryck markerar ytan 'lagesrad' så att
 * nästa visning vet hur man kom dit.
 */

import Link from 'next/link'
import { LAGESRAD } from '@/lib/rum/copy'
import { TRANING_RUTT } from '@/lib/traning/rutter'
import { markeraRumYta } from './rumMatning'

export type Lage = 'plan' | 'alla'

/**
 * På mobil står raden i Toppraden i stället för rummets namn (tillägget
 * 2026-10-11 punkt 1): `plats="topprad"` ritas bara under lg, den egna raden
 * på väggen bara från lg.
 */
export default function Lagesrad({ aktiv, plats = 'vagg' }: { aktiv: Lage; plats?: 'vagg' | 'topprad' }) {
  const lagen: { id: Lage; text: string; href: string }[] = [
    { id: 'plan', text: LAGESRAD.plan, href: TRANING_RUTT.hem },
    { id: 'alla', text: LAGESRAD.alla, href: TRANING_RUTT.alla },
  ]
  return (
    <nav
      aria-label={LAGESRAD.etikett}
      data-lagesrad={aktiv}
      className={plats === 'topprad' ? 'flex h-11 items-stretch gap-6 lg:hidden' : 'mb-2 hidden h-11 items-stretch gap-6 lg:flex'}
    >
      {lagen.map((l) => {
        const ar = l.id === aktiv
        return (
          <Link
            key={l.id}
            href={l.href}
            aria-current={ar ? 'page' : undefined}
            // Sidan man står på förhämtas aldrig (tillägget 2026-10-11, hemvyns LCP).
            prefetch={ar ? false : undefined}
            onClick={ar ? undefined : () => markeraRumYta('lagesrad')}
            className={`inline-flex items-center font-display text-[15px] font-semibold tracking-[-.01em] ${
              ar ? 'text-vagg-ink' : 'text-vagg-mjuk'
            }`}
          >
            <span className={`border-b-2 pb-0.5 ${ar ? 'border-koppar' : 'border-transparent'}`}>{l.text}</span>
          </Link>
        )
      })}
    </nav>
  )
}
