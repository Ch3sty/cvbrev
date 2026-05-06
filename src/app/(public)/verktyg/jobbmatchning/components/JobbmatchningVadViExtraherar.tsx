'use client'

import { motion } from 'framer-motion'
import {
  IconYrke,
  IconKompetens,
  IconUtbildning,
  IconPlats,
  IconSprak,
  IconErfarenhet,
} from './illustrations/JobbmatchningIcons'

const DATAPOINTS = [
  {
    Icon: IconYrke,
    title: 'Yrkesroller',
    body:
      'Vi normaliserar dina tidigare titlar mot JobTech Taxonomy som är den officiella svenska yrkesklassificeringen. Det betyder att vi förstår att "frontend-utvecklare" och "webbutvecklare" är liknande roller.',
  },
  {
    Icon: IconKompetens,
    title: 'Kompetenser',
    body:
      'Tekniska och mjuka kompetenser från ditt CV, från specifika program till erfarenhetsområden. Dessa matchas mot kraven i varje jobbannons.',
  },
  {
    Icon: IconUtbildning,
    title: 'Utbildning',
    body:
      'Examensnivå och inriktning. Vissa tjänster kräver specifik utbildning, andra meriterar utbildningsbakgrunder. Vi tar hänsyn till båda.',
  },
  {
    Icon: IconPlats,
    title: 'Plats',
    body:
      'Vi vet var du bor och kan filtrera bort jobb som ligger orimligt långt bort. Du kan själv ställa in radien från 5 km upp till hela Sverige.',
  },
  {
    Icon: IconSprak,
    title: 'Språk',
    body:
      'Vilka språk du behärskar och på vilken nivå. Viktigt för internationella roller och tjänster där svenska är ett krav.',
  },
  {
    Icon: IconErfarenhet,
    title: 'Erfarenhetsnivå',
    body:
      'Antal år inom branschen och senioritet. Vi matchar inte juniorer mot exekutivroller eller seniorer mot trainee-tjänster.',
  },
]

export default function JobbmatchningVadViExtraherar() {
  return (
    <section className="relative py-16 sm:py-24 bg-orange-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white text-orange-700 border border-orange-200 mb-4">
            Vad vi läser ut
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Sex datapunkter{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              ur ditt CV
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Du behöver inte fylla i något manuellt. Vi extraherar allt vi
            behöver för att hitta rätt matchningar direkt från ditt CV.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {DATAPOINTS.map(({ Icon, title, body }, idx) => (
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
