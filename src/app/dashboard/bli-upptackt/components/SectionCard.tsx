'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronsDownUp, ChevronsUpDown } from 'lucide-react';
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
}: SectionCardProps) {
  const isCollapsed = collapsible && collapsed;

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className="relative bg-white rounded-3xl border border-orange-100 p-4 sm:p-6 overflow-hidden scroll-mt-24"
      style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)' }}
    >
      <div
        className="absolute top-0 inset-x-0 h-0.5"
        style={{ background: 'linear-gradient(90deg, #FB923C, #DC2626)' }}
        aria-hidden="true"
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[15px] sm:text-base font-bold text-slate-900">{title}</h2>
          {sub && <p className="text-[13px] text-slate-500 mt-0.5 leading-relaxed">{sub}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {headerExtra}
          {collapsible && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-expanded={!isCollapsed}
              aria-label={isCollapsed ? `Visa ${title}` : `Dölj ${title}`}
              title={isCollapsed ? 'Visa' : 'Dölj'}
              className="flex-shrink-0 w-9 h-9 rounded-xl border border-orange-100 bg-orange-50/50 text-orange-600 flex items-center justify-center transition-colors hover:bg-orange-100 hover:border-orange-200 touch-manipulation"
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
