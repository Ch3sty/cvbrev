'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface Punkt {
  title: string
  description: string
}

interface VarforVarMallPassarProps {
  punkter: Punkt[]
  yrkesNamn: string
}

export default function VarforVarMallPassar({ punkter, yrkesNamn }: VarforVarMallPassarProps) {
  void yrkesNamn

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {punkter.map((p, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.3, delay: idx * 0.04 }}
          className="relative bg-gradient-to-br from-white via-orange-50/30 to-white rounded-3xl border border-orange-200 p-6"
          style={{ boxShadow: '0 8px 32px -16px rgba(249, 115, 22, 0.25)' }}
        >
          <div className="absolute top-4 right-4 inline-flex w-7 h-7 rounded-full items-center justify-center bg-orange-100">
            <span className="text-[11px] font-black text-orange-700">{String(idx + 1).padStart(2, '0')}</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight mb-3 pr-10">
            {p.title}
          </h3>
          <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed">{p.description}</p>
        </motion.div>
      ))}
    </div>
  )
}
