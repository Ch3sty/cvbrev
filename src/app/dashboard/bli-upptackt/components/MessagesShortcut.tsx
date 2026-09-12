'use client';

import Link from 'next/link';
import { MessageSquare, ArrowRight } from 'lucide-react';

interface Props {
  /** Obesvarade intressen. */
  pending: number;
  /** Olästa meddelanden över accepterade trådar. */
  unread: number;
  /** Antal intressen totalt. Är det noll visas ingen genväg. */
  total: number;
}

/**
 * Genväg till meddelande-hubben, högt upp på Bli upptäckt. När du väntar på
 * svar är det första du vill åt. Renderar ingenting när det inte finns några
 * intressen alls.
 *
 * Siffrorna fetchades förut från /api/candidate/interests vid mount, samma
 * svar som PendingInterestAlert precis ovanför hämtade en gång till. De räknas
 * nu på servern i getPageData.ts och kommer hit som props.
 */
export default function MessagesShortcut({ pending, unread, total }: Props) {
  if (total === 0) return null;

  const badge = pending + unread;
  const parts: string[] = [];
  if (pending > 0) parts.push(`${pending} väntar på ditt svar`);
  if (unread > 0) parts.push(`${unread} ${unread === 1 ? 'oläst konversation' : 'olästa konversationer'}`);
  const line = parts.length > 0 ? parts.join(', ') : 'Öppna dina konversationer med rekryterare';

  return (
    <Link
      href="/dashboard/meddelanden"
      className="flex items-center gap-3.5 rounded-xl border border-orange-100 bg-white p-4 transition-transform hover:-translate-y-0.5"
    >
      <span
        className="relative flex-shrink-0 w-11 h-11 flex items-center justify-center"
        aria-hidden="true"
      >
        <MessageSquare className="w-5 h-5 text-neutral-700" strokeWidth={2.25} />
        {badge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-white text-red-600 border-2 border-white text-xs font-semibold flex items-center justify-center shadow">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[14.5px] font-bold text-neutral-900">Dina meddelanden</div>
        <p className="text-xs text-neutral-500 truncate">{line}</p>
      </div>
      <ArrowRight className="w-5 h-5 text-orange-600 flex-shrink-0" strokeWidth={2.5} aria-hidden="true" />
    </Link>
  );
}
