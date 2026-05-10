'use client'

import { motion } from 'framer-motion'
import { Building2 } from 'lucide-react'

interface Grupp {
  kategori: string
  exempel: string[]
}

interface TypiskaArbetsgivareProps {
  grupper: Grupp[]
}

export default function TypiskaArbetsgivare({ grupper }: TypiskaArbetsgivareProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {grupper.map((g, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.25, delay: idx * 0.04 }}
          className="bg-slate-50 rounded-2xl p-5 border border-slate-200"
        >
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-slate-500" strokeWidth={2.4} />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              {g.kategori}
            </h3>
          </div>
          <ul className="space-y-1.5">
            {g.exempel.map((e, eIdx) => (
              <li key={eIdx} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="flex-shrink-0 w-1 h-1 rounded-full bg-slate-400 mt-2" />
                {e}
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  )
}
