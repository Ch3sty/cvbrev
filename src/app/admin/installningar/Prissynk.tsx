'use client';

/**
 * Prissynken mot /api/admin/pricing/sync.
 *
 * Rutten behalls fran gamla adminen och ligger bakom requireSuperAdmin.
 * GET ger status (senaste synk, antal modeller per kalla), POST kor synken.
 *
 * Statusen hamtas efter forsta malningen, aldrig i serverrenderingen: rutten
 * gar mot model_pricing och behover inte sta i vagen for sidans LCP. Ytan ar
 * reserverad, sa raden byter innehall utan att flytta nagot under sig.
 */

import { useCallback, useEffect, useState } from 'react';

interface Status {
  lastSyncedAt: string | null;
  lastSyncedModel: string | null;
  modelCounts: { litellm: number; manual: number; total: number };
  syncSource: string;
}

export default function Prissynk() {
  const [status, setStatus] = useState<Status | null>(null);
  const [kor, setKor] = useState(false);
  const [fel, setFel] = useState<string | null>(null);
  const [utfall, setUtfall] = useState<string | null>(null);

  const las = useCallback(async () => {
    try {
      const svar = await fetch('/api/admin/pricing/sync');
      const kropp = await svar.json();
      if (!svar.ok) throw new Error(kropp?.error ?? `Servern svarade ${svar.status}`);
      setStatus(kropp.data as Status);
    } catch (e) {
      setFel(e instanceof Error ? e.message : 'Status kunde inte läsas.');
    }
  }, []);

  useEffect(() => {
    void las();
  }, [las]);

  async function synka() {
    setKor(true);
    setFel(null);
    setUtfall(null);
    try {
      const svar = await fetch('/api/admin/pricing/sync', { method: 'POST' });
      const kropp = await svar.json();
      if (!svar.ok) throw new Error(kropp?.error ?? `Servern svarade ${svar.status}`);
      setUtfall(kropp.message ?? 'Synken kördes.');
      await las();
    } catch (e) {
      setFel(e instanceof Error ? e.message : 'Synken misslyckades.');
    } finally {
      setKor(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm tabular-nums text-ink-1">
          {status
            ? `${status.modelCounts.total} modeller, varav ${status.modelCounts.litellm} från LiteLLM`
            : 'Läser status'}
        </p>
        <p className="text-meta text-ink-3">
          {status?.lastSyncedAt
            ? `Senast synkad ${new Date(status.lastSyncedAt).toLocaleString('sv-SE')}`
            : 'Ingen synk registrerad'}
        </p>
        {utfall ? <p className="mt-1 text-meta text-positiv">{utfall}</p> : null}
        {fel ? <p className="mt-1 text-meta text-fel">{fel}</p> : null}
      </div>

      <button
        type="button"
        onClick={synka}
        disabled={kor}
        className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-medium text-ink-1 hover:bg-insunken disabled:opacity-40"
      >
        {kor ? 'Synkar' : 'Synka nu'}
      </button>
    </div>
  );
}
