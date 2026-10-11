/**
 * Prissidans hjälte (spec-rummen 17.3 och copy-premium avsnitt 3).
 *
 * Två kolumner på desktop: eyebrow, H1 "Jobbcoach Premium, 149 kr i
 * månaden" i Schibsted Grotesk 800, förklaringsraden, ingressen och scenen
 * i egen kolumn till höger. På mobil står scenen under texten. Fulla namnet
 * står här och ingen annanstans på sidan. Serverkomponent, så rubriken målas
 * i första svaret (LCP).
 */

import { IlluScenHero } from '@/components/illustrations/PriserScener'
import { HERO } from '@/components/pricing/paket-copy'

export default function PriserHero() {
  return (
    <header className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_520px] lg:gap-14">
      <div>
        <p className="text-steg font-semibold uppercase tracking-[0.08em] text-ink-3">
          {HERO.eyebrow}
        </p>
        <h1 className="mt-2 max-w-[16ch] font-display text-[32px] font-extrabold leading-[35px] tracking-[-0.025em] text-ink-1 [text-wrap:balance] lg:mt-3 lg:text-[60px] lg:leading-[60px]">
          {HERO.h1}
        </h1>
        <p className="mt-3 font-display text-[18px] font-semibold leading-6 tracking-[-0.01em] text-ink-1 lg:mt-5 lg:text-[20px] lg:leading-7">
          {HERO.rad}
        </p>
        <p className="mt-2 max-w-[48ch] text-sm leading-[22px] text-ink-2 lg:mt-3 lg:text-lg lg:leading-[29px]">
          {HERO.ingress}
        </p>
      </div>

      <div className="text-ink-1">
        <IlluScenHero className="h-auto w-full rounded-xl" title={HERO.scenAlt} />
      </div>
    </header>
  )
}
