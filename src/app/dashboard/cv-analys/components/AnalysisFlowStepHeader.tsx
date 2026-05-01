'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface AnalysisFlowStepHeaderProps {
  stepNumber: number;
  title: string;
  description: string;
  isDone: boolean;
  isActive?: boolean;
  rightSlot?: React.ReactNode;
}

export default function AnalysisFlowStepHeader({
  stepNumber,
  title,
  description,
  isDone,
  isActive = false,
  rightSlot,
}: AnalysisFlowStepHeaderProps) {
  return (
    <div className="flex items-start gap-4 mb-5">
      <div className="relative flex-shrink-0">
        {isActive && !isDone && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
        <div
          className="relative w-11 h-11 rounded-full flex items-center justify-center font-bold text-base"
          style={
            isDone
              ? {
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  color: 'white',
                  boxShadow: '0 4px 12px -2px rgba(16, 185, 129, 0.45)',
                }
              : isActive
              ? {
                  background: 'linear-gradient(135deg, #F97316, #DC2626)',
                  color: 'white',
                  boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.5)',
                }
              : {
                  background: '#F1F5F9',
                  color: '#94A3B8',
                }
          }
        >
          {isDone ? <Check className="w-5 h-5" strokeWidth={3} /> : stepNumber}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 mb-0.5">
              Steg {stepNumber}
              {isDone && <span className="ml-2 text-emerald-600">· Klart</span>}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {title}
            </h2>
            <p className="text-sm text-slate-600 mt-1">{description}</p>
          </div>
          {rightSlot && <div className="flex-shrink-0">{rightSlot}</div>}
        </div>
      </div>
    </div>
  );
}
