'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

const FREE_INCLUDES = [
  'En CV-analys',
  'Tillgång till CV-mallar',
  'Personligt brev (begränsat)',
];

const PREMIUM_INCLUDES = [
  'Obegränsade personliga brev',
  'CV-analys med expertfeedback',
  'LinkedIn-profiloptimering',
  'AI-jobbmatchning',
  'Prioriterad support',
];

export default function PricingTeaser() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-28 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
            Transparent prissättning
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-4">
            Börja gratis. Uppgradera när du vill.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Inga bindningstider. Inga dolda avgifter. Avsluta när du fått
            jobbet — eller fortsätt så länge du behöver oss.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Gratis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="relative rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 hover:border-orange-200 transition-colors"
          >
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 mb-2">
              Gratis
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 tabular-nums">
                0 kr
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-5">
              Testa grunderna utan att betala något
            </p>

            <ul className="space-y-2.5 mb-6">
              {FREE_INCLUDES.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-slate-700"
                >
                  <Check
                    className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0"
                    strokeWidth={2.5}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/login?signup=true"
              data-cta="pricing-free"
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-white text-slate-900 font-bold text-sm border border-slate-200 hover:border-orange-300 hover:bg-orange-50/40 transition-all touch-manipulation"
            >
              Skapa gratis konto
            </Link>
          </motion.div>

          {/* Premium */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative overflow-hidden rounded-3xl text-white p-6 sm:p-8"
            style={{
              background:
                'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              boxShadow: '0 20px 40px -12px rgba(220, 38, 38, 0.45)',
            }}
          >
            <svg
              className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
              aria-hidden="true"
            >
              <pattern
                id="pricing-premium-dots"
                x="0"
                y="0"
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="12" cy="12" r="1" fill="white" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#pricing-premium-dots)" />
            </svg>

            <div className="relative">
              <div className="flex items-start justify-between mb-2">
                <div className="text-xs font-bold uppercase tracking-[0.18em] opacity-90">
                  Premium
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 border border-white/25 text-[10px] font-bold uppercase tracking-wider">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-300" aria-hidden="true" />
                  7 dagar gratis
                </div>
              </div>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl sm:text-5xl font-black tabular-nums">
                  149 kr
                </span>
                <span className="text-sm opacity-85">/mån</span>
              </div>
              <p className="text-sm opacity-90 mb-5">
                Allt du behöver för en seriös jobbsökning
              </p>

              <ul className="space-y-2.5 mb-6">
                {PREMIUM_INCLUDES.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm"
                  >
                    <Check
                      className="w-4 h-4 text-yellow-300 mt-0.5 flex-shrink-0"
                      strokeWidth={2.5}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/trial-signup"
                data-cta="pricing-trial"
                className="group inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-white text-orange-700 font-bold text-sm hover:bg-orange-50 hover:scale-[1.02] active:scale-[0.99] transition-all touch-manipulation"
              >
                Prova gratis i 7 dagar
                <ArrowRight
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={2.5}
                />
              </Link>

              <div className="mt-3 text-[11px] opacity-85 text-center">
                Inget kreditkort krävs · Avsluta när du vill
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
