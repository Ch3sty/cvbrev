'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IlluPercentil } from '@/components/illustrations/TestIllustrations';

interface PercentileCardProps {
  sessionId: string;
}

// Hämtar och visar "bättre än X %" för en slutförd session. Renderar ingenting
// alls tills datat finns, och hoppar över visning vid för litet underlag så
// att siffran aldrig blir missvisande.
const MIN_SAMPLE_SIZE = 25;

export default function PercentileCard({ sessionId }: PercentileCardProps) {
  const [percentile, setPercentile] = useState<number | null>(null);
  const [sampleSize, setSampleSize] = useState(0);

  useEffect(() => {
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
  }, [sessionId]);

  if (percentile === null || sampleSize < MIN_SAMPLE_SIZE) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5"
    >
      <div className="flex items-center gap-3">
        <span className="shrink-0 text-neutral-900" aria-hidden="true">
          <IlluPercentil size={48} />
        </span>
        <div>
          <p className="text-sm font-semibold text-neutral-900">
            Bättre än <span className="tabular-nums">{percentile}</span> % av alla resultat
          </p>
          <p className="text-sm text-neutral-600 mt-0.5">
            Jämfört med {sampleSize.toLocaleString('sv-SE')} slutförda test på samma nivå
          </p>
        </div>
      </div>
    </motion.section>
  );
}
