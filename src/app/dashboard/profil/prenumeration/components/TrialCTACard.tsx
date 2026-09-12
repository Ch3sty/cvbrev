'use client';

import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { PremiumCTAButton } from './PremiumCTAButton';

interface TrialCTACardProps {
  priceId: string;
}

export default function TrialCTACard({ priceId }: TrialCTACardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="relative overflow-hidden rounded-xl bg-white border border-orange-200"
    >
      <div className="relative p-5 sm:p-7">
        <div className="flex items-start gap-3 sm:gap-4 mb-4">
          <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center">
            <Zap className="w-6 h-6 text-orange-600" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold leading-tight mb-1 text-neutral-900">
              Fortsätt med Premium utan avbrott
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Uppgradera nu och behåll alla premium-funktioner när provperioden tar slut.
            </p>
          </div>
        </div>

        <PremiumCTAButton
          priceId={priceId}
          apiEndpoint="/api/stripe/create-upgrade-session"
          buttonText="Uppgradera till Premium"
          variant="primary"
        />

        <p className="text-center text-xs text-neutral-500 mt-3">
          149 kr/mån · Ingen bindningstid · Avsluta när du vill
        </p>
      </div>
    </motion.section>
  );
}
