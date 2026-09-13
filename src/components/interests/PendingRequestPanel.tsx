'use client';

import { ChevronLeft } from 'lucide-react';
import MarginPlate from '@/components/shell/MarginPlate';
import { IlluPlattaAnsokan } from '@/components/illustrations/TradenScener';
import { type CandidateInterest } from './hubTypes';

/**
 * Högerpanelen när vald konversation är pending. Ingen chatt-UI (backend
 * spärrar tråden tills kandidaten accepterat): bara företagets önskan,
 * meddelandet och de två svaren, med vad de betyder skrivet under.
 */
export default function PendingRequestPanel({
  interest,
  busy,
  onRespond,
  onBack,
}: {
  interest: CandidateInterest;
  busy: boolean;
  onRespond: (action: 'accept' | 'decline') => void;
  onBack?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-panel">
      {onBack && (
        <div className="flex items-center gap-2 border-b border-kant px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={onBack}
            className="-ml-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-2 hover:bg-insunken hover:text-ink-1"
            aria-label="Tillbaka till listan"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
          </button>
          <span className="truncate text-kort text-ink-1">{interest.companyName}</span>
        </div>
      )}

      <div className="flex flex-1 items-center justify-center overflow-y-auto p-6">
        <div className="w-full max-w-md">
          <MarginPlate className="mb-4">
            <IlluPlattaAnsokan size={48} />
          </MarginPlate>

          <h2 className="text-fraga text-ink-1">
            {interest.companyName} vill komma i kontakt
          </h2>
          {interest.contactName && (
            <p className="mt-1 text-meta text-ink-3">{interest.contactName}</p>
          )}

          {interest.message && (
            <p className="mt-4 rounded-lg border border-kant bg-insunken px-4 py-3 text-sm leading-[22px] text-ink-2 shadow-insunken">
              {interest.message}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              type="button"
              disabled={busy}
              onClick={() => onRespond('accept')}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white hover:bg-ink-hover disabled:opacity-40"
            >
              Acceptera
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onRespond('decline')}
              className="inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1 disabled:no-underline disabled:opacity-40"
            >
              Avböj
            </button>
          </div>

          <p className="mt-4 text-meta text-ink-3">
            Accepterar du delas ditt namn och din e-postadress med{' '}
            {interest.companyName}, och chatten öppnas här. Avböjer du förblir din
            profil anonym.
          </p>
        </div>
      </div>
    </div>
  );
}
