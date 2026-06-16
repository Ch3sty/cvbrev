'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import {
  Users, FileText, Zap, RefreshCw, Crown, TrendingDown, Filter
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { sv } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import SectionCard from '@/components/admin/ui/SectionCard';
import PeriodSelector from '@/components/admin/ui/PeriodSelector';
import ConversionFunnel from '@/components/admin/charts/ConversionFunnel';

// === Types ===

interface FunnelStage {
  name: string;
  value: number;
  fill: string;
  icon: React.ReactNode;
  percentage: number;        // % of stage 1
  conversionFromPrev: number; // % conversion from previous stage
}

interface TimePoint {
  date: string;
  registrerade: number;
  cv_upload: number;
  verktyg: number;
  aterkommande: number;
  premium: number;
}

// === Constants ===

const FUNNEL_COLORS = [
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
];

const DATE_RANGES = [
  { value: '7', label: '7 dagar' },
  { value: '30', label: '30 dagar' },
  { value: '90', label: '90 dagar' },
  { value: 'all', label: 'Alla' },
];

const STAGE_ICONS = [
  <Users key="users" className="w-5 h-5" />,
  <FileText key="file" className="w-5 h-5" />,
  <Zap key="zap" className="w-5 h-5" />,
  <RefreshCw key="refresh" className="w-5 h-5" />,
  <Crown key="crown" className="w-5 h-5" />,
];

const STAGE_NAMES = [
  'Registrerade',
  'Laddade upp CV',
  'Använde verktyg',
  'Återkommande',
  'Premium',
];

// === Custom Tooltip ===

function CustomAreaTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
      <p className="font-medium text-gray-900 mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

// === Main Component ===

export default function FunnelPage() {
  const [funnelData, setFunnelData] = useState<FunnelStage[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimePoint[]>([]);
  const [dateRange, setDateRange] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  const fetchFunnelData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const now = new Date();
      let dateFrom: Date | null = null;
      if (dateRange === '7') dateFrom = subDays(now, 7);
      else if (dateRange === '30') dateFrom = subDays(now, 30);
      else if (dateRange === '90') dateFrom = subDays(now, 90);

      // Build queries
      let profilesQuery = supabase.from('profiles').select('id, subscription_tier, created_at').limit(10000);
      let cvTextsQuery = supabase.from('cv_texts').select('user_id, created_at').limit(10000);
      let activitiesQuery = supabase.from('user_activities').select('user_id, activity_type, created_at').limit(10000);
      let lettersQuery = supabase.from('letters').select('user_id, created_at').limit(10000);
      let downloadsQuery = supabase.from('formatted_cv_downloads').select('user_id, created_at').limit(10000);
      let analysisJobsQuery = supabase.from('cv_analysis_jobs').select('user_id, created_at, status').eq('status', 'completed').limit(10000);

      // Date filter on profiles (who registered in this period)
      if (dateFrom) {
        const isoDate = dateFrom.toISOString();
        profilesQuery = profilesQuery.gte('created_at', isoDate);
      }

      const [
        { data: profiles },
        { data: cvTexts },
        { data: activities },
        { data: letters },
        { data: downloads },
        { data: analysisJobs }
      ] = await Promise.all([
        profilesQuery, cvTextsQuery, activitiesQuery,
        lettersQuery, downloadsQuery, analysisJobsQuery
      ]);

      // Stage 1: Registrerade
      const registeredUsers = new Set(profiles?.map(p => p.id) || []);
      const registeredCount = registeredUsers.size;

      // Stage 2: Laddade upp CV (only users from stage 1)
      const cvUploadUsers = new Set(
        (cvTexts || []).filter(c => registeredUsers.has(c.user_id)).map(c => c.user_id)
      );
      const cvUploadCount = cvUploadUsers.size;

      // Stage 3: Använde verktyg (letter, cv_analysis, cv_download)
      const toolUsers = new Set<string>();
      (letters || []).forEach(l => { if (registeredUsers.has(l.user_id)) toolUsers.add(l.user_id); });
      (analysisJobs || []).forEach(a => { if (registeredUsers.has(a.user_id)) toolUsers.add(a.user_id); });
      (downloads || []).forEach(d => { if (registeredUsers.has(d.user_id)) toolUsers.add(d.user_id); });
      const toolUsersCount = toolUsers.size;

      // Stage 4: Återkommande (2+ different activity types)
      const userActivityTypes: Record<string, Set<string>> = {};
      (activities || []).forEach(a => {
        if (!registeredUsers.has(a.user_id)) return;
        if (a.activity_type === 'registered' || a.activity_type === 'login') return;
        if (!userActivityTypes[a.user_id]) userActivityTypes[a.user_id] = new Set();
        userActivityTypes[a.user_id].add(a.activity_type);
      });
      const returningUsers = new Set(
        Object.entries(userActivityTypes)
          .filter(([_, types]) => types.size >= 2)
          .map(([userId]) => userId)
      );
      const returningCount = returningUsers.size;

      // Stage 5: Premium
      const premiumUsers = new Set(
        (profiles || []).filter(p => p.subscription_tier === 'premium').map(p => p.id)
      );
      const premiumCount = premiumUsers.size;

      // Build funnel data
      const counts = [registeredCount, cvUploadCount, toolUsersCount, returningCount, premiumCount];
      const stages: FunnelStage[] = counts.map((count, i) => ({
        name: STAGE_NAMES[i],
        value: count,
        fill: FUNNEL_COLORS[i],
        icon: STAGE_ICONS[i],
        percentage: registeredCount > 0 ? (count / registeredCount) * 100 : 0,
        conversionFromPrev: i === 0 ? 100 : (counts[i - 1] > 0 ? (count / counts[i - 1]) * 100 : 0),
      }));
      setFunnelData(stages);

      // Build time series (cumulative per day)
      const daysCount = dateRange === 'all' ? 90 : parseInt(dateRange);
      const timePoints: TimePoint[] = [];

      for (let i = 0; i < daysCount; i++) {
        const date = subDays(now, daysCount - 1 - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const label = daysCount <= 30
          ? format(date, 'dd MMM', { locale: sv })
          : format(date, 'dd/MM', { locale: sv });

        // Count users registered up to this date
        const usersUpToDate = new Set(
          (profiles || []).filter(p => format(new Date(p.created_at), 'yyyy-MM-dd') <= dateStr).map(p => p.id)
        );

        const cvUpToDate = new Set(
          (cvTexts || []).filter(c => usersUpToDate.has(c.user_id) && format(new Date(c.created_at), 'yyyy-MM-dd') <= dateStr).map(c => c.user_id)
        );

        const toolUpToDate = new Set<string>();
        (letters || []).forEach(l => {
          if (usersUpToDate.has(l.user_id) && format(new Date(l.created_at), 'yyyy-MM-dd') <= dateStr)
            toolUpToDate.add(l.user_id);
        });
        (analysisJobs || []).forEach(a => {
          if (usersUpToDate.has(a.user_id) && format(new Date(a.created_at), 'yyyy-MM-dd') <= dateStr)
            toolUpToDate.add(a.user_id);
        });
        (downloads || []).forEach(d => {
          if (usersUpToDate.has(d.user_id) && format(new Date(d.created_at), 'yyyy-MM-dd') <= dateStr)
            toolUpToDate.add(d.user_id);
        });

        // For returning users and premium, use simplified cumulative count
        const returningUpToDate = new Set(
          Object.entries(userActivityTypes)
            .filter(([userId, types]) => usersUpToDate.has(userId) && types.size >= 2)
            .map(([userId]) => userId)
        );

        const premiumUpToDate = new Set(
          (profiles || []).filter(p =>
            p.subscription_tier === 'premium' && format(new Date(p.created_at), 'yyyy-MM-dd') <= dateStr
          ).map(p => p.id)
        );

        timePoints.push({
          date: label,
          registrerade: usersUpToDate.size,
          cv_upload: cvUpToDate.size,
          verktyg: toolUpToDate.size,
          aterkommande: returningUpToDate.size,
          premium: premiumUpToDate.size,
        });
      }

      // Sample time points if too many (show every Nth point)
      const maxPoints = 45;
      if (timePoints.length > maxPoints) {
        const step = Math.ceil(timePoints.length / maxPoints);
        const sampled = timePoints.filter((_, i) => i % step === 0 || i === timePoints.length - 1);
        setTimeSeriesData(sampled);
      } else {
        setTimeSeriesData(timePoints);
      }

    } catch (err: any) {
      console.error('Funnel data fetch error:', err);
      setError('Kunde inte hämta funneldata');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, supabase]);

  useEffect(() => {
    fetchFunnelData();
    const interval = setInterval(fetchFunnelData, 300000); // 5 min
    return () => clearInterval(interval);
  }, [fetchFunnelData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button onClick={fetchFunnelData} className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
          Försök igen
        </button>
      </div>
    );
  }

  const totalRegistered = funnelData[0]?.value || 0;
  const totalPremium = funnelData[4]?.value || 0;
  const overallConversion = totalRegistered > 0 ? ((totalPremium / totalRegistered) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Konverteringstratt</h1>
            <p className="text-sm text-slate-500">Analysera användarresan från registrering till premium</p>
          </div>
        </div>

        <PeriodSelector value={dateRange} onChange={setDateRange} options={DATE_RANGES} />
      </div>

      {/* Funnel Stage Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {funnelData.map((stage, i) => (
          <div
            key={stage.name}
            className="bg-white rounded-xl border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow p-5"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Steg {i + 1}</span>
              <span
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${stage.fill}1a`, color: stage.fill }}
              >
                {stage.icon}
              </span>
            </div>
            <p className="text-3xl font-semibold tabular-nums text-slate-900">{stage.value}</p>
            <p className="text-sm font-medium text-slate-600 mt-1">{stage.name}</p>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="font-medium tabular-nums" style={{ color: stage.fill }}>
                {stage.percentage.toFixed(1)}% av alla
              </span>
              {i > 0 && (
                <span className="text-slate-400 tabular-nums">{stage.conversionFromPrev.toFixed(0)}% konv.</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main Funnel Visualization + Conversion Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel — horisontella krympande staplar */}
        <div className="lg:col-span-2">
          <SectionCard title="Konverteringstratt" subtitle="Andel kvar i varje steg och avhopp däremellan">
            <ConversionFunnel stages={funnelData} />
          </SectionCard>
        </div>

        {/* Step-by-step Conversion Rates */}
        <SectionCard title="Konverteringsgrad" subtitle="Övergång mellan stegen">
          <div className="space-y-5">
            {funnelData.slice(1).map((stage, i) => {
              const prevStage = funnelData[i];
              const rate = prevStage.value > 0 ? (stage.value / prevStage.value) * 100 : 0;
              return (
                <div key={stage.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600">
                      {prevStage.name} <span className="text-slate-400">→</span> {stage.name}
                    </span>
                    <span className="text-sm font-semibold tabular-nums" style={{ color: stage.fill }}>
                      {rate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(rate, 100)}%` }}
                      transition={{ duration: 0.8, delay: i * 0.15 }}
                      className="h-2 rounded-full"
                      style={{ backgroundColor: stage.fill }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-slate-400 tabular-nums">
                    <span>{prevStage.value} användare</span>
                    <span>{stage.value} användare</span>
                  </div>
                </div>
              );
            })}

            {/* Total conversion */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">Total konvertering</span>
                </div>
                <span className="text-lg font-bold text-emerald-600 tabular-nums">{overallConversion}%</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 tabular-nums">
                {totalRegistered} registrerade → {totalPremium} premium
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Time Series Chart */}
      <SectionCard title="Utveckling över tid" subtitle="Antal användare per steg över tid">
        {timeSeriesData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomAreaTooltip />} />
              <Legend wrapperStyle={{ fontSize: '13px' }} />
              <Area type="monotone" dataKey="registrerade" name="Registrerade" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.12} strokeWidth={2} />
              <Area type="monotone" dataKey="cv_upload" name="CV-uppladdning" fill="#8b5cf6" stroke="#8b5cf6" fillOpacity={0.12} strokeWidth={2} />
              <Area type="monotone" dataKey="verktyg" name="Använde verktyg" fill="#ec4899" stroke="#ec4899" fillOpacity={0.12} strokeWidth={2} />
              <Area type="monotone" dataKey="aterkommande" name="Återkommande" fill="#f59e0b" stroke="#f59e0b" fillOpacity={0.12} strokeWidth={2} />
              <Area type="monotone" dataKey="premium" name="Premium" fill="#10b981" stroke="#10b981" fillOpacity={0.12} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <p>Ingen data tillgänglig för vald period</p>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
