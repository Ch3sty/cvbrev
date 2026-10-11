'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCandidateInterests } from '@/hooks/useCandidateInterests';
import { useUiFlag } from '@/hooks/useUiFlag';
import { IkonMeddelanden } from '@/components/illustrations/Ikoner';
import { IkonX } from '@/components/illustrations/RumSymboler';

/**
 * Meddelanden från rekryterare i toppraden (spec-rummen 4.2 och avsnitt 0).
 *
 * Ikonknappen står till vänster om avataren bara när något är oläst eller
 * ett svar väntar. Annars syns den inte: Bli upptäckt nås från Jobbsöket.
 * Toppraden har en fast höjd (60 px), så att knappen dyker upp sent flyttar
 * ingenting i höjdled. Första gången man blivit synlig visas en
 * engångspopover som förklarar ikonen, och då står knappen också.
 */
export default function MessagesHeaderButton({ pa = 'vagg' }: { pa?: 'vagg' | 'golv' } = {}) {
  const { pending, unread, isVisible, loaded } = useCandidateInterests();
  const [popoverSeen, markPopoverSeen] = useUiFlag('header_messages_popover');
  const [popoverClosed, setPopoverClosed] = useState(false);

  if (!loaded || !isVisible) return null;

  const badge = pending + unread;
  const showPopover = !popoverSeen && !popoverClosed;
  if (badge === 0 && !showPopover) return null;

  return (
    <div className="relative flex items-center">
      <Link
        href="/dashboard/meddelanden"
        aria-label={
          badge > 0
            ? `Meddelanden från rekryterare, ${badge} olästa`
            : 'Meddelanden från rekryterare'
        }
        title="Meddelanden från rekryterare"
        className={`relative inline-flex h-11 w-11 touch-manipulation items-center justify-center rounded-[10px] text-current transition-colors ${
          pa === 'vagg' ? 'hover:bg-white/10' : 'hover:bg-papper-2'
        }`}
      >
        <IkonMeddelanden size={22} />
        {badge > 0 && (
          <span
            aria-hidden="true"
            className={`absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-koppar ring-2 ${pa === 'vagg' ? 'ring-vagg' : 'ring-papper'}`}
          />
        )}
      </Link>

      {/* Engångspopover första gången man blivit synlig. Svävar, får skugga. */}
      {showPopover && (
        <div
          className="absolute right-0 top-[52px] z-50 w-[264px] rounded-2xl border border-kant bg-papper p-4 text-ink-1 shadow-svav [--fokus:var(--koppar-ink)]"
          role="dialog"
          aria-label="Om meddelanden"
        >
          <button
            type="button"
            onClick={() => {
              setPopoverClosed(true);
              markPopoverSeen();
            }}
            aria-label="Stäng"
            className="absolute right-1 top-1 inline-flex h-11 w-11 items-center justify-center rounded-[10px] text-ink-3 hover:bg-papper-2 hover:text-ink-1"
          >
            <IkonX size={16} />
          </button>
          <p className="text-steg uppercase text-ink-3">Nyhet</p>
          <p className="mt-1 text-sm font-semibold leading-5 text-ink-1">Här dyker rekryterare upp</p>
          <p className="mt-1 text-meta text-ink-2">
            Du är nu synlig. När en rekryterare vill komma i kontakt hamnar
            meddelandet här.
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setPopoverClosed(true);
                markPopoverSeen();
              }}
              className="flex min-h-[44px] items-center text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1"
            >
              Uppfattat
            </button>
            <Link
              href="/dashboard/meddelanden"
              onClick={markPopoverSeen}
              className="inline-flex h-11 items-center rounded-xl border border-kant-stark bg-papper px-4 text-sm font-semibold text-ink-1"
            >
              Visa mig
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
