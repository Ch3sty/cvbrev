'use client';

import { AnimatePresence, motion } from 'framer-motion';
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
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className={`relative rounded-3xl overflow-hidden scroll-mt-24 ${
        subtle
          ? 'bg-white/70 border border-slate-200 p-3.5 sm:p-4'
          : 'bg-white border border-orange-100 p-4 sm:p-6'
      }`}
      style={subtle ? undefined : { boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)' }}
    >
      {!subtle && (
        <div
          className="absolute top-0 inset-x-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, #FB923C, #DC2626)' }}
          aria-hidden="true"
        />
      )}
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
              <div className="text-[13.5px] font-bold text-slate-900 leading-tight">{title}</div>
              <div className="text-[12.5px] text-slate-500 truncate">{summary}</div>
            </div>
          </div>
        ) : (
          <div className="min-w-0">
            <h2 className="text-[15px] sm:text-base font-bold text-slate-900">{title}</h2>
            {sub && <p className="text-[13px] text-slate-500 mt-0.5 leading-relaxed">{sub}</p>}
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
              className={`flex-shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center transition-colors touch-manipulation ${
                subtle
                  ? 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
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
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="mt-4">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <div className="mt-4">{children}</div>
      )}
    </motion.section>
  );
}
