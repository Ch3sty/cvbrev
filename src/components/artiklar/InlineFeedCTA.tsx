'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkle } from 'lucide-react';
import { FeedCTAIllustration } from './illustrations/ArticlesListIcons';

/**
 * Inline-CTA som tar samma grid-cell-position som ett artikelkort.
 * Injekteras EN gång i feed:en (t.ex. efter pos 6) — inte var 5:e som
 * den gamla ConversionCard-logiken.
 *
 * Designad för att kännas naturligt i flödet snarare än bryta det.
 */
export default function InlineFeedCTA() {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl text-white flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        boxShadow: '0 12px 32px -10px rgba(220, 38, 38, 0.45)',
      }}
      aria-label="Kom igång med våra verktyg"
    >
      {/* Prick-pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
        aria-hidden="true"
      >
        <pattern
          id="inline-feed-cta-dots"
          x="0"
          y="0"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="12" cy="12" r="1" fill="white" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#inline-feed-cta-dots)" />
      </svg>

      {/* Top illustration-area (matchar artikelkortets bild-höjd) */}
      <div className="relative aspect-[16/10] flex items-center justify-center bg-white/5 border-b border-white/10">
        <FeedCTAIllustration className="w-32 h-auto" />
      </div>

      {/* Innehåll */}
      <div className="relative flex flex-col flex-1 p-5 sm:p-6">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] mb-2 opacity-90">
          <Sparkle className="w-3 h-3" strokeWidth={2.5} />
          Komplett verktyg
        </div>

        <h3 className="text-lg sm:text-xl font-black leading-tight mb-2 tracking-tight">
          Allt du behöver för din jobbsökning
        </h3>

        <p className="text-sm opacity-95 leading-relaxed mb-4 flex-1">
          CV-mallar, AI-driven analys, personliga brev och jobbmatchning — allt på ett ställe.
        </p>

        <Link
          href="/login?signup=true"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-orange-700 font-bold text-sm hover:bg-orange-50 hover:scale-[1.02] transition-all touch-manipulation group"
        >
          Starta gratis
          <ArrowRight
            className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
            strokeWidth={2.5}
          />
        </Link>

        {/* Mini-trust-rad */}
        <div className="mt-3 pt-3 border-t border-white/15 flex items-center gap-2 text-[11px] opacity-90">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-300"
            aria-hidden="true"
          />
          <span>Inget kreditkort krävs</span>
        </div>
      </div>
    </motion.aside>
  );
}
