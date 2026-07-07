'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Check,
  CheckCheck,
  Globe,
  Mail,
  MoreHorizontal,
  Phone,
  Send,
} from 'lucide-react';
import {
  AVATAR_BG,
  AVATAR_FG,
  HUB_GRADIENT,
  initialFor,
  type CandidateInterest,
} from './hubTypes';

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
  const [menuOpen, setMenuOpen] = useState(false);
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
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="lg:hidden flex-shrink-0 w-8 h-8 -ml-1 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Tillbaka"
          >
            <ArrowLeft className="w-4.5 h-4.5" aria-hidden="true" />
          </button>
        )}
        <span
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-[15px] font-bold"
          style={{ background: AVATAR_BG, color: AVATAR_FG }}
          aria-hidden="true"
        >
          {initialFor(interest.companyName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold text-slate-900 truncate leading-tight">
            {interest.companyName}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
            {contact?.contactName && (
              <span className="text-[12px] text-slate-500 truncate">
                {[contact.contactName, contact.contactRole].filter(Boolean).join(' · ')}
              </span>
            )}
            {contact?.email && (
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-orange-700 hover:text-orange-800"
              >
                <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                Mejla
              </a>
            )}
            {contact?.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-600 hover:text-slate-800"
              >
                <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                Ring
              </a>
            )}
            {websiteHref && (
              <a
                href={websiteHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-600 hover:text-slate-800"
              >
                <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                Webb
              </a>
            )}
          </div>
        </div>
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
            aria-label="Fler val"
          >
            <MoreHorizontal className="w-4.5 h-4.5" aria-hidden="true" />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-9 z-10 w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <p className="px-3 py-2 text-[12px] text-slate-400">Inga fler val ännu.</p>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-slate-50/40">
        {messages === null ? (
          <p className="text-[13px] text-slate-400 text-center py-6">Laddar meddelanden...</p>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <span
              className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center mb-4"
              aria-hidden="true"
            >
              <Building2 className="w-7 h-7 text-orange-600" />
            </span>
            <p className="text-[15px] font-bold text-slate-900">
              Ni är nu i kontakt med {interest.companyName}
            </p>
            <p className="text-[13px] text-slate-500 leading-relaxed mt-1.5 max-w-xs">
              {label} vill gärna höra mer om dig. Säg hej och berätta vad du söker.
            </p>
          </div>
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
                    <div className="flex justify-center my-3">
                      <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-500">
                        {dayLabel(m.createdAt)}
                      </span>
                    </div>
                  )}

                  {!m.mine && startsSequence && (
                    <p className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400 ml-9 mb-0.5 mt-2">
                      {label}
                    </p>
                  )}

                  <div className={`flex items-end gap-2 ${m.mine ? 'justify-end' : 'justify-start'}`}>
                    {!m.mine && (
                      <span
                        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
                        style={{
                          background: startsSequence ? AVATAR_BG : 'transparent',
                          color: AVATAR_FG,
                        }}
                        aria-hidden="true"
                      >
                        {startsSequence ? initialFor(interest.companyName) : ''}
                      </span>
                    )}
                    <div className={`max-w-[74%] ${m.mine ? 'items-end' : ''}`}>
                      <div
                        className={`px-3.5 py-2 text-[13px] leading-relaxed whitespace-pre-wrap break-words ${
                          m.mine
                            ? 'text-white rounded-2xl rounded-br-sm'
                            : 'bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-bl-sm'
                        }`}
                        style={m.mine ? { background: HUB_GRADIENT } : undefined}
                      >
                        {m.body}
                      </div>
                      <div
                        className={`flex items-center gap-1 mt-0.5 ${
                          m.mine ? 'justify-end' : ''
                        }`}
                      >
                        <span className="text-[10.5px] text-slate-400">
                          {timeOfDay(m.createdAt)}
                        </span>
                        {showStatus &&
                          (isRead ? (
                            <span className="inline-flex items-center gap-0.5 text-[10.5px] font-semibold text-orange-600">
                              <CheckCheck className="w-3 h-3" aria-hidden="true" />
                              Läst
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-[10.5px] text-slate-400">
                              <Check className="w-3 h-3" aria-hidden="true" />
                              Skickat
                            </span>
                          ))}
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
        <p className="px-4 pt-2 text-[12px] text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* Skrivfält */}
      <div className="flex items-end gap-2 p-3 border-t border-slate-100 bg-white">
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
          className="flex-1 resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-[13px] text-slate-700 focus:outline-none focus:border-orange-300 max-h-28"
        />
        <button
          type="button"
          onClick={send}
          disabled={sending || !draft.trim()}
          className="flex-shrink-0 min-h-[42px] px-4 rounded-xl text-white text-[13px] font-bold inline-flex items-center gap-1.5 disabled:opacity-40 transition-opacity hover:opacity-90"
          style={{ background: HUB_GRADIENT }}
        >
          <Send className="w-3.5 h-3.5" aria-hidden="true" />
          Skicka
        </button>
      </div>
    </div>
  );
}
