'use client'

/**
 * "Allt i Premium": åtta verktyg i ett rutnät (A7 i docs/plan-konvertering.md).
 *
 * Designsystemet: vita kort med border och ingen skugga, rounded-xl,
 * font-semibold som tyngst, ingen gradientrubrik och ingen fylld orange yta.
 * Ikonerna bär accenten, bakgrunden är neutral.
 */

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
  (props: { className?: string; size?: number }) => React.ReactElement
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
    <section className="py-12 sm:py-16 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 mb-2">
            Åtta verktyg, ett ställe
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-2xl">
            Hela jobbsökningsresan på en plattform. Bygg CV, skriv brev,
            optimera LinkedIn, hitta annonser och träna inför intervjuer.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {VAD_INGAR.map((item, idx) => {
            const Icon = ICON_MAP[item.iconKey]
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.2, ease: 'easeOut', delay: idx * 0.03 }}
                className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 hover:border-neutral-300 transition-colors"
              >
                <Icon className="mb-3 text-neutral-900" size={48} />
                <h3 className="text-base font-semibold text-neutral-900 mb-1 leading-snug">
                  {item.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
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
