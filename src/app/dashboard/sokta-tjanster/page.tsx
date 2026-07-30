'use client';

// Sökta tjänster: huvudvyn med tre flikar (Ansökningar, Statistik, Dela & skriv ut).
// Listan följer mina-brev-mönstret; statistiken följer MetricCard-standarden.

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Search, ArrowRight } from 'lucide-react';
import { useNotification } from '@/context/notificationcontext';
import { useApplications, type CreateApplicationInput } from '@/hooks/use-applications';
import {
  statusIsClosed,
  type ApplicationEventType,
  type JobApplication,
} from '@/lib/applications/status';
import ApplicationCard from './components/ApplicationCard';
import QuickLogSheet from './components/QuickLogSheet';
import BackfillBanner from './components/BackfillBanner';
import StatsTab from './components/StatsTab';
import ShareTab from './components/ShareTab';
import { TrackerOrb, EmptyTrackerIllustration } from './components/TrackerIllustrations';

type TabId = 'ansokningar' | 'statistik' | 'dela';
type FilterId = 'alla' | 'vantar' | 'intervju' | 'erbjudande' | 'avslutade';

const TABS: { id: TabId; label: string }[] = [
  { id: 'ansokningar', label: 'Ansökningar' },
  { id: 'statistik', label: 'Statistik' },
  { id: 'dela', label: 'Dela & skriv ut' },
];

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'alla', label: 'Alla' },
  { id: 'vantar', label: 'Väntar svar' },
  { id: 'intervju', label: 'Intervju' },
  { id: 'erbjudande', label: 'Erbjudande' },
  { id: 'avslutade', label: 'Avslutade' },
];

const INTERVIEW_STATUSES: (ApplicationEventType | null)[] = [
  'interview_invited',
  'interview_completed',
  'trial_work_completed',
];

function matchesFilter(application: JobApplication, filter: FilterId): boolean {
  const status = application.current_status;
  switch (filter) {
    case 'alla':
      return true;
    case 'vantar':
      return status === null || status === 'applied' || status === 'no_response';
    case 'intervju':
      return INTERVIEW_STATUSES.includes(status);
    case 'erbjudande':
      return status === 'offer_received' || status === 'accepted';
    case 'avslutade':
      return statusIsClosed(status);
  }
}

export default function SoktaTjansterPage() {
  const router = useRouter();
  const { applications, isLoading, refresh, createApplication } = useApplications();
  const { successWithActivity } = useNotification();

  const [activeTab, setActiveTab] = useState<TabId>('ansokningar');
  const [filter, setFilter] = useState<FilterId>('alla');
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickLog, setShowQuickLog] = useState(false);

  // Djuplänkar: /dashboard/sokta-tjanster?tab=statistik eller ?logga=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'statistik' || tab === 'dela') setActiveTab(tab);
    if (params.get('logga') === '1') setShowQuickLog(true);
  }, []);

  const totalCount = applications?.length ?? 0;

  const heroStats = useMemo(() => {
    const list = applications ?? [];
    const active = list.filter((a) => !statusIsClosed(a.current_status)).length;
    const inInterview = list.filter((a) => INTERVIEW_STATUSES.includes(a.current_status)).length;
    return { total: list.length, active, inInterview };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return (applications ?? [])
      .filter((a) => matchesFilter(a, filter))
      .filter(
        (a) =>
          !term ||
          a.job_title.toLowerCase().includes(term) ||
          a.company.toLowerCase().includes(term) ||
          (a.location ?? '').toLowerCase().includes(term)
      );
  }, [applications, filter, searchTerm]);

  const handleCreate = async (input: CreateApplicationInput) => {
    const created = await createApplication(input);
    successWithActivity(
      'Ansökan loggad.',
      'application_logged',
      `Loggade ansökan: ${created.job_title} hos ${created.company}`,
      { applicationId: created.id, channel: created.application_channel },
      3000
    );
  };

  const handleImported = (count: number) => {
    refresh();
    successWithActivity(
      count === 1 ? '1 brev tillagt som sökt tjänst.' : `${count} brev tillagda som sökta tjänster.`,
      'application_logged',
      `Importerade ${count} brev till Sökta tjänster`,
      { imported: count },
      3500
    );
  };

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: 'linear-gradient(180deg, #FFF7ED 0%, #FFFBF5 40%, #FFFFFF 100%)' }}
      />

      <div className="max-w-6xl mx-auto pb-16 space-y-5 sm:space-y-6">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative overflow-hidden bg-white rounded-3xl border border-orange-200/50 p-5 sm:p-7"
          style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.18)' }}
        >
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="flex-shrink-0">
              <TrackerOrb className="w-16 h-16 sm:w-20 sm:h-20" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 mb-1">
                Sökta tjänster
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                Koll på varje ansökan
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mt-1.5 leading-relaxed">
                Logga dina sökta jobb, följ varje steg och visa din statistik för den som vill se den.
              </p>

              {totalCount > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>
                    <span className="font-bold text-slate-900">{heroStats.total}</span> sökta
                  </span>
                  <span className="text-slate-300">·</span>
                  <span>
                    <span className="font-bold text-slate-900">{heroStats.active}</span> pågående
                  </span>
                  {heroStats.inInterview > 0 && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span>
                        <span className="font-bold text-slate-900">{heroStats.inInterview}</span> i intervjuprocess
                      </span>
                    </>
                  )}
                </div>
              )}

              <div className="mt-4 hidden sm:flex">
                <button
                  type="button"
                  onClick={() => setShowQuickLog(true)}
                  className="group inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-bold shadow-md hover:shadow-lg transition-all min-h-[44px]"
                  style={{
                    background: 'linear-gradient(135deg, #F97316, #DC2626)',
                    boxShadow: '0 8px 20px -6px rgba(220, 38, 38, 0.4)',
                  }}
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                  Logga ansökan
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Flikar */}
        <div className="flex items-center gap-1 bg-white border border-orange-200/50 rounded-2xl p-1" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-2 sm:px-4 py-2.5 rounded-xl text-[12.5px] sm:text-sm font-bold transition-all min-h-[44px] ${
                activeTab === tab.id
                  ? 'bg-orange-50 text-orange-700 border border-orange-200'
                  : 'text-slate-500 hover:text-slate-700 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'ansokningar' && (
          <div className="space-y-4">
            <BackfillBanner onImported={handleImported} />

            {totalCount > 0 && (
              <>
                <div className="relative">
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                    strokeWidth={2.5}
                  />
                  <input
                    type="text"
                    placeholder="Sök på företag eller tjänst…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-orange-200/60 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200/40 transition-all"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFilter(f.id)}
                      className={`flex-shrink-0 px-3.5 py-2 rounded-full text-[12.5px] font-semibold border transition-all ${
                        filter === f.id
                          ? 'bg-orange-50 border-orange-400 text-orange-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {isLoading ? (
              <div className="space-y-2.5">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-orange-200/50 px-4 py-4 animate-pulse space-y-2.5"
                  >
                    <div className="h-4 bg-orange-100/60 rounded w-2/3" />
                    <div className="h-3 bg-orange-100/40 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : totalCount === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-3xl border border-orange-200/50 p-8 sm:p-12 text-center"
                style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.12)' }}
              >
                <div className="flex justify-center mb-5">
                  <EmptyTrackerIllustration className="w-48 h-40 sm:w-56 sm:h-44" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Dags att börja logga dina ansökningar</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
                  Varje loggad ansökan bygger din statistik: svarsfrekvens, intervjuer och en översikt
                  du kan visa för din handläggare på Arbetsförmedlingen. Vi gör jobbet med att räkna,
                  du behöver bara logga.
                </p>
                <button
                  type="button"
                  onClick={() => setShowQuickLog(true)}
                  className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-bold shadow-md hover:shadow-lg transition-all min-h-[44px]"
                  style={{
                    background: 'linear-gradient(135deg, #F97316, #DC2626)',
                    boxShadow: '0 8px 20px -6px rgba(220, 38, 38, 0.4)',
                  }}
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                  Logga din första ansökan
                </button>
                <div className="mt-4">
                  <Link
                    href="/dashboard/mina-brev"
                    className="text-[13px] text-orange-700 hover:text-orange-800 font-semibold"
                  >
                    Har du redan skickat brev via oss? Kolla dina brev
                  </Link>
                </div>
              </motion.div>
            ) : filteredApplications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-orange-200/50 p-8 text-center">
                <div className="text-sm text-slate-600 mb-1">Inga ansökningar matchar filtret.</div>
                <button
                  type="button"
                  onClick={() => {
                    setFilter('alla');
                    setSearchTerm('');
                  }}
                  className="text-sm text-orange-700 hover:text-orange-800 font-semibold"
                >
                  Rensa filter
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredApplications.map((application, index) => (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
                  >
                    <ApplicationCard
                      application={application}
                      onOpen={(id) => router.push(`/dashboard/sokta-tjanster/${id}`)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'statistik' && <StatsTab totalCount={totalCount} />}

        {activeTab === 'dela' && <ShareTab applications={applications ?? []} />}
      </div>

      {/* Mobil FAB: öppnar snabbloggen */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
        className="lg:hidden fixed right-4 z-30"
        style={{ bottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}
      >
        <button
          type="button"
          onClick={() => setShowQuickLog(true)}
          aria-label="Logga ansökan"
          className="flex items-center justify-center w-14 h-14 rounded-full text-white active:scale-95 transition-transform"
          style={{
            background: 'linear-gradient(135deg, #F97316, #DC2626)',
            boxShadow: '0 12px 32px -8px rgba(220, 38, 38, 0.55), 0 4px 12px -4px rgba(220, 38, 38, 0.3)',
          }}
        >
          <Plus className="w-6 h-6" strokeWidth={2.75} />
        </button>
      </motion.div>

      <QuickLogSheet open={showQuickLog} onClose={() => setShowQuickLog(false)} onSubmit={handleCreate} />
    </div>
  );
}
