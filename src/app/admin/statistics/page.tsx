'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { USD_TO_SEK } from '@/lib/admin/currency';
import { subDays, format } from 'date-fns';
import { sv } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Wallet,
  Cpu,
  TrendingUp,
  Users,
  Coins,
  BarChart3,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import MetricCard from '@/components/admin/ui/MetricCard';
import SectionCard from '@/components/admin/ui/SectionCard';
import PeriodSelector from '@/components/admin/ui/PeriodSelector';
import CostTimeSeriesChart from '@/components/admin/CostTimeSeriesChart';
import FeatureUsageChart from '@/components/admin/FeatureUsageChart';
import FeatureCostBreakdown from '@/components/admin/FeatureCostBreakdown';
import TopUsersTable from '@/components/admin/TopUsersTable';

/** Stripe-svaret från /api/admin/stripe-revenue (endast fälten vi använder). */
interface StripeSummary {
  total: number;
  byDate: { date: string; amount: number }[];
  mrr: number;
  activeSubscriptions: number | null;
}

/** En punkt från /api/admin/statistics/cost-timeseries. */
interface TimeSeriesPoint {
  date: string;
  totalCostSek: number;
  totalCostUsd: number;
  totalTokens: number;
  totalCalls: number;
  byFeature: Record<string, { costSek: number; calls: number; tokens: number }>;
}

/** En rad från /api/admin/statistics/feature-usage. */
interface FeatureRow {
  featureName: string;
  totalCalls: number;
  totalCostSek: number;
  totalTokens: number;
  avgCostPerCall: number;
  models: string[];
}

/** En rad från /api/admin/statistics/user-costs. */
interface UserCostRow {
  userId: string;
  email: string;
  fullName: string | null;
  subscriptionStatus: string;
  totalCostSek: number;
  totalCalls: number;
  totalTokens: number;
  featuresUsed: string[];
  firstUsage: string;
  lastUsage: string;
}

const fmtKr = (n: number) =>
  `${n.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr`;

const RevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium text-slate-900 mb-1">{label}</p>
      <p className="text-sm text-slate-600">
        Intäkt: {Number(payload[0].value).toLocaleString('sv-SE', { maximumFractionDigits: 2 })} kr
      </p>
    </div>
  );
};

export default function StatisticsPage() {
  const [period, setPeriod] = useState('30');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stripe, setStripe] = useState<StripeSummary | null>(null);
  const [aiCostSek, setAiCostSek] = useState(0);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([]);
  const [features, setFeatures] = useState<FeatureRow[]>([]);
  const [userCosts, setUserCosts] = useState<UserCostRow[]>([]);

  const supabase = getSupabaseClient();
  const days = Number(period);
  const groupBy: 'day' | 'week' = days > 30 ? 'week' : 'day';

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const problems: string[] = [];
    const dateFrom = subDays(new Date(), days).toISOString();

    // Intäkter från Stripe, med revenue_tracking som avgränsad fallback.
    const loadRevenue = async (): Promise<StripeSummary | null> => {
      try {
        const res = await fetch(`/api/admin/stripe-revenue?days=${days}`);
        const json = await res.json();
        if (json.success) {
          return {
            total: json.revenue?.total ?? 0,
            byDate: json.revenue?.byDate ?? [],
            mrr: json.subscriptions?.mrr ?? 0,
            activeSubscriptions: json.subscriptions?.active ?? null,
          };
        }
        throw new Error(json.error || 'Stripe-anropet misslyckades');
      } catch {
        // Fallback: färdigsummerade rader ur revenue_tracking, aldrig hela tabellen.
        const { data, error: dbError } = await supabase
          .from('revenue_tracking')
          .select('amount, created_at')
          .eq('status', 'completed')
          .gte('created_at', dateFrom)
          .limit(5000);
        if (dbError || !data) {
          problems.push('Kunde inte hämta intäkter');
          return null;
        }
        const byDay = new Map<string, number>();
        let total = 0;
        for (const row of data) {
          const amount = Number(row.amount) || 0;
          total += amount;
          const key = String(row.created_at).slice(0, 10);
          byDay.set(key, (byDay.get(key) || 0) + amount);
        }
        return {
          total,
          byDate: Array.from(byDay.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, amount]) => ({ date, amount })),
          mrr: 0,
          activeSubscriptions: null,
        };
      }
    };

    // AI-kostnad i USD från interna estimat, konverteras till SEK.
    const loadAiCost = async (): Promise<number | null> => {
      try {
        const res = await fetch(`/api/admin/openai-usage?days=${days}`);
        const json = await res.json();
        if (json.success && json.data && typeof json.data.totalCost === 'number') {
          return json.data.totalCost * USD_TO_SEK;
        }
        return null;
      } catch {
        return null;
      }
    };

    const loadJson = async (url: string, label: string) => {
      try {
        const res = await fetch(url);
        const json = await res.json();
        if (json.success) return json;
        throw new Error(json.error || 'okänt fel');
      } catch {
        problems.push(`Kunde inte hämta ${label}`);
        return null;
      }
    };

    const [revenue, aiCostFromApi, tsJson, featJson, usersJson] = await Promise.all([
      loadRevenue(),
      loadAiCost(),
      loadJson(
        `/api/admin/statistics/cost-timeseries?dateFrom=${encodeURIComponent(dateFrom)}&groupBy=${groupBy}`,
        'kostnadsutveckling'
      ),
      loadJson(
        `/api/admin/statistics/feature-usage?dateFrom=${encodeURIComponent(dateFrom)}`,
        'funktionsanvändning'
      ),
      loadJson(
        `/api/admin/statistics/user-costs?dateFrom=${encodeURIComponent(dateFrom)}&limit=100`,
        'användarkostnader'
      ),
    ]);

    const ts: TimeSeriesPoint[] = tsJson?.timeSeries ?? [];

    // AI-kostnad: API:t först, sedan tidsseriens SEK-summa, sist letters som smal fallback.
    let cost = aiCostFromApi;
    if (cost === null || cost === 0) {
      const tsSum = ts.reduce((sum, p) => sum + (p.totalCostSek || 0), 0);
      if (tsSum > 0) {
        cost = tsSum;
      } else {
        const { data: letterRows } = await supabase
          .from('letters')
          .select('ai_cost, created_at')
          .gte('created_at', dateFrom)
          .limit(10000);
        cost =
          letterRows?.reduce(
            (sum, l) => sum + (parseFloat(String(l.ai_cost ?? 0)) || 0) * USD_TO_SEK,
            0
          ) ?? 0;
      }
    }

    setStripe(revenue);
    setAiCostSek(cost ?? 0);
    setTimeSeries(ts);
    setFeatures(featJson?.features ?? []);
    setUserCosts(usersJson?.users ?? []);
    setError(problems.length > 0 ? problems.join('. ') : null);
    setIsLoading(false);
  }, [supabase, days, groupBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Daglig intäktsserie med utfyllda nollor för dagar utan betalningar.
  const revenueSeries = useMemo(() => {
    const byDate = new Map((stripe?.byDate ?? []).map((d) => [d.date, d.amount]));
    const now = new Date();
    const out: { date: string; amount: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = subDays(now, i);
      const key = format(d, 'yyyy-MM-dd');
      out.push({
        date: format(d, 'd MMM', { locale: sv }),
        amount: byDate.get(key) || 0,
      });
    }
    return out;
  }, [stripe, days]);

  const revenueTotal = stripe?.total ?? 0;
  const grossProfit = revenueTotal - aiCostSek;
  const grossMarginPct = revenueTotal > 0 ? (grossProfit / revenueTotal) * 100 : 0;
  const aiUserCount = userCosts.length;
  const costPerActiveUser = aiUserCount > 0 ? aiCostSek / aiUserCount : 0;
  const featureNames = useMemo(() => features.map((f) => f.featureName), [features]);

  if (isLoading && !stripe && features.length === 0) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Laddar statistik...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Statistik &amp; ekonomi</h2>
            <p className="text-sm text-slate-500">Intäkter, AI-kostnader och marginal per period</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <PeriodSelector value={period} onChange={setPeriod} />
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Uppdatera</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* KPI-rad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <MetricCard
          title={`Intäkt ${days} dagar`}
          value={fmtKr(revenueTotal)}
          icon={<Wallet className="w-4 h-4" />}
          iconClass="bg-emerald-50 text-emerald-600"
          subtitle={stripe && stripe.mrr > 0 ? `MRR ${fmtKr(stripe.mrr)}` : undefined}
        />
        <MetricCard
          title={`AI-kostnad ${days} dagar`}
          value={`${aiCostSek.toLocaleString('sv-SE', { maximumFractionDigits: 2 })} kr`}
          icon={<Cpu className="w-4 h-4" />}
          iconClass="bg-orange-50 text-orange-600"
          subtitle="Interna estimat, SEK"
        />
        <MetricCard
          title="Bruttomarginal"
          value={fmtKr(grossProfit)}
          icon={<TrendingUp className="w-4 h-4" />}
          iconClass="bg-indigo-50 text-indigo-600"
          subtitle={
            revenueTotal > 0
              ? `${grossMarginPct.toLocaleString('sv-SE', { maximumFractionDigits: 1 })} % av intäkten`
              : 'Ingen intäkt i perioden'
          }
        />
        <MetricCard
          title="Aktiva prenumeranter"
          value={stripe?.activeSubscriptions ?? '-'}
          icon={<Users className="w-4 h-4" />}
          iconClass="bg-amber-50 text-amber-600"
          subtitle="Enligt Stripe just nu"
        />
        <MetricCard
          title="Kostnad per aktiv användare"
          value={`${costPerActiveUser.toLocaleString('sv-SE', { maximumFractionDigits: 2 })} kr`}
          icon={<Coins className="w-4 h-4" />}
          iconClass="bg-slate-100 text-slate-600"
          subtitle={`${aiUserCount} användare med AI-användning`}
        />
      </div>

      {/* Intäkter över tid */}
      <SectionCard title="Intäkter över tid" subtitle="Stripe-betalningar per dag i vald period">
        {revenueSeries.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">Ingen intäktsdata för perioden</div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip content={<RevenueTooltip />} cursor={{ fill: 'rgba(249, 115, 22, 0.06)' }} />
                <Bar dataKey="amount" name="Intäkt" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </SectionCard>

      {/* AI-kostnad över tid */}
      <SectionCard
        title="AI-kostnad över tid"
        subtitle={groupBy === 'week' ? 'Kostnad i SEK per vecka och funktion' : 'Kostnad i SEK per dag och funktion'}
      >
        {timeSeries.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">Ingen AI-kostnadsdata för perioden</div>
        ) : (
          <CostTimeSeriesChart data={timeSeries} groupBy={groupBy} features={featureNames} />
        )}
      </SectionCard>

      {/* Funktioner: användning + kostnad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Användning per funktion" subtitle="Antal AI-anrop per funktion i perioden">
          {features.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">Ingen användningsdata för perioden</div>
          ) : (
            <FeatureUsageChart data={features} metric="calls" />
          )}
        </SectionCard>
        <SectionCard title="Kostnad per funktion" subtitle="Så fördelas AI-kostnaden mellan funktionerna">
          {features.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">Ingen kostnadsdata för perioden</div>
          ) : (
            <FeatureCostBreakdown data={features} />
          )}
        </SectionCard>
      </div>

      {/* Dyraste användarna */}
      <SectionCard title="Dyraste användarna" subtitle="Topp 20 efter AI-kostnad i vald period">
        {userCosts.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">Ingen användardata för perioden</div>
        ) : (
          <TopUsersTable data={userCosts.slice(0, 20)} />
        )}
      </SectionCard>
    </div>
  );
}
