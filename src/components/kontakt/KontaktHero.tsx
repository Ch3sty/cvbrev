/**
 * Fil: src/components/kontakt/KontaktHero.tsx
 *
 * Beskrivning:
 * Hero-sektion för kontaktsidan med animerade gradient-orbs och responsiv text.
 * Används endast på den offentliga kontaktsidan.
 */
'use client'

import { motion } from 'framer-motion'

export default function KontaktHero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 text-center overflow-hidden bg-gradient-to-b from-white to-slate-50/50">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-br from-indigo-400/20 to-cyan-400/20 rounded-full mix-blend-multiply filter blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />

      <div className="container relative px-4 sm:px-6 lg:px-8 mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Rubrik - mobil-anpassad */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-4 sm:mb-6 leading-tight">
            <span className="hidden sm:inline">Vi svarar på dina frågor</span>
            <span className="sm:hidden">Kontakta oss</span>
          </h1>

          {/* Ingress - responsiv */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed">
            <span className="hidden sm:block">
              Välj rätt e-postadress nedan eller skicka ett meddelande via formuläret.
            </span>
            <span className="sm:hidden">
              Skicka ett meddelande eller välj rätt e-post nedan.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
