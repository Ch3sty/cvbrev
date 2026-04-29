'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FileText, ArrowRight, Plus } from 'lucide-react';

interface ShareDocumentsCardProps {
  cvCount: number;
  letterCount: number;
  onOpenSelector: () => void;
}

export default function ShareDocumentsCard({
  cvCount,
  letterCount,
  onOpenSelector,
}: ShareDocumentsCardProps) {
  const hasDocuments = cvCount + letterCount > 0;

  if (!hasDocuments) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex flex-wrap items-center gap-2 px-4 py-3 rounded-2xl bg-white/70 border border-orange-200/60 text-sm"
      >
        <span className="text-slate-600">
          Inga dokument än. Skapa ett först så kan du fråga om det:
        </span>
        <Link
          href="/dashboard/profil/cv"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-orange-300 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-colors"
        >
          <Plus className="w-3 h-3" strokeWidth={2.5} />
          Ladda upp CV
        </Link>
        <Link
          href="/dashboard/skapa-brev"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-orange-300 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-colors"
        >
          <Plus className="w-3 h-3" strokeWidth={2.5} />
          Skapa brev
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onOpenSelector}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/70 border border-orange-200/60 hover:bg-orange-50/40 hover:border-orange-300 transition-colors text-left min-h-[56px]"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
        style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
      >
        <FileText className="w-4 h-4 text-white" strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0 text-sm leading-snug">
        <span className="text-slate-700">Du har </span>
        {cvCount > 0 && (
          <span className="font-bold text-slate-900">
            {cvCount} {cvCount === 1 ? 'CV' : 'CV:n'}
          </span>
        )}
        {cvCount > 0 && letterCount > 0 && <span className="text-slate-700"> och </span>}
        {letterCount > 0 && (
          <span className="font-bold text-slate-900">
            {letterCount} {letterCount === 1 ? 'brev' : 'brev'}
          </span>
        )}
        <span className="text-slate-500"> · Dela för personliga svar</span>
      </div>
      <ArrowRight
        className="w-4 h-4 text-orange-600 flex-shrink-0 group-hover:translate-x-0.5 transition-transform"
        strokeWidth={2.5}
      />
    </motion.button>
  );
}
