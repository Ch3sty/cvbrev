'use client';

import { Check } from 'lucide-react';

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
  /** Kategorier användaren redan har tittat på. Får en bock före etiketten. */
  visited?: Set<string>;
  /** Raden under flikarna: "Kategori 1 av 4 · 1 av 16 valda". */
  progressText?: string;
}

/**
 * Kategorierna i steg 3.
 *
 * Segment-mönstret (fyra likvärdiga alternativ, kant ink på det aktiva), men
 * med egen markup i stället för <Segment> eftersom en besökt flik ska bära en
 * bock före etiketten. Bocken är i ink, aldrig grön, aldrig i ett hörn.
 */
export default function CategorySegments({
  categories,
  active,
  onChange,
  visited,
  progressText,
}: CategorySegmentsProps) {
  return (
    <div>
      {/* Fyra flikar med bock och räknare får inte plats på en rad på 375 px.
          De wrappar i stället för att skjuta den sista utanför skärmen. */}
      <div
        role="radiogroup"
        aria-label="Kategori att gå igenom"
        className="grid grid-cols-2 gap-2 sm:flex"
      >
        {categories.map((cat) => {
          const on = cat.id === active;
          const seen = Boolean(visited?.has(cat.id));
          const label = cat.isAuto
            ? `${cat.label} (${cat.totalCount})`
            : `${cat.label} ${cat.selectedCount}/${cat.totalCount}`;

          return (
            <button
              key={cat.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(cat.id)}
              className={`inline-flex h-11 w-full items-center justify-center gap-1 rounded-lg border bg-panel px-2 sm:w-auto sm:flex-1 text-sm text-ink-1 transition-[border-color,background-color] duration-[120ms] hover:border-kant-stark active:bg-insunken ${
                on ? 'border-ink-1 font-medium shadow-val' : 'border-kant'
              }`}
            >
              {seen ? (
                <Check
                  className="h-3.5 w-3.5 flex-shrink-0 text-ink-1"
                  strokeWidth={2}
                  aria-label="Genomgången"
                />
              ) : null}
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>

      {progressText ? (
        <p className="mt-2 text-meta tabular-nums text-ink-3">{progressText}</p>
      ) : null}
    </div>
  );
}
