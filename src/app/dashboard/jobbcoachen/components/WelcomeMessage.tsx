'use client';

import { KNAPP_SEKUNDAR_SMAL } from '@/components/shell/knappar'
import { ArrowRight } from '@/components/illustrations/RumIkoner';
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
      {/* Vyns rubrik står på väggen (JobbcoachenLayout); raden står kvar här. */}
      <div>
        <p className="text-sm leading-[22px] text-ink-2">
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
                className={`${KNAPP_SEKUNDAR_SMAL} mt-3`}
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
