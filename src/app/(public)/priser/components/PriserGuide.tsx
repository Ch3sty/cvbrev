/**
 * "Allt är öppet från första minuten. Så här guidar vi dig igenom det."
 * (docs/design/spec-prissida-2026-09-22.html, .veckor, med listorna ur
 * docs/design/spec-onboarding-2026-09-22.html sektion 2).
 *
 * Tre kort, ett per paket, med det hjälpredan Kom igång leder igenom i
 * logisk ordning: profilen och CV:t först, sedan det som bygger på dem.
 * Numrerade rundlar på en lodrät linje, första steget fyllt. Serverkomponent.
 */

import { GUIDE, PAKET_IDS, PAKET_KORT, type PaketId } from '@/components/pricing/paket-copy'

const TAG: Record<PaketId, string> = {
  cv: 'bg-cv-mjuk text-cv',
  test: 'bg-test-mjuk text-test',
  allt: 'bg-ink-1 text-white',
}

export default function PriserGuide() {
  return (
    <section id="guide" aria-labelledby="priser-guide" className="mt-16 scroll-mt-20 lg:mt-[88px]">
      <h2
        id="priser-guide"
        className="text-center font-display text-[28px] font-bold leading-8 tracking-[-0.025em] text-ink-1 [text-wrap:balance] lg:text-[40px] lg:leading-[44px]"
      >
        {GUIDE.h2}
      </h2>
      <p className="mx-auto mt-2 max-w-[62ch] text-center text-base text-ink-2">{GUIDE.ingress}</p>

      <div className="mt-6 grid gap-4 lg:mt-8 lg:grid-cols-3 lg:gap-5">
        {PAKET_IDS.map((paket) => {
          const lista = GUIDE.listor[paket]
          return (
            <article
              key={paket}
              className="rounded-xl border border-kant bg-panel p-4 sm:p-6"
              aria-labelledby={`guide-${paket}`}
            >
              <div className="flex items-center gap-3">
                <h3
                  id={`guide-${paket}`}
                  className="font-display text-[22px] font-bold leading-7 tracking-[-0.025em] text-ink-1"
                >
                  {PAKET_KORT[paket].namn}
                </h3>
                <span className={`ml-auto rounded-full px-3 py-1 text-xs font-semibold ${TAG[paket]}`}>
                  {lista.etikett}
                </span>
              </div>

              <ol className="relative mt-4 list-none p-0">
                <span
                  aria-hidden="true"
                  className="absolute bottom-3 left-[11px] top-3 w-0.5 bg-kant"
                />
                {lista.steg.map((steg, i) => (
                  <li
                    key={steg}
                    className="relative pb-3 pl-10 text-sm leading-6 text-ink-1 last:pb-0"
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute left-0 top-0 grid h-6 w-6 place-items-center rounded-full border-2 text-xs font-semibold ${
                        i === 0
                          ? 'border-ink-1 bg-ink-1 text-white'
                          : 'border-kant-stark bg-panel text-ink-3'
                      }`}
                    >
                      {i + 1}
                    </span>
                    {steg}
                  </li>
                ))}
              </ol>
            </article>
          )
        })}
      </div>
    </section>
  )
}
