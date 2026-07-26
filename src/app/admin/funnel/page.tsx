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
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import SectionCard from '@/components/admin/ui/SectionCard';
import PeriodSelector from '@/components/admin/ui/PeriodSelector';
import ConversionSankey from '@/components/admin/charts/ConversionSankey';

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

interface RetentionRad {
  kohortmanad: string;
  kohortstorlek: number;
  manad_offset: number;
  aktiva: number;
}

// === Constants ===

const FUNNEL_COLORS = [
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#f97316', // orange-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
];

const HAMTGRANS = 50000;

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
  const [retention, setRetention] = useState<RetentionRad[]>([]);
  const [trunkerad, setTrunkerad] = useState(false);
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
      let profilesQuery = supabase.from('profiles').select('id, subscription_tier, created_at').limit(HAMTGRANS);
      let cvTextsQuery = supabase.from('cv_texts').select('user_id, created_at').limit(HAMTGRANS);
      let activitiesQuery = supabase.from('user_activities').select('user_id, activity_type, created_at').limit(HAMTGRANS);
      let lettersQuery = supabase.from('letters').select('user_id, created_at').limit(HAMTGRANS);
      let downloadsQuery = supabase.from('formatted_cv_downloads').select('user_id, created_at').limit(HAMTGRANS);
      let analysisJobsQuery = supabase.from('cv_analysis_jobs').select('user_id, created_at, status').eq('status', 'completed').limit(HAMTGRANS);
      const retentionQuery = supabase.from('admin_retention_cohorts').select('*').order('kohortmanad', { ascending: false });

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
        { data: analysisJobs },
        { data: retentionData }
      ] = await Promise.all([
        profilesQuery, cvTextsQuery, activitiesQuery,
        lettersQuery, downloadsQuery, analysisJobsQuery,
        retentionQuery
      ]);

      setRetention((retentionData as RetentionRad[]) || []);
      setTrunkerad(
        [profiles, cvTexts, activities, letters, downloads, analysisJobs]
          .some((rader) => (rader?.length || 0) >= HAMTGRANS)
      );

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
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
      {/* Periodval (sidtiteln visas i headern) */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">Användarresan från registrering till premium</p>
        <PeriodSelector value={dateRange} onChange={setDateRange} options={DATE_RANGES} />
      </div>

      {trunkerad && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
          Datamängden har nått hämtgränsen ({HAMTGRANS.toLocaleString('sv-SE')} rader per tabell),
          siffrorna nedan kan vara underskattade. Dags att flytta trattberäkningen till en databasvy.
        </div>
      )}

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

      {/* Användarresan som flöde (Sankey) — fullbredd */}
      <SectionCard
        title="Användarresan"
        subtitle="Flöde från registrering till premium, avhopp grenar ut vid varje steg"
        action={
          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <TrendingDown className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total konvertering</span>
              <span className="text-lg font-bold text-emerald-600 tabular-nums">{overallConversion}%</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 tabular-nums">
              {totalRegistered} registrerade → {totalPremium} premium
            </p>
          </div>
        }
      >
        <ConversionSankey stages={funnelData} />
      </SectionCard>

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
              <Area type="monotone" dataKey="verktyg" name="Använde verktyg" fill="#f97316" stroke="#f97316" fillOpacity={0.12} strokeWidth={2} />
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

      {/* Kohortretention */}
      <SectionCard
        title="Kohortretention"
        subtitle="Andel av varje registreringsmånads användare som varit aktiva månad 0-5 efter registrering"
        padded={false}
      >
        {(() => {
          const kohorter = [...new Set(retention.map((r) => r.kohortmanad))]
            .sort((a, b) => (a < b ? 1 : -1))
            .slice(0, 6);
          if (kohorter.length === 0) {
            return <p className="px-5 pb-5 text-sm text-slate-400">Ingen retentiondata än.</p>;
          }
          const maxOffset = 5;
          const cell = (kohort: string, offset: number) => {
            const rad = retention.find((r) => r.kohortmanad === kohort && r.manad_offset === offset);
            const storlek = retention.find((r) => r.kohortmanad === kohort)?.kohortstorlek || 0;
            if (!rad || storlek === 0) return null;
            return Math.round((rad.aktiva / storlek) * 100);
          };
          return (
            <div className="overflow-x-auto px-5 pb-5">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase">
                    <th className="text-left py-2 pr-4 font-medium">Kohort</th>
                    <th className="text-right py-2 pr-4 font-medium">Storlek</th>
                    {Array.from({ length: maxOffset + 1 }, (_, i) => (
                      <th key={i} className="text-center py-2 px-2 font-medium">Mån {i}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {kohorter.map((kohort) => {
                    const storlek = retention.find((r) => r.kohortmanad === kohort)?.kohortstorlek || 0;
                    return (
                      <tr key={kohort} className="border-t border-slate-100">
                        <td className="py-2 pr-4 font-medium text-slate-900 whitespace-nowrap">
                          {format(new Date(kohort), 'MMM yyyy', { locale: sv })}
                        </td>
                        <td className="py-2 pr-4 text-right tabular-nums text-slate-500">{storlek}</td>
                        {Array.from({ length: maxOffset + 1 }, (_, offset) => {
                          const pct = cell(kohort, offset);
                          return (
                            <td key={offset} className="py-1.5 px-2 text-center">
                              {pct === null ? (
                                <span className="text-slate-300">–</span>
                              ) : (
                                <span
                                  className="inline-block min-w-[44px] rounded-md px-2 py-1 text-xs font-semibold tabular-nums"
                                  style={{
                                    backgroundColor: `rgba(249, 115, 22, ${Math.max(0.08, (pct / 100) * 0.85)})`,
                                    color: pct > 45 ? '#ffffff' : '#9a3412',
                                  }}
                                >
                                  {pct}%
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="mt-3 text-xs text-slate-400">
                Aktiv = minst en registrerad aktivitet den månaden. Mån 0 är registreringsmånaden.
              </p>
            </div>
          );
        })()}
      </SectionCard>
    </div>
  );
}
