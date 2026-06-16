'use client';

import { ReactNode } from 'react';
import Delta from './Delta';

/**
 * MetricCard — KPI-kort i den nya admin-designstandarden.
 * Rent & datadrivet (Linear/Vercel-stil): vit, mjuk skugga, tunn kant,
 * stort tabular-tal, liten ikon-chip i funktionsfärg, delta-rad mot föreg. period.
 * Ingen gradient, ingen glassmorphism.
 */
interface MetricCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  /** Tailwind-klasser för ikon-chippen, t.ex. "bg-indigo-50 text-indigo-600". */
  iconClass?: string;
  subtitle?: string;
  /** Om satta visas en delta-rad mot föregående period. */
  current?: number;
  previous?: number;
}

export default function MetricCard({
  title,
  value,
  icon,
  iconClass = 'bg-slate-100 text-slate-600',
  subtitle,
  current,
  previous,
}: MetricCardProps) {
  const showDelta = current !== undefined && previous !== undefined;
  return (
    <div className="bg-white rounded-xl border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
        {icon && (
          <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${iconClass}`}>
            {icon}
          </span>
        )}
      </div>
      <div className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">{value}</div>
      <div className="mt-1.5 flex items-center gap-2 min-h-[18px]">
        {showDelta && <Delta current={current!} previous={previous!} />}
        {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
      </div>
    </div>
  );
}
