'use client';

import { useEffect, useState } from 'react';
import { Radar, ArrowRight } from 'lucide-react';

/**
 * Prioriterat larm högst upp på Bli upptäckt när det finns obesvarade
 * intressen. Self-fetchande så page.tsx slipper tråda state. Länkar till
 * #intressen där kandidaten svarar. Renderar ingenting när allt är besvarat.
 */
export default function PendingInterestAlert() {
  const [pending, setPending] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/candidate/interests');
        if (!res.ok) return;
        const data = await res.json();
        const count = (data.interests ?? []).filter(
          (i: { status: string }) => i.status === 'pending'
        ).length;
        if (!cancelled) setPending(count);
      } catch {
        // Tyst: icke-kritiskt.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (pending === 0) return null;

  return (
    <a
      href="/dashboard/meddelanden"
      className="block rounded-xl border border-orange-200 bg-white p-4 transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-3">
        <span
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center"
          aria-hidden="true"
        >
          <Radar className="w-5 h-5 text-neutral-700" strokeWidth={2.25} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold text-neutral-900">
            {pending === 1
              ? 'En rekryterare vill komma i kontakt'
              : `${pending} rekryterare vill komma i kontakt`}
          </p>
          <p className="text-xs text-neutral-600">
            Svara nedan, ditt namn delas först om du accepterar.
          </p>
        </div>
        <ArrowRight className="w-5 h-5 text-orange-600 flex-shrink-0" strokeWidth={2.5} aria-hidden="true" />
      </div>
    </a>
  );
}
