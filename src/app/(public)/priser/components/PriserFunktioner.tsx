/**
 * "Vad du faktiskt får, funktion för funktion"
 * (docs/design/spec-prissida-2026-09-22.html, .fung).
 *
 * Fem kort: CV-analysen, personliga brev, rekryteringstesterna (brett kort
 * över båda kolumnerna), matchade jobb och jobbcoachen. Varje kort har
 * scenen som visar själva ögonblicket, en rad om vilka paket funktionen
 * ingår i och vad gratis ger, en förklaring, upp till fyra steg och
 * paketpiller. Serverkomponent.
 */

import {
  IlluScenBrev,
  IlluScenCoach,
  IlluScenCv,
  IlluScenMatch,
  IlluScenMatris,
} from '@/components/illustrations/PriserScener'
import { FUNKTIONER, PAKET_KORT, type PaketId } from '@/components/pricing/paket-copy'

const SCEN = {
  cv: IlluScenCv,
  brev: IlluScenBrev,
  matris: IlluScenMatris,
  match: IlluScenMatch,
  coach: IlluScenCoach,
} as const

const PILL: Record<PaketId, string> = {
  cv: 'bg-cv-mjuk text-cv',
  test: 'bg-test-mjuk text-test',
  allt: 'bg-ink-1 text-white',
}

export default function PriserFunktioner() {
  return (
    <section id="funktioner" aria-labelledby="priser-funktioner" className="mt-16 scroll-mt-20 lg:mt-[88px]">
      <h2
        id="priser-funktioner"
        className="text-center font-display text-[28px] font-bold leading-8 tracking-[-0.025em] text-ink-1 [text-wrap:balance] lg:text-[40px] lg:leading-[44px]"
      >
        {FUNKTIONER.h2}
      </h2>
      <p className="mt-2 text-center text-base text-ink-2">{FUNKTIONER.ingress}</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:mt-10 lg:gap-5">
        {FUNKTIONER.kort.map((kort) => {
          const Scen = SCEN[kort.scen]
          return (
            <article
              key={kort.id}
              className={`grid gap-4 rounded-xl border border-kant bg-panel p-4 sm:p-6 lg:items-start lg:gap-6 ${
                kort.bred
                  ? 'md:col-span-2 lg:grid-cols-[260px_1fr]'
                  : 'lg:grid-cols-[200px_1fr]'
              }`}
            >
              <div className="mx-auto w-full max-w-[240px] text-ink-1 lg:mx-0 lg:max-w-none">
                <Scen className="h-auto w-full" title={kort.scenAlt} />
              </div>
              <div>
                <h3 className="font-display text-[22px] font-bold leading-7 tracking-[-0.025em] text-ink-1">
                  {kort.rubrik}
                </h3>
                <p className="mt-1 text-meta text-ink-3">{kort.sub}</p>
                <p className="mt-3 text-sm leading-[22px] text-ink-2">{kort.text}</p>
                {kort.steg ? (
                  <ol className="mt-3 grid gap-2 text-sm text-ink-2">
                    {kort.steg.map((s, i) => (
                      <li key={s} className="flex items-baseline gap-2">
                        <span className="w-[18px] shrink-0 font-display font-bold text-ink-1">
                          {i + 1}
                        </span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {kort.ingar.map((p) => (
                    <span
                      key={p}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${PILL[p]}`}
                    >
                      {PAKET_KORT[p].namn}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
