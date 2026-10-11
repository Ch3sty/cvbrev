/**
 * Hjälpredan (docs/design/spec-prissida-2026-09-22.html, .veckor, med
 * listan ur docs/design/spec-onboarding-2026-09-22.html sektion 2).
 *
 * Ett kort med det hjälpredan Kom igång leder igenom i logisk ordning:
 * profilen och CV:t först, sedan det som bygger på dem. Numrerade rundlar,
 * första steget fyllt, två spalter på desktop. Serverkomponent.
 */

import { GUIDE } from '@/components/pricing/paket-copy'

export default function PriserGuide() {
  const lista = GUIDE.listor.allt
  return (
    <section id="guide" aria-labelledby="priser-guide" className="mt-16 scroll-mt-20 lg:mt-[88px]">
      <h2
        id="priser-guide"
        className="text-center font-display text-[28px] font-bold leading-8 tracking-[-0.025em] text-ink-1 [text-wrap:balance] lg:text-[40px] lg:leading-[44px]"
      >
        {GUIDE.h2}
      </h2>
      <p className="mx-auto mt-2 max-w-[62ch] text-center text-base text-ink-2">{GUIDE.ingress}</p>

      <article className="mt-6 rounded-xl border border-kant bg-panel p-4 sm:p-6 lg:mt-8" aria-label={lista.etikett}>
        <p className="text-steg font-semibold uppercase tracking-[0.08em] text-ink-3">{lista.etikett}</p>
        <ol className="mt-4 grid list-none gap-x-10 p-0 lg:grid-cols-2">
          {lista.steg.map((steg, i) => (
            <li key={steg} className="relative min-h-9 pb-3 pl-10 text-sm leading-6 text-ink-1">
              <span
                aria-hidden="true"
                className={`absolute left-0 top-0 grid h-6 w-6 place-items-center rounded-full border-2 text-xs font-semibold ${
                  i === 0 ? 'border-ink-1 bg-ink-1 text-white' : 'border-kant-stark bg-panel text-ink-3'
                }`}
              >
                {i + 1}
              </span>
              {steg}
            </li>
          ))}
        </ol>
      </article>
    </section>
  )
}
