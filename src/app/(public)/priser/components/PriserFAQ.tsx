'use client'

/**
 * Prissidans frågor (docs/design/spec-prissida-2026-09-22.html, .faq).
 *
 * Rubriken "Fler frågor om priset?" och fyra frågor i två kolumner, första
 * öppen. details och summary, ingen egen accordion. Svaren står i HTML även
 * när de är hopfällda, vilket är kravet för FAQPage-schemat och för
 * besökaren utan JavaScript.
 *
 * pricing_faq_opened skjuts när en fråga öppnas, aldrig när den stängs.
 */

import { capture } from '@/lib/analytics/events'
import { PRISER_FAQ_ITEMS, PRISER_FAQ_RUBRIK } from './priser-data'

export default function PriserFAQ() {
  return (
    <section aria-labelledby="priser-faq" className="mt-12 lg:mt-14">
      <h2
        id="priser-faq"
        className="font-display text-[28px] font-bold leading-[34px] tracking-[-0.025em] text-ink-1"
      >
        {PRISER_FAQ_RUBRIK}
      </h2>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {PRISER_FAQ_ITEMS.map((item, i) => (
          <details
            key={item.id}
            open={i === 0}
            className="group rounded-xl border border-kant bg-panel px-4 py-3 sm:px-5 sm:py-4"
            onToggle={(event) => {
              if (event.currentTarget.open) {
                capture('pricing_faq_opened', { question: item.id })
              }
            }}
          >
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-ink-1 [&::-webkit-details-marker]:hidden">
              {item.q}
              <span className="shrink-0 text-ink-3 group-open:hidden" aria-hidden="true">
                +
              </span>
              <span className="hidden shrink-0 text-ink-3 group-open:inline" aria-hidden="true">
                −
              </span>
            </summary>
            <p className="mt-2 text-sm leading-[22px] text-ink-2">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
