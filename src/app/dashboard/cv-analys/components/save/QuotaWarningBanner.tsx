'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import CVQuotaManager from '../CVQuotaManager';

interface QuotaWarningBannerProps {
  cvCount: number;
  maxCvs: number;
  subscriptionTier: 'free' | 'premium';
  onCVDeleted: () => void;
}

export default function QuotaWarningBanner({
  cvCount,
  maxCvs,
  subscriptionTier,
  onCVDeleted,
}: QuotaWarningBannerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden bg-white"
      style={{
        border: '1px solid rgba(244, 63, 94, 0.3)',
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full px-4 sm:px-5 py-3.5 flex items-center gap-3 text-left min-h-[44px]"
        aria-expanded={isOpen}
      >
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-rose-600" strokeWidth={2.25} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-rose-700 mb-0.5">
            Biblioteket är fullt
          </div>
          <div className="text-sm font-semibold text-neutral-900 leading-tight">
            Du använder {cvCount}/{maxCvs} platser
          </div>
          <div className="text-xs text-neutral-600 mt-0.5">
            Ta bort gamla CV:n eller uppgradera till Premium för att spara fler.
          </div>
        </div>
        <div className="flex-shrink-0">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-rose-500" strokeWidth={2.25} />
          ) : (
            <ChevronDown className="w-5 h-5 text-rose-500" strokeWidth={2.25} />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-4">
              <CVQuotaManager
                cvCount={cvCount}
                maxCvs={maxCvs}
                subscriptionTier={subscriptionTier}
                onCVDeleted={onCVDeleted}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
