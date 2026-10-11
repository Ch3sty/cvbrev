'use client';

// Detaljvy för en ansökan: metadata, händelsetidslinje och åtgärder.
// Tidslinjen är sanningskällan: händelser kan läggas till och tas bort,
// aktuell status räknas alltid om av databasen.

import { KNAPP_GLAS, KNAPP_PRIMAR, LANK, LANK_VAGG } from '@/components/shell/knappar'
import LyftKort from '@/components/rum/LyftKort'
import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  FileText,
  ExternalLink,
  X,
} from '@/components/illustrations/RumIkoner';
import { useNotification } from '@/context/notificationcontext';
import {
  CHANNEL_META,
  STATUS_META,
  shouldShowNoResponseNudge,
  type ApplicationEventType,
  type JobApplication,
  type JobApplicationEvent,
} from '@/lib/applications/status';
import { StatusPill, formatDateLong, formatDateShort, daysSince } from '../components/StatusBits';
import RumHuvud from '@/components/rum/RumHuvud';
import Golv from '@/components/rum/Golv';
import VaggLaddar from '@/components/rum/VaggLaddar';
import ConfirmDialog from '@/components/shell/ConfirmDialog';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import type { CreateApplicationInput } from '@/hooks/use-applications';

// Båda arken öppnas först efter en tryckning, så de hämtas vid behov.
const AddEventSheet = dynamic(() => import('../components/AddEventSheet'), { ssr: false });
const QuickLogSheet = dynamic(() => import('../components/QuickLogSheet'), { ssr: false });

/**
 * SheetShell animerar ut via AnimatePresence, men bara om arket får vara kvar
 * medan utgången spelar. Den här kroken håller det monterat tills animationen
 * hunnit klart, så stängningen ser likadan ut som före lazy-laddningen.
 */
function useDeferredUnmount(open: boolean, exitMs = 300): boolean {
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    if (!mounted) return;
    const timer = setTimeout(() => setMounted(false), exitMs);
    return () => clearTimeout(timer);
  }, [open, mounted, exitMs]);

  return mounted;
}

/**
 * Tidslinjens prickar. STATUS_META.dotClass bär den gamla färgskalan och
 * används av delade ytor utanför inloggat läge, så den ligger kvar orörd.
 * Här mappas händelsetypen till tokens i stället: ink genomgående, positiv
 * för erbjudande och accepterat.
 */
const DOT_TONE: Partial<Record<ApplicationEventType, string>> = {
  offer_received: 'bg-positiv',
  accepted: 'bg-positiv',
  rejected: 'bg-kant-stark',
  declined: 'bg-kant-stark',
  no_response: 'bg-kant-stark',
};

export interface ApplicationDetail extends JobApplication {
  events: JobApplicationEvent[];
  letter: { id: string; title: string | null } | null;
}

export default function ApplicationDetailClient({
  applicationId,
  initialDetail,
}: {
  applicationId: string;
  /** Serverhämtad ansökan med händelser. Är den satt står hela tidslinjen i
      första HTML och klienten gör ingen rundtur före första målningen. */
  initialDetail: ApplicationDetail | null;
}) {
  const router = useRouter();
  const { successWithActivity, success } = useNotification();

  const [detail, setDetail] = useState<ApplicationDetail | null>(initialDetail);
  const [isLoading, setIsLoading] = useState(!initialDetail);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  // Native confirm blockerar tråden och ser ut som ett webbläsarfel.
  // ConfirmDialog bär bekräftelserna i stället, en per handling.
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [confirmDeleteApplication, setConfirmDeleteApplication] = useState(false);
  const addEventMounted = useDeferredUnmount(showAddEvent);
  const editMounted = useDeferredUnmount(showEdit);

  const load = useCallback(async () => {
    if (!applicationId) return;
    try {
      const res = await fetch(`/api/applications/${applicationId}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setDetail(json.data as ApplicationDetail);
      } else {
        router.replace('/dashboard/sokta-tjanster');
      }
    } catch (error) {
      console.error('Kunde inte hämta ansökan:', error);
    } finally {
      setIsLoading(false);
    }
  }, [applicationId, router]);

  useEffect(() => {
    // Servern hann före. Klienten hämtar bara om när något ändrats.
    if (initialDetail) return;
    load();
  }, [load, initialDetail]);

  const completedInterviews = (detail?.events ?? []).filter(
    (e) => e.event_type === 'interview_completed'
  ).length;

  const handleAddEvent = async (input: {
    event_type: ApplicationEventType;
    occurred_at: string;
    note: string | null;
  }) => {
    const res = await fetch(`/api/applications/${applicationId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Kunde inte spara händelsen');
    }
    await load();
    successWithActivity(
      'Händelse sparad.',
      'application_event_added',
      `Ny händelse: ${STATUS_META[input.event_type].label}`,
      { applicationId, eventType: input.event_type },
      2500
    );
  };

  const handleDeleteEvent = async (eventId: string) => {
    setDeletingEventId(eventId);
    try {
      const res = await fetch(`/api/applications/${applicationId}/events/${eventId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        await load();
        success('Händelsen är borttagen.', 2500);
      }
    } finally {
      setDeletingEventId(null);
      setEventToDelete(null);
    }
  };

  const handleEdit = async (input: CreateApplicationInput) => {
    const res = await fetch(`/api/applications/${applicationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Kunde inte uppdatera ansökan');
    }
    await load();
    success('Ansökan uppdaterad.', 2500);
  };

  const handleDeleteApplication = async () => {
    const res = await fetch(`/api/applications/${applicationId}`, { method: 'DELETE' });
    const json = await res.json();
    if (res.ok && json.success) {
      router.replace('/dashboard/sokta-tjanster');
    }
  };

  if (isLoading || !detail) {
    // Egen nyckel på golvet, så att det byts i stället för att flyttas när
    // ansökan landat (väggens höjd ändras då).
    return (
      <>
        <VaggLaddar label="Läser in ansökan" />
        <Golv key="laddar">
          <div className="w-full max-w-3xl space-y-4">
            <LoadingSkeleton variant="card" label="Läser in ansökan" />
            <LoadingSkeleton variant="list" count={3} label="Läser in händelser" />
          </div>
        </Golv>
      </>
    );
  }

  const lastActivity = detail.status_updated_at ?? detail.created_at;
  const showNudge = shouldShowNoResponseNudge(detail.current_status, lastActivity);
  const silentDays = daysSince(lastActivity);
  const sortedEvents = [...detail.events].sort((a, b) =>
    a.occurred_at === b.occurred_at
      ? a.created_at.localeCompare(b.created_at)
      : a.occurred_at.localeCompare(b.occurred_at)
  );

  return (
    <>
      {/* Sidans enda h1 ligger på väggen. Tillbaka till listan står som
          textlänk under rubriken, Redigera som glasknapp: händelsen är
          vyns kopparknapp. */}
      <RumHuvud
        title={detail.job_title}
        description={
          detail.location ? `${detail.company}, ${detail.location}` : detail.company
        }
        handling={
          <>
            <button
              type="button"
              onClick={() => setShowEdit(true)}
              className={KNAPP_GLAS}
            >
              Redigera
            </button>
            <Link
              href="/dashboard/sokta-tjanster"
              className={`${LANK_VAGG} inline-flex min-h-11 items-center`}
            >
              Sökta tjänster
            </Link>
          </>
        }
        tat={false}
      />
    <Golv key="ansokan" lyft>
    <div className="relative">
      <div className="w-full max-w-3xl space-y-4 sm:space-y-5">

        {/* Tidslinjen är det lyfta kortet: den bär vyns handling,
            Lägg till händelse (spec 16.3.1 och 18.4 punkt 3). */}
        <LyftKort label="Händelser" titel="Händelser">
          <div className="mt-4" />

          <ol className="relative space-y-0">
            {sortedEvents.map((event, index) => {
              const meta = STATUS_META[event.event_type];
              const isLast = index === sortedEvents.length - 1 && !showNudge;
              const label =
                event.event_type === 'interview_completed' && event.interview_round && event.interview_round > 1
                  ? `Genomförde intervju ${event.interview_round}`
                  : meta.timelineLabel;
              return (
                <li key={event.id} className="relative flex gap-3.5 group">
                  <div className="flex flex-col items-center">
                    <span
                      className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                        DOT_TONE[event.event_type] ?? 'bg-ink-2'
                      }`}
                    />
                    {!isLast && <span className="my-1 w-px flex-1 bg-kant" />}
                  </div>
                  <div className={`min-w-0 flex-1 ${isLast ? '' : 'pb-5'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-medium leading-snug text-ink-1">{label}</div>
                        <div className="mt-0.5 text-meta text-ink-3">
                          {formatDateShort(event.occurred_at)}
                        </div>
                        {event.note && (
                          <div className="mt-1.5 whitespace-pre-wrap rounded-lg border border-kant bg-papper-2 px-3 py-2 text-meta text-ink-2 ">
                            {event.note}
                          </div>
                        )}
                      </div>
                      {/* Alltid synlig och 44 px: en handling som bara finns
                          vid hover existerar inte på en pekskärm, och halva
                          trafiken är mobil. */}
                      <button
                        type="button"
                        onClick={() => setEventToDelete(event.id)}
                        disabled={deletingEventId === event.id}
                        aria-label={`Ta bort händelsen ${label}`}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-papper-2 hover:text-ink-1 disabled:opacity-60"
                      >
                        <X className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}

            {/* Ambient nudge: beräknat tillstånd, ingen lagrad händelse */}
            {showNudge && silentDays !== null && (
              <li className="relative flex gap-3.5">
                <div className="flex flex-col items-center">
                  <span className="mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-kant-stark bg-papper" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-ink-3">
                    Inget hört på {silentDays} dagar. Vill du uppdatera status?
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddEvent(true)}
                    className="mt-1.5 inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
                  >
                    Uppdatera
                  </button>
                </div>
              </li>
            )}
          </ol>

          <button
            type="button"
            onClick={() => setShowAddEvent(true)}
            className={`${KNAPP_PRIMAR} mt-5`}
          >
            Lägg till händelse
          </button>
        </LyftKort>

        {/* Fakta om ansökan */}
        <section className="rounded-xl border border-kant bg-papper p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 text-meta text-ink-2">
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-ink-3" strokeWidth={1.75} />
                {detail.company}
              </span>
              {detail.location && (
                <span className="ml-3 inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-ink-3" strokeWidth={1.75} />
                  {detail.location}
                </span>
              )}
            </div>
            <StatusPill status={detail.current_status} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-kant pt-4 text-meta text-ink-2">
            {/* Ta bort är en röd länk vid metaraden som bekräftas i dialog
                (spec 18.2 och 18.4 punkt 3), aldrig en knappfyllnad. */}
            <span>
              Sökt <span className="font-medium text-ink-1">{formatDateLong(detail.applied_at)}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>{CHANNEL_META[detail.application_channel]?.label}</span>
            {detail.letter && (
              <>
                <span aria-hidden="true">·</span>
                <Link
                  href={`/dashboard/mina-brev/${detail.letter.id}`}
                  className="inline-flex items-center gap-1 font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
                >
                  <FileText className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {detail.letter.title || 'Kopplat brev'}
                </Link>
              </>
            )}
            {detail.job_ad_url && (
              <>
                <span aria-hidden="true">·</span>
                <a
                  href={detail.job_ad_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
                >
                  <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Till annonsen
                </a>
              </>
            )}
            <button
              type="button"
              onClick={() => setConfirmDeleteApplication(true)}
              className={`${LANK} ml-auto inline-flex min-h-11 items-center text-fel decoration-fel/40`}
            >
              Ta bort
            </button>
          </div>

          {detail.notes && (
            <div className="mt-3 whitespace-pre-wrap rounded-lg border border-kant bg-papper-2 px-3 py-2 text-meta text-ink-2 ">
              {detail.notes}
            </div>
          )}

        </section>

      </div>

      {addEventMounted && (
        <AddEventSheet
          open={showAddEvent}
          onClose={() => setShowAddEvent(false)}
          onSubmit={handleAddEvent}
          completedInterviews={completedInterviews}
        />
      )}
      {editMounted && (
        <QuickLogSheet
          open={showEdit}
          onClose={() => setShowEdit(false)}
          onSubmit={handleEdit}
          initial={detail}
        />
      )}

      <ConfirmDialog
        open={eventToDelete !== null}
        onCancel={() => setEventToDelete(null)}
        onConfirm={() => (eventToDelete ? handleDeleteEvent(eventToDelete) : undefined)}
        title="Ta bort händelsen?"
        description="Statusen räknas om från de händelser som är kvar. Själva ansökan ligger kvar."
        confirmLabel="Ta bort händelsen"
        destructive
      />

      <ConfirmDialog
        open={confirmDeleteApplication}
        onCancel={() => setConfirmDeleteApplication(false)}
        onConfirm={handleDeleteApplication}
        title="Ta bort hela ansökan?"
        description="Ansökan och hela dess historik försvinner, och den räknas inte längre med i din statistik eller i aktivitetsrapporten. Det går inte att ångra."
        confirmLabel="Ta bort ansökan"
        destructive
      />
    </div>
    </Golv>
    </>
  );
}
