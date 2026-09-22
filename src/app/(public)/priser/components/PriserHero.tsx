/**
 * Prissidans hjälte (docs/design/spec-prissida-2026-09-22.html, .hero).
 *
 * Två kolumner på desktop: eyebrow, H1 i Schibsted Grotesk 800, ingress med
 * en fetad mening, de tre löftena (7 dagar, 79 kr, 1 klick) och scenen
 * "veckan på skrivbordet" i egen kolumn till höger. På mobil står scenen
 * under texten, ingressen är kortare och löftena faller bort (sektion 2).
 * Serverkomponent, så rubriken målas i första svaret.
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
        <h1 className="mt-2 max-w-[13ch] font-display text-[32px] font-extrabold leading-[35px] tracking-[-0.025em] text-ink-1 [text-wrap:balance] lg:mt-3 lg:text-[60px] lg:leading-[60px]">
          {HERO.h1}
        </h1>

        <p className="mt-2 text-sm leading-[22px] text-ink-2 lg:hidden">{HERO.ingressMobil}</p>
        <p className="mt-6 hidden max-w-[48ch] text-lg leading-[29px] text-ink-2 lg:block">
          {HERO.ingress} <b className="font-semibold text-ink-1">{HERO.ingressFet}</b>{' '}
          {HERO.ingressSlut}
        </p>

        <ul className="mt-6 hidden gap-8 text-[13px] leading-[18px] text-ink-3 lg:flex">
          {HERO.bevis.map((b) => (
            <li key={b.tal}>
              <span className="block font-display text-[28px] font-bold leading-[30px] tracking-[-0.02em] tabular-nums text-ink-1">
                {b.tal}
              </span>
              <span className="whitespace-pre-line">{b.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="text-ink-1">
        <IlluScenHero className="h-auto w-full rounded-xl" title={HERO.scenAlt} />
      </div>
    </header>
  )
}
