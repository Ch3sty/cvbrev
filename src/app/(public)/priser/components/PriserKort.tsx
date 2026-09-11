'use client'

/**
 * Prissidans kortrad (A7 i docs/plan-konvertering.md). Fyra produkter och en
 * textrad om gratisnivån. Gratisnivån är inget kort längre: den konkurrerar
 * inte med produkterna, den förklarar vad som ingår ändå.
 */

import PlanCards from '@/components/pricing/PlanCards'
import { GRATIS_RAD } from './priser-data'

export default function PriserKort() {
  return (
    <>
      <PlanCards />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14">
        <p className="text-sm text-neutral-600 leading-relaxed text-center">{GRATIS_RAD}</p>
      </div>
    </>
  )
}
