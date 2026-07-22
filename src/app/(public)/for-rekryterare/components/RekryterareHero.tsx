'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, ShieldCheck } from 'lucide-react'
import StaticCandidateCard, {
  type StaticCandidateData,
} from './StaticCandidateCard'

/**
 * Hero för /for-rekryterare: beta-badge + rubrik med gradient-nyckelord +
 * subtitle + CTA:er. På desktop ligger ett exempelkort ur poolen till höger,
 * på mobil staplas det under texten.
 */
const HERO_CANDIDATE: StaticCandidateData = {
  role: 'Redovisningsekonom',
  region: 'Stockholm',
  seniorityFacts: ['8 års erfarenhet', 'Senast: Redovisningsansvarig (4 år)', 'Civilekonom'],
  pitch: 'Redovisningsekonom med åtta år i byggbranschen. Trivs bäst där struktur saknas och behöver byggas upp.',
  testBadges: ['Matrislogik · Expertnivå · topp 10 %', 'Numeriskt · topp 15 %'],
  strengths: ['Strukturerad', 'Analytisk'],
  skills: ['Bokslut', 'Koncernredovisning', 'Fortnox'],
  contextTags: ['Analytiskt djuparbete'],
  workStyle: {
    spectra: [
      { key: 'c2_orderliness', leftLabel: 'Improviserar och anpassar', rightLabel: 'Planerar och strukturerar', band: 5 },
      { key: 'e2_gregariousness', leftLabel: 'Får energi av eget fokusarbete', rightLabel: 'Får energi av samarbete i grupp', band: 2 },
    ],
    thrivesWhen: 'processer är tydliga och kvalitet hinner göras rätt',
  },
  conditions: ['Omgående', 'Hybrid/På plats', 'Heltid', 'B-körkort'],
}

export default function RekryterareHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Topp-glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(249, 115, 22, 0.12) 0%, transparent 65%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-16 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-12 items-center">
          {/* Vänster: hero-text */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center lg:text-left"
          >
            {/* Eyebrow med beta-badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #F97316, #DC2626)',
                }}
              />
              För rekryterare · Tidig åtkomst
            </div>

            {/* Rubrik */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.05] tracking-tight mb-5">
              Kandidater med{' '}
              <span
                style={{
                  background:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                bevisade färdigheter
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              Sök på kravprofilen och få relevansrankade träffar med verifierade
              testresultat per nivå och en arbetsstilsrapport ur 120 frågor.
              Varje kandidat har själv valt att synas, så de som svarar är
              faktiskt intresserade.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-3 lg:justify-start justify-center">
              <Link
                href="/rekryterare/registrera"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-white font-bold text-base shadow-lg w-full sm:w-auto min-h-[52px] hover:shadow-xl active:scale-[0.98] transition-all"
                style={{
                  background:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                  boxShadow: '0 12px 32px -10px rgba(220, 38, 38, 0.45)',
                }}
              >
                Skapa rekryterarkonto
                <ArrowRight
                  className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={2.5}
                />
              </Link>
              <Link
                href="#sa-funkar-det"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-orange-700 font-bold text-sm hover:text-orange-800 transition-colors"
              >
                Så funkar det
              </Link>
            </div>

            {/* Trust micro-copy */}
            <div className="mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1.5 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck
                  className="w-3.5 h-3.5 text-orange-500"
                  strokeWidth={2.5}
                />
                Kostnadsfritt under lanseringen
              </span>
              <span className="hidden sm:inline text-slate-300">·</span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck
                  className="w-3.5 h-3.5 text-orange-500"
                  strokeWidth={2.5}
                />
                GDPR-först
              </span>
              <span className="hidden sm:inline text-slate-300">·</span>
              <span>Ingen bindningstid</span>
            </div>
          </motion.div>

          {/* Höger: exempelkort ur poolen */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
            className="relative max-w-md mx-auto w-full lg:max-w-none"
          >
            <div
              className="rounded-3xl border border-orange-100 bg-white/70 backdrop-blur-sm p-4 sm:p-6"
              style={{
                boxShadow: '0 24px 60px -24px rgba(249, 115, 22, 0.25)',
              }}
            >
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-700 mb-3 px-1">
                Exempel ur poolen
              </div>
              <StaticCandidateCard candidate={HERO_CANDIDATE} />
              <p className="text-[12px] text-slate-500 leading-relaxed mt-3 px-1">
                Avidentifierad tills kandidaten tackar ja till kontakt.
                Testresultaten är verifierade av oss.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
