'use client';

import { motion } from 'framer-motion';
import LiveAIShowcase from './LiveAIShowcase';

export default function MatchingShowcaseSection() {
  return (
    <section className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-orange-50/40 via-white to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8 sm:mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
            Så jobbar vi
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-4">
            Vi matchar din erfarenhet mot tjänstens krav
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Klistra in en jobbannons. Vi läser ditt CV, identifierar vad
            tjänsten kräver och väver in din egen erfarenhet i ett brev som
            faktiskt bevisar att du passar.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <LiveAIShowcase />
        </motion.div>
      </div>
    </section>
  );
}
