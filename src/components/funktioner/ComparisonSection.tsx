'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Minus, Star } from 'lucide-react';

type Row = {
  label: string;
  free: string | boolean;
  premium: string | boolean;
};

const ROWS: Row[] = [
  { label: 'Personliga brev', free: '5/vecka, 2/dag', premium: 'Obegränsat' },
  { label: 'Sparade brev', free: '2 max', premium: 'Obegränsat' },
  { label: 'CV-analyser', free: '1/vecka', premium: 'Obegränsat' },
  { label: 'Uppladdade CV:n', free: '2', premium: '50' },
  { label: 'CV-mallar', free: '2 av 8', premium: 'Alla 8' },
  { label: 'Tonaliteter', free: '5 manuella', premium: '6 (inkl Smart)' },
  {
    label: 'Smart-anpassad tonalitet',
    free: false,
    premium: true,
  },
  {
    label: 'Foto + LinkedIn på CV',
    free: false,
    premium: true,
  },
  { label: 'Jobbmatchning', free: '10 jobb', premium: 'Obegränsat' },
  {
    label: 'Rekryteringstester',
    free: '3 grundnivå',
    premium: '6 (inkl avancerade)',
  },
  { label: 'LinkedIn-optimering', free: '1/månad', premium: 'Obegränsat' },
  {
    label: 'Professionell export (Word/PDF)',
    free: true,
    premium: true,
  },
];

function Cell({
  value,
  variant,
}: {
  value: string | boolean;
  variant: 'free' | 'premium';
}) {
  if (typeof value === 'boolean') {
    if (value) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200">
          <Check
            className="w-3.5 h-3.5 text-emerald-600"
            strokeWidth={3}
          />
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
          variant === 'free'
            ? 'bg-slate-50 border border-slate-200'
            : 'bg-white/15 border border-white/20'
        }`}
      >
        <Minus
          className={`w-3.5 h-3.5 ${
            variant === 'free' ? 'text-slate-300' : 'text-white/40'
          }`}
          strokeWidth={2.5}
        />
      </span>
    );
  }
  return (
    <span
      className={`text-sm font-bold tabular-nums ${
        variant === 'free' ? 'text-slate-700' : 'text-white'
      }`}
    >
      {value}
    </span>
  );
}

export default function ComparisonSection() {
  return (
    <section
      id="jamforelse"
      className="relative py-16 sm:py-20 lg:py-28 scroll-mt-20 bg-gradient-to-b from-white via-orange-50/30 to-white"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="relative text-center mb-10 sm:mb-12"
        >
          {/* Dekoration: två symmetriska prick-cluster */}
          <div
            className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          >
            <svg width="100" height="80" viewBox="0 0 100 80" fill="none">
              <circle cx="20" cy="20" r="3" fill="#F97316" opacity="0.4" />
              <circle cx="40" cy="40" r="2" fill="#DC2626" opacity="0.5" />
              <circle cx="20" cy="60" r="2" fill="#BE185D" opacity="0.4" />
              <circle cx="60" cy="20" r="1.5" fill="#F97316" opacity="0.3" />
              <circle cx="70" cy="55" r="1.5" fill="#DC2626" opacity="0.3" />
              <line
                x1="20"
                y1="20"
                x2="40"
                y2="40"
                stroke="#FB923C"
                strokeWidth="1"
                strokeDasharray="2 3"
                opacity="0.5"
              />
              <line
                x1="40"
                y1="40"
                x2="20"
                y2="60"
                stroke="#FB923C"
                strokeWidth="1"
                strokeDasharray="2 3"
                opacity="0.5"
              />
            </svg>
          </div>
          <div
            className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          >
            <svg width="100" height="80" viewBox="0 0 100 80" fill="none">
              <circle cx="80" cy="20" r="3" fill="#BE185D" opacity="0.4" />
              <circle cx="60" cy="40" r="2" fill="#DC2626" opacity="0.5" />
              <circle cx="80" cy="60" r="2" fill="#F97316" opacity="0.4" />
              <circle cx="40" cy="20" r="1.5" fill="#BE185D" opacity="0.3" />
              <circle cx="30" cy="55" r="1.5" fill="#DC2626" opacity="0.3" />
              <line
                x1="80"
                y1="20"
                x2="60"
                y2="40"
                stroke="#FB923C"
                strokeWidth="1"
                strokeDasharray="2 3"
                opacity="0.5"
              />
              <line
                x1="60"
                y1="40"
                x2="80"
                y2="60"
                stroke="#FB923C"
                strokeWidth="1"
                strokeDasharray="2 3"
                opacity="0.5"
              />
            </svg>
          </div>

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500"
                aria-hidden="true"
              />
              Gratis vs Premium
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-black text-slate-900 leading-[1.05] tracking-tight mb-5 max-w-3xl mx-auto">
              Vad ingår på{' '}
              <span
                className="relative inline-block"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                respektive nivå
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  height="6"
                  viewBox="0 0 200 6"
                  preserveAspectRatio="none"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M 2 4 Q 50 1 100 3 T 198 4"
                    stroke="url(#compare-underline)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient
                      id="compare-underline"
                      x1="0"
                      y1="0"
                      x2="200"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#F97316" />
                      <stop offset="50%" stopColor="#DC2626" />
                      <stop offset="100%" stopColor="#BE185D" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto mb-6">
              Alla siffror är hämtade direkt från produkten. Inget finstilt.
            </p>

            {/* Stat-rad — tre korta blickfång */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs sm:text-sm">
              <div className="inline-flex items-center gap-1.5">
                <span
                  className="text-base sm:text-lg font-black tabular-nums"
                  style={{
                    backgroundImage:
                      'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  149 kr
                </span>
                <span className="text-slate-600 font-medium">/ månad</span>
              </div>
              <span
                className="hidden sm:inline-block w-px h-4 bg-orange-200"
                aria-hidden="true"
              />
              <span className="inline-flex items-center gap-1.5 text-slate-600 font-medium">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"
                  aria-hidden="true"
                />
                7 dagar gratis trial
              </span>
              <span
                className="hidden sm:inline-block w-px h-4 bg-orange-200"
                aria-hidden="true"
              />
              <span className="inline-flex items-center gap-1.5 text-slate-600 font-medium">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"
                  aria-hidden="true"
                />
                Ingen bindningstid
              </span>
            </div>
          </div>
        </motion.div>

        {/* Desktop: tabell. Mobile: två kort */}

        {/* Desktop-tabell */}
        <div className="hidden md:block">
          <div
            className="relative grid grid-cols-[1.4fr_1fr_1fr] rounded-3xl overflow-hidden border border-orange-100"
            style={{
              boxShadow: '0 12px 32px -16px rgba(249, 115, 22, 0.18)',
            }}
          >
            {/* Header-rad */}
            <div className="px-6 py-5 bg-white">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Funktion
              </span>
            </div>
            <div className="px-6 py-5 bg-white border-l border-orange-100">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-700">
                Gratis
              </span>
              <p className="text-2xl font-black text-slate-900 tabular-nums mt-0.5">
                0 kr
              </p>
            </div>
            <div
              className="relative px-6 py-5 text-white border-l border-white/10"
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              }}
            >
              {/* Mest populär-badge */}
              <div className="absolute -top-px right-4 z-10">
                <div
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-b-lg text-[10px] font-black uppercase tracking-[0.14em] text-orange-700 bg-white"
                  style={{
                    boxShadow: '0 4px 10px -3px rgba(0, 0, 0, 0.18)',
                  }}
                >
                  <Star className="w-2.5 h-2.5 fill-current" strokeWidth={2.5} />
                  Mest populär
                </div>
              </div>
              <span className="text-xs font-black uppercase tracking-[0.18em] opacity-95">
                Premium
              </span>
              <p className="text-2xl font-black tabular-nums mt-0.5">
                149 kr<span className="text-sm font-bold opacity-85"> /mån</span>
              </p>
            </div>

            {/* Datarader */}
            {ROWS.map((row, i) => (
              <div key={row.label} className="contents">
                <div
                  className={`px-6 py-3.5 text-sm font-bold text-slate-800 ${
                    i % 2 === 0 ? 'bg-orange-50/30' : 'bg-white'
                  }`}
                >
                  {row.label}
                </div>
                <div
                  className={`px-6 py-3.5 border-l border-orange-100 ${
                    i % 2 === 0 ? 'bg-orange-50/30' : 'bg-white'
                  }`}
                >
                  <Cell value={row.free} variant="free" />
                </div>
                <div
                  className="px-6 py-3.5 text-white border-l border-white/10"
                  style={{
                    background:
                      i % 2 === 0
                        ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.96) 0%, rgba(220, 38, 38, 0.96) 50%, rgba(190, 24, 93, 0.96) 100%)'
                        : 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                  }}
                >
                  <Cell value={row.premium} variant="premium" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: stacked kort */}
        <div className="md:hidden space-y-4">
          {/* Premium-kort först (mest populär) */}
          <div
            className="relative rounded-3xl overflow-hidden text-white"
            style={{
              background:
                'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              boxShadow: '0 16px 36px -12px rgba(220, 38, 38, 0.45)',
            }}
          >
            <div className="absolute -top-px right-4 z-10">
              <div
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-b-lg text-[10px] font-black uppercase tracking-[0.14em] text-orange-700 bg-white"
              >
                <Star className="w-2.5 h-2.5 fill-current" strokeWidth={2.5} />
                Mest populär
              </div>
            </div>

            <svg
              className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
              aria-hidden="true"
            >
              <pattern
                id="comp-mobile-dots"
                x="0"
                y="0"
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="12" cy="12" r="1" fill="white" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#comp-mobile-dots)" />
            </svg>

            <div className="relative p-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] opacity-95 mb-1">
                Premium
              </p>
              <p className="text-3xl font-black tabular-nums mb-5">
                149 kr<span className="text-sm font-bold opacity-85"> /mån</span>
              </p>

              <ul className="space-y-2.5">
                {ROWS.map((row) => (
                  <li
                    key={row.label}
                    className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/15 last:border-b-0 last:pb-0"
                  >
                    <span className="text-sm font-bold opacity-95">
                      {row.label}
                    </span>
                    <Cell value={row.premium} variant="premium" />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Gratis-kort */}
          <div
            className="bg-white rounded-3xl border border-slate-200 p-6"
            style={{
              boxShadow: '0 8px 24px -12px rgba(0, 0, 0, 0.08)',
            }}
          >
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 mb-1">
              Gratis
            </p>
            <p className="text-3xl font-black text-slate-900 tabular-nums mb-5">
              0 kr
            </p>

            <ul className="space-y-2.5">
              {ROWS.map((row) => (
                <li
                  key={row.label}
                  className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 last:border-b-0 last:pb-0"
                >
                  <span className="text-sm font-bold text-slate-700">
                    {row.label}
                  </span>
                  <Cell value={row.free} variant="free" />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA under tabellen */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10"
        >
          <Link
            href="/trial-signup"
            data-cta="funktioner-comparison-primary"
            className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold text-base hover:scale-[1.02] active:scale-[0.99] transition-all touch-manipulation w-full sm:w-auto"
            style={{
              background:
                'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              boxShadow: '0 12px 28px -10px rgba(220, 38, 38, 0.45)',
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
            data-cta="funktioner-comparison-secondary"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-900 font-bold text-base border border-slate-200 hover:border-orange-300 hover:bg-orange-50/40 transition-all touch-manipulation w-full sm:w-auto"
          >
            Eller starta gratis
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
