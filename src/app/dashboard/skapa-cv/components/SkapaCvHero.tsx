'use client'

import { motion } from 'framer-motion'
import { HeroSkapaCvIcon } from './illustrations/SkapaCvIcons'

export default function SkapaCvHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex items-center gap-4 sm:gap-5"
    >
      <div className="flex-shrink-0">
        <HeroSkapaCvIcon className="w-16 h-16 sm:w-20 sm:h-20" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 mb-1">
          Skapa CV
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
          Bygg ditt CV steg för steg
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1.5 leading-relaxed">
          Vi hjälper dig fylla i rätt information på rätt plats. Din
          förhandsvisning uppdateras live medan du skriver.
        </p>
      </div>
    </motion.section>
  )
}
