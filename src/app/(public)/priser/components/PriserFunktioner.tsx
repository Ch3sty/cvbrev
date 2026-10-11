/**
 * "Vad du faktiskt får, funktion för funktion"
 * (docs/design/spec-prissida-2026-09-22.html, .fung).
 *
 * Fem kort: CV-analysen, personliga brev, rekryteringstesterna (brett kort
 * över båda kolumnerna), matchade jobb och Jobbcoachen. Varje kort har
 * scenen som visar själva ögonblicket, raden "Ingår i Premium. Gratis: …",
 * en förklaring och upp till fyra steg. Paketpillren är borta sedan bara
 * Premium säljs: allt ingår i samma, och raden säger det. Serverkomponent.
 */

import Link from 'next/link'

import {
  IlluScenBrev,
  IlluScenCoach,
  IlluScenCv,
  IlluScenMatch,
  IlluScenMatris,
} from '@/components/illustrations/PriserScener'
import { FUNKTIONER } from '@/components/pricing/paket-copy'

const SCEN = {
  cv: IlluScenCv,
  brev: IlluScenBrev,
  matris: IlluScenMatris,
  match: IlluScenMatch,
  coach: IlluScenCoach,
} as const

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
                {'lank' in kort && kort.lank ? (
                  <p className="mt-3 text-sm">
                    <Link
                      href={kort.lank.href}
                      className="font-medium text-ink-1 underline decoration-kant-stark underline-offset-4"
                    >
                      {kort.lank.text}
                    </Link>
                  </p>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
