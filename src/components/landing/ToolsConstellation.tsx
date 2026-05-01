'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  PenLine,
  FileSearch,
  Compass,
  MessageCircle,
  Brain,
  Linkedin,
  Library,
  ArrowRight,
} from 'lucide-react';

const TOOLS = [
  {
    icon: PenLine,
    name: 'Personliga brev',
    blurb: 'Skräddarsydda från ditt CV mot annonsen, klart på 60 sekunder.',
    href: '/personligt-brev-exempel',
  },
  {
    icon: FileSearch,
    name: 'CV-analys',
    blurb: 'Detaljerad ATS-feedback med konkreta förbättringspunkter.',
    href: '/cv-exempel',
  },
  {
    icon: Compass,
    name: 'Jobbmatchning',
    blurb: 'Lediga jobb från Arbetsförmedlingen och JobTech, matchade mot ditt CV.',
    href: '/login?signup=true',
  },
  {
    icon: MessageCircle,
    name: 'Jobbcoachen',
    blurb: 'Chatta med en coach om lön, intervju och arbetsrätt.',
    href: '/login?signup=true',
  },
  {
    icon: Brain,
    name: 'Rekryteringstester',
    blurb: 'Sex testpaket: matrislogik, verbal och numerisk förmåga.',
    href: '/login?signup=true',
  },
  {
    icon: Linkedin,
    name: 'LinkedIn-optimering',
    blurb: 'Profilen som hittas av både rekryterare och deras sökverktyg.',
    href: '/login?signup=true',
  },
];

const EXTRA_LINK = {
  icon: Library,
  label: '75+ CV-exempel · 77+ brev-exempel',
  href: '/personligt-brev-exempel',
};

export default function ToolsConstellation() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-white via-orange-50/30 to-white">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(249, 115, 22, 0.08) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
            Hela jobbsökningen
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-black text-slate-900 leading-[1.05] tracking-tight mb-4 max-w-3xl mx-auto">
            Sex verktyg som arbetar tillsammans
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Brev, CV, jobbmatchning, coach, träning och LinkedIn på samma
            plattform. Allt byggt för svenska arbetsmarknaden.
          </p>
        </motion.div>

        {/* Desktop: orbital layout. Mobile: stack. */}
        <div className="relative">
          {/* Central nav-element (synligt på desktop, mindre framträdande på mobil) */}
          <div className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {/* Yttre glow */}
              <div
                className="absolute inset-0 rounded-full blur-3xl opacity-50"
                style={{
                  background:
                    'radial-gradient(circle, rgba(249, 115, 22, 0.5) 0%, rgba(190, 24, 93, 0.3) 60%, transparent 100%)',
                  transform: 'scale(1.8)',
                }}
                aria-hidden="true"
              />
              <div
                className="relative w-44 h-44 rounded-full flex items-center justify-center text-white text-center"
                style={{
                  background:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                  boxShadow: '0 24px 48px -12px rgba(220, 38, 38, 0.5)',
                }}
              >
                {/* Prick-overlay */}
                <svg
                  className="absolute inset-0 w-full h-full rounded-full opacity-25"
                  aria-hidden="true"
                >
                  <pattern
                    id="constellation-center-dots"
                    x="0"
                    y="0"
                    width="14"
                    height="14"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="7" cy="7" r="0.8" fill="white" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#constellation-center-dots)" />
                </svg>
                <div className="relative px-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] opacity-90 mb-1">
                    En plattform
                  </p>
                  <p className="text-xl font-black leading-tight">
                    Allt på<br />ett ställe
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* SVG kopplingslinjer (desktop only) */}
          <svg
            className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="constellation-line"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#F97316" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#BE185D" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            {[
              { x1: '15%', y1: '20%', x2: '50%', y2: '50%' },
              { x1: '50%', y1: '15%', x2: '50%', y2: '50%' },
              { x1: '85%', y1: '20%', x2: '50%', y2: '50%' },
              { x1: '15%', y1: '80%', x2: '50%', y2: '50%' },
              { x1: '50%', y1: '85%', x2: '50%', y2: '50%' },
              { x1: '85%', y1: '80%', x2: '50%', y2: '50%' },
            ].map((line, i) => (
              <line
                key={i}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="url(#constellation-line)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}
          </svg>

          {/* Verktygskort */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-x-32 lg:gap-y-16 lg:py-12 relative z-20">
            {TOOLS.map((tool, i) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="group relative"
              >
                <Link
                  href={tool.href}
                  className="block relative p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-orange-100 hover:border-orange-300 hover:bg-white transition-all duration-300 hover:-translate-y-1"
                  style={{
                    boxShadow: '0 4px 20px -8px rgba(249, 115, 22, 0.18)',
                  }}
                >
                  {/* Hover-glow */}
                  <div
                    className="absolute -inset-4 rounded-3xl opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500 pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                    }}
                    aria-hidden="true"
                  />

                  <div className="relative">
                    <div
                      className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300"
                      style={{
                        background:
                          'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                        boxShadow:
                          '0 8px 20px -6px rgba(220, 38, 38, 0.45)',
                      }}
                    >
                      <tool.icon
                        className="w-7 h-7 text-white"
                        strokeWidth={2.2}
                      />
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight tracking-tight mb-2">
                      {tool.name}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                      {tool.blurb}
                    </p>

                    <div className="inline-flex items-center gap-1.5 text-orange-700 font-bold text-xs">
                      Läs mer
                      <ArrowRight
                        className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
                        strokeWidth={2.5}
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Extra-länk till exempel-bibliotek under konstellationen */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mt-12 sm:mt-16"
        >
          <Link
            href={EXTRA_LINK.href}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-orange-200 hover:border-orange-300 hover:bg-orange-50/40 text-orange-700 font-bold text-sm transition-all"
            style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)' }}
          >
            <EXTRA_LINK.icon className="w-4 h-4" strokeWidth={2.5} />
            {EXTRA_LINK.label}
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
