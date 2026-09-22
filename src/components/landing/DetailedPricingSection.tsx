'use client';

/**
 * Startsidans prissektion. Speglar /priser: samma tre kort ur den delade
 * PaketKort, samma rubrik och samma rad om gratisnivån, så att startsidan
 * och prissidan aldrig glider isär.
 *
 * Knapparna går till registreringen med paketet i adressen, precis som på
 * prissidan för den utloggade.
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import PaketKort from '@/components/pricing/PaketKort';
import {
  PAKET_IDS,
  PAKET_PLAN,
  PR_H1,
  PR_INGRESS,
  borjaKnapp,
  planForLangd,
  type PaketId,
} from '@/components/pricing/paket-copy';
import { capture } from '@/lib/analytics/events';
import type { PlanKey, PlanLength } from '@/lib/plans/plans';
import { GRATIS_RAD } from '@/app/(public)/priser/components/priser-data';

export default function DetailedPricingSection() {
  const router = useRouter();
  const [alltLangd, setAlltLangd] = useState<PlanLength>('vecka');

  function valj(plan: PlanKey) {
    capture('paywall_cta_clicked', {
      variant: 'onboarding_paket',
      surface: 'landing_pricing',
      plan,
      cta: 'primary',
    });
    router.push(`/registrera?paket=${plan}`);
  }

  const planFor = (paket: PaketId): PlanKey =>
    paket === 'allt' ? planForLangd(alltLangd) : PAKET_PLAN[paket];

  return (
    <section className="bg-mark py-14 sm:py-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="mx-auto max-w-[720px] text-center">
          <h2 className="font-display text-[32px] font-extrabold leading-[35px] tracking-[-0.025em] text-ink-1 [text-wrap:balance] lg:text-[40px] lg:leading-[44px]">
            {PR_H1}
          </h2>
          <p className="mt-3 text-sm leading-[22px] text-ink-2">{PR_INGRESS}</p>
        </div>

        <div className="mt-8 grid gap-3 lg:grid-cols-[1fr_1fr_1.12fr] lg:gap-5">
          {PAKET_IDS.map((paket, i) => (
            <PaketKort
              key={paket}
              paket={paket}
              nummer={i + 1}
              langd={paket === 'allt' ? alltLangd : undefined}
              onLangd={(langd, plan) => {
                setAlltLangd(langd);
                capture('plan_length_changed', { plan, surface: 'landing' });
              }}
              knapp={{ text: borjaKnapp(paket), onClick: () => valj(planFor(paket)) }}
            />
          ))}
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
