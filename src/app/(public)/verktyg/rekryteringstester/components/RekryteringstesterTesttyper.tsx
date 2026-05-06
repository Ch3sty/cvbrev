'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Lock } from 'lucide-react'
import {
  IconMatrislogik,
  IconVerbal,
  IconNumerisk,
} from './illustrations/RekryteringstesterIcons'

const TYPER = [
  {
    Icon: IconMatrislogik,
    title: 'Matrislogik',
    body:
      'Hitta mönstret i en 3×3-matris med abstrakta former. Tränar mönsterigenkänning och logiskt tänkande, samma format som SHL Inductive Reasoning och Cut-e Scales numerical.',
    grund: '15 frågor · ~20 min · gratis',
    avancerad: '15 frågor · ~25 min · Premium',
  },
  {
    Icon: IconVerbal,
    title: 'Verbalt resonemang',
    body:
      'Läs en kort text och avgör om ett påstående är sant, falskt eller går ej att avgöra. Tränar läsförståelse och kritiskt tänkande utan att fastna i förkunskaper.',
    grund: '48 påståenden i 12 passager · ~20 min · gratis',
    avancerad: '48 påståenden · ~25 min · Premium',
  },
  {
    Icon: IconNumerisk,
    title: 'Numeriskt resonemang',
    body:
      'Tabeller och diagram med ekonomiska siffror, frågor om procent och beräkningar. Tränar tabell-tolkning och snabbräkning under tidspress.',
    grund: '24 frågor · ~20 min · gratis',
    avancerad: '24 frågor · ~25 min · Premium',
  },
]

export default function RekryteringstesterTesttyper() {
  return (
    <section id="testtyper" className="relative py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
            Tre testtyper
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Sex tester,{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              tre på gratisnivån
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Varje testtyp har en grundnivå som är gratis och en avancerad
            version med svårare frågor och längre tidspress.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {TYPER.map(({ Icon, title, body, grund, avancerad }, idx) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
              className="bg-white rounded-3xl border border-orange-100 p-6 sm:p-7 hover:border-orange-200 transition-colors flex flex-col"
              style={{
                boxShadow: '0 10px 36px -16px rgba(249, 115, 22, 0.2)',
              }}
            >
              <Icon className="w-16 h-16 mb-5" />
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 leading-tight">
                {title}
              </h3>
              <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed mb-5 flex-1">
                {body}
              </p>

              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700 flex-shrink-0">
                    Gratis
                  </span>
                  <span className="text-xs font-bold text-slate-700 truncate">
                    {grund}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-50 border border-orange-100">
                  <Lock className="w-3 h-3 text-orange-700 flex-shrink-0" strokeWidth={3} />
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-700 flex-shrink-0">
                    Premium
                  </span>
                  <span className="text-xs font-bold text-slate-700 truncate">
                    {avancerad}
                  </span>
                </div>
              </div>

              <Link
                href="/dashboard/tester"
                className="group inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-orange-700 font-bold text-sm border border-orange-200 hover:bg-orange-50 transition-colors"
              >
                Träna på {title.toLowerCase()}
                <ArrowRight
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={2.5}
                />
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
