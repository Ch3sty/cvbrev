'use client'

import { motion } from 'framer-motion'
import {
  IconSvenskaKallor,
  IconGDPR,
  IconSvenskTon,
  IconUppdaterat,
} from './illustrations/OmOssIcons'

const PUNKTER = [
  {
    Icon: IconSvenskaKallor,
    title: 'Svenska källor',
    body:
      'Arbetsförmedlingen, SCB, fackförbund, Försäkringskassan, CSN och Skatteverket. Inte amerikansk data översatt till svenska.',
  },
  {
    Icon: IconGDPR,
    title: 'GDPR från grunden',
    body:
      'Data ligger i EU. Vi delar aldrig dina dokument med tredje part och du kan radera ditt konto när du vill.',
  },
  {
    Icon: IconSvenskTon,
    title: 'Svensk ton',
    body:
      'Verktygen pratar som en svensk kollega, inte som en amerikansk LinkedIn-coach. Mindre buzzwords, mer raka besked.',
  },
  {
    Icon: IconUppdaterat,
    title: 'Snabba uppdateringar',
    body:
      'När SCB släpper ny lönestatistik eller Arbetsförmedlingen ändrar regler märks det i verktyget inom dagar, inte månader.',
  },
]

export default function OmOssForSverige() {
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
            Byggt för Sverige
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Anpassat för{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              svensk arbetsmarknad
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Vi har medvetet valt bort den globala genvägen. Det här är vad
            som gör skillnaden i praktiken.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {PUNKTER.map(({ Icon, title, body }, idx) => (
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
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2 leading-tight">
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
