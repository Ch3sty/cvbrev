'use client';

import type { TourSpectrum } from './tour-data';

/**
 * Statiska mock-primitiver som speglar portalens riktiga komponenter
 * (PercentileDots, WorkStyleSpectrum). Kopior för den publika sidan, aldrig
 * importer av portalkod. Ändra inte utseendet utan att stämma av mot förlagan.
 */

/** Tre fyrkantiga prickar: topp 10 % mörk, topp 25-50 % ljus, annars grå/ofylld. */
export function MockPercentileDots({ dots }: { dots: [number | null, number | null, number | null] }) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {dots.map((p, i) => {
        let cls = 'bg-white border-slate-300';
        if (p !== null && p >= 90) cls = 'bg-orange-600 border-orange-600';
        else if (p !== null && p >= 50) cls = 'bg-orange-300 border-orange-300';
        else if (p !== null) cls = 'bg-slate-200 border-slate-300';
        return <span key={i} className={`w-2.5 h-2.5 rounded-[3px] border ${cls}`} />;
      })}
    </div>
  );
}

const BAND_POSITION: Record<number, number> = { 1: 10, 2: 30, 3: 50, 4: 70, 5: 90 };

/** Bipolärt spektrum med punkt på bandpositionen. Aldrig siffror. */
export function MockSpectrum({ spectrum }: { spectrum: TourSpectrum }) {
  const pos = BAND_POSITION[spectrum.band] ?? 50;
  const neutral = spectrum.band === 3;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <span className={`text-[12px] leading-snug ${spectrum.band <= 2 ? 'font-bold text-indigo-900' : 'text-slate-500'}`}>
          {spectrum.left}
        </span>
        <span className={`text-[12px] leading-snug text-right ${spectrum.band >= 4 ? 'font-bold text-indigo-900' : 'text-slate-500'}`}>
          {spectrum.right}
        </span>
      </div>
      <div className="relative h-4" aria-hidden="true">
        <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-[3px] rounded-full bg-indigo-100" />
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 ${neutral ? 'bg-white border-indigo-300' : 'bg-indigo-500 border-indigo-500'}`}
          style={{ left: `${pos}%` }}
        />
      </div>
    </div>
  );
}

/** Avatar med rollens initial i orange gradient, som portalens träffkort. */
export function MockAvatar({ initial, size = 40 }: { initial: string; size?: number }) {
  return (
    <div
      className="rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
      }}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}
