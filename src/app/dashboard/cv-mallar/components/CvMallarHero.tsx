'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { CvDesignSwapIcon } from './illustrations/CvMallarIcons';

const FEATURES = [
  'ATS-kompatibel',
  'Snabb nedladdning',
  'Alla branscher',
];

export default function CvMallarHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-4"
    >
      <div className="flex items-start gap-4 sm:gap-5">
        <div className="flex-shrink-0 mt-1">
          <CvDesignSwapIcon className="w-16 h-16 sm:w-20 sm:h-20" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-1.5">
            CV-mallar
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.05]">
            Byt design på ditt CV
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed max-w-xl">
            Ditt innehåll, snyggare format. Välj mall, anpassa typsnitt och
            ladda ner som PDF — klart på en kvart.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FEATURES.map((feature) => (
          <span
            key={feature}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold"
          >
            <Check className="w-3 h-3" strokeWidth={3} />
            {feature}
          </span>
        ))}
      </div>
    </motion.section>
  );
}
