'use client'

import { motion } from 'framer-motion'
import {
  CheckCircle, Target, TrendingUp, Award,
  FileText, Zap
} from 'lucide-react'

interface VarforItem {
  rubrik: string
  text: string
}

interface VarforDetFungerarProps {
  items: VarforItem[] // 6 items, 80-120 ord vardera
  yrke: string
}

// Icon mapping
const ICONS = [
  Target, TrendingUp, Award, FileText, Zap, CheckCircle
]

export default function VarforDetFungerar({ items, yrke }: VarforDetFungerarProps) {
  return (
    <section className="py-16 md:py-24 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-12 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 mb-4"
            >
              <CheckCircle className="w-4 h-4 text-cyan-600" />
              <span className="text-sm font-semibold text-slate-700">
                Lär av experterna
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4"
            >
              Varför det här CV:t fungerar
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto"
            >
              Lär dig principerna bakom ett professionellt {yrke.toLowerCase()}-CV
            </motion.p>
          </div>

          {/* Cards grid - ALLTID SYNLIGT, inget accordion */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {items.map((item, idx) => {
              const Icon = ICONS[idx] || CheckCircle

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-cyan-200 transition-all duration-300"
                >
                  {/* Icon */}
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* H3 - SEO-viktigt */}
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {item.rubrik}
                  </h3>

                  {/* Text - 80-120 ord, ALLTID SYNLIG */}
                  <p className="text-slate-600 leading-relaxed">
                    {item.text}
                  </p>
                </motion.div>
              )
            })}
          </div>

          {/* Optional CTA under cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <a
              href="#tips"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 rounded-xl font-semibold text-slate-900 hover:border-cyan-600 hover:text-cyan-600 transition-all"
            >
              Läs våra experttips
              <CheckCircle className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
