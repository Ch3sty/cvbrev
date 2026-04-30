'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface AutoImprovement {
  area?: string;
  title?: string;
  suggestion?: string;
  description?: string;
  example?: string;
  category?: string;
}

interface AutoApplyPanelProps {
  improvements: AutoImprovement[];
}

export default function AutoApplyPanel({ improvements }: AutoApplyPanelProps) {
  return (
    <div className="space-y-3">
      <div
        className="rounded-2xl p-4 sm:p-5 flex items-start gap-3"
        style={{
          background:
            'linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, rgba(5, 150, 105, 0.03) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.22)',
        }}
      >
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white"
          style={{
            background: 'linear-gradient(135deg, #10B981, #059669)',
            boxShadow: '0 4px 12px -3px rgba(16, 185, 129, 0.4)',
          }}
        >
          <CheckCircle2 className="w-5 h-5" strokeWidth={2.25} />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-0.5">
            Vi tar hand om resten åt dig
          </h4>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            Dessa förbättringar är allmänna och tillämpas automatiskt när du går vidare. Du
            behöver inte välja något här.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {improvements.map((improvement, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04, duration: 0.2 }}
            className="rounded-xl bg-white border border-emerald-200/60 p-3.5 flex items-start gap-3"
          >
            <div
              className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-white mt-0.5"
              style={{
                background: 'linear-gradient(135deg, #10B981, #059669)',
              }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <h6 className="font-semibold text-slate-900 text-sm leading-tight">
                {improvement.area || improvement.title || 'Förbättring'}
              </h6>
              {(improvement.suggestion || improvement.description) && (
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {improvement.suggestion || improvement.description}
                </p>
              )}
              {improvement.example && (
                <p className="text-xs text-slate-500 italic mt-1">
                  Exempel: {improvement.example}
                </p>
              )}
              {improvement.category && !improvement.example && (
                <span
                  className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.08) 100%)',
                    color: '#047857',
                  }}
                >
                  {improvement.category}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
