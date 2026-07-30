'use client';

// Dela & skriv ut: månadsrapport i Arbetsförmedlingens struktur (Af 00331),
// utskrift/PDF, kopierbar textsammanfattning för AF:s webbformulär,
// delningslänk utan inloggning samt Sankey-diagram på större skärmar.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
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
import FunnelBars from './FunnelBars';
import SankeyChart from './SankeyChart';
import { formatDateShort } from './StatusBits';

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

  const [month, setMonth] = useState(() => monthKey(new Date()));
  const [report, setReport] = useState<MonthReport | null>(null);
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
        if (json.success) setReport(json.data as MonthReport);
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
      <div className="text-[13px] font-bold text-slate-900 mb-1.5">{title}</div>
      {rows.length === 0 ? (
        <div className="text-[12.5px] text-slate-400 italic">Inget att rapportera denna månad.</div>
      ) : (
        <table className="w-full text-[12.5px]">
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-slate-100 last:border-0">
                <td className="py-1.5 pr-3 text-slate-500 whitespace-nowrap w-16 align-top">{row.date}</td>
                <td className="py-1.5 text-slate-700">{row.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Månadsväljare */}
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setMonth((m) => shiftMonth(m, -1))}
          aria-label="Föregående månad"
          className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:border-slate-300 transition-all"
        >
          <ChevronLeft className="w-4.5 h-4.5 w-[18px] h-[18px]" strokeWidth={2.5} />
        </button>
        <div className="min-w-[160px] text-center text-[15px] font-bold text-slate-900">
          {monthLabel(month)}
        </div>
        <button
          type="button"
          onClick={() => setMonth((m) => shiftMonth(m, 1))}
          disabled={month >= currentMonth}
          aria-label="Nästa månad"
          className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:border-slate-300 transition-all disabled:opacity-40"
        >
          <ChevronRight className="w-[18px] h-[18px]" strokeWidth={2.5} />
        </button>
      </div>

      {/* Rapporten (det som skrivs ut) */}
      <div className="tracker-report bg-white rounded-2xl border border-orange-200/50 p-5 sm:p-8">
        <div className="border-b border-slate-200 pb-4 mb-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
            Aktivitetsöversikt
          </div>
          <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {profile?.full_name || 'Min jobbsökning'}
            </h2>
            <div className="text-[14px] font-semibold text-slate-600">{monthLabel(month)}</div>
          </div>
          {report && (
            <div className="mt-2 text-[13px] text-slate-600">
              <span className="font-bold text-slate-900">{report.totals.applications}</span> sökta jobb
              {' · '}
              <span className="font-bold text-slate-900">{report.totals.interviews}</span> intervjuer denna period
            </div>
          )}
        </div>

        {!report ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-slate-100 rounded w-1/3" />
            <div className="h-3 bg-slate-100 rounded w-2/3" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
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
              <div className="pt-2">
                <div className="text-[13px] font-bold text-slate-900 mb-2.5">Hela din sökning i siffror</div>
                <FunnelBars stats={stats} />
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
              Genererad via jobbcoach.ai · {new Intl.DateTimeFormat('sv-SE', { dateStyle: 'long' }).format(new Date())}
            </div>
          </div>
        )}
      </div>

      {/* Åtgärder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-[13.5px] font-bold text-slate-700 hover:border-slate-300 transition-all min-h-[48px]"
        >
          <Printer className="w-4 h-4" strokeWidth={2.25} />
          Skriv ut eller spara som PDF
        </button>
        <button
          type="button"
          onClick={handleCopySummary}
          disabled={!report}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-[13.5px] font-bold text-slate-700 hover:border-slate-300 transition-all min-h-[48px] disabled:opacity-50"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
          ) : (
            <ClipboardCopy className="w-4 h-4" strokeWidth={2.25} />
          )}
          {copied ? 'Kopierad!' : 'Kopiera som text till AF-rapporten'}
        </button>
      </div>

      {/* Delningslänk */}
      <div className="bg-white rounded-2xl border border-orange-200/50 p-4 sm:p-6">
        <h3 className="text-[14.5px] font-bold text-slate-900">Dela med en länk</h3>
        <p className="text-[13px] text-slate-500 mt-1">
          Den som får länken ser din statistik utan att logga in. Länken gäller i 30 dagar och du
          kan återkalla den när du vill.
        </p>

        {shareUrl ? (
          <div className="mt-3 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[12.5px] text-slate-600 truncate font-mono">
                {shareUrl}
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl).then(() => success('Länken är kopierad.', 2500));
                }}
                aria-label="Kopiera länken"
                className="flex-shrink-0 w-11 h-11 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:border-slate-300 transition-all"
              >
                <ClipboardCopy className="w-4 h-4" strokeWidth={2.25} />
              </button>
            </div>
            <button
              type="button"
              onClick={handleRevoke}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />
              Återkalla länken
            </button>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <label className="flex items-center gap-2.5 text-[13px] text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={shareCompanies}
                onChange={(e) => setShareCompanies(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-400"
              />
              Visa lista med företag och tjänster (annars bara siffror)
            </label>
            <button
              type="button"
              onClick={handleCreateShareLink}
              disabled={isSharing}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-white text-[13.5px] font-bold transition-all min-h-[48px] disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #F97316, #DC2626)',
                boxShadow: '0 8px 20px -6px rgba(220, 38, 38, 0.4)',
              }}
            >
              <Link2 className="w-4 h-4" strokeWidth={2.25} />
              {isSharing ? 'Skapar…' : 'Skapa delningslänk'}
            </button>
          </div>
        )}
      </div>

      {/* Sankey: bara på större skärmar, mobilen har trattvyn */}
      {stats && stats.totalApplications > 0 && (
        <div className="hidden md:block bg-white rounded-2xl border border-orange-200/50 p-6">
          <h3 className="text-[14.5px] font-bold text-slate-900 mb-1">Flödesdiagram över din sökning</h3>
          <p className="text-[13px] text-slate-500 mb-4">
            Varje flöde är proportionellt mot antalet ansökningar. Följer med på utskriften av
            statistiken.
          </p>
          <SankeyChart stats={stats} />
        </div>
      )}
    </motion.div>
  );
}
