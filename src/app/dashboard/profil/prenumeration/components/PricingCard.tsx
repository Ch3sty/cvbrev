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
      className="relative bg-white rounded-3xl border border-orange-200/60 overflow-hidden"
      style={{ boxShadow: '0 12px 40px -12px rgba(249, 115, 22, 0.22)' }}
    >
      {/* Gradient-strip top */}
      <div
        className="absolute top-0 inset-x-0 h-1"
        style={{ background: 'linear-gradient(90deg, #FB923C, #DC2626, #BE185D)' }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-0">
        {/* Vänster — pris och features */}
        <div className="p-6 sm:p-8 md:p-10">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] text-white mb-4"
            style={{
              background: 'linear-gradient(135deg, #F97316, #DC2626)',
              boxShadow: '0 4px 12px -3px rgba(220, 38, 38, 0.4)',
            }}
          >
            <PopularBadgeIcon className="w-3 h-3" />
            Mest populärt
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">Premium</h2>
          <p className="text-sm text-slate-600 mb-5">
            Allt upplåst — för de som menar allvar med jobbsökandet.
          </p>

          {/* Pris */}
          <div className="flex items-baseline gap-2 mb-6">
            <span
              className="text-5xl sm:text-6xl font-black tracking-tight bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #F97316, #DC2626, #BE185D)' }}
            >
              149 kr
            </span>
            <span className="text-base font-medium text-slate-500">/mån</span>
          </div>

          {/* Provperiod-info */}
          <div className="mb-6 p-3.5 rounded-xl bg-orange-50 border border-orange-200/70">
            <p className="text-sm text-slate-700 leading-relaxed">
              <span className="font-bold text-orange-700">7 dagar gratis</span> först — sedan 149 kr/mån.
              Ingen bindningstid, avsluta när du vill.
            </p>
          </div>

          {/* Features */}
          <ul className="space-y-2.5 mb-2">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-700">
                <Check
                  className="flex-shrink-0 w-5 h-5 text-emerald-600 mt-0.5"
                  strokeWidth={3}
                />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Höger — CTA */}
        <div
          className="p-6 sm:p-8 md:p-10 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-orange-100"
          style={{
            background:
              'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 50%, #FECACA 100%)',
          }}
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 mb-2">
            Kom igång nu
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 mb-1 leading-tight">
            Prova Premium gratis i 7 dagar
          </div>
          <p className="text-sm text-slate-700 mb-5">
            0 kr de första 7 dagarna. Avsluta innan dag 7 och du betalar ingenting.
          </p>

          <PremiumCTAButton
            priceId={priceId}
            apiEndpoint="/api/stripe/create-trial-upgrade-session"
            buttonText="Prova gratis i 7 dagar"
            variant="primary"
          />

          <div className="mt-4 space-y-2">
            <TrustItem text="Ingen bindningstid — avsluta när du vill" />
            <TrustItem text="Säker betalning via Stripe" />
            <TrustItem text="Inget dras innan provperioden tar slut" />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function TrustItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
      <TrustBadgeIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span>{text}</span>
    </div>
  );
}
