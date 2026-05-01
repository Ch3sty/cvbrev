'use client';

import { motion } from 'framer-motion';
import { BookOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ArticlesHeroIllustration } from './illustrations/ArticlesListIcons';

interface ArticlesHeroProps {
  totalPosts: number;
}

export default function ArticlesHero({ totalPosts }: ArticlesHeroProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl bg-white border border-orange-100"
      style={{ boxShadow: '0 8px 32px -16px rgba(249, 115, 22, 0.18)' }}
    >
      {/* Vänster gradient-strip */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{
          background: 'linear-gradient(180deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        }}
        aria-hidden="true"
      />

      {/* Subtil bakgrunds-pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
        aria-hidden="true"
      >
        <pattern
          id="articles-hero-dots"
          x="0"
          y="0"
          width="32"
          height="32"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="16" cy="16" r="1.2" fill="#FB923C" opacity="0.35" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#articles-hero-dots)" />
      </svg>

      <div className="relative grid lg:grid-cols-[1fr_auto] gap-6 lg:gap-10 items-center p-6 sm:p-8 md:p-10 lg:p-12">
        {/* Vänster: text */}
        <div>
          {/* Breadcrumb */}
          <nav aria-label="Brödsmulor" className="mb-4">
            <ol className="flex items-center gap-1.5 text-xs sm:text-sm">
              <li>
                <Link
                  href="/"
                  className="text-slate-600 hover:text-orange-700 font-medium transition-colors"
                >
                  Hem
                </Link>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight
                  className="w-3.5 h-3.5 text-orange-300"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
                <span
                  className="text-slate-900 font-bold"
                  aria-current="page"
                >
                  Artiklar
                </span>
              </li>
            </ol>
          </nav>

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
            <BookOpen className="w-3.5 h-3.5" strokeWidth={2.5} />
            Karriärbiblioteket
          </div>

          {/* H1 */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight tracking-tight mb-4">
            Artiklar som förbättrar din jobbsökning
          </h1>

          {/* Intro */}
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mb-5 sm:mb-6">
            Lär dig skriva starkare ansökningar och CV:n som går igenom. Våra artiklar guidar dig genom moderna rekryteringsprocesser.
          </p>

          {/* Stat-rad */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-4 border-t border-orange-100">
            <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"
                aria-hidden="true"
              />
              <span className="font-bold text-slate-900 tabular-nums">{totalPosts}+</span>
              <span>publicerade artiklar</span>
            </span>
            <span className="hidden sm:inline-block w-px h-3 bg-orange-200" aria-hidden="true" />
            <span className="text-xs sm:text-sm text-slate-600">
              Granskade av HR-experter
            </span>
            <span className="hidden sm:inline-block w-px h-3 bg-orange-200" aria-hidden="true" />
            <span className="text-xs sm:text-sm text-slate-600">
              Uppdateras varje vecka
            </span>
          </div>
        </div>

        {/* Höger: illustration (desktop only) */}
        <div className="hidden lg:flex items-center justify-center">
          <ArticlesHeroIllustration className="w-72 h-auto opacity-85" />
        </div>
      </div>
    </motion.section>
  );
}
