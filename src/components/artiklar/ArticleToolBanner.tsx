'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkle } from 'lucide-react';
import {
  CvMallarIcon,
  CvAnalysIcon,
  BrevIcon,
  JobbmatchningIcon,
} from './illustrations/ArticleIcons';

const TOOLS = [
  {
    Icon: CvMallarIcon,
    label: 'CV-mallar',
    href: '/dashboard/cv-mallar',
  },
  {
    Icon: CvAnalysIcon,
    label: 'CV-analys',
    href: '/dashboard/cv-analys',
  },
  {
    Icon: BrevIcon,
    label: 'Personliga brev',
    href: '/dashboard/skapa-brev',
  },
  {
    Icon: JobbmatchningIcon,
    label: 'Jobbmatchning',
    href: '/dashboard/jobbmatchning',
  },
];

/**
 * Inline-komponent som injekteras efter intro i artiklar.
 *
 * Designad för att smälta in naturligt i läsflödet snarare än bryta det.
 * Vit bakgrund med subtil orange-gradient på vänster strip — inte en
 * fullskärms-banner.
 */
export default function ArticleToolBanner() {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-orange-200/60 bg-gradient-to-br from-white via-orange-50/30 to-white my-7 sm:my-8 not-prose"
      style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)' }}
      aria-label="Snabblänkar till våra verktyg"
    >
      {/* Vänster gradient-strip */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{
          background: 'linear-gradient(180deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative p-4 sm:p-5">
        {/* Header-rad */}
        <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-0.5">
              <Sparkle className="w-3 h-3" strokeWidth={2.5} />
              Allt du behöver för din karriär
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              Upptäck alla våra verktyg för att accelerera din jobbsökning
            </h3>
          </div>
        </div>

        {/* Tool-grid - kompakt 2x2 mobilt, 4-col desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5">
          {TOOLS.map((tool) => {
            const Icon = tool.Icon;
            return (
              <Link
                key={tool.label}
                href={tool.href}
                className="group flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-white border border-orange-100 hover:border-orange-300 hover:bg-orange-50/40 transition-all touch-manipulation"
              >
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{
                    background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                    boxShadow: '0 3px 8px -2px rgba(220, 38, 38, 0.3)',
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-semibold text-[12px] sm:text-xs text-slate-800 group-hover:text-orange-800 leading-tight transition-colors">
                  {tool.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Footer-rad */}
        <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-orange-100">
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-600">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"
              aria-hidden="true"
            />
            <span>Ingen kreditkort krävs</span>
            <span className="text-slate-300 hidden sm:inline" aria-hidden="true">·</span>
            <span className="hidden sm:inline">200+ jobbsökare denna vecka</span>
          </div>
          <Link
            href="/login?signup=true"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white font-bold text-xs hover:scale-[1.03] transition-all touch-manipulation"
            style={{
              background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
              boxShadow: '0 4px 10px -3px rgba(220, 38, 38, 0.4)',
            }}
          >
            Starta gratis
            <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </motion.aside>
  );
}
