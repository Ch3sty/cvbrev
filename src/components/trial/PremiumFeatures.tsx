'use client'

// src/components/trial/PremiumFeatures.tsx
// Visar premium-features med maskot för trial-signup

import Image from 'next/image'
import { CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PremiumFeatures() {
  const features = [
    {
      title: 'Obegränsade professionella CV:n',
      description: 'Skapa så många CV som du behöver'
    },
    {
      title: 'AI-genererade personliga brev',
      description: 'För varje ansökan du gör'
    },
    {
      title: '12 exklusiva premiummallar',
      description: 'Designer som sticker ut'
    },
    {
      title: 'ATS-optimering',
      description: 'Bättre träffar i rekryteringssystem'
    },
    {
      title: 'XP-system med badges',
      description: 'Samla achievements medan du söker jobb'
    },
    {
      title: 'Avancerad statistik',
      description: 'Följ din jobbsökningsresa'
    },
    {
      title: 'Prioriterad support',
      description: 'Få hjälp när du behöver det'
    },
    {
      title: 'Avsluta när som helst',
      description: 'Ingen bindningstid'
    }
  ]

  return (
    <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-6 lg:p-8 sticky top-8">
      {/* Maskot */}
      <div className="flex justify-center mb-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-30 animate-pulse" />
          <Image
            src="/images/maskot/premium.svg"
            alt="Premium maskot"
            width={120}
            height={120}
            className="relative z-10"
          />
        </motion.div>
      </div>

      {/* Rubrik */}
      <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Premium i 7 dagar
      </h2>
      <p className="text-center text-slate-600 mb-4">
        Helt gratis, ingen bindningstid
      </p>

      {/* Pris-card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 mb-6 text-white">
        <div className="flex items-baseline justify-center gap-2 mb-1">
          <span className="text-4xl font-bold">0 kr</span>
          <span className="text-lg opacity-90">idag</span>
        </div>
        <p className="text-center text-sm opacity-90">
          Sedan 149 kr/månad
        </p>
      </div>

      {/* Features lista */}
      <div className="space-y-3">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900 text-sm">
                {feature.title}
              </p>
              <p className="text-xs text-slate-600">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trust badges */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            GDPR-säker
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            SSL-krypterad
          </span>
        </div>
      </div>
    </div>
  )
}
