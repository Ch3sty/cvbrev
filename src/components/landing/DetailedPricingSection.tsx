'use client';

/**
 * Startsidans prissektion. Speglar /priser: samma fyra produkter från
 * PLANS via den delade PlanCards, och samma textrad om gratisnivån
 * (A7 i docs/plan-konvertering.md). Tvåkortsupplägget med gratis kontra
 * Premium är borta: gratisnivån konkurrerar inte med produkterna.
 */

import Link from 'next/link';
import PlanCards from '@/components/pricing/PlanCards';
import { GRATIS_RAD } from '@/app/(public)/priser/components/priser-data';

export default function DetailedPricingSection() {
  return (
    <section className="py-14 sm:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
            Betala för veckan du söker. Inte för året.
          </h2>
          <p className="text-base text-neutral-600 leading-relaxed">
            De flesta söker jobb intensivt i några veckor och slutar sedan. Därför säljer vi både
            korta pass och månadsplan. Välj det som matchar din situation.
          </p>
        </div>
      </div>

      <PlanCards className="pt-8 pb-6 sm:pt-10 sm:pb-8" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm text-neutral-600 leading-relaxed">{GRATIS_RAD}</p>
        <p className="text-xs text-neutral-500 mt-4">
          Alla priser inkluderar moms. Säkra betalningar via Stripe. Ingen bindningstid.{' '}
          <Link
            href="/priser"
            data-cta="pricing-detailed-compare"
            className="text-orange-700 hover:text-orange-800 font-medium underline underline-offset-2"
          >
            Se hela jämförelsen
          </Link>
        </p>
      </div>
    </section>
  );
}
