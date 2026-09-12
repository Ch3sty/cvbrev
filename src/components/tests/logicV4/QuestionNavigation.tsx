'use client';

/**
 * Frågenavigeringen under testet.
 *
 * Mobilregeln (docs/plan-inloggat-omdesign.md, avsnitt 7): navigeringen får
 * aldrig ta hela skärmen. Med 48 frågor i ett prov blir ett rutnät tio rader
 * högt och trycker bort själva frågan. Därför visas som mest två rader, och
 * resten scrollar i en egen container med egen höjd. På desktop finns plats
 * för allt, så där växer rutnätet fritt.
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface QuestionNavigationProps {
  totalQuestions: number;
  currentQuestion: number;
  answeredQuestions: Set<number>;
  onNavigate: (index: number) => void;
}

/** Fem kolumner på mobil. Två rader knappar plus gap = takhöjden. */
const MOBILE_COLUMNS = 5;
const MOBILE_MAX_ROWS = 2;
/** 44 px träffyta plus 8 px gap. */
const ROW_PX = 44;
const GAP_PX = 8;
const MOBILE_MAX_HEIGHT = MOBILE_MAX_ROWS * ROW_PX + (MOBILE_MAX_ROWS - 1) * GAP_PX;

export function QuestionNavigation({
  totalQuestions,
  currentQuestion,
  answeredQuestions,
  onNavigate,
}: QuestionNavigationProps) {
  const needsScroll =
    totalQuestions > MOBILE_COLUMNS * MOBILE_MAX_ROWS;

  return (
    <motion.nav
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="rounded-xl border border-neutral-200 bg-white p-4"
      aria-label="Navigera mellan frågor"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-neutral-600">Frågor</p>
        <p className="text-xs tabular-nums text-neutral-500">
          {answeredQuestions.size} av {totalQuestions} besvarade
        </p>
      </div>

      <div
        // Egen scrollcontainer på mobil, fri höjd från sm och uppåt.
        className={cn(
          'sm:max-h-none sm:overflow-visible',
          needsScroll && 'overflow-y-auto overscroll-contain'
        )}
        style={needsScroll ? { maxHeight: `${MOBILE_MAX_HEIGHT}px` } : undefined}
      >
        <ul className="grid list-none grid-cols-5 gap-2 p-0 sm:grid-cols-10 lg:grid-cols-[repeat(15,_minmax(0,_1fr))]">
          {Array.from({ length: totalQuestions }).map((_, i) => {
            const isCurrent = currentQuestion === i;
            const isAnswered = answeredQuestions.has(i);

            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => onNavigate(i)}
                  className={cn(
                    'flex h-11 w-full items-center justify-center rounded-lg border text-sm font-medium tabular-nums transition-colors sm:h-10',
                    isCurrent
                      ? 'border-orange-600 bg-orange-50 text-orange-900'
                      : isAnswered
                        ? 'border-neutral-200 bg-neutral-50 text-neutral-700'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                  )}
                  aria-label={`Gå till fråga ${i + 1}${isAnswered ? ', besvarad' : ''}${
                    isCurrent ? ', aktuell' : ''
                  }`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isAnswered && !isCurrent ? (
                    <Check className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {needsScroll ? (
        <p className="mt-2 text-xs text-neutral-500 sm:hidden">
          Scrolla i rutan för fler frågor.
        </p>
      ) : null}
    </motion.nav>
  );
}
