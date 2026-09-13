'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useCandidateInterests } from '@/hooks/useCandidateInterests';
import { useUiFlag } from '@/hooks/useUiFlag';
import { IkonMeddelanden, IkonSynlig } from '@/components/illustrations/Ikoner';

/**
 * Rekryteringens ingång i toppraden. Anpassar sig efter läget:
 *   - INTE synlig: en lugn textlänk med naken ikon som leder till Bli
 *     upptäckt. Ingen meddelande-ikon, det finns inget att chatta om.
 *   - SYNLIG: statusmarkör (positiv) plus meddelande-ikon. Sköter bara
 *     konversationer, klockan sköter händelser.
 *   - VÄNTAR: statusmarkör i fel-ton och prick när ett svar väntar.
 * Första gången man blir synlig visas en engångspopover som förklarar ikonen.
 * Ingen orange: toppraden är neutral, orange betyder position.
 */
export default function MessagesHeaderButton() {
  const { pending, unread, isVisible, loaded } = useCandidateInterests();
  const [popoverSeen, markPopoverSeen] = useUiFlag('header_messages_popover');
  const [popoverClosed, setPopoverClosed] = useState(false);

  // Båda grenarna nedan renderar en 44 px hög yta i headerns flexrad. Att
  // returnera null tills data landat gjorde att raden växte när knappen kom,
  // vilket mättes som ett layoutskifte. Ytan reserveras i stället.
  if (!loaded) {
    return <div aria-hidden="true" className="hidden h-11 w-11 sm:block" />;
  }

  // --- INTE synlig: inbjudan att göra sig synlig -----------------------------
  if (!isVisible) {
    return (
      <Link
        href="/dashboard/bli-upptackt"
        className="hidden h-11 items-center gap-2 rounded-lg px-2 text-sm font-medium text-ink-2 transition-colors hover:bg-insunken hover:text-ink-1 sm:inline-flex"
        title="Bli hittad av rekryterare"
      >
        <IkonSynlig size={22} className="shrink-0" />
        <span className="hidden md:inline">Bli hittad av rekryterare</span>
      </Link>
    );
  }

  // --- SYNLIG (och ev. väntande) --------------------------------------------
  const waiting = pending > 0;
  const badge = pending + unread;
  const showPopover = !popoverSeen && !popoverClosed;

  return (
    <div className="relative flex items-center gap-1">
      {/* Statusmarkör, dold på smala skärmar. */}
      <span
        className={`hidden items-center gap-2 pr-1 md:inline-flex ${waiting ? 'text-fel' : 'text-ink-3'}`}
      >
        <span
          className={`h-2 w-2 rounded-full ${waiting ? 'bg-fel' : 'bg-positiv'}`}
          aria-hidden="true"
        />
        <span className="whitespace-nowrap text-meta font-medium">
          {waiting ? `${pending} rekryterare väntar` : 'Synlig för rekryterare'}
        </span>
      </span>

      <Link
        href="/dashboard/meddelanden"
        aria-label={
          badge > 0
            ? `Meddelanden från rekryterare, ${badge} olästa`
            : 'Meddelanden från rekryterare'
        }
        title="Meddelanden från rekryterare"
        className="relative inline-flex h-11 w-11 touch-manipulation items-center justify-center rounded-lg text-ink-1 transition-colors hover:bg-insunken"
      >
        <IkonMeddelanden size={22} />
        {badge > 0 && (
          <span
            aria-hidden="true"
            className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-ink-1 ring-2 ring-panel"
          />
        )}
      </Link>

      {/* Engångspopover första gången man blivit synlig. Svävar, får skugga. */}
      {showPopover && (
        <div
          className="absolute right-0 top-[52px] z-50 w-[264px] rounded-xl border border-kant bg-panel p-4 shadow-svav"
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
            className="absolute right-1 top-1 inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-3 hover:bg-insunken hover:text-ink-1"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
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
              className="inline-flex h-11 items-center rounded-lg bg-ink-1 px-4 text-sm font-medium text-white hover:bg-ink-hover"
            >
              Visa mig
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
