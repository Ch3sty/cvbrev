'use client';

import type { SpectrumView } from '@/lib/recruiter/workStyle';

/**
 * Bipolärt spektrum: punkt på en linje vid 10/30/50/70/90 % beroende på band
 * 1-5. Båda polerna är likvärdigt positiva arbetsstilar. ALDRIG siffror,
 * procent eller staplar — rågången mot testpercentilerna ska synas.
 * Band 3 renderas som "Flexibel mellan lägena".
 */

const BAND_POSITION: Record<number, string> = {
  1: '10%',
  2: '30%',
  3: '50%',
  4: '70%',
  5: '90%',
};

export default function WorkStyleSpectrum({ spectrum }: { spectrum: SpectrumView }) {
  const isLeft = spectrum.band <= 2;
  const isRight = spectrum.band >= 4;
  const isMid = spectrum.band === 3;

  return (
    <div className="py-1">
      <div className="flex items-baseline justify-between gap-4 mb-1.5">
        <span
          className={`text-[12px] leading-snug ${
            isLeft ? 'font-bold text-indigo-900' : 'text-slate-500'
          }`}
        >
          {spectrum.leftLabel}
        </span>
        <span
          className={`text-[12px] leading-snug text-right ${
            isRight ? 'font-bold text-indigo-900' : 'text-slate-500'
          }`}
        >
          {spectrum.rightLabel}
        </span>
      </div>

      {/* Linjen med punkten. Padding i sidled så punkten aldrig kapas. */}
      <div className="relative h-3.5 px-1.5" aria-hidden="true">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-indigo-100" />
        <div className="relative h-full mx-1.5">
          <span
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-white"
            style={{
              left: BAND_POSITION[spectrum.band],
              background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
              boxShadow: '0 2px 6px -1px rgba(79, 70, 229, 0.5)',
            }}
          />
        </div>
      </div>

      {isMid && (
        <p className="text-center text-[11px] text-slate-400 mt-1">Flexibel mellan lägena</p>
      )}
    </div>
  );
}
