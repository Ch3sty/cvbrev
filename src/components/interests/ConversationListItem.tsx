'use client';

import { initialFor, type CandidateInterest } from './hubTypes';

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
 * En rad i konversationslistan (Tråden, "Hubbar och listor").
 *
 * Rad = 32 px cirkel i insunken med initial, namn, senaste raden, tid till
 * höger. Olästa markeras med en punkt i ink-1 och vikt 500, aldrig orange.
 * Vald rad = bg-insunken. Status skrivs som text: väntar i varning, avböjd i
 * ink-3. Inga piller, inga knappar i raden: acceptera/avböj bor i
 * PendingRequestPanel så att vyn har en primär handling.
 */
export default function ConversationListItem({
  interest,
  selected,
  busy,
  onSelect,
}: {
  interest: CandidateInterest;
  selected: boolean;
  busy: boolean;
  onSelect: () => void;
  /** Behålls i kontraktet, men raden visar inga knappar längre. */
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
      aria-current={selected ? 'true' : undefined}
      aria-busy={busy || undefined}
      className={`flex w-full min-h-14 items-center gap-3 px-4 py-3 text-left transition-colors ${
        selected ? 'bg-insunken' : 'hover:bg-insunken'
      } ${isDeclined ? 'text-ink-3' : ''}`}
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-insunken text-meta font-medium text-ink-2"
        aria-hidden="true"
      >
        {initialFor(interest.companyName)}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          {unread && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-ink-1" aria-hidden="true" />
          )}
          <span
            className={`truncate text-sm font-medium ${isDeclined ? 'text-ink-3' : 'text-ink-1'}`}
          >
            {interest.companyName}
          </span>
          <span className="ml-auto shrink-0 text-meta text-ink-3">
            {relativeTime(interest.respondedAt ?? interest.createdAt)}
          </span>
        </span>

        <span className="mt-0.5 flex items-center gap-2">
          {isDeclined ? (
            <span className="text-meta text-ink-3">Avböjd</span>
          ) : isPending ? (
            <span className="text-meta text-varning">Väntar på ditt svar</span>
          ) : (
            <span
              className={`truncate text-meta ${unread ? 'font-medium text-ink-1' : 'text-ink-3'}`}
            >
              {snippet}
            </span>
          )}
          {unread && (
            <span className="sr-only">{interest.unreadCount} olästa</span>
          )}
        </span>
      </span>
    </button>
  );
}
