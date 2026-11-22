'use client';

/**
 * Knapparna i kortet "Mejlet om Jobbsöket" (beslut-mejl-och-radering 1e):
 * förhandsvisningen i nytt fönster och ett test till den inloggade admin.
 * Utskicket självt görs av morgonkörningen på utskicksdagen.
 */

import { useState } from 'react';

const LANK =
  'text-sm font-medium text-ink-1 underline underline-offset-4 decoration-kant-stark hover:decoration-ink-1';

export default function JobbsoketKort() {
  const [lage, setLage] = useState<'vilar' | 'skickar' | { klart: string } | 'fel'>('vilar');

  const skickaTest = async () => {
    setLage('skickar');
    try {
      const res = await fetch('/api/admin/email/jobbsoket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'test' }),
      });
      const svar = await res.json().catch(() => ({}));
      setLage(res.ok && svar?.recipient ? { klart: String(svar.recipient) } : 'fel');
    } catch {
      setLage('fel');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      <a href="/api/admin/email/jobbsoket?forhandsvisa=1&brev=0" target="_blank" rel="noopener" className={LANK}>
        Förhandsvisa
      </a>
      <a href="/api/admin/email/jobbsoket?forhandsvisa=1&brev=1" target="_blank" rel="noopener" className={LANK}>
        Förhandsvisa med brev
      </a>
      <button
        type="button"
        onClick={skickaTest}
        disabled={lage === 'skickar'}
        className="min-h-[44px] rounded-xl border border-kant-stark px-4 text-sm font-medium text-ink-1 hover:border-ink-1 disabled:opacity-60"
      >
        Skicka test till mig
      </button>
      {typeof lage === 'object' ? (
        <p className="text-meta text-ink-2" role="status">{`Skickat till ${lage.klart}.`}</p>
      ) : null}
      {lage === 'fel' ? (
        <p className="text-meta text-ink-2" role="status">Testet gick inte att skicka.</p>
      ) : null}
    </div>
  );
}
