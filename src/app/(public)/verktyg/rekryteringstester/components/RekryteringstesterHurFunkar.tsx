'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import {
  IconValj,
  IconLos,
  IconScore,
  IconAnalys,
} from './illustrations/RekryteringstesterIcons'

const STEPS = [
  {
    num: 1,
    Icon: IconValj,
    title: 'Välj test',
    body:
      'Plocka ett av de tre gratistesterna i din takt. Du kan också göra om ett test så ofta du vill, frågorna roteras.',
  },
  {
    num: 2,
    Icon: IconLos,
    title: 'Lös frågor i din takt',
    body:
      'Timern räknar uppåt så du ser tempot, men ingenting bryter mitt i en fråga. Markera ditt svar och gå till nästa.',
  },
  {
    num: 3,
    Icon: IconScore,
    title: 'Få score och tid direkt',
    body:
      'När du svarat klart visas din procent, korrekta svar och total tid samt snitt-tid per fråga. Inget väntande på resultat.',
  },
  {
    num: 4,
    Icon: IconAnalys,
    title: 'Se vad du missade',
    body:
      'Fråga för fråga ser du ditt svar mot facit. Du förstår vilka mönster du missade och vet exakt vad du ska träna mer på.',
  },
]

export default function RekryteringstesterHurFunkar() {
  return (
    <section id="sa-funkar-det" className="relative py-16 sm:py-24 bg-orange-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white text-orange-700 border border-orange-200 mb-4">
            Så funkar det
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Från första frågan till{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              färdig rapport
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Inget krångel, ingen registrering före du provar. Du börjar
            inom 30 sekunder.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {STEPS.map(({ num, Icon, title, body }, idx) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="relative bg-white rounded-3xl border border-orange-100 p-6 sm:p-7 hover:border-orange-200 transition-colors"
              style={{
                boxShadow: '0 8px 32px -16px rgba(249, 115, 22, 0.18)',
              }}
            >
              <div className="absolute top-5 right-5 text-[11px] font-black uppercase tracking-[0.18em] text-orange-300">
                0{num}
              </div>
              <div className="mb-5">
                <Icon className="w-14 h-14" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2 leading-tight">
                {title}
              </h3>
              <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
                {body}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12 sm:mt-14">
          <Link
            href="/dashboard/tester"
            className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-white font-bold text-base min-h-[52px]"
            style={{
              background:
                'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              boxShadow: '0 12px 32px -10px rgba(220, 38, 38, 0.42)',
            }}
          >
            Starta gratis test
            <ArrowRight
              className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
              strokeWidth={2.5}
            />
          </Link>
        </div>
      </div>
    </section>
  )
}
