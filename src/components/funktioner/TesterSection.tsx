'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Brain,
  Type,
  Calculator,
  Trophy,
  Clock,
  CheckCircle2,
} from 'lucide-react';

const CATEGORIES = [
  {
    icon: Brain,
    title: 'Matrislogik',
    description: 'Mönsterigenkänning, samma typ som SHL och Assessio.',
  },
  {
    icon: Type,
    title: 'Verbal förmåga',
    description: 'Läsförståelse och slutledning från text under tidspress.',
  },
  {
    icon: Calculator,
    title: 'Numerisk förmåga',
    description: 'Tabeller, diagram, räkneuppgifter på riktiga jobbnivåer.',
  },
];

// 3x3 matrisfråga: kvadrater + cirklar i alternerande mönster
type Cell = 'square' | 'circle' | 'triangle' | 'question';
const MATRIX: Cell[][] = [
  ['square', 'circle', 'triangle'],
  ['circle', 'triangle', 'square'],
  ['triangle', 'square', 'question'],
];

const ANSWERS: { shape: Cell; correct: boolean }[] = [
  { shape: 'square', correct: false },
  { shape: 'triangle', correct: false },
  { shape: 'circle', correct: true },
  { shape: 'square', correct: false },
];

function MatrixShape({ kind, size = 28 }: { kind: Cell; size?: number }) {
  const half = size / 2;
  const stroke = '#475569';
  const strokeWidth = 2.2;
  if (kind === 'square') {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <rect
          x={4}
          y={4}
          width={size - 8}
          height={size - 8}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="none"
          rx="2"
        />
      </svg>
    );
  }
  if (kind === 'circle') {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={half}
          cy={half}
          r={half - 4}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="none"
        />
      </svg>
    );
  }
  if (kind === 'triangle') {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <polygon
          points={`${half},4 ${size - 4},${size - 4} 4,${size - 4}`}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <span className="text-2xl font-black text-orange-600">?</span>
  );
}

export default function TesterSection() {
  return (
    <section
      id="tester"
      className="relative py-16 sm:py-20 lg:py-28 scroll-mt-20 bg-gradient-to-b from-orange-50/30 via-white to-white"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-14 items-start">
          {/* Vänster: text + kategorier */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
              <Trophy className="w-3.5 h-3.5" strokeWidth={2.5} />
              Rekryteringstester
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-4">
              Träna på samma tester som{' '}
              <span
                className="inline-block bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                }}
              >
                rekryterarna använder
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-7">
              De flesta större arbetsgivare kör ett begåvningstest innan de
              träffar dig. Sex testpaket, tre nivåer av varje, byggda på
              SHL- och Assessio-stil. Träna i din egen takt.
            </p>

            <div className="space-y-3">
              {CATEGORIES.map((cat, i) => (
                <motion.div
                  key={cat.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                  className="relative flex items-start gap-3 p-4 bg-white rounded-2xl border border-orange-100"
                  style={{
                    boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.12)',
                  }}
                >
                  <div
                    className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
                    style={{
                      background:
                        'linear-gradient(180deg, #F97316 0%, #DC2626 100%)',
                    }}
                    aria-hidden="true"
                  />

                  <div
                    className="ml-2 flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl"
                    style={{
                      background:
                        'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)',
                    }}
                  >
                    <cat.icon
                      className="w-5 h-5 text-orange-600"
                      strokeWidth={2.2}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-black text-slate-900 leading-tight mb-1">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-snug mb-2">
                      {cat.description}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] font-bold">
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"
                          aria-hidden="true"
                        />
                        Grund · Gratis
                      </span>
                      <span className="inline-flex items-center gap-1 text-orange-700">
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500"
                          aria-hidden="true"
                        />
                        Avancerad · Premium
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6">
              <Link
                href="/login?signup=true"
                data-cta="funktioner-tester"
                className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white font-bold text-sm hover:scale-[1.02] active:scale-[0.99] transition-all touch-manipulation"
                style={{
                  background:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                  boxShadow:
                    '0 8px 20px -8px rgba(220, 38, 38, 0.45)',
                }}
              >
                Börja träna gratis
                <ArrowRight
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={2.5}
                />
              </Link>
            </div>
          </motion.div>

          {/* Höger: matrisfråga-mockup */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            <div
              className="absolute -inset-3 rounded-3xl opacity-25 blur-2xl pointer-events-none"
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              }}
              aria-hidden="true"
            />

            <div
              className="relative bg-white rounded-3xl border border-orange-100 overflow-hidden"
              style={{
                boxShadow: '0 20px 40px -16px rgba(249, 115, 22, 0.22)',
              }}
            >
              {/* Header */}
              <div className="px-5 sm:px-6 py-4 border-b border-orange-100 bg-orange-50/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                    style={{
                      background:
                        'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                    }}
                  >
                    <Brain className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">
                      Matrislogik · Grundnivå
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Fråga 7 av 15
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-white border border-orange-200 text-orange-700 tabular-nums">
                  <Clock className="w-3 h-3" strokeWidth={2.5} />
                  12:34
                </div>
              </div>

              {/* Innehåll */}
              <div className="p-5 sm:p-6">
                <p className="text-sm font-bold text-slate-700 mb-4">
                  Vilken figur passar in på frågetecknets plats?
                </p>

                {/* 3x3 matris */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
                  {MATRIX.flat().map((cell, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-lg flex items-center justify-center ${
                        cell === 'question'
                          ? 'bg-orange-50 border-2 border-dashed border-orange-300'
                          : 'bg-slate-50 border border-slate-200'
                      }`}
                    >
                      <MatrixShape kind={cell} size={32} />
                    </div>
                  ))}
                </div>

                {/* Avskiljare */}
                <div className="flex items-center gap-2 my-4">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700">
                    Välj svar
                  </span>
                  <div className="flex-1 h-px bg-orange-100" />
                </div>

                {/* Svarsalternativ */}
                <div className="grid grid-cols-4 gap-2">
                  {ANSWERS.map((ans, i) => (
                    <motion.button
                      key={i}
                      type="button"
                      initial={{ opacity: 0, y: 6 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.3 + i * 0.06 }}
                      className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                        ans.correct
                          ? 'bg-emerald-50 border-2 border-emerald-300 ring-2 ring-emerald-100'
                          : 'bg-white border border-slate-200 hover:border-orange-200'
                      }`}
                    >
                      <MatrixShape kind={ans.shape} size={28} />
                      {ans.correct && (
                        <CheckCircle2
                          className="absolute mt-12 ml-12 w-4 h-4 text-emerald-600"
                          strokeWidth={3}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>

                {/* Footer-progress */}
                <div className="mt-5 pt-4 border-t border-orange-100 flex items-center justify-between gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '47%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full rounded-full"
                      style={{
                        background:
                          'linear-gradient(90deg, #F97316 0%, #DC2626 100%)',
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 tabular-nums">
                    7/15
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
