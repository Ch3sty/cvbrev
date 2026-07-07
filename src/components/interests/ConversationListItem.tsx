'use client';

import { Check, X } from 'lucide-react';
import {
  AVATAR_BG,
  AVATAR_FG,
  HUB_GRADIENT,
  initialFor,
  type CandidateInterest,
} from './hubTypes';

function relativeTime(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '';
  const diff = Date.now() - t;
  const min = Math.round(diff / 60000);
  if (min < 1) return 'Nu';
  if (min < 60) return `${min} min`;
  const hrs = Math.round(min / 60);
  if (hrs < 24) return `${hrs} tim`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days} d`;
  try {
    return new Date(t).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

/**
 * En rad i konversationslistan. Formen växlar med status:
 * pending → accept/avböj direkt i raden, accepted → snippet + oläst,
 * declined → dämpad med "Avböjd"-pill.
 */
export default function ConversationListItem({
  interest,
  selected,
  busy,
  onSelect,
  onRespond,
}: {
  interest: CandidateInterest;
  selected: boolean;
  busy: boolean;
  onSelect: () => void;
  onRespond?: (action: 'accept' | 'decline') => void;
}) {
  const { status } = interest;
  const isPending = status === 'pending';
  const isDeclined = status === 'declined';
  const unread = interest.unreadCount > 0;

  const snippet = interest.message?.trim() || 'Ni är i kontakt. Säg hej.';

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative w-full text-left px-3.5 py-3 transition-colors ${
        isDeclined ? 'opacity-55' : ''
      } ${
        selected
          ? 'bg-orange-50/70'
          : isPending
            ? 'bg-orange-50/40 hover:bg-orange-50/60'
            : 'hover:bg-slate-50'
      }`}
      style={
        isPending
          ? { boxShadow: 'inset 3px 0 0 0 #F97316' }
          : undefined
      }
    >
      <div className="flex items-start gap-3">
        <span
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-[15px] font-bold"
          style={{ background: AVATAR_BG, color: AVATAR_FG }}
          aria-hidden="true"
        >
          {initialFor(interest.companyName)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {isPending && (
              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-orange-500" aria-hidden="true" />
            )}
            <span
              className={`text-[13.5px] text-slate-900 truncate ${
                unread ? 'font-extrabold' : 'font-bold'
              }`}
            >
              {interest.companyName}
            </span>
            <span className="ml-auto flex-shrink-0 text-[11px] text-slate-400">
              {relativeTime(interest.respondedAt ?? interest.createdAt)}
            </span>
          </div>

          {isDeclined ? (
            <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[11px] font-bold">
              Avböjd
            </span>
          ) : (
            <div className="flex items-center gap-2 mt-0.5">
              <p
                className={`text-[12.5px] truncate flex-1 ${
                  unread ? 'text-slate-800 font-semibold' : 'text-slate-500'
                }`}
              >
                {snippet}
              </p>
              {unread && (
                <span
                  className="flex-shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-white text-[11px] font-bold"
                  style={{ background: HUB_GRADIENT }}
                >
                  {interest.unreadCount}
                </span>
              )}
            </div>
          )}

          {isPending && onRespond && (
            <div className="flex items-center gap-2 mt-2.5">
              <button
                type="button"
                disabled={busy}
                onClick={(e) => {
                  e.stopPropagation();
                  onRespond('accept');
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-[12px] font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: HUB_GRADIENT }}
              >
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                Acceptera
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={(e) => {
                  e.stopPropagation();
                  onRespond('decline');
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-[12px] font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
                Avböj
              </button>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
