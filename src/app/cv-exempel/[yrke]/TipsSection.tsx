'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'

interface Tip {
  rubrik: string // H3 - ALLTID SYNLIG
  text: string   // 100-150 ord - EXPANDERBAR
}

interface TipsSectionProps {
  tips: Tip[] // 6 tips
  yrke: string
}

export default function TipsSection({ tips, yrke }: TipsSectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const toggleTip = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <section id="tips" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-full border border-amber-200 mb-4"
            >
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-900">
                Expertråd
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4"
            >
              Tips för ditt CV som {yrke}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-600"
            >
              Praktiska råd för att optimera ditt CV
            </motion.p>
          </div>

          {/* Accordion items */}
          <div className="space-y-3">
            {tips.map((tip, idx) => {
              const isExpanded = expandedIndex === idx

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden"
                >
                  {/* Accordion header - ALLTID SYNLIG */}
                  <button
                    onClick={() => toggleTip(idx)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-100 transition-colors min-h-[56px] touch-manipulation"
                    aria-expanded={isExpanded}
                    aria-controls={`tip-content-${idx}`}
                  >
                    <div className="flex items-center gap-3 text-left flex-1">
                      {/* Number badge */}
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {idx + 1}
                        </span>
                      </div>

                      {/* H3 - SEO-viktigt, alltid synligt */}
                      <h3 className="font-bold text-slate-900 text-base md:text-lg">
                        {tip.rubrik}
                      </h3>
                    </div>

                    {/* Chevron icon */}
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-600 flex-shrink-0 ml-4" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-600 flex-shrink-0 ml-4" />
                    )}
                  </button>

                  {/* Accordion content - EXPANDERBAR */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        id={`tip-content-${idx}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 bg-white">
                          {/* Text content - 100-150 ord */}
                          {tip.text.split('\n\n').map((paragraph, pIdx) => (
                            <p
                              key={pIdx}
                              className="text-slate-600 leading-relaxed mb-3 last:mb-0"
                            >
                              {paragraph.trim()}
                            </p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
