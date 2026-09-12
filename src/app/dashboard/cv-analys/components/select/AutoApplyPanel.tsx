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
        className="rounded-xl p-4 sm:p-5 flex items-start gap-3 bg-white"
        style={{
          border: '1px solid rgba(16, 185, 129, 0.22)',
        }}
      >
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={2.25} />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-neutral-900 text-sm sm:text-base mb-0.5">
            Vi tar hand om resten åt dig
          </h4>
          <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
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
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <h6 className="font-semibold text-neutral-900 text-sm leading-tight">
                {improvement.area || improvement.title || 'Förbättring'}
              </h6>
              {(improvement.suggestion || improvement.description) && (
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  {improvement.suggestion || improvement.description}
                </p>
              )}
              {improvement.example && (
                <p className="text-xs text-neutral-500 italic mt-1">
                  Exempel: {improvement.example}
                </p>
              )}
              {improvement.category && !improvement.example && (
                <span
                  className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider"
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
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
