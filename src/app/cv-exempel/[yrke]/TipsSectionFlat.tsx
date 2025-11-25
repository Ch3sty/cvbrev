'use client'

import { motion } from 'framer-motion'

interface Tip {
  rubrik: string
  text: string
}

interface TipsSectionFlatProps {
  tips: Tip[]
  yrke: string
}

export default function TipsSectionFlat({ tips, yrke }: TipsSectionFlatProps) {
  return (
    <div className="space-y-4">
      {tips.map((tip, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.05 }}
          className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start gap-4">
            {/* Number badge */}
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">{idx + 1}</span>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-lg mb-3">
                {tip.rubrik}
              </h3>
              <div className="text-slate-600 leading-relaxed space-y-3">
                {tip.text.split('\n\n').map((paragraph, pIdx) => {
                  // Rendera markdown-liknande fetstil
                  const parts = paragraph.trim().split(/(\*\*[^*]+\*\*)/)
                  return (
                    <p key={pIdx}>
                      {parts.map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          const text = part.slice(2, -2)
                          const isUndvik = text === 'UNDVIK:'
                          const isBra = text === 'BRA:'
                          return (
                            <strong
                              key={i}
                              className={
                                isUndvik ? 'text-red-600 font-bold' :
                                isBra ? 'text-green-600 font-bold' :
                                'font-semibold'
                              }
                            >
                              {text}
                            </strong>
                          )
                        }
                        return <span key={i}>{part}</span>
                      })}
                    </p>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
