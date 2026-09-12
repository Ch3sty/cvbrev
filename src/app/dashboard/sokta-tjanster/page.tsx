'use client';

// Ansökningar: produktens viktigaste sida (planens avsnitt 5).
//
// Sidmallen enligt avsnitt 3: sidhuvud med den primära handlingen, en statusrad
// med de fyra siffrorna, sedan innehållet. Inga egna hjältar, ingen gradient.
//
// Listan är grupperad efter vad som kräver handling, inte efter datum: tysta
// över fjorton dagar först, sedan intervjuer, sedan övriga. Den som öppnar
// sidan ska se vad hon ska göra, inte vad hon senast gjorde.

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useNotification } from '@/context/notificationcontext';
import { useApplications, type CreateApplicationInput } from '@/hooks/use-applications';
import {
  statusIsClosed,
  statusHasResponse,
  shouldShowNoResponseNudge,
  type ApplicationEventType,
  type JobApplication,
} from '@/lib/applications/status';
import PageHeader from '@/components/shell/PageHeader';
import StatusRow from '@/components/shell/StatusRow';
import EmptyState from '@/components/shell/EmptyState';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import {
  IlluIngaAnsokningar,
  IlluImporteraBrev,
} from '@/components/illustrations/ApplicationIllustrations';
import ApplicationCard from './components/ApplicationCard';
import BackfillBanner from './components/BackfillBanner';
/**
 * Statistikfliken drar in recharts, ett av de tyngsta paketen i bundlen, men
 * syns bara när fliken faktiskt är vald. Den laddas därför först vid behov.
 *
 * Platshållaren har samma yttermått som StatsTab:s eget laddningsläge: fyra
 * KPI-kort på 6 rem och en diagramruta på 14 rem. Då hoppar ingenting när
 * paketet landar, utan kortet byter bara innehåll.
 */
const StatsTabPlaceholder = () => (
  <div className="space-y-4" role="status" aria-busy="true" aria-live="polite">
    <span className="sr-only">Läser in statistiken</span>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-xl border border-neutral-200 bg-white p-4"
        />
      ))}
    </div>
    <div className="h-56 animate-pulse rounded-xl border border-neutral-200 bg-white p-6" />
  </div>
);

const StatsTab = dynamic(() => import('./components/StatsTab'), {
  ssr: false,
  loading: StatsTabPlaceholder,
});

/**
 * Rapportfliken drar in Sankey-diagrammet och hela utskriftsvyn, och syns
 * bara när fliken är vald. Samma behandling som statistiken.
 *
 * Platshållaren följer ShareTab:s översta mått: statusraden på 44 px,
 * månadsväljaren på 44 px och rapportkortet. Kortet får ShareTab:s egen
 * orangebrutna ram, så ramen ligger still medan innehållet byts.
 */
const ShareTabPlaceholder = () => (
  <div className="space-y-4" role="status" aria-busy="true" aria-live="polite">
    <span className="sr-only">Läser in rapporten</span>
    <div className="h-11 animate-pulse rounded-lg border border-neutral-200 bg-white" />
    <div className="flex items-center justify-center gap-2">
      <div className="h-11 w-11 animate-pulse rounded-xl border border-neutral-200 bg-white" />
      <div className="h-11 min-w-[160px] animate-pulse rounded-lg bg-neutral-100" />
      <div className="h-11 w-11 animate-pulse rounded-xl border border-neutral-200 bg-white" />
    </div>
    <div className="rounded-xl border border-orange-200/50 bg-white p-5 sm:p-8">
      <div className="mb-5 animate-pulse border-b border-neutral-200 pb-4">
        <div className="h-3 w-40 rounded bg-neutral-100" />
        <div className="mt-2 h-6 w-1/2 rounded bg-neutral-100" />
        <div className="mt-2 h-3 w-2/3 rounded bg-neutral-100" />
      </div>
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-1/3 rounded bg-neutral-100" />
        <div className="h-3 w-2/3 rounded bg-neutral-100" />
        <div className="h-3 w-1/2 rounded bg-neutral-100" />
      </div>
    </div>
  </div>
);

const ShareTab = dynamic(() => import('./components/ShareTab'), {
  ssr: false,
  loading: ShareTabPlaceholder,
});

/**
 * Snabbloggen och händelsearket öppnas först efter en tryckning, så de
 * behöver varken finnas i bundlen eller i DOM:en vid sidladdning.
 *
 * SheetShell har sin egen AnimatePresence, men den hinner aldrig spela
 * utgången om föräldern river arket i samma ögonblick som open blir false.
 * Därför håller den här kroken arket monterat lite till: den speglar open
 * direkt vid öppning och släpper först när utgången är klar.
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

const QuickLogSheet = dynamic(() => import('./components/QuickLogSheet'), { ssr: false });

type TabId = 'ansokningar' | 'statistik' | 'rapport';
type FilterId = 'alla' | 'vantar' | 'intervju' | 'erbjudande' | 'avslutade';

const TABS: { id: TabId; label: string }[] = [
  { id: 'ansokningar', label: 'Ansökningar' },
  { id: 'statistik', label: 'Statistik' },
  { id: 'rapport', label: 'Rapport' },
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

/** Grupper i handlingsordning. Tomma grupper renderas inte. */
interface Group {
  key: string;
  heading: string;
  items: JobApplication[];
}

function groupByAction(applications: JobApplication[]): Group[] {
  const silent: JobApplication[] = [];
  const interviews: JobApplication[] = [];
  const rest: JobApplication[] = [];

  for (const app of applications) {
    const last = app.status_updated_at ?? app.created_at;
    if (!statusIsClosed(app.current_status) && shouldShowNoResponseNudge(app.current_status, last)) {
      silent.push(app);
    } else if (INTERVIEW_STATUSES.includes(app.current_status)) {
      interviews.push(app);
    } else {
      rest.push(app);
    }
  }

  return [
    { key: 'silent', heading: 'Värda att följa upp', items: silent },
    { key: 'interview', heading: 'I intervjuprocess', items: interviews },
    { key: 'rest', heading: 'Övriga', items: rest },
  ].filter((g) => g.items.length > 0);
}

export default function SoktaTjansterPage() {
  const router = useRouter();
  const { applications, isLoading, refresh, createApplication } = useApplications();
  const { successWithActivity } = useNotification();

  const [activeTab, setActiveTab] = useState<TabId>('ansokningar');
  const [filter, setFilter] = useState<FilterId>('alla');
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [letterCandidates, setLetterCandidates] = useState<number | null>(null);
  const quickLogMounted = useDeferredUnmount(showQuickLog);

  // Djuplänkar: ?tab=statistik, ?tab=rapport, ?logga=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'statistik' || tab === 'rapport') setActiveTab(tab);
    // Den gamla länken till delningsfliken pekar numera på rapporten.
    if (tab === 'dela') setActiveTab('rapport');
    if (params.get('logga') === '1') setShowQuickLog(true);
  }, []);

  const totalCount = applications?.length ?? 0;

  const stats = useMemo(() => {
    const list = applications ?? [];
    let waiting = 0;
    let interview = 0;
    let replies = 0;
    for (const a of list) {
      const closed = statusIsClosed(a.current_status);
      if (!closed && !statusHasResponse(a.current_status)) waiting++;
      if (INTERVIEW_STATUSES.includes(a.current_status)) interview++;
      if (statusHasResponse(a.current_status)) replies++;
    }
    return { total: list.length, waiting, interview, replies };
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

  const groups = useMemo(() => groupByAction(filteredApplications), [filteredApplications]);

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

  const logButton = (
    <button
      type="button"
      onClick={() => setShowQuickLog(true)}
      className="inline-flex h-11 items-center justify-center rounded-lg bg-orange-600 px-4 text-sm font-medium text-white transition-colors hover:bg-orange-700"
    >
      Logga ansökan
    </button>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      <PageHeader
        title="Ansökningar"
        description="Alla jobb du sökt, var de står och vad som väntar på svar."
        action={totalCount > 0 ? logButton : undefined}
      >
        <div
          className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-1"
          role="tablist"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-11 flex-1 rounded-lg px-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </PageHeader>

      {/* De fyra siffrorna. Beskrivande antal, ingen svarsfrekvens här: den
          bor i statistikfliken där man aktivt går för att analysera. */}
      {totalCount > 0 && (
        <StatusRow label="Din översikt">
          <span className="tabular-nums">
            {stats.total} sökta, {stats.waiting} väntar svar, {stats.interview} intervju,{' '}
            {stats.replies} svar
          </span>
        </StatusRow>
      )}

      {activeTab === 'ansokningar' && (
        <div className="space-y-4">
          {totalCount > 0 && <BackfillBanner onImported={handleImported} />}

          {totalCount > 0 && (
            <>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                  strokeWidth={2}
                />
                <input
                  type="text"
                  inputMode="search"
                  enterKeyHint="search"
                  placeholder="Sök på företag eller tjänst"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoComplete="off"
                  aria-label="Sök bland dina ansökningar"
                  className="h-11 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-4 text-base text-neutral-900 placeholder-neutral-500 transition-colors focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-50"
                />
              </div>

              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    aria-pressed={filter === f.id}
                    className={`min-h-11 shrink-0 rounded-lg border px-3 text-sm font-medium transition-colors ${
                      filter === f.id
                        ? 'border-orange-600 bg-orange-50 text-orange-900'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {isLoading ? (
            <LoadingSkeleton variant="list" count={5} label="Läser in dina ansökningar" />
          ) : totalCount === 0 ? (
            <EmptyApplications
              letterCandidates={letterCandidates}
              onCandidateCount={setLetterCandidates}
              onImported={handleImported}
              onLog={() => setShowQuickLog(true)}
            />
          ) : filteredApplications.length === 0 ? (
            <EmptyState
              title="Inga ansökningar matchar filtret"
              description="Prova ett annat filter eller rensa sökningen."
              action={
                <button
                  type="button"
                  onClick={() => {
                    setFilter('alla');
                    setSearchTerm('');
                  }}
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400"
                >
                  Rensa filter
                </button>
              }
            />
          ) : (
            <div className="space-y-6">
              {groups.map((group) => (
                <section key={group.key}>
                  <h2 className="mb-2 text-sm font-semibold text-neutral-600">
                    {group.heading}
                    <span className="ml-2 font-normal tabular-nums text-neutral-500">
                      {group.items.length}
                    </span>
                  </h2>
                  <div className="space-y-2">
                    {group.items.map((application) => (
                      <ApplicationCard
                        key={application.id}
                        application={application}
                        onOpen={(id) => router.push(`/dashboard/sokta-tjanster/${id}`)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'statistik' && (
        <StatsTab totalCount={totalCount} applications={applications ?? []} isLoading={isLoading} />
      )}

      {activeTab === 'rapport' && <ShareTab applications={applications ?? []} />}

      {quickLogMounted && (
        <QuickLogSheet open={showQuickLog} onClose={() => setShowQuickLog(false)} onSubmit={handleCreate} />
      )}
    </div>
  );
}

/**
 * Tomt tillstånd. Har användaren sparade brev är importen primär handling:
 * merparten av kontona är i exakt det läget, och elva manuella inmatningar
 * är en vägg som ett klick inte är.
 */
function EmptyApplications({
  letterCandidates,
  onCandidateCount,
  onImported,
  onLog,
}: {
  letterCandidates: number | null;
  onCandidateCount: (n: number) => void;
  onImported: (count: number) => void;
  onLog: () => void;
}) {
  const hasLetters = (letterCandidates ?? 0) > 0;

  // Sonden körs alltid: den avgör vilket tomt tillstånd som är rätt.
  const probe = (
    <BackfillBanner
      variant="inline"
      onImported={onImported}
      onCandidateCount={onCandidateCount}
    />
  );

  if (hasLetters) {
    return (
      <EmptyState
        illustration={IlluImporteraBrev}
        title={
          letterCandidates === 1
            ? 'Vi hittade 1 brev du kan lägga in'
            : `Vi hittade ${letterCandidates} brev du kan lägga in`
        }
        description="Du har redan skrivit dem här. Lägg in dem som ansökningar, så har du en komplett historik från start och slipper skriva in allt på nytt."
        action={probe}
        secondaryAction={
          <button
            type="button"
            onClick={onLog}
            className="text-sm font-medium text-neutral-600 underline-offset-4 transition-colors hover:text-neutral-900 hover:underline"
          >
            Logga en ansökan manuellt
          </button>
        }
      />
    );
  }

  return (
    <>
      <div className="hidden">{probe}</div>
      <EmptyState
        illustration={IlluIngaAnsokningar}
        title="Inga ansökningar än"
        description="Logga den första så håller vi koll på svaren, räknar din statistik och sammanställer månaden åt Arbetsförmedlingen."
        action={
          <button
            type="button"
            onClick={onLog}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-orange-600 px-4 text-sm font-medium text-white transition-colors hover:bg-orange-700 sm:w-auto"
          >
            Logga din första ansökan
          </button>
        }
      />
    </>
  );
}
