'use client';

import { motion } from 'framer-motion';
import { Play, ArrowRight, Save, ShieldCheck } from 'lucide-react';

interface Props {
  onStart: () => void;
  isLoading: boolean;
  hasProfile: boolean;
}

export default function PersonlighetStartCTA({ onStart, isLoading, hasProfile }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15, ease: 'easeOut' }}
      className="text-center"
    >
      <button
        onClick={onStart}
        disabled={isLoading}
        className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl
                   font-bold text-base sm:text-lg text-white min-h-[60px]
                   transition-all hover:-translate-y-0.5 active:translate-y-0
                   disabled:opacity-60 disabled:cursor-not-allowed
                   touch-manipulation"
        style={{
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
          boxShadow: '0 12px 36px -8px rgba(139, 92, 246, 0.5)',
        }}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Startar testet...
          </>
        ) : (
          <>
            <Play className="w-5 h-5" strokeWidth={2.5} />
            {hasProfile ? 'Gör om testet' : 'Starta testet'}
            <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
          </>
        )}
      </button>

      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" strokeWidth={2.5} />
          Helt privat
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Save className="w-3.5 h-3.5 text-indigo-600" strokeWidth={2.5} />
          Sparas i din profil
        </span>
      </div>
    </motion.section>
  );
}
