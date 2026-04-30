'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp } from 'lucide-react';
import CVComparisonViewer from '../CVComparisonViewer';

interface PreviewComparisonStepProps {
  originalCV: string;
  improvedCV: string;
  improvementsCount: number;
  atsImprovement: number;
}

export default function PreviewComparisonStep({
  originalCV,
  improvedCV,
  improvementsCount,
  atsImprovement,
}: PreviewComparisonStepProps) {
  return (
    <div className="space-y-5">
      {/* Stats-kort */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white rounded-2xl border border-emerald-200/60 p-4 sm:p-5"
          style={{ boxShadow: '0 4px 14px -6px rgba(16, 185, 129, 0.18)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white"
              style={{
                background: 'linear-gradient(135deg, #10B981, #059669)',
                boxShadow: '0 4px 12px -3px rgba(16, 185, 129, 0.4)',
              }}
            >
              <CheckCircle2 className="w-5 h-5" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                {improvementsCount}
              </div>
              <div className="text-xs sm:text-sm text-slate-600">
                {improvementsCount === 1 ? 'förbättring tillämpad' : 'förbättringar tillämpade'}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="bg-white rounded-2xl border border-orange-200/60 p-4 sm:p-5"
          style={{ boxShadow: '0 4px 14px -6px rgba(249, 115, 22, 0.2)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white"
              style={{
                background: 'linear-gradient(135deg, #F97316, #DC2626)',
                boxShadow: '0 4px 12px -3px rgba(220, 38, 38, 0.4)',
              }}
            >
              <TrendingUp className="w-5 h-5" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                +{atsImprovement}
              </div>
              <div className="text-xs sm:text-sm text-slate-600">ATS-poäng förbättring</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Jämförelse-vy */}
      <div className="bg-white rounded-2xl border border-orange-200/50 overflow-hidden">
        <CVComparisonViewer originalCV={originalCV} improvedCV={improvedCV} />
      </div>

      {/* Info-bottom */}
      <div
        className="rounded-xl px-4 py-3 text-sm"
        style={{
          background:
            'linear-gradient(135deg, rgba(249, 115, 22, 0.06) 0%, rgba(220, 38, 38, 0.04) 100%)',
          border: '1px solid rgba(249, 115, 22, 0.15)',
        }}
      >
        <p className="text-slate-700 text-center">
          Vill du justera något? Gå{' '}
          <span className="font-semibold text-orange-700">tillbaka</span>. Allt ser bra ut?
          Klicka <span className="font-semibold text-orange-700">Nästa</span> för att välja
          mall och spara.
        </p>
      </div>
    </div>
  );
}
