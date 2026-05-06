'use client'

import { motion } from 'framer-motion'
import {
  IconTusentals,
  IconProcent,
  IconDistans,
  IconUppdaterad,
  IconRelevans,
  IconAllaBranscher,
} from './illustrations/JobbmatchningIcons'

const FEATURES = [
  {
    Icon: IconTusentals,
    title: 'Tusentals lediga jobb',
    body:
      'Direkt åtkomst till hela Arbetsförmedlingens databas. Sveriges största samling av lediga tjänster, från offentlig sektor till privata bolag.',
  },
  {
    Icon: IconProcent,
    title: 'Matchnings-procent per annons',
    body:
      'Varje jobb får en siffra mellan 0 och 100 som visar hur väl just ditt CV svarar mot kraven. Slipp gissa, se direkt vad du har störst chans till.',
  },
  {
    Icon: IconDistans,
    title: 'Filtrera på distans',
    body:
      'Sätt en radie från 5 km till hela Sverige. Du kan välja om du vill pendla eller hålla dig nära hemma.',
  },
  {
    Icon: IconUppdaterad,
    title: 'Uppdaterat dagligen',
    body:
      'Nya jobb dyker upp i din feed inom timmar efter att de publicerats. Tillsatta tjänster försvinner automatiskt.',
  },
  {
    Icon: IconRelevans,
    title: 'Sortering på relevans',
    body:
      'Toppmatchningarna hamnar överst. Du slipper scrolla genom hundratals oranga annonser för att hitta de få som faktiskt passar dig.',
  },
  {
    Icon: IconAllaBranscher,
    title: 'Funkar för alla branscher',
    body:
      'Vården, tech, ekonomi, utbildning, service. Vår matchning är yrkesneutral och bygger på den officiella svenska yrkesklassificeringen.',
  },
]

export default function JobbmatchningVadDuFar() {
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
            Sex anledningar att{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              söka jobb hos oss
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Vi har byggt jobbmatchningen för att spara dig tid och visa dig
            tjänster du faktiskt har chans att få.
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
