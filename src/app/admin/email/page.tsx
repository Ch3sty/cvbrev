'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Send,
  Eye,
  MousePointerClick,
  UserX,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import StatsCard from '@/components/admin/StatsCard';

interface FeatureReminder {
  feature: string;
  pending: number;
  sent: number;
  total: number;
}

interface EngagementRow {
  email_type: string;
  sentCount: number;
  delivered: number;
  uniqueOpened: number;
  uniqueClicked: number;
  bounced: number;
  complained: number;
  openRate: number;
  clickRate: number;
  hasEvents: boolean;
}

interface EmailStats {
  days: number;
  reminders: {
    perFeature: FeatureReminder[];
    uniqueUsers: number;
    pendingTotal: number;
    optInsPerDay: { date: string; count: number }[];
  };
  optOutCount: number;
  trialRemindersSent: number;
  sends: {
    total: number;
    byType: Record<string, number>;
    byFeature: { feature: string; count: number }[];
    perDay: { date: string; quota_back: number; trial_reminder: number }[];
    recent: {
      sent_at: string;
      email_type: string;
      feature: string | null;
      recipient: string;
      subject: string;
    }[];
  };
  engagement: {
    byType: EngagementRow[];
    totals: {
      sentCount: number;
      delivered: number;
      uniqueOpened: number;
      uniqueClicked: number;
      openRate: number;
      clickRate: number;
    };
    topLinks: { link_url: string; clicks: number }[];
  };
  webhookConfigured: boolean;
  hasEvents: boolean;
}

function featureLabel(feature: string): string {
  if (feature === 'letter_generation') return 'Personliga brev';
  if (feature === 'cv_analysis') return 'CV-analys';
  if (feature === 'chat_message') return 'Jobbcoach-chatten';
  if (feature.startsWith('test:') || feature.includes('prov')) return 'Rekryteringstester';
  return feature;
}

function emailTypeLabel(emailType: string): string {
  if (emailType === 'quota_back') return 'Kvotpåminnelse';
  if (emailType === 'trial_reminder') return 'Trial-påminnelse';
  return emailType;
}

// Grupperar features med samma svenska etikett (t.ex. alla test:-nycklar)
function groupReminders(perFeature: FeatureReminder[]) {
  const grouped = new Map<string, { pending: number; sent: number; total: number }>();
  for (const row of perFeature) {
    const label = featureLabel(row.feature);
    const entry = grouped.get(label) ?? { pending: 0, sent: 0, total: 0 };
    entry.pending += row.pending;
    entry.sent += row.sent;
    entry.total += row.total;
    grouped.set(label, entry);
  }
  return Array.from(grouped.entries())
    .map(([label, counts]) => ({ label, ...counts }))
    .sort((a, b) => b.total - a.total);
}

export default function AdminEmailPage() {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<number>(30);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/email-stats?days=${dateRange}`);
      if (!res.ok) {
        throw new Error(`Kunde inte hämta statistiken (${res.status})`);
      }
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      console.error('Error fetching email stats:', err);
      setError(err.message || 'Ett fel uppstod vid hämtning av data');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-red-900 mb-2">Ett fel uppstod</h2>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  const groupedReminders = stats ? groupReminders(stats.reminders.perFeature) : [];
  const showEngagementDash = stats ? !stats.hasEvents : true;

  const chartData = (stats?.sends.perDay ?? []).map((item) => ({
    ...item,
    dateFormatted: format(new Date(item.date), 'd MMM', { locale: sv }),
  }));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">E-post</h1>
          <p className="text-gray-600 mt-1">Kvotpåminnelser och trial-mail, utskick och engagemang</p>
        </div>

        {/* Date range selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="dateRange" className="text-sm text-gray-600">Tidsperiod:</label>
          <select
            id="dateRange"
            value={dateRange}
            onChange={(e) => setDateRange(Number(e.target.value))}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value={7}>7 dagar</option>
            <option value={30}>30 dagar</option>
            <option value={90}>90 dagar</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Aktiva opt-ins"
          value={stats?.reminders.pendingTotal ?? 0}
          icon={<Bell className="w-6 h-6" />}
          subtitle={`${stats?.reminders.uniqueUsers ?? 0} unika användare totalt`}
          iconBgColor="bg-pink-100"
          iconColor="text-pink-600"
        />

        <StatsCard
          title="Skickade mail"
          value={stats?.sends.total ?? 0}
          icon={<Send className="w-6 h-6" />}
          subtitle={`Senaste ${stats?.days ?? dateRange} dagarna`}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />

        <StatsCard
          title="Öppningsfrekvens"
          value={showEngagementDash ? '–' : `${stats?.engagement.totals.openRate ?? 0}%`}
          icon={<Eye className="w-6 h-6" />}
          subtitle={showEngagementDash ? 'Kräver webhook-events' : `${stats?.engagement.totals.uniqueOpened ?? 0} unika öppningar`}
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-600"
        />

        <StatsCard
          title="Klickfrekvens"
          value={showEngagementDash ? '–' : `${stats?.engagement.totals.clickRate ?? 0}%`}
          icon={<MousePointerClick className="w-6 h-6" />}
          subtitle={showEngagementDash ? 'Kräver webhook-events' : `${stats?.engagement.totals.uniqueClicked ?? 0} unika klick`}
          iconBgColor="bg-violet-100"
          iconColor="text-violet-600"
        />

        <StatsCard
          title="Avregistrerade"
          value={stats?.optOutCount ?? 0}
          icon={<UserX className="w-6 h-6" />}
          subtitle="Har tackat nej till kvotmail"
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
        />

        <StatsCard
          title="Trial-påminnelser skickade"
          value={stats?.trialRemindersSent ?? 0}
          icon={<Clock className="w-6 h-6" />}
          subtitle="Totalt, alla tider"
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
        />
      </div>

      {/* Webhook-banner */}
      {stats && (!stats.webhookConfigured || !stats.hasEvents) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p className="font-semibold mb-1">
                Öppningar och klick kan inte mätas ännu
              </p>
              <p className="mb-2">
                Statistiken för leveranser, öppningar och klick bygger på webhook-händelser från Resend.
                {stats.webhookConfigured
                  ? ' Webhook-hemligheten är konfigurerad men inga händelser har tagits emot ännu. Kontrollera att webhooken är tillagd i Resend och att spårningen är påslagen:'
                  : ' Så här aktiverar du dem:'}
              </p>
              <ol className="list-decimal list-inside space-y-1">
                <li>
                  Gå till Resend-dashboarden → Webhooks och lägg till{' '}
                  <code className="bg-amber-100 px-1 py-0.5 rounded text-xs">https://www.jobbcoach.ai/api/webhooks/resend</code>{' '}
                  med händelserna delivered, opened, clicked, bounced och complained.
                </li>
                {!stats.webhookConfigured && (
                  <li>
                    Kopiera webhookens hemlighet (börjar med <code className="bg-amber-100 px-1 py-0.5 rounded text-xs">whsec_</code>)
                    till miljövariabeln <code className="bg-amber-100 px-1 py-0.5 rounded text-xs">RESEND_WEBHOOK_SECRET</code> i Vercel.
                  </li>
                )}
                <li>
                  Slå på Open tracking och Click tracking under Domains i Resend, annars skickas aldrig opened- och clicked-händelser.
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Påminnelser per funktion */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Påminnelser per funktion</h3>
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-gray-100 rounded"></div>
            <div className="h-8 bg-gray-100 rounded"></div>
            <div className="h-8 bg-gray-100 rounded"></div>
          </div>
        ) : groupedReminders.length === 0 ? (
          <p className="text-gray-500 text-sm">Inga opt-ins registrerade ännu</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-600">
                  <th className="py-2 pr-4 font-medium">Funktion</th>
                  <th className="py-2 pr-4 font-medium text-right">Väntar på utskick</th>
                  <th className="py-2 pr-4 font-medium text-right">Skickade</th>
                  <th className="py-2 font-medium text-right">Totalt</th>
                </tr>
              </thead>
              <tbody>
                {groupedReminders.map((row) => (
                  <tr key={row.label} className="border-b border-gray-100 last:border-0">
                    <td className="py-2.5 pr-4 text-gray-900 font-medium">{row.label}</td>
                    <td className="py-2.5 pr-4 text-right text-gray-700">{row.pending}</td>
                    <td className="py-2.5 pr-4 text-right text-gray-700">{row.sent}</td>
                    <td className="py-2.5 text-right text-gray-900 font-medium">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Utskick per dag */}
      {isLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-[300px] bg-gray-100 rounded"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Utskick per dag</h3>
          {chartData.length === 0 || (stats?.sends.total ?? 0) === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Inga utskick under perioden
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="dateFormatted"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '14px' }} />
                <Bar
                  dataKey="quota_back"
                  name="Kvotpåminnelser"
                  stackId="sends"
                  fill="#ec4899"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="trial_reminder"
                  name="Trial-påminnelser"
                  stackId="sends"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* Engagemang per mailtyp */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagemang per mailtyp</h3>
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-gray-100 rounded"></div>
            <div className="h-8 bg-gray-100 rounded"></div>
          </div>
        ) : (stats?.engagement.byType.length ?? 0) === 0 ? (
          <p className="text-gray-500 text-sm">Inga utskick under perioden</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-600">
                  <th className="py-2 pr-4 font-medium">Mailtyp</th>
                  <th className="py-2 pr-4 font-medium text-right">Skickade</th>
                  <th className="py-2 pr-4 font-medium text-right">Levererade</th>
                  <th className="py-2 pr-4 font-medium text-right">Öppnade</th>
                  <th className="py-2 pr-4 font-medium text-right">Klickade</th>
                  <th className="py-2 pr-4 font-medium text-right">Studsade</th>
                  <th className="py-2 pr-4 font-medium text-right">Öppning %</th>
                  <th className="py-2 font-medium text-right">Klick %</th>
                </tr>
              </thead>
              <tbody>
                {stats?.engagement.byType.map((row) => (
                  <tr key={row.email_type} className="border-b border-gray-100 last:border-0">
                    <td className="py-2.5 pr-4 text-gray-900 font-medium">{emailTypeLabel(row.email_type)}</td>
                    <td className="py-2.5 pr-4 text-right text-gray-700">{row.sentCount}</td>
                    <td className="py-2.5 pr-4 text-right text-gray-700">{row.hasEvents ? row.delivered : '–'}</td>
                    <td className="py-2.5 pr-4 text-right text-gray-700">{row.hasEvents ? row.uniqueOpened : '–'}</td>
                    <td className="py-2.5 pr-4 text-right text-gray-700">{row.hasEvents ? row.uniqueClicked : '–'}</td>
                    <td className="py-2.5 pr-4 text-right text-gray-700">{row.hasEvents ? row.bounced : '–'}</td>
                    <td className="py-2.5 pr-4 text-right text-gray-900 font-medium">{row.hasEvents ? `${row.openRate}%` : '–'}</td>
                    <td className="py-2.5 text-right text-gray-900 font-medium">{row.hasEvents ? `${row.clickRate}%` : '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Toppklickade länkar */}
      {!isLoading && (stats?.engagement.topLinks.length ?? 0) > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Toppklickade länkar</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-600">
                  <th className="py-2 pr-4 font-medium">Länk</th>
                  <th className="py-2 font-medium text-right">Klick</th>
                </tr>
              </thead>
              <tbody>
                {stats?.engagement.topLinks.map((link) => (
                  <tr key={link.link_url} className="border-b border-gray-100 last:border-0">
                    <td className="py-2.5 pr-4 text-gray-700 break-all">{link.link_url}</td>
                    <td className="py-2.5 text-right text-gray-900 font-medium">{link.clicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Senaste utskick */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Senaste utskick</h3>
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-gray-100 rounded"></div>
            <div className="h-8 bg-gray-100 rounded"></div>
            <div className="h-8 bg-gray-100 rounded"></div>
          </div>
        ) : (stats?.sends.recent.length ?? 0) === 0 ? (
          <p className="text-gray-500 text-sm">Inga utskick under perioden</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-600">
                  <th className="py-2 pr-4 font-medium">Tid</th>
                  <th className="py-2 pr-4 font-medium">Typ</th>
                  <th className="py-2 pr-4 font-medium">Funktion</th>
                  <th className="py-2 pr-4 font-medium">Mottagare</th>
                  <th className="py-2 font-medium">Ämne</th>
                </tr>
              </thead>
              <tbody>
                {stats?.sends.recent.map((row, index) => (
                  <tr key={`${row.sent_at}-${index}`} className="border-b border-gray-100 last:border-0">
                    <td className="py-2.5 pr-4 text-gray-700 whitespace-nowrap">
                      {format(new Date(row.sent_at), 'd MMM HH:mm', { locale: sv })}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-700 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        row.email_type === 'quota_back'
                          ? 'bg-pink-50 text-pink-700'
                          : 'bg-violet-50 text-violet-700'
                      }`}>
                        {emailTypeLabel(row.email_type)}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-gray-700 whitespace-nowrap">
                      {row.feature ? featureLabel(row.feature) : '–'}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-700">{row.recipient}</td>
                    <td className="py-2.5 text-gray-700">{row.subject}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
