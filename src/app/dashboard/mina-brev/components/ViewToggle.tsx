'use client';

import { LayoutGrid, List } from 'lucide-react';

export type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

/**
 * Pill-toggle med grid/list-ikoner. Aktiv ikon får orange/röd-gradient
 * bakgrund, inaktiv är grå. Klick byter vy och triggas onChange.
 */
export default function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Visningsläge"
      className="inline-flex items-center gap-0.5 p-0.5 bg-white border border-orange-200/60 rounded-xl"
    >
      <button
        type="button"
        role="radio"
        aria-checked={value === 'grid'}
        aria-label="Visa som rutnät"
        onClick={() => onChange('grid')}
        className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all ${
          value === 'grid'
            ? 'text-white shadow-sm'
            : 'text-neutral-500 hover:text-neutral-700 hover:bg-orange-50/40'
        }`}
        style={
          value === 'grid'
            ? {
                background: '#EA580C',
              }
            : undefined
        }
      >
        <LayoutGrid className="w-4 h-4" strokeWidth={2.5} />
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === 'list'}
        aria-label="Visa som lista"
        onClick={() => onChange('list')}
        className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all ${
          value === 'list'
            ? 'text-white shadow-sm'
            : 'text-neutral-500 hover:text-neutral-700 hover:bg-orange-50/40'
        }`}
        style={
          value === 'list'
            ? {
                background: '#EA580C',
              }
            : undefined
        }
      >
        <List className="w-4 h-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}
