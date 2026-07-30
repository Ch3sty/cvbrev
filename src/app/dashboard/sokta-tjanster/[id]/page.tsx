'use client';

// Detaljvy för en ansökan: metadata, händelsetidslinje och åtgärder.
// Tidslinjen är sanningskällan: händelser kan läggas till och tas bort,
// aktuell status räknas alltid om av databasen.

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  MapPin,
  FileText,
  ExternalLink,
  Plus,
  Trash2,
  Pencil,
  X,
} from 'lucide-react';
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
import AddEventSheet from '../components/AddEventSheet';
import QuickLogSheet from '../components/QuickLogSheet';
import type { CreateApplicationInput } from '@/hooks/use-applications';

interface ApplicationDetail extends JobApplication {
  events: JobApplicationEvent[];
  letter: { id: string; title: string | null } | null;
}

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { successWithActivity, success } = useNotification();

  const [detail, setDetail] = useState<ApplicationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  const applicationId = params?.id;

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
    load();
  }, [load]);

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
    if (!confirm('Ta bort händelsen? Statusen räknas om från de som är kvar.')) return;
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
    if (!confirm('Ta bort hela ansökan och dess historik? Detta går inte att ångra.')) return;
    const res = await fetch(`/api/applications/${applicationId}`, { method: 'DELETE' });
    const json = await res.json();
    if (res.ok && json.success) {
      router.replace('/dashboard/sokta-tjanster');
    }
  };

  if (isLoading || !detail) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="bg-white rounded-3xl border border-orange-200/50 p-6 animate-pulse space-y-3">
          <div className="h-5 bg-orange-100/60 rounded w-2/3" />
          <div className="h-4 bg-orange-100/40 rounded w-1/3" />
        </div>
        <div className="bg-white rounded-3xl border border-orange-200/50 p-6 animate-pulse h-48" />
      </div>
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
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: 'linear-gradient(180deg, #FFF7ED 0%, #FFFBF5 40%, #FFFFFF 100%)' }}
      />

      <div className="max-w-3xl mx-auto pb-16 space-y-4 sm:space-y-5">
        <Link
          href="/dashboard/sokta-tjanster"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
          Sökta tjänster
        </Link>

        {/* Huvudkort */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="bg-white rounded-3xl border border-orange-200/50 p-5 sm:p-7"
          style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.18)' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                {detail.job_title}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-400" strokeWidth={2.25} />
                  {detail.company}
                </span>
                {detail.location && (
                  <span className="inline-flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-4 h-4 text-slate-400" strokeWidth={2.25} />
                    {detail.location}
                  </span>
                )}
              </div>
            </div>
            <StatusPill status={detail.current_status} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-slate-600 border-t border-slate-100 pt-4">
            <span>
              Sökt <span className="font-semibold text-slate-900">{formatDateLong(detail.applied_at)}</span>
            </span>
            <span className="text-slate-300">·</span>
            <span>{CHANNEL_META[detail.application_channel]?.label}</span>
            {detail.letter && (
              <>
                <span className="text-slate-300">·</span>
                <Link
                  href={`/dashboard/mina-brev/${detail.letter.id}`}
                  className="inline-flex items-center gap-1 text-orange-700 hover:text-orange-800 font-semibold"
                >
                  <FileText className="w-3.5 h-3.5" strokeWidth={2.5} />
                  {detail.letter.title || 'Kopplat brev'}
                </Link>
              </>
            )}
            {detail.job_ad_url && (
              <>
                <span className="text-slate-300">·</span>
                <a
                  href={detail.job_ad_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-orange-700 hover:text-orange-800 font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" strokeWidth={2.5} />
                  Till annonsen
                </a>
              </>
            )}
          </div>

          {detail.notes && (
            <div className="mt-3 text-[13.5px] text-slate-600 bg-slate-50 border border-slate-200/70 rounded-xl px-3.5 py-2.5 whitespace-pre-wrap">
              {detail.notes}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowEdit(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 hover:border-slate-300 transition-all min-h-[44px]"
            >
              <Pencil className="w-3.5 h-3.5" strokeWidth={2.5} />
              Redigera
            </button>
            <button
              type="button"
              onClick={handleDeleteApplication}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-500 hover:text-red-600 hover:border-red-200 transition-all min-h-[44px]"
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />
              Ta bort
            </button>
          </div>
        </motion.section>

        {/* Tidslinje */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: 'easeOut' }}
          className="bg-white rounded-3xl border border-orange-200/50 p-5 sm:p-7"
          style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)' }}
        >
          <h2 className="text-base font-bold text-slate-900 mb-4">Händelser</h2>

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
                    <span className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${meta.dotClass}`} />
                    {!isLast && <span className="w-px flex-1 bg-slate-200 my-1" />}
                  </div>
                  <div className={`min-w-0 flex-1 ${isLast ? '' : 'pb-5'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[14px] font-semibold text-slate-900 leading-snug">{label}</div>
                        <div className="text-[12.5px] text-slate-500 mt-0.5">
                          {formatDateShort(event.occurred_at)}
                        </div>
                        {event.note && (
                          <div className="mt-1.5 text-[13px] text-slate-600 bg-slate-50 border border-slate-200/70 rounded-lg px-3 py-2 whitespace-pre-wrap">
                            {event.note}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(event.id)}
                        disabled={deletingEventId === event.id}
                        aria-label="Ta bort händelsen"
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                      >
                        <X className="w-4 h-4" strokeWidth={2.5} />
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
                  <span className="mt-1 w-3 h-3 rounded-full border-2 border-slate-300 bg-white flex-shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] text-slate-500">
                    Inget hört på {silentDays} dagar. Vill du uppdatera status?
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddEvent(true)}
                    className="mt-1.5 text-[13px] font-semibold text-orange-700 hover:text-orange-800"
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
            className="mt-5 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-dashed border-orange-200 text-orange-700 text-[14px] font-bold hover:bg-orange-50/60 hover:border-orange-300 transition-all min-h-[48px]"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Lägg till händelse
          </button>
        </motion.section>
      </div>

      <AddEventSheet
        open={showAddEvent}
        onClose={() => setShowAddEvent(false)}
        onSubmit={handleAddEvent}
        completedInterviews={completedInterviews}
      />
      <QuickLogSheet
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSubmit={handleEdit}
        initial={detail}
      />
    </div>
  );
}
