'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  PenLine,
  FileSearch,
  FilePlus,
  Palette,
  Compass,
  MessageCircle,
  Brain,
  Linkedin,
} from 'lucide-react';

const PILLS = [
  { label: 'Personligt brev', href: '#brev', icon: PenLine },
  { label: 'CV-analys', href: '#cv-analys', icon: FileSearch },
  { label: 'Skapa CV', href: '#cv-skapa-mallar', icon: FilePlus },
  { label: 'CV-mallar', href: '#cv-skapa-mallar', icon: Palette },
  { label: 'Jobbmatchning', href: '#jobbmatchning', icon: Compass },
  { label: 'Jobbcoachen', href: '#jobbcoachen', icon: MessageCircle },
  { label: 'Rekryteringstester', href: '#tester', icon: Brain },
  { label: 'LinkedIn-optimering', href: '#linkedin', icon: Linkedin },
];

export default function FunktionerHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(249, 115, 22, 0.10) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-24 pb-10 sm:pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-5">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
              aria-hidden="true"
            />
            Åtta verktyg, en plattform
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-black text-slate-900 leading-[1.05] tracking-tight mb-5">
            Allt du behöver för att{' '}
            <span
              className="inline-block bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              }}
            >
              landa nästa jobb
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-8">
            Brev, CV, jobbmatchning, jobbcoach, rekryteringstester och en
            LinkedIn-profil som hittas. Byggt för svenska arbetsmarknaden,
            granskat av rekryterare.
          </p>

          {/* Pills som ankarlänkar */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-9 max-w-3xl mx-auto">
            {PILLS.map((pill, i) => (
              <motion.div
                key={pill.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.15 + i * 0.04 }}
              >
                <Link
                  href={pill.href}
                  className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-white text-slate-700 border border-orange-200 hover:border-orange-300 hover:bg-orange-50/60 hover:text-orange-700 transition-colors touch-manipulation"
                >
                  <pill.icon
                    className="w-3.5 h-3.5 text-orange-600"
                    strokeWidth={2.5}
                  />
                  {pill.label}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5">
            <Link
              href="/trial-signup"
              data-cta="funktioner-hero-primary"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold text-base shadow-lg hover:scale-[1.02] active:scale-[0.99] transition-all touch-manipulation w-full sm:w-auto"
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
              data-cta="funktioner-hero-secondary"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-900 font-bold text-base border border-slate-200 hover:border-orange-300 hover:bg-orange-50/40 transition-all touch-manipulation w-full sm:w-auto"
            >
              Eller starta gratis
            </Link>
          </div>

          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-600">
            <li className="inline-flex items-center gap-1.5">
              <ShieldCheck
                className="w-3.5 h-3.5 text-emerald-500"
                strokeWidth={2.5}
              />
              Inget kreditkort krävs
            </li>
            <li
              className="hidden sm:inline-block w-px h-3 bg-orange-200"
              aria-hidden="true"
            />
            <li className="inline-flex items-center gap-1.5">
              <ShieldCheck
                className="w-3.5 h-3.5 text-emerald-500"
                strokeWidth={2.5}
              />
              Avsluta när du vill
            </li>
            <li
              className="hidden sm:inline-block w-px h-3 bg-orange-200"
              aria-hidden="true"
            />
            <li className="inline-flex items-center gap-1.5">
              <ShieldCheck
                className="w-3.5 h-3.5 text-emerald-500"
                strokeWidth={2.5}
              />
              Svensk support
            </li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
