'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/shell/PageHeader';
import EmptyState from '@/components/shell/EmptyState';
import StatusRow from '@/components/shell/StatusRow';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import { IlluTomMapp } from '@/components/illustrations/TradenScener';
import ConversationList from './ConversationList';
import ConversationThread from './ConversationThread';
import PendingRequestPanel from './PendingRequestPanel';
import { type CandidateInterest } from './hubTypes';

/**
 * Vilken tråd som ska vara vald från början: ?interest= om den finns i
 * listan, annars första pending, annars första aktiva, annars första i
 * listan. Oförändrad regel, bara lyft ut så den kan köras både som
 * state-initiering och i effekten.
 */
function pickInitialInterestId(
  interests: CandidateInterest[],
  deepLinkId: string | null
): string | null {
  if (deepLinkId && interests.some((i) => i.id === deepLinkId)) {
    return deepLinkId;
  }
  const pending = interests.find((i) => i.status === 'pending');
  const active = interests.find((i) => i.status === 'accepted');
  return pending?.id ?? active?.id ?? interests[0]?.id ?? null;
}

/**
 * Kandidatens meddelande-hub.
 *
 * Listan kommer serverrenderad från /dashboard/meddelanden. Hämtar bara själv
 * när den saknar initialdata, alltså när den monteras utanför den sidan.
 *
 * Desktop: tvåpanel (lista vänster, tråd/pending-panel höger). Mobil: lista
 * som växlar till tråd i fullskärm via state (ingen route-ändring).
 */
export default function MessageHub({
  userId,
  deepLinkId,
  initialInterests = null,
  initialLoadFailed = false,
}: {
  userId: string | null;
  deepLinkId: string | null;
  /** Redan hämtad lista. Är den satt fetchar huben ingenting vid montering. */
  initialInterests?: CandidateInterest[] | null;
  initialLoadFailed?: boolean;
}) {
  const [interests, setInterests] = useState<CandidateInterest[] | null>(
    initialInterests
  );
  const [error, setError] = useState(initialLoadFailed);
  // Med serverdata väljs tråden redan i första render. Att låta effekten
  // nedan göra valet hade betytt att första målningen saknade vald tråd och
  // att högerpanelen bytte innehåll direkt efteråt.
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    initialInterests ? pickInitialInterestId(initialInterests, deepLinkId) : null
  );
  const [responding, setResponding] = useState<string | null>(null);
  const [respondError, setRespondError] = useState<string | null>(null);
  // Mobil: 'list' eller 'thread'. Desktop struntar i detta (visar båda).
  const [mobileView, setMobileView] = useState<'list' | 'thread'>(() =>
    initialInterests &&
    deepLinkId &&
    pickInitialInterestId(initialInterests, deepLinkId) === deepLinkId
      ? 'thread'
      : 'list'
  );
  const [initialised, setInitialised] = useState(initialInterests !== null);

  // Kom listan från servern är den redan färsk. Då hämtar vi inte om den,
  // för just den hämtningen var sidans långsammaste steg.
  const hasInitialData = initialInterests !== null;

  useEffect(() => {
    if (hasInitialData) return;
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
  }, [hasInitialData]);

  // Init selectedId: ?interest= om giltigt, annars första pending, annars
  // första aktiva, annars första i listan. Körs en gång när datat landat.
  useEffect(() => {
    if (initialised || interests === null) return;
    const next = pickInitialInterestId(interests, deepLinkId);
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
    return <LoadingSkeleton variant="list" count={4} label="Hämtar dina meddelanden" />;
  }

  if (interests.length === 0) {
    const STEPS = [
      'Gör dig synlig i Bli upptäckt',
      'En rekryterare hör av sig',
      'Ni chattar direkt här',
    ];
    return (
      <div className="space-y-4">
        {/* Tomma läget är hela sidan, så rubriken är sidans h1. */}
        <PageHeader
          title="Inga meddelanden än"
          description="Här landar dina samtal med rekryterare som visat intresse."
        />

        <section className="rounded-xl border border-kant bg-panel p-4">
          <h2 className="text-sm font-medium text-ink-3">Så kommer de igång</h2>
          <ol className="mt-2 divide-y divide-kant border-t border-kant">
            {STEPS.map((step, i) => (
              <li key={step} className="flex items-center gap-3 py-3">
                <span className="w-5 shrink-0 text-meta tabular-nums text-ink-3">{i + 1}.</span>
                <span className="text-sm text-ink-2">{step}</span>
              </li>
            ))}
          </ol>

          <Link
            href="/dashboard/bli-upptackt"
            className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white hover:bg-ink-hover"
          >
            Gå till Bli upptäckt
          </Link>
        </section>
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
    <div className="flex h-full items-center justify-center p-8">
      <EmptyState
        bare
        illustration={IlluTomMapp}
        title="Ingen konversation vald"
        description="Välj en konversation i listan till vänster."
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Meddelanden"
        description="Rekryterare som vill nå dig, och era konversationer. Accepterar du delas ditt namn och din e-post, och chatten öppnas."
      />

      {(error || respondError) && (
        <StatusRow tone="warm" showDot label="Problem med meddelandena">
          {respondError ?? 'Vi kunde inte hämta dina meddelanden. Ladda om sidan.'}
        </StatusRow>
      )}

      <div className="h-[640px] overflow-hidden rounded-xl border border-kant bg-panel">
        <div className="flex h-full">
          {/* Vänster: lista. Mobil döljs när en tråd är öppen. */}
          <div
            className={`${
              mobileView === 'thread' ? 'hidden' : 'flex'
            } w-full flex-col border-kant lg:flex lg:w-[348px] lg:shrink-0 lg:border-r`}
          >
            <ConversationList
              interests={interests}
              selectedId={selectedId}
              respondingId={responding}
              onSelect={handleSelect}
              onRespond={respond}
            />
          </div>

          {/* Höger: tråd eller pending. Mobil visas bara när en tråd är öppen. */}
          <div
            className={`${
              mobileView === 'thread' ? 'flex' : 'hidden'
            } min-w-0 flex-1 flex-col lg:flex`}
          >
            {rightPanel}
          </div>
        </div>
      </div>
    </div>
  );
}
