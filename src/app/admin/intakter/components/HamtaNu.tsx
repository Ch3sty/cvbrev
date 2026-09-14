'use client';

/**
 * Knappen "Hamta nu" i toppraden.
 *
 * Tvingar on-demand-pafyllning av dagens rad i admin_daily_metrics. Sparren
 * ar 15 minuter och sitter i fyllPaDag() pa servern, inte har: en knapp som
 * sjalv hindrar sig kan alltid kringgas genom att ladda om sidan.
 *
 * Sekundarknapp enligt designsystemet avsnitt 6. Ingen spinner: busy-laget ar
 * en textbyte till "Hamtar", vilket ar den enda rorelse designsystemet
 * tillater i en knapp utan att ge den en snurra.
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

const SEKUNDAR =
  'inline-flex h-11 items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-medium text-ink-1 transition-colors hover:bg-insunken disabled:opacity-40';

export default function HamtaNu() {
  const router = useRouter();
  const [hamtar, setHamtar] = useState(false);
  const [besked, setBesked] = useState<string | null>(null);
  const [overgang, startaOvergang] = useTransition();

  const upptagen = hamtar || overgang;

  async function hamta() {
    setHamtar(true);
    setBesked(null);
    try {
      const svar = await fetch('/api/admin/intakter/refresh', { method: 'POST' });
      const data = await svar.json();
      if (!svar.ok || !data.ok) {
        setBesked(data?.error ?? 'Kunde inte hämta');
      } else if (data.kordes === false) {
        setBesked(data.anledning ?? 'Spärrad');
      } else {
        setBesked('Hämtad');
        startaOvergang(() => router.refresh());
      }
    } catch {
      setBesked('Kunde inte nå servern');
    } finally {
      setHamtar(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {besked ? (
        <span className="text-meta text-ink-3" role="status">
          {besked}
        </span>
      ) : null}
      <button type="button" onClick={hamta} disabled={upptagen} className={SEKUNDAR}>
        {upptagen ? 'Hämtar' : 'Hämta nu'}
      </button>
    </div>
  );
}
