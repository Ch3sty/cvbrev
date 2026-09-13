'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import EmptyState from '@/components/shell/EmptyState';
import { IlluTomMapp } from '@/components/illustrations/TradenScener';
import { initialFor, type CandidateInterest } from './hubTypes';

interface ThreadMessage {
  id: string;
  senderRole: 'candidate' | 'recruiter';
  body: string;
  createdAt: string;
  mine: boolean;
}

const POLL_MS = 15000;

function timeOfDay(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

/** Datumnyckel (YYYY-MM-DD, lokal tid) för dagsgruppering. */
function dayKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (dayKey(iso) === dayKey(today.toISOString())) return 'Idag';
  if (dayKey(iso) === dayKey(yesterday.toISOString())) return 'Igår';
  return d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' });
}

/** Deras visningsnamn på bubbeletiketten (kontakt eller företag). */
function theirLabel(interest: CandidateInterest): string {
  return (
    interest.recruiterContact?.contactName ||
    interest.contactName ||
    interest.companyName
  );
}

/**
 * Högerpanelens trådvy för ett accepterat intresse. Återanvänder
 * InterestThread-logiken (fetch/skicka mot /api/interests/[id]/messages) men
 * lyfter presentationen: kontaktheader, dagsavdelare, avatarer på deras
 * bubblor, läst-status och alltid synligt skrivfält. Pollar var 15:e sekund.
 */
export default function ConversationThread({
  interest,
  onBack,
}: {
  interest: CandidateInterest;
  onBack?: () => void;
}) {
  const interestId = interest.id;
  const [messages, setMessages] = useState<ThreadMessage[] | null>(null);
  const [theirLastReadAt, setTheirLastReadAt] = useState<string | null>(null);
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
      setTheirLastReadAt(data.theirLastReadAt ?? null);
    } catch {
      setMessages((prev) => prev ?? []);
    }
  }, [interestId]);

  // Ladda vid byte av tråd + polla var 15:e sekund (som InterestThread-mönstret).
  useEffect(() => {
    setMessages(null);
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
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

  const contact = interest.recruiterContact;
  const label = theirLabel(interest);

  // Indexet på mitt sista meddelande (för läst-status).
  const lastMineIdx = useMemo(() => {
    if (!messages) return -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].mine) return i;
    }
    return -1;
  }, [messages]);

  const websiteHref = contact?.website
    ? contact.website.startsWith('http')
      ? contact.website
      : `https://${contact.website}`
    : null;

  return (
    <div className="flex h-full flex-col bg-panel">
      {/* Vem samtalet gäller, plus vägarna att nå dem */}
      <div className="flex items-center gap-3 border-b border-kant px-4 py-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="-ml-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-2 hover:bg-insunken hover:text-ink-1 lg:hidden"
            aria-label="Tillbaka till listan"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
          </button>
        )}
        <span
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-kant bg-insunken text-sm font-semibold text-ink-2"
          aria-hidden="true"
        >
          {initialFor(interest.companyName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-kort text-ink-1">{interest.companyName}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
            {contact?.contactName && (
              <span className="truncate text-meta text-ink-3">
                {[contact.contactName, contact.contactRole].filter(Boolean).join(' · ')}
              </span>
            )}
            {contact?.email && (
              <a
                href={`mailto:${contact.email}`}
                className="text-meta font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
              >
                Mejla
              </a>
            )}
            {contact?.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="text-meta font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
              >
                Ring
              </a>
            )}
            {websiteHref && (
              <a
                href={websiteHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-meta font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
              >
                Webbplats
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Samtalet */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages === null ? (
          <p className="py-6 text-center text-meta text-ink-3">Hämtar meddelanden</p>
        ) : messages.length === 0 ? (
          <EmptyState
            bare
            illustration={IlluTomMapp}
            title={`Ni är i kontakt med ${interest.companyName}`}
            description={`${label} vill höra mer om dig. Säg hej och berätta vad du söker.`}
          />
        ) : (
          <div className="space-y-1">
            {messages.map((m, idx) => {
              const prev = messages[idx - 1];
              const showDay = !prev || dayKey(prev.createdAt) !== dayKey(m.createdAt);
              const startsSequence = !prev || prev.senderRole !== m.senderRole || showDay;
              const isRead =
                m.mine &&
                idx === lastMineIdx &&
                theirLastReadAt !== null &&
                Date.parse(m.createdAt) <= Date.parse(theirLastReadAt);
              const showStatus = m.mine && idx === lastMineIdx;

              return (
                <div key={m.id}>
                  {showDay && (
                    <div className="my-3 flex justify-center">
                      <span className="rounded-md border border-kant bg-panel px-3 py-1 text-meta text-ink-3">
                        {dayLabel(m.createdAt)}
                      </span>
                    </div>
                  )}

                  {!m.mine && startsSequence && (
                    <p className="mb-0.5 ml-9 mt-2 text-meta text-ink-3">{label}</p>
                  )}

                  <div
                    className={`flex items-end gap-2 ${m.mine ? 'justify-end' : 'justify-start'}`}
                  >
                    {!m.mine && (
                      <span
                        className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-meta font-medium ${
                          startsSequence
                            ? 'border border-kant bg-insunken text-ink-2'
                            : 'text-transparent'
                        }`}
                        aria-hidden="true"
                      >
                        {startsSequence ? initialFor(interest.companyName) : ''}
                      </span>
                    )}
                    <div className="max-w-[74%]">
                      <div
                        className={`whitespace-pre-wrap break-words rounded-xl px-3.5 py-2 text-sm leading-[22px] ${
                          m.mine
                            ? 'bg-ink-1 text-white'
                            : 'border border-kant bg-insunken text-ink-2'
                        }`}
                      >
                        {m.body}
                      </div>
                      <div
                        className={`mt-0.5 flex items-center gap-1.5 ${m.mine ? 'justify-end' : ''}`}
                      >
                        <span className="text-meta text-ink-3">{timeOfDay(m.createdAt)}</span>
                        {showStatus && (
                          <span
                            className={`text-meta ${isRead ? 'text-positiv' : 'text-ink-3'}`}
                          >
                            {isRead ? 'Läst' : 'Skickat'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {error && (
        <p className="px-4 pt-2 text-meta text-fel" role="alert">
          {error}
        </p>
      )}

      {/* Skrivfältet */}
      <div className="flex items-end gap-2 border-t border-kant p-3">
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
          className="max-h-28 min-h-11 flex-1 resize-none rounded-lg border border-kant bg-insunken px-3 py-2.5 text-base leading-[22px] text-ink-1 shadow-insunken placeholder:text-ink-3 focus:border-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1"
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
