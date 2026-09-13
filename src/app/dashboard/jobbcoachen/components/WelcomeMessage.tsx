'use client';

import { ArrowRight } from 'lucide-react';
import { IkonBrev, IkonCv } from '@/components/illustrations/Ikoner';
import ChatTrustStrip from './ChatTrustStrip';

interface WelcomeMessageProps {
  cvCount: number;
  letterCount: number;
  onOpenSelector: () => void;
}

export default function WelcomeMessage({
  cvCount,
  letterCount,
  onOpenSelector,
}: WelcomeMessageProps) {
  const total = cvCount + letterCount;
  const hasDocuments = total > 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Vyns enda rubrik. */}
      <div>
        <h1 className="text-h1 text-ink-1">Jobbcoachen</h1>
        <p className="mt-1.5 text-sm leading-[22px] text-ink-2">
          Fråga om lön, intervjuer, arbetsrätt eller ditt CV. Vi svarar med källor du kan kolla själv.
        </p>
      </div>

      <ChatTrustStrip />

      {/* Dokumentdelning */}
      <div className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="mt-px inline-flex shrink-0 items-center gap-1 text-ink-2" aria-hidden="true">
            <IkonCv size={24} />
            <IkonBrev size={24} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-kort text-ink-1">Dela ditt CV eller brev</p>
            <p className="mt-0.5 text-sm leading-[22px] text-ink-2">
              {hasDocuments ? (
                <>
                  Dela CV och personliga brev, så blir svaren kopplade till just ditt yrkesliv.
                  Just nu har du {total} dokument att dela.
                </>
              ) : (
                <>
                  Dela CV och personliga brev, så blir svaren kopplade till just ditt yrkesliv.
                  Skapa något först, så kan vi prata om det.
                </>
              )}
            </p>

            {hasDocuments && (
              <button
                type="button"
                onClick={onOpenSelector}
                className="mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-kant bg-panel px-4 text-sm font-medium text-ink-1 transition-colors hover:border-kant-stark"
              >
                Välj dokument att dela
                <ArrowRight size={20} strokeWidth={1.75} className="text-ink-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
