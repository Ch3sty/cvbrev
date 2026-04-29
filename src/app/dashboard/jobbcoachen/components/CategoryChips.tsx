'use client';

import {
  FileText,
  MessageSquare,
  TrendingUp,
  Scale,
  Lightbulb,
  Globe,
  Search,
  UserPlus,
} from 'lucide-react';

export interface Category {
  id: string;
  label: string;
  Icon: typeof FileText;
}

export const CATEGORIES: Category[] = [
  { id: 'cv-tips', label: 'CV-tips', Icon: FileText },
  { id: 'intervju', label: 'Intervju', Icon: MessageSquare },
  { id: 'lon', label: 'Lön', Icon: TrendingUp },
  { id: 'arbetsratt', label: 'Arbetsrätt', Icon: Scale },
  { id: 'karriar', label: 'Karriär', Icon: Lightbulb },
  { id: 'nyanlanda', label: 'Nyanlända', Icon: Globe },
  { id: 'jobbsok', label: 'Jobbsök', Icon: Search },
  { id: 'natverk', label: 'Nätverk', Icon: UserPlus },
];

interface CategoryChipsProps {
  selected: string | null;
  onSelect: (id: string | null) => void;
}

export default function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
  return (
    <div className="space-y-2.5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600">
        Välj ämne
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
        <ChipButton
          label="Alla"
          isActive={selected === null}
          onClick={() => onSelect(null)}
        />
        {CATEGORIES.map((cat) => {
          const isActive = selected === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(isActive ? null : cat.id)}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold transition-all min-h-[40px] ${
                isActive
                  ? 'text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-orange-300'
              }`}
              style={
                isActive
                  ? {
                      background: 'linear-gradient(135deg, #F97316, #DC2626)',
                      boxShadow: '0 4px 12px -2px rgba(220, 38, 38, 0.35)',
                    }
                  : undefined
              }
              aria-pressed={isActive}
            >
              <cat.Icon
                className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`}
                strokeWidth={2.25}
              />
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChipButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all min-h-[40px] ${
        isActive
          ? 'text-white shadow-md'
          : 'bg-white text-slate-700 border border-slate-200 hover:border-orange-300'
      }`}
      style={
        isActive
          ? {
              background: 'linear-gradient(135deg, #F97316, #DC2626)',
              boxShadow: '0 4px 12px -2px rgba(220, 38, 38, 0.35)',
            }
          : undefined
      }
      aria-pressed={isActive}
    >
      {label}
    </button>
  );
}
