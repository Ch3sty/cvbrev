// Publik delningsvy för sökstatistiken: /dela/sokta-tjanster/[token].
// Server component utan auth. getSharedApplicationData verifierar token,
// TTL och återkallning, och returnerar bara det ägaren valt att exponera.
// Ren läsvy: inga åtgärder, ingen navigering in i appen.

import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import Logo from '@/components/Logo';
import { getSharedApplicationData } from '@/lib/applications/shareLinks';
import { STATUS_META, CHANNEL_META, type ApplicationChannel, type ApplicationEventType } from '@/lib/applications/status';
import FunnelBars from '@/app/dashboard/sokta-tjanster/components/FunnelBars';
import SankeyChart from '@/app/dashboard/sokta-tjanster/components/SankeyChart';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Delad jobbsökningsöversikt | Jobbcoach.ai',
  robots: { index: false, follow: false },
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(180deg, #FFF7ED 0%, #FFFBF5 40%, #FFFFFF 100%)' }}
    >
      <header className="px-4 sm:px-6 py-4">
        <Link href="/" aria-label="Jobbcoach.ai">
          <Logo />
        </Link>
      </header>
      {children}
      <footer className="px-4 py-6 text-center text-[12px] text-slate-400">
        Översikten är delad via{' '}
        <Link href="/" className="text-orange-600 hover:text-orange-700 font-semibold">
          jobbcoach.ai
        </Link>
      </footer>
    </div>
  );
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

export default async function DeladSoktaTjansterPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const shared = token ? await getSharedApplicationData(token) : null;

  if (!shared) {
    return (
      <Shell>
        <div className="flex-1 flex items-center justify-center px-4 py-10">
          <div
            className="relative w-full max-w-md bg-white rounded-3xl border border-orange-100 p-6 sm:p-8 text-center overflow-hidden"
            style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)' }}
          >
            <div
              className="absolute top-0 inset-x-0 h-0.5"
              style={{ background: 'linear-gradient(90deg, #FB923C, #DC2626)' }}
              aria-hidden="true"
            />
            <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" aria-hidden="true" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 mb-2">Länken har upphört</h1>
            <p className="text-[13.5px] text-slate-500 leading-relaxed">
              Delningslänkar gäller i 30 dagar och kan återkallas när som helst av den som delade
              den. Be personen om en ny länk.
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  const { stats, applications, ownerName } = shared;

  return (
    <Shell>
      <main className="flex-1 px-4 sm:px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Rubrik */}
          <div
            className="bg-white rounded-3xl border border-orange-200/50 p-5 sm:p-7"
            style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.15)' }}
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-orange-600">
              Jobbsökningsöversikt
            </div>
            <h1 className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">
              {ownerName || 'Delad översikt'}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-slate-600">
              <span>
                <span className="font-bold text-slate-900 tabular-nums">{stats.totalApplications}</span>{' '}
                sökta jobb
              </span>
              <span className="text-slate-300">·</span>
              <span>
                <span className="font-bold text-slate-900 tabular-nums">{stats.interviewedCount}</span>{' '}
                intervjuprocesser
              </span>
              <span className="text-slate-300">·</span>
              <span>
                <span className="font-bold text-slate-900 tabular-nums">{stats.offerCount}</span>{' '}
                erbjudanden
              </span>
            </div>
          </div>

          {/* Tratt */}
          {stats.totalApplications > 0 && (
            <div className="bg-white rounded-2xl border border-orange-200/50 p-5 sm:p-6">
              <h2 className="text-[14.5px] font-bold text-slate-900 mb-3">Processen i siffror</h2>
              <FunnelBars stats={stats} />
            </div>
          )}

          {/* Sankey på större skärmar */}
          {stats.totalApplications > 2 && (
            <div className="hidden md:block bg-white rounded-2xl border border-orange-200/50 p-6">
              <h2 className="text-[14.5px] font-bold text-slate-900 mb-4">Flödesdiagram</h2>
              <SankeyChart stats={stats} />
            </div>
          )}

          {/* Ansökningslista (om ägaren valt att visa den) */}
          {applications && applications.length > 0 && (
            <div className="bg-white rounded-2xl border border-orange-200/50 p-5 sm:p-6 overflow-x-auto">
              <h2 className="text-[14.5px] font-bold text-slate-900 mb-3">Sökta tjänster</h2>
              <table className="w-full text-[12.5px] min-w-[480px]">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-200">
                    <th className="py-2 pr-3 font-semibold">Datum</th>
                    <th className="py-2 pr-3 font-semibold">Tjänst</th>
                    <th className="py-2 pr-3 font-semibold">Arbetsgivare</th>
                    <th className="py-2 pr-3 font-semibold">Sätt</th>
                    <th className="py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 pr-3 text-slate-500 whitespace-nowrap">{formatDate(row.applied_at)}</td>
                      <td className="py-2 pr-3 text-slate-800 font-medium">{row.job_title}</td>
                      <td className="py-2 pr-3 text-slate-600">
                        {row.company}
                        {row.location ? `, ${row.location}` : ''}
                      </td>
                      <td className="py-2 pr-3 text-slate-500 whitespace-nowrap">
                        {CHANNEL_META[row.application_channel as ApplicationChannel]?.short ?? ''}
                      </td>
                      <td className="py-2 text-slate-600 whitespace-nowrap">
                        {row.current_status
                          ? STATUS_META[row.current_status as ApplicationEventType]?.label
                          : 'Sökt'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </Shell>
  );
}
