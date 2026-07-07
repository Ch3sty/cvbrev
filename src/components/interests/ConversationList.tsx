'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import ConversationListItem from './ConversationListItem';
import type { CandidateInterest } from './hubTypes';

/**
 * Vänsterpanelen: sökfält + grupperade konversationer. Ordning:
 * väntande (orange), aktiva, avböjda (hopfällda default).
 */
export default function ConversationList({
  interests,
  selectedId,
  respondingId,
  onSelect,
  onRespond,
}: {
  interests: CandidateInterest[];
  selectedId: string | null;
  respondingId: string | null;
  onSelect: (id: string) => void;
  onRespond: (id: string, action: 'accept' | 'decline') => void;
}) {
  const [query, setQuery] = useState('');
  const [declinedOpen, setDeclinedOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return interests;
    return interests.filter((i) => i.companyName.toLowerCase().includes(q));
  }, [interests, query]);

  const pending = filtered.filter((i) => i.status === 'pending');
  const active = filtered.filter((i) => i.status === 'accepted');
  const declined = filtered.filter((i) => i.status === 'declined');

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-slate-100">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sök företag"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2 text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-orange-300 focus:bg-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-[13px] text-slate-400">
            {query.trim() ? 'Inga träffar.' : 'Inga meddelanden ännu.'}
          </p>
        )}

        {pending.length > 0 && (
          <Group label="Väntar på ditt svar">
            {pending.map((i) => (
              <ConversationListItem
                key={i.id}
                interest={i}
                selected={i.id === selectedId}
                busy={respondingId === i.id}
                onSelect={() => onSelect(i.id)}
                onRespond={(action) => onRespond(i.id, action)}
              />
            ))}
          </Group>
        )}

        {active.length > 0 && (
          <Group label="Aktiva konversationer">
            {active.map((i) => (
              <ConversationListItem
                key={i.id}
                interest={i}
                selected={i.id === selectedId}
                busy={respondingId === i.id}
                onSelect={() => onSelect(i.id)}
              />
            ))}
          </Group>
        )}

        {declined.length > 0 && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setDeclinedOpen((v) => !v)}
              className="flex items-center gap-1.5 w-full px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${declinedOpen ? '' : '-rotate-90'}`}
                aria-hidden="true"
              />
              Avböjda ({declined.length})
            </button>
            {declinedOpen &&
              declined.map((i) => (
                <ConversationListItem
                  key={i.id}
                  interest={i}
                  selected={i.id === selectedId}
                  busy={false}
                  onSelect={() => onSelect(i.id)}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pt-1">
      <p className="px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <div className="divide-y divide-slate-50">{children}</div>
    </div>
  );
}
