'use client';

/**
 * Startsidans prissektion. Speglar /priser: samma tre kort ur den delade
 * PaketKort, samma rubrik och samma rad om gratisnivån, så att startsidan
 * och prissidan aldrig glider isär.
 *
 * Här finns ingen spårväljare. Startsidan ska visa att valet finns och vad
 * det kostar, sedan lämna över till prissidan där valet görs. Knapparna går
 * till registreringen med paketet i adressen, precis som på prissidan för
 * den utloggade.
 */

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import PaketKort from '@/components/pricing/PaketKort';
import { PR_H1, PR_INGRESS } from '@/components/pricing/paket-copy';
import { capture } from '@/lib/analytics/events';
import type { PlanKey } from '@/lib/plans/plans';
import { GRATIS_RAD } from '@/app/(public)/priser/components/priser-data';

export default function DetailedPricingSection() {
  const router = useRouter();

  function valj(plan: PlanKey) {
    capture('paywall_cta_clicked', {
      variant: 'onboarding_paket',
      surface: 'landing_pricing',
      plan,
      cta: 'primary',
    });
    router.push(`/registrera?paket=${plan}`);
  }

  return (
    <section className="bg-mark py-14 sm:py-20">
      <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
        <div className="mx-auto max-w-[720px] text-center">
          <h2 className="text-h1 text-ink-1">{PR_H1}</h2>
          <p className="mt-3 text-sm leading-[22px] text-ink-2">{PR_INGRESS}</p>
        </div>

        <div className="mt-8 grid gap-4 sm:gap-6 lg:grid-cols-3">
          <PaketKort plan="cv_week" onSelect={valj} />
          <PaketKort plan="test_week" onSelect={valj} />
          <PaketKort plan="all_week" lengths recommended onSelect={valj} />
        </div>

        <div className="mx-auto mt-8 max-w-[640px] text-center">
          <p className="text-sm leading-[22px] text-ink-2">{GRATIS_RAD}</p>
          <p className="mt-3 text-meta text-ink-3">
            Alla priser är i kronor och moms ingår. Kortbetalning via Stripe, ingen
            bindningstid.{' '}
            <Link
              href="/priser"
              data-cta="pricing-detailed-compare"
              className="font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
            >
              Se hela jämförelsen
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
