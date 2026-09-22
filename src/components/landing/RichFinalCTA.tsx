'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  PenLine,
  FileSearch,
  Compass,
  MessageCircle,
  Brain,
  Linkedin,
} from 'lucide-react';
import DynamicCounters from './DynamicCounters';

const FEATURE_PILLS = [
  { icon: PenLine, label: 'Personliga brev' },
  { icon: FileSearch, label: 'CV-analys' },
  { icon: Compass, label: 'Jobbmatchning' },
  { icon: MessageCircle, label: 'Jobbcoachen' },
  { icon: Brain, label: 'Rekryteringstester' },
  { icon: Linkedin, label: 'LinkedIn-optimering' },
];

export default function RichFinalCTA() {
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
              id="rich-final-cta-dots"
              x="0"
              y="0"
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="14" cy="14" r="1.2" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#rich-final-cta-dots)" />
          </svg>

          {/* Vinjett */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 100% 50%, rgba(0,0,0,0.20) 0%, transparent 55%)',
            }}
            aria-hidden="true"
          />

          <div className="relative px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
            {/* Top: rubrik + ingress */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white/15 border border-white/25 mb-5">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulse"
                  aria-hidden="true"
                />
                Allt på ett ställe
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-black leading-[1.05] tracking-tight mb-4 max-w-3xl mx-auto">
                Allt du behöver för att{' '}
                <span className="inline-block underline decoration-white/40 decoration-[6px] underline-offset-[10px]">
                  landa nästa jobb
                </span>
              </h2>

              <p className="text-base sm:text-lg lg:text-xl opacity-95 leading-relaxed max-w-2xl mx-auto">
                Brev, CV, jobbmatchning, jobbcoach, rekryteringstester och en
                LinkedIn-profil som hittas. På en plattform byggd för svenska
                arbetsmarknaden.
              </p>
            </div>

            {/* Feature-pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-9 max-w-3xl mx-auto">
              {FEATURE_PILLS.map((pill, i) => (
                <motion.span
                  key={pill.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.15 + i * 0.05 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-white/15 border border-white/25 backdrop-blur-sm"
                >
                  <pill.icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                  {pill.label}
                </motion.span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex items-center justify-center mb-4">
              <Link
                href="/register"
                data-cta="rich-final-primary"
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-7 text-base font-semibold text-orange-700 hover:bg-orange-50 transition-colors touch-manipulation min-w-[260px] sm:min-w-0"
              >
                Skapa konto gratis
                <ArrowRight
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={2}
                />
              </Link>
            </div>

            <p className="text-sm opacity-95 mb-8">
              Inget kreditkort · Avsluta när du vill · Bekräftat av SVT, SR, DN
            </p>

            {/* Dynamiska räknare på vit-tonad bg-stripe */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/15 p-4 sm:p-5 max-w-md mx-auto">
              <DynamicCountersOnDark />
            </div>
          </div>

          {/* Subtila dekor-prickar */}
          <div
            className="absolute bottom-8 left-8 w-1.5 h-1.5 rounded-full bg-white/40"
            aria-hidden="true"
          />
          <div
            className="absolute top-10 right-12 w-1 h-1 rounded-full bg-white/35"
            aria-hidden="true"
          />
          <div
            className="absolute top-1/2 right-6 w-1 h-1 rounded-full bg-white/30"
            aria-hidden="true"
          />
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Wrapping för DynamicCounters med vit-tonad styling.
 * Default-komponentens styling är på ljus bakgrund — här återanvänder vi
 * data-hooken via en lättviktig presentation av samma räknare på mörk bg.
 */
function DynamicCountersOnDark() {
  return (
    <div className="text-white">
      <DynamicCounters />
    </div>
  );
}
