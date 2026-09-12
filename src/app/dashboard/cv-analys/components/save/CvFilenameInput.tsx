'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Lightbulb } from 'lucide-react';

interface CvFilenameInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions?: string[];
}

export default function CvFilenameInput({
  value,
  onChange,
  suggestions = [],
}: CvFilenameInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const placeholder = suggestions[0] || 'Mitt CV 2026';
  const otherSuggestions = suggestions.slice(0, 4);

  return (
    <div
      className="rounded-xl bg-white p-4 sm:p-5"
      style={{
        border: '1px solid rgba(249, 115, 22, 0.22)',
      }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
          <FileText className="w-4 h-4 text-neutral-700" strokeWidth={2.25} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-orange-700 mb-0.5">
            Ge ditt CV ett namn
          </div>
          <div className="text-sm font-semibold text-neutral-900">
            Hjälper dig hitta rätt CV senare
          </div>
        </div>
      </div>

      <input
        type="text"

        enterKeyHint="done"

        inputMode="text"

        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 text-base bg-white border-2 border-orange-200/60 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-orange-500 min-h-[48px] transition-colors"
      />

      <button
        type="button"
        onClick={() => setShowSuggestions((v) => !v)}
        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-orange-700 hover:text-orange-900 transition-colors"
        aria-expanded={showSuggestions}
      >
        <Lightbulb className="w-3.5 h-3.5" strokeWidth={2.25} />
        Behöver du inspiration?
      </button>

      <AnimatePresence initial={false}>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex flex-wrap gap-1.5">
              {otherSuggestions.map((suggestion, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChange(suggestion);
                    setShowSuggestions(false);
                  }}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold transition-all min-h-[44px]"
                  style={{
                    background: 'rgba(249, 115, 22, 0.07)',
                    border: '1px solid rgba(249, 115, 22, 0.25)',
                    color: '#9A3412',
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div
              className="mt-3 rounded-xl p-3 text-xs text-neutral-700 leading-relaxed"
              style={{
                background: 'rgba(249, 115, 22, 0.04)',
                border: '1px solid rgba(249, 115, 22, 0.15)',
              }}
            >
              <span className="font-semibold text-orange-700">Tips: </span>
              Inkludera roll och år för att enkelt hitta rätt version senare.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
