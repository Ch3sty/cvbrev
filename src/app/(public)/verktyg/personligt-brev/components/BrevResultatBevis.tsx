'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Quote } from 'lucide-react'

const STATS = [
  { value: '3×', label: 'fler intervjuer', sub: 'jämfört med generiska brev' },
  { value: '5', label: 'brev gratis', sub: 'varje vecka, utan kortuppgift' },
  { value: 'PDF', label: 'och Word', sub: 'redo att skicka direkt' },
]

export default function BrevResultatBevis() {
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
            Resultat
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight">
            När brevet matchar annonsen
            <br className="hidden sm:block" />
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              ringer rekryteraren oftare
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-10 items-center">
          {/* Case-studie */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="relative bg-white rounded-3xl border border-orange-100 p-6 sm:p-8"
            style={{
              boxShadow: '0 12px 40px -16px rgba(249, 115, 22, 0.22)',
            }}
          >
            {/* Quote-mark bakgrund */}
            <Quote
              className="absolute top-6 right-6 w-12 h-12 text-orange-100"
              strokeWidth={2}
              fill="currentColor"
            />

            <div className="relative">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-4">
                Marcus, 34 · Göteborg
              </div>

              <blockquote className="text-base sm:text-lg text-slate-800 leading-relaxed font-medium mb-5">
                ”Jag hade fått fjorton avslag på rad. Skrev om brevet med
                Jobbcoach.ai för en roll på Klarna och kallades till intervju
                samma vecka. Det var inte CV:t som var fel. Det var att jag
                inte talade rekryterarens språk.”
              </blockquote>

              <div className="flex items-center gap-4 pt-5 border-t border-orange-100">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0"
                  style={{
                    background:
                      'linear-gradient(135deg, #F97316, #DC2626)',
                  }}
                >
                  M
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    Från 14 avslag till intervju
                  </div>
                  <div className="text-xs text-slate-500">
                    Backend-utvecklare, nu på Klarna
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats + CTA */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            {STATS.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.15 + idx * 0.08 }}
                className="flex items-baseline gap-4 p-5 rounded-2xl bg-orange-50/50 border border-orange-100"
              >
                <div
                  className="text-3xl sm:text-4xl font-black flex-shrink-0"
                  style={{
                    background:
                      'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {stat.value}
                </div>
                <div>
                  <div className="text-base font-bold text-slate-900 leading-tight">
                    {stat.label}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{stat.sub}</div>
                </div>
              </motion.div>
            ))}

            <Link
              href="/dashboard/skapa-brev"
              className="group mt-4 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-white font-bold text-base w-full min-h-[52px]"
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                boxShadow: '0 12px 32px -10px rgba(220, 38, 38, 0.42)',
              }}
            >
              Skriv ditt första brev gratis
              <ArrowRight
                className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
                strokeWidth={2.5}
              />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
