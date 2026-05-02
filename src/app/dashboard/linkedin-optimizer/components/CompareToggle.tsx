'use client'

import { motion } from 'framer-motion'

export type CompareSide = 'before' | 'after'

interface Props {
  value: CompareSide
  onChange: (side: CompareSide) => void
}

const OPTIONS: { id: CompareSide; label: string }[] = [
  { id: 'before', label: 'Före' },
  { id: 'after', label: 'Efter' },
]

export default function CompareToggle({ value, onChange }: Props) {
  return (
    <div
      className="inline-flex bg-slate-100 rounded-xl p-1 relative"
      role="tablist"
      aria-label="Jämför profil före och efter"
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            role="tab"
            aria-selected={active}
            className="relative px-5 py-2 text-sm font-bold transition-colors min-w-[90px]"
          >
            {active && (
              <motion.span
                layoutId="compare-toggle-bg"
                className="absolute inset-0 rounded-lg"
                style={
                  opt.id === 'after'
                    ? {
                        background:
                          'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                        boxShadow:
                          '0 4px 10px -3px rgba(220, 38, 38, 0.4)',
                      }
                    : { background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                }
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span
              className={`relative z-10 ${
                active
                  ? opt.id === 'after'
                    ? 'text-white'
                    : 'text-slate-900'
                  : 'text-slate-500'
              }`}
            >
              {opt.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
