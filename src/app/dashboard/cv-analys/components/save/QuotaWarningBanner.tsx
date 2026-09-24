'use client';

import { PAKETRADER } from '@/components/paywall/paywall-copy'
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import CVQuotaManager from '../CVQuotaManager';

interface QuotaWarningBannerProps {
  cvCount: number;
  maxCvs: number;
  subscriptionTier: 'free' | 'premium';
  onCVDeleted: () => void;
}

/**
 * Biblioteket är fullt. Bort: röd kant, rosa varningsikon och versalerad
 * rubrik i rött. Kvot är ett läge, inte ett fel, så det är en panel som
 * går att fälla ut.
 */
export default function QuotaWarningBanner({
  cvCount,
  maxCvs,
  subscriptionTier,
  onCVDeleted,
}: QuotaWarningBannerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="overflow-hidden rounded-xl border border-kant bg-panel">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex min-h-[44px] w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-insunken sm:px-5"
        aria-expanded={isOpen}
      >
        <div className="min-w-0 flex-1">
          <p className="text-kort leading-tight text-ink-1">
            Biblioteket är fullt, {cvCount} av {maxCvs} platser använda
          </p>
          <p className="mt-0.5 text-meta text-ink-3">
            {PAKETRADER.cvFulltKort}
          </p>
        </div>
        <div className="flex-shrink-0">
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-ink-3" strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <ChevronDown className="h-5 w-5 text-ink-3" strokeWidth={1.75} aria-hidden="true" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-kant px-4 py-4 sm:px-5">
          <CVQuotaManager
            cvCount={cvCount}
            maxCvs={maxCvs}
            subscriptionTier={subscriptionTier}
            onCVDeleted={onCVDeleted}
          />
        </div>
      )}
    </section>
  );
}
