'use client';

// Dela & skriv ut: månadsrapport i Arbetsförmedlingens struktur (Af 00331),
// utskrift/PDF, kopierbar textsammanfattning för AF:s webbformulär,
// delningslänk utan inloggning samt Sankey-diagram på större skärmar.

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Printer,
  Link2,
  ClipboardCopy,
  Check,
  Trash2,
} from 'lucide-react';
import { useNotification } from '@/context/notificationcontext';
import { useProfile } from '@/hooks/use-profile';
import type { ApplicationStats, JobApplication } from '@/lib/applications/status';
import SankeyChart from './SankeyChart';
import { formatDateShort } from './StatusBits';
import StatusRow from '@/components/shell/StatusRow';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import PaywallCard from '@/components/paywall/PaywallCard';
import { afReportStatusText, nextAfReportDeadline } from '@/lib/applications/afReport';

interface ReportRow {
  job_title: string;
  company: string;
  location: string | null;
  applied_at: string;
}

interface InterviewRow {
  occurred_at: string;
  event_type: string;
  interview_round: number | null;
  job_title: string;
  company: string;
  location: string | null;
}

interface MonthReport {
  month: string;
  advertised: ReportRow[];
  unsolicited: ReportRow[];
  interviews: InterviewRow[];
  totals: { applications: number; advertised: number; unsolicited: number; interviews: number };
}

interface ActiveShareLink {
  token: string;
  show_company_names: boolean;
  show_notes: boolean;
  expires_at: string;
}

interface ShareTabProps {
  applications: JobApplication[];
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number);
  const label = new Intl.DateTimeFormat('sv-SE', { month: 'long', year: 'numeric' }).format(
    new Date(y, m - 1, 1)
  );
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function shiftMonth(key: string, delta: number): string {
  const [y, m] = key.split('-').map(Number);
  return monthKey(new Date(y, m - 1 + delta, 1));
}

export default function ShareTab({ applications }: ShareTabProps) {
  const { successWithActivity, success, error: notifyError } = useNotification();
  const { profile } = useProfile();

  // Nästa rapporttillfälle: vilken månad som gäller, vilket datum den ska
  // vara inne och hur många dagar som är kvar.
  const [deadline] = useState(() => nextAfReportDeadline());
  const [month, setMonth] = useState(() => monthKey(new Date()));
  const [report, setReport] = useState<MonthReport | null>(null);
  /** Servern utelämnar listorna för den som inte har Premium. */
  const [locked, setLocked] = useState(false);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [shareLink, setShareLink] = useState<ActiveShareLink | null>(null);
  const [shareCompanies, setShareCompanies] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const currentMonth = monthKey(new Date());

  useEffect(() => {
    setReport(null);
    fetch(`/api/applications/report?month=${month}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setReport(json.data as MonthReport);
          setLocked(json.locked === true);
        }
      })
      .catch(() => undefined);
  }, [month, applications.length]);

  useEffect(() => {
    fetch('/api/applications/stats')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setStats(json.data as ApplicationStats);
      })
      .catch(() => undefined);
  }, [applications.length]);

  useEffect(() => {
    fetch('/api/applications/share')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setShareLink(json.data as ActiveShareLink | null);
      })
      .catch(() => undefined);
  }, []);

  const handlePrint = useCallback(() => {
    document.body.classList.add('printing-tracker-report');
    const cleanup = () => document.body.classList.remove('printing-tracker-report');
    window.addEventListener('afterprint', cleanup, { once: true });
    setTimeout(() => window.print(), 50);
  }, []);

  const summaryText = useMemo(() => {
    if (!report) return '';
    const lines: string[] = [`Aktivitetsrapport ${monthLabel(report.month).toLowerCase()}`, ''];
    if (report.advertised.length > 0) {
      lines.push('Sökta annonserade jobb:');
      for (const row of report.advertised) {
        lines.push(
          `- ${formatDateShort(row.applied_at)}: ${row.job_title}, ${row.company}${row.location ? `, ${row.location}` : ''}`
        );
      }
      lines.push('');
    }
    if (report.unsolicited.length > 0) {
      lines.push('Intresseanmälningar och spontanansökningar:');
      for (const row of report.unsolicited) {
        lines.push(
          `- ${formatDateShort(row.applied_at)}: ${row.job_title}, ${row.company}${row.location ? `, ${row.location}` : ''}`
        );
      }
      lines.push('');
    }
    if (report.interviews.length > 0) {
      lines.push('Intervjuer:');
      for (const row of report.interviews) {
        const kind = row.event_type === 'trial_work_completed' ? 'Provjobb' : 'Intervju';
        lines.push(
          `- ${formatDateShort(row.occurred_at)}: ${kind}, ${row.job_title}, ${row.company}${row.location ? `, ${row.location}` : ''}`
        );
      }
      lines.push('');
    }
    lines.push(
      `Totalt: ${report.totals.applications} sökta jobb (${report.totals.advertised} annonserade, ${report.totals.unsolicited} spontana), ${report.totals.interviews} intervjuer.`
    );
    return lines.join('\n');
  }, [report]);

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      notifyError('Kunde inte kopiera. Markera texten manuellt.', 4000);
    }
  };

  const handleCreateShareLink = async () => {
    setIsSharing(true);
    try {
      const res = await fetch('/api/applications/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ show_company_names: shareCompanies, show_notes: false }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Kunde inte skapa länk');
      setShareLink({
        token: json.token,
        show_company_names: shareCompanies,
        show_notes: false,
        expires_at: json.expiresAt,
      });
      await navigator.clipboard.writeText(json.url).catch(() => undefined);
      successWithActivity(
        'Delningslänk skapad och kopierad.',
        'application_shared',
        'Skapade delningslänk för sökstatistiken',
        {},
        3500
      );
      if (navigator.share) {
        navigator
          .share({ title: 'Min jobbsökning', url: json.url })
          .catch(() => undefined);
      }
    } catch (err) {
      notifyError(err instanceof Error ? err.message : 'Kunde inte skapa länk', 4000);
    } finally {
      setIsSharing(false);
    }
  };

  const handleRevoke = async () => {
    const res = await fetch('/api/applications/share', { method: 'DELETE' });
    const json = await res.json();
    if (res.ok && json.success) {
      setShareLink(null);
      success('Delningslänken är återkallad.', 3000);
    }
  };

  const shareUrl = shareLink
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/dela/sokta-tjanster/${shareLink.token}`
    : null;

  const sectionTable = (title: string, rows: { date: string; text: string }[]) => (
    <div>
      <div className="mb-1.5 text-sm font-medium text-ink-1">{title}</div>
      {rows.length === 0 ? (
        <div className="text-sm text-ink-3">Inget att rapportera den här månaden.</div>
      ) : (
        /* Egen overflow-x-auto: en lång tjänstetitel får aldrig ge
           horisontell scroll på hela sidan. */
        <div className="-mx-1 overflow-x-auto px-1">
          <table className="w-full min-w-[20rem] text-sm">
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-kant last:border-0">
                  <td className="w-20 whitespace-nowrap py-2 pr-3 align-top text-ink-3 tabular-nums">
                    {row.date}
                  </td>
                  <td className="py-2 text-ink-2">{row.text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Påminnelse med datum och dagar kvar. Tonen byter en gång, vid sju
          dagar, aldrig gradvis. Raden visas oavsett premium: att veta när
          rapporten ska in är inte något vi tar betalt för. */}
      <StatusRow
        tone={deadline.isUrgent || deadline.isOverdue ? 'warm' : 'neutral'}
        showDot
        label="Deadline för aktivitetsrapporten"
        action={
          month !== deadline.reportMonth ? (
            <button
              type="button"
              onClick={() => setMonth(deadline.reportMonth)}
              className="text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
            >
              Visa den
            </button>
          ) : undefined
        }
      >
        {afReportStatusText(deadline, report?.totals.applications ?? 0)}
      </StatusRow>

      {/* Månadsväljare */}
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setMonth((m) => shiftMonth(m, -1))}
          aria-label="Föregående månad"
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-kant bg-panel text-ink-2 transition-colors hover:border-kant-stark"
        >
          <ChevronLeft className="w-[18px] h-[18px]" strokeWidth={1.75} />
        </button>
        <div className="min-w-[160px] text-center text-kort text-ink-1">
          {monthLabel(month)}
        </div>
        <button
          type="button"
          onClick={() => setMonth((m) => shiftMonth(m, 1))}
          disabled={month >= currentMonth}
          aria-label="Nästa månad"
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-kant bg-panel text-ink-2 transition-colors hover:border-kant-stark disabled:opacity-40"
        >
          <ChevronRight className="w-[18px] h-[18px]" strokeWidth={1.75} />
        </button>
      </div>

      {/* Rapporten (det som skrivs ut) */}
      <div className="tracker-report rounded-xl border border-kant bg-panel p-4 sm:p-6">
        <div className="mb-5 border-b border-kant pb-4">
          <div className="text-steg uppercase text-ink-3">
            Aktivitetsöversikt
          </div>
          <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-kort text-ink-1">
              {profile?.full_name || 'Min jobbsökning'}
            </h2>
            <div className="text-meta text-ink-3">{monthLabel(month)}</div>
          </div>
          {report && (
            <div className="mt-2 text-meta text-ink-2">
              <span className="font-medium text-ink-1">{report.totals.applications}</span> sökta jobb
              {' · '}
              <span className="font-medium text-ink-1">{report.totals.interviews}</span> intervjuer denna period
            </div>
          )}
        </div>

        {!report ? (
          <LoadingSkeleton variant="text" count={3} label="Läser in rapporten" />
        ) : locked ? (
          /* Loggningen är gratis för alltid, uttaget av den sammanställda
             rapporten ingår i Premium. Servern har redan utelämnat raderna,
             så det finns ingen text att blurra bort här. */
          <PaywallCard variant="af-rapport" className="border-0 p-0" />
        ) : (
          <div className="space-y-5">
            {sectionTable(
              '1. Sökta annonserade jobb',
              report.advertised.map((row) => ({
                date: formatDateShort(row.applied_at),
                text: `${row.job_title}, ${row.company}${row.location ? `, ${row.location}` : ''}`,
              }))
            )}
            {sectionTable(
              '2. Intresseanmälningar och spontanansökningar',
              report.unsolicited.map((row) => ({
                date: formatDateShort(row.applied_at),
                text: `${row.job_title}, ${row.company}${row.location ? `, ${row.location}` : ''}`,
              }))
            )}
            {sectionTable(
              '3. Intervjuer och provjobb',
              report.interviews.map((row) => ({
                date: formatDateShort(row.occurred_at),
                text: `${row.event_type === 'trial_work_completed' ? 'Provjobb' : row.interview_round && row.interview_round > 1 ? `Intervju ${row.interview_round}` : 'Intervju'}: ${row.job_title}, ${row.company}${row.location ? `, ${row.location}` : ''}`,
              }))
            )}

            {stats && stats.totalApplications > 0 && (
              <div className="border-t border-kant pt-4">
                <div className="mb-2 text-sm font-medium text-ink-1">
                  Hela din sökning i siffror
                </div>
                <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <ReportTotal label="Sökta totalt" value={stats.totalApplications} />
                  <ReportTotal label="Fått svar" value={stats.respondedCount} />
                  <ReportTotal label="Intervjuer" value={stats.interviewedCount} />
                  <ReportTotal label="Erbjudanden" value={stats.offerCount} />
                </dl>
              </div>
            )}

            <div className="border-t border-kant pt-3 text-meta text-ink-3">
              Genererad via jobbcoach.ai · {new Intl.DateTimeFormat('sv-SE', { dateStyle: 'long' }).format(new Date())}
            </div>
          </div>
        )}
      </div>

      {/* Uttaget. Döljs helt i låst läge: betalväggen ovanför är redan
          sidans enda säljyta, och två på samma skärm säljer sämre än en. */}
      {!locked && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-kant-stark bg-panel px-4 text-sm font-medium text-ink-1 transition-colors hover:bg-insunken"
          >
            <Printer className="h-4 w-4" strokeWidth={1.75} />
            Skriv ut eller spara som PDF
          </button>
          <button
            type="button"
            onClick={handleCopySummary}
            disabled={!report}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-kant-stark bg-panel px-4 text-sm font-medium text-ink-1 transition-colors hover:bg-insunken disabled:opacity-50"
          >
            {copied ? (
              <Check className="h-4 w-4 text-positiv" strokeWidth={1.75} />
            ) : (
              <ClipboardCopy className="h-4 w-4" strokeWidth={1.75} />
            )}
            {copied ? 'Kopierad' : 'Kopiera som text till AF-rapporten'}
          </button>
        </div>
      )}

      {/* Delningslänk */}
      <div className="rounded-xl border border-kant bg-panel p-4">
        <h3 className="text-kort text-ink-1">Dela med en länk</h3>
        <p className="mt-1 text-sm text-ink-2">
          Den som får länken ser din statistik utan att logga in. Länken gäller i 30 dagar och du
          kan återkalla den när du vill.
        </p>

        {shareUrl ? (
          <div className="mt-3 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1 truncate rounded-lg border border-kant bg-insunken px-3 py-2 font-mono text-meta text-ink-2 shadow-insunken">
                {shareUrl}
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl).then(() => success('Länken är kopierad.', 2500));
                }}
                aria-label="Kopiera länken"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-kant bg-panel text-ink-2 transition-colors hover:border-kant-stark"
              >
                <ClipboardCopy className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>
            <button
              type="button"
              onClick={handleRevoke}
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-ink-2 transition-colors hover:text-fel"
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
              Återkalla länken
            </button>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-ink-2">
              <input
                type="checkbox"
                checked={shareCompanies}
                onChange={(e) => setShareCompanies(e.target.checked)}
                className="h-4 w-4 rounded border-kant-stark text-ink-1 focus:ring-ink-1"
              />
              Visa lista med företag och tjänster (annars bara siffror)
            </label>
            <button
              type="button"
              onClick={handleCreateShareLink}
              disabled={isSharing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white hover:bg-ink-hover disabled:opacity-40"
            >
              <Link2 className="w-4 h-4" strokeWidth={1.75} />
              {isSharing ? 'Skapar' : 'Skapa delningslänk'}
            </button>
          </div>
        )}
      </div>

      {/* Sankey: bara på större skärmar, mobilen har trattvyn */}
      {stats && stats.totalApplications > 0 && (
        <div className="hidden rounded-xl border border-kant bg-panel p-4 md:block">
          <h3 className="mb-1 text-kort text-ink-1">Flödesdiagram över din sökning</h3>
          <p className="mb-4 text-sm text-ink-2">
            Varje flöde är proportionellt mot antalet ansökningar. Följer med på utskriften av
            statistiken.
          </p>
          <SankeyChart stats={stats} />
        </div>
      )}
    </div>
  );
}

/** En siffra i rapportens sammanfattning. Tabular-nums, ingen accent. */
function ReportTotal({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dd className="text-tal tabular-nums text-ink-1">{value}</dd>
      <dt className="mt-0.5 text-meta text-ink-3">{label}</dt>
    </div>
  );
}
