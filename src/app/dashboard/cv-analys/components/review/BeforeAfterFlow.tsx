'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { HighlightedText } from '../select/ImprovementCard';

interface BeforeAfterFlowProps {
  currentText: string;
  improvedText: string;
  keywords?: string[];
  detectNumbers?: boolean;
}

/**
 * Flödes-vy för Granska-steget.
 * Visar förslag som primär, "Visa nuvarande" som fade-toggle.
 */
export default function BeforeAfterFlow({
  currentText,
  improvedText,
  keywords = [],
  detectNumbers = true,
}: BeforeAfterFlowProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div
      className="rounded-xl p-3.5 sm:p-4 border-2"
      style={{
        background:
          'linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, rgba(5, 150, 105, 0.03) 100%)',
        borderColor: 'rgba(16, 185, 129, 0.25)',
      }}
    >
      <div className="flex items-center justify-between mb-2.5 gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-800">
          {showOriginal ? 'Nuvarande text' : 'Förbättrad version'}
        </span>
        <button
          type="button"
          onClick={() => setShowOriginal((v) => !v)}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-orange-700 hover:bg-orange-50 transition-colors"
          aria-pressed={showOriginal}
        >
          {showOriginal ? (
            <>
              <EyeOff className="w-3 h-3" strokeWidth={2.5} />
              Visa förbättrad
            </>
          ) : (
            <>
              <Eye className="w-3 h-3" strokeWidth={2.5} />
              Visa nuvarande
            </>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={showOriginal ? 'original' : 'improved'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {showOriginal ? (
            <p className="text-sm text-slate-600 italic leading-relaxed whitespace-pre-wrap">
              {currentText || 'Ingen tidigare text.'}
            </p>
          ) : (
            <HighlightedText
              text={improvedText}
              keywords={keywords}
              detectNumbers={detectNumbers}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
