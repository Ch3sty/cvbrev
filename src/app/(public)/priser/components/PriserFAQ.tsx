'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { PRISER_FAQ_ITEMS } from './priser-data'

export default function PriserFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="relative py-12 sm:py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 mb-2">
            Allt du undrar om priset
          </h2>
          <p className="text-sm sm:text-base text-neutral-600">
            Hittar du inte svaret?{' '}
            <a
              href="mailto:support@jobbcoach.ai"
              className="text-orange-700 hover:text-orange-800 font-medium underline underline-offset-4"
            >
              Hör av dig
            </a>
            .
          </p>
        </motion.div>

        <div className="space-y-2">
          {PRISER_FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx
            return (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.2, ease: 'easeOut', delay: idx * 0.03 }}
                className={`bg-white rounded-xl border overflow-hidden transition-colors ${
                  isOpen ? 'border-neutral-300' : 'border-neutral-200'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full min-h-[56px] flex items-center justify-between gap-4 px-5 sm:px-6 py-4 text-left hover:bg-neutral-50 transition-colors touch-manipulation"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-medium text-neutral-900 leading-snug">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`flex-shrink-0 w-5 h-5 text-neutral-500 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    strokeWidth={2.5}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      {/* Svaren är vår egen statiska copy, inte användardata.
                          Ett par av dem innehåller en länk (t.ex. till
                          /trial-signup), därför HTML i stället för text. */}
                      <div
                        className="px-5 sm:px-6 pb-5 text-sm text-neutral-600 leading-relaxed border-t border-neutral-200 pt-4 [&_a]:text-orange-700 [&_a]:font-semibold [&_a:hover]:text-orange-800 [&_a]:underline [&_a]:underline-offset-2"
                        dangerouslySetInnerHTML={{ __html: item.a }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
