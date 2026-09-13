'use client';


import { Check, ChevronsDownUp, ChevronsUpDown } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Genväg för korten som vill vara hopfällbara: sprids rakt på SectionCard,
 * `{...collapse}`. Undefined = kortet är inte hopfällbart.
 */
export interface CollapseProps {
  collapsible: true;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface SectionCardProps {
  title: string;
  sub?: string;
  delay?: number;
  headerExtra?: ReactNode;
  children: ReactNode;
  /** Ankar-id så notiser/mail kan djuplänka hit (t.ex. #intressen). */
  id?: string;
  /** Gör kortet hopfällbart: en chevron i rubriken fäller ihop innehållet. */
  collapsible?: boolean;
  /** Kontrollerat läge (från useCollapsedSections), krävs när collapsible. */
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  /**
   * Dämpad stil: ingen orange topplinje, svalare kant, ingen skugga. För
   * klara/ihopfällda kort som inte ska konkurrera om uppmärksamheten.
   */
  variant?: 'default' | 'subtle';
  /**
   * Kompakt sammanfattning som visas i stället för rubrik+undertext NÄR kortet
   * är ihopfällt och ifyllt (t.ex. "Stockholm · Hybrid · Heltid"). Ger en grön
   * bock och "gjort"-känsla i stället för bara en rubrik.
   */
  summary?: string;
}

/** Vitt sektionskort med orange accentlinje, samma mönster som tester-sidorna. */
export default function SectionCard({
  title,
  sub,
  delay = 0,
  headerExtra,
  children,
  id,
  collapsible = false,
  collapsed = false,
  onToggleCollapse,
  variant = 'default',
  summary,
}: SectionCardProps) {
  const isCollapsed = collapsible && collapsed;
  const subtle = variant === 'subtle';
  // Sammanfattningsläge: ihopfällt kort med en ifylld sammanfattning att visa.
  const showSummary = isCollapsed && !!summary;

  return (
    <section
      id={id}
      style={{ animationDelay: `${delay}s` }}
      className={`relative rounded-xl overflow-hidden scroll-mt-24 motion-safe:animate-[fadeInPlace_400ms_ease-out_both] ${
        subtle
          ? 'bg-white/70 border border-neutral-200 p-3.5 sm:p-4'
          : 'bg-white border border-orange-100 p-4 sm:p-6'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {showSummary ? (
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="flex-shrink-0 w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"
              aria-hidden="true"
            >
              <Check className="w-3.5 h-3.5" strokeWidth={3} />
            </span>
            <div className="min-w-0">
              <div className="text-[13.5px] font-bold text-neutral-900 leading-tight">{title}</div>
              <div className="text-xs text-neutral-500 truncate">{summary}</div>
            </div>
          </div>
        ) : (
          <div className="min-w-0">
            <h2 className="text-[15px] sm:text-base font-bold text-neutral-900">{title}</h2>
            {sub && <p className="text-[13px] text-neutral-500 mt-0.5 leading-relaxed">{sub}</p>}
          </div>
        )}
        <div className="flex items-center gap-2 flex-shrink-0">
          {headerExtra}
          {collapsible && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-expanded={!isCollapsed}
              aria-label={isCollapsed ? `Visa ${title}` : `Dölj ${title}`}
              title={isCollapsed ? 'Visa' : 'Dölj'}
              className={`flex-shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center transition-colors touch-manipulation ${
                subtle
                  ? 'border-neutral-200 bg-neutral-50 text-neutral-500 hover:bg-neutral-100'
                  : 'border-orange-100 bg-orange-50/50 text-orange-600 hover:bg-orange-100 hover:border-orange-200'
              }`}
            >
              {isCollapsed ? (
                <ChevronsUpDown className="w-[18px] h-[18px]" strokeWidth={2.25} />
              ) : (
                <ChevronsDownUp className="w-[18px] h-[18px]" strokeWidth={2.25} />
              )}
            </button>
          )}
        </div>
      </div>

      {collapsible ? (
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
            isCollapsed ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'
          }`}
        >
          <div className="overflow-hidden">
            <div className="mt-4">{children}</div>
          </div>
        </div>
      ) : (
        <div className="mt-4">{children}</div>
      )}
    </section>
  );
}
