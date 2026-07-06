'use client';

import type { SpectrumView } from './types';

/** Band 1-5 → punktposition i procent. ALDRIG siffror i UI:t. */
const BAND_POSITION: Record<number, number> = { 1: 10, 2: 30, 3: 50, 4: 70, 5: 90 };

/**
 * Ett bipolärt spektrum: vänster/höger-pol med en punkt på bandpositionen.
 * Båda polerna är likvärdigt positiva arbetsstilar; band 3 renderas som
 * neutral punkt i mitten ("Flexibel mellan lägena").
 */
export default function WorkStyleSpectrum({ spectrum }: { spectrum: SpectrumView }) {
  const pos = BAND_POSITION[spectrum.band] ?? 50;
  const neutral = spectrum.band === 3;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <span
          className={`text-[12px] leading-snug ${
            spectrum.band <= 2 ? 'font-bold text-indigo-900' : 'text-slate-500'
          }`}
        >
          {spectrum.leftLabel}
        </span>
        <span
          className={`text-[12px] leading-snug text-right ${
            spectrum.band >= 4 ? 'font-bold text-indigo-900' : 'text-slate-500'
          }`}
        >
          {spectrum.rightLabel}
        </span>
      </div>
      <div className="relative h-4" aria-hidden="true">
        <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-[3px] rounded-full bg-indigo-100" />
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 ${
            neutral ? 'bg-white border-indigo-300' : 'bg-indigo-500 border-indigo-500'
          }`}
          style={{ left: `${pos}%` }}
        />
      </div>
      {neutral && (
        <p className="text-[11px] text-slate-400 text-center mt-0.5">Flexibel mellan lägena</p>
      )}
    </div>
  );
}
