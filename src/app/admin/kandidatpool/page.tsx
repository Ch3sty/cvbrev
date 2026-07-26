'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { Radar, Users, Handshake, MapPin, AlertCircle } from 'lucide-react';

/**
 * Adminvy över kandidatpoolen (Bli upptäckt): KPI:er, intresseflödet och
 * en tabell över profilerna. Läser admin_candidate_pool och
 * admin_candidate_interests (vyer med is_admin-vakt).
 */

interface PoolRad {
  user_id: string;
  email: string;
  full_name: string | null;
  visibility: string;
  show_personality: boolean;
  show_full_workstyle: boolean;
  availability: string | null;
  regions: string[] | null;
  extent: string[] | null;
  employment_types: string[] | null;
  salary_min: number | null;
  salary_max: number | null;
  consent_given_at: string | null;
  created_at: string;
  updated_at: string | null;
  intressen_totalt: number;
  intressen_accepterade: number;
  intressen_avbojda: number;
  intressen_vantande: number;
}

interface IntresseRad {
  id: string;
  created_at: string;
  responded_at: string | null;
  status: string;
  rekryterare_foretag: string | null;
  rekryterare_namn: string | null;
  kandidat_epost: string | null;
  kandidat_lage: string | null;
}

const fmtDatum = (d: string) =>
  new Date(d).toLocaleDateString('sv-SE', { year: 'numeric', month: 'short', day: 'numeric' });

function LageBadge({ lage }: { lage: string | null }) {
  if (lage === 'open') {
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">Öppen</span>;
  }
  if (lage === 'anonymous') {
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Anonym</span>;
  }
  return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">Av</span>;
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'accepted') {
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">Accepterat</span>;
  }
  if (status === 'declined') {
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Avböjt</span>;
  }
  return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Väntar</span>;
}

function KpiKort({ rubrik, varde, detalj }: { rubrik: string; varde: string; detalj?: string }) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{rubrik}</div>
      <div className="text-2xl font-bold text-gray-900">{varde}</div>
      {detalj && <div className="text-xs text-gray-500 mt-1">{detalj}</div>}
    </div>
  );
}

export default function AdminKandidatpoolPage() {
  const [profiler, setProfiler] = useState<PoolRad[]>([]);
  const [intressen, setIntressen] = useState<IntresseRad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  useEffect(() => {
    async function hamta() {
      setIsLoading(true);
      setError(null);
      try {
        const { data: poolData, error: poolError } = await supabase
          .from('admin_candidate_pool')
          .select('*')
          .order('updated_at', { ascending: false });
        if (poolError) throw poolError;
        setProfiler(poolData || []);

        const { data: intresseData, error: intresseError } = await supabase
          .from('admin_candidate_interests')
          .select('id, created_at, responded_at, status, rekryterare_foretag, rekryterare_namn, kandidat_epost, kandidat_lage')
          .order('created_at', { ascending: false })
          .limit(100);
        if (intresseError) throw intresseError;
        setIntressen(intresseData || []);
      } catch (err: unknown) {
        console.error('Fel vid hämtning av kandidatpoolen:', err);
        setError(err instanceof Error ? err.message : 'Ett fel uppstod vid hämtning');
      } finally {
        setIsLoading(false);
      }
    }
    hamta();
  }, [supabase]);

  const stats = useMemo(() => {
    const aktiva = profiler.filter((p) => p.visibility === 'anonymous' || p.visibility === 'open');
    const nu = Date.now();
    const dag = 24 * 3600 * 1000;
    const nya7 = profiler.filter((p) => nu - new Date(p.created_at).getTime() <= 7 * dag).length;
    const nya30 = profiler.filter((p) => nu - new Date(p.created_at).getTime() <= 30 * dag).length;

    const skickade = intressen.length;
    const accepterade = intressen.filter((i) => i.status === 'accepted').length;
    const avbojda = intressen.filter((i) => i.status === 'declined').length;
    const vantande = intressen.filter((i) => i.status === 'pending').length;

    const svarstider = intressen
      .filter((i) => i.responded_at)
      .map((i) => new Date(i.responded_at as string).getTime() - new Date(i.created_at).getTime())
      .sort((a, b) => a - b);
    const medianSvarstid =
      svarstider.length > 0 ? svarstider[Math.floor(svarstider.length / 2)] / dag : null;

    const perLan = new Map<string, number>();
    const perTyp = new Map<string, number>();
    for (const p of aktiva) {
      for (const lan of p.regions || []) perLan.set(lan, (perLan.get(lan) || 0) + 1);
      for (const typ of p.employment_types || []) perTyp.set(typ, (perTyp.get(typ) || 0) + 1);
    }

    return {
      aktiva: aktiva.length,
      anonyma: aktiva.filter((p) => p.visibility === 'anonymous').length,
      oppna: aktiva.filter((p) => p.visibility === 'open').length,
      avstangda: profiler.filter((p) => p.visibility === 'off').length,
      medPersonlighet: aktiva.filter((p) => p.show_personality).length,
      medArbetsstil: aktiva.filter((p) => p.show_full_workstyle).length,
      nya7,
      nya30,
      skickade,
      accepterade,
      avbojda,
      vantande,
      medianSvarstid,
      perLan: [...perLan.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8),
      perTyp: [...perTyp.entries()].sort((a, b) => b[1] - a[1]),
    };
  }, [profiler, intressen]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Radar className="w-6 h-6 text-indigo-500" />
          Kandidatpoolen (Bli upptäckt)
        </h1>
        <p className="text-gray-600 mt-1">
          Utbudssidan av marknadsplatsen: vilka som gjort sig synliga, deras villkor
          och hur intresseflödet mot rekryterarna rör sig.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r flex items-start gap-2" role="alert">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* KPI:er */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiKort
          rubrik="Aktiva i poolen"
          varde={String(stats.aktiva)}
          detalj={`${stats.anonyma} anonyma · ${stats.oppna} öppna · ${stats.avstangda} avstängda`}
        />
        <KpiKort
          rubrik="Extrasamtycken"
          varde={stats.aktiva > 0 ? `${Math.round((stats.medPersonlighet / stats.aktiva) * 100)} %` : '0 %'}
          detalj={`${stats.medPersonlighet} personlighet · ${stats.medArbetsstil} arbetsstil`}
        />
        <KpiKort rubrik="Nya profiler" varde={String(stats.nya30)} detalj={`${stats.nya7} senaste veckan · 30 dagar`} />
        <KpiKort
          rubrik="Intressen"
          varde={String(stats.skickade)}
          detalj={`${stats.accepterade} accepterade · ${stats.vantande} väntar · ${stats.avbojda} avböjda${
            stats.medianSvarstid !== null ? ` · svarstid ~${stats.medianSvarstid.toFixed(1)} dgr` : ''
          }`}
        />
      </div>

      {/* Profiltabell */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Profiler ({profiler.length})</h2>
        </div>
        {profiler.length === 0 ? (
          <p className="px-6 py-10 text-center text-gray-500">Inga kandidatprofiler än.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Kandidat</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Läge</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Samtycken</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Län</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Tillträde</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Lönespann</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Intressen</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Uppdaterad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {profiler.map((p) => (
                  <tr key={p.user_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link href={`/admin/users/${p.user_id}`} className="text-pink-600 hover:text-pink-700 font-medium">
                        {p.full_name || p.email}
                      </Link>
                      {p.full_name && <div className="text-xs text-gray-500">{p.email}</div>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap"><LageBadge lage={p.visibility} /></td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                      {p.show_personality ? 'Personlighet' : ''}
                      {p.show_personality && p.show_full_workstyle ? ' + ' : ''}
                      {p.show_full_workstyle ? 'Arbetsstil' : ''}
                      {!p.show_personality && !p.show_full_workstyle ? <span className="text-gray-400">Inga</span> : ''}
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-[220px] truncate">
                      {p.regions && p.regions.length > 0 ? p.regions.join(', ') : <span className="text-gray-400">Alla</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">{p.availability || <span className="text-gray-400">–</span>}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                      {p.salary_min && p.salary_max
                        ? `${p.salary_min.toLocaleString('sv-SE')} till ${p.salary_max.toLocaleString('sv-SE')} kr`
                        : <span className="text-gray-400">–</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span className={p.intressen_totalt > 0 ? 'font-medium text-gray-900' : 'text-gray-400'}>
                        {p.intressen_totalt}
                      </span>
                      {p.intressen_vantande > 0 && (
                        <span className="ml-1 text-xs text-amber-600">({p.intressen_vantande} väntar)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                      {p.updated_at ? fmtDatum(p.updated_at) : '–'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Intresseflödet */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <Handshake className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Intresseflödet (senaste 100)</h2>
        </div>
        {intressen.length === 0 ? (
          <p className="px-6 py-10 text-center text-gray-500">Inga intressen skickade än.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Rekryterare</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Kandidat</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Skickat</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Besvarat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {intressen.map((i) => (
                  <tr key={i.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-900">
                      {i.rekryterare_foretag || 'Okänt företag'}
                      {i.rekryterare_namn && <div className="text-xs text-gray-500">{i.rekryterare_namn}</div>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                      {i.kandidat_epost || '–'} <LageBadge lage={i.kandidat_lage} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={i.status} /></td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{fmtDatum(i.created_at)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                      {i.responded_at ? fmtDatum(i.responded_at) : '–'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Utbudsprofil */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-500" />
            Aktiva profiler per län
          </h2>
          {stats.perLan.length === 0 ? (
            <p className="text-gray-500 text-sm">Inga län angivna än.</p>
          ) : (
            <ul className="space-y-2">
              {stats.perLan.map(([lan, antal]) => (
                <li key={lan} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 text-sm text-gray-700 truncate">{lan}</span>
                  <div className="flex-1 h-2 rounded bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-indigo-400"
                      style={{ width: `${(antal / Math.max(1, stats.aktiva)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-6 text-right">{antal}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Efterfrågad anställningsform</h2>
          {stats.perTyp.length === 0 ? (
            <p className="text-gray-500 text-sm">Inga anställningsformer angivna än.</p>
          ) : (
            <ul className="space-y-2">
              {stats.perTyp.map(([typ, antal]) => (
                <li key={typ} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 text-sm text-gray-700 truncate">{typ}</span>
                  <div className="flex-1 h-2 rounded bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-pink-400"
                      style={{ width: `${(antal / Math.max(1, stats.aktiva)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-6 text-right">{antal}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
