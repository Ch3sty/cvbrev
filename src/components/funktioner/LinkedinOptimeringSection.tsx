'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Linkedin,
  TrendingUp,
} from 'lucide-react';

const HIGHLIGHTS = [
  'Headline som ranger högre i sökresultat',
  'Om-mig-text byggd kring din kompetens',
  'Kompetenser optimerade för svenska rekryterare',
  'Konkreta råd för rekommendationer',
];

const SCORES = [
  { label: 'Profilstark', value: 65, delta: '+18' },
  { label: 'Sökbarhet', value: 78, delta: '+24' },
  { label: 'Kompetenser', value: 82, delta: '+12' },
];

export default function LinkedinOptimeringSection() {
  return (
    <section
      id="linkedin"
      className="relative py-16 sm:py-20 lg:py-28 scroll-mt-20 bg-white"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-14 items-center">
          {/* Vänster: text */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
              <Linkedin className="w-3.5 h-3.5" strokeWidth={2.5} />
              LinkedIn-optimering
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-4">
              Profilen som faktiskt{' '}
              <span
                className="inline-block bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                }}
              >
                hittas
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-7">
              Åtta av tio rekryterare söker kandidater via LinkedIn. Vi
              analyserar din profil sektion för sektion och ger konkreta
              förslag på hur du syns för både algoritmen och människan.
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
              href="/login?signup=true"
              data-cta="funktioner-linkedin"
              className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white font-bold text-sm hover:scale-[1.02] active:scale-[0.99] transition-all touch-manipulation"
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                boxShadow: '0 8px 20px -8px rgba(220, 38, 38, 0.45)',
              }}
            >
              Optimera din profil
              <ArrowRight
                className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                strokeWidth={2.5}
              />
            </Link>
          </motion.div>

          {/* Höger: profil-mockup + score-staplar */}
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
              {/* Profil-mockup */}
              <div className="relative">
                {/* Banner */}
                <div
                  className="h-24 sm:h-28 relative overflow-hidden"
                  style={{
                    background:
                      'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                  }}
                >
                  <svg
                    className="absolute inset-0 w-full h-full opacity-25"
                    aria-hidden="true"
                  >
                    <pattern
                      id="li-banner-dots"
                      x="0"
                      y="0"
                      width="20"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <circle cx="10" cy="10" r="0.8" fill="white" />
                    </pattern>
                    <rect
                      width="100%"
                      height="100%"
                      fill="url(#li-banner-dots)"
                    />
                  </svg>
                </div>

                {/* Avatar + headline */}
                <div className="px-5 sm:px-6 -mt-8 pb-5">
                  <div className="flex items-end gap-3 mb-3">
                    <div
                      className="w-16 h-16 rounded-full bg-white border-4 border-white flex items-center justify-center font-black text-orange-700 text-xl"
                      style={{
                        boxShadow:
                          '0 8px 20px -6px rgba(0, 0, 0, 0.18)',
                      }}
                    >
                      EM
                    </div>
                    <div className="pb-1 flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-900 leading-tight">
                        Emma M.
                      </p>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Stockholm, Sverige
                      </p>
                    </div>
                  </div>

                  <p className="text-sm font-bold text-slate-900 leading-snug mb-1">
                    Senior Projektledare med fokus på agil leverans
                  </p>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Bygger team som levererar i tid och inom budget. Specialist
                    på CI/CD, automation och Kubernetes-migration.
                  </p>
                </div>
              </div>

              {/* Score-staplar */}
              <div className="px-5 sm:px-6 py-5 border-t border-orange-100 bg-orange-50/40">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-3">
                  Din profil-analys
                </p>

                <div className="space-y-3">
                  {SCORES.map((score, i) => (
                    <div key={score.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-700">
                          {score.label}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 tabular-nums"
                          >
                            <TrendingUp
                              className="w-2.5 h-2.5"
                              strokeWidth={3}
                            />
                            {score.delta}
                          </span>
                          <span className="text-xs font-black text-slate-900 tabular-nums">
                            {score.value}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-white border border-orange-100 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${score.value}%` }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 1,
                            delay: 0.3 + i * 0.15,
                            ease: 'easeOut',
                          }}
                          className="h-full rounded-full"
                          style={{
                            background:
                              'linear-gradient(90deg, #F97316 0%, #DC2626 100%)',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Notering */}
                <div className="mt-4 pt-3 border-t border-orange-100 flex items-center gap-2 text-[11px] text-slate-600">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
                    aria-hidden="true"
                  />
                  4 konkreta förslag identifierade
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
