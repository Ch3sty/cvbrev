'use client'

import { motion } from 'framer-motion'
import {
  IconCV,
  IconAnalys,
  IconBrev,
  IconLinkedIn,
  IconJobbmatch,
  IconTester,
  IconCoach,
  IconMallar,
} from './illustrations/PriserIcons'
import { VAD_INGAR, VadIngarItem } from './priser-data'

const ICON_MAP: Record<
  VadIngarItem['iconKey'],
  ({ className }: { className?: string }) => React.ReactElement
> = {
  cv: IconCV,
  analys: IconAnalys,
  brev: IconBrev,
  linkedin: IconLinkedIn,
  jobbmatch: IconJobbmatch,
  tester: IconTester,
  coach: IconCoach,
  mallar: IconMallar,
}

export default function PriserVadIngar() {
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
            Allt i Premium
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Åtta verktyg.{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Ett ställe.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Hela jobbsökningsresan på en plattform. Bygg CV, skriv brev,
            optimera LinkedIn, hitta annonser och träna inför intervjuer.
          </p>
        </motion.div>

        {/* 2 kolumner mobil, 4 desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {VAD_INGAR.map((item, idx) => {
            const Icon = ICON_MAP[item.iconKey]
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: idx * 0.04 }}
                className="bg-white rounded-3xl border border-orange-100 p-4 sm:p-5 hover:border-orange-200 transition-colors"
                style={{
                  boxShadow:
                    '0 6px 24px -14px rgba(249, 115, 22, 0.16)',
                }}
              >
                <Icon className="w-12 h-12 sm:w-14 sm:h-14 mb-3" />
                <h3 className="text-sm sm:text-base font-black text-slate-900 mb-1.5 leading-tight">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                  {item.body}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
