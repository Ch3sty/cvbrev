'use client'

import { motion } from 'framer-motion'

interface Grupp {
  rubrik: string
  punkter: string[]
}

interface ArbetsuppgifterListProps {
  grupper: Grupp[]
}

export default function ArbetsuppgifterList({ grupper }: ArbetsuppgifterListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {grupper.map((g, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.3, delay: idx * 0.04 }}
          className="relative bg-white rounded-2xl border border-slate-200 p-5 pl-6"
        >
          <span
            className="absolute left-0 top-4 bottom-4 w-1 rounded-r"
            style={{ background: 'linear-gradient(180deg, #F97316, #DC2626)' }}
            aria-hidden
          />
          <div className="flex items-baseline gap-3 mb-3">
            <span className="text-[11px] font-black text-orange-700 tabular-nums">
              {String(idx + 1).padStart(2, '0')}
            </span>
            <h3 className="text-base font-black text-slate-900 leading-tight">
              {g.rubrik}
            </h3>
          </div>
          <ul className="space-y-1.5">
            {g.punkter.map((p, pIdx) => (
              <li key={pIdx} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-orange-400 mt-2" />
                {p}
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  )
}
