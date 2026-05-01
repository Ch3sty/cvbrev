'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Lock, Wand2 } from 'lucide-react';

interface FinalCTAProps {
  variant: 'letter' | 'cv';
  yrke: string;
  ctaHref: string;
}

export default function FinalCTA({ variant, yrke, ctaHref }: FinalCTAProps) {
  const what = variant === 'letter' ? 'personligt brev' : 'CV';
  const ctaLabel =
    variant === 'letter'
      ? 'Skapa mitt personliga brev'
      : 'Skapa mitt CV';

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl text-white"
      style={{
        background:
          'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        boxShadow: '0 20px 60px -20px rgba(220, 38, 38, 0.45)',
      }}
    >
      {/* Prick-pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
        aria-hidden="true"
      >
        <pattern
          id={`final-cta-dots-${variant}`}
          x="0"
          y="0"
          width="28"
          height="28"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="14" cy="14" r="1" fill="white" />
        </pattern>
        <rect width="100%" height="100%" fill={`url(#final-cta-dots-${variant})`} />
      </svg>

      <div className="relative p-6 sm:p-8 md:p-10 lg:p-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white/20 backdrop-blur-sm mb-4">
          <Wand2 className="w-3.5 h-3.5" strokeWidth={2.5} />
          Skapa ditt eget
        </div>

        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3 leading-tight"
          style={{ textShadow: '0 4px 24px rgba(0,0,0,0.18)' }}
        >
          Imponerad? Skapa ditt nu
        </h2>

        <p className="text-sm sm:text-base md:text-lg opacity-95 mb-6 max-w-2xl mx-auto">
          Ladda upp ditt CV, klistra in jobbannonsen, välj mall — klart på 60
          sekunder. Skräddarsytt för {yrke.toLowerCase()} och optimerat för
          ATS-system.
        </p>

        {/* Stat-pillar */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-6">
          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium opacity-95">
            <Clock className="w-3.5 h-3.5 opacity-80" strokeWidth={2.5} />
            Klart på 60 sek
          </span>
          <span className="hidden sm:inline-block w-px h-3 bg-white/30" aria-hidden="true" />
          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium opacity-95">
            <Lock className="w-3.5 h-3.5 opacity-80" strokeWidth={2.5} />
            Inga kreditkort krävs
          </span>
        </div>

        <Link href={ctaHref} className="inline-block">
          <button className="min-h-[52px] px-8 py-4 rounded-xl bg-white text-orange-700 font-bold text-base sm:text-lg hover:bg-orange-50 hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group">
            {ctaLabel}
            <ArrowRight
              className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
              strokeWidth={2.5}
            />
          </button>
        </Link>
      </div>
    </motion.section>
  );
}
