'use client';

import { Check } from 'lucide-react';
import { CvDesignSwapIcon } from './illustrations/CvMallarIcons';

const FEATURES = [
  'ATS-kompatibel',
  'Snabb nedladdning',
  'Alla branscher',
];

export default function CvMallarHero() {
  return (
    <section className="space-y-4 motion-safe:animate-[fadeInPlace_300ms_ease-out_both]">
      {/* Låst höjd: brödtexten under rubriken radbryter till fyra rader med
          reservsnittet och tre med Inter, så blocket krympte från 130 till
          107 px när typsnittet tonade in och sköt upp allt under. */}
      <div className="flex items-start gap-4 sm:gap-5 min-h-[130px] sm:min-h-0">
        <div className="flex-shrink-0 mt-1">
          <CvDesignSwapIcon className="w-16 h-16 sm:w-20 sm:h-20" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-orange-700 mb-1.5">
            CV-mallar
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-900 tracking-tight leading-[1.05]">
            Byt design på ditt CV
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 mt-2 leading-relaxed max-w-xl">
            Ditt innehåll, snyggare format. Välj mall, anpassa typsnitt och
            ladda ner som PDF, klart på en kvart.
          </p>
        </div>
      </div>

      {/* Låst höjd och låst radhöjd. Chipsen är bredare med reservtypsnittet
          än med Inter, så de radbröt till två rader vid första målningen och
          föll ihop till en när Inter tonade in. Hela heron krympte då från
          206 till 149 px och sköt upp allt under, vilket mätte 0,050 i CLS. */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide h-[26px] leading-[18px]">
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
    </section>
  );
}
