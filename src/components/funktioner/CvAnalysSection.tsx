'use client';

import Link from 'next/link';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  FileSearch,
  Tag,
  TrendingUp,
  Calculator,
} from 'lucide-react';

const HIGHLIGHTS = [
  'ATS-score som visar exakt var du står',
  'Konkreta förbättringar med +X poäng per åtgärd',
  'Nyckelord som saknas, identifierade åt dig',
  'Före/efter-jämförelse innan du sparar',
];

const IMPROVEMENTS = [
  {
    title: 'Lägg till mätbara resultat',
    description:
      'Erfarenhetspunkter med siffror får 3x högre genomslag hos rekryterare.',
    impact: 12,
    tags: [
      { icon: Tag, label: '3 nyckelord saknas' },
      { icon: Calculator, label: 'Behöver siffror' },
    ],
  },
  {
    title: 'Förbättra profiltexten',
    description:
      'Sammanfattningen är för generisk. Vi föreslår en variant som matchar tjänstens krav.',
    impact: 8,
    tags: [{ icon: Tag, label: '2 nyckelord saknas' }],
  },
  {
    title: 'Optimera erfarenhetsbeskrivningar',
    description:
      'Korta meningar med starka verb prioriteras av ATS-systemen.',
    impact: 6,
    tags: [{ icon: TrendingUp, label: 'Hög prioritet' }],
  },
];

export default function CvAnalysSection() {
  return (
    <section
      id="cv-analys"
      className="relative py-16 sm:py-20 lg:py-28 scroll-mt-20 bg-gradient-to-b from-white via-orange-50/30 to-white"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-center">
          {/* Vänster: text */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
              <FileSearch className="w-3.5 h-3.5" strokeWidth={2.5} />
              CV-analys
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-4">
              En analys som faktiskt{' '}
              <span
                className="inline-block bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                }}
              >
                säger något
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
              Vi granskar ditt CV mot de ATS-system svenska rekryterare
              använder och ger en tydlig poäng plus konkreta förslag, så att du
              vet exakt vad som ska ändras innan du skickar.
            </p>

            <ul className="space-y-2.5 mb-7">
              {HIGHLIGHTS.map((h) => (
                <li
                  key={h}
                  className="flex items-start gap-2.5 text-sm text-slate-700"
                >
                  <CheckCircle2
                    className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0"
                    strokeWidth={2.5}
                  />
                  {h}
                </li>
              ))}
            </ul>

            <Link
              href="/cv-exempel"
              className="inline-flex items-center gap-1.5 text-orange-700 hover:text-orange-800 font-bold text-sm group"
            >
              Bläddra CV-exempel
              <ArrowRight
                className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
                strokeWidth={2.5}
              />
            </Link>
          </motion.div>

          {/* Höger: ATS-score-cirkel + ImprovementCards */}
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
              className="relative bg-white rounded-3xl border border-orange-100 overflow-hidden p-5 sm:p-6 space-y-3"
              style={{
                boxShadow: '0 20px 40px -16px rgba(249, 115, 22, 0.22)',
              }}
            >
              {/* Score-kort med animerad cirkel */}
              <ScoreCard from={68} to={94} />

              {/* Improvement-cards */}
              {IMPROVEMENTS.map((imp, i) => (
                <motion.div
                  key={imp.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-xl border-2 border-emerald-200 bg-emerald-50/40"
                >
                  <div
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                    style={{
                      background:
                        'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    }}
                  >
                    <CheckCircle2
                      className="w-3.5 h-3.5 text-white"
                      strokeWidth={3}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm font-black text-slate-900 leading-tight">
                        {imp.title}
                      </h3>
                      <span
                        className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black text-white tabular-nums"
                        style={{
                          background:
                            'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                          boxShadow:
                            '0 3px 8px -2px rgba(16, 185, 129, 0.4)',
                        }}
                      >
                        +{imp.impact} ATS
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug mb-2">
                      {imp.description}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {imp.tags.map((tag) => (
                        <span
                          key={tag.label}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-white border border-orange-200 text-orange-700"
                        >
                          <tag.icon
                            className="w-2.5 h-2.5"
                            strokeWidth={2.5}
                          />
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Footer */}
              <div
                className="flex items-center justify-between rounded-xl p-3 text-white"
                style={{
                  background:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                }}
              >
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">
                  Total potential
                </span>
                <span className="text-base font-black tabular-nums">
                  +26 ATS-poäng
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ScoreCard({ from, to }: { from: number; to: number }) {
  const [score, setScore] = useState(from);
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const motionValue = useMotionValue(from);
  const rounded = useTransform(motionValue, (v) => Math.round(v));

  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => setScore(v));
    return unsubscribe;
  }, [rounded]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      onViewportEnter={() => {
        animate(motionValue, to, { duration: 1.6, ease: 'easeOut' });
      }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-4 p-4 rounded-xl bg-orange-50/60 border border-orange-100"
    >
      <div className="relative flex-shrink-0">
        <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
          <circle
            cx="36"
            cy="36"
            r={radius}
            stroke="#FED7AA"
            strokeWidth="6"
            fill="none"
          />
          <circle
            cx="36"
            cy="36"
            r={radius}
            stroke="url(#score-gradient)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            transform="rotate(-90 36 36)"
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
          <defs>
            <linearGradient
              id="score-gradient"
              x1="0"
              y1="0"
              x2="72"
              y2="72"
            >
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#BE185D" />
            </linearGradient>
          </defs>
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center text-base font-black text-slate-900 tabular-nums"
          aria-live="polite"
        >
          {score}%
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-1">
          Din ATS-score
        </p>
        <p className="text-sm font-black text-slate-900 leading-tight mb-0.5">
          Stark, men kan bli starkare
        </p>
        <p className="text-[11px] text-slate-600">
          Tre konkreta förbättringar identifierade
        </p>
      </div>
    </motion.div>
  );
}
