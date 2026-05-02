'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ExternalLink, MousePointerClick, Copy, ClipboardPaste } from 'lucide-react'

const STEPS = [
  {
    icon: ExternalLink,
    title: 'Öppna LinkedIn',
    desc: 'Gå till din profilsida',
  },
  {
    icon: MousePointerClick,
    title: 'Hitta sektionen',
    desc: 'Markera all text',
  },
  {
    icon: Copy,
    title: 'Kopiera',
    desc: 'Ctrl/⌘ + C',
  },
  {
    icon: ClipboardPaste,
    title: 'Klistra in här',
    desc: 'Ctrl/⌘ + V',
  },
]

export default function PasteHelper() {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border border-orange-100 bg-orange-50/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-orange-50/60 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="w-1 h-3 rounded-sm flex-shrink-0"
            style={{
              background:
                'linear-gradient(180deg, #F97316 0%, #DC2626 100%)',
            }}
            aria-hidden="true"
          />
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-700">
            Så kopierar du från LinkedIn
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-orange-700 transition-transform flex-shrink-0 ${
            open ? 'rotate-180' : ''
          }`}
          strokeWidth={2.4}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {STEPS.map((step, i) => {
                  const Icon = step.icon
                  return (
                    <div
                      key={step.title}
                      className="flex flex-col items-center text-center gap-1.5 p-2"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          background:
                            i % 2 === 0
                              ? 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)'
                              : 'linear-gradient(135deg, #DC2626 0%, #BE185D 100%)',
                          boxShadow:
                            '0 4px 10px -3px rgba(220, 38, 38, 0.35)',
                        }}
                      >
                        <Icon
                          className="w-5 h-5 text-white"
                          strokeWidth={2.2}
                        />
                      </div>
                      <p className="text-[11px] font-bold text-slate-900 leading-tight">
                        {i + 1}. {step.title}
                      </p>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        {step.desc}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
