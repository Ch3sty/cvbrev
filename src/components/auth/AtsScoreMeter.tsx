'use client'

import { motion } from 'framer-motion'

interface AtsScoreMeterProps {
  /** 0-100 */
  score: number
}

export default function AtsScoreMeter({ score }: AtsScoreMeterProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)))

  return (
    <div className="rounded-xl border border-orange-100 bg-orange-50/40 px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span
            className="w-1 h-3 rounded-sm bg-orange-600"
            aria-hidden="true"
          />
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-orange-700">
            CV-poäng
          </span>
        </div>
        <motion.span
          key={clamped}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="text-sm font-semibold text-neutral-900 tabular-nums"
        >
          {clamped}%
        </motion.span>
      </div>

      <div className="h-2 rounded-full bg-white border border-orange-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full bg-orange-600"
        />
      </div>

      <p className="mt-1.5 text-xs text-neutral-500">
        {clamped < 40
          ? 'Fyll i fler fält för att stärka ditt CV'
          : clamped < 80
          ? 'På väg uppåt, fortsätt fylla i'
          : 'Stark profil, du är redo att börja söka'}
      </p>
    </div>
  )
}
