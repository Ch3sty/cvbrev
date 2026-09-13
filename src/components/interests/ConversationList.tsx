'use client';

import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import ConversationListItem from './ConversationListItem';
import type { CandidateInterest } from './hubTypes';

/**
 * Listan: sökfält och grupperade konversationer i EN panel med divide-y
 * (Tråden, "Hubbar och listor"). Ordning: väntande, aktiva, avböjda
 * (hopfällda som standard). Sektionsetiketter i 14/500 ink-3.
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
    <div className="flex h-full flex-col">
      <div className="border-b border-kant p-3">
        <label htmlFor="meddelanden-sok" className="sr-only">
          Sök företag
        </label>
        <input
          id="meddelanden-sok"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sök företag"
          className="h-11 w-full rounded-lg border border-kant bg-insunken px-3 text-base text-ink-1 shadow-insunken placeholder:text-ink-3 focus:border-kant-stark focus:bg-panel focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-meta text-ink-3">
            {query.trim() ? 'Inga träffar.' : 'Inga meddelanden än.'}
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
          <Group label="Samtal">
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
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setDeclinedOpen((v) => !v)}
              aria-expanded={declinedOpen}
              className="flex min-h-11 w-full items-center gap-1.5 px-4 text-sm font-medium text-ink-3 transition-colors hover:text-ink-1"
            >
              <ChevronDown
                size={20}
                strokeWidth={1.75}
                className={`transition-transform ${declinedOpen ? '' : '-rotate-90'}`}
                aria-hidden="true"
              />
              Avböjda ({declined.length})
            </button>
            {declinedOpen && (
              <div className="divide-y divide-kant border-t border-kant">
                {declined.map((i) => (
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
        )}
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pt-2">
      <p className="px-4 py-2 text-sm font-medium text-ink-3">{label}</p>
      <div className="divide-y divide-kant border-t border-kant">{children}</div>
    </div>
  );
}
