'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { Activity, RefreshCw, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { subDays } from 'date-fns';
import MetricCard from '@/components/admin/ui/MetricCard';
import SectionCard from '@/components/admin/ui/SectionCard';
import PeriodSelector, { type PeriodDays } from '@/components/admin/ui/PeriodSelector';
import ActivityByFunctionChart from '@/components/admin/charts/ActivityByFunctionChart';
import ActivityOverTimeChart, { type DailyPivotRow } from '@/components/admin/charts/ActivityOverTimeChart';
import { metaFor, FUNKTIONER } from './functionMeta';

interface TestStat {
  kategori: string;
  test_type: string;
  started: number;
  completed: number;
  unique_users: number;
  last_started: string | null;
}

interface FeedRow {
  user_id: string;
  email: string;
  full_name: string | null;
  funktion: string;
  detalj: string | null;
  slutford: boolean;
  tidpunkt: string | null;
}

interface FunctionStat {
  funktion: string;
  totalt: number;
  slutforda: number;
  unika_anv: number;
  senaste_7d: number;
}

interface DailyRow {
  dag: string;
  funktion: string;
  handelser: number;
}

interface PeriodRow {
  funktion: string;
  denna_period: number;
  forra_perioden: number;
}

function relativeTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'nyss';
  if (min < 60) return `${min} min sedan`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} tim sedan`;
  const dgr = Math.floor(h / 24);
  if (dgr < 30) return `${dgr} dgr sedan`;
  return d.toLocaleDateString('sv-SE');
}

export default function AdminActivityPage() {
  const [testStats, setTestStats] = useState<TestStat[]>([]);
  const [feed, setFeed] = useState<FeedRow[]>([]);
  const [funcStats, setFuncStats] = useState<FunctionStat[]>([]);
  const [daily, setDaily] = useState<DailyRow[]>([]);
  const [period, setPeriod] = useState<PeriodRow[]>([]);
  const [periodDays, setPeriodDays] = useState<PeriodDays>(30);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [funcFilter, setFuncFilter] = useState<string>('alla');

  const supabase = getSupabaseClient();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, feedRes, funcRes, dailyRes, periodRes] = await Promise.all([
        supabase.from('admin_test_stats').select('*').order('started', { ascending: false }),
        supabase
          .from('admin_activity_feed')
          .select('*')
          .order('tidpunkt', { ascending: false, nullsFirst: false })
          .limit(200),
        supabase.from('admin_activity_by_function').select('*').order('totalt', { ascending: false }),
        supabase.from('admin_activity_daily').select('*'),
        supabase.rpc('get_activity_period_comparison', { days: periodDays }),
      ]);
      if (statsRes.error) throw statsRes.error;
      if (feedRes.error) throw feedRes.error;
      if (funcRes.error) throw funcRes.error;
      if (dailyRes.error) throw dailyRes.error;
      if (periodRes.error) throw periodRes.error;
      setTestStats(statsRes.data || []);
      setFeed(feedRes.data || []);
      setFuncStats(funcRes.data || []);
      setDaily(dailyRes.data || []);
      setPeriod(periodRes.data || []);
    } catch (err) {
      console.error('Activity fetch error:', err);
      setError(err instanceof Error ? err.message : 'Kunde inte hämta aktivitetsdata');
    } finally {
      setIsLoading(false);
    }
  }, [supabase, periodDays]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const visibleFeed = funcFilter === 'alla' ? feed : feed.filter((r) => r.funktion === funcFilter);

  // Funktioner i volymordning (för KPI-kort + staplad area).
  const aktivaFunktioner = useMemo(() => funcStats.map((f) => f.funktion), [funcStats]);

  // Snabb uppslagning av period-jämförelse per funktion.
  const periodByFunc = useMemo(() => {
    const m = new Map<string, PeriodRow>();
    period.forEach((p) => m.set(p.funktion, p));
    return m;
  }, [period]);

  // Pivotera dagsdatan till valt fönster (periodDays), fyll i 0 för glapp.
  const dailyPivot = useMemo<DailyPivotRow[]>(() => {
    const cutoff = subDays(new Date(), periodDays);
    const inWindow = daily.filter((r) => new Date(r.dag) >= cutoff);
    if (inWindow.length === 0) return [];
    const byDay = new Map<string, DailyPivotRow>();
    for (const row of inWindow) {
      const key = String(row.dag);
      if (!byDay.has(key)) {
        const base: DailyPivotRow = { dag: key };
        aktivaFunktioner.forEach((f) => (base[f] = 0));
        byDay.set(key, base);
      }
      byDay.get(key)![row.funktion] = row.handelser;
    }
    return Array.from(byDay.values()).sort((a, b) => String(a.dag).localeCompare(String(b.dag)));
  }, [daily, aktivaFunktioner, periodDays]);

  // Total aktivitet i perioden (för rubrik-sammanfattning).
  const periodTotal = useMemo(() => period.reduce((s, p) => s + p.denna_period, 0), [period]);
  const periodPrev = useMemo(() => period.reduce((s, p) => s + p.forra_perioden, 0), [period]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Aktivitetsflöde</h1>
            <p className="text-sm text-slate-500">Vad användarna faktiskt gör — tester, coach, brev och mer</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <PeriodSelector value={periodDays} onChange={setPeriodDays} />
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
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* KPI-kort per funktion (period + delta mot föregående period) */}
      <section className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {funcStats.map((f) => {
            const meta = metaFor(f.funktion);
            const p = periodByFunc.get(f.funktion);
            return (
              <MetricCard
                key={f.funktion}
                title={f.funktion}
                value={p ? p.denna_period : 0}
                icon={meta.icon}
                iconClass={meta.color}
                subtitle={`${f.unika_anv} unika`}
                current={p?.denna_period ?? 0}
                previous={p?.forra_perioden ?? 0}
              />
            );
          })}
        </div>
      </section>

      {/* Grafer */}
      <section className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Användning per funktion" subtitle="Totalt antal händelser, alla tider">
          <ActivityByFunctionChart data={funcStats} isLoading={isLoading} />
        </SectionCard>
        <SectionCard
          title="Aktivitet över tid"
          subtitle={`Händelser per dag · ${periodTotal} i perioden${
            periodPrev > 0 ? ` (${periodPrev} föregående)` : ''
          }`}
        >
          <ActivityOverTimeChart data={dailyPivot} funktioner={aktivaFunktioner} isLoading={isLoading} />
        </SectionCard>
      </section>

      {/* Tester per typ — pedagogiskt rutnät med completion-mätare */}
      <section className="mb-8">
        <SectionCard
          title="Tester per typ"
          subtitle="Slutförandegrad visar var användare hoppar av — lågt (amber) är värt att titta på"
        >
          {testStats.length === 0 && !isLoading ? (
            <div className="py-8 text-center text-sm text-slate-400">Ingen testdata</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {testStats.map((t) => {
                const pct = t.started > 0 ? Math.round((100 * t.completed) / t.started) : 0;
                const low = pct < 50;
                return (
                  <div
                    key={`${t.kategori}-${t.test_type}`}
                    className="rounded-lg border border-slate-200/70 p-4 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium text-slate-900 truncate">{t.test_type}</span>
                        <span
                          className={`flex-shrink-0 inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            t.kategori === 'logik' ? 'bg-indigo-50 text-indigo-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {t.kategori}
                        </span>
                      </div>
                      <span className={`text-sm font-bold tabular-nums ${low ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {pct}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full ${low ? 'bg-amber-400' : 'bg-emerald-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 tabular-nums">
                      <span>{t.started} påbörjade</span>
                      <span className="text-slate-300">·</span>
                      <span>{t.completed} avslutade</span>
                      <span className="text-slate-300">·</span>
                      <span>{t.unique_users} unika</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </section>

      {/* Senaste aktivitet (flöde) */}
      <section>
        <SectionCard
          title="Senaste aktivitet"
          subtitle="Senaste 200 händelserna tvärs över alla funktioner"
          padded={false}
          action={
            <div className="flex items-center gap-1.5 flex-wrap justify-end max-w-md">
              <button
                onClick={() => setFuncFilter('alla')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  funcFilter === 'alla' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Alla
              </button>
              {FUNKTIONER.map((f) => (
                <button
                  key={f}
                  onClick={() => setFuncFilter(f)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    funcFilter === f ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          }
        >
          <div className="divide-y divide-slate-100 border-t border-slate-100">
            {visibleFeed.length === 0 && !isLoading && (
              <div className="px-5 py-8 text-center text-sm text-slate-400">Ingen aktivitet att visa</div>
            )}
            {visibleFeed.map((r, i) => {
              const meta = metaFor(r.funktion);
              return (
                <div
                  key={`${r.user_id}-${r.funktion}-${r.tidpunkt}-${i}`}
                  className="flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50/60"
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${meta.color}`}>
                    {meta.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-900">{r.funktion}</span>
                      {r.detalj && <span className="text-sm text-slate-500 truncate">· {r.detalj}</span>}
                      {r.slutford ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                          <XCircle className="w-3 h-3" /> ej slutförd
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 truncate">{r.full_name || r.email}</div>
                  </div>
                  <div className="flex-shrink-0 text-xs text-slate-400 tabular-nums whitespace-nowrap">
                    {relativeTime(r.tidpunkt)}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
