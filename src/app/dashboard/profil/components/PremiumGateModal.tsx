'use client';

/**
 * Luckan för Smart val på gratisnivån (profil-registrering 2026-09-24,
 * Del A), en betalvägg: rubriken säger Premium, prisraden fulla namnet och
 * kopparknappen ur kopKnapp() går direkt till köpsteget
 * med platsen. Det sekundära är en textlänk. betalvagg_visad en gång per
 * öppning. Bygger på shell/Sheet.
 */

import { KNAPP_PRIMAR } from '@/components/shell/knappar'
import Link from 'next/link';
import Sheet from '@/components/shell/Sheet';
import { SMART_VAL } from '../profil-copy';
import { SALD_PLAN } from '@/lib/plans/plans';
import { kopstegHref } from '@/lib/onboarding/steps';
import { useBetalvaggVisad } from '@/hooks/useBetalvaggVisad';

/** Monteras bara när arket är öppet, så mätningen blir en gång per öppning. */
function Matning() {
  useBetalvaggVisad('smart_ton');
  return null;
}

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
            href={kopstegHref(SALD_PLAN, 'smart_ton')}
            onClick={onClose}
            className={KNAPP_PRIMAR}
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
      {feature ? <Matning /> : null}
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-steg uppercase text-koppar-ink">{SMART_VAL.eyebrow}</p>
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
          <p className="mt-3 text-sm font-medium text-ink-1">{SMART_VAL.pris}</p>
        </div>
      </div>
    </Sheet>
  );
}
