'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'

interface FAQItem {
  fraga: string  // ALLTID SYNLIG
  svar: string   // EXPANDERBAR, 100-150 ord
}

interface FAQSectionProps {
  faq: FAQItem[] // 10+ frågor
  yrke: string
}

export default function FAQSection({ faq, yrke }: FAQSectionProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  const toggleFAQ = (index: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  // Schema.org structured data
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(item => ({
      '@type': 'Question',
      name: item.fraga,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.svar
      }
    }))
  }

  return (
    <section id="faq" className="py-16 md:py-24 bg-slate-50">
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 mb-4"
            >
              <HelpCircle className="w-4 h-4 text-cyan-600" />
              <span className="text-sm font-semibold text-slate-700">
                Vanliga frågor
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4"
            >
              Vanliga frågor om CV för {yrke}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-600"
            >
              Få svar på dina frågor om CV-skrivande
            </motion.p>
          </div>

          {/* FAQ accordion */}
          <div className="space-y-3">
            {faq.map((item, idx) => {
              const isExpanded = expandedItems.has(idx)

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                  itemScope
                  itemProp="mainEntity"
                  itemType="https://schema.org/Question"
                >
                  {/* Question - ALLTID SYNLIG */}
                  <button
                    onClick={() => toggleFAQ(idx)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors min-h-[64px] touch-manipulation text-left"
                    aria-expanded={isExpanded}
                    aria-controls={`faq-answer-${idx}`}
                  >
                    <h3
                      className="font-semibold text-slate-900 text-base md:text-lg pr-4 flex-1"
                      itemProp="name"
                    >
                      {item.fraga}
                    </h3>

                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-600 flex-shrink-0" />
                    )}
                  </button>

                  {/* Answer - EXPANDERBAR */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        id={`faq-answer-${idx}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                        itemScope
                        itemProp="acceptedAnswer"
                        itemType="https://schema.org/Answer"
                      >
                        <div className="px-6 pb-6 border-t border-slate-100">
                          <p
                            className="text-slate-600 leading-relaxed pt-4"
                            itemProp="text"
                          >
                            {item.svar}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>

          {/* CTA below FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 p-6 bg-gradient-to-r from-cyan-50 to-indigo-50 rounded-2xl border border-cyan-200 text-center"
          >
            <p className="text-lg font-semibold text-slate-900 mb-3">
              Har du fler frågor?
            </p>
            <p className="text-slate-600 mb-4">
              Kontakta oss eller utforska våra guider för att lära dig mer om att skriva ett professionellt CV.
            </p>
            <a
              href="/guider"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all"
            >
              Se alla guider
              <HelpCircle className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
