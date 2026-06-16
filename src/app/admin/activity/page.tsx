'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import {
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter as FilterIcon,
} from 'lucide-react';
import StatsCard from '@/components/admin/StatsCard';
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [funcFilter, setFuncFilter] = useState<string>('alla');

  const supabase = getSupabaseClient();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, feedRes, funcRes, dailyRes] = await Promise.all([
        supabase.from('admin_test_stats').select('*').order('started', { ascending: false }),
        supabase
          .from('admin_activity_feed')
          .select('*')
          .order('tidpunkt', { ascending: false, nullsFirst: false })
          .limit(200),
        supabase.from('admin_activity_by_function').select('*').order('totalt', { ascending: false }),
        supabase.from('admin_activity_daily').select('*'),
      ]);
      if (statsRes.error) throw statsRes.error;
      if (feedRes.error) throw feedRes.error;
      if (funcRes.error) throw funcRes.error;
      if (dailyRes.error) throw dailyRes.error;
      setTestStats(statsRes.data || []);
      setFeed(feedRes.data || []);
      setFuncStats(funcRes.data || []);
      setDaily(dailyRes.data || []);
    } catch (err) {
      console.error('Activity fetch error:', err);
      setError(err instanceof Error ? err.message : 'Kunde inte hämta aktivitetsdata');
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const visibleFeed = funcFilter === 'alla' ? feed : feed.filter((r) => r.funktion === funcFilter);

  // Funktioner som faktiskt har data, störst först (för staplad area + KPI-ordning).
  const aktivaFunktioner = useMemo(
    () => funcStats.map((f) => f.funktion),
    [funcStats]
  );

  // Pivotera dagsdatan: en rad/dag med en nyckel per funktion. Fyll i 0 för
  // dagar/funktioner som saknas så area-grafen inte hoppar.
  const dailyPivot = useMemo<DailyPivotRow[]>(() => {
    if (daily.length === 0) return [];
    const byDay = new Map<string, DailyPivotRow>();
    for (const row of daily) {
      const key = String(row.dag);
      if (!byDay.has(key)) {
        const base: DailyPivotRow = { dag: key };
        aktivaFunktioner.forEach((f) => (base[f] = 0));
        byDay.set(key, base);
      }
      byDay.get(key)![row.funktion] = row.handelser;
    }
    return Array.from(byDay.values()).sort((a, b) => String(a.dag).localeCompare(String(b.dag)));
  }, [daily, aktivaFunktioner]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Aktivitetsflöde</h1>
            <p className="text-sm text-gray-500">Vad användarna faktiskt gör — tester, coach, brev och mer</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Uppdatera
        </button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* KPI-kort per funktion */}
      <section className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {funcStats.map((f) => {
            const meta = metaFor(f.funktion);
            return (
              <StatsCard
                key={f.funktion}
                title={f.funktion}
                value={f.totalt}
                icon={meta.icon}
                subtitle={`${f.unika_anv} unika · ${f.senaste_7d} senaste 7 dgr`}
                iconBgColor={meta.iconBg}
                iconColor={meta.iconColor}
              />
            );
          })}
        </div>
      </section>

      {/* Grafer: funktionsfördelning + aktivitet över tid */}
      <section className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityByFunctionChart data={funcStats} isLoading={isLoading} />
        <ActivityOverTimeChart data={dailyPivot} funktioner={aktivaFunktioner} isLoading={isLoading} />
      </section>

      {/* Testtyp-statistik: påbörjade vs avslutade */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Tester per typ</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Test</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Kategori</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Påbörjade</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Avslutade</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider w-48">Slutförandegrad</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Unika</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {testStats.length === 0 && !isLoading && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">Ingen testdata</td></tr>
              )}
              {testStats.map((t) => {
                const pct = t.started > 0 ? Math.round((100 * t.completed) / t.started) : 0;
                const low = pct < 50;
                return (
                  <tr key={`${t.kategori}-${t.test_type}`} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">{t.test_type}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${t.kategori === 'logik' ? 'bg-indigo-50 text-indigo-700' : 'bg-rose-50 text-rose-700'}`}>
                        {t.kategori}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-right tabular-nums text-gray-700">{t.started}</td>
                    <td className="px-5 py-3 text-sm text-right tabular-nums text-gray-700">{t.completed}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${low ? 'bg-amber-400' : 'bg-emerald-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold tabular-nums ${low ? 'text-amber-600' : 'text-emerald-600'}`}>{pct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-right tabular-nums text-gray-700">{t.unique_users}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Låg slutförandegrad (gul) visar var användare hoppar av — värt att titta på testets längd/svårighet.
        </p>
      </section>

      {/* Aktivitetsflöde */}
      <section>
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <h2 className="text-lg font-semibold text-gray-900">Senaste aktivitet</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <FilterIcon className="w-4 h-4 text-gray-400" />
            <button
              onClick={() => setFuncFilter('alla')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${funcFilter === 'alla' ? 'bg-pink-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              Alla
            </button>
            {FUNKTIONER.map((f) => (
              <button
                key={f}
                onClick={() => setFuncFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${funcFilter === f ? 'bg-pink-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {visibleFeed.length === 0 && !isLoading && (
            <div className="px-5 py-8 text-center text-sm text-gray-400">Ingen aktivitet att visa</div>
          )}
          {visibleFeed.map((r, i) => {
            const meta = metaFor(r.funktion);
            return (
              <div key={`${r.user_id}-${r.funktion}-${r.tidpunkt}-${i}`} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50">
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${meta.color}`}>
                  {meta.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-900">{r.funktion}</span>
                    {r.detalj && <span className="text-sm text-gray-500 truncate">· {r.detalj}</span>}
                    {!r.slutford && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                        <XCircle className="w-3 h-3" /> ej slutförd
                      </span>
                    )}
                    {r.slutford && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{r.full_name || r.email}</div>
                </div>
                <div className="flex-shrink-0 text-xs text-gray-400 tabular-nums whitespace-nowrap">
                  {relativeTime(r.tidpunkt)}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-gray-500">Senaste 200 händelserna tvärs över alla funktioner.</p>
      </section>
    </div>
  );
}
