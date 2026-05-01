'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { CategorySegmentIcon } from './CategoryIcons';

export type SelectCategory = 'profile' | 'roles' | 'skills' | 'auto';

export interface CategoryDef {
  id: SelectCategory;
  label: string;
  selectedCount: number;
  totalCount: number;
  /** Auto-kategorin är "klar" så fort den finns */
  isAuto?: boolean;
}

interface CategorySegmentsProps {
  categories: CategoryDef[];
  active: SelectCategory;
  onChange: (id: SelectCategory) => void;
}

/**
 * Custom segment-bar för Steg 3.
 * Sticky under huvudprogress på desktop, fullbredd på mobil.
 */
export default function CategorySegments({
  categories,
  active,
  onChange,
}: CategorySegmentsProps) {
  return (
    <div
      className="sticky z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-2 pb-3 bg-gradient-to-b from-white via-white to-white/85 backdrop-blur-sm"
      style={{ top: '76px' }}
    >
      <div className="max-w-3xl mx-auto">
        <div
          className="grid gap-1 p-1 rounded-2xl"
          style={{
            gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))`,
            background: 'rgba(255, 247, 237, 0.7)',
            border: '1px solid rgba(249, 115, 22, 0.18)',
            boxShadow: '0 4px 14px -8px rgba(249, 115, 22, 0.18)',
          }}
        >
          {categories.map((cat) => {
            const isActive = cat.id === active;
            const isComplete = cat.isAuto
              ? cat.totalCount > 0
              : cat.totalCount > 0 && cat.selectedCount === cat.totalCount;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onChange(cat.id)}
                className="relative px-2 sm:px-3 py-2 rounded-xl text-center transition-all min-h-[52px] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                aria-pressed={isActive}
                aria-label={`${cat.label}, ${cat.selectedCount} av ${cat.totalCount} valda`}
                style={
                  isActive
                    ? {
                        background:
                          'linear-gradient(135deg, #F97316, #DC2626)',
                        color: 'white',
                        boxShadow: '0 4px 12px -3px rgba(220, 38, 38, 0.45)',
                      }
                    : {
                        color: '#9A3412',
                      }
                }
              >
                {/* Done-badge i hörnet */}
                {isComplete && !isActive && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                    style={{
                      background:
                        'linear-gradient(135deg, #10B981, #059669)',
                    }}
                  >
                    <Check className="w-2 h-2 text-white" strokeWidth={3.5} />
                  </motion.span>
                )}

                <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                  <CategorySegmentIcon
                    type={cat.id}
                    className={`w-4 h-4 sm:w-[18px] sm:h-[18px] ${
                      isActive ? 'text-white' : 'text-orange-600'
                    }`}
                  />
                  <span
                    className={`text-[10px] sm:text-[11px] font-semibold leading-none ${
                      isActive ? 'text-white' : 'text-slate-700'
                    }`}
                  >
                    {cat.label}
                  </span>
                  <span
                    className={`text-[9px] sm:text-[10px] tabular-nums leading-none ${
                      isActive ? 'text-white/80' : 'text-slate-500'
                    }`}
                  >
                    {cat.isAuto
                      ? `${cat.totalCount} auto`
                      : `${cat.selectedCount}/${cat.totalCount}`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
