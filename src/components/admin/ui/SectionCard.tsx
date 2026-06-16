'use client';

import { ReactNode } from 'react';

/**
 * SectionCard — vit kort-wrapper för grafer/tabeller i den nya admin-standarden.
 * Konsekvent rubrik, valfri undertext och padding.
 */
interface SectionCardProps {
  title: string;
  subtitle?: string;
  /** Valfritt innehåll i kortets övre högra hörn (t.ex. en kontroll). */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Sätt false för att låta children styra egen padding (t.ex. tabeller kant-i-kant). */
  padded?: boolean;
}

export default function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = '',
  padded = true,
}: SectionCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200/70 shadow-sm ${className}`}>
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      <div className={padded ? 'px-5 pb-5' : ''}>{children}</div>
    </div>
  );
}
