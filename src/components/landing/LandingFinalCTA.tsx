'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function LandingFinalCTA() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl text-white"
          style={{
            background:
              'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
            boxShadow: '0 24px 48px -16px rgba(220, 38, 38, 0.5)',
          }}
        >
          {/* Prick-pattern */}
          <svg
            className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
            aria-hidden="true"
          >
            <pattern
              id="final-cta-dots"
              x="0"
              y="0"
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="14" cy="14" r="1.2" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#final-cta-dots)" />
          </svg>

          {/* Mjuk vinjett */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 100% 50%, rgba(0,0,0,0.18) 0%, transparent 55%)',
            }}
            aria-hidden="true"
          />

          <div className="relative px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white/15 border border-white/25 mb-5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-300 animate-pulse" aria-hidden="true" />
              Starta din jobbsökning idag
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight mb-4 max-w-3xl mx-auto">
              Det perfekta brevet är 60 sekunder bort
            </h2>

            <p className="text-base sm:text-lg lg:text-xl opacity-95 leading-relaxed max-w-2xl mx-auto mb-8">
              Skapa ditt konto, ladda upp ditt CV och se skillnaden direkt.
              Inga bindningstider. Avsluta när du fått jobbet.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <Link
                href="/trial-signup"
                data-cta="final-primary"
                className="group inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white text-orange-700 font-bold text-base sm:text-lg hover:bg-orange-50 hover:scale-[1.02] active:scale-[0.99] transition-all touch-manipulation min-w-[260px] sm:min-w-0"
                style={{ boxShadow: '0 12px 28px -10px rgba(0,0,0,0.25)' }}
              >
                Prova Premium gratis i 7 dagar
                <ArrowRight
                  className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={2.5}
                />
              </Link>

              <Link
                href="/login?signup=true"
                data-cta="final-secondary"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white/10 backdrop-blur-sm text-white font-bold text-base sm:text-lg border border-white/30 hover:bg-white/15 transition-all touch-manipulation min-w-[260px] sm:min-w-0"
              >
                Starta gratis
              </Link>
            </div>

            <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm opacity-95">
              <li className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-yellow-300" strokeWidth={2.5} />
                Inget kreditkort krävs
              </li>
              <li className="hidden sm:inline-block w-px h-3 bg-white/30" aria-hidden="true" />
              <li className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-yellow-300" strokeWidth={2.5} />
                Avsluta när du vill
              </li>
              <li className="hidden sm:inline-block w-px h-3 bg-white/30" aria-hidden="true" />
              <li className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-yellow-300" strokeWidth={2.5} />
                Svensk support
              </li>
            </ul>
          </div>

          {/* Subtila dekor-prickar */}
          <div className="absolute bottom-8 left-8 w-1.5 h-1.5 rounded-full bg-white/40" aria-hidden="true" />
          <div className="absolute top-10 right-12 w-1 h-1 rounded-full bg-white/35" aria-hidden="true" />
          <div className="absolute top-1/2 right-6 w-1 h-1 rounded-full bg-white/30" aria-hidden="true" />
        </motion.div>
      </div>
    </section>
  );
}
