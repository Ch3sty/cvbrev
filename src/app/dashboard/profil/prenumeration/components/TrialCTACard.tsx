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
      className="relative overflow-hidden rounded-3xl text-white"
      style={{
        background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        boxShadow: '0 16px 40px -16px rgba(220, 38, 38, 0.45)',
      }}
    >
      {/* Prick-pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" aria-hidden="true">
        <pattern id="trial-cta-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="0.8" fill="white" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#trial-cta-dots)" />
      </svg>

      <div className="relative p-5 sm:p-7">
        <div className="flex items-start gap-3 sm:gap-4 mb-4">
          <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold leading-tight mb-1">
              Fortsätt med Premium utan avbrott
            </h3>
            <p className="text-sm opacity-95 leading-relaxed">
              Uppgradera nu och behåll alla premium-funktioner när provperioden tar slut.
            </p>
          </div>
        </div>

        <PremiumCTAButton
          priceId={priceId}
          apiEndpoint="/api/stripe/create-upgrade-session"
          buttonText="Uppgradera till Premium"
          variant="inverse"
        />

        <p className="text-center text-xs text-white/85 mt-3">
          149 kr/mån · Ingen bindningstid · Avsluta när du vill
        </p>
      </div>
    </motion.section>
  );
}
