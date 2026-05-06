'use client'

import { motion } from 'framer-motion'
import {
  IconArbetsformedlingen,
  IconScb,
  IconFack,
  IconForsakring,
  IconCsn,
  IconSkatteverket,
} from './illustrations/JobbcoachenIcons'

const KALLOR = [
  {
    Icon: IconArbetsformedlingen,
    namn: 'Arbetsförmedlingen',
    body:
      'Officiella regler för arbetslöshet, etableringsstöd, jobbsökarverksamhet och stödformer. Karriärguiden hänvisar till AF när frågan rör myndighetsregler eller stöd.',
  },
  {
    Icon: IconScb,
    namn: 'SCB',
    body:
      'Lönestatistik per yrke, region och erfarenhet plus arbetsmarknadsdata. När du frågar om marknadslön är det SCB:s lönestrukturstatistik som ligger till grund.',
  },
  {
    Icon: IconFack,
    namn: 'Fackförbund',
    body:
      'Kollektivavtal och stödfunktioner från Unionen, Kommunal, IF Metall, Vision och fler. Bra när frågan rör avtalsenliga villkor eller branschspecifika regler.',
  },
  {
    Icon: IconForsakring,
    namn: 'Försäkringskassan',
    body:
      'Sjukpenning, föräldraledighet, sjukskrivningsregler och ersättningar. Vi hänvisar dit när frågan rör socialförsäkring och vad du har rätt till.',
  },
  {
    Icon: IconCsn,
    namn: 'CSN',
    body:
      'Studielån, omställningsstudiestöd och regler för att plugga om som vuxen. Användbart när du funderar på vidareutbildning eller karriärbyte.',
  },
  {
    Icon: IconSkatteverket,
    namn: 'Skatteverket',
    body:
      'Skatteregler för anställning, eget företag, traktamente och förmåner. Karriärguiden hänvisar dit när lönen pratas i nettotermer eller när du jämför anställningsformer.',
  },
]

export default function JobbcoachenKallor() {
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
            Källorna bakom svaren
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Verifierad svensk{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              arbetsmarknadsdata
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Inga blogginlägg, inga forumtrådar. Karriärguiden hämtar svar
            från sex pålitliga källor och citerar exakt var informationen
            kommer ifrån.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {KALLOR.map(({ Icon, namn, body }, idx) => (
            <motion.div
              key={namn}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: idx * 0.04 }}
              className="flex gap-4 p-5 sm:p-6 rounded-3xl bg-white border border-orange-100 hover:border-orange-200 transition-colors"
              style={{
                boxShadow: '0 6px 24px -14px rgba(249, 115, 22, 0.16)',
              }}
            >
              <Icon className="w-14 h-14 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-base font-black text-slate-900 mb-1.5">
                  {namn}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
