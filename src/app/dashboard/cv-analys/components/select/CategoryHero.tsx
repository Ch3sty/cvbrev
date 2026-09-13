'use client';

import { CheckSquare, Square } from 'lucide-react';
import type { SelectCategory } from './CategorySegments';

interface CategoryHeroProps {
  category: SelectCategory;
  title: string;
  description: string;
  selectedCount: number;
  totalCount: number;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  /** Auto-kategorin har ingen select-knapp */
  autoMode?: boolean;
}

/**
 * Rubriken för den kategori man just nu går igenom.
 *
 * Bort: ikonen i 80 px, orange och gröna etiketter i versaler och räknaren
 * som stort orange tal. Kvar: vad kategorin är, och knappen som markerar
 * allt på en gång.
 */
export default function CategoryHero({
  title,
  description,
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  autoMode = false,
}: CategoryHeroProps) {
  const allSelected = selectedCount === totalCount && totalCount > 0;
  const showSelectButton = !autoMode && totalCount > 1;

  return (
    <section className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
      <p className="text-steg uppercase text-ink-3">
        {autoMode ? 'Tillämpas automatiskt' : 'Du väljer'}
      </p>
      <h3 className="mt-1.5 text-kort text-ink-1">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{description}</p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="text-meta tabular-nums text-ink-3">
          {autoMode
            ? `${totalCount} ${totalCount === 1 ? 'förbättring' : 'förbättringar'}`
            : `${selectedCount} av ${totalCount} valda`}
        </span>

        {showSelectButton && (
          <button
            type="button"
            onClick={() => (allSelected ? onDeselectAll?.() : onSelectAll?.())}
            className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-kant-stark bg-panel px-3 text-sm font-medium text-ink-1 transition-colors hover:bg-insunken"
          >
            {allSelected ? (
              <>
                <Square className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                Avmarkera alla
              </>
            ) : (
              <>
                <CheckSquare className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                Välj alla
              </>
            )}
          </button>
        )}
      </div>
    </section>
  );
}
