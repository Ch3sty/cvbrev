'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { IkonMeddelanden } from '@/components/illustrations/Ikoner';

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
 * intressen alls. En listrad i panel: naken ikon 24, titel, meta, pil.
 *
 * Siffrorna fetchades förut från /api/candidate/interests vid mount, samma
 * svar som PendingInterestAlert precis ovanför hämtade en gång till. De räknas
 * nu på servern i getPageData.ts och kommer hit som props.
 */
export default function MessagesShortcut({ pending, unread, total }: Props) {
  if (total === 0) return null;

  const parts: string[] = [];
  if (pending > 0) parts.push(`${pending} väntar på ditt svar`);
  if (unread > 0) parts.push(`${unread} ${unread === 1 ? 'oläst konversation' : 'olästa konversationer'}`);
  const line = parts.length > 0 ? parts.join(', ') : 'Öppna dina konversationer med rekryterare';

  return (
    <div className="rounded-xl border border-kant bg-panel">
      <Link
        href="/dashboard/meddelanden"
        className="flex min-h-14 items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-insunken"
      >
        <span className="shrink-0 text-ink-2" aria-hidden="true">
          <IkonMeddelanden size={24} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-ink-1">Dina meddelanden</span>
          <span className="block truncate text-meta text-ink-3">{line}</span>
        </span>
        <ArrowRight className="h-5 w-5 shrink-0 text-ink-3" strokeWidth={1.75} aria-hidden="true" />
      </Link>
    </div>
  );
}
