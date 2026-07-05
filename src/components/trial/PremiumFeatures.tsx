'use client'

// src/components/trial/PremiumFeatures.tsx
// Sidopanel som visar vad som ingar i Premium under trial-signup.
// Stil: orange/rod-DNA matchande resten av plattformen.

import { motion } from 'framer-motion'
import { ShieldCheck, Crown } from 'lucide-react'

const FEATURES = [
  {
    title: 'Obegränsade personliga brev',
    description: 'Skriv så många brev du behöver, utan daglig gräns',
  },
  {
    title: 'Obegränsade CV-analyser',
    description: 'ATS-poäng och förbättringsförslag på varje version',
  },
  {
    title: 'Alla 42 CV-mallar',
    description: 'Från klassisk till executive, välj efter bransch',
  },
  {
    title: 'Smart-anpassad ton',
    description: 'Vi läser CV och annons och matchar tonen automatiskt',
  },
  {
    title: 'Obegränsade rekryteringstester',
    description: 'Träna inför skarpt läge på avancerad nivå, utan dagsgräns',
  },
  {
    title: 'Helt obegränsad jobbmatchning',
    description: 'Procentuell träffsäkerhet mot alla annonser',
  },
  {
    title: 'Spara allt utan tak',
    description: 'Bygg ditt eget bibliotek av brev, CV och analyser',
  },
  {
    title: 'Avsluta när som helst',
    description: 'Ingen bindningstid, inga uppsägningstider',
  },
]

export default function PremiumFeatures() {
  return (
    <div
      className="rounded-3xl bg-white border border-orange-100 p-6 sm:p-7 lg:sticky lg:top-6"
      style={{
        boxShadow: '0 8px 32px -16px rgba(249, 115, 22, 0.18)',
      }}
    >
      {/* Pris-kort overst */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl p-5 mb-6 text-white relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        }}
      >
        <div
          aria-hidden="true"
          className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/10 blur-2xl pointer-events-none"
        />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-[10px] font-black uppercase tracking-wider mb-3">
            <Crown className="w-3 h-3" strokeWidth={2.5} />
            Premium i 7 dagar
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl sm:text-5xl font-black leading-none">0 kr</span>
            <span className="text-base text-white/85">idag</span>
          </div>
          <p className="text-xs sm:text-sm text-white/85">
            Sedan 149 kr/månad. Avsluta innan dag åtta och du betalar inget.
          </p>
        </div>
      </motion.div>

      {/* Features */}
      <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-4">
        Allt detta får du
      </h3>
      <ul className="space-y-3">
        {FEATURES.map((feature, idx) => (
          <motion.li
            key={feature.title}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.04 }}
            className="flex items-start gap-3"
          >
            <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #F97316, #DC2626)',
              }}
            >
              <svg
                viewBox="0 0 16 16"
                className="w-3 h-3"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M3.5 8.5 L6.5 11.5 L12.5 5"
                  stroke="white"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900 leading-snug">
                {feature.title}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                {feature.description}
              </p>
            </div>
          </motion.li>
        ))}
      </ul>

      {/* Trust badges */}
      <div className="mt-6 pt-5 border-t border-orange-50 flex items-center justify-center gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5 font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-orange-600" strokeWidth={2.5} />
          GDPR-säker
        </span>
        <span className="inline-flex items-center gap-1.5 font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-orange-600" strokeWidth={2.5} />
          Data i EU
        </span>
      </div>
    </div>
  )
}
