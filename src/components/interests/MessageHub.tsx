'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Inbox as InboxIcon, MessageSquare } from 'lucide-react';
import ConversationList from './ConversationList';
import ConversationThread from './ConversationThread';
import PendingRequestPanel from './PendingRequestPanel';
import { HUB_GRADIENT, type CandidateInterest } from './hubTypes';

/**
 * Kandidatens meddelande-hub. Självhämtande mot /api/candidate/interests.
 * Desktop: tvåpanel (lista vänster, tråd/pending-panel höger). Mobil: lista
 * som växlar till tråd i fullskärm via state (ingen route-ändring).
 */
export default function MessageHub({
  userId,
  deepLinkId,
}: {
  userId: string | null;
  deepLinkId: string | null;
}) {
  const [interests, setInterests] = useState<CandidateInterest[] | null>(null);
  const [error, setError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [responding, setResponding] = useState<string | null>(null);
  const [respondError, setRespondError] = useState<string | null>(null);
  // Mobil: 'list' eller 'thread'. Desktop struntar i detta (visar båda).
  const [mobileView, setMobileView] = useState<'list' | 'thread'>('list');
  const [initialised, setInitialised] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/candidate/interests');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { interests: CandidateInterest[] };
        if (!cancelled) setInterests(data.interests ?? []);
      } catch {
        if (!cancelled) {
          setInterests([]);
          setError(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Init selectedId: ?interest= om giltigt, annars första pending, annars
  // första aktiva, annars första i listan. Körs en gång när datat landat.
  useEffect(() => {
    if (initialised || interests === null) return;
    let next: string | null = null;
    if (deepLinkId && interests.some((i) => i.id === deepLinkId)) {
      next = deepLinkId;
    } else {
      const pending = interests.find((i) => i.status === 'pending');
      const active = interests.find((i) => i.status === 'accepted');
      next = pending?.id ?? active?.id ?? interests[0]?.id ?? null;
    }
    setSelectedId(next);
    if (next && deepLinkId === next) setMobileView('thread');
    setInitialised(true);
  }, [interests, deepLinkId, initialised]);

  const selected = useMemo(
    () => interests?.find((i) => i.id === selectedId) ?? null,
    [interests, selectedId]
  );

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setMobileView('thread');
    // Öppnad = läst: nolla oläst-räknaren lokalt.
    setInterests((prev) =>
      (prev ?? []).map((it) => (it.id === id ? { ...it, unreadCount: 0 } : it))
    );
  }, []);

  const respond = useCallback(
    async (interestId: string, action: 'accept' | 'decline') => {
      setResponding(interestId);
      setRespondError(null);
      const snapshot = interests;
      const newStatus = action === 'accept' ? 'accepted' : 'declined';
      setInterests((prev) =>
        (prev ?? []).map((i) =>
          i.id === interestId
            ? { ...i, status: newStatus, respondedAt: new Date().toISOString() }
            : i
        )
      );
      try {
        const res = await fetch('/api/candidate/interests/respond', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interestId, action }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || `HTTP ${res.status}`);
        }
      } catch {
        setInterests(snapshot);
        setRespondError('Det gick inte att spara ditt svar. Försök igen.');
      } finally {
        setResponding(null);
      }
    },
    [interests]
  );

  const backToList = useCallback(() => setMobileView('list'), []);

  // ---- Laddning / tomt läge ------------------------------------------------
  if (interests === null) {
    return (
      <div className="h-[640px] rounded-3xl bg-white/60 border border-slate-100 animate-pulse" aria-hidden="true" />
    );
  }

  if (interests.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-orange-200 bg-white p-8 sm:p-12 text-center">
        <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center">
          <InboxIcon className="w-6 h-6 text-orange-600" aria-hidden="true" />
        </div>
        <h2 className="text-base font-bold text-slate-900 mb-1.5">Inga meddelanden ännu</h2>
        <p className="text-[13.5px] text-slate-500 leading-relaxed max-w-md mx-auto mb-5">
          När en rekryterare vill komma i kontakt hamnar det här, och du får ett
          mail. Profiler med verifierade testresultat får fler visningar.
        </p>
        <Link
          href="/dashboard/bli-upptackt"
          className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
          style={{ background: HUB_GRADIENT }}
        >
          Stärk din profil
        </Link>
      </div>
    );
  }

  const rightPanel = selected ? (
    selected.status === 'accepted' ? (
      <ConversationThread interest={selected} onBack={backToList} />
    ) : (
      <PendingRequestPanel
        interest={selected}
        busy={responding === selected.id}
        onRespond={(action) => respond(selected.id, action)}
        onBack={backToList}
      />
    )
  ) : (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <span
        className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3"
        aria-hidden="true"
      >
        <MessageSquare className="w-6 h-6 text-slate-300" />
      </span>
      <p className="text-[13.5px] text-slate-400">Välj en konversation till vänster.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Meddelanden</h1>
        <p className="text-[13.5px] text-slate-500 mt-1 leading-relaxed max-w-xl">
          Rekryterare som vill komma i kontakt, och era konversationer. När du
          accepterar delas ditt namn och din e-post, och chatten öppnas.
        </p>
      </div>

      {(error || respondError) && (
        <p
          className="text-[13px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
          role="alert"
        >
          {respondError ?? 'Vi kunde inte hämta dina meddelanden. Ladda om sidan.'}
        </p>
      )}

      <div
        className="rounded-3xl border border-slate-200 bg-white overflow-hidden h-[640px]"
        style={{ boxShadow: '0 4px 20px -12px rgba(2, 6, 23, 0.16)' }}
      >
        <div className="flex h-full">
          {/* Vänster: lista. Mobil döljs när en tråd är öppen. */}
          <div
            className={`${
              mobileView === 'thread' ? 'hidden' : 'flex'
            } lg:flex flex-col w-full lg:w-[348px] lg:flex-shrink-0 lg:border-r border-slate-100`}
          >
            <ConversationList
              interests={interests}
              selectedId={selectedId}
              respondingId={responding}
              onSelect={handleSelect}
              onRespond={respond}
            />
          </div>

          {/* Höger: tråd/pending. Mobil visas bara när en tråd är öppen. */}
          <div
            className={`${
              mobileView === 'thread' ? 'flex' : 'hidden'
            } lg:flex flex-col flex-1 min-w-0`}
          >
            {rightPanel}
          </div>
        </div>
      </div>
    </div>
  );
}
