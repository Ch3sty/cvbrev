/**
 * Förtroendekorten (docs/design/spec-prissida-2026-09-22.html, .fortro).
 *
 * Lagkraven i kortform: uppsägning, betalning, pris i kronor inklusive
 * moms. Tre kort med ikon i 40, rubrik och en mening. Serverkomponent.
 */

import { IkonPrisKlick, IkonPrisKr, IkonPrisLas } from '@/components/illustrations/PriserScener'
import { FORTROENDE } from '@/components/pricing/paket-copy'

const IKON = {
  uppsagning: IkonPrisKlick,
  stripe: IkonPrisLas,
  moms: IkonPrisKr,
} as const

export default function PriserFortroende() {
  return (
    <section aria-label="Villkor" className="mt-12 lg:mt-14">
      <ul className="grid gap-4 sm:grid-cols-3 lg:gap-5">
        {FORTROENDE.map((rad) => {
          const Ikon = IKON[rad.key]
          return (
            <li
              key={rad.key}
              className="grid grid-cols-[40px_1fr] items-start gap-3 rounded-xl border border-kant bg-panel p-4 sm:px-6 sm:py-5"
            >
              <span className="text-ink-1" aria-hidden="true">
                <Ikon />
              </span>
              <span>
                <b className="block font-semibold text-ink-1">{rad.rubrik}</b>
                <span className="text-sm leading-[22px] text-ink-2">{rad.text}</span>
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
