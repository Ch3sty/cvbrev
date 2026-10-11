'use client'

/**
 * Lägesraden på väggen i Rekryteringstester (art-director, beslut-hemvy
 * 2026-10-11 punkt 1): rummets två sätt att träna, planen och Alla tester,
 * som två textlägen direkt under Toppraden. Samma rad på hemvyn, Alla tester
 * och Din utveckling, så den står stilla när man växlar.
 *
 * Fylld segmentkontroll (tillägget "anonym", 2026-10-11): ett spår i
 * bg-white/10 med två piller och ikon. Aktivt läge fyllt i papper med ink-1,
 * inaktivt i vagg-ink utan fyllning. Dator 48 px hög (segment 42, minst
 * 172 px brett), mobil 44 px i Toppraden (segment 38, två lika breda).
 * `aktiv` sätts av sidan som ritar raden, aldrig ur sökvägen.
 *
 * Klient bara för mätningen: ett tryck markerar ytan 'lagesrad' så att
 * nästa visning vet hur man kom dit.
 */

import Link from 'next/link'
import { LAGESRAD } from '@/lib/rum/copy'
import { TRANING_RUTT } from '@/lib/traning/rutter'
import { markeraRumYta } from './rumMatning'
import { DorrTran, IkonKalender } from '@/components/illustrations/RumSymboler'

export type Lage = 'plan' | 'alla'

/**
 * På mobil står raden i Toppraden i stället för rummets namn (tillägget
 * 2026-10-11 punkt 1): `plats="topprad"` ritas bara under lg, den egna raden
 * på väggen bara från lg.
 */
export default function Lagesrad({ aktiv, plats = 'vagg' }: { aktiv: Lage; plats?: 'vagg' | 'topprad' }) {
  const lagen = [
    { id: 'plan' as Lage, text: LAGESRAD.plan, href: TRANING_RUTT.hem, Ikon: IkonKalender },
    { id: 'alla' as Lage, text: LAGESRAD.alla, href: TRANING_RUTT.alla, Ikon: DorrTran },
  ]
  const topp = plats === 'topprad'
  return (
    <nav
      aria-label={LAGESRAD.etikett}
      data-lagesrad={aktiv}
      className={`items-stretch gap-0 rounded-full border border-vagg-kant bg-white/10 p-[3px] ${
        topp ? 'flex h-11 w-full max-w-[280px] lg:hidden' : 'mb-5 mt-2 hidden h-12 w-fit lg:flex'
      }`}
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
            className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-display text-[15px] font-semibold tracking-[-.01em] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-koppar-ljus ${
              topp ? 'flex-1 px-3' : 'min-w-[172px] px-5'
            } ${ar ? 'bg-papper text-ink-1' : 'text-vagg-ink hover:bg-white/[.12]'}`}
          >
            <l.Ikon size={20} />
            {l.text}
          </Link>
        )
      })}
    </nav>
  )
}
