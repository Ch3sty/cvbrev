'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Plus, Minus } from 'lucide-react';

// Datan i page.tsx är inkonsekvent - vissa har { q, a } och vissa har { fraga, svar }
interface FaqItem {
  q?: string;
  a?: string;
  fraga?: string;
  svar?: string;
}

interface FaqAccordionProps {
  yrke: string;
  variant: 'letter' | 'cv';
  items: FaqItem[];
}

export default function FaqAccordion({ yrke, variant, items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!items || items.length === 0) return null;

  const what = variant === 'letter' ? 'personligt brev' : 'CV';

  return (
    <section>
      <div className="mb-5 sm:mb-6">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-1.5">
          <HelpCircle className="w-3.5 h-3.5" strokeWidth={2.5} />
          Vanliga frågor
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
          {what} för {yrke.toLowerCase()}
        </h2>
      </div>

      <div
        className="bg-white rounded-3xl border border-orange-200/60 overflow-hidden divide-y divide-orange-100"
        style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.15)' }}
      >
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          const q = item.q || item.fraga || '';
          const a = item.a || item.svar || '';
          if (!q || !a) return null;
          return (
            <div key={index}>
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left hover:bg-orange-50/50 transition-colors min-h-[56px] touch-manipulation"
                aria-expanded={isOpen}
              >
                <span className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                  {q}
                </span>
                <span
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                  style={{
                    background: isOpen
                      ? 'linear-gradient(135deg, #F97316, #DC2626)'
                      : '#FFF7ED',
                    color: isOpen ? 'white' : '#C2410C',
                  }}
                >
                  {isOpen ? (
                    <Minus className="w-4 h-4" strokeWidth={2.5} />
                  ) : (
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                  )}
                </span>
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
                    <div className="px-5 sm:px-6 pb-5 text-sm sm:text-base text-slate-700 leading-relaxed">
                      {a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
