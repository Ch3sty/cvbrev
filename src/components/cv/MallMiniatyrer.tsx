/**
 * MallMiniatyrer: riktiga mallar ur mallregistret som miniatyrer i 3:4
 * (docs/design/analys-artiklar-2026-09-23.html, avsnitt 6, "Showcasen").
 *
 * Delas mellan artiklarnas mallvisning (ersätter ArticleTemplateShowcase
 * med sina påhittade mallnamn) och CV-mallar-hubben i inloggat läge.
 * Bilden är registrets egen förhandsvisning (imagePath), namnen är
 * registrets. Inga badges: "Populärast" och "Trendigt" saknade underlag.
 *
 * Inga hooks och ingen 'use client': används i både server- och
 * klientkomponenter.
 */

import Link from 'next/link'
import {
  FREE_TEMPLATE_COUNT,
  SIMPLE_TEMPLATES,
  TEMPLATE_COUNT,
} from '@/lib/cv/simple-templates'
import { PLAN_BY_KEY } from '@/lib/plans/plans'

export { MallMiniatyr, type MallMiniatyrProps } from './MallMiniatyr'
import { MallMiniatyr } from './MallMiniatyr'

/** De fyra som visas i artiklarna: gratisnivåns mallar och den första betalda. */
function artikelUrval() {
  const gratis = SIMPLE_TEMPLATES.filter((t) => t.tier === 'free').slice(0, 3)
  const betald = SIMPLE_TEMPLATES.find((t) => t.tier === 'premium')
  return betald ? [...gratis, betald] : gratis
}

/** Mallvisningen i CV-artiklar. MDX-aliaset CVTemplateShowcase pekar hit. */
export default function MallMiniatyrer() {
  const urval = artikelUrval()
  return (
    <aside className="not-prose my-10 rounded-xl border border-kant bg-panel p-4 sm:p-6" aria-label="Mallar ur registret">
      <p className="text-steg uppercase text-ink-3">
        {urval.length} av {TEMPLATE_COUNT} mallar
      </p>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {urval.map((m) => (
          <MallMiniatyr key={m.id} mall={m} under={m.tier === 'free' ? 'gratis' : PLAN_BY_KEY.cv_week.name} />
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-2">
          {FREE_TEMPLATE_COUNT} gratis, alla {TEMPLATE_COUNT} i {PLAN_BY_KEY.cv_week.name} för {PLAN_BY_KEY.cv_week.amount} kr i veckan.
        </p>
        <Link
          href="/verktyg/cv-mallar"
          data-cta-klick="/verktyg/cv-mallar"
          className="text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
        >
          Se alla mallar
        </Link>
      </div>
    </aside>
  )
}
