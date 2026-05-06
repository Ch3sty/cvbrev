'use client'

import { motion } from 'framer-motion'
import {
  IconATSSakra,
  IconExport,
  IconFoto,
  IconLinkedInFeature,
  IconEdit,
  IconMobil,
} from './illustrations/CVMallarIcons'

const FEATURES = [
  {
    Icon: IconATSSakra,
    title: 'ATS-säkra mallar',
    body:
      'Alla våra mallar är skrivna med svenska Applicant Tracking Systems i åtanke. Rena rubriker, vanlig text, ingen formattering som förvirrar maskinen.',
  },
  {
    Icon: IconExport,
    title: 'PDF och Word',
    body:
      'Ladda ner ditt CV i båda formaten. PDF för dom flesta ansökningar, Word om annonsen frågar efter ett editerbart format.',
  },
  {
    Icon: IconFoto,
    title: 'Fotosupport där det passar',
    body:
      'Vissa premium-mallar stödjer profilbild. Bra för branscher där en mänsklig touch räknas, som vård, utbildning och service.',
  },
  {
    Icon: IconLinkedInFeature,
    title: 'LinkedIn-integration',
    body:
      'I premium-mallar kan du visa din LinkedIn-knapp tydligt. Hjälper rekryterare att enkelt verifiera dina meriter.',
  },
  {
    Icon: IconEdit,
    title: 'Redigera när du vill',
    body:
      'Allt sparas i ditt konto. Du kan komma tillbaka, uppdatera ett jobbyte eller byta mall utan att behöva börja om.',
  },
  {
    Icon: IconMobil,
    title: 'Funkar på mobil',
    body:
      'Hela byggprocessen är mobile-first. Börja på telefonen i bussen, fortsätt hemma framför datorn. Lika smidigt på alla enheter.',
  },
]

export default function CVMallarVadDuFar() {
  return (
    <section className="relative py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
            Vad du får
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Mer än bara{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              en snygg layout
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Varje mall är byggd för att hjälpa dig genom hela ansökan, inte
            bara förgyllla en sida.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {FEATURES.map(({ Icon, title, body }, idx) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: idx * 0.04 }}
              className="bg-white rounded-3xl border border-orange-100 p-5 sm:p-6 hover:border-orange-200 transition-colors"
              style={{
                boxShadow: '0 6px 24px -14px rgba(249, 115, 22, 0.16)',
              }}
            >
              <Icon className="w-14 h-14 mb-4" />
              <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight">
                {title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
