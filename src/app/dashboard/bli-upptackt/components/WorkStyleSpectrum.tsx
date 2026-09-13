'use client';

import type { SpectrumView } from '@/lib/recruiter/workStyle';

/**
 * Bipolärt spektrum: punkt på en linje vid 10/30/50/70/90 % beroende på band
 * 1-5. Båda polerna är likvärdigt positiva arbetsstilar. ALDRIG siffror,
 * procent eller staplar, rågången mot testpercentilerna ska synas.
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
          className={`text-meta leading-snug ${
            isLeft ? 'font-medium text-ink-1' : 'text-ink-3'
          }`}
        >
          {spectrum.leftLabel}
        </span>
        <span
          className={`text-right text-meta leading-snug ${
            isRight ? 'font-medium text-ink-1' : 'text-ink-3'
          }`}
        >
          {spectrum.rightLabel}
        </span>
      </div>

      {/* Linjen med punkten. Padding i sidled så punkten aldrig kapas. */}
      <div className="relative h-3.5 px-1.5" aria-hidden="true">
        <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-kant" />
        <div className="relative mx-1.5 h-full">
          <span
            className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-panel bg-ink-1"
            style={{ left: BAND_POSITION[spectrum.band] }}
          />
        </div>
      </div>

      {isMid && (
        <p className="mt-1 text-center text-meta text-ink-3">Flexibel mellan lägena</p>
      )}
    </div>
  );
}
