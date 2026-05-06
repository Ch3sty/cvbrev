'use client'

import { motion } from 'framer-motion'
import {
  IconCvBrev,
  IconLon,
  IconIntervju,
  IconArbetsratt,
  IconKarriarbyte,
  IconAkassa,
} from './illustrations/JobbcoachenIcons'

const AMNEN = [
  {
    Icon: IconCvBrev,
    title: 'CV och personligt brev',
    body:
      'Få feedback på en formulering, hjälp att skriva om en mening så den landar bättre, eller förslag på vad du saknar. Du kan dela ditt sparade CV direkt i samtalet.',
    examples: ['"Hur skriver jag min sammanfattning?"', '"Vad fattas i mitt CV?"'],
  },
  {
    Icon: IconLon,
    title: 'Marknadslön och löneförhandling',
    body:
      'Vi hämtar SCB:s officiella lönestatistik per yrke, region och erfarenhet. Du får siffror som faktiskt stämmer plus argument du kan luta dig mot i samtalet.',
    examples: ['"Vad tjänar en projektledare i Göteborg?"', '"Hur ber jag om mer?"'],
  },
  {
    Icon: IconIntervju,
    title: 'Intervjuförberedelse',
    body:
      'Träna svar på vanliga intervjufrågor, få hjälp att packa din erfarenhet i en historia och tips på vad du själv ska fråga. Bättre förberedd, mindre stressad.',
    examples: ['"Hur svarar jag på svagheter?"', '"Vad ska jag fråga om?"'],
  },
  {
    Icon: IconArbetsratt,
    title: 'Arbetsrätt och LAS',
    body:
      'Vi förklarar uppsägningstider, anställningsformer, semester, övertid och vad LAS säger om saklig grund. Källhänvisat så du vet vad lagen faktiskt står för.',
    examples: ['"Hur lång uppsägningstid har jag?"', '"Får chefen göra så?"'],
  },
  {
    Icon: IconKarriarbyte,
    title: 'Karriärbyte och utveckling',
    body:
      'Funderar du på att byta bransch, ta nästa kliv eller plugga vidare? Vi hjälper dig se vilka roller som ligger nära din erfarenhet och vilka kompetenser du behöver bygga.',
    examples: ['"Är det för sent att byta?"', '"Vilka roller passar min bakgrund?"'],
  },
  {
    Icon: IconAkassa,
    title: 'A-kassa, sjukdom och CSN',
    body:
      'Ersättningsregler, väntedagar, vad som gäller vid sjukskrivning och hur CSN funkar om du vill plugga om. Vi hänvisar till rätt myndighet när det behövs.',
    examples: ['"Hur funkar a-kassan?"', '"Får jag CSN som vuxen?"'],
  },
]

export default function JobbcoachenAmnen() {
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
            Vad du kan fråga om
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Sex områden vi kan{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              hjälpa dig med
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Karriärguiden är specialiserad på svensk arbetsmarknad. Allt
            från lönesnack till arbetsrätt, plus ett par grejer däremellan.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {AMNEN.map(({ Icon, title, body, examples }, idx) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: idx * 0.04 }}
              className="bg-white rounded-3xl border border-orange-100 p-5 sm:p-6 hover:border-orange-200 transition-colors flex flex-col"
              style={{
                boxShadow: '0 6px 24px -14px rgba(249, 115, 22, 0.16)',
              }}
            >
              <Icon className="w-14 h-14 mb-4" />
              <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight">
                {title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4 flex-1">
                {body}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {examples.map((ex) => (
                  <span
                    key={ex}
                    className="inline-block px-2.5 py-1 rounded-full bg-orange-50 border border-orange-100 text-[11px] font-medium text-orange-800"
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
