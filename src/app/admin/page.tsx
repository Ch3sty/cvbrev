'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { Users, Crown, UserPlus, TrendingUp, Percent } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import MetricCard from '@/components/admin/ui/MetricCard';
import SectionCard from '@/components/admin/ui/SectionCard';
import PeriodSelector from '@/components/admin/ui/PeriodSelector';
import RecentPremiumList from '@/components/admin/RecentPremiumList';
import RecentUsersList from '@/components/admin/RecentUsersList';

interface GrowthPoint {
  date: string;
  label: string;
  nya: number;
}

interface SourcePoint {
  name: string;
  antal: number;
  fill: string;
}

interface DashboardStats {
  total_users: number;
  premium_users: number;
  new_users_today: number;
  new_in_period: number;
  new_in_previous_period: number;
}

interface RecentUser {
  id: string;
  email: string;
  full_name: string | null;
  subscription_tier: string | null;
  created_at: string;
}

interface PremiumUser {
  id: string;
  email: string;
  full_name: string | null;
  premium_source: string | null;
  subscription_status: string | null;
  stripe_customer_id: string | null;
  updated_at: string;
}

const SOURCE_COLORS: Record<string, string> = {
  Stripe: '#f97316',
  Admin: '#6366f1',
  'Gäst': '#10b981',
  Trial: '#f59e0b',
};

/** Lokal (svensk) kalenderdag som YYYY-MM-DD, utan UTC-skevning. */
function localDayKey(d: Date): string {
  return d.toLocaleDateString('sv-SE');
}

function categorizeSource(source: string | null): keyof typeof SOURCE_COLORS {
  if (source === 'admin') return 'Admin';
  if (source === 'guest_invitation') return 'Gäst';
  if (source === 'signup_trial' || source === 'oauth_signup_trial') return 'Trial';
  return 'Stripe';
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [growthData, setGrowthData] = useState<GrowthPoint[]>([]);
  const [sourceData, setSourceData] = useState<SourcePoint[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentPremium, setRecentPremium] = useState<PremiumUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<number>(30);

  const supabase = getSupabaseClient();

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);

      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - period);
      cutoff.setHours(0, 0, 0, 0);

      const prevCutoff = new Date(cutoff);
      prevCutoff.setDate(prevCutoff.getDate() - period);

      const [
        totalRes,
        premiumCountRes,
        todayRes,
        periodRes,
        prevPeriodRes,
        growthRes,
        sourcesRes,
        recentUsersRes,
        recentPremiumRes,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('subscription_tier', 'premium'),
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', todayStart.toISOString()),
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', cutoff.toISOString()),
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', prevCutoff.toISOString())
          .lt('created_at', cutoff.toISOString()),
        supabase
          .from('profiles')
          .select('created_at')
          .gte('created_at', cutoff.toISOString()),
        supabase
          .from('profiles')
          .select('premium_source')
          .eq('subscription_tier', 'premium'),
        supabase
          .from('profiles')
          .select('id, email, full_name, subscription_tier, created_at')
          .order('created_at', { ascending: false })
          .limit(8),
        supabase
          .from('profiles')
          .select('id, email, full_name, premium_source, subscription_status, stripe_customer_id, updated_at')
          .eq('subscription_tier', 'premium')
          .order('updated_at', { ascending: false })
          .limit(8),
      ]);

      const firstError =
        totalRes.error ||
        premiumCountRes.error ||
        todayRes.error ||
        periodRes.error ||
        prevPeriodRes.error ||
        growthRes.error ||
        sourcesRes.error ||
        recentUsersRes.error ||
        recentPremiumRes.error;
      if (firstError) throw firstError;

      setStats({
        total_users: totalRes.count ?? 0,
        premium_users: premiumCountRes.count ?? 0,
        new_users_today: todayRes.count ?? 0,
        new_in_period: periodRes.count ?? 0,
        new_in_previous_period: prevPeriodRes.count ?? 0,
      });

      // Tillväxt: gruppera per lokal dag och fyll i nollor för dagar utan registreringar
      const byDay: Record<string, number> = {};
      (growthRes.data ?? []).forEach((row: { created_at: string }) => {
        const key = localDayKey(new Date(row.created_at));
        byDay[key] = (byDay[key] ?? 0) + 1;
      });

      const points: GrowthPoint[] = [];
      const cursor = new Date(cutoff);
      while (cursor <= now) {
        const key = localDayKey(cursor);
        points.push({
          date: key,
          label: format(cursor, 'd MMM', { locale: sv }),
          nya: byDay[key] ?? 0,
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      setGrowthData(points);

      // Premiumfördelning: en stapel per källa
      const counts: Record<string, number> = { Stripe: 0, Admin: 0, 'Gäst': 0, Trial: 0 };
      (sourcesRes.data ?? []).forEach((row: { premium_source: string | null }) => {
        counts[categorizeSource(row.premium_source)] += 1;
      });
      setSourceData(
        Object.entries(counts).map(([name, antal]) => ({
          name,
          antal,
          fill: SOURCE_COLORS[name],
        }))
      );

      setRecentUsers(recentUsersRes.data ?? []);
      setRecentPremium(recentPremiumRes.data ?? []);
    } catch (err: unknown) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Ett fel uppstod vid hämtning av data');
    } finally {
      setIsLoading(false);
    }
  }, [period, supabase]);

  useEffect(() => {
    fetchAllData();
    // Uppdatera var 5:e minut
    const interval = setInterval(fetchAllData, 300000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  const conversionRate =
    stats && stats.total_users > 0
      ? `${((stats.premium_users / stats.total_users) * 100).toFixed(1)}%`
      : '0%';

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <h2 className="text-lg font-semibold text-red-900 mb-2">Ett fel uppstod</h2>
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Periodval styr KPI-delta och tillväxtgrafen */}
      <div className="flex items-center justify-end">
        <PeriodSelector value={period} onChange={(v) => setPeriod(Number(v))} />
      </div>

      {/* KPI-rad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <MetricCard
          title="Totalt antal användare"
          value={stats?.total_users ?? 0}
          icon={<Users className="w-4 h-4" />}
          iconClass="bg-slate-100 text-slate-600"
        />
        <MetricCard
          title="Premiumanvändare"
          value={stats?.premium_users ?? 0}
          icon={<Crown className="w-4 h-4" />}
          iconClass="bg-amber-50 text-amber-600"
        />
        <MetricCard
          title="Nya i dag"
          value={stats?.new_users_today ?? 0}
          icon={<UserPlus className="w-4 h-4" />}
          iconClass="bg-emerald-50 text-emerald-600"
        />
        <MetricCard
          title={`Nya senaste ${period} dagarna`}
          value={stats?.new_in_period ?? 0}
          icon={<TrendingUp className="w-4 h-4" />}
          iconClass="bg-orange-50 text-orange-600"
          current={stats?.new_in_period}
          previous={stats?.new_in_previous_period}
        />
        <MetricCard
          title="Konvertering till premium"
          value={conversionRate}
          icon={<Percent className="w-4 h-4" />}
          iconClass="bg-indigo-50 text-indigo-600"
          subtitle={`${stats?.premium_users ?? 0} av ${stats?.total_users ?? 0}`}
        />
      </div>

      {/* Användartillväxt */}
      <SectionCard
        title="Användartillväxt"
        subtitle={`Nya användare per dag, senaste ${period} dagarna`}
      >
        {isLoading && growthData.length === 0 ? (
          <div className="h-72 rounded-lg bg-slate-50 animate-pulse" />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ stroke: '#cbd5e1', strokeDasharray: '3 3' }}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                    fontSize: 12,
                  }}
                  labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                  formatter={(value: number) => [value, 'Nya användare']}
                />
                <Area
                  type="monotone"
                  dataKey="nya"
                  stroke="#f97316"
                  strokeWidth={2}
                  fill="url(#growthFill)"
                  activeDot={{ r: 4, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </SectionCard>

      {/* Premiumfördelning */}
      <SectionCard
        title="Premiumfördelning"
        subtitle="Aktuella premiumanvändare per källa"
      >
        {isLoading && sourceData.length === 0 ? (
          <div className="h-64 rounded-lg bg-slate-50 animate-pulse" />
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                    fontSize: 12,
                  }}
                  labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                  formatter={(value: number) => [value, 'Användare']}
                />
                <Bar dataKey="antal" radius={[6, 6, 0, 0]} maxBarSize={64}>
                  {sourceData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </SectionCard>

      {/* Senaste aktivitet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentPremiumList users={recentPremium} isLoading={isLoading} />
        <RecentUsersList users={recentUsers} isLoading={isLoading} />
      </div>
    </div>
  );
}
