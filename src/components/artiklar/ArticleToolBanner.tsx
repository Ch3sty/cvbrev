'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Users } from 'lucide-react';
import {
  CvMallarIcon,
  CvAnalysIcon,
  BrevIcon,
  JobbmatchningIcon,
} from './illustrations/ArticleIcons';

const TOOLS = [
  {
    icon: CvMallarIcon,
    label: 'CV-mallar',
    href: '/dashboard/cv-mallar',
    desc: 'Professionella mallar för alla branscher',
  },
  {
    icon: CvAnalysIcon,
    label: 'CV-analys',
    href: '/dashboard/cv-analys',
    desc: 'Konkret feedback på ditt CV',
  },
  {
    icon: BrevIcon,
    label: 'Personliga brev',
    href: '/dashboard/skapa-brev',
    desc: 'Matchade brev för varje tjänst',
  },
  {
    icon: JobbmatchningIcon,
    label: 'Jobbmatchning',
    href: '/dashboard/jobbmatchning',
    desc: 'Hitta jobb som passar dig',
  },
];

export default function ArticleToolBanner() {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl text-white my-8 sm:my-10 not-prose"
      style={{
        background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        boxShadow: '0 20px 50px -16px rgba(220, 38, 38, 0.45)',
      }}
    >
      {/* Prick-pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
        aria-hidden="true"
      >
        <pattern
          id="article-toolbanner-dots"
          x="0"
          y="0"
          width="28"
          height="28"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="14" cy="14" r="1" fill="white" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#article-toolbanner-dots)" />
      </svg>

      <div className="relative p-5 sm:p-7 md:p-8">
        {/* Header */}
        <div className="text-center mb-5 sm:mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white/20 backdrop-blur-sm mb-3">
            <span
              className="w-1.5 h-1.5 rounded-full bg-yellow-300"
              aria-hidden="true"
            />
            Allt du behöver
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight tracking-tight mb-1.5">
            Bygg ett komplett ansökningspaket
          </h3>
          <p className="text-sm sm:text-base opacity-95 max-w-md mx-auto">
            Våra verktyg hjälper dig från CV till intervju. Allt är gratis att prova.
          </p>
        </div>

        {/* Tool-grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 mb-5 sm:mb-6">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.label}
                href={tool.href}
                className="group flex flex-col items-center text-center gap-2 p-3 sm:p-4 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15 hover:border-white/30 transition-all touch-manipulation"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white text-orange-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm leading-tight mb-0.5">
                    {tool.label}
                  </div>
                  <div className="text-[10px] sm:text-[11px] opacity-85 leading-tight hidden sm:block">
                    {tool.desc}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Stats + CTA-rad */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-white/20">
          <div className="flex items-center gap-x-4 gap-y-1 text-xs sm:text-sm opacity-95 flex-wrap justify-center sm:justify-start">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
              Inget kreditkort krävs
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" strokeWidth={2.5} />
              200+ jobbsökare denna vecka
            </span>
          </div>
          <Link
            href="/login?signup=true"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-orange-700 font-bold text-sm sm:text-base hover:bg-orange-50 hover:scale-[1.02] transition-all sm:ml-auto group touch-manipulation"
          >
            Starta gratis
            <ArrowRight
              className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
              strokeWidth={2.5}
            />
          </Link>
        </div>
      </div>
    </motion.aside>
  );
}
