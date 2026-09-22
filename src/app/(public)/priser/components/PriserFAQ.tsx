'use client'

/**
 * Prissidans FAQ (docs/plan-paket-och-onboarding.md, Fas 2D).
 *
 * details och summary, ingen egen accordion. Svaren står i HTML även när de
 * är hopfällda, vilket är kravet för FAQPage-schemat och för besökaren utan
 * JavaScript. Raderna är 48 px, avdelade med en hårlinje.
 *
 * pricing_faq_opened skjuts när en fråga öppnas, aldrig när den stängs.
 */

import { ChevronDown } from 'lucide-react'

import { capture } from '@/lib/analytics/events'
import { PR_SEKTIONER } from '@/components/pricing/paket-copy'
import { PRISER_FAQ_ITEMS } from './priser-data'

export default function PriserFAQ() {
  return (
    <section aria-labelledby="priser-faq">
      <h2 id="priser-faq" className="text-sm font-medium text-ink-3">
        {PR_SEKTIONER.faq}
      </h2>

      <div className="mt-3 columns-1 gap-6 lg:columns-2">
        {PRISER_FAQ_ITEMS.map((item) => (
          <details
            key={item.id}
            className="mb-3 break-inside-avoid rounded-xl border border-kant bg-panel [&_svg]:open:rotate-180"
            onToggle={(event) => {
              if (event.currentTarget.open) {
                capture('pricing_faq_opened', { question: item.id })
              }
            }}
          >
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-ink-1 [&::-webkit-details-marker]:hidden">
              {item.q}
              <ChevronDown
                className="h-5 w-5 shrink-0 text-ink-2 transition-transform"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </summary>
            <p className="border-t border-kant px-4 py-3 text-sm leading-[22px] text-ink-2">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}
