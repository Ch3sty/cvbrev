'use client';

/**
 * Luckan för Smart val på gratisnivån (profil-registrering 2026-09-24,
 * Del A). Spärren läser subscriptionTier, så alla tre paketen öppnar
 * funktionen: rubriken säger "när du har ett paket", och priset står med
 * paketnamnen (regel R1). Handlingen är en ink-knapp till prenumerationen,
 * det sekundära en textlänk. Bygger på shell/Sheet.
 */

import Link from 'next/link';
import Sheet from '@/components/shell/Sheet';
import MarginPlate from '@/components/shell/MarginPlate';
import { IlluPlattaSmartTon } from '@/components/illustrations/TradenScener';
import { SMART_VAL } from '../profil-copy';

export type PremiumFeature = 'smart-tone';

interface PremiumGateModalProps {
  feature: PremiumFeature | null;
  onClose: () => void;
}

export default function PremiumGateModal({ feature, onClose }: PremiumGateModalProps) {
  return (
    <Sheet
      open={feature !== null}
      onClose={onClose}
      title={SMART_VAL.rubrik}
      footer={
        <div className="flex flex-col items-center gap-1">
          <Link
            href="/dashboard/profil/prenumeration"
            onClick={onClose}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-hover"
          >
            {SMART_VAL.knapp}
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1"
          >
            {SMART_VAL.senare}
          </button>
        </div>
      }
    >
      <div className="flex items-start gap-3">
        <MarginPlate>
          <IlluPlattaSmartTon size={48} />
        </MarginPlate>
        <div className="min-w-0 flex-1">
          <p className="text-steg uppercase text-accent-ink">{SMART_VAL.eyebrow}</p>
          <p className="mt-1 text-sm leading-[22px] text-ink-2">{SMART_VAL.text}</p>
          <ul className="mt-3 space-y-1.5">
            {SMART_VAL.rader.map((rad) => (
              <li key={rad} className="flex items-start gap-2 text-sm leading-[22px] text-ink-2">
                <svg viewBox="0 0 20 20" width="16" height="16" className="mt-[3px] shrink-0 text-positiv" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 10.5l4 4 8-9" />
                </svg>
                {rad}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-meta text-ink-3">{SMART_VAL.pris}</p>
        </div>
      </div>
    </Sheet>
  );
}
