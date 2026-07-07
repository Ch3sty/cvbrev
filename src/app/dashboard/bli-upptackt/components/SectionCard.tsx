'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
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
      <div className="flex items-start justify-between gap-3 flex-wrap">
        {collapsible ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-expanded={!isCollapsed}
            className="group flex items-start gap-2 text-left min-w-0 flex-1 touch-manipulation -m-1 p-1 rounded-lg"
          >
            <span
              className={`flex-shrink-0 mt-0.5 text-slate-400 transition-transform group-hover:text-orange-500 ${
                isCollapsed ? '-rotate-90' : ''
              }`}
              aria-hidden="true"
            >
              <ChevronDown className="w-4 h-4" strokeWidth={2.5} />
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] sm:text-base font-bold text-slate-900">
                {title}
              </span>
              {sub && (
                <span className="block text-[13px] text-slate-500 mt-0.5 leading-relaxed">
                  {sub}
                </span>
              )}
            </span>
          </button>
        ) : (
          <div>
            <h2 className="text-[15px] sm:text-base font-bold text-slate-900">{title}</h2>
            {sub && <p className="text-[13px] text-slate-500 mt-0.5 leading-relaxed">{sub}</p>}
          </div>
        )}
        {headerExtra}
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
