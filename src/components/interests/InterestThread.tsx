'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';

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
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="max-h-64 overflow-y-auto px-3 py-3 space-y-2 bg-slate-50/40">
        {messages === null ? (
          <p className="text-[12.5px] text-slate-400 text-center py-4">Laddar meddelanden...</p>
        ) : messages.length === 0 ? (
          <p className="text-[12.5px] text-slate-400 text-center py-4">
            Inga meddelanden ännu. Skriv det första.
          </p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[80%]">
                <div
                  className={`rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${
                    m.mine
                      ? 'text-white rounded-br-sm'
                      : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'
                  }`}
                  style={m.mine ? { background: 'linear-gradient(135deg, #F97316, #DC2626)' } : undefined}
                >
                  {m.body}
                </div>
                <p className={`text-[10.5px] text-slate-400 mt-0.5 ${m.mine ? 'text-right' : ''}`}>
                  {timeLabel(m.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      {error && (
        <p className="px-3 pt-2 text-[12px] text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-end gap-2 p-2.5 border-t border-slate-100">
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
          placeholder="Skriv ett meddelande..."
          className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-[13px] text-slate-700 focus:outline-none focus:border-orange-300 max-h-24"
        />
        <button
          type="button"
          onClick={send}
          disabled={sending || !draft.trim()}
          className="flex-shrink-0 min-h-[40px] px-3.5 rounded-xl text-white text-[13px] font-bold inline-flex items-center gap-1.5 disabled:opacity-40 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
        >
          <Send className="w-3.5 h-3.5" aria-hidden="true" />
          Skicka
        </button>
      </div>
    </div>
  );
}
