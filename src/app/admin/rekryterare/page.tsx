'use client';

import { useCallback, useEffect, useState } from 'react';
import { Briefcase, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import StatsCard from '@/components/admin/StatsCard';

interface Recruiter {
  userId: string;
  companyName: string | null;
  orgNumber: string | null;
  contactName: string | null;
  contactRole: string | null;
  recruitingRoles: string | null;
  email: string | null;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt: string | null;
  createdAt: string;
}

interface RecruitersResponse {
  recruiters: Recruiter[];
  counts: { pending: number; approved: number; rejected: number };
}

function StatusBadge({ status }: { status: Recruiter['status'] }) {
  if (status === 'approved') {
    return (
      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
        Godkänd
      </span>
    );
  }
  if (status === 'rejected') {
    return (
      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700">
        Avslagen
      </span>
    );
  }
  return (
    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700">
      Väntar
    </span>
  );
}

export default function AdminRecruitersPage() {
  const [data, setData] = useState<RecruitersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingOn, setActingOn] = useState<string | null>(null);

  const fetchRecruiters = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch('/api/admin/recruiters');
      if (!res.ok) {
        throw new Error(`Kunde inte hämta rekryterarna (${res.status})`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error('Error fetching recruiters:', err);
      setError(err.message || 'Ett fel uppstod vid hämtning av data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecruiters();
  }, [fetchRecruiters]);

  const handleAction = async (userId: string, action: 'approve' | 'reject') => {
    setActingOn(userId);
    setError(null);
    try {
      const res = await fetch('/api/admin/recruiters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || `Åtgärden misslyckades (${res.status})`);
      }
      await fetchRecruiters();
    } catch (err: any) {
      console.error('Error updating recruiter:', err);
      setError(err.message || 'Ett fel uppstod');
    } finally {
      setActingOn(null);
    }
  };

  if (error && !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-red-900 mb-2">Ett fel uppstod</h2>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rekryterare</h1>
        <p className="text-gray-600 mt-1">
          Ansökningar om rekryterarkonto, verifiera org-nummer innan godkännande
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Väntande"
          value={data?.counts.pending ?? 0}
          icon={<Clock className="w-6 h-6" />}
          subtitle="Behöver granskas"
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
        />
        <StatsCard
          title="Godkända"
          value={data?.counts.approved ?? 0}
          icon={<CheckCircle2 className="w-6 h-6" />}
          subtitle="Har tillgång till portalen"
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-600"
        />
        <StatsCard
          title="Avslagna"
          value={data?.counts.rejected ?? 0}
          icon={<XCircle className="w-6 h-6" />}
          subtitle="Nekad åtkomst"
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
        />
      </div>

      {/* Fel vid åtgärd */}
      {error && data && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Ansökningar */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ansökningar</h3>
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-gray-100 rounded"></div>
            <div className="h-8 bg-gray-100 rounded"></div>
            <div className="h-8 bg-gray-100 rounded"></div>
          </div>
        ) : (data?.recruiters.length ?? 0) === 0 ? (
          <div className="py-8 text-center">
            <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Inga ansökningar ännu</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-600">
                  <th className="py-2 pr-4 font-medium">Företag</th>
                  <th className="py-2 pr-4 font-medium">Org.nummer</th>
                  <th className="py-2 pr-4 font-medium">Kontaktperson</th>
                  <th className="py-2 pr-4 font-medium">Rekryterar för</th>
                  <th className="py-2 pr-4 font-medium">Ansökt</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 font-medium text-right">Åtgärd</th>
                </tr>
              </thead>
              <tbody>
                {data?.recruiters.map((r) => {
                  const busy = actingOn === r.userId;
                  return (
                    <tr key={r.userId} className="border-b border-gray-100 last:border-0">
                      <td className="py-2.5 pr-4 text-gray-900 font-medium">
                        {r.companyName || '–'}
                      </td>
                      <td className="py-2.5 pr-4 text-gray-700 whitespace-nowrap">
                        {r.orgNumber || '–'}
                      </td>
                      <td className="py-2.5 pr-4 text-gray-700">
                        <div>
                          {r.contactName || '–'}
                          {r.contactRole && (
                            <span className="text-gray-500"> · {r.contactRole}</span>
                          )}
                        </div>
                        {r.email && <div className="text-xs text-gray-500">{r.email}</div>}
                      </td>
                      <td className="py-2.5 pr-4 text-gray-700 max-w-[220px]">
                        {r.recruitingRoles || '–'}
                      </td>
                      <td className="py-2.5 pr-4 text-gray-700 whitespace-nowrap">
                        {format(new Date(r.createdAt), 'd MMM yyyy', { locale: sv })}
                      </td>
                      <td className="py-2.5 pr-4">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="py-2.5 text-right whitespace-nowrap">
                        {r.status === 'pending' && (
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleAction(r.userId, 'approve')}
                              disabled={busy}
                              className="px-3 py-1.5 rounded-lg bg-pink-600 text-white text-xs font-medium hover:bg-pink-700 transition-colors disabled:opacity-50"
                            >
                              Godkänn
                            </button>
                            <button
                              onClick={() => handleAction(r.userId, 'reject')}
                              disabled={busy}
                              className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                              Avslå
                            </button>
                          </div>
                        )}
                        {r.status === 'approved' && (
                          <button
                            onClick={() => handleAction(r.userId, 'reject')}
                            disabled={busy}
                            className="px-3 py-1.5 rounded-lg border border-red-200 bg-white text-red-600 text-xs font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            Avslå
                          </button>
                        )}
                        {r.status === 'rejected' && (
                          <button
                            onClick={() => handleAction(r.userId, 'approve')}
                            disabled={busy}
                            className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                          >
                            Godkänn
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
