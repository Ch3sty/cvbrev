'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, MessageSquare, X } from 'lucide-react';
import { useCandidateInterests } from '@/hooks/useCandidateInterests';
import { useUiFlag } from '@/hooks/useUiFlag';

/**
 * Rekryteringens ingång i dashboardheadern. Anpassar sig efter läget så den
 * lyfter funktionen utan att bli en tom pill:
 *   - INTE synlig: en inbjudande knapp ("Bli hittad av rekryterare") som leder
 *     till Bli upptäckt. Ingen meddelande-ikon, det finns inget att chatta om.
 *   - SYNLIG: en ren statusmarkör + meddelande-ikon (indigo, skild från
 *     notisklockans orange). Sköter BARA konversationer, klockan sköter
 *     händelser.
 *   - VÄNTAR: röd pulsande status + badge när ett svar väntar.
 * Första gången man blir synlig visas en engångspopover som förklarar ikonen.
 */
export default function MessagesHeaderButton() {
  const { pending, unread, isVisible, loaded } = useCandidateInterests();
  const [popoverSeen, markPopoverSeen] = useUiFlag('header_messages_popover');
  const [popoverClosed, setPopoverClosed] = useState(false);

  if (!loaded) return null;

  // --- INTE synlig: inbjudan att göra sig synlig -----------------------------
  if (!isVisible) {
    return (
      <Link
        href="/dashboard/bli-upptackt"
        className="group hidden sm:inline-flex items-center gap-2.5 rounded-xl border border-orange-100 bg-white pl-1.5 pr-3.5 py-1.5 min-h-[44px] transition-all hover:-translate-y-0.5 hover:border-orange-200"
        title="Bli hittad av rekryterare"
      >
        <span
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0"
          style={{ background: '#EA580C' }}
          aria-hidden="true"
        >
          <Search className="w-4 h-4" strokeWidth={2.5} />
        </span>
        <span className="text-left leading-tight">
          <span className="block text-xs font-semibold text-neutral-900">
            Bli hittad av rekryterare
          </span>
          <span className="block text-xs font-bold text-orange-600">
            Låt jobben komma till dig
          </span>
        </span>
      </Link>
    );
  }

  // --- SYNLIG (och ev. väntande) --------------------------------------------
  const waiting = pending > 0;
  const badge = pending + unread;
  const showPopover = !popoverSeen && !popoverClosed;

  return (
    <div className="relative flex items-center gap-2 sm:gap-2.5">
      {/* Statusmarkör, ren och diskret. Dold på mycket smala skärmar. */}
      <span
        className={`hidden md:inline-flex items-center gap-2 ${
          waiting ? 'text-red-700' : 'text-neutral-500'
        }`}
      >
        <span
          className={`w-[7px] h-[7px] rounded-full ${waiting ? 'bg-red-500' : 'bg-emerald-500'}`}
          style={{
            boxShadow: waiting ? '0 0 0 3px #FEE2E2' : '0 0 0 3px #D1FAE5',
          }}
          aria-hidden="true"
        />
        <span className="text-xs font-bold whitespace-nowrap">
          {waiting
            ? `${pending} rekryterare väntar`
            : 'Synlig för rekryterare'}
        </span>
      </span>

      {/* Meddelande-ikon (länk till hubben) */}
      <Link
        href="/dashboard/meddelanden"
        aria-label={
          badge > 0
            ? `Meddelanden från rekryterare, ${badge} olästa`
            : 'Meddelanden från rekryterare'
        }
        title="Meddelanden från rekryterare"
        className="relative touch-manipulation h-11 w-11 flex items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors"
      >
        <MessageSquare className="w-5 h-5" strokeWidth={2} />
        {/* Samma diskreta prick som klockan. Den blå rutan gjorde ikonen till
            en egen färgyta i en header som ska vara neutral, och siffran var
            ett antal man ändå inte agerar på. */}
        {badge > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-600 ring-2 ring-white"
          />
        )}
      </Link>

      {/* Engångspopover första gången man blivit synlig */}
      {showPopover && (
        <div
          className="absolute top-[52px] right-0 z-50 w-[264px] bg-white rounded-xl border border-indigo-100 p-4"
          role="dialog"
          aria-label="Om meddelanden"
        >
          <span
            className="absolute -top-[7px] right-[14px] w-3 h-3 bg-white border-l border-t border-indigo-100"
            style={{ transform: 'rotate(45deg)' }}
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={() => {
              setPopoverClosed(true);
              markPopoverSeen();
            }}
            aria-label="Stäng"
            className="absolute top-2.5 right-2.5 text-neutral-300 hover:text-neutral-500"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
          <div className="text-xs font-bold uppercase tracking-[0.12em] text-indigo-600 mb-1">
            Nyhet
          </div>
          <p className="text-[14px] font-bold text-neutral-900 leading-snug">
            Här dyker rekryterare upp
          </p>
          <p className="text-xs text-neutral-500 leading-relaxed mt-1.5">
            Du är nu synlig. När en rekryterare vill komma i kontakt hamnar
            meddelandet här.
          </p>
          <div className="flex items-center justify-between mt-3">
            <button
              type="button"
              onClick={() => {
                setPopoverClosed(true);
                markPopoverSeen();
              }}
              className="text-xs text-neutral-400 hover:text-neutral-600 min-h-[44px] flex items-center"
            >
              Uppfattat
            </button>
            <Link
              href="/dashboard/meddelanden"
              onClick={markPopoverSeen}
              className="text-xs font-bold text-white rounded-lg px-3.5 min-h-[44px] flex items-center"
              style={{ background: '#4F46E5' }}
            >
              Visa mig
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
