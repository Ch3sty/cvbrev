'use client';

import { motion } from 'framer-motion';

const SUGGESTIONS = [
  'Hur skriver jag ett bra CV?',
  'Vad är marknadslön i mitt yrke?',
  'Tips inför intervjun',
  'Vad gäller vid uppsägning?',
];

interface MiniSuggestionChipsProps {
  onPick: (text: string) => void;
}

export default function MiniSuggestionChips({ onPick }: MiniSuggestionChipsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1"
    >
      <span className="flex-shrink-0 self-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 mr-1">
        Förslag
      </span>
      {SUGGESTIONS.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onPick(s)}
          className="flex-shrink-0 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-orange-300 hover:bg-orange-50/40 text-xs font-medium text-slate-700 transition-colors min-h-[32px]"
        >
          {s}
        </button>
      ))}
    </motion.div>
  );
}
