'use client'

import { motion } from 'framer-motion'
import {
  IconMonster,
  IconLogik,
  IconLasforstaelse,
  IconKritiskt,
  IconSnabbrakning,
  IconTabell,
} from './illustrations/RekryteringstesterIcons'

const FARDIGHETER = [
  {
    Icon: IconMonster,
    title: 'Mönsterigenkänning',
    body:
      'Hitta progressioner, rotationer och set-operationer i abstrakta former. Den färdighet matrislogik mäter och som tränas upp tydligt med repetition.',
  },
  {
    Icon: IconLogik,
    title: 'Logiskt tänkande',
    body:
      'Dra slutsatser från regler du själv identifierat. Rekryteringstester premierar den som tänker steg för steg, inte den som chansar.',
  },
  {
    Icon: IconLasforstaelse,
    title: 'Läsförståelse',
    body:
      'Plocka ut det texten faktiskt säger, inte vad du tror den säger. Det är skillnaden mellan rätt och fel i verbalt resonemang.',
  },
  {
    Icon: IconKritiskt,
    title: 'Kritiskt tänkande',
    body:
      'Skilj på vad ett påstående bevisar och vad det bara antyder. Tester ger ofta tre alternativ, sant, falskt och går ej att avgöra, just för att fånga upp förhastade slutsatser.',
  },
  {
    Icon: IconSnabbrakning,
    title: 'Snabbräkning',
    body:
      'Procent, ratio och skillnader i huvudet eller på papper. Du behöver inte kunna avancerad matematik, men du måste hinna räkna utan att tappa precisionen.',
  },
  {
    Icon: IconTabell,
    title: 'Tabell-tolkning',
    body:
      'Hitta rätt cell snabbt i en tabell med fem rader och fyra kolumner. Den som scannar tabellen smart sparar tid till själva räknandet.',
  },
]

export default function RekryteringstesterVadDuTraning() {
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
            Vad du tränar på
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Sex färdigheter som{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              avgör testet
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Det här är vad arbetsgivaren faktiskt mäter. Träna upp dem
            innan du sätter dig framför det skarpa testet.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {FARDIGHETER.map(({ Icon, title, body }, idx) => (
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
