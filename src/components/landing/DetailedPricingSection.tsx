'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  Lock,
  Heart,
  Star,
  Zap,
  FileSearch,
  Palette,
  Brain as BrainIcon,
  Save,
  Download,
} from 'lucide-react';

const FREE_INCLUDED = [
  '5 personliga brev per vecka',
  '1 CV-analys per vecka',
  '2 uppladdade CV:n',
  '1 LinkedIn-optimering per månad',
  '3 grundnivå rekryteringstester',
  'Begränsad jobbmatchning',
  '2 gratis CV-mallar',
];

const FREE_LOCKED = [
  'Obegränsade personliga brev',
  'Obegränsade CV-analyser',
  'Alla 6 rekryteringstester',
  'Helt obegränsad jobbmatchning',
  'Alla 6 Premium CV-mallar',
];

const PREMIUM_FEATURES = [
  {
    icon: Zap,
    title: 'Obegränsade personliga brev',
    description: 'Ansök till alla jobb du vill utan att vänta. Ingen vecko-begränsning.',
  },
  {
    icon: FileSearch,
    title: 'Djupgående analyser när du behöver',
    description: 'Detaljerad feedback på CV och kompetenser utan begränsningar.',
  },
  {
    icon: Palette,
    title: 'Alla 8 professionella mallar',
    description: 'Från minimalistisk till executive-nivå. Välj den som passar din bransch.',
  },
  {
    icon: BrainIcon,
    title: 'Smart-anpassad tonalitet',
    description: 'Vi analyserar CV, annons och företagskultur, sedan väljer vi tonen som ger högst chans till intervju.',
  },
  {
    icon: Save,
    title: 'Spara allt du skapar',
    description: 'Bygg upp ditt bibliotek av anpassade brev och analyser.',
  },
  {
    icon: Download,
    title: 'Professionell export',
    description: 'Ladda ner färdiga dokument i Word eller PDF, redo att skicka.',
  },
];

export default function DetailedPricingSection() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
            Transparent prissättning
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-4">
            Testa gratis först.{' '}
            <span
              className="inline-block bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              }}
            >
              Bestäm sedan.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-5">
            Ingen bindningstid. Avsluta när du fått jobbet, eller fortsätt så
            länge du behöver oss.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"
              aria-hidden="true"
            />
            Ingen bindningstid · Transparenta priser · Spara 15-20 timmar per månad
          </div>
        </motion.div>

        {/* Två kort sida vid sida */}
        <div className="grid lg:grid-cols-2 gap-5 lg:gap-6">
          {/* Gratis-kort */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="relative bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 lg:p-10 flex flex-col"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Gratis
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                För att testa
              </span>
            </div>

            <p className="text-sm text-slate-600 mb-5">
              Perfekt för att uppleva våra smarta verktyg och testa
              grundfunktionerna.
            </p>

            <div className="flex items-baseline gap-2 mb-7">
              <span className="text-5xl sm:text-6xl font-black text-slate-900 tabular-nums">
                0 kr
              </span>
              <span className="text-sm text-slate-500">/ för alltid</span>
            </div>

            <p className="text-sm font-bold text-slate-900 mb-3">Detta ingår:</p>
            <ul className="space-y-2.5 mb-6">
              {FREE_INCLUDED.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-slate-700"
                >
                  <span
                    className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <Check
                      className="w-2.5 h-2.5 text-emerald-600"
                      strokeWidth={3}
                    />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <p className="text-sm font-bold text-slate-500 mb-3 mt-2 pt-4 border-t border-slate-100">
              Detta är låst:
            </p>
            <ul className="space-y-2 mb-7">
              {FREE_LOCKED.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-slate-400"
                >
                  <Lock
                    className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-300"
                    strokeWidth={2.5}
                  />
                  <span>
                    {item}{' '}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      (Premium)
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/login?signup=true"
              data-cta="pricing-detailed-free"
              className="mt-auto inline-flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-xl bg-white text-slate-900 font-bold text-sm border border-slate-200 hover:border-orange-300 hover:bg-orange-50/40 transition-all touch-manipulation"
            >
              Starta gratis
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
          </motion.div>

          {/* Premium-kort (gradient-bg som StreakHero) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative rounded-3xl overflow-hidden flex flex-col text-white"
            style={{
              background:
                'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              boxShadow: '0 24px 48px -16px rgba(220, 38, 38, 0.45)',
            }}
          >
            {/* "Mest populär"-badge */}
            <div className="absolute -top-px right-6 z-10">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-b-xl text-[11px] font-black uppercase tracking-[0.14em] text-orange-700 bg-white"
                style={{ boxShadow: '0 6px 14px -4px rgba(0, 0, 0, 0.18)' }}
              >
                <Star className="w-3 h-3 fill-current" strokeWidth={2.5} />
                Mest populär
              </div>
            </div>

            {/* Prick-overlay */}
            <svg
              className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
              aria-hidden="true"
            >
              <pattern
                id="pricing-detailed-dots"
                x="0"
                y="0"
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="12" cy="12" r="1" fill="white" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#pricing-detailed-dots)" />
            </svg>

            {/* Vinjett-skugga */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 100% 50%, rgba(0,0,0,0.18) 0%, transparent 55%)',
              }}
              aria-hidden="true"
            />

            <div className="relative p-6 sm:p-8 lg:p-10 flex flex-col flex-1">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] opacity-95">
                  Premium
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/15 border border-white/25">
                  Obegränsat
                </span>
              </div>

              <p className="text-sm opacity-95 mb-5">
                Få tillgång till alla funktioner för 149 kr/mån. Mindre än en
                arbetslunch kostar. Perfekt för seriös jobbsökning.
              </p>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl sm:text-6xl font-black tabular-nums">
                  149 kr
                </span>
                <span className="text-sm opacity-85">/ månad</span>
              </div>

              <p className="text-xs opacity-90 mb-6 inline-flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 fill-current" strokeWidth={2} />
                Ingen bindningstid · Avsluta när som helst
              </p>

              <p className="text-sm font-black mb-4 pt-4 border-t border-white/20">
                Allt i Gratis, plus:
              </p>

              <ul className="space-y-3.5 mb-7">
                {PREMIUM_FEATURES.map((feature) => (
                  <li key={feature.title} className="flex items-start gap-3">
                    <div
                      className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{
                        background:
                          'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 100%)',
                        border: '1px solid rgba(255,255,255,0.25)',
                      }}
                    >
                      <feature.icon
                        className="w-4 h-4 text-white"
                        strokeWidth={2.2}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black leading-tight mb-0.5">
                        {feature.title}
                      </p>
                      <p className="text-[12px] opacity-90 leading-snug">
                        {feature.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <Link
                href="/trial-signup"
                data-cta="pricing-detailed-trial"
                className="mt-auto group inline-flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-xl bg-white text-orange-700 font-bold text-sm hover:bg-orange-50 hover:scale-[1.01] active:scale-[0.99] transition-all touch-manipulation"
                style={{ boxShadow: '0 12px 28px -8px rgba(0,0,0,0.25)' }}
              >
                Prova Premium gratis i 7 dagar
                <ArrowRight
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={2.5}
                />
              </Link>

              <p className="text-[11px] opacity-90 text-center mt-3">
                7 dagar gratis · Inget kreditkort krävs
              </p>
            </div>
          </motion.div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-8">
          Alla priser inkluderar moms. Säkra betalningar via Stripe. Ingen bindningstid.
        </p>
      </div>
    </section>
  );
}
