'use client'

/**
 * Gratisraden (docs/plan-paket-och-onboarding.md, Fas 2D).
 *
 * Panel med insunken ton inuti: gratis ligger ett steg ner i djup, inte ett
 * steg ner i storlek. Scenen står i egen kolumn på desktop och faller bort
 * på mobil, enligt designsystemets scenregel.
 *
 * Serverkomponent. Ingen interaktion, ingen accent.
 */

import Link from 'next/link'
import { Check } from 'lucide-react'

import { IlluArketLyfter } from '@/components/illustrations/TradenScener'
import { D_GRATIS_LANK, PR_SEKTIONER } from '@/components/pricing/paket-copy'
import { FREE_HIGHLIGHTS } from './priser-data'

export default function PriserGratis() {
  return (
    <section aria-labelledby="priser-gratis">
      <h2 id="priser-gratis" className="text-sm font-medium text-ink-3">
        {PR_SEKTIONER.gratis}
      </h2>

      <div className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-center">
        <div className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
          <div className="rounded-lg border border-kant bg-insunken p-4 shadow-insunken">
            <ul className="space-y-2">
              {FREE_HIGHLIGHTS.map((rad) => (
                <li key={rad} className="flex gap-2 text-sm leading-[22px] text-ink-2">
                  <Check
                    className="mt-0.5 h-5 w-5 shrink-0 text-ink-2"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <span>{rad}</span>
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/registrera"
            className="mt-4 inline-flex h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
          >
            {D_GRATIS_LANK}
          </Link>
        </div>

        <div className="hidden justify-center text-ink-2 lg:flex">
          <IlluArketLyfter size={240} />
        </div>
      </div>
    </section>
  )
}