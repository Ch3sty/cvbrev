'use client'

import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'

interface Vag {
  rubrik: string
  beskrivning: string
}

interface UtbildningsvagarProps {
  vagar: Vag[]
}

export default function Utbildningsvagar({ vagar }: UtbildningsvagarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {vagar.map((v, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.25, delay: idx * 0.04 }}
          className="bg-white rounded-2xl border border-slate-200 p-5"
        >
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 inline-flex w-10 h-10 rounded-xl items-center justify-center bg-emerald-50 text-emerald-700">
              <GraduationCap className="w-5 h-5" strokeWidth={2.4} />
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-black text-slate-900 leading-tight mb-1.5">
                {v.rubrik}
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">{v.beskrivning}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
