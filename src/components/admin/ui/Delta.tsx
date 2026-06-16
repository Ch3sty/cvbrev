'use client';

import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

/**
 * Delta — visar förändring mellan två perioder.
 * Del av den nya admin-designstandarden (rent & datadrivet).
 *
 * Hanterar kantfall pedagogiskt:
 *  - previous === 0 && current > 0  → "Ny" (i stället för +∞%)
 *  - current === previous           → grå "oförändrat"
 *  - annars                          → grön pil upp / röd pil ner + procent
 */
interface DeltaProps {
  current: number;
  previous: number;
  /** Etikett efter procenten, t.ex. "vs föreg. period". */
  label?: string;
  className?: string;
}

export default function Delta({ current, previous, label = 'vs föreg.', className = '' }: DeltaProps) {
  // Helt ny aktivitet — ingen baslinje att jämföra mot.
  if (previous === 0) {
    if (current === 0) {
      return (
        <span className={`inline-flex items-center gap-1 text-xs text-slate-400 ${className}`}>
          <Minus className="w-3 h-3" /> ingen data
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs ${className}`}>
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold">
          Ny
        </span>
        <span className="text-slate-400">{label}</span>
      </span>
    );
  }

  const pct = Math.round(((current - previous) / previous) * 100);
  const flat = pct === 0;
  const up = pct > 0;
  const color = flat ? 'text-slate-400' : up ? 'text-emerald-600' : 'text-rose-600';
  const Icon = flat ? Minus : up ? ArrowUp : ArrowDown;

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${color} ${className}`}>
      <Icon className="w-3 h-3" strokeWidth={2.5} />
      {up ? '+' : ''}{pct}%
      <span className="font-normal text-slate-400 ml-0.5">{label}</span>
    </span>
  );
}
