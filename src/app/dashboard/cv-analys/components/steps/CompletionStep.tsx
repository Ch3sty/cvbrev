'use client';

import { motion } from 'framer-motion';
import { Download, FolderOpen, RotateCcw, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { CompletionTrophyIcon } from '../illustrations/AnalysisIcons';

interface CompletionStepProps {
  savedCvId?: string;
  fileName: string;
  onAnalyzeAnother: () => void;
  onDownloadAgain?: () => void;
}

export default function CompletionStep({
  savedCvId,
  fileName,
  onAnalyzeAnother,
  onDownloadAgain,
}: CompletionStepProps) {
  return (
    <div className="space-y-6">
      {/* Hero-success */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        className="relative overflow-hidden bg-white rounded-xl border border-orange-200/50 p-6 sm:p-8 text-center"
      >
        <div className="relative flex flex-col items-center">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.15,
            }}
          >
            <CompletionTrophyIcon className="w-24 h-24 sm:w-28 sm:h-28" />
          </motion.div>

          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 mt-4 mb-1">
            Klart
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight mb-2">
            Bra jobbat
          </h3>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-md">
            Ditt CV är optimerat och redo att skicka in. Lycka till med ansökningarna.
          </p>
          {fileName && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-50 border border-orange-200 text-orange-800">
              {fileName}
            </div>
          )}
        </div>
      </motion.div>

      {/* Status-kort */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatusCard label="ATS-optimerat" sub="Klar för system" />
        <StatusCard label="Förbättrat" sub="Skarpare innehåll" />
        <StatusCard label="Redo" sub="Skicka in nu" />
      </div>

      {/* Action-knappar */}
      <div className="grid sm:grid-cols-2 gap-3">
        {onDownloadAgain && (
          <button
            type="button"
            onClick={onDownloadAgain}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-neutral-200 bg-white hover:border-orange-300 hover:bg-orange-50/40 transition-colors min-h-[48px] font-semibold text-neutral-900 text-sm"
          >
            <Download className="w-4 h-4 text-orange-600" strokeWidth={2.25} />
            Ladda ned igen
          </button>
        )}

        {savedCvId && (
          <Link
            href="/dashboard/profil/cv"
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-neutral-200 bg-white hover:border-orange-300 hover:bg-orange-50/40 transition-colors min-h-[48px] font-semibold text-neutral-900 text-sm"
          >
            <FolderOpen className="w-4 h-4 text-orange-600" strokeWidth={2.25} />
            Visa i CV-bibliotek
          </Link>
        )}

        <button
          type="button"
          onClick={onAnalyzeAnother}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 min-h-[48px] sm:col-span-2"
        >
          <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
          Analysera ett annat CV
        </button>
      </div>

      {/* Nästa steg */}
      <div className="relative overflow-hidden rounded-xl p-5 sm:p-6 bg-white border border-orange-200">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700 mb-1">
          Nästa steg
        </div>
        <h4 className="text-base sm:text-lg font-bold text-neutral-900 mb-3">
          Skriv ett matchande personligt brev
        </h4>
        <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
          Vi har redan din CV-data. Att lägga till ett vasst personligt brev tar bara
          några minuter och dubblar dina chanser till intervju.
        </p>
        <Link
          href="/dashboard/skapa-brev"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 min-h-[44px]"
        >
          Skapa personligt brev
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  );
}

function StatusCard({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="bg-white rounded-xl border border-emerald-200/60 p-3 sm:p-4 text-center">
      <div className="w-7 h-7 mx-auto mb-2 rounded-full flex items-center justify-center bg-emerald-600 text-white">
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 7 L6 10 L11 4"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="text-xs sm:text-sm font-bold text-neutral-900">{label}</div>
      <div className="text-xs sm:text-xs text-neutral-500 mt-0.5">{sub}</div>
    </div>
  );
}
