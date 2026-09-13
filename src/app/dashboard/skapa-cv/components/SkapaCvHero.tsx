'use client'

import { motion } from 'framer-motion'
import { HeroSkapaCvIcon } from './illustrations/SkapaCvIcons'

export default function SkapaCvHero() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex items-center gap-4 sm:gap-5"
    >
      <div className="flex-shrink-0">
        <HeroSkapaCvIcon className="w-16 h-16 sm:w-20 sm:h-20" />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 mb-1">
          Skapa CV
        </div>
        {/* Rubriknivån ligger hos FlowShell, som redan sätter flödets h1
            ("Bygg ditt CV") i toppraden. Två h1 på samma sida gör att
            skärmläsare får två motstridiga svar på vad sidan handlar om. */}
        <p className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight leading-tight">
          Bygg ditt CV steg för steg
        </p>
        <p className="text-sm sm:text-base text-neutral-600 mt-1.5 leading-relaxed">
          Vi hjälper dig fylla i rätt information på rätt plats. Din
          förhandsvisning uppdateras live medan du skriver.
        </p>
      </div>
    </motion.section>
  )
}
