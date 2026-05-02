'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ToolBrevIllustration,
  ToolCvAnalysIllustration,
  ToolSkapaCvIllustration,
  ToolCvMallarIllustration,
  ToolJobbmatchningIllustration,
  ToolJobbcoachenIllustration,
  ToolTesterIllustration,
  ToolLinkedinIllustration,
} from './illustrations/ToolIllustrations';

const TOOLS = [
  {
    label: 'Personligt brev',
    href: '#brev',
    illustration: ToolBrevIllustration,
    blurb: 'Skräddarsytt från ditt CV mot annonsen.',
  },
  {
    label: 'CV-analys',
    href: '#cv-analys',
    illustration: ToolCvAnalysIllustration,
    blurb: 'Konkret feedback med ATS-score.',
  },
  {
    label: 'Skapa CV',
    href: '#cv-skapa-mallar',
    illustration: ToolSkapaCvIllustration,
    blurb: 'Bygg ett komplett CV på minuter.',
  },
  {
    label: 'CV-mallar',
    href: '#cv-skapa-mallar',
    illustration: ToolCvMallarIllustration,
    blurb: 'Mallar granskade av rekryterare.',
  },
  {
    label: 'Jobbmatchning',
    href: '#jobbmatchning',
    illustration: ToolJobbmatchningIllustration,
    blurb: 'Jobb från Arbetsförmedlingen och JobTech.',
  },
  {
    label: 'Jobbcoachen',
    href: '#jobbcoachen',
    illustration: ToolJobbcoachenIllustration,
    blurb: 'Karriärchatt med riktiga svar.',
  },
  {
    label: 'Rekryteringstester',
    href: '#tester',
    illustration: ToolTesterIllustration,
    blurb: 'Träna logik, verbal och numerisk.',
  },
  {
    label: 'LinkedIn-optimering',
    href: '#linkedin',
    illustration: ToolLinkedinIllustration,
    blurb: 'Profilen som hittas av rekryterare.',
  },
];

export default function ToolsOverview() {
  return (
    <section className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-orange-50/30 overflow-hidden">
      {/* Bakgrunds-prickar */}
      <svg
        className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
        aria-hidden="true"
      >
        <pattern
          id="tools-overview-dots"
          x="0"
          y="0"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="20" cy="20" r="1" fill="#FB923C" opacity="0.18" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#tools-overview-dots)" />
      </svg>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8 sm:mb-10"
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
            Hoppa direkt till verktyget du vill veta mer om
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {TOOLS.map((tool, i) => (
            <motion.div
              key={tool.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: (i % 4) * 0.05 }}
            >
              <Link
                href={tool.href}
                className="group relative flex flex-col h-full pt-3 pb-4 px-4 rounded-2xl bg-white border border-orange-100 hover:border-orange-300 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                style={{
                  boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.12)',
                }}
              >
                {/* Hover-glow */}
                <div
                  className="absolute -inset-4 rounded-3xl opacity-0 group-hover:opacity-25 blur-2xl transition-opacity duration-500 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                  }}
                  aria-hidden="true"
                />

                <div className="relative flex flex-col h-full">
                  {/* Illustration tar full bredd */}
                  <div className="flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-300">
                    <tool.illustration className="w-20 h-20 sm:w-24 sm:h-24" />
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight mb-1">
                    {tool.label}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-600 leading-snug">
                    {tool.blurb}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
