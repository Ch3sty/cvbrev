'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { PremiumCTAButton } from './PremiumCTAButton';
import { PopularBadgeIcon, TrustBadgeIcon } from './illustrations/PrenumerationIcons';

interface PricingCardProps {
  priceId: string;
  /** id:t läggs på sektionen så hero kan scrolla hit */
  scrollAnchorId?: string;
}

const FEATURES = [
  'Obegränsade personliga brev',
  'Smart-anpassad ton för varje annons',
  'Alla 8 CV-mallar',
  'Obegränsade CV-analyser',
  'Profilanalys & jobbmatchning',
  'Prioriterad support',
];

export default function PricingCard({ priceId, scrollAnchorId }: PricingCardProps) {
  return (
    <motion.section
      id={scrollAnchorId}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
      className="relative bg-white rounded-xl border border-orange-200/60 overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-0">
        {/* Vänster, pris och features */}
        <div className="p-6 sm:p-8 md:p-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.18em] text-white bg-orange-600 mb-4">
            <PopularBadgeIcon className="w-3 h-3" />
            Mest populärt
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-1">Premium</h2>
          <p className="text-sm text-neutral-600 mb-5">
            Allt upplåst, för dig som menar allvar med jobbsökandet.
          </p>

          {/* Pris */}
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-5xl sm:text-6xl font-semibold tracking-tight text-neutral-900">
              149 kr
            </span>
            <span className="text-base font-medium text-neutral-500">/mån</span>
          </div>

          {/* Vad månadsplanen faktiskt innebär */}
          <div className="mb-6 p-3.5 rounded-xl bg-orange-50 border border-orange-200/70">
            <p className="text-sm text-neutral-700 leading-relaxed">
              <span className="font-bold text-orange-700">149 kr i månaden</span>, ingen bindningstid.
              Söker du bara några veckor finns dagspass och veckopass i stället.
            </p>
          </div>

          {/* Features */}
          <ul className="space-y-2.5 mb-2">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-neutral-700">
                <Check
                  className="flex-shrink-0 w-5 h-5 text-emerald-600 mt-0.5"
                  strokeWidth={3}
                />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Höger, CTA */}
        <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-orange-100 bg-orange-50/50">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700 mb-2">
            Kom igång nu
          </div>
          <div className="text-lg sm:text-xl font-bold text-neutral-900 mb-1 leading-tight">
            Skaffa Premium igen
          </div>
          <p className="text-sm text-neutral-700 mb-5">
            149 kr i månaden. Du säger upp med ett klick och behåller allt du skapat.
          </p>

          <PremiumCTAButton
            priceId={priceId}
            apiEndpoint="/api/stripe/create-trial-upgrade-session"
            buttonText="Skaffa Premium"
            variant="primary"
          />

          <div className="mt-4 space-y-2">
            <TrustItem text="Ingen bindningstid, avsluta när du vill" />
            <TrustItem text="Säker betalning via Stripe" />
            <TrustItem text="Dina CV och brev finns kvar om du avslutar" />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function TrustItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700">
      <TrustBadgeIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span>{text}</span>
    </div>
  );
}
