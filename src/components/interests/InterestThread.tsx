'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface ThreadMessage {
  id: string;
  senderRole: 'candidate' | 'recruiter';
  body: string;
  createdAt: string;
  mine: boolean;
}

function timeLabel(iso: string): string {
  try {
    return new Date(iso).toLocaleString('sv-SE', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

/**
 * Delad meddelandetråd för ett accepterat intresse. Används av både kandidatens
 * InterestsCard och rekryterarens inbox. Läser/skriver mot
 * /api/interests/[id]/messages (rollen härleds serverside).
 */
export default function InterestThread({ interestId }: { interestId: string }) {
  const [messages, setMessages] = useState<ThreadMessage[] | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/interests/${interestId}/messages`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessages(data.messages ?? []);
    } catch {
      setMessages([]);
    }
  }, [interestId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  const send = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/interests/${interestId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setMessages((prev) => [...(prev ?? []), data.message]);
      setDraft('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Det gick inte att skicka.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-kant bg-panel">
      <div className="max-h-64 space-y-2 overflow-y-auto px-3 py-3">
        {messages === null ? (
          <p className="py-4 text-center text-meta text-ink-3">Hämtar meddelanden</p>
        ) : messages.length === 0 ? (
          <p className="py-4 text-center text-meta text-ink-3">
            Inga meddelanden än. Skriv det första.
          </p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[80%]">
                <div
                  className={`whitespace-pre-wrap break-words rounded-xl px-3 py-2 text-sm leading-[22px] ${
                    m.mine
                      ? 'bg-ink-1 text-white'
                      : 'border border-kant bg-insunken text-ink-2'
                  }`}
                >
                  {m.body}
                </div>
                <p className={`mt-0.5 text-meta text-ink-3 ${m.mine ? 'text-right' : ''}`}>
                  {timeLabel(m.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      {error && (
        <p className="px-3 pt-2 text-meta text-fel" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-end gap-2 border-t border-kant p-2.5">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          enterKeyHint="send"
          placeholder="Skriv ett meddelande"
          className="max-h-24 min-h-11 flex-1 resize-none rounded-lg border border-kant bg-insunken px-3 py-2 text-base leading-[22px] text-ink-1 shadow-insunken placeholder:text-ink-3 focus:border-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1"
        />
        <button
          type="button"
          onClick={send}
          disabled={sending || !draft.trim()}
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white hover:bg-ink-hover disabled:opacity-40"
        >
          Skicka
        </button>
      </div>
    </div>
  );
}
