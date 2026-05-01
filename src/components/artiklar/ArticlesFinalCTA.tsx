'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Search,
  PenTool,
  Briefcase,
  Brain,
  TrendingUp,
} from 'lucide-react';

const FEATURES = [
  { Icon: FileText, title: 'Professionella CV-mallar', desc: '8+ branschspecifika mallar' },
  { Icon: Search, title: 'Djupgående CV-analys', desc: 'Konkret feedback direkt' },
  { Icon: PenTool, title: 'Personliga brev som konverterar', desc: 'Matchade brev som ökar chanserna' },
  { Icon: Briefcase, title: 'Smart jobbmatchning', desc: 'Hitta jobb baserat på din profil' },
  { Icon: Brain, title: 'Kompetensgap-analys', desc: 'Se vilka färdigheter som fattas' },
  { Icon: TrendingUp, title: 'Karriärinsikter', desc: 'Branschdata och löne-benchmarks' },
];

export default function ArticlesFinalCTA() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl text-white"
      style={{
        background:
          'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        boxShadow: '0 24px 60px -20px rgba(220, 38, 38, 0.5)',
      }}
    >
      {/* Prick-pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
        aria-hidden="true"
      >
        <pattern
          id="articles-final-dots"
          x="0"
          y="0"
          width="28"
          height="28"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="14" cy="14" r="1" fill="white" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#articles-final-dots)" />
      </svg>

      <div className="relative p-6 sm:p-8 md:p-10 lg:p-12">
        {/* Header */}
        <div className="text-center mb-7 sm:mb-9 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white/20 backdrop-blur-sm mb-4">
            <span
              className="w-1.5 h-1.5 rounded-full bg-yellow-300"
              aria-hidden="true"
            />
            Hela paketet
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight mb-3">
            Hittade du inte vad du sökte?
          </h2>
          <p className="text-sm sm:text-base md:text-lg opacity-95">
            Vi har verktygen som tar dig hela vägen — från CV till intervju.
          </p>
        </div>

        {/* Features-grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-7 sm:mb-9">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.Icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/15 rounded-2xl p-4 sm:p-5 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-sm sm:text-base leading-tight">
                        {feature.title}
                      </h3>
                      <CheckCircle2
                        className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5"
                        strokeWidth={2.5}
                      />
                    </div>
                    <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login?signup=true"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-orange-700 font-bold text-base sm:text-lg hover:bg-orange-50 hover:scale-[1.02] transition-all w-full sm:w-auto group min-h-[52px] touch-manipulation"
          >
            Starta gratis
            <ArrowRight
              className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
              strokeWidth={2.5}
            />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-white/40 bg-white/10 backdrop-blur-sm text-white font-bold text-base sm:text-lg hover:bg-white/20 transition-colors w-full sm:w-auto min-h-[52px] touch-manipulation"
          >
            Se alla verktyg
          </Link>
        </div>

        {/* Trust */}
        <p className="text-center mt-4 text-xs sm:text-sm opacity-90">
          Inget kreditkort krävs · Gratis för alltid
        </p>
      </div>
    </motion.section>
  );
}
