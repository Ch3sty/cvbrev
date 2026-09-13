'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { HighlightedText } from '../select/ImprovementCard';

interface BeforeAfterFlowProps {
  currentText: string;
  improvedText: string;
  keywords?: string[];
  detectNumbers?: boolean;
}

/**
 * Före och efter i granskningssteget. Förslaget är förstahandsvyn,
 * "Visa nuvarande" byter. Insunken yta i en panel, ingen grön kant.
 */
export default function BeforeAfterFlow({
  currentText,
  improvedText,
  keywords = [],
  detectNumbers = true,
}: BeforeAfterFlowProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div className="rounded-lg border border-kant bg-insunken p-3.5 shadow-insunken sm:p-4">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span className="text-steg uppercase text-ink-3">
          {showOriginal ? 'Nuvarande text' : 'Förbättrad version'}
        </span>
        <button
          type="button"
          onClick={() => setShowOriginal((v) => !v)}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-meta font-medium text-ink-1 underline underline-offset-4 decoration-kant-stark transition-colors hover:decoration-ink-1"
          aria-pressed={showOriginal}
        >
          {showOriginal ? (
            <>
              <EyeOff className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
              Visa förbättrad
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
              Visa nuvarande
            </>
          )}
        </button>
      </div>

      {showOriginal ? (
        <p className="whitespace-pre-wrap text-sm italic leading-relaxed text-ink-3">
          {currentText || 'Ingen tidigare text.'}
        </p>
      ) : (
        <HighlightedText
          text={improvedText}
          keywords={keywords}
          detectNumbers={detectNumbers}
        />
      )}
    </div>
  );
}
