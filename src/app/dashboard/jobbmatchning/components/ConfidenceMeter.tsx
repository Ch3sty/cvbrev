'use client';

import { motion } from 'framer-motion';

interface ConfidenceMeterProps {
  confidence: 'high' | 'medium' | 'low';
  /** Antal segment att visa. Default 5. */
  segments?: number;
}

/**
 * Horisontell confidence-stapel med tick marks. Visualiserar matchnings-saekerhet
 * for en yrkesroll. High = 5/5 fyllda, Medium = 3/5, Low = 1/5.
 *
 * Animerar in segmenten staggered for att ge en mini-animation vid montering.
 */
export default function ConfidenceMeter({
  confidence,
  segments = 5,
}: ConfidenceMeterProps) {
  const filled = confidence === 'high' ? 5 : confidence === 'medium' ? 3 : 1;

  const colorByLevel: Record<typeof confidence, string> = {
    high: '#10B981', // emerald-500
    medium: '#F59E0B', // amber-500
    low: '#94A3B8', // slate-400
  };
  const fillColor = colorByLevel[confidence];

  const labelByLevel: Record<typeof confidence, string> = {
    high: 'Verifierad',
    medium: 'Trolig',
    low: 'Osäker',
  };

  return (
    <div className="flex flex-col gap-1.5 min-w-[88px]">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: segments }).map((_, i) => {
          const isFilled = i < filled;
          return (
            <motion.div
              key={i}
              initial={{ scaleY: 0.3, opacity: 0.3 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ delay: i * 0.04, duration: 0.25, ease: 'easeOut' }}
              className="flex-1 h-2 rounded-sm origin-bottom"
              style={{
                background: isFilled ? fillColor : '#E2E8F0',
              }}
            />
          );
        })}
      </div>
      <div
        className="text-[10px] font-bold uppercase tracking-wider tabular-nums"
        style={{ color: fillColor }}
      >
        {labelByLevel[confidence]}
      </div>
    </div>
  );
}
