'use client'

import { motion } from 'framer-motion'
import StaticCandidateCard, {
  type StaticCandidateData,
} from './StaticCandidateCard'

/**
 * Två statiska, avidentifierade träffkort så produkten känns konkret.
 * Kortstilen är kopierad från kandidatens förhandsvisning i Bli upptäckt.
 */
const EXAMPLES: StaticCandidateData[] = [
  {
    role: 'Frontendutvecklare',
    region: 'Göteborg',
    testBadges: ['Matrislogik · topp 5 %', 'Verbalt · topp 20 %'],
    strengths: ['Nyfiken', 'Samarbetsinriktad'],
    skills: ['React', 'TypeScript', 'Tillgänglighet'],
    conditions: ['3 månader', 'Distans/Hybrid', 'Heltid'],
  },
  {
    role: 'Kundtjänstchef',
    region: 'Malmö',
    testBadges: ['Verbalt · topp 10 %', 'Numeriskt · topp 25 %'],
    strengths: ['Lugn under press', 'Coachande'],
    skills: ['Teamledning', 'Zendesk', 'NPS-arbete'],
    conditions: ['1 månad', 'På plats', 'Heltid', 'B-körkort'],
  },
]

export default function RekryterareExempel() {
  return (
    <section className="relative py-16 sm:py-24 bg-white overflow-hidden">
      {/* Soft bakgrunds-glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(249, 115, 22, 0.06) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sektion-header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
            Träffkorten
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Så ser en träff ut
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Allt du behöver för ett första beslut på ett kort: verifierade
            testresultat, styrkor, kompetenser och villkor. Identiteten
            skyddas tills kandidaten tackar ja.
          </p>
        </motion.div>

        {/* Kort-grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 max-w-4xl mx-auto">
          {EXAMPLES.map((candidate, idx) => (
            <motion.div
              key={candidate.role}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <StaticCandidateCard candidate={candidate} />
            </motion.div>
          ))}
        </div>

        <p className="text-center text-[13px] text-slate-500 mt-6">
          Exempelprofiler. Kandidaterna i poolen är verkliga arbetssökande som
          själva valt att synas.
        </p>
      </div>
    </section>
  )
}
