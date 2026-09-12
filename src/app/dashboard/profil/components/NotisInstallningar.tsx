'use client';

/**
 * Notisinställningar i profilen (docs/plan-inloggat-omdesign.md, avsnitt 8).
 *
 * Veckosammanfattningen är det enda mail vi skickar som inte handlar om
 * pengar, och den ska gå att stänga av utan att man tappar mailen om sitt
 * konto. Därför en egen rad här och en egen avregistreringslänk i mailet, i
 * stället för den globala avregistreringen som stänger allt.
 *
 * Designsystemet: kort med border och ingen skugga, rounded-xl, font-semibold
 * som tyngst, ingen fylld orange yta (växeln är den enda accenten och den är
 * en kontroll, inte en uppmaning).
 */

import { useEffect, useState } from 'react';

export default function NotisInstallningar() {
  // null = inte läst än. Vi renderar inte växeln förrän vi vet läget, annars
  // hoppar den från på till av framför ögonen på användaren.
  const [optOut, setOptOut] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/email/digest-preference')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setOptOut(data.optOut === true);
      })
      .catch(() => {
        // Inställningen är inte kritisk. Utan svar visar vi ingen växel alls
        // hellre än en växel som ljuger om sitt läge.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = async () => {
    if (optOut === null || saving) return;
    const next = !optOut;

    // Optimistiskt: växeln ska kännas direkt. Vid fel backar vi och säger till.
    setOptOut(next);
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/email/digest-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optOut: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setOptOut(!next);
      setError('Inställningen kunde inte sparas. Försök igen.');
    } finally {
      setSaving(false);
    }
  };

  const enabled = optOut === false;

  return (
    <section className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-neutral-900">Mail från oss</h2>
      <p className="text-sm text-neutral-600 leading-relaxed mt-1">
        Mail om ditt konto och dina betalningar skickas alltid.
      </p>

      <div className="mt-4 flex items-start justify-between gap-4 rounded-lg border border-neutral-200 p-4">
        <div className="min-w-0">
          <p className="text-base font-semibold text-neutral-900">Veckosammanfattning</p>
          <p className="text-sm text-neutral-600 leading-relaxed mt-1">
            En gång i veckan: hur många jobb du sökte, vad som väntar på svar och
            vilka ansökningar som är värda en påminnelse. Skickas bara när du har
            ansökningar igång.
          </p>
        </div>

        {optOut !== null && (
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label="Veckosammanfattning via mail"
            onClick={toggle}
            disabled={saving}
            className={`relative shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:opacity-60 ${
              enabled ? 'bg-orange-600' : 'bg-neutral-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
    </section>
  );
}
