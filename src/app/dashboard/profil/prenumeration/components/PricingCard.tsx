'use client';

/**
 * Månadsplanen som ett kort. Panel, stort tal för priset, ink-knapp.
 * Rekommendationen bärs av eyebrow-texten, inte av en orange yta.
 */

import { Check } from 'lucide-react';
import { TEMPLATE_COUNT } from '@/lib/cv/simple-templates';
import { PremiumCTAButton } from './PremiumCTAButton';

interface PricingCardProps {
  priceId: string;
  /** id:t läggs på sektionen så hero kan scrolla hit */
  scrollAnchorId?: string;
}

const FEATURES = [
  'Obegränsade personliga brev',
  'Smart-anpassad ton för varje annons',
  `Alla ${TEMPLATE_COUNT} CV-mallar`,
  'Obegränsade CV-analyser',
  'Profilanalys och jobbmatchning',
  'Prioriterad support',
];

const TRUST = [
  'Ingen bindningstid, avsluta när du vill',
  'Säker betalning via Stripe',
  'Dina CV och brev finns kvar om du avslutar',
];

export default function PricingCard({ priceId, scrollAnchorId }: PricingCardProps) {
  return (
    <section id={scrollAnchorId} className="rounded-xl border border-kant bg-panel p-4">
      <p className="text-steg uppercase text-accent-ink">Rekommenderas</p>
      <h2 className="mt-1 text-kort text-ink-1">Premium</h2>
      <p className="mt-1 text-sm text-ink-2">
        Allt upplåst, för dig som menar allvar med jobbsökandet.
      </p>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-tal tabular-nums text-ink-1">149 kr</span>
        <span className="text-meta text-ink-3">per månad</span>
      </div>

      <p className="mt-3 text-sm text-ink-2">
        Ingen bindningstid. Söker du bara några veckor finns dagspass och veckopass i stället.
      </p>

      <ul className="mt-4 space-y-2">
        {FEATURES.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-ink-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-positiv" strokeWidth={1.75} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 border-t border-kant pt-4">
        <PremiumCTAButton
          priceId={priceId}
          apiEndpoint="/api/stripe/create-trial-upgrade-session"
          buttonText="Skaffa Premium"
        />

        <ul className="mt-3 space-y-1">
          {TRUST.map((text) => (
            <li key={text} className="text-meta text-ink-3">
              {text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
