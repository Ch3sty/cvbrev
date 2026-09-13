'use client';

import { Check, ChevronDown } from 'lucide-react';
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
  /** Behålls för anropskompatibilitet. Tråden har ingen fördröjd intoning. */
  delay?: number;
  headerExtra?: ReactNode;
  children: ReactNode;
  /** Ankar-id så notiser/mail kan djuplänka hit (t.ex. #intressen). */
  id?: string;
  /** Gör kortet hopfällbart: en chevron i huvudet fäller ihop innehållet. */
  collapsible?: boolean;
  /** Kontrollerat läge (från useCollapsedSections), krävs när collapsible. */
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  /** Behålls för anropskompatibilitet. Panelen ser likadan ut i båda lägena. */
  variant?: 'default' | 'subtle';
  /**
   * Kompakt sammanfattning som visas i stället för undertexten NÄR kortet är
   * ihopfällt och ifyllt (t.ex. "Stockholm · Hybrid · Heltid"). Ger en bock
   * och "gjort"-känsla i stället för bara en rubrik.
   */
  summary?: string;
  /**
   * Aktiv sektion: den där kandidaten ska göra något härnäst. Panelen får
   * tråden längs huvudet (thread-head). Högst en per vy.
   */
  active?: boolean;
  /** Marginalplattan (MarginPlate). Sätts bara på den aktiva sektionen. */
  plate?: ReactNode;
}

/**
 * Sektion i Tråden: sektionsetikett (14/500 ink-3) ovanför en panel i
 * papper. Huvudet inne i panelen bär undertext, sammanfattning, extra och
 * hopfällningsknappen. Den aktiva sektionen får en 3 px orange linje längs
 * huvudet, val markeras aldrig så.
 */
export default function SectionCard({
  title,
  sub,
  headerExtra,
  children,
  id,
  collapsible = false,
  collapsed = false,
  onToggleCollapse,
  summary,
  active = false,
  plate,
}: SectionCardProps) {
  const isCollapsed = collapsible && collapsed;
  // Sammanfattningsläge: ihopfällt kort med en ifylld sammanfattning att visa.
  const showSummary = isCollapsed && !!summary;
  const hasHead = Boolean(sub || summary || headerExtra || collapsible || plate || active);

  return (
    <div id={id} className="scroll-mt-24">
      <h2 className="mb-2 text-sm font-medium text-ink-3">{title}</h2>

      <section
        className={`rounded-xl border border-kant bg-panel p-4 sm:p-5 ${active ? 'thread-head' : ''}`}
      >
        {hasHead && (
          <div className={`flex items-start justify-between gap-3 ${active ? 'thread-head-block' : ''}`}>
            <div className="flex min-w-0 items-start gap-3">
              {plate}
              {showSummary ? (
                <div className="flex min-w-0 items-center gap-2">
                  <Check
                    className="h-5 w-5 shrink-0 text-positiv"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <p className="truncate text-sm text-ink-2">{summary}</p>
                </div>
              ) : sub ? (
                <p className="text-sm leading-[22px] text-ink-2">{sub}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {headerExtra}
              {collapsible && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  aria-expanded={!isCollapsed}
                  aria-label={isCollapsed ? `Visa ${title}` : `Dölj ${title}`}
                  title={isCollapsed ? 'Visa' : 'Dölj'}
                  className="-mr-2 -mt-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-insunken hover:text-ink-1"
                >
                  <ChevronDown
                    className={`h-5 w-5 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </button>
              )}
            </div>
          </div>
        )}

        {collapsible ? (
          <div
            className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
              isCollapsed ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'
            }`}
          >
            <div className="overflow-hidden">
              <div className={hasHead ? 'mt-4' : ''}>{children}</div>
            </div>
          </div>
        ) : (
          <div className={hasHead ? 'mt-4' : ''}>{children}</div>
        )}
      </section>
    </div>
  );
}
