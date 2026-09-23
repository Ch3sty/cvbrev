/**
 * Gratisraden (docs/design/spec-prissida-2026-09-22.html, .gratis).
 *
 * En streckad panel under korten: det lilla papperet, en mening som skriver
 * ut exakt vad gratisnivån ger, och en sekundärknapp till registreringen.
 * Serverkomponent. Ingen interaktion, ingen accent utöver papperets punkt.
 */

import Link from 'next/link'

import { IlluScenGratis } from '@/components/illustrations/PriserScener'
import { GRATIS } from '@/components/pricing/paket-copy'

export default function PriserGratis() {
  return (
    <section
      id="gratis"
      aria-labelledby="priser-gratis"
      className="mt-4 grid scroll-mt-20 items-center gap-4 rounded-xl border border-dashed border-kant-stark bg-panel p-4 text-sm leading-[22px] text-ink-2 sm:grid-cols-[auto_1fr_auto] sm:gap-6 sm:px-6 sm:py-5"
    >
      <span className="text-ink-1" aria-hidden="true">
        <IlluScenGratis className="h-14 w-14" />
      </span>
      <p>
        <b id="priser-gratis" className="font-semibold text-ink-1">
          {GRATIS.rubrik}
        </b>{' '}
        {GRATIS.delar.map((d, i) =>
          d.fet ? (
            <b key={i} className="font-semibold text-ink-1">
              {d.text}
            </b>
          ) : (
            <span key={i}>{d.text}</span>
          )
        )}
      </p>
      <Link
        href="/register"
        className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded-lg border border-kant-stark bg-panel px-4 text-sm font-semibold text-ink-1 transition-colors hover:bg-insunken"
      >
        {GRATIS.knapp}
      </Link>
    </section>
  )
}
