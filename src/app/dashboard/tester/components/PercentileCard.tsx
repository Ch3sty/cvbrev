'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

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
        /* percentilen är ett tillägg — fel här ska aldrig störa resultatsidan */
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
      className="bg-white rounded-3xl border border-orange-100 p-4 sm:p-5"
      style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white"
          style={{
            background: 'linear-gradient(135deg, #F97316, #DC2626)',
            boxShadow: '0 4px 10px -3px rgba(220, 38, 38, 0.3)',
          }}
        >
          <Users className="w-4 h-4" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">
            Bättre än {percentile} % av alla resultat
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Jämfört med {sampleSize.toLocaleString('sv-SE')} slutförda test på samma nivå
          </p>
        </div>
      </div>
    </motion.section>
  );
}
