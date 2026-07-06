'use client'

import { motion } from 'framer-motion'
import {
  BadgeCheck,
  Users,
  SlidersHorizontal,
  MailCheck,
} from 'lucide-react'

/**
 * Fyra värdeprops i vita kort med orange kant — samma kortstil som
 * "Så funkar det"-korten på verktygssidorna.
 */
const PROPS = [
  {
    Icon: BadgeCheck,
    title: 'Verifierade färdigheter',
    body: 'Percentiler på kognitiva tester och kartlagda personlighetsstyrkor på varje kandidat. Du jämför bevisad förmåga, inte formuleringskonst i ett CV.',
  },
  {
    Icon: Users,
    title: 'Aktiva kandidater',
    body: 'Alla i poolen är arbetssökande som själva valt att synas. Inga passiva profiler som aldrig svarar, bara människor som letar nästa jobb just nu.',
  },
  {
    Icon: SlidersHorizontal,
    title: 'Träffsäkra filter',
    body: 'Filtrera på tillträde, arbetsplats, region, körkort och percentilgolv. Du slipper mismatch-kontakterna redan innan du hör av dig.',
  },
  {
    Icon: MailCheck,
    title: 'Högre svarsfrekvens',
    body: 'Anonym först: kandidaten har redan sagt ja till att bli kontaktad. När du visar intresse landar det hos någon som väntar på det, inte i en full inkorg.',
  },
]

export default function RekryterareVardeprops() {
  return (
    <section className="relative py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sektion-header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
            Därför funkar det
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Mindre gissning,
            <br className="hidden sm:block" />{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              mer träff
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Ett CV berättar vad någon säger sig kunna. Vi visar vad kandidaten
            har bevisat, och att hen faktiskt vill bli kontaktad.
          </p>
        </motion.div>

        {/* Kort-grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {PROPS.map(({ Icon, title, body }, idx) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="relative bg-white rounded-3xl border border-orange-100 p-6 sm:p-7 hover:border-orange-200 transition-colors"
              style={{
                boxShadow: '0 8px 32px -16px rgba(249, 115, 22, 0.18)',
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-5"
                style={{
                  background:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                  boxShadow: '0 8px 18px -6px rgba(220, 38, 38, 0.35)',
                }}
              >
                <Icon className="w-6 h-6" strokeWidth={2.2} />
              </div>

              <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2 leading-tight">
                {title}
              </h3>
              <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
                {body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
