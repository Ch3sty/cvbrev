'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  PenLine,
  FileSearch,
  FilePlus,
  Palette,
  Compass,
  MessageCircle,
  Brain,
  Linkedin,
} from 'lucide-react';

const TOOLS = [
  {
    label: 'Personligt brev',
    href: '#brev',
    icon: PenLine,
    blurb: 'Skräddarsytt från ditt CV mot annonsen.',
  },
  {
    label: 'CV-analys',
    href: '#cv-analys',
    icon: FileSearch,
    blurb: 'Konkret feedback med ATS-score.',
  },
  {
    label: 'Skapa CV',
    href: '#cv-skapa-mallar',
    icon: FilePlus,
    blurb: 'Bygg ett komplett CV på minuter.',
  },
  {
    label: 'CV-mallar',
    href: '#cv-skapa-mallar',
    icon: Palette,
    blurb: 'Åtta mallar, alla ATS-säkra.',
  },
  {
    label: 'Jobbmatchning',
    href: '#jobbmatchning',
    icon: Compass,
    blurb: 'Jobb från Arbetsförmedlingen och JobTech.',
  },
  {
    label: 'Jobbcoachen',
    href: '#jobbcoachen',
    icon: MessageCircle,
    blurb: 'Karriärchatt med riktiga svar.',
  },
  {
    label: 'Rekryteringstester',
    href: '#tester',
    icon: Brain,
    blurb: 'Träna logik, verbal och numerisk.',
  },
  {
    label: 'LinkedIn-optimering',
    href: '#linkedin',
    icon: Linkedin,
    blurb: 'Profilen som hittas av rekryterare.',
  },
];

export default function ToolsOverview() {
  return (
    <section className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-orange-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4 }}
          className="text-center text-xs font-bold uppercase tracking-[0.18em] text-orange-700 mb-6"
        >
          Hoppa direkt till verktyget du vill veta mer om
        </motion.p>

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
                className="group relative flex flex-col h-full p-4 sm:p-5 rounded-2xl bg-white border border-orange-100 hover:border-orange-300 hover:-translate-y-0.5 transition-all duration-300"
                style={{
                  boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.12)',
                }}
              >
                <div
                  className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300"
                  style={{
                    background:
                      'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)',
                  }}
                >
                  <tool.icon
                    className="w-5 h-5 text-orange-600"
                    strokeWidth={2.2}
                  />
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight mb-1">
                  {tool.label}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-600 leading-snug">
                  {tool.blurb}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
