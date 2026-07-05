'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Lock } from 'lucide-react'
import {
  IconMatrislogik,
  IconVerbal,
  IconNumerisk,
  IconPersonlighet,
} from './illustrations/RekryteringstesterIcons'

const KOGNITIVA = [
  {
    Icon: IconMatrislogik,
    title: 'Matrislogik',
    body: 'Hitta mönstret i en 3×3-matris med abstrakta former. Tränar mönsterigenkänning och logiskt tänkande, samma format som SHL Inductive Reasoning och Cut-e Scales numerical.',
    grund: { antal: '15 frågor', tid: '~20 min' },
    avancerad: { antal: '15 frågor', tid: '~25 min' },
  },
  {
    Icon: IconVerbal,
    title: 'Verbalt resonemang',
    body: 'Läs en kort text och avgör om ett påstående är sant, falskt eller går ej att avgöra. Tränar läsförståelse och kritiskt tänkande utan att fastna i förkunskaper.',
    grund: { antal: '48 påståenden', tid: '~20 min' },
    avancerad: { antal: '48 påståenden', tid: '~25 min' },
  },
  {
    Icon: IconNumerisk,
    title: 'Numeriskt resonemang',
    body: 'Tabeller och diagram med ekonomiska siffror, frågor om procent och beräkningar. Tränar tabell-tolkning och snabbräkning under tidspress.',
    grund: { antal: '24 frågor', tid: '~20 min' },
    avancerad: { antal: '24 frågor', tid: '~25 min' },
  },
]

const BIG_FIVE_DIMENSIONER = [
  { kod: 'O', namn: 'Öppenhet', desc: 'Kreativitet och nyfikenhet' },
  { kod: 'C', namn: 'Noggrannhet', desc: 'Struktur och disciplin' },
  { kod: 'E', namn: 'Extraversion', desc: 'Social energi och initiativ' },
  { kod: 'A', namn: 'Vänlighet', desc: 'Samarbete och tillit' },
  { kod: 'N', namn: 'Känslostabilitet', desc: 'Stresstålighet och lugn' },
]

export default function RekryteringstesterTesttyper() {
  return (
    <>
      {/* DEL 1: Kognitiva tester */}
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
              Kognitiva tester
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
              Tre testtyper,{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                alla gratis att börja
              </span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              Grundnivån är alltid gratis, en gång per dag och test. Vill du köra obegränsat och trycka på med svårare frågor finns avancerad version i Premium.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
            {KOGNITIVA.map(({ Icon, title, body, grund, avancerad }, idx) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className="bg-white rounded-3xl border border-orange-100 p-6 sm:p-7 hover:border-orange-200 transition-colors flex flex-col"
                style={{ boxShadow: '0 10px 36px -16px rgba(249, 115, 22, 0.2)' }}
              >
                <Icon className="w-16 h-16 mb-5" />
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 leading-tight">
                  {title}
                </h3>
                <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed mb-5 flex-1">
                  {body}
                </p>

                <div className="space-y-2 mb-5">
                  <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700 flex-shrink-0">
                        Gratis, 1/dag
                      </span>
                      <span className="text-xs font-bold text-slate-700 truncate">
                        {grund.antal}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 flex-shrink-0 tabular-nums">
                      {grund.tid}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-orange-50 border border-orange-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <Lock className="w-3 h-3 text-orange-700 flex-shrink-0" strokeWidth={3} />
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-700 flex-shrink-0">
                        Premium
                      </span>
                      <span className="text-xs font-bold text-slate-700 truncate">
                        {avancerad.antal}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 flex-shrink-0 tabular-nums">
                      {avancerad.tid}
                    </span>
                  </div>
                </div>

                <Link
                  href="/dashboard/tester"
                  className="group inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-orange-700 font-bold text-sm border border-orange-200 hover:bg-orange-50 transition-colors"
                >
                  Träna på {title.toLowerCase()}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* DEL 2: Personlighetsprofil */}
      <section className="relative py-16 sm:py-24 bg-orange-50/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-center"
          >
            {/* Text-sida */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white text-orange-700 border border-orange-200 mb-5">
                Personlighetsprofil
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-[1.05] tracking-tight mb-4">
                Ta reda på vad rekryteraren{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  ser i dig
                </span>
              </h2>
              <p className="text-base sm:text-[17px] text-slate-600 leading-relaxed mb-6">
                De flesta arbetsgivare använder Big Five när de mäter personlighet i rekrytering. Vi låter dig bygga din egen profil och se exakt vilka dimensioner du hamnar på. Tar 10 minuter. Inga rätta svar. Resultatet är något du faktiskt kan använda inför intervjun.
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-emerald-100">
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">Gratis</span>
                  <span className="text-xs font-bold text-slate-700">50 frågor, ~10 min</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-orange-100">
                  <Lock className="w-3 h-3 text-orange-700 flex-shrink-0" strokeWidth={3} />
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-700">Premium</span>
                  <span className="text-xs font-bold text-slate-700">120 frågor, 30 facetter, ~25 min</span>
                </div>
              </div>

              <Link
                href="/dashboard/tester"
                className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-white font-bold text-base shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
                style={{
                  background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                  boxShadow: '0 12px 32px -10px rgba(220, 38, 38, 0.4)',
                }}
              >
                Testa din personlighet &amp; se vad rekryteraren ser
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
              </Link>
            </div>

            {/* Profil-preview: Big Five-staplar */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-3xl border border-orange-100 p-7 sm:p-8"
              style={{ boxShadow: '0 10px 36px -16px rgba(249, 115, 22, 0.2)' }}
            >
              <div className="flex items-center gap-3 mb-6">
                <IconPersonlighet className="w-12 h-12" />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-700 mb-0.5">Din profil</p>
                  <p className="text-lg font-black text-slate-900 leading-tight">Big Five-modellen</p>
                </div>
              </div>
              <div className="space-y-3">
                {BIG_FIVE_DIMENSIONER.map(({ kod, namn, desc }, i) => {
                  const widths = ['72%', '58%', '84%', '45%', '67%']
                  return (
                    <div key={kod}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-slate-800">{namn}</span>
                        <span className="text-xs text-slate-500">{desc}</span>
                      </div>
                      <div className="h-2 rounded-full bg-orange-100 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: widths[i] }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.7, delay: i * 0.08, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{
                            background: 'linear-gradient(90deg, #F97316, #DC2626)',
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-slate-400 mt-5 text-center">Exempelresultat. Din profil ser annorlunda ut.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
