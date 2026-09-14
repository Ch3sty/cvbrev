'use client';

/**
 * Rekryterarnas godkannandeflode.
 *
 * Enda klientkomponenten pa Innehall, och den ar det for att den har knappar
 * som skriver. Listan kommer fardig fran servern; komponenten hanterar bara
 * de tva anropen och det lokala tillstandet under tiden.
 *
 * Skrivningen gar mot POST /api/admin/recruiters med { userId, action }, samma
 * kontrakt som den gamla rutten hade. Den ligger bakom requireSuperAdmin och
 * satter status, approved_at och approved_by. Adminen bygger alltsa ingen ny
 * beslutsvag: det ar samma logik, ny yta.
 *
 * Efter ett lyckat beslut kors router.refresh(), sa att raden ritas om med
 * serverns sanning i stallet for en optimistisk gissning. En ansokan ar en
 * salla handelse och en extra rundtur kostar ingenting har.
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import EmptyState from '@/components/shell/EmptyState';
import FlowError from '@/components/shell/FlowError';
import { Chip, datum } from './Delar';
import type { RekryterareRad } from './data';

const STATUSTEXT: Record<RekryterareRad['status'], string> = {
  pending: 'Väntar',
  approved: 'Godkänd',
  rejected: 'Avslagen',
};

export default function RekryterareLista({ rader }: { rader: RekryterareRad[] }) {
  const router = useRouter();
  const [pagar, setPagar] = useState<string | null>(null);
  const [fel, setFel] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function besluta(userId: string, action: 'approve' | 'reject') {
    setFel(null);
    setPagar(userId);
    try {
      const svar = await fetch('/api/admin/recruiters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      if (!svar.ok) {
        const kropp = await svar.json().catch(() => ({}));
        throw new Error(kropp?.error ?? `Servern svarade ${svar.status}`);
      }
      startTransition(() => router.refresh());
    } catch (e) {
      setFel(e instanceof Error ? e.message : 'Beslutet kunde inte sparas.');
    } finally {
      setPagar(null);
    }
  }

  if (!rader.length) {
    return (
      <EmptyState
        bare
        title="Inga rekryterare har ansökt"
        description="Ansökningar från rekryterare hamnar här och väntar på godkännande."
      />
    );
  }

  return (
    <div>
      {fel ? (
        <div className="border-b border-kant p-4">
          <FlowError message={fel} onRetry={() => setFel(null)} retryLabel="Stäng" />
        </div>
      ) : null}

      <ul className="divide-y divide-kant">
        {rader.map((r) => {
          const laddar = pagar === r.userId;
          return (
            <li key={r.userId} className="px-4 py-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-kort text-ink-1">{r.foretag ?? 'Företag saknas'}</p>
                    <Chip
                      ton={
                        r.status === 'pending'
                          ? 'varning'
                          : r.status === 'approved'
                            ? 'positiv'
                            : 'neutral'
                      }
                    >
                      {STATUSTEXT[r.status]}
                    </Chip>
                  </div>

                  <p className="mt-1 text-meta text-ink-3">
                    {[r.kontaktnamn, r.kontaktroll].filter(Boolean).join(', ') || 'Kontakt saknas'}
                    {r.orgnummer ? ` · org.nr ${r.orgnummer}` : ''}
                  </p>
                  <p className="text-meta text-ink-3">
                    {r.kontaktEpost ?? r.epost ?? 'E-post saknas'}
                    {r.telefon ? ` · ${r.telefon}` : ''}
                  </p>
                  {r.roller ? (
                    <p className="mt-1 text-meta text-ink-2">Rekryterar: {r.roller}</p>
                  ) : null}
                  <p className="mt-1 text-meta text-ink-3">
                    Ansökte {datum(r.skapad)}
                    {r.beslutat ? ` · beslut ${datum(r.beslutat)}` : ''}
                  </p>
                </div>

                {r.status === 'pending' ? (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      disabled={laddar}
                      onClick={() => besluta(r.userId, 'approve')}
                      className="inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white hover:bg-ink-hover disabled:opacity-40"
                    >
                      {laddar ? 'Sparar' : 'Godkänn'}
                    </button>
                    <button
                      type="button"
                      disabled={laddar}
                      onClick={() => besluta(r.userId, 'reject')}
                      className="inline-flex h-11 items-center justify-center rounded-lg border border-fel-kant bg-panel px-4 text-sm font-medium text-fel hover:bg-insunken disabled:opacity-40"
                    >
                      Avslå
                    </button>
                  </div>
                ) : (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      disabled={laddar}
                      onClick={() => besluta(r.userId, r.status === 'approved' ? 'reject' : 'approve')}
                      className="inline-flex h-11 items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-medium text-ink-1 hover:bg-insunken disabled:opacity-40"
                    >
                      {r.status === 'approved' ? 'Dra tillbaka' : 'Godkänn ändå'}
                    </button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
