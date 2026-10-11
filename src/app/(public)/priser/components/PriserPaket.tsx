/**
 * Kortet med Jobbcoach Premium (spec-rummen 17.3, copy-premium avsnitt 3).
 *
 * Bara ett paket säljs, så sidan har ett kort: vad som ingår till vänster
 * (PLANS.all_month.highlights), prisraden i kort form och köpknappen till
 * höger. Fulla namnet står i H1, så kortet säger Premium. På mobil står
 * delarna under varandra och en ankarrad leder vidare till gratisnivån,
 * funktionerna och hjälpredan.
 *
 * Serverkomponent i Trådens utseende; bara knappen är klient.
 */

import { PAKET_KORT, VALJARE } from '@/components/pricing/paket-copy'
import PriserKopKnapp from './PriserKopKnapp'

const kort = PAKET_KORT.allt

export default function PriserPaket() {
  return (
    <section id="premium" aria-labelledby="priser-paket" className="mt-8 scroll-mt-20 lg:mt-14">
      <div className="grid gap-6 rounded-xl border border-kant-stark bg-panel p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10 lg:p-8">
        <div>
          <h2
            id="priser-paket"
            className="font-display text-[26px] font-bold leading-[30px] tracking-[-0.025em] text-ink-1 lg:text-[30px] lg:leading-[34px]"
          >
            {kort.listEtikett}
          </h2>
          <ul className="mt-4 grid gap-3">
            {kort.ingar.map((rad) => (
              <li key={rad} className="flex items-start gap-3 text-base leading-6 text-ink-1">
                <svg
                  viewBox="0 0 20 20"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5 shrink-0 text-ink-1"
                  aria-hidden="true"
                >
                  <path d="M4 10.5l4 4 8-9" />
                </svg>
                <span>{rad}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-center border-t border-kant pt-5 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          <p className="text-sm leading-[22px] text-ink-2">{kort.prisrad}</p>
          <div className="mt-3">
            <PriserKopKnapp />
          </div>
          <p className="mt-2 text-xs text-ink-3">{kort.fotnot}</p>
        </div>
      </div>

      <p className="mt-3 text-center text-[13px] text-ink-3 lg:hidden">
        {VALJARE.ankare.map((a, i) => (
          <span key={a.href}>
            {i > 0 ? ' · ' : ''}
            <a href={a.href} className="underline decoration-kant-stark underline-offset-4">
              {a.text} ↓
            </a>
          </span>
        ))}
      </p>
    </section>
  )
}
