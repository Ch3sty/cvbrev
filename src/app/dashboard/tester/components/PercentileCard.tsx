'use client';

import { useState, useEffect } from 'react';

interface PercentileCardProps {
  sessionId: string;
  /**
   * Färdigräknad percentil från servern (getResultsData.ts). Finns den görs
   * ingen hämtning alls, och kortet står rätt från första målningen.
   * Utan den hämtar kortet själv, precis som förut.
   */
  data?: { percentile: number; sampleSize: number } | null;
}

// Hämtar och visar "bättre än X %" för en slutförd session. Renderar ingenting
// alls tills datat finns, och hoppar över visning vid för litet underlag så
// att siffran aldrig blir missvisande.
const MIN_SAMPLE_SIZE = 25;

export default function PercentileCard({ sessionId, data }: PercentileCardProps) {
  const [percentile, setPercentile] = useState<number | null>(
    data?.percentile ?? null
  );
  const [sampleSize, setSampleSize] = useState(data?.sampleSize ?? 0);

  useEffect(() => {
    // Serverräknad: ingen fetch.
    if (data) return;

    let cancelled = false;
    fetch(`/api/logicTestV4/percentile?sessionId=${sessionId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data.percentile === 'number') {
          setPercentile(data.percentile);
          setSampleSize(data.sampleSize ?? 0);
        }
      })
      .catch(() => {
        /* percentilen är ett tillägg, fel här ska aldrig störa resultatsidan */
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId, data]);

  if (percentile === null || sampleSize < MIN_SAMPLE_SIZE) return null;

  const width = Math.max(0, Math.min(100, percentile));

  return (
    // Kortet tonar in på plats. Förut kom det in med y 8 till 0 efter att
    // percentilen hämtats, mitt i resultatsidan, och sköt ner allt under sig.
    // Ren opacity flyttar ingenting.
    <section
      className="rounded-xl border border-kant bg-panel p-4 sm:p-5 [animation:fadeInPlace_0.35s_ease-out]"
      aria-label={`Bättre än ${percentile} procent av alla resultat`}
    >
      <div className="flex items-baseline gap-2">
        <span className="text-tal tabular-nums text-ink-1">{percentile}</span>
        <span className="text-meta text-ink-3">procent</span>
      </div>
      <p className="mt-1 text-sm font-medium text-ink-1">
        Bättre än <span className="tabular-nums">{percentile}</span> % av alla resultat
      </p>
      <div className="mt-3 h-0.5 w-full bg-kant" aria-hidden="true">
        <div className="h-full bg-ink-1" style={{ width: `${width}%` }} />
      </div>
      <p className="mt-2 text-meta text-ink-3">
        Jämfört med {sampleSize.toLocaleString('sv-SE')} slutförda test på samma nivå
      </p>
    </section>
  );
}
