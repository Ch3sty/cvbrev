'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface Term {
  term: string
  forklaring: string
}

interface Grupp {
  kategori: string
  termer: Term[]
}

interface BranschtermerListProps {
  grupper: Grupp[]
}

export default function BranschtermerList({ grupper }: BranschtermerListProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <div className="space-y-3">
      {grupper.map((g, idx) => {
        const isOpen = openIdx === idx
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
          >
            <button
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
              aria-expanded={isOpen}
            >
              <div className="flex items-baseline gap-3 min-w-0">
                <span className="text-[11px] font-black text-orange-700 tabular-nums">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  {g.kategori}
                </h3>
                <span className="text-xs text-slate-500 hidden sm:inline">
                  ({g.termer.length} termer)
                </span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-slate-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                strokeWidth={2.5}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <dl className="border-t border-slate-100 px-5 py-4 space-y-3">
                    {g.termer.map((t, tIdx) => (
                      <div key={tIdx} className="grid sm:grid-cols-[180px_1fr] gap-1 sm:gap-4">
                        <dt className="text-sm font-bold text-orange-700 leading-snug">
                          {t.term}
                        </dt>
                        <dd className="text-sm text-slate-700 leading-relaxed">
                          {t.forklaring}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
