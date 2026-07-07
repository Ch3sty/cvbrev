'use client';

import { ArrowLeft, Building2, Check, X } from 'lucide-react';
import { HUB_GRADIENT, type CandidateInterest } from './hubTypes';

/**
 * Högerpanelen när vald konversation är pending. Ingen chatt-UI (backend
 * spärrar tråden tills kandidaten accepterat) — bara företagets önskan,
 * citat av meddelandet och accept/avböj med tydlig förklaring.
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
    <div className="flex flex-col h-full bg-white">
      {onBack && (
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 lg:hidden">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 -ml-1 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Tillbaka"
          >
            <ArrowLeft className="w-4.5 h-4.5" aria-hidden="true" />
          </button>
          <span className="text-[13px] font-bold text-slate-900 truncate">
            {interest.companyName}
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <span
            className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center"
            aria-hidden="true"
          >
            <Building2 className="w-8 h-8 text-orange-600" />
          </span>
          <h2 className="text-lg font-extrabold text-slate-900">
            {interest.companyName} vill komma i kontakt
          </h2>
          {interest.contactName && (
            <p className="text-[13px] text-slate-500 mt-1">{interest.contactName}</p>
          )}

          {interest.message && (
            <p className="mt-4 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 text-[13.5px] text-slate-600 leading-relaxed italic text-left">
              &rdquo;{interest.message}&rdquo;
            </p>
          )}

          <div className="flex items-center justify-center gap-2.5 mt-6">
            <button
              type="button"
              disabled={busy}
              onClick={() => onRespond('accept')}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white text-[13.5px] font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: HUB_GRADIENT }}
            >
              <Check className="w-4 h-4" aria-hidden="true" />
              Acceptera
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onRespond('decline')}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-[13.5px] font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              Avböj
            </button>
          </div>

          <p className="mt-4 text-[12.5px] text-slate-500 leading-relaxed max-w-sm mx-auto">
            Om du accepterar delas ditt namn och din e-postadress med{' '}
            {interest.companyName}, och en chatt öppnas här. Avböjer du förblir din
            profil anonym.
          </p>
        </div>
      </div>
    </div>
  );
}
