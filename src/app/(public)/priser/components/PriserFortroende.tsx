'use client'

/**
 * Förtroenderaden (docs/plan-paket-och-onboarding.md, Fas 2D).
 *
 * Lagkraven i avsnitt 8 i kortform: uppsägning, betalning, pris i kronor
 * inklusive moms. Tre rader på mobil, tre kolumner på desktop, naken ikon 24
 * i ink-2. Ingen platta, ingen accent.
 */

import { IkonKrona, IkonLank, IkonSkold } from '@/components/illustrations/Ikoner'
import { FORTROENDE_RADER } from '@/components/pricing/paket-copy'

const IKON = {
  uppsagning: IkonLank,
  stripe: IkonSkold,
  moms: IkonKrona,
} as const

export default function PriserFortroende() {
  return (
    <section
      aria-label="Villkor"
      className="rounded-xl border border-kant bg-panel p-4 sm:p-5"
    >
      <ul className="grid gap-3 sm:grid-cols-3">
        {FORTROENDE_RADER.map((rad) => {
          const Ikon = IKON[rad.key]
          return (
            <li key={rad.key} className="flex items-center gap-3">
              <span className="shrink-0 text-ink-2" aria-hidden="true">
                <Ikon />
              </span>
              <span className="text-sm leading-[22px] text-ink-2">{rad.text}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}