'use client';

// Backfill-erbjudande: sparade brev som ännu inte är loggade som ansökningar,
// med import i ett klick. Avfärdas i 30 dagar via localStorage.
//
// Kandidaterna hämtas inte längre här. Sidans server component har redan
// listan och skickar in den som prop, så bannern kostar noll rundturer vid
// sidladdning. Importen sker fortfarande mot samma API-route, med samma
// behörighetskontroll.

import { useEffect, useState } from 'react';
import { FileText, X } from 'lucide-react';

/**
 * Snooze i 30 dagar, aldrig för alltid (planens avsnitt 5). Den som avfärdar
 * idag kan ha femton nya brev om en månad, och då är erbjudandet relevant
 * igen. Nyckeln lagrar ett datum, inte en flagga: den gamla "1"-flaggan tolkas
 * som utgången så tidigare avfärdade konton får erbjudandet en gång till.
 */
const DISMISS_KEY = 'sokta_tjanster_backfill_snoozed_until';
const SNOOZE_DAYS = 30;

function isSnoozed(): boolean {
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const until = new Date(raw).getTime();
  if (Number.isNaN(until)) return false;
  return until > Date.now();
}

function snooze(): void {
  const until = new Date(Date.now() + SNOOZE_DAYS * 86400000);
  localStorage.setItem(DISMISS_KEY, until.toISOString());
}

export interface BackfillCandidate {
  id: string;
  title: string | null;
  company: string | null;
  job_title: string | null;
  created_at: string | null;
}

interface BackfillBannerProps {
  /** Sparade brev utan kopplad ansökan, hämtade på servern. */
  candidates: BackfillCandidate[];
  onImported: (count: number) => void;
  /**
   * I tomt tillstånd är importen sidans primära handling och ska aldrig gå
   * att snooza bort: den är hela vägen in i produkten. Då renderar vi bara
   * knappen och låter EmptyState bära rubrik och illustration.
   */
  variant?: 'banner' | 'inline';
}

export default function BackfillBanner({
  candidates,
  onImported,
  variant = 'banner',
}: BackfillBannerProps) {
  // Snoozen läses först efter montering. localStorage finns inte på servern,
  // och att läsa den under render hade gett olika markup på server och klient.
  const [dismissed, setDismissed] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    // Inline-varianten är en primär handling och respekterar ingen snooze.
    if (variant === 'banner' && isSnoozed()) return;
    setDismissed(false);
  }, [variant]);

  const handleDismiss = () => {
    snooze();
    setDismissed(true);
  };

  const handleImport = async () => {
    if (candidates.length === 0 || isImporting) return;
    setIsImporting(true);
    try {
      const res = await fetch('/api/applications/backfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letterIds: candidates.map((c) => c.id) }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        snooze();
        setDismissed(true);
        onImported(json.created as number);
      }
    } catch (error) {
      console.error('Backfill misslyckades:', error);
    } finally {
      setIsImporting(false);
    }
  };

  if (candidates.length === 0) return null;
  if (variant === 'banner' && dismissed) return null;

  const label =
    candidates.length === 1
      ? 'Lägg in brevet som ansökan'
      : `Lägg in ${candidates.length} brev som ansökningar`;

  // Primär handling i tomt tillstånd: bara knappen, ingen ram, ingen snooze.
  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={handleImport}
        disabled={isImporting}
        className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover disabled:opacity-40 sm:w-auto"
      >
        {isImporting ? 'Lägger in' : label}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-kant bg-panel p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="shrink-0 text-ink-2" aria-hidden="true">
          <FileText className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <p className="text-kort text-ink-1">
            {candidates.length === 1
              ? 'Ett av dina brev är inte loggat som ansökan'
              : `${candidates.length} av dina brev är inte loggade som ansökningar`}
          </p>
          <p className="mt-0.5 text-sm text-ink-2">
            Lägg in dem så är din historik komplett från start.
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <button
          type="button"
          onClick={handleImport}
          disabled={isImporting}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover disabled:opacity-40"
        >
          {isImporting ? 'Lägger in' : 'Lägg in alla'}
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dölj i 30 dagar"
          className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-insunken hover:text-ink-1"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
