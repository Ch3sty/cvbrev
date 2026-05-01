'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkle, ShieldCheck } from 'lucide-react';
import LiveAIShowcase from './LiveAIShowcase';

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(249, 115, 22, 0.08) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 lg:pt-20 pb-12 sm:pb-16 lg:pb-24">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-14 items-center">
          {/* Vänster: text + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-5">
              <Sparkle className="w-3.5 h-3.5" strokeWidth={2.5} />
              AI-driven jobbcoach för svenska arbetsmarknaden
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-black text-slate-900 leading-[1.05] tracking-tight mb-5">
              Skriv ansökningar{' '}
              <span
                className="inline-block bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                }}
              >
                som faktiskt får svar
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mb-7">
              CV och personliga brev som tar sig förbi rekryterarnas AI-filter.
              Färdig ansökan på 60 sekunder, anpassad efter den svenska
              arbetsmarknaden.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <Link
                href="/trial-signup"
                data-cta="hero-primary"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold text-base shadow-lg hover:scale-[1.02] active:scale-[0.99] transition-all touch-manipulation"
                style={{
                  background:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                  boxShadow: '0 12px 28px -10px rgba(220, 38, 38, 0.5)',
                }}
              >
                Prova Premium gratis i 7 dagar
                <ArrowRight
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={2.5}
                />
              </Link>

              <Link
                href="/login?signup=true"
                data-cta="hero-secondary"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-900 font-bold text-base border border-slate-200 hover:border-orange-300 hover:bg-orange-50/40 transition-all touch-manipulation"
              >
                Starta gratis
              </Link>
            </div>

            {/* Mikro-trust */}
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-600">
              <li className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
                Inget kreditkort krävs
              </li>
              <li className="hidden sm:inline-block w-px h-3 bg-orange-200" aria-hidden="true" />
              <li className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
                Avsluta när du vill
              </li>
              <li className="hidden sm:inline-block w-px h-3 bg-orange-200" aria-hidden="true" />
              <li className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
                Svensk support
              </li>
            </ul>

            {/* Användarbevis-rad */}
            <div className="mt-7 pt-5 border-t border-orange-100 flex items-center gap-4">
              <div className="flex -space-x-2">
                {['#FED7AA', '#FECACA', '#FBCFE8', '#FDE68A'].map((bg, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white"
                    style={{ background: bg }}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <div className="text-xs sm:text-sm">
                <div className="font-bold text-slate-900 tabular-nums">12 400+ användare</div>
                <div className="text-slate-600">har redan landat sitt nästa jobb</div>
              </div>
            </div>
          </motion.div>

          {/* Höger: AI live-showcase */}
          <div className="relative">
            <LiveAIShowcase />
          </div>
        </div>
      </div>
    </section>
  );
}
